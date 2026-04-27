import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ProjectFrontmatter = {
  slug: string;
  title: string;
  year: string;
  company: string;
  stack: string[];
  status: "active" | "completed" | "paper-trading" | string;
  links?: { github?: string; writeup?: string };
  cover?: string;
  weight?: number;
};

export type Project = {
  frontmatter: ProjectFrontmatter;
  body: string;
  coverPublicPath: string | null;
};

const PROJECTS_DIR = path.join(process.cwd(), "data", "projects");
const PUBLIC_DIR = path.join(process.cwd(), "public");

export function getAllSlugs(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

export function getProject(slug: string): Project | null {
  const file = path.join(PROJECTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as Partial<ProjectFrontmatter>;
  if (!fm.slug || !fm.title) return null;

  let coverPublicPath: string | null = null;
  if (typeof fm.cover === "string" && fm.cover.startsWith("/")) {
    const fullPath = path.join(PUBLIC_DIR, fm.cover);
    if (fs.existsSync(fullPath)) {
      coverPublicPath = fm.cover;
    }
  }

  return {
    frontmatter: {
      slug: fm.slug,
      title: fm.title,
      year: String(fm.year ?? ""),
      company: fm.company ?? "",
      stack: Array.isArray(fm.stack) ? fm.stack : [],
      status: (fm.status ?? "completed") as ProjectFrontmatter["status"],
      links: fm.links,
      cover: fm.cover,
      weight: typeof fm.weight === "number" ? fm.weight : 0,
    },
    body: content.trim(),
    coverPublicPath,
  };
}

export function getAllProjectsSorted(): Project[] {
  return getAllSlugs()
    .map(getProject)
    .filter((p): p is Project => p !== null)
    .sort(
      (a, b) =>
        (b.frontmatter.weight ?? 0) - (a.frontmatter.weight ?? 0)
    );
}
