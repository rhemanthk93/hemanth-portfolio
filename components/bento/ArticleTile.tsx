import { Tile, TileLabel } from "./Tile";
import { getLatestArticles } from "@/lib/medium";

const EMPTY = {
  title: "Articles coming soon",
  excerpt:
    "Long-form notes on agents, data engineering, and the small machines built at home will live here once the Medium feed is wired up.",
  date: "tba",
  url: process.env.MEDIUM_USERNAME
    ? `https://medium.com/@${process.env.MEDIUM_USERNAME}`
    : "https://medium.com/",
};

function formatDate(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toLowerCase();
}

export async function ArticleTile({ index = 0 }: { index?: number }) {
  const articles = await getLatestArticles(1);
  const article = articles[0];
  const data = article
    ? {
        title: article.title,
        excerpt: article.excerpt,
        date: formatDate(article.pubDate),
        url: article.url,
      }
    : EMPTY;

  return (
    <Tile
      index={index}
      className="md:col-start-7 md:col-end-10 md:row-start-4"
      label="article"
    >
      <a
        href={data.url}
        target="_blank"
        rel="noreferrer"
        className="flex h-full flex-col justify-between gap-4 p-6"
      >
        <div className="flex items-center justify-between gap-2">
          <TileLabel>latest writing</TileLabel>
          <span className="font-mono-label shrink-0 text-[var(--color-muted)]">
            {data.date}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <p className="line-clamp-3 text-[18px] font-medium leading-tight tracking-tight text-[var(--color-fg)] transition-colors group-hover:text-[var(--color-accent)]">
            {data.title}
          </p>
          <p className="line-clamp-3 text-[13.5px] leading-snug text-[var(--color-muted)]">
            {data.excerpt}
          </p>
        </div>
        <span className="font-mono-label text-[var(--color-muted)]">
          medium &rarr;
        </span>
      </a>
    </Tile>
  );
}
