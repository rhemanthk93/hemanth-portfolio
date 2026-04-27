import Link from "next/link";
import { Tile, TileLabel } from "./Tile";

const PROJECTS = [
  {
    slug: "raxtor",
    title: "OpenClaw — Raxtor",
    summary: "Autonomous Telegram-first agent on the OpenClaw framework.",
    year: "2025–now",
    stack: ["Claude 4.6", "OpenClaw", "Mac Mini M4"],
  },
  {
    slug: "decision-ledger",
    title: "Decision Ledger",
    summary:
      "Multi-agent decision-extraction pipeline. Anthropic + Genspark hackathon.",
    year: "2026",
    stack: ["Claude 4.6", "Supabase", "pgvector"],
  },
  {
    slug: "snpdrug3d",
    title: "SNPDrug3D",
    summary:
      "Variant-to-3D-protein-structure mapping platform with A*STAR Bioinformatics.",
    year: "2025–now",
    stack: ["PySpark", "AWS", "BioPython"],
  },
];

export function ProjectsTile({ index = 0 }: { index?: number }) {
  return (
    <Tile
      index={index}
      className="md:col-start-1 md:col-end-7 md:row-start-4"
      label="projects"
    >
      <div className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-baseline justify-between">
          <TileLabel>featured projects</TileLabel>
          <Link
            href="/projects"
            className="font-mono-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            all &rarr;
          </Link>
        </div>
        <ul className="flex flex-col">
          {PROJECTS.map((p, idx) => (
            <li key={p.slug} className={idx > 0 ? "mt-6" : ""}>
              <Link
                href={`/projects/${p.slug}`}
                className="group/row flex flex-col gap-2"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[16px] font-medium tracking-tight text-[var(--color-fg)] transition-colors group-hover/row:text-[var(--color-accent)]">
                    {p.title}
                  </span>
                  <span className="font-mono-label text-[var(--color-muted)]">
                    {p.year}
                  </span>
                </div>
                <p className="text-[13.5px] leading-snug text-[var(--color-muted)]">
                  {p.summary}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="font-mono-label rounded-[2px] border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-muted)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Tile>
  );
}
