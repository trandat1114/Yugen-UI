import { describe, expect, it, vi } from "vitest";
import { createMockBackend, parseLine, pickReply, streamFromEndpoint, tokens, type ChatChunk, type ChatMessage } from "./api";
import en from "./content/en";
import vi_ from "./content/vi";
import {
  applyChunk,
  finishMessage,
  groupConversations,
  restore,
  seedConversations,
  titleFrom,
  toChatMessages,
  type Conversation,
  type Message,
} from "./conversations";
import { parsePath, pathOf } from "./router";

async function collect(stream: AsyncIterable<ChatChunk>) {
  const out: ChatChunk[] = [];
  for await (const chunk of stream) out.push(chunk);
  return out;
}

const ask = (content: string): ChatMessage[] => [{ role: "user", content }];

describe("ai-chat api", () => {
  it("tokens: two-word pieces that join back into the text", () => {
    const text = "Hello there, world.\n\n```ts\n  const a = 1;\n```";
    const parts = tokens(text);
    expect(parts[0]).toBe("Hello there,");
    expect(parts.join("")).toBe(text);
  });

  it("pickReply: by keyword in either language, otherwise the fallback quoting the question", () => {
    expect(pickReply(en.mock, "Plan a trip to KYOTO").answer).toBe(en.mock.replies[0].answer);
    expect(pickReply(vi_.mock, "Viết email nhắc thanh toán hoá đơn").answer).toBe(vi_.mock.replies[2].answer);
    expect(pickReply(en.mock, "line one\nline two").answer).toContain("> line one\n> line two");
  });

  it("mock: reasoning, then steps, then sources, then text that rebuilds the answer", async () => {
    const chunks = await collect(createMockBackend(en.mock, { delayScale: 0 })(ask("Kyoto?"), { signal: new AbortController().signal }));
    const order = [...new Set(chunks.map((c) => c.type))];
    expect(order).toEqual(["reasoning", "step", "sources", "text"]);
    const text = chunks.flatMap((c) => (c.type === "text" ? [c.text] : [])).join("");
    expect(text).toBe(en.mock.replies[0].answer);
    const steps = chunks.filter((c) => c.type === "step");
    expect(steps).toHaveLength(en.mock.replies[0].steps.length * 2);
  });

  it("mock: a step per attachment and a note in the answer", async () => {
    const messages: ChatMessage[] = [{ role: "user", content: "Kyoto", attachments: [{ name: "plan.pdf", size: 10, type: "application/pdf" }] }];
    const chunks = await collect(createMockBackend(en.mock, { delayScale: 0 })(messages, { signal: new AbortController().signal }));
    expect(chunks.find((c) => c.type === "step")).toMatchObject({ title: "Read plan.pdf", status: "running" });
    expect(chunks.flatMap((c) => (c.type === "text" ? [c.text] : [])).join("")).toContain("plan.pdf");
  });

  it("mock: abort rejects with AbortError; fail throws the error message", async () => {
    const controller = new AbortController();
    const stream = createMockBackend(en.mock, { delayScale: 0 })(ask("hi"), { signal: controller.signal });
    controller.abort();
    await expect(collect(stream)).rejects.toMatchObject({ name: "AbortError" });

    const failing = createMockBackend(en.mock, { fail: true, delayScale: 0 })(ask("hi"), { signal: new AbortController().signal });
    await expect(collect(failing)).rejects.toThrow(en.mock.error);
  });

  it("parseLine: JSON lines, SSE data: prefix, [DONE] and blanks skipped", () => {
    expect(parseLine('{"type":"text","text":"a"}')).toEqual({ type: "text", text: "a" });
    expect(parseLine('data: {"type":"text","text":"b"}')).toEqual({ type: "text", text: "b" });
    expect(parseLine("data: [DONE]")).toBeNull();
    expect(parseLine("   ")).toBeNull();
  });

  it("streamFromEndpoint: reads chunks split across network reads, sends messages without File", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(encoder.encode('{"type":"text","text":"Hel'));
        c.enqueue(encoder.encode('lo"}\n{"type":"text","text":" world"}'));
        c.close();
      },
    });
    const fetchMock = vi.fn(async () => new Response(body, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["x"], "a.txt", { type: "text/plain" });
    const messages: ChatMessage[] = [{ role: "user", content: "hi", attachments: [{ name: "a.txt", size: 1, type: "text/plain", file }] }];
    const chunks = await collect(streamFromEndpoint("/api/chat", messages, { signal: new AbortController().signal }));
    expect(chunks).toEqual([
      { type: "text", text: "Hello" },
      { type: "text", text: " world" },
    ]);
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(JSON.parse(init.body as string)).toEqual({ messages: [{ role: "user", content: "hi", attachments: [{ name: "a.txt", size: 1, type: "text/plain" }] }] });
    vi.unstubAllGlobals();
  });

  it("streamFromEndpoint: HTTP errors throw", async () => {
    vi.stubGlobal("fetch", async () => new Response("nope", { status: 500, statusText: "Server Error" }));
    await expect(collect(streamFromEndpoint("/api/chat", [], { signal: new AbortController().signal }))).rejects.toThrow("500 Server Error");
    vi.unstubAllGlobals();
  });
});

describe("ai-chat conversations", () => {
  const empty: Message = { id: "a", role: "assistant", content: "", createdAt: 0, status: "streaming" };

  it("applyChunk: reasoning time ends at the first step; step durations; text appends", () => {
    let m = applyChunk(empty, { type: "reasoning", text: "Think" }, 100);
    m = applyChunk(m, { type: "reasoning", text: " more" }, 150);
    expect(m).toMatchObject({ reasoning: "Think more", reasoningStartedAt: 100 });
    m = applyChunk(m, { type: "step", id: "1", title: "Search", status: "running" }, 400);
    expect(m.reasoningMs).toBe(300);
    m = applyChunk(m, { type: "step", id: "1", title: "Search", status: "success" }, 900);
    expect(m.steps).toEqual([{ id: "1", title: "Search", status: "success", startedAt: 400, duration: 500 }]);
    m = applyChunk(m, { type: "text", text: "Hi" }, 1000);
    m = applyChunk(m, { type: "text", text: " there" }, 1010);
    expect(m.content).toBe("Hi there");
    expect(m.reasoningMs).toBe(300);
  });

  it("finishMessage: open steps succeed when done, are cancelled when stopped, fail on error", () => {
    const m = applyChunk(
      applyChunk(empty, { type: "step", id: "1", title: "A", status: "running" }, 0),
      { type: "step", id: "2", title: "B", status: "pending" },
      0,
    );
    expect(finishMessage(m, "done", 10).steps?.map((s) => s.status)).toEqual(["success", "success"]);
    expect(finishMessage(m, "stopped", 10).steps?.map((s) => s.status)).toEqual(["cancelled", "cancelled"]);
    const failed = finishMessage(m, "error", 10, "boom");
    expect(failed).toMatchObject({ status: "error", error: "boom" });
    expect(failed.steps?.map((s) => s.status)).toEqual(["error", "cancelled"]);
  });

  it("toChatMessages: drops failed and empty answers, adds live files", () => {
    const file = new File(["x"], "a.txt");
    const messages: Message[] = [
      { id: "q", role: "user", content: "hi", createdAt: 0, attachments: [{ name: "a.txt", size: 1, type: "" }] },
      { id: "e", role: "assistant", content: "", createdAt: 0, status: "error", error: "x" },
      { id: "ok", role: "assistant", content: "hello", createdAt: 0, status: "stopped" },
    ];
    expect(toChatMessages(messages, new Map([["q", [file]]]))).toEqual([
      { role: "user", content: "hi", attachments: [{ name: "a.txt", size: 1, type: "", file }] },
      { role: "assistant", content: "hello" },
    ]);
  });

  it("titleFrom: first line, shortened; file name; fallback", () => {
    expect(titleFrom("\n  Plan   a trip \nmore", [], "New chat")).toBe("Plan a trip");
    expect(titleFrom("", [{ name: "report.pdf" }], "New chat")).toBe("report.pdf");
    expect(titleFrom("", [], "New chat")).toBe("New chat");
    expect(titleFrom("x".repeat(80), [], "")).toHaveLength(48);
  });

  it("groupConversations: today, previous 7 days, older; newest first; empty groups left out", () => {
    const now = new Date(2026, 4, 20, 15).getTime();
    const c = (id: string, updatedAt: number): Conversation => ({ id, title: id, createdAt: updatedAt, updatedAt, messages: [] });
    const groups = groupConversations([c("old", now - 30 * 86_400_000), c("today", now - 3_600_000), c("now", now), c("week", now - 2 * 86_400_000)], now);
    expect(groups.map((g) => [g.key, g.items.map((i) => i.id)])).toEqual([
      ["today", ["now", "today"]],
      ["week", ["week"]],
      ["older", ["old"]],
    ]);
    expect(groupConversations([c("now", now)], now).map((g) => g.key)).toEqual(["today"]);
  });

  it("seed and restore: seeds use the mock replies; a reply streaming at reload is stopped", () => {
    const seeds = seedConversations(en, 1_000_000_000);
    expect(seeds).toHaveLength(en.seed.length);
    expect(seeds[0].messages[1]).toMatchObject({ role: "assistant", status: "done", content: en.mock.replies[en.seed[0].reply].answer });
    const saved: Conversation[] = [{ ...seeds[0], messages: [{ ...empty, content: "Half", reasoning: "r", reasoningStartedAt: 0 }] }];
    expect(restore(saved, 50)[0].messages[0]).toMatchObject({ status: "stopped", content: "Half", reasoningMs: 50 });
  });
});

describe("ai-chat router", () => {
  it("parsePath / pathOf round trip", () => {
    expect(parsePath("/")).toEqual({ name: "new" });
    expect(parsePath("/settings/")).toEqual({ name: "settings" });
    expect(parsePath("/c/abc123")).toEqual({ name: "chat", id: "abc123" });
    expect(parsePath("/c/")).toEqual({ name: "notFound" });
    expect(parsePath("/c/a/b")).toEqual({ name: "notFound" });
    expect(parsePath("/nope")).toEqual({ name: "notFound" });
    expect(parsePath(pathOf({ name: "chat", id: "a b" }))).toEqual({ name: "chat", id: "a b" });
  });
});
