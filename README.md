# askhemanth — conversation-first portfolio

Personal site for Hemanth Kumar, deployed at **askhemanth.com**. The home page is a bento-grid summary; the centerpiece is a chat agent that answers questions about Hemanth from a curated knowledge base, falling back to web search when the question is about something outside its KB (recent talks, Medium articles, news).

The novelty is the data flow: **the entire knowledge base is checked into git as plain markdown** under [`data/`](data/), assembled into a single Anthropic system prompt at build time, and shipped with every request. There is no CMS, no vector store, no retrieval step — just a big cached prompt and a model that reads it.

---

## Stack

- **Next.js 15** (App Router, React 19, Turbopack dev)
- **Tailwind v4**
- **Anthropic SDK** (`@anthropic-ai/sdk`) targeting `claude-sonnet-4-6`
- **Vercel Edge Runtime** for the `/api/chat` route
- TypeScript everywhere

---

## How the chat agent works

This is the part worth understanding in detail. The rest of the site is just a Next.js bento grid.

### 1. The knowledge base lives in `data/*.md`

Every fact the agent knows about Hemanth lives as markdown in [`data/`](data/):

```
data/
  bio.md                  # career arc — third person
  work-experience.md      # structured timeline (JP Morgan → GIC → SPH → Temus)
  education.md            # SMU degree, certifications
  contact.md              # email, socials, agent privacy rules
  now.md                  # this week's focus, updated weekly
  skills.md               # tech stack
  qa.md                   # 30 first-person Q&A pairs (voice + opinions)
  linkedin-posts.md       # appended as posts publish
  projects/
    raxtor.md
    decision-ledger.md
    snpdrug3d.md
    ...
```

Voice convention: descriptive files (`bio.md`, project files) are **third person**; `qa.md` is **first person** so it's natural to author. The agent translates first-person Q&A into third-person responses when it speaks to visitors.

To update the agent's knowledge: edit any markdown file, `git push`. Vercel rebuilds in 30–60 seconds. No admin UI.

### 2. The build script bakes everything into a single string

[`scripts/build-system-prompt.ts`](scripts/build-system-prompt.ts) runs as `predev` and `prebuild` (see [`package.json`](package.json)). It does three things:

1. **Walks `data/` recursively**, concatenates every `.md` file with a `### FILE: <path>` header, joined by `---` separators.
2. **Pulls live sources** at build time:
   - **Medium RSS** via `api.rss2json.com` → 10 most recent posts (title, date, excerpt, URL).
   - **GitHub public repos** via the GitHub API → top 12 by `pushed_at` (excluding forks/archived/private).

   These appear as `### LIVE SOURCE: MEDIUM ARTICLES` / `### LIVE SOURCE: GITHUB PUBLIC REPOS` sections at the bottom of the KB so the agent can cite them without making a runtime fetch.
3. **Writes the result** to [`lib/knowledge-base.generated.ts`](lib/knowledge-base.generated.ts) as a single exported string constant `KNOWLEDGE_BASE`. This file is gitignored (regenerated every build).

The build also prepends a header that frames the content for the model — quoted verbatim:

> Below is everything you know about Hemanth, organized by source file. Use only this content for questions about him. If a question can't be answered from this content, use the web_search tool, or admit you don't have the answer and direct the user to email Hemanth.
>
> The "LIVE SOURCES" sections at the bottom are auto-injected at build time from authoritative feeds (Medium RSS, GitHub API). Prefer them over web_search when the question is about Hemanth's articles or repos.

If the live-source fetches fail (rate-limited, network blip, env var missing) the build still succeeds — just without that section.

### 3. The API call is small, streamed, and cached

[`app/api/chat/route.ts`](app/api/chat/route.ts) is the only chat endpoint — runs on Vercel Edge. The system prompt is sent as **two blocks**:

```ts
system: [
  { type: "text", text: AGENT_RULES },                              // small, not cached
  { type: "text", text: KNOWLEDGE_BASE, cache_control: { type: "ephemeral" } },  // big, cached
]
```

The KB is large (every project file + bio + Medium feed + GitHub feed) and changes only on deploy — perfect for Anthropic's **prompt caching**. The first request after a build pays full cost; subsequent requests within ~5 minutes hit the cache and read it at ~10% of the input price. Rules don't get cached because they're tiny and tweaks to them shouldn't bust the KB cache.

Other call settings:

- `model: "claude-sonnet-4-6"`
- `max_tokens: 1024` (responses are short by design)
- Streamed with the SDK's `messages.stream()` and forwarded to the client as Server-Sent Events
- Two server tools: `web_search` (max 3 calls/response) and `web_fetch` (max 2 calls/response)

### 4. When does the agent decide to search the web?

That decision is made entirely by the model, guided by [`lib/agent-prompt.ts`](lib/agent-prompt.ts). The relevant rules (verbatim):

```
HOW TO ANSWER
1. For any question about Hemanth's background, education, projects, skills, role, or
   contact info: answer directly from the knowledge base below.
2. For questions about recent talks, mentions, news, or anything time-sensitive:
   use the web_search tool. Include "Hemanth" or his full name in the query to avoid
   irrelevant results.
3. For deep questions about a specific Medium article: use web_fetch to read the
   full article, then answer from its content.
4. If neither the KB nor web tools produce a confident answer:
   "I don't have that detail. You can reach Hemanth at <email> to ask directly."
```

So in practice:

- **"Where did Hemanth work before Temus?"** → answered from `data/work-experience.md`. No web call.
- **"What was Hemanth's most recent Medium post?"** → already in the KB (build-time RSS), but the model may run a `web_search` to verify or pull a newer one if it's been a while since the last deploy.
- **"Has Hemanth been mentioned in any A*STAR press releases this year?"** → triggers `web_search`, scoped with "Hemanth Kumar" by the prompt rule.
- **"Summarise his Decision Ledger article in detail."** → if the URL is in the KB, the model picks `web_fetch` to read the article body before answering.

The hard caps (3 web_search, 2 web_fetch per response) come from the tool definitions themselves, so no matter what the model decides, a single user turn can't burn unbounded outbound calls.

### 5. Off-topic / abuse handling

This is a small site, so the strategy is **lightweight + honest about its limits**.

**Off-topic gate (model-level).** The system prompt has an explicit out-of-scope rule:

```
OUT OF SCOPE
- For questions unrelated to Hemanth (general coding, current news, life advice):
  reply: "I'm just here to answer questions about Hemanth. For that, you'd want
  Claude itself — claude.ai." Then stop.
```

Asking "write me a poem about cats" or "what's 2+2" gets the canned redirect, not a general-purpose Claude response. This is enforced by Claude's instruction-following, not by code — so it's not airtight against a determined jailbreaker, but it works for normal traffic. It also prevents `web_search` from being abused as a free Google: the model only reaches for the tool when the question is *about Hemanth* and time-sensitive, per rule 2 above.

**Rate limit (network-level).** [`app/api/chat/route.ts`](app/api/chat/route.ts) layers three sliding-window limiters via [`@upstash/ratelimit`](https://github.com/upstash/ratelimit-js) backed by Upstash Redis:

| Limiter | Key | Window | Cap | Status on fail |
|---|---|---|---|---|
| Per-IP burst | `chat:<ip>` | 5 min | 5 | `429` |
| Per-IP hourly | `chat:<ip>` | 1 hour | 20 | `429` |
| Global daily | `global` | 24 hours | 500 | `503` |

The IP comes from `x-forwarded-for` (first hop) → `x-real-ip` → `"unknown"`. Per-IP limits run **before** the global limiter so one abusive caller can't burn the daily quota for everyone. The global daily limit is the cost ceiling — it caps the worst-case Anthropic bill at roughly $6/day no matter how viral the page goes.

If `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` aren't set (local dev, fork), the route falls back to per-instance in-memory counters with the same numbers — fine for development, **not adequate for production**, so always set the Upstash env vars in Vercel.

When a limiter trips, the JSON body is `{ error: "rate_limit_per_ip" | "rate_limit_exceeded", message: "<human readable>" }` and the frontend renders it in-thread as a muted-italic system notice (same visual treatment as the `web_search` / `web_fetch` tool-status indicators), not as a toast or a thrown error.

**Hard tool caps.** Even if a request makes it through rate limiting, `web_search`/`web_fetch` are bounded per response (3 + 2). The `max_tokens: 1024` cap means runaway generation costs are also bounded.

**What's intentionally NOT in place** (and why):

| Guard | Status | Reason |
|---|---|---|
| Input length cap | None | Model itself rejects nonsense at scale; rate limit catches volume abuse |
| Message count cap per session | None | `sessionStorage` resets on tab close; long convos die naturally |
| Prompt-injection filter | None | Out-of-scope rule covers most cases; jailbreak attempts mostly cost the attacker their own session |
| CAPTCHA / auth | None | Friction would kill the whole "ask me anything" UX |
| Server-side query logging | None | Privacy-by-default; nothing to leak if scraped |
| Per-session cost guard | None | Anthropic dashboard alerts handle the budget side |

If usage patterns ever justify more, the natural next step is a cheap pre-flight classifier on suspicious-looking inputs before they hit the main model. Not worth the complexity yet.

### 6. Frontend wiring

[`app/chat/page.tsx`](app/chat/page.tsx) hosts the chat thread. The flow:

1. User types into [`ChatInput`](components/chat/ChatInput.tsx) (also embedded in the homepage hero tile).
2. [`useChat`](lib/use-chat.ts) appends to the local message list and POSTs to `/api/chat`.
3. The hook reads the SSE stream and dispatches the SDK's native event types (`message_start`, `content_block_delta`, `message_delta`, `message_stop`) into React state.
4. [`Message`](components/chat/Message.tsx) renders streamed text incrementally; citations from `web_search` are passed through unchanged and rendered as [`SourceChips`](components/chat/SourceChips.tsx) under the answer.

Conversation history is kept in **`sessionStorage`** under the key `askhemanth.chat.v1`. That means:

- Survives a page refresh.
- Does **not** survive closing the tab.
- Does **not** sync across devices or tabs.

That's deliberate — chat is exploratory, not a saved record. The previous version used `localStorage` and conversations piled up forever; sessionStorage is the right scope.

---

## Project structure

```
app/
  page.tsx                  # bento homepage
  chat/page.tsx             # full chat thread page
  api/chat/route.ts         # the only API route (Edge)
  opengraph-image.tsx       # OG card generator
components/
  bento/                    # tile components (Hero, Role, Work, Now, GitHub, …)
  chat/                     # ChatInput, Message, SourceChips, Markdown
  chrome/                   # Wordmark, StatusPill, Footer
data/                       # the entire KB — markdown
lib/
  agent-prompt.ts           # AGENT_RULES — small, hand-edited
  knowledge-base.generated.ts  # KNOWLEDGE_BASE — auto-built, gitignored
  use-chat.ts               # streaming + sessionStorage
public/
  avatars/                  # illustration + OG variant
  logos/                    # processed company logos for the Work tile
scripts/
  build-system-prompt.ts    # KB build (data/ + Medium + GitHub)
  process-logos.py          # one-time logo processor (Pillow)
Company Logos/              # source-of-truth logo assets
```

---

## Running locally

```bash
npm install
npm run dev
```

The `predev` hook builds the KB before Next starts. To skip live-source fetches (offline / faster iteration), unset `MEDIUM_USERNAME` and `GITHUB_USERNAME` in `.env.local`.

### Required environment variables

```bash
ANTHROPIC_API_KEY=sk-ant-...        # required for /api/chat
UPSTASH_REDIS_REST_URL=https://...  # required in production (rate limiting)
UPSTASH_REDIS_REST_TOKEN=...        # required in production (rate limiting)
MEDIUM_USERNAME=...                 # optional — without it, Medium feed is skipped
GITHUB_USERNAME=...                 # optional — without it, GitHub feed is skipped
```

Without the Upstash vars the rate limiter falls back to per-instance in-memory counters — fine locally, not safe in production.

`.env.local` is loaded manually by the build script (Vercel injects env vars directly in production).

### Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Build KB + start Next dev server (Turbopack) |
| `npm run build` | Build KB + production build |
| `npm run lint` | ESLint |
| `python3 scripts/process-logos.py` | Re-process logos from `Company Logos/` to `public/logos/` |

---

## Editing content

See [`data/README.md`](data/README.md) for the editorial conventions. TL;DR:

- Update facts in their canonical file (`bio.md` for career, `now.md` for current focus, `qa.md` for opinions/voice).
- Cross-reference projects from `data/projects/*.md`.
- `git push` to deploy. Cache invalidates naturally on the next request after build.

---

## Deploy

Hosted on Vercel. Set the three env vars above in the project settings; everything else is automatic. The OG card is rendered by [`app/opengraph-image.tsx`](app/opengraph-image.tsx) at the Edge — its avatar is pre-quantized to PNG8 to fit the 1 MB Edge Function size limit.
