# askHemanth — Portfolio Site PRD (final)

> Spec for Claude Code Opus 4.7 to build Hemanth's AI-native personal portfolio.
> This document supersedes all earlier drafts. Read it fully before writing any code.
> Make decisive design calls within the constraints — don't ask clarifying questions on style.

---

## 0. Pre-flight checklist (Hemanth fills before kickoff)

Before starting Claude Code, gather these. Some have placeholders in the data files; the rest go in `.env.local`.

| Item | Where it lives |
|---|---|
| Medium username (e.g., `@hemanth`) | `MEDIUM_USERNAME` in `.env.local` |
| GitHub username | `GITHUB_USERNAME` in `.env.local` |
| LinkedIn profile URL | `data/contact.md` |
| X / Twitter handle (optional) | `data/contact.md` |
| Public email address | `data/contact.md` + `.env.local` |
| Domain name (e.g., `askhemanth.com`) | Vercel domain config |
| Anthropic API key | `ANTHROPIC_API_KEY` |

---

## 1. Vision

A conversation-first personal portfolio. The homepage is a **bento grid** with a **persistent AI chat input** as the centerpiece — visitors ask anything about Hemanth (background, projects, skills, contact) and get an answer drawn from his curated knowledge base, with a graceful fallback to live web search for time-sensitive or external questions.

This is not a static résumé site. Not a shadcn template. Editorial, warm-dark, agent-native.

The chat agent is the differentiator — most portfolios are read-only documents. This one has opinions, in Hemanth's voice, and can answer things a CV can't.

---

## 2. Tech stack — locked in

| Layer | Choice |
|---|---|
| Framework | Next.js 15+ (App Router, TypeScript, no `src/`) |
| Styling | Tailwind CSS v4 (`@theme` block in `globals.css`, no `tailwind.config.js`) |
| UI primitives | shadcn/ui (Input, Button, Dialog, ScrollArea — that's it) |
| Animation | `motion` (Framer Motion's new package name) |
| Markdown rendering | `@next/mdx` for project pages, `gray-matter` for frontmatter |
| AI SDK | `@anthropic-ai/sdk` v0.40+ (no Vercel AI SDK wrapper) |
| Chat model | `claude-sonnet-4-6` |
| Database | **None.** No Supabase, no pgvector, no Redis. |
| Deployment | Vercel (edge runtime for `/api/chat`) |
| Fonts | Geist Sans + Geist Mono via `next/font/google` |
| Analytics | Vercel Analytics (privacy-safe, no cookie banner needed) |

---

## 3. Architecture overview

```
Browser ─┬─► /                  bento homepage
         ├─► /chat              full chat thread
         ├─► /projects/[slug]   case study pages
         │
         └─► API routes (Next.js, edge runtime)
              ├─► /api/chat     streaming Anthropic call w/ web tools
              ├─► /api/medium   cached RSS fetch (revalidate=3600)
              └─► /api/github   cached REST + contrib scrape (revalidate=21600)

Anthropic Messages API call
  └─ Tools (both server-executed by Anthropic, no client tools needed):
      ├─ web_search_20260209  — fallback for unknown questions
      └─ web_fetch_20250910   — fetch full Medium articles on demand

System prompt assembly (at build time)
  /data/*.md ─► concat into single string ─► export as const ─► imported by /api/chat
  Sent to Anthropic with cache_control: { type: "ephemeral" }
  → 90% input-token discount on cached portion (~21K tokens of personal data)

Live tiles (independent of chat)
  Medium tile  ← /api/medium  ← Medium RSS feed
  GitHub tile  ← /api/github  ← github.com/users/<u>/contributions (scraped) + REST
  Now tile     ← reads /data/now.md at build time
```

**Why no database:** the entire personal corpus is ~21K tokens. RAG only earns its complexity past 50K-100K. Prompt caching gives us the same effect with zero infrastructure, zero embedding pipeline, zero drift between source files and a vector store. See Appendix A for the cost math.

---

## 4. Data sources (concrete URLs)

### 4.1 Medium articles
- **RSS**: `https://medium.com/feed/@<MEDIUM_USERNAME>`
- **JSON converter** (avoids server-side XML parsing): `https://api.rss2json.com/v1/api.json?rss_url=https%3A//medium.com/feed/%40<USERNAME>`
- Paywalled posts return excerpts only. That's fine — both the tile and the chat use excerpts; the agent uses `web_fetch` for full content on demand.
- If Hemanth has no Medium yet, the tile shows a graceful empty state ("Articles coming soon"). Don't fake content.

### 4.2 GitHub (live, public, unauthenticated)
- User: `https://api.github.com/users/<GITHUB_USERNAME>`
- Repos: `https://api.github.com/users/<GITHUB_USERNAME>/repos?sort=updated&per_page=10`
- Contribution graph (no official API): scrape `https://github.com/users/<USERNAME>/contributions` server-side, parse SVG `<rect>` elements for daily counts. Cache 6 hours.
- Rate limit: 60 req/hour unauthenticated. Cache aggressively (`revalidate=21600`).

### 4.3 LinkedIn (manual, no API)
- LinkedIn's official API doesn't expose personal feed/posts. Don't try.
- Source: LinkedIn data export (Settings → Data Privacy → Get a copy of your data). One-time bulk import into `data/linkedin-posts.md`, then manually append new posts.
- The contact tile links out to the LinkedIn profile — that's the only "live" piece.

### 4.4 Web search (chat fallback)
- Anthropic native server tool: `{"type": "web_search_20260209", "name": "web_search", "max_uses": 3}`
- Anthropic executes the search; you get cited results in the response. No Brave/Tavily setup.
- Pricing: $10 per 1,000 searches plus token cost. Cap at `max_uses: 3` per chat turn.

### 4.5 Web fetch (for full Medium article reading)
- Anthropic native server tool: `{"type": "web_fetch_20250910", "name": "web_fetch", "max_uses": 2}`
- Used by the agent to pull full article content when a visitor asks deep questions about a specific Medium post.

---

## 5. The data layer (markdown files + prompt caching)

### 5.1 Directory layout

```
/data/
  bio.md                  # Long-form bio, career arc, philosophy
  education.md            # SMU BSc + certifications
  contact.md              # Email + socials + "no phone" rule for the agent
  now.md                  # Current focus — updated weekly
  skills.md               # Tech stack with proficiency notes
  qa.md                   # 30-50 hand-written Q&A pairs in Hemanth's voice
  linkedin-posts.md       # Manually mirrored LinkedIn posts
  projects/
    decision-ledger.md
    raxtor.md
    alpaca-bot.md
    snpdrug3d.md
    ngee-ann-poly-databricks.md
    natural-capital-monetisation.md
    sph-slack-gemini.md
    jpm-liquidity.md
    gic-portfolio-risk.md
```

Frontmatter convention for project files:

```markdown
---
slug: decision-ledger
title: Decision Ledger
year: 2026
company: Personal / Hackathon
stack: [Claude Sonnet 4.6, Supabase, pgvector, Python]
status: completed
links:
  github: https://github.com/...
  writeup: https://medium.com/@...
cover: /projects/decision-ledger/cover.png
weight: 9
---

## Summary
[...]

## Problem
[...]

## Architecture
[...]

## What I learned
[...]
```

**Keep this structure consistent across all project files.** Same headings, same frontmatter shape. This pays off later when Raxtor edits files autonomously (Phase 2).

### 5.2 Build pipeline

`scripts/build-system-prompt.ts` runs as a `prebuild` and `predev` hook. It walks `/data/`, concatenates every `.md` file, and writes `lib/knowledge-base.generated.ts` as a single exported const string.

```typescript
// scripts/build-system-prompt.ts
import fs from "node:fs";
import path from "node:path";

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (e.name.endsWith(".md")) return [p];
    return [];
  });
}

const HEADER = `Below is everything you know about Hemanth, organized by source file.
Use only this content for questions about him. If a question can't be
answered from this content, use the web_search tool, or admit you
don't have the answer and direct the user to email Hemanth.

=== KNOWLEDGE BASE ===

`;

const files = walk(path.join(process.cwd(), "data")).sort();
const sections = files.map((f) => {
  const rel = path.relative(process.cwd(), f);
  return `### FILE: ${rel}\n\n${fs.readFileSync(f, "utf-8")}\n`;
});

const kb = HEADER + sections.join("\n---\n\n");
fs.writeFileSync(
  path.join(process.cwd(), "lib", "knowledge-base.generated.ts"),
  `// AUTO-GENERATED — do not edit by hand\nexport const KNOWLEDGE_BASE = ${JSON.stringify(kb)};\n`
);
console.log(`Built KB: ${files.length} files, ${kb.length} chars`);
```

`package.json`:

```json
{
  "scripts": {
    "prebuild": "tsx scripts/build-system-prompt.ts",
    "predev": "tsx scripts/build-system-prompt.ts",
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Add `lib/knowledge-base.generated.ts` to `.gitignore` — it's regenerated on every build.

### 5.3 Update workflow

To update any content: edit a markdown file → commit → push. Vercel rebuilds in 30-60s, the next chat request loads the new content. No admin UI, no CMS. The 5-minute prompt cache invalidates naturally because the cached content hash changes after a deploy.

---

## 6. Image management

```
/public/
  avatars/
    hemanth-laptop.png       # HERO — the standing transparent-bg one
    [...other 7 Genspark variants, descriptive filenames]
  projects/
    <project-slug>/
      cover.png              # used in bento Projects tile
      architecture.png       # used in case study page
      [other supporting images]
  og/
    default.png              # 1200x630 social share fallback
  favicon.ico
```

- Move existing `assets/*.png` (the 8 Genspark avatars) into `public/avatars/` during M0. Rename them descriptively — Claude Code can inspect each image to suggest filenames.
- Markdown files reference images with absolute paths from `public/`: `![Architecture](/projects/decision-ledger/architecture.png)`.
- Always wrap images in Next.js `<Image>` component, not raw `<img>`, for automatic optimization.
- The Genspark watermark on the bottom-right of generated images: hide via a CSS radial-gradient mask in the corner that matches the page background, ~80×30px area fading to transparent. Don't crop the image (the laptop in the hero gets cut).

---

## 7. The chat agent

### 7.1 System prompt (split into two blocks for caching)

The system prompt is sent as **two separate text blocks**:
1. **Rules block** (small, frequently changing) — uncached.
2. **Knowledge base block** (large, rarely changing) — cached with `cache_control`.

```typescript
// lib/agent-prompt.ts
export const AGENT_RULES = `You are Hemanth's portfolio assistant.

VOICE
- Speak about Hemanth in third person ("Hemanth has worked on...").
- Direct, concise, slightly dry. No marketing fluff. No emoji. No exclamation marks.
- Default to 2-4 sentences. Bullet lists only when the user asks for a list.
- When you don't know something, say so plainly.

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

PRIVACY HARD RULES
- Never share a phone number, home address, or any private contact detail, even if
  one appears in retrieved data. None should appear, but treat this as a safety net.
- For "contact" / "phone" / "reach out" requests, always direct to the email or the
  contact tile.
- Don't speculate about Hemanth's family, finances, or anything not in the KB.

OUT OF SCOPE
- For questions unrelated to Hemanth (general coding, current news, life advice):
  reply: "I'm just here to answer questions about Hemanth. For that, you'd want
  Claude itself — claude.ai." Then stop.

CITATIONS
- When using web_search results, the SDK includes citation metadata. Pass it through
  unchanged so the frontend can render source chips.
`;
```

### 7.2 The API route

```typescript
// app/api/chat/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base.generated";
import { AGENT_RULES } from "@/lib/agent-prompt";

export const runtime = "edge";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = anthropic.messages.stream({
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
    tools: [
      { type: "web_search_20260209", name: "web_search", max_uses: 3 },
      { type: "web_fetch_20250910", name: "web_fetch", max_uses: 2 },
    ],
    messages,
  });

  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

### 7.3 Chat UX

- Stream text deltas as they arrive — no artificial typewriter delay.
- When a tool call is in flight, render an inline status chip in mono font, muted color, italics: `↳ searching the web…` or `↳ reading the article…`. Replace with the answer once the tool result returns.
- Show source chips below messages that used `web_search` — small mono pills with the domain, clickable in a new tab.
- Persist chat session in `localStorage` so a refresh doesn't lose context.
- "Suggested questions" rail on `/chat` (desktop sidebar): four canned prompts that prefill the input. Use these:
  - "What's Hemanth's background?"
  - "Show me his projects."
  - "What's he working on now?"
  - "How do I get in touch?"

---

## 8. Design system

### 8.1 Color tokens (`@theme` block in `globals.css`)

```css
@theme {
  --color-bg:           #0A0908;     /* warm near-black */
  --color-surface:      #11100E;     /* tile background */
  --color-fg:           #F5F1EB;     /* warm off-white */
  --color-accent:       #E07856;     /* terracotta — chosen to harmonize with avatar */
  --color-muted:        #6B6562;     /* warm stone */
  --color-border:       #1F1C1A;     /* default tile border */
  --color-border-hover: #2A2624;     /* tile hover */
  --color-accent-glow:  #E0785633;   /* accent at 20% for halo */
}
```

The terracotta was picked to match the avatar's skin tones — using a generic Tailwind blue/purple here would make the illustration look pasted on. Used sparingly: status pill dot, chat input submit button, GitHub heatmap, single accent skill pill. ≤6 uses total across the page.

### 8.2 Typography

- **Display**: Geist Sans, weight 500, `clamp(40px, 5vw, 56px)`, `tracking-tighter` (-0.03em), line-height 1.0
- **H2**: Geist Sans, weight 500, 22px, `tracking-tight`
- **Body**: Geist Sans, weight 400, 15px, line-height 1.5
- **Mono labels**: Geist Mono, weight 400, 11px, `uppercase tracking-wider`

Mono is reserved for technical/meta labels (status pills, eyebrow tags, footer, version numbers, code spans). Never for body text.

### 8.3 Texture (non-negotiable)

- **Grain**: SVG `feTurbulence` (baseFrequency 0.9, numOctaves 2), 4% opacity, `mix-blend-mode: overlay`, fixed full-screen overlay, `pointer-events: none`.
- **Hairline grid**: 1px lines at 4% opacity, every 96px, via CSS `linear-gradient` background.

These two are what separate "feels expensive" from "feels like a Tailwind starter."

### 8.4 Motion

- Avatar floats: `y: [0, -10, 0]` over 4.5s, `easeInOut`, infinite.
- Mouse parallax on avatar: ±14px X, ±10px Y, 250ms transition.
- Tile mount: `opacity: 0→1, y: 8→0` over 600ms `easeOut`, staggered 50ms per tile.
- Chat messages mount: same fade-up pattern, 200ms.
- All motion respects `prefers-reduced-motion`.

---

## 9. The bento layout (desktop ≥1024px)

12-column CSS grid, 8px gap. Reference the `bento-layout.svg` mockup for visual.

| Tile | Cols | Rows | Content source |
|---|---|---|---|
| Hero (avatar + chat input) | 1–8 | 1–3 | static (hero avatar + rotating placeholder) |
| Now | 9–12 | 1 | `data/now.md` |
| Role | 9–10 | 2 | static (Associate Manager, Temus) |
| GitHub | 11–12 | 2 | `/api/github` |
| Projects (featured) | 1–6 | 4 | `data/projects/*.md` (top 3 by `weight`) |
| Latest Article | 7–9 | 4 | `/api/medium` (most recent post) |
| Skills | 10–12 | 4 | `data/skills.md` |
| Contact strip | 1–12 | 5 | `data/contact.md` |

**Mobile** (<768px): single column, stacked in this order: Hero → Now → Role → GitHub → Projects → Article → Skills → Contact. Hero collapses chat input to a button labeled "Ask me anything" that routes to `/chat`.

**Hero tile chat input**: rotating placeholder cycles every 4 seconds through 4 prompts ("What's Hemanth's background?" / "Show me his projects." / "What's he working on now?" / "How do I get in touch?"). On submit, navigate to `/chat?q=<encoded query>` which prefills and submits the first message.

---

## 10. Pages

### 10.1 `/` — Homepage
The bento. Aim for single viewport on a 27" monitor; tolerate one scroll on a 13" laptop.

### 10.2 `/chat` — Full chat
Two-column layout on desktop: 280px left sidebar with "Suggested questions" + "Recent topics", main area is the message thread + input pinned to the bottom. Mobile: full-screen single column, sidebar collapses behind a button.

URL query param `?q=` prefills the first message and auto-submits.

### 10.3 `/projects/[slug]` — Case study
Renders `data/projects/<slug>.md` with MDX. Frontmatter drives a hero block (year, stack pills, status, GitHub/writeup links, cover image). Long-form content below. Sticky back-to-home link in the top-left.

---

## 11. File and folder structure

Project root (already exists):
`/Users/hemanth/Library/CloudStorage/OneDrive-Personal/Claude Code Projects/Personal Portfolio/`

The folder currently contains an `images/` subfolder with 8 Genspark avatar PNGs. Step 1 of M0 moves these into `public/avatars/`.

```
Personal Portfolio/
  app/
    layout.tsx                      # fonts, metadata, grain overlay, footer
    page.tsx                        # bento homepage
    chat/page.tsx                   # full chat thread view
    projects/[slug]/page.tsx        # case study (MDX)
    api/
      chat/route.ts                 # streaming Anthropic call (edge)
      medium/route.ts               # cached RSS fetch
      github/route.ts               # cached GitHub fetch
    globals.css                     # Tailwind v4 + @theme + grid bg
  components/
    bento/
      HeroTile.tsx                  # avatar + name + chat input
      NowTile.tsx
      RoleTile.tsx
      GitHubTile.tsx
      ProjectsTile.tsx
      ArticleTile.tsx
      SkillsTile.tsx
      ContactTile.tsx
    chat/
      ChatInput.tsx                 # used in HeroTile + /chat
      ChatThread.tsx                # message list, streams
      Message.tsx
      ToolStatus.tsx                # "↳ searching…" inline indicator
      SourceChips.tsx               # web_search citation pills
    chrome/
      Wordmark.tsx
      StatusPill.tsx
      GrainOverlay.tsx
      Footer.tsx
  data/
    bio.md
    education.md
    contact.md
    now.md
    skills.md
    qa.md
    linkedin-posts.md
    projects/
      decision-ledger.md
      raxtor.md
      alpaca-bot.md
      snpdrug3d.md
      ngee-ann-poly-databricks.md
      natural-capital-monetisation.md
      sph-slack-gemini.md
      jpm-liquidity.md
      gic-portfolio-risk.md
  lib/
    anthropic.ts                    # SDK client
    agent-prompt.ts                 # AGENT_RULES const
    knowledge-base.generated.ts     # AUTO-GENERATED, gitignored
    medium.ts                       # RSS parser + cache helpers
    github.ts                       # GitHub fetch + contrib scrape
    types.ts
  scripts/
    build-system-prompt.ts          # runs as prebuild + predev
  public/
    avatars/                        # 8 Genspark PNGs (renamed)
    projects/                       # one folder per project slug
    og/                             # social share image
    favicon.ico
  .env.local
    ANTHROPIC_API_KEY=
    GITHUB_USERNAME=
    MEDIUM_USERNAME=
    PUBLIC_EMAIL=
  .gitignore
    lib/knowledge-base.generated.ts
    .env.local
    .next
    node_modules
```

---

## 12. Build milestones

Hand each milestone to Claude Code as a separate session. After each, run it locally, screenshot, review. Don't move on until the milestone is right.

### M0 — Foundation (1-2 hours)
- The project root already exists at `/Users/hemanth/Library/CloudStorage/OneDrive-Personal/Claude Code Projects/Personal Portfolio/` with an `images/` subfolder containing 8 Genspark avatar PNGs
- Scaffold Next.js into the existing folder: `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
- `mkdir -p public/avatars && mv images/*.png public/avatars/ && rmdir images`
- Inspect each PNG and rename descriptively (e.g., `hemanth-laptop.png`, `hemanth-suit-front.png`)
- `globals.css` with `@theme`, grid background, Geist fonts
- Build `Wordmark`, `StatusPill`, `GrainOverlay`, `Footer` components
- `app/page.tsx` renders just the chrome — proves the visual foundation
- ✅ Acceptance: page renders with grain texture visible, hairline grid visible, wordmark + status pill + footer in place. Looks intentional even with no content.

### M1 — Bento static layout (2-3 hours)
- All 8 tiles built with hard-coded placeholder content
- Responsive grid: desktop bento → mobile single column
- Hover states on tiles (border color shift, no movement)
- Hero tile shows the avatar with floating animation + mouse parallax
- ✅ Acceptance: bento grid pixel-matches the SVG mockup. Hover states feel right. Looks the same on a 13" laptop and 27" monitor (just denser).

### M2 — Knowledge base build pipeline (1 hour)
- `data/` folder created with **placeholder markdown** (3-5 files, real content comes later)
- `scripts/build-system-prompt.ts` written and wired into `package.json`
- `lib/knowledge-base.generated.ts` is generated on `npm run dev`
- ✅ Acceptance: running `npm run dev` regenerates the KB; the generated file imports cleanly in a test API route.

### M3 — Chat agent (3-4 hours)
- `app/api/chat/route.ts` with streaming + both server tools wired
- `lib/agent-prompt.ts` with `AGENT_RULES`
- Chat UI components: `ChatInput`, `ChatThread`, `Message`, `ToolStatus`, `SourceChips`
- `/chat` page with sidebar + thread
- Hero tile chat input routes to `/chat?q=...` on submit
- ✅ Acceptance: ask "what's Hemanth's education?" — agent answers from KB in 2-3 sentences. Ask "any recent conference talks by Hemanth?" — agent calls web_search, returns cited results. Ask "what's the weather?" — agent politely refuses out-of-scope.

### M4 — Live tiles (2 hours)
- `/api/medium` (RSS parse + cache `revalidate=3600`)
- `/api/github` (REST + contrib scrape, cache `revalidate=21600`)
- `ArticleTile`, `GitHubTile`, `NowTile` consume their respective sources
- ✅ Acceptance: Medium tile shows the latest real post (or graceful empty state if no Medium yet); GitHub heatmap shows real contribution data; Now tile content matches `data/now.md`.

### M5 — Project detail pages (1-2 hours)
- `/projects/[slug]/page.tsx` reads markdown, renders with MDX
- Frontmatter drives the hero block (stack pills, year, status, links, cover image)
- Sticky back-link to homepage with smooth transition
- ✅ Acceptance: clicking a project tile → routes to a detail page that renders the full markdown correctly with cover image and frontmatter metadata.

### M6 — Polish & ship (1 hour)
- Lighthouse pass (target ≥95 desktop on all four metrics)
- OG image at `public/og/default.png` (1200×630)
- `robots.txt`, `sitemap.xml`
- Vercel deploy + custom domain
- ✅ Acceptance: live URL is shareable; Lighthouse desktop ≥95.

**Total estimated time: 10-15 hours of Claude Code sessions.**

---

## 13. Hard constraints — DO NOT DO

- ❌ No glassmorphism. No `backdrop-blur` on cards. No frosted glass anywhere.
- ❌ No purple/pink AI-cliché gradients.
- ❌ No emoji in UI copy. No exclamation marks in agent responses.
- ❌ Banned marketing words anywhere: "revolutionary", "next-gen", "AI-powered", "cutting-edge", "unleash", "supercharge", "leverage" as a verb.
- ❌ Phone number nowhere on the site, ever. The agent refuses to share one even if asked.
- ❌ No `rounded-2xl` on tiles. 4-6px radius max.
- ❌ More than ONE accent color. Terracotta, used in ≤6 places total.
- ❌ Floating chat bubble in the corner. The chat is a first-class surface, not a widget.
- ❌ Cookie banner. We don't track, so we don't need one.
- ❌ Auto-play anything. No video, no audio, no avatar animations beyond the gentle float.
- ❌ Stock illustrations, Lottie files, 3D blobs. The avatar IS the visual.

---

## 14. Project acceptance criteria

The project is "done" when ALL of these are true:

1. ✅ Lighthouse desktop ≥95 on all four metrics. Mobile ≥90.
2. ✅ Chat correctly answers all four reference questions:
   - "What is Hemanth's education?" → from KB
   - "What's his degree in?" → from KB
   - "What projects has he worked on?" → from KB, lists 3-5
   - "How do I contact him?" → directs to email, refuses phone
3. ✅ Chat falls through to web search for fresh-info questions and shows source chips.
4. ✅ Chat refuses out-of-scope questions politely.
5. ✅ Bento grid renders single-viewport on a 27" monitor, scrolls cleanly on a 13" laptop, stacks gracefully on iPhone.
6. ✅ The Genspark watermark on the hero avatar is hidden.
7. ✅ Page loads in <1.2s on a fast connection. Chat responses start streaming in <800ms.
8. ✅ A designer friend would compliment it before asking what it's for.

---

## 15. Phase 2 — after v1 ships

Don't build any of these in v1. They become natural follow-ups once the site is live and Hemanth has lived with it for a few weeks.

- **Raxtor `portfolio_editor` sub-agent**: extends Raxtor (running on the Mac Mini) with read/write access to `~/projects/hemanth-portfolio/data/`. Edit content via Telegram: "Raxtor, add a new project called X..." → Raxtor drafts, shows diff, commits on confirmation. ~3 hours of work, all in `AGENTS.md` + a sub-agent prompt.
- **MCP server**: expose `get_projects`, `get_articles`, `get_skills` as MCP tools so other people's Claude/agents can query the portfolio directly. Strong "I build with agents" signal — almost nobody is doing this in 2026.
- **Multi-agent chat**: orchestrator + project-specialist + article-specialist sub-agents. Mirrors Decision Ledger's architecture pointed at Hemanth himself.
- **Voice mode**: hold-to-talk on mobile, Whisper transcription, agent replies via TTS.
- **Visitor analytics dashboard**: what people are asking the chat. Privacy-safe aggregate only. Insight gold for what Hemanth should write more about.
- **Newsletter capture**: when there's enough article volume to justify it.

---

## 16. Working with Claude Code — handoff tips

1. `cd "/Users/hemanth/Library/CloudStorage/OneDrive-Personal/Claude Code Projects/Personal Portfolio" && claude`
2. First message in the first session: paste this PRD, then say "Start with M0. Show me the foundation, I'll review, then we'll move to M1."
3. After M0 succeeds, run `/init` so Claude Code generates `CLAUDE.md` capturing the structure for future sessions.
4. The `/data/` markdown files are pre-populated — Claude Code should read them as-is and not regenerate the content.
4. Review every milestone visually (`npm run dev`, look in browser) before approving.
5. When something looks off, be specific: "the tile borders are too bright — drop them to `#1F1C1A`" beats "fix the borders."
6. After M3 (chat agent), test with the four reference questions before moving on. If responses are too verbose, hallucinate, or sound generic, the issue is upstream in `qa.md` or `AGENT_RULES` — fix there before adding more features.
7. Don't paste M3+ instructions in M0's session. Start a fresh Claude Code session per milestone — keeps context clean and lets Claude Code use `CLAUDE.md` to load only what's relevant.

---

## Appendix A — cost analysis

Per chat turn (cache hit):

| Component | Tokens | Rate | Cost |
|---|---|---|---|
| Cached KB | ~21,000 | $0.30 / M | $0.0063 |
| Uncached rules + user msg | ~500 | $3.00 / M | $0.0015 |
| Output | ~300 | $15.00 / M | $0.0045 |
| **Per turn (no web search)** | | | **~$0.012** |
| + 1 web search | | $10 / 1k | + $0.010 |

First request after deploy (cache miss): ~$0.08, includes 25% cache-write surcharge. Subsequent requests in the 5-minute window drop back to ~$0.012.

At 1,000 chats/month: **~$15-25 all-in**. Negligible.

---

End of spec.
