"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { Tile } from "./Tile";
import { ChatInput } from "@/components/chat/ChatInput";

export function HeroTile({ index = 0 }: { index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(useTransform(mx, [-1, 1], [-14, 14]), {
    stiffness: 120,
    damping: 18,
    mass: 0.4,
  });
  const y = useSpring(useTransform(my, [-1, 1], [-10, 10]), {
    stiffness: 120,
    damping: 18,
    mass: 0.4,
  });

  const handleMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <Tile index={index} className="md:col-span-8 md:row-span-3" label="hero">
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative flex flex-1 flex-col"
      >
        <div className="relative flex flex-1 flex-col items-start gap-6 px-8 pt-8 pb-6 md:flex-row md:items-center md:justify-between md:px-12 md:pt-14">
          <div className="z-10 flex w-full max-w-[520px] flex-col gap-5">
            <span className="font-mono-label text-[var(--color-muted)]">
              hemanth kumar &middot; singapore
            </span>
            <h1 className="text-display text-[var(--color-fg)]">
              Engineer
              <br />
              building with
              <br />
              <span className="text-[var(--color-accent)]">agents.</span>
            </h1>

            <Avatar
              className="relative aspect-[3/4] h-[220px] self-center md:hidden"
              imageSizes="220px"
              prefersReducedMotion={prefersReducedMotion}
            />

            <p className="max-w-[460px] text-[15px] leading-relaxed text-[var(--color-muted)]">
              Software should work while you sleep.
            </p>
          </div>

          <motion.div
            style={{ x, y }}
            className="pointer-events-none relative hidden aspect-[3/4] h-[360px] shrink-0 md:block lg:h-[420px]"
          >
            <Avatar
              className="relative h-full w-full"
              imageSizes="(min-width: 1024px) 420px, 360px"
              prefersReducedMotion={prefersReducedMotion}
              priority
            />
          </motion.div>
        </div>

        <div className="relative px-8 pb-8 md:px-12 md:pb-12">
          <ChatInput variant="hero" />
          <p className="font-mono-label mt-3 text-[var(--color-muted)]">
            web search on demand
          </p>
        </div>
      </div>
    </Tile>
  );
}

type AvatarProps = {
  className: string;
  imageSizes: string;
  prefersReducedMotion: boolean | null;
  priority?: boolean;
};

function Avatar({
  className,
  imageSizes,
  prefersReducedMotion,
  priority,
}: AvatarProps) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative h-full w-full"
      >
        <Image
          src="/avatars/hemanth-laptop.png"
          alt="Illustration of Hemanth"
          fill
          priority={priority}
          sizes={imageSizes}
          className="object-contain object-bottom"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-2px] bottom-[-2px] h-[44px] w-[120px]"
          style={{
            background:
              "radial-gradient(ellipse at bottom right, var(--color-surface) 35%, rgba(17,16,14,0.85) 60%, transparent 88%)",
          }}
        />
      </motion.div>
    </div>
  );
}
