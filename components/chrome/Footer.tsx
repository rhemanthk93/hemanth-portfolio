export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--color-border)] px-6 py-6 md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <p className="font-mono-label text-[var(--color-muted)]">
          ask<span className="text-[var(--color-fg)]">hemanth</span> &middot;{" "}
          {year}
        </p>
        <p className="font-mono-label text-[var(--color-muted)]">
          singapore / sgt
        </p>
      </div>
    </footer>
  );
}
