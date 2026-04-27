import Image from "next/image";
import { Tile, TileLabel } from "./Tile";

type WorkItem = {
  slug: string;
  name: string;
  years: string;
  logo: string;
  alt: string;
};

const WORK: WorkItem[] = [
  {
    slug: "jpmorgan",
    name: "JP Morgan",
    years: "2017–2021",
    logo: "/logos/jpmorgan.png",
    alt: "JP Morgan Chase",
  },
  {
    slug: "gic",
    name: "GIC",
    years: "2021–2022",
    logo: "/logos/gic.png",
    alt: "GIC",
  },
  {
    slug: "sph-media",
    name: "SPH Media",
    years: "2022–2024",
    logo: "/logos/sph-media.png",
    alt: "SPH Media",
  },
  {
    slug: "temus",
    name: "Temus",
    years: "2024–NOW",
    logo: "/logos/temus.png",
    alt: "Temus",
  },
];

// Per-logo display dimensions, tuned for visual unity. The processed PNGs
// are all 200px on the long edge but vary 1.4:1 → 6.9:1 in aspect ratio,
// so a single max-height looks unbalanced — wide wordmarks overpower the
// near-square ones. These dims aim for similar optical weight per cell.
const LOGO_DIMS: Record<string, { width: number; height: number }> = {
  jpmorgan: { width: 130, height: 19 },
  gic: { width: 75, height: 37 },
  "sph-media": { width: 58, height: 41 },
  temus: { width: 125, height: 25 },
};

export function WorkTile({ index = 0 }: { index?: number }) {
  return (
    <Tile
      index={index}
      className="md:col-start-9 md:col-end-13 md:row-start-1"
      label="work"
    >
      <div className="flex h-full flex-col gap-4 p-6">
        <TileLabel>work · 8 years</TileLabel>
        <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-4">
          {WORK.map((item) => {
            const dims = LOGO_DIMS[item.slug];
            return (
              <div
                key={item.slug}
                className="flex flex-col items-center justify-between gap-3 rounded-[4px] border border-[var(--color-border)] p-3 transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-border-hover)] hover:shadow-[0_0_24px_var(--color-accent-glow)]"
              >
                <div className="flex flex-1 items-center justify-center">
                  <Image
                    src={item.logo}
                    alt={item.alt}
                    width={dims.width}
                    height={dims.height}
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-[var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.08em] text-[var(--color-fg)]">
                    {item.name}
                  </span>
                  <span className="font-[var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    {item.years}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Tile>
  );
}
