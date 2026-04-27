import Link from "next/link";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-baseline gap-2 text-[var(--color-fg)] no-underline"
    >
      <span className="font-sans text-[15px] font-medium tracking-tight">
        ask<span className="text-[var(--color-accent)]">hemanth</span>
      </span>
      <span className="font-mono-label text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-fg)]">
        v0.1
      </span>
    </Link>
  );
}
