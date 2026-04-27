import fs from "node:fs";
import path from "node:path";

// Load .env.local manually. npm's predev hook runs before Next.js loads env
// files, and Vercel sets env vars in the build environment directly — so this
// is only used for local dev. Existing process.env values take priority.
function loadDotEnvLocal(): void {
  const envFile = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  }
}
loadDotEnvLocal();

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (e.name === "README.md") return [];
    if (e.name.endsWith(".md")) return [p];
    return [];
  });
}

const HEADER = `Below is everything you know about Hemanth, organized by source file.
Use only this content for questions about him. If a question can't be
answered from this content, use the web_search tool, or admit you
don't have the answer and direct the user to email Hemanth.

The "LIVE SOURCES" sections at the bottom are auto-injected at build time
from authoritative feeds (Medium RSS, GitHub API). Prefer them over
web_search when the question is about Hemanth's articles or repos.

=== KNOWLEDGE BASE ===

`;

function stripHtml(s: string): string {
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

type Rss2JsonItem = {
  title?: string;
  pubDate?: string;
  link?: string;
  description?: string;
  content?: string;
};

async function fetchMediumSection(): Promise<string | null> {
  const username = process.env.MEDIUM_USERNAME?.trim();
  if (!username) return null;
  try {
    const feed = `https://medium.com/feed/@${username}`;
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[build-kb] medium HTTP ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { status?: string; items?: Rss2JsonItem[] };
    if (json.status !== "ok" || !Array.isArray(json.items) || json.items.length === 0) {
      return null;
    }
    const items = json.items.slice(0, 10);
    const lines = [
      `### LIVE SOURCE: MEDIUM ARTICLES`,
      `Fetched at build time from medium.com/feed/@${username}.`,
      `${items.length} most recent posts, ordered newest first.`,
      ``,
    ];
    items.forEach((it, i) => {
      const date = it.pubDate
        ? new Date(it.pubDate).toISOString().slice(0, 10)
        : "?";
      const excerpt = stripHtml(it.description ?? it.content ?? "").slice(0, 280);
      lines.push(`${i + 1}. **${it.title ?? "Untitled"}** — published ${date}`);
      if (it.link) lines.push(`   URL: ${it.link}`);
      if (excerpt) {
        lines.push(`   Excerpt: ${excerpt}${excerpt.length === 280 ? "…" : ""}`);
      }
      lines.push("");
    });
    return lines.join("\n");
  } catch (err) {
    console.warn("[build-kb] medium fetch failed:", err);
    return null;
  }
}

type GhRepo = {
  name: string;
  description: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  pushed_at: string;
  html_url: string;
  stargazers_count: number;
  topics?: string[];
};

async function fetchGitHubSection(): Promise<string | null> {
  const username = process.env.GITHUB_USERNAME?.trim();
  if (!username) return null;
  try {
    const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "askhemanth-portfolio/0.1",
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) {
      console.warn(`[build-kb] github HTTP ${res.status}`);
      return null;
    }
    const all = (await res.json()) as GhRepo[];
    const own = all
      .filter((r) => !r.fork && !r.archived && !r.private)
      .slice(0, 12);
    if (own.length === 0) return null;
    const lines = [
      `### LIVE SOURCE: GITHUB PUBLIC REPOS`,
      `Fetched at build time from api.github.com/users/${username}/repos.`,
      `${own.length} most recently pushed (forks and archived excluded), ordered newest first.`,
      ``,
    ];
    own.forEach((r, i) => {
      const date = r.pushed_at ? r.pushed_at.slice(0, 10) : "?";
      const meta: string[] = [];
      if (r.language) meta.push(r.language);
      if (r.stargazers_count > 0) meta.push(`${r.stargazers_count}★`);
      meta.push(`pushed ${date}`);
      lines.push(`${i + 1}. **${r.name}** (${meta.join(", ")})`);
      lines.push(`   URL: ${r.html_url}`);
      if (r.description) lines.push(`   Description: ${r.description}`);
      if (r.topics && r.topics.length > 0) {
        lines.push(`   Topics: ${r.topics.join(", ")}`);
      }
      lines.push("");
    });
    return lines.join("\n");
  } catch (err) {
    console.warn("[build-kb] github fetch failed:", err);
    return null;
  }
}

async function main(): Promise<void> {
  const files = walk(path.join(process.cwd(), "data")).sort();
  const sections = files.map((f) => {
    const rel = path.relative(process.cwd(), f);
    return `### FILE: ${rel}\n\n${fs.readFileSync(f, "utf-8")}\n`;
  });

  const [medium, github] = await Promise.all([
    fetchMediumSection(),
    fetchGitHubSection(),
  ]);
  const liveExtras: string[] = [];
  if (medium) liveExtras.push(medium);
  if (github) liveExtras.push(github);

  const kb =
    HEADER +
    sections.join("\n---\n\n") +
    (liveExtras.length ? "\n---\n\n" + liveExtras.join("\n---\n\n") : "");

  fs.writeFileSync(
    path.join(process.cwd(), "lib", "knowledge-base.generated.ts"),
    `// AUTO-GENERATED — do not edit by hand\nexport const KNOWLEDGE_BASE = ${JSON.stringify(kb)};\n`
  );
  console.log(
    `Built KB: ${files.length} files, ${liveExtras.length} live sources, ${kb.length} chars`
  );
}

main().catch((err) => {
  console.error("[build-kb] failed:", err);
  process.exit(1);
});
