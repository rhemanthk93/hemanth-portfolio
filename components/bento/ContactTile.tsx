import { Tile, TileLabel } from "./Tile";

const EMAIL = "rhemanthk93@gmail.com";
const PHONE = "+65 9769 3514";
const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rhemanthkumar93/" },
  { label: "GitHub", href: "https://github.com/rhemanthk93" },
  { label: "Medium", href: "https://medium.com/@rhemanthk93" },
];

function Dot() {
  return (
    <span aria-hidden className="text-[var(--color-muted)]">
      &middot;
    </span>
  );
}

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
            Reach out &mdash; email, phone, LinkedIn. I usually respond within a
            day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-[var(--color-fg)]">
          <span className="inline-flex items-baseline gap-2">
            <span className="font-mono-label text-[var(--color-muted)]">
              email
            </span>
            <span>{EMAIL}</span>
          </span>
          <Dot />
          <span className="inline-flex items-baseline gap-2">
            <span className="font-mono-label text-[var(--color-muted)]">
              phone
            </span>
            <span>{PHONE}</span>
          </span>
          {SOCIALS.map((s) => (
            <span key={s.label} className="inline-flex items-baseline gap-2">
              <Dot />
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono-label text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]"
              >
                {s.label} <span aria-hidden>↗</span>
              </a>
            </span>
          ))}
        </div>
      </div>
    </Tile>
  );
}
