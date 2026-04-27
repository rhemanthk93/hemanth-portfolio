"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { Message } from "./Message";

type Props = {
  messages: ChatMessage[];
  isStreaming?: boolean;
};

export function ChatThread({ messages, isStreaming }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md text-center">
          <p className="font-mono-label mb-3 text-[var(--color-muted)]">
            ask anything about hemanth
          </p>
          <p className="text-[15px] leading-relaxed text-[var(--color-muted)]">
            background, projects, skills, current focus, how to get in touch.
            Web search is available for time-sensitive things.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      {messages.map((m, i) => (
        <Message
          key={m.id}
          message={m}
          isLast={i === messages.length - 1}
          isStreaming={isStreaming}
        />
      ))}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
