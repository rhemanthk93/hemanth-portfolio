import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type NowData = {
  intro: string;
  bullets: string[];
  updated: string | null;
};

const NOW_PATH = path.join(process.cwd(), "data", "now.md");

export function getNow(): NowData {
  let raw: string;
  try {
    raw = fs.readFileSync(NOW_PATH, "utf-8");
  } catch {
    return { intro: "", bullets: [], updated: null };
  }

  const { data, content } = matter(raw);
  const updated = typeof data.updated === "string"
    ? data.updated
    : data.updated instanceof Date
      ? data.updated.toISOString().slice(0, 10)
      : null;

  const lines = content.split("\n");
  const bullets: string[] = [];
  let intro = "";
  let inBullets = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const bulletMatch = /^[-*]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      bullets.push(bulletMatch[1].trim());
      inBullets = true;
      continue;
    }
    if (!inBullets && trimmed && !trimmed.startsWith("#")) {
      // first non-empty non-bullet non-heading line becomes intro
      if (!intro) intro = trimmed;
    }
  }

  return { intro, bullets, updated };
}
