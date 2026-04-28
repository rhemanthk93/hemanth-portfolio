import { Tile, TileLabel } from "./Tile";
import { CONTACT } from "@/lib/contact";

type Pill = { label: string; href: string };

const PILLS: Pill[] = [
  { label: "Email", href: `mailto:${CONTACT.email}` },
  { label: "WhatsApp", href: CONTACT.whatsapp },
  { label: "LinkedIn", href: CONTACT.linkedin },
  { label: "GitHub", href: CONTACT.github },
  { label: "Medium", href: CONTACT.medium },
];

export function ContactTile({ index = 0 }: { index?: number }) {
  return (
    <Tile
      index={index}
      className="md:col-start-1 md:col-end-13 md:row-start-5"
      label="contact"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <TileLabel>contact</TileLabel>
          <p className="text-[15px] text-[var(--color-fg)]">
            Reach out &mdash; usually respond within a day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PILLS.map((p) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-label inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] border border-[var(--color-border)] px-3 py-1.5 text-[var(--color-fg)] transition-colors duration-200 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
            >
              <span>{p.label}</span>
              <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
      </div>
    </Tile>
  );
}
