import Link from "next/link";
import { Footer } from "@/components/chrome/Footer";
import { getAllProjectsSorted } from "@/lib/projects";

export const metadata = {
  title: "Projects",
  description: "Case studies and shipped work — banking, data engineering, geospatial, genomics, autonomous agents.",
};

const STATUS_COLOR: Record<string, string> = {
  active: "var(--color-accent)",
  "paper-trading": "var(--color-accent)",
};

export default function ProjectsIndex() {
  const projects = getAllProjectsSorted();

  return (
    <>
      <main className="relative flex flex-1 flex-col">
        <div className="sticky top-0 z-10 backdrop-blur-[2px]">
          <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-4 md:px-10">
            <Link
              href="/"
              className="font-mono-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              ← askhemanth
            </Link>
            <Link
              href="/chat"
              className="font-mono-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              ask the agent
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[720px] px-6 pt-6 pb-16 md:px-10">
          <header className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-8">
            <span className="font-mono-label text-[var(--color-muted)]">
              {projects.length} projects · sorted by recency &amp; weight
            </span>
            <h1 className="text-display text-[var(--color-fg)]">Projects.</h1>
          </header>

          <ul className="flex flex-col">
            {projects.map((p, idx) => {
              const dot = STATUS_COLOR[p.frontmatter.status] ?? "var(--color-muted)";
              return (
                <li
                  key={p.frontmatter.slug}
                  className={idx > 0 ? "border-t border-[var(--color-border)]" : ""}
                >
                  <Link
                    href={`/projects/${p.frontmatter.slug}`}
                    className="group flex flex-col gap-2 py-6"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="text-[20px] font-medium tracking-tight text-[var(--color-fg)] transition-colors group-hover:text-[var(--color-accent)]">
                        {p.frontmatter.title}
                      </h2>
                      <span className="font-mono-label shrink-0 text-[var(--color-muted)]">
                        {p.frontmatter.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: dot }}
                      />
                      <span className="font-mono-label text-[var(--color-muted)]">
                        {p.frontmatter.status} &middot; {p.frontmatter.company}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {p.frontmatter.stack.slice(0, 6).map((s) => (
                        <span
                          key={s}
                          className="font-mono-label rounded-[3px] border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-muted)]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
