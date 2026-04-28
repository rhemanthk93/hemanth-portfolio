import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base.generated";
import { AGENT_RULES } from "@/lib/agent-prompt";

export const runtime = "edge";

const anthropic = new Anthropic();

type ApiError = { error?: { error?: { message?: string } }; message?: string; status?: number };

// ---------------------------------------------------------------------------
// Rate limiting
//
// Three sliding-window limiters layered together:
//
//   1. perIpBurst   — 5 requests per 5 minutes, keyed by visitor IP.
//                     Stops a script that fires 100 requests in a second.
//   2. perIpHourly  — 20 requests per 1 hour, keyed by visitor IP.
//                     Caps a single visitor's session to ~one back-and-forth
//                     conversation per hour.
//   3. globalDaily  — 500 requests per 24 hours, keyed globally ("global").
//                     This is the cost ceiling — caps the worst-case Anthropic
//                     bill at ~$6/day no matter how many visitors come.
//
// Backed by Upstash Redis when UPSTASH_REDIS_REST_URL + ..._TOKEN are set
// (production / preview). Falls back to per-instance in-memory counters
// otherwise (local dev), so the dev server keeps working without Upstash.
// In-memory fallback is per-Edge-instance and resets on cold start, which is
// fine for dev but not adequate for production — that's why production must
// have the Upstash env vars set.
// ---------------------------------------------------------------------------

type LimitResult = { success: boolean; reset: number; remaining: number };
type Limiter = (key: string) => Promise<LimitResult>;

function memoryLimiter(max: number, windowMs: number): Limiter {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return async (key) => {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || b.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: max - 1, reset: now + windowMs };
    }
    if (b.count >= max) {
      return { success: false, remaining: 0, reset: b.resetAt };
    }
    b.count += 1;
    return { success: true, remaining: max - b.count, reset: b.resetAt };
  };
}

function upstashLimiter(
  redis: Redis,
  max: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string
): Limiter {
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    analytics: false,
    prefix,
  });
  return async (key) => {
    const r = await rl.limit(key);
    return { success: r.success, remaining: r.remaining, reset: r.reset };
  };
}

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = Boolean(REDIS_URL && REDIS_TOKEN);

const redis = useUpstash
  ? new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
  : null;

const perIpBurst: Limiter = useUpstash
  ? upstashLimiter(redis!, 5, "5 m", "rl:burst")
  : memoryLimiter(5, 5 * 60_000);
const perIpHourly: Limiter = useUpstash
  ? upstashLimiter(redis!, 20, "1 h", "rl:hourly")
  : memoryLimiter(20, 60 * 60_000);
const globalDaily: Limiter = useUpstash
  ? upstashLimiter(redis!, 500, "24 h", "rl:daily")
  : memoryLimiter(500, 24 * 60 * 60_000);

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function retryAfterSeconds(reset: number): number {
  const diff = Math.ceil((reset - Date.now()) / 1000);
  return diff > 0 ? diff : 1;
}

const PER_IP_MESSAGE =
  "You've hit the per-visitor limit — please wait an hour.";
const GLOBAL_MESSAGE =
  "The chat has been popular today. Please try again tomorrow.";

// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Missing ANTHROPIC_API_KEY in server env" },
      { status: 500 }
    );
  }

  const ip = clientIp(req);
  const ipKey = `chat:${ip}`;

  // Per-IP first — protects everyone from one abusive caller and avoids
  // burning the global daily quota on a bot. Burst (5/5m) catches scripts;
  // hourly (20/1h) catches sustained abuse.
  const burst = await perIpBurst(ipKey);
  if (!burst.success) {
    return Response.json(
      { error: "rate_limit_per_ip", message: PER_IP_MESSAGE },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds(burst.reset)) },
      }
    );
  }
  const hourly = await perIpHourly(ipKey);
  if (!hourly.success) {
    return Response.json(
      { error: "rate_limit_per_ip", message: PER_IP_MESSAGE },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds(hourly.reset)) },
      }
    );
  }

  // Global daily — cost ceiling on the Anthropic bill. Returns 503 because
  // this is "service capacity reached for today", not "you in particular
  // are throttled".
  const daily = await globalDaily("global");
  if (!daily.success) {
    return Response.json(
      { error: "rate_limit_exceeded", message: GLOBAL_MESSAGE },
      {
        status: 503,
        headers: { "Retry-After": String(retryAfterSeconds(daily.reset)) },
      }
    );
  }

  const body = (await req.json()) as { messages: { role: "user" | "assistant"; content: string }[] };

  const encoder = new TextEncoder();
  const out = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      try {
        const upstream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: [
            { type: "text", text: AGENT_RULES },
            {
              type: "text",
              text: KNOWLEDGE_BASE,
              cache_control: { type: "ephemeral" },
            },
          ],
          // Server tool types (web_search_*, web_fetch_*) aren't in the SDK's
          // narrow `Tool` union but are accepted by the Messages API. Cast to
          // bypass the type check; runtime behaviour is correct.
          tools: [
            { type: "web_search_20260209", name: "web_search", max_uses: 3 },
            { type: "web_fetch_20250910", name: "web_fetch", max_uses: 2 },
          ] as unknown as Anthropic.Messages.Tool[],
          messages: body.messages,
        });

        for await (const event of upstream) {
          send(event);
        }
      } catch (err) {
        const e = err as ApiError;
        const message =
          e?.error?.error?.message ?? e?.message ?? "Upstream error";
        send({ type: "stream_error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(out, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
