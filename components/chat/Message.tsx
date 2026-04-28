"use client";

import { motion } from "motion/react";
import type { ChatMessage, Citation } from "@/lib/types";
import { ToolStatus } from "./ToolStatus";
import { SourceChips } from "./SourceChips";
import { Markdown } from "./Markdown";

type Props = {
  message: ChatMessage;
  isLast?: boolean;
  isStreaming?: boolean;
};

export function Message({ message, isLast, isStreaming }: Props) {
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[15px] leading-relaxed text-[var(--color-fg)]">
          {message.text}
        </div>
      </motion.div>
    );
  }

  // Assistant
  const allCitations: Citation[] = [];
  for (const b of message.blocks) {
    if (b.type === "text" && b.citations) {
      allCitations.push(...b.citations);
    }
  }

  const showWaiting =
    isLast && isStreaming && message.blocks.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col gap-1"
    >
      <span className="font-mono-label text-[var(--color-muted)]">
        agent
      </span>
      <div className="flex flex-col gap-1 text-[15px] leading-relaxed text-[var(--color-fg)]">
        {showWaiting && (
          <span className="inline-flex gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-muted)]" />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-muted)]"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-muted)]"
              style={{ animationDelay: "300ms" }}
            />
          </span>
        )}
        {message.blocks.map((b, i) => {
          if (b.type === "text") {
            return <Markdown key={i} text={b.text} />;
          }
          if (b.type === "tool") {
            return (
              <ToolStatus key={i} tool={b.tool} status={b.status} />
            );
          }
          if (b.type === "notice") {
            return (
              <span
                key={i}
                role="status"
                className="font-mono-label flex items-start gap-2 py-1 italic text-[var(--color-muted)]"
              >
                <span aria-hidden>↳</span>
                <span>{b.text}</span>
              </span>
            );
          }
          return null;
        })}
      </div>
      <SourceChips citations={allCitations} />
    </motion.div>
  );
}
