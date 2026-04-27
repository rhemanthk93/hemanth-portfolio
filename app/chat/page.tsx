"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/chrome/Wordmark";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatThread } from "@/components/chat/ChatThread";
import { useChat } from "@/lib/use-chat";
import type { ChatMessage } from "@/lib/types";

const SUGGESTED = [
  "What's Hemanth's background?",
  "Show me his projects.",
  "What's he working on now?",
  "How do I get in touch?",
];

function ChatPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { messages, send, isStreaming, hydrated, reset } = useChat();
  const submittedRef = useRef<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const q = params.get("q");
    if (!q || submittedRef.current === q) return;
    submittedRef.current = q;
    send(q);
    router.replace("/chat", { scroll: false });
  }, [hydrated, params, router, send]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 md:px-8">
        <div className="flex items-center gap-4">
          <Wordmark />
          <Link
            href="/"
            className="font-mono-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            ← home
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={reset}
            disabled={messages.length === 0 || isStreaming}
            className="font-mono-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-30"
          >
            new chat
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="font-mono-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)] md:hidden"
            aria-label="Suggested questions"
          >
            suggested
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-r border-[var(--color-border)] p-6 md:block">
          <Sidebar
            messages={messages}
            onPick={send}
            streaming={isStreaming}
          />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-black/60"
              aria-label="Close suggested"
            />
            <aside className="relative ml-auto h-full w-[280px] max-w-[80vw] border-l border-[var(--color-border)] bg-[var(--color-bg)] p-6">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="font-mono-label mb-6 text-[var(--color-muted)]"
              >
                close ×
              </button>
              <Sidebar
                messages={messages}
                onPick={(q) => {
                  setSidebarOpen(false);
                  send(q);
                }}
                streaming={isStreaming}
              />
            </aside>
          </div>
        )}

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 pt-6 md:px-10">
            <div className="mx-auto max-w-3xl">
              <ChatThread messages={messages} isStreaming={isStreaming} />
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 md:px-10">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                variant="page"
                autoFocus
                pending={isStreaming}
                onSubmit={send}
              />
              <p className="font-mono-label mt-2 text-[var(--color-muted)]">
                web search on demand
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  messages,
  onPick,
  streaming,
}: {
  messages: ChatMessage[];
  onPick: (q: string) => void;
  streaming: boolean;
}) {
  const recent = messages
    .filter((m): m is Extract<ChatMessage, { role: "user" }> => m.role === "user")
    .slice(-5)
    .reverse();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono-label mb-3 text-[var(--color-muted)]">
          suggested
        </p>
        <ul className="flex flex-col gap-2">
          {SUGGESTED.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => onPick(q)}
                disabled={streaming}
                className="block w-full rounded-[4px] border border-[var(--color-border)] px-3 py-2 text-left text-[14px] text-[var(--color-fg)] transition-colors hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface)] disabled:opacity-40"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {recent.length > 0 && (
        <div>
          <p className="font-mono-label mb-3 text-[var(--color-muted)]">
            recent topics
          </p>
          <ul className="flex flex-col gap-1.5 text-[13px]">
            {recent.map((m) => (
              <li
                key={m.id}
                className="truncate text-[var(--color-muted)]"
                title={m.text}
              >
                {m.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}
