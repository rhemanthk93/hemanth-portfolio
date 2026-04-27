"use client";

import { motion } from "motion/react";

const LABEL: Record<"web_search" | "web_fetch", string> = {
  web_search: "searching the web",
  web_fetch: "reading the article",
};

type Props = {
  tool: "web_search" | "web_fetch";
  status: "running" | "done";
};

export function ToolStatus({ tool, status }: Props) {
  if (status === "done") return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="font-mono-label flex items-center gap-2 py-1 italic text-[var(--color-muted)]"
    >
      <span aria-hidden>↳</span>
      <span>{LABEL[tool]}</span>
      <span className="inline-flex gap-0.5">
        <span className="h-1 w-1 animate-pulse rounded-full bg-[var(--color-muted)]" />
        <span
          className="h-1 w-1 animate-pulse rounded-full bg-[var(--color-muted)]"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1 w-1 animate-pulse rounded-full bg-[var(--color-muted)]"
          style={{ animationDelay: "300ms" }}
        />
      </span>
    </motion.div>
  );
}
