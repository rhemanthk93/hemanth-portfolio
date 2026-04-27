type Props = {
  label?: string;
};

export function StatusPill({ label = "Online" }: Props) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
      </span>
      <span className="font-mono-label text-[var(--color-fg)]">{label}</span>
    </span>
  );
}
