import { Tile, TileLabel } from "./Tile";
import { Inline } from "@/components/chat/Markdown";
import { getNow } from "@/lib/now";

const FALLBACK = [
  "Studying for Databricks DE Professional",
  "Polishing Decision Ledger after the hackathon",
  "Tightening Raxtor's sub-agent routing",
  "Paper-trading the alpaca-bot options scalper",
];

function formatUpdated(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toLowerCase();
}

export function NowTile({ index = 0 }: { index?: number }) {
  const now = getNow();
  const items = now.bullets.length > 0 ? now.bullets.slice(0, 5) : FALLBACK;
  const updated = formatUpdated(now.updated);

  return (
    <Tile
      index={index}
      className="md:col-start-9 md:col-end-13 md:row-start-1"
      label="now"
    >
      <div className="flex h-full flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <TileLabel>now</TileLabel>
          {updated && (
            <span className="font-mono-label text-[var(--color-muted)]">
              upd. {updated}
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-1.5 text-[14px] leading-snug text-[var(--color-fg)]">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--color-muted)]" />
              <span>
                <Inline text={it} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Tile>
  );
}
