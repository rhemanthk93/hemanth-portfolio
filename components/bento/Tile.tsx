import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  index?: number;
  label?: string;
};

export function Tile({ children, className, index = 0, label }: Props) {
  return (
    <div
      data-tile={label}
      style={{ animationDelay: `${index * 50}ms` }}
      className={cn(
        "tile-enter group relative flex flex-col overflow-hidden rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)]",
        "transition-colors duration-300 hover:border-[var(--color-border-hover)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TileLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono-label text-[var(--color-muted)]">{children}</span>
  );
}
