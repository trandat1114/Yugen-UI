/** Conversations: types, localStorage, and pure functions that turn streamed chunks into a message. */
import type { CitationSource, TraceStatus } from "@/components/ui";
import type { Attachment, ChatChunk, ChatMessage } from "./api";
import type { Content } from "./content/types";

export type MessageStatus = "streaming" | "done" | "stopped" | "error";

export interface Step {
  id: string;
  title: string;
  status: TraceStatus;
  startedAt?: number;
  /** ms, set when the step finishes. */
  duration?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  /** Markdown for answers, plain text for questions. */
  content: string;
  createdAt: number;
  /** Saved without the File itself. */
  attachments?: Omit<Attachment, "file">[];
  reasoning?: string;
  reasoningStartedAt?: number;
  /** How long the reasoning took (ms), set when the first step or text arrives. */
  reasoningMs?: number;
  steps?: Step[];
  sources?: CitationSource[];
  /** Answers only. */
  status?: MessageStatus;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

/** localStorage key for conversations (theme and brand use `yugen-ai-chat-appearance`). */
export const CONVERSATIONS_KEY = "yugen-ai-chat-conversations";

export const newId = () => Math.random().toString(36).slice(2, 10);

const FINISHED: TraceStatus[] = ["success", "error", "skipped", "cancelled"];

/** Ends the reasoning timer once the model moves on to steps or text. */
function endReasoning(m: Message, now: number): Message {
  if (m.reasoning === undefined || m.reasoningMs !== undefined) return m;
  return { ...m, reasoningMs: now - (m.reasoningStartedAt ?? now) };
}

/** Adds one streamed chunk to an answer. */
export function applyChunk(m: Message, chunk: ChatChunk, now: number): Message {
  switch (chunk.type) {
    case "reasoning":
      return { ...m, reasoning: (m.reasoning ?? "") + chunk.text, reasoningStartedAt: m.reasoningStartedAt ?? now };
    case "text":
      return { ...endReasoning(m, now), content: m.content + chunk.text };
    case "sources":
      return { ...m, sources: chunk.sources };
    case "step": {
      const next = endReasoning(m, now);
      const steps = next.steps ?? [];
      const old = steps.find((s) => s.id === chunk.id);
      const startedAt = old?.startedAt ?? (chunk.status === "pending" ? undefined : now);
      const step: Step = {
        id: chunk.id,
        title: chunk.title,
        status: chunk.status,
        startedAt,
        duration: FINISHED.includes(chunk.status) && startedAt !== undefined ? now - startedAt : undefined,
      };
      return { ...next, steps: old ? steps.map((s) => (s.id === chunk.id ? step : s)) : [...steps, step] };
    }
  }
}

/** Marks an answer finished: open steps succeed, are cancelled (stopped) or fail with it (error). */
export function finishMessage(m: Message, status: Exclude<MessageStatus, "streaming">, now: number, error?: string): Message {
  const close = (s: Step): Step => {
    if (FINISHED.includes(s.status)) return s;
    const next: TraceStatus = status === "done" ? "success" : status === "error" && s.status === "running" ? "error" : "cancelled";
    return { ...s, status: next, duration: s.startedAt !== undefined ? now - s.startedAt : undefined };
  };
  return { ...endReasoning(m, now), status, error, steps: m.steps?.map(close) };
}

/** What the backend gets: questions and finished answers, oldest first. */
export function toChatMessages(messages: Message[], files?: ReadonlyMap<string, File[]>): ChatMessage[] {
  return messages
    .filter((m) => m.role === "user" || (m.status !== "error" && m.content.trim() !== ""))
    .map((m) => {
      const live = files?.get(m.id);
      const attachments = m.attachments?.map((a, i) => (live?.[i] ? { ...a, file: live[i] } : a));
      return attachments?.length ? { role: m.role, content: m.content, attachments } : { role: m.role, content: m.content };
    });
}

/** First line of the question, shortened; the first file name when there is no text. */
export function titleFrom(text: string, files: { name: string }[], fallback: string) {
  const line = text.split("\n").find((l) => l.trim())?.replace(/\s+/g, " ").trim() ?? "";
  const title = line || files[0]?.name || fallback;
  return title.length > 48 ? `${title.slice(0, 47).trimEnd()}…` : title;
}

/** Groups for the sidebar, newest first: today, the 7 days before, older. Empty groups are left out. */
export function groupConversations(list: Conversation[], now: number) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const today = start.getTime();
  const week = today - 7 * 86_400_000;
  const sorted = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups = [
    { key: "today" as const, items: sorted.filter((c) => c.updatedAt >= today) },
    { key: "week" as const, items: sorted.filter((c) => c.updatedAt < today && c.updatedAt >= week) },
    { key: "older" as const, items: sorted.filter((c) => c.updatedAt < week) },
  ];
  return groups.filter((g) => g.items.length > 0);
}

/** Conversations shown on first run, built from the mock's canned replies. */
export function seedConversations(t: Content, now: number): Conversation[] {
  return t.seed.map((s, i) => {
    const reply = t.mock.replies[s.reply];
    const at = now - s.hoursAgo * 3_600_000;
    const answer: Message = {
      id: `seed-${i + 1}-a`,
      role: "assistant",
      content: reply.answer,
      createdAt: at + 1000,
      reasoning: reply.reasoning,
      reasoningMs: 2400 + i * 700,
      steps: reply.steps.map((title, k) => ({ id: `step-${k + 1}`, title, status: "success", duration: 600 + k * 250 })),
      sources: reply.sources,
      status: "done",
    };
    return {
      id: `seed-${i + 1}`,
      title: s.title,
      createdAt: at,
      updatedAt: at,
      messages: [{ id: `seed-${i + 1}-q`, role: "user", content: s.prompt, createdAt: at }, answer],
    };
  });
}

/** Saved data from a reload: a reply that was streaming when the page closed is marked stopped. */
export function restore(list: Conversation[], now: number): Conversation[] {
  return list.map((c) =>
    c.messages.some((m) => m.status === "streaming")
      ? { ...c, messages: c.messages.map((m) => (m.status === "streaming" ? finishMessage(m, "stopped", now) : m)) }
      : c,
  );
}

export function loadConversations(seed: () => Conversation[]): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (raw === null) return seed();
    const data = JSON.parse(raw) as { conversations?: Conversation[] };
    return Array.isArray(data.conversations) ? restore(data.conversations, Date.now()) : seed();
  } catch {
    return seed();
  }
}

export function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify({ version: 1, conversations }));
  } catch {
    /* storage full or blocked */
  }
}
