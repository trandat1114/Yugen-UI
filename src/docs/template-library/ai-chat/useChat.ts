import * as React from "react";
import type { SendMessage } from "./api";
import {
  applyChunk,
  finishMessage,
  loadConversations,
  newId,
  saveConversations,
  titleFrom,
  toChatMessages,
  type Conversation,
  type Message,
} from "./conversations";

export interface UseChatOptions {
  send: SendMessage;
  /** Save to localStorage. Off in the docs preview. */
  persist: boolean;
  /** Conversations for the first run (nothing saved yet). */
  seed: () => Conversation[];
  /** Title of a conversation started with neither text nor files. */
  untitled: string;
}

export interface Chat {
  conversations: Conversation[];
  /** Ids of conversations with a reply in progress. */
  streaming: ReadonlySet<string>;
  /** Sends a question; starts a conversation when `id` is null or unknown. Returns the conversation id. */
  send: (id: string | null, text: string, files: File[]) => string;
  stop: (id: string) => void;
  /** Replaces the last answer with a new one. */
  regenerate: (id: string) => void;
  rename: (id: string, title: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

/** Conversations plus the streaming loop: one AbortController per conversation with a reply in progress. */
export function useChat({ send, persist, seed, untitled }: UseChatOptions): Chat {
  const [conversations, setConversations] = React.useState<Conversation[]>(() => (persist ? loadConversations(seed) : seed()));
  const [streaming, setStreaming] = React.useState<ReadonlySet<string>>(() => new Set());
  const controllers = React.useRef(new Map<string, AbortController>());
  /** Files of messages sent in this session, by message id (a File can't be saved). */
  const files = React.useRef(new Map<string, File[]>());
  const sendRef = React.useRef(send);
  const latest = React.useRef(conversations);
  const saveTimer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    sendRef.current = send;
  }, [send]);

  // Save at most every 500 ms while a reply streams, and once more when the page is hidden or the app unmounts.
  React.useEffect(() => {
    latest.current = conversations;
    if (!persist || saveTimer.current !== undefined) return;
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = undefined;
      saveConversations(latest.current);
    }, 500);
  }, [conversations, persist]);

  React.useEffect(() => {
    if (!persist) return;
    const flush = () => {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = undefined;
      saveConversations(latest.current);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [persist]);

  React.useEffect(() => {
    const running = controllers.current;
    return () => running.forEach((c) => c.abort());
  }, []);

  const update = React.useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConversations((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const run = React.useCallback(
    (conversationId: string, history: Message[]) => {
      const answer: Message = { id: newId(), role: "assistant", content: "", createdAt: Date.now(), status: "streaming" };
      const patch = (fn: (m: Message) => Message) =>
        update(conversationId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === answer.id ? fn(m) : m)) }));
      update(conversationId, (c) => ({ ...c, updatedAt: answer.createdAt, messages: [...c.messages, answer] }));

      const controller = new AbortController();
      controllers.current.set(conversationId, controller);
      setStreaming((s) => new Set(s).add(conversationId));

      void (async () => {
        try {
          for await (const chunk of sendRef.current(toChatMessages(history, files.current), { signal: controller.signal })) {
            if (controller.signal.aborted) break;
            patch((m) => applyChunk(m, chunk, Date.now()));
          }
          patch((m) => finishMessage(m, controller.signal.aborted ? "stopped" : "done", Date.now()));
        } catch (error) {
          patch((m) =>
            controller.signal.aborted
              ? finishMessage(m, "stopped", Date.now())
              : finishMessage(m, "error", Date.now(), error instanceof Error ? error.message : String(error)),
          );
        } finally {
          if (controllers.current.get(conversationId) === controller) controllers.current.delete(conversationId);
          setStreaming((s) => {
            const next = new Set(s);
            next.delete(conversationId);
            return next;
          });
        }
      })();
    },
    [update],
  );

  const sendQuestion = (id: string | null, text: string, attached: File[]) => {
    const now = Date.now();
    const question: Message = {
      id: newId(),
      role: "user",
      content: text,
      createdAt: now,
      attachments: attached.length ? attached.map((f) => ({ name: f.name, size: f.size, type: f.type })) : undefined,
    };
    if (attached.length) files.current.set(question.id, attached);

    const existing = id ? conversations.find((c) => c.id === id) : undefined;
    const conversationId = existing?.id ?? newId();
    if (existing) {
      update(conversationId, (c) => ({ ...c, updatedAt: now, messages: [...c.messages, question] }));
    } else {
      const title = titleFrom(text, attached, untitled);
      setConversations((list) => [{ id: conversationId, title, createdAt: now, updatedAt: now, messages: [question] }, ...list]);
    }
    run(conversationId, [...(existing?.messages ?? []), question]);
    return conversationId;
  };

  const stop = (id: string) => controllers.current.get(id)?.abort();

  const regenerate = (id: string) => {
    const c = conversations.find((x) => x.id === id);
    if (!c || controllers.current.has(id)) return;
    const last = c.messages.length - 1;
    if (last < 0 || c.messages[last].role !== "assistant") return;
    const history = c.messages.slice(0, last);
    update(id, (x) => ({ ...x, messages: history }));
    run(id, history);
  };

  const rename = (id: string, title: string) => {
    const clean = title.replace(/\s+/g, " ").trim();
    if (clean) update(id, (c) => ({ ...c, title: clean }));
  };

  const remove = (id: string) => {
    controllers.current.get(id)?.abort();
    setConversations((list) => list.filter((c) => c.id !== id));
  };

  const clear = () => {
    controllers.current.forEach((c) => c.abort());
    files.current.clear();
    setConversations([]);
  };

  return { conversations, streaming, send: sendQuestion, stop, regenerate, rename, remove, clear };
}
