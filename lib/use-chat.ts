"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AssistantBlock, ChatMessage } from "./types";

const STORAGE_KEY = "askhemanth.chat.v1";

function nanoid(): string {
  return Math.random().toString(36).slice(2, 11);
}

type ApiMessage = { role: "user" | "assistant"; content: string };

function buildApiMessages(messages: ChatMessage[]): ApiMessage[] {
  return messages
    .map<ApiMessage>((m) =>
      m.role === "user"
        ? { role: "user", content: m.text }
        : {
            role: "assistant",
            content:
              m.blocks
                .filter((b) => b.type === "text")
                .map((b) => (b as { text: string }).text)
                .join("\n")
                .trim() || " ",
          }
    )
    .filter((m) => m.content && m.content.trim());
}

function applyEvent(
  blocks: AssistantBlock[],
  event: Record<string, unknown>
): AssistantBlock[] {
  if (event.type === "content_block_start") {
    const cb = event.content_block as { type: string; name?: string };
    if (cb.type === "text") {
      return [...blocks, { type: "text", text: "", citations: [] }];
    }
    if (cb.type === "server_tool_use") {
      const toolName: "web_search" | "web_fetch" =
        cb.name === "web_fetch" ? "web_fetch" : "web_search";
      return [
        ...blocks,
        { type: "tool", tool: toolName, status: "running" },
      ];
    }
    if (
      cb.type === "web_search_tool_result" ||
      cb.type === "web_fetch_tool_result"
    ) {
      const next = [...blocks];
      for (let i = next.length - 1; i >= 0; i--) {
        const b = next[i];
        if (b.type === "tool" && b.status === "running") {
          next[i] = { ...b, status: "done" };
          break;
        }
      }
      return next;
    }
  }
  if (event.type === "content_block_delta") {
    const delta = event.delta as { type: string; text?: string; citation?: { url: string; title?: string } };
    const next = [...blocks];
    const last = next[next.length - 1];
    if (delta.type === "text_delta" && last?.type === "text" && delta.text != null) {
      next[next.length - 1] = { ...last, text: last.text + delta.text };
      return next;
    }
    if (delta.type === "citations_delta" && last?.type === "text" && delta.citation) {
      next[next.length - 1] = {
        ...last,
        citations: [
          ...(last.citations ?? []),
          { url: delta.citation.url, title: delta.citation.title },
        ],
      };
      return next;
    }
  }
  return blocks;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
      // Clean up the legacy localStorage key from the first deploy so users
      // who chatted before this fix don't carry an orphaned transcript.
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore (quota etc.)
    }
  }, [messages, hydrated]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: nanoid(), role: "user", text: trimmed };
    const asstId = nanoid();
    const asstMsg: ChatMessage = { id: asstId, role: "assistant", blocks: [] };

    const apiMessages = buildApiMessages([...messagesRef.current, userMsg]);
    setMessages((prev) => [...prev, userMsg, asstMsg]);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!res.ok || !res.body) {
        // Try to read structured error first. The chat route returns
        // { error: <code>, message: <human> } for 429 / 503; everything else
        // gets a generic fallback.
        let serverMessage = `HTTP ${res.status}`;
        try {
          const j = (await res.json()) as { error?: string; message?: string };
          if (j.message) serverMessage = j.message;
          else if (j.error) serverMessage = j.error;
        } catch {
          // body wasn't JSON, keep the HTTP code
        }

        if (res.status === 429 || res.status === 503) {
          // Render the rate-limit message as an in-thread notice (mono italic
          // muted) instead of throwing — looks like a tool-status indicator.
          const fallback =
            res.status === 503
              ? "Today's traffic limit reached — try tomorrow."
              : "You've hit the per-visitor limit — please wait an hour.";
          setMessages((prev) => {
            const i = prev.findIndex((m) => m.id === asstId);
            if (i < 0) return prev;
            const next = [...prev];
            next[i] = {
              id: asstId,
              role: "assistant",
              blocks: [
                {
                  type: "notice",
                  tone: "rate-limit",
                  text: serverMessage || fallback,
                },
              ],
            };
            return next;
          });
          return;
        }

        throw new Error(serverMessage);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(payload);
          } catch {
            continue;
          }

          if (event.type === "stream_error") {
            const msg = (event as { message?: string }).message ?? "Upstream error";
            setMessages((prev) => {
              const i = prev.findIndex((m) => m.id === asstId);
              if (i < 0) return prev;
              const next = [...prev];
              next[i] = {
                id: asstId,
                role: "assistant",
                blocks: [
                  {
                    type: "text",
                    text: `Couldn't reach the model — ${msg}`,
                  },
                ],
              };
              return next;
            });
            continue;
          }

          setMessages((prev) => {
            const i = prev.findIndex((m) => m.id === asstId);
            if (i < 0) return prev;
            const m = prev[i];
            if (m.role !== "assistant") return prev;
            const newBlocks = applyEvent(m.blocks, event);
            if (newBlocks === m.blocks) return prev;
            const next = [...prev];
            next[i] = { ...m, blocks: newBlocks };
            return next;
          });
        }
      }
    } catch (err) {
      console.error("chat stream error", err);
      const fallback =
        err instanceof Error && err.message
          ? err.message
          : "Something broke on my end. Try again, or email Hemanth at rhemanthk93@gmail.com.";
      setMessages((prev) => {
        const i = prev.findIndex((m) => m.id === asstId);
        if (i < 0) return prev;
        const next = [...prev];
        next[i] = {
          id: asstId,
          role: "assistant",
          blocks: [{ type: "text", text: fallback }],
        };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { messages, send, isStreaming, hydrated, reset };
}
