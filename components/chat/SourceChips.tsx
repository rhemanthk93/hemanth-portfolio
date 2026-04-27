import type { Citation } from "@/lib/types";

function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SourceChips({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;

  // Dedupe by URL while keeping order
  const seen = new Set<string>();
  const unique = citations.filter((c) => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {unique.map((c) => (
        <a
          key={c.url}
          href={c.url}
          target="_blank"
          rel="noreferrer"
          title={c.title ?? c.url}
          className="font-mono-label inline-flex items-center gap-1 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-muted)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-fg)]"
        >
          <span aria-hidden>↗</span>
          <span>{domain(c.url)}</span>
        </a>
      ))}
    </div>
  );
}
