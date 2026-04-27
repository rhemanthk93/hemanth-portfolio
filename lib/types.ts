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
    };

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; blocks: AssistantBlock[] };
