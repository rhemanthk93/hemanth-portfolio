import { Tile, TileLabel } from "./Tile";

const FOCUS = [
  { label: "Claude API", accent: true },
  { label: "Multi-agent orchestration" },
  { label: "MCP" },
  { label: "Databricks" },
  { label: "PySpark" },
  { label: "AWS" },
  { label: "Apache Sedona" },
  { label: "Delta Lake" },
  { label: "Python" },
  { label: "Java" },
  { label: "Scala" },
  { label: "Postgres + pgvector" },
];

export function SkillsTile({ index = 0 }: { index?: number }) {
  return (
    <Tile
      index={index}
      className="md:col-start-10 md:col-end-13 md:row-start-4"
      label="skills"
    >
      <div className="flex h-full flex-col gap-4 p-6">
        <TileLabel>stack</TileLabel>
        <div className="flex flex-wrap gap-1.5">
          {FOCUS.map((s) => (
            <span
              key={s.label}
              className={
                s.accent
                  ? "font-mono-label rounded-[3px] border border-[var(--color-accent)] bg-[var(--color-accent-glow)] px-2 py-1 text-[var(--color-accent)]"
                  : "font-mono-label rounded-[3px] border border-[var(--color-border)] px-2 py-1 text-[var(--color-fg)]"
              }
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </Tile>
  );
}
