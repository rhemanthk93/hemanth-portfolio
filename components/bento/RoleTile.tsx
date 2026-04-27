import { Tile, TileLabel } from "./Tile";

export function RoleTile({ index = 0 }: { index?: number }) {
  return (
    <Tile
      index={index}
      className="md:col-start-9 md:col-end-11 md:row-start-2 md:row-end-4"
      label="role"
    >
      <div className="flex h-full flex-col justify-between gap-2 p-6">
        <TileLabel>role</TileLabel>
        <div>
          <p className="text-[18px] font-medium tracking-tight text-[var(--color-fg)]">
            Associate Manager
          </p>
          <p className="text-[13px] text-[var(--color-muted)]">
            Temus &middot; Singapore
          </p>
        </div>
        <p className="font-mono-label text-[var(--color-muted)]">since jul 2024</p>
      </div>
    </Tile>
  );
}
