import Anthropic from "@anthropic-ai/sdk";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base.generated";
import { AGENT_RULES } from "@/lib/agent-prompt";

export const runtime = "edge";

const anthropic = new Anthropic();

type ApiError = { error?: { error?: { message?: string } }; message?: string; status?: number };

// Best-effort in-memory rate limit per client IP. Edge runtimes scale across
// instances so this is per-instance, not global — caps obvious abuse without a
// Redis dep. For production volume, swap in Vercel KV / Upstash.
type Bucket = { count: number; resetAt: number };
const RATE_BUCKETS = new Map<string, Bucket>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_PER_WINDOW = 10;

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

function checkRate(key: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const b = RATE_BUCKETS.get(key);
  if (!b || b.resetAt < now) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }
  if (b.count >= RATE_MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Missing ANTHROPIC_API_KEY in server env" },
      { status: 500 }
    );
  }

  const rate = checkRate(clientKey(req));
  if (!rate.ok) {
    return Response.json(
      {
        error: `Slow down — try again in ${rate.retryAfter}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
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
