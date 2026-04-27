import { Tile, TileLabel } from "./Tile";
import { getGitHubData } from "@/lib/github";

const SHADES = [
  "var(--color-border)",
  "rgba(224,120,86,0.18)",
  "rgba(224,120,86,0.4)",
  "rgba(224,120,86,0.7)",
  "var(--color-accent)",
];

// 14 weeks × 7 days, pseudo-random fallback if scrape fails.
const FALLBACK_LEVELS =
  "0,1,0,2,3,0,1,4,2,0,1,3,2,0,0,1,2,3,1,0,2,4,3,1,0,1,2,3,0,1,2,1,0,2,3,4,2,1,0,1,2,0,3,1,2,0,1,2,3,1,0,2,4,3,2,1,0,1,2,3,0,1,2,3,1,0,2,1,0,3,2,1,0,2,3,4,2,1,0,1,2,3,4,1,0,2,3,1,0,2,1,3,2,0,1,2,3,1"
    .split(",")
    .map(Number);

export async function GitHubTile({ index = 0 }: { index?: number }) {
  const data = await getGitHubData(14);
  const cells = data.cells.length > 0
    ? data.cells.map((c) => c.level)
    : FALLBACK_LEVELS;
  const handleLabel = data.username ? `@${data.username}` : "github";
  const profileUrl = data.username
    ? `https://github.com/${data.username}`
    : "https://github.com/";

  return (
    <Tile
      index={index}
      className="md:col-start-11 md:col-end-13 md:row-start-2 md:row-end-4"
      label="github"
    >
      <div className="flex h-full flex-col justify-between gap-3 p-6">
        <div className="flex items-center justify-between gap-2">
          <TileLabel>github</TileLabel>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono-label shrink-0 text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            {handleLabel}
          </a>
        </div>
        <div
          role="img"
          aria-label="GitHub contribution heatmap, last 14 weeks"
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: "repeat(14, 1fr)" }}
        >
          {cells.slice(0, 98).map((v, i) => (
            <span
              key={i}
              className="aspect-square rounded-[2px]"
              style={{ backgroundColor: SHADES[Math.min(v, 4)] }}
            />
          ))}
        </div>
        <p className="font-mono-label text-[var(--color-muted)]">last 14 weeks</p>
      </div>
    </Tile>
  );
}
