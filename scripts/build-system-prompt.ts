import fs from "node:fs";
import path from "node:path";

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
