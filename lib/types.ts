export type Citation = {
  url: string;
  title?: string;
};

export type AssistantBlock =
  | { type: "text"; text: string; citations?: Citation[] }
  | {
      type: "tool";
      tool: "web_search" | "web_fetch";
      status: "running" | "done";
      query?: string;
    }
  | {
      // System-side message rendered inside the assistant turn — used for
      // rate-limit notices, upstream errors, etc. Styled like ToolStatus
      // (mono italic muted) so it visually reads as "the system telling you
      // something" rather than as an answer from the agent.
      type: "notice";
      tone: "rate-limit" | "error";
      text: string;
    };

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; blocks: AssistantBlock[] };
