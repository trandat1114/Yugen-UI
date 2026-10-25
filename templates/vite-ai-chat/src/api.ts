/**
 * The backend adapter: the chat calls `sendMessage` and nothing else. By default it answers from a local mock;
 * replace its body to use your own endpoint (README: "Connect your backend").
 */
import type { CitationSource, TraceStatus } from "yugen-ui";
import defaultContent from "./content";
import type { MockContent, MockReply } from "./content/types";

export interface Attachment {
  name: string;
  size: number;
  type: string;
  /** The file itself, only for messages sent in this session: files are not saved in localStorage. */
  file?: File;
}

/** A message as the backend sees it. `sendMessage` gets the whole conversation, oldest first. */
export interface ChatMessage {
  role: "user" | "assistant";
  /** Markdown. */
  content: string;
  attachments?: Attachment[];
}

/** One piece of a streamed reply. */
export type ChatChunk =
  /** Markdown appended to the answer. */
  | { type: "text"; text: string }
  /** Text appended to the reasoning, shown above the answer in a collapsible block. */
  | { type: "reasoning"; text: string }
  /** Adds a step to the Trace, or updates the step with the same `id`. */
  | { type: "step"; id: string; title: string; status: TraceStatus }
  /** Sources for `[1]`, `[2]` in the answer. */
  | { type: "sources"; sources: CitationSource[] };

export interface SendOptions {
  /** Aborted when the user presses Stop or Esc. Pass it on to `fetch`. */
  signal: AbortSignal;
}

export type SendMessage = (messages: ChatMessage[], options: SendOptions) => AsyncIterable<ChatChunk>;

const mock = createMockBackend(defaultContent.mock);

/**
 * Returns the assistant's reply to `messages` as an async iterable of chunks. Throw (or let `fetch` throw) to show an
 * error under the message. To use your own backend:
 *
 *   return streamFromEndpoint("/api/chat", messages, options);
 */
export function sendMessage(messages: ChatMessage[], options: SendOptions): AsyncIterable<ChatChunk> {
  return mock(messages, options);
}

/* ================================================================ Your endpoint */

/**
 * POSTs `{ messages }` as JSON and reads the response as newline-delimited JSON: one `ChatChunk` per line. A `data: `
 * prefix (server-sent events) is accepted, `[DONE]` and empty lines are skipped. Keep API keys on that server.
 */
export async function* streamFromEndpoint(url: string, messages: ChatMessage[], { signal }: SendOptions): AsyncIterable<ChatChunk> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // A File is not JSON: upload files separately and send a reference.
    body: JSON.stringify({ messages }, (key, value) => (key === "file" ? undefined : value)),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`${res.status} ${res.statusText}`.trim());

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const chunk = parseLine(line);
      if (chunk) yield chunk;
    }
  }
  const last = parseLine(buffer);
  if (last) yield last;
}

export function parseLine(line: string): ChatChunk | null {
  const text = line.trim().replace(/^data:\s*/, "");
  if (!text || text === "[DONE]") return null;
  return JSON.parse(text) as ChatChunk;
}

/* ================================================================ Local mock */

export interface MockOptions {
  /** Throw after the first step, to check the error state. */
  fail?: boolean;
  /** Multiplies every delay. 0 answers at once (tests). */
  delayScale?: number;
}

/** A backend that streams canned replies from `content.mock` with realistic delays. */
export function createMockBackend(mock: MockContent, { fail = false, delayScale = 1 }: MockOptions = {}): SendMessage {
  return async function* mockReply(messages, { signal }) {
    const question = [...messages].reverse().find((m) => m.role === "user");
    const files = question?.attachments ?? [];
    const reply = pickReply(mock, question?.content ?? "");
    const wait = (ms: number) => sleep(ms * delayScale, signal);

    // Time to first token.
    await wait(600);
    for (const token of tokens(reply.reasoning)) {
      yield { type: "reasoning", text: token };
      await wait(25);
    }

    const steps = [...files.map((f) => mock.readFile(f.name)), ...reply.steps];
    for (const [i, title] of steps.entries()) {
      const id = `step-${i + 1}`;
      yield { type: "step", id, title, status: "running" };
      await wait(450 + 150 * (i % 3));
      if (fail) throw new Error(mock.error);
      yield { type: "step", id, title, status: "success" };
    }

    if (reply.sources) yield { type: "sources", sources: reply.sources };
    const answer = files.length ? reply.answer + mock.attachmentNote(files.map((f) => f.name).join(", ")) : reply.answer;
    for (const token of tokens(answer)) {
      yield { type: "text", text: token };
      await wait(30);
    }
  };
}

/** The first reply with a word that appears in the question, or the fallback. */
export function pickReply(mock: MockContent, question: string): MockReply {
  const q = question.toLowerCase();
  const found = mock.replies.find((r) => r.match.some((word) => q.includes(word)));
  if (found) return found;
  const quote = (question.trim() || "…")
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  return { match: [], reasoning: mock.fallback.reasoning, steps: mock.fallback.steps, answer: mock.fallback.answer(quote) };
}

/** Splits text into two-word pieces that keep their spaces and line breaks, like tokens from a model. */
export function tokens(text: string): string[] {
  const words = text.match(/\s*\S+/g) ?? [];
  const out: string[] = [];
  for (let i = 0; i < words.length; i += 2) out.push(words.slice(i, i + 2).join(""));
  return out;
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(id);
      reject(signal.reason);
    };
    const id = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
