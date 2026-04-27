"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "What's Hemanth's background?",
  "Show me his projects.",
  "What's he working on now?",
  "How do I get in touch?",
];

type Props = {
  variant?: "hero" | "page";
  autoFocus?: boolean;
  pending?: boolean;
  initialValue?: string;
  onSubmit?: (query: string) => void;
};

export function ChatInput({
  variant = "hero",
  autoFocus = false,
  pending = false,
  initialValue = "",
  onSubmit,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (value) return;
    const id = setInterval(() => {
      setPromptIndex((i) => (i + 1) % PROMPTS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [value]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q || pending) return;
    if (onSubmit) {
      onSubmit(q);
      setValue("");
    } else {
      router.push(`/chat?q=${encodeURIComponent(q)}`);
    }
  };

  const placeholder = PROMPTS[promptIndex];

  return (
    <form
      onSubmit={submit}
      className={cn(
        "relative flex w-full items-center gap-2 rounded-[6px] border border-[var(--color-border)] bg-[#0d0c0a] px-4",
        variant === "hero" ? "h-12" : "h-12"
      )}
    >
      <span aria-hidden className="font-mono-label text-[var(--color-accent)]">
        →
      </span>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Ask anything about Hemanth"
          disabled={pending}
          className="w-full bg-transparent text-[15px] text-[var(--color-fg)] outline-none placeholder:text-transparent disabled:opacity-50"
          autoComplete="off"
        />
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={promptIndex}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="block w-full truncate text-[15px] text-[var(--color-muted)]"
              >
                {placeholder}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!value.trim() || pending}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-[4px] px-3 transition-colors",
          value.trim() && !pending
            ? "bg-[var(--color-accent)] text-[var(--color-bg)] hover:brightness-110"
            : "border border-[var(--color-border)] text-[var(--color-muted)]"
        )}
        aria-label={value.trim() ? "Ask" : "Ask (enter a question first)"}
      >
        <span className="font-mono-label">{pending ? "…" : "Ask"}</span>
      </button>
    </form>
  );
}
