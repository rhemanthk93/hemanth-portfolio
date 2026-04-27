"use client";

import { Fragment, type ReactNode } from "react";

const BOLD = /\*\*(.+?)\*\*/g;
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const INLINE_CODE = /`([^`]+)`/g;

type Token =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; text: string; href: string }
  | { type: "code"; value: string };

function tokenize(text: string): Token[] {
  type Hit = { idx: number; len: number; token: Token };
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    BOLD.lastIndex = i;
    LINK.lastIndex = i;
    INLINE_CODE.lastIndex = i;
    const m1 = BOLD.exec(text);
    const m2 = LINK.exec(text);
    const m3 = INLINE_CODE.exec(text);
    const candidates: Hit[] = [];
    if (m1) candidates.push({ idx: m1.index, len: m1[0].length, token: { type: "bold", value: m1[1] } });
    if (m2) candidates.push({ idx: m2.index, len: m2[0].length, token: { type: "link", text: m2[1], href: m2[2] } });
    if (m3) candidates.push({ idx: m3.index, len: m3[0].length, token: { type: "code", value: m3[1] } });
    if (candidates.length === 0) {
      tokens.push({ type: "text", value: text.slice(i) });
      break;
    }
    candidates.sort((a, b) => a.idx - b.idx);
    const next = candidates[0];
    if (next.idx > i) tokens.push({ type: "text", value: text.slice(i, next.idx) });
    tokens.push(next.token);
    i = next.idx + next.len;
  }
  return tokens;
}

export function Inline({ text }: { text: string }) {
  return <>{renderInline(text, "i")}</>;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return tokenize(text).map((t, i) => {
    const k = `${keyPrefix}-${i}`;
    if (t.type === "text") return <Fragment key={k}>{t.value}</Fragment>;
    if (t.type === "bold")
      return (
        <strong key={k} className="font-medium text-[var(--color-fg)]">
          {t.value}
        </strong>
      );
    if (t.type === "code")
      return (
        <code
          key={k}
          className="font-mono rounded-[3px] bg-[#1a1816] px-1 py-0.5 text-[13px] text-[var(--color-fg)]"
        >
          {t.value}
        </code>
      );
    return (
      <a
        key={k}
        href={t.href}
        target="_blank"
        rel="noreferrer"
        className="underline decoration-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
      >
        {t.text}
      </a>
    );
  });
}

type Variant = "chat" | "prose";

type Run =
  | { kind: "para"; lines: string[] }
  | { kind: "list"; items: { text: string; depth: number }[] }
  | { kind: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { kind: "code"; lang: string; body: string }
  | { kind: "rule" };

function parseRuns(text: string): Run[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const runs: Run[] = [];
  let inFence = false;
  let fenceLang = "";
  let fenceLines: string[] = [];

  for (const line of lines) {
    if (inFence) {
      if (/^```/.test(line)) {
        runs.push({ kind: "code", lang: fenceLang, body: fenceLines.join("\n") });
        inFence = false;
        fenceLines = [];
        fenceLang = "";
      } else {
        fenceLines.push(line);
      }
      continue;
    }
    const fenceOpen = /^```(\w*)\s*$/.exec(line);
    if (fenceOpen) {
      inFence = true;
      fenceLang = fenceOpen[1] ?? "";
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      runs.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text: heading[2].trim(),
      });
      continue;
    }
    if (/^\s*[-*_]{3,}\s*$/.test(line)) {
      runs.push({ kind: "rule" });
      continue;
    }
    const bullet = /^(\s*)[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      const depth = Math.min(2, Math.floor(bullet[1].length / 2));
      const last = runs[runs.length - 1];
      if (last && last.kind === "list") {
        last.items.push({ text: bullet[2], depth });
      } else {
        runs.push({ kind: "list", items: [{ text: bullet[2], depth }] });
      }
      continue;
    }
    if (line.trim() === "") {
      const last = runs[runs.length - 1];
      if (last && last.kind === "para") {
        last.lines.push("");
      } else {
        runs.push({ kind: "para", lines: [""] });
      }
      continue;
    }
    const last = runs[runs.length - 1];
    if (last && last.kind === "para") {
      last.lines.push(line);
    } else {
      runs.push({ kind: "para", lines: [line] });
    }
  }
  return runs;
}

const HEADING_CLASSES: Record<1 | 2 | 3 | 4, { chat: string; prose: string }> = {
  1: {
    chat: "text-[20px] font-medium tracking-tight",
    prose: "text-[28px] font-medium tracking-tight mt-8 mb-3",
  },
  2: {
    chat: "text-[18px] font-medium tracking-tight",
    prose: "text-[22px] font-medium tracking-tight mt-10 mb-2",
  },
  3: {
    chat: "text-[16px] font-medium tracking-tight",
    prose: "text-[18px] font-medium tracking-tight mt-8 mb-2",
  },
  4: {
    chat: "text-[15px] font-medium tracking-tight",
    prose: "text-[16px] font-medium tracking-tight mt-6 mb-1",
  },
};

export function Markdown({
  text,
  variant = "chat",
}: {
  text: string;
  variant?: Variant;
}) {
  const runs = parseRuns(text);

  return (
    <div
      className={
        variant === "prose"
          ? "flex flex-col text-[15.5px] leading-[1.7] text-[var(--color-fg)]"
          : "flex flex-col gap-3"
      }
    >
      {runs.map((run, ri) => {
        if (run.kind === "heading") {
          const cls = HEADING_CLASSES[run.level][variant];
          if (run.level === 1)
            return (
              <h1 key={ri} className={`${cls} text-[var(--color-fg)]`}>
                {renderInline(run.text, `h-${ri}`)}
              </h1>
            );
          if (run.level === 2)
            return (
              <h2 key={ri} className={`${cls} text-[var(--color-fg)]`}>
                {renderInline(run.text, `h-${ri}`)}
              </h2>
            );
          if (run.level === 3)
            return (
              <h3 key={ri} className={`${cls} text-[var(--color-fg)]`}>
                {renderInline(run.text, `h-${ri}`)}
              </h3>
            );
          return (
            <h4 key={ri} className={`${cls} text-[var(--color-fg)]`}>
              {renderInline(run.text, `h-${ri}`)}
            </h4>
          );
        }
        if (run.kind === "rule") {
          return (
            <hr
              key={ri}
              className="my-6 border-t border-[var(--color-border)]"
            />
          );
        }
        if (run.kind === "code") {
          return (
            <pre
              key={ri}
              className="my-3 overflow-x-auto rounded-[6px] border border-[var(--color-border)] bg-[#0d0c0a] p-4 text-[13px] leading-relaxed"
            >
              <code className="font-mono text-[var(--color-fg)]">
                {run.body}
              </code>
            </pre>
          );
        }
        if (run.kind === "list") {
          return (
            <ul
              key={ri}
              className={
                variant === "prose"
                  ? "my-2 flex flex-col gap-1.5"
                  : "flex flex-col gap-1.5 pl-1"
              }
            >
              {run.items.map((it, ii) => (
                <li
                  key={ii}
                  className="flex gap-2"
                  style={{ paddingLeft: `${it.depth * 16}px` }}
                >
                  <span
                    aria-hidden
                    className="mt-[10px] h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--color-muted)]"
                  />
                  <span>{renderInline(it.text, `${ri}-${ii}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        const paragraphs: string[][] = [[]];
        for (const l of run.lines) {
          if (l.trim() === "") {
            if (paragraphs[paragraphs.length - 1].length > 0) paragraphs.push([]);
          } else {
            paragraphs[paragraphs.length - 1].push(l);
          }
        }
        return (
          <Fragment key={ri}>
            {paragraphs
              .filter((p) => p.length > 0)
              .map((para, pi) => (
                <p
                  key={pi}
                  className={
                    variant === "prose"
                      ? "my-2 whitespace-pre-wrap"
                      : "whitespace-pre-wrap"
                  }
                >
                  {renderInline(para.join("\n"), `${ri}-${pi}`)}
                </p>
              ))}
          </Fragment>
        );
      })}
    </div>
  );
}
