import { useEffect, useRef, useState, type ReactElement } from "react";
import { Attach20Regular, Dismiss20Regular, Sparkle20Filled } from "@fluentui/react-icons";
import {
  Button,
  ChatComposer,
  MessageBubble,
  MessageScroller,
  Trace,
  TraceStep,
  type TraceStatus,
} from "@/components/ui";

export const meta = {
  title: "Trợ lý AI",
  description: "MessageScroller, ChatComposer và Trace hiển thị từng bước agent đang làm",
  order: 12,
};

interface Step {
  title: string;
  status: TraceStatus;
  duration?: number;
}

interface Turn {
  id: number;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
  steps?: Step[];
}

const ASSISTANT = "Trợ lý Sakura";
const PLAN = ["Đọc lịch 4 thành viên", "Tìm khung giờ trống", "Soạn lời mời họp"];
const ANSWER = "Thứ Năm 14:00–15:00 cả nhóm đều rảnh. Mình đã soạn sẵn lời mời — bạn chỉ cần xem lại và bấm Gửi.";
const SUGGESTIONS = ["Xếp lịch họp nhóm tuần này", "Tóm tắt email chưa đọc"];

export default function AiAssistantBlock() {
  const [turns, setTurns] = useState<Turn[]>([
    { id: 1, role: "assistant", text: "Xin chào! Mình có thể xếp lịch, tóm tắt email hoặc tra tài liệu giúp bạn." },
  ]);
  const [busy, setBusy] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const patch = (id: number, fn: (turn: Turn) => Turn) => setTurns((list) => list.map((t) => (t.id === id ? fn(t) : t)));

  const setStep = (id: number, index: number, step: Partial<Step>) =>
    patch(id, (t) => ({ ...t, steps: t.steps?.map((s, i) => (i === index ? { ...s, ...step } : s)) }));

  function ask(question: string) {
    const id = Date.now();
    setBusy(true);
    setTurns((list) => [
      ...list,
      { id: id - 1, role: "user", text: question },
      { id, role: "assistant", text: "", steps: PLAN.map((title) => ({ title, status: "pending" })) },
    ]);

    PLAN.forEach((_, i) => {
      later(() => setStep(id, i, { status: "running" }), i * 900 + 150);
      later(() => setStep(id, i, { status: "success", duration: 750 + i * 120 }), i * 900 + 900);
    });

    const words = ANSWER.split(" ");
    const begin = PLAN.length * 900 + 250;
    words.forEach((_, i) =>
      later(
        () => patch(id, (t) => ({ ...t, text: words.slice(0, i + 1).join(" "), streaming: i < words.length - 1 })),
        begin + i * 60,
      ),
    );
    later(() => setBusy(false), begin + words.length * 60);
  }

  function stop() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setBusy(false);
    setTurns((list) =>
      list.map((t) =>
        t.role === "assistant" && (t.streaming || t.steps?.some((s) => s.status !== "success"))
          ? {
              ...t,
              streaming: false,
              text: t.text ? `${t.text} (đã dừng)` : "Đã dừng theo yêu cầu.",
              steps: t.steps?.map((s) => (s.status === "success" ? s : { ...s, status: "cancelled" })),
            }
          : t,
      ),
    );
  }

  return (
    <section
      aria-label={ASSISTANT}
      className="flex h-140 w-full max-w-lg flex-col overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 shadow-4"
    >
      <header className="flex items-center gap-S border-b border-stroke-2 px-L py-M">
        <Sparkle20Filled className="shrink-0 text-brand-foreground-1" />
        <div className="min-w-0 flex-1">
          <h3 className="text-subtitle2 font-semibold">{ASSISTANT}</h3>
          <p className="truncate text-caption1 text-foreground-3">AI có thể nhầm — hãy kiểm tra thông tin quan trọng.</p>
        </div>
        <Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Đóng trợ lý" />
      </header>

      <MessageScroller className="flex-1" label="Hội thoại với trợ lý">
        {turns.flatMap((t) => {
          if (t.role === "user") {
            return [
              <MessageBubble key={t.id} side="outgoing" author="Bạn">
                {t.text}
              </MessageBubble>,
            ];
          }
          const parts: ReactElement[] = [];
          if (t.steps) {
            parts.push(
              <MessageBubble key={`${t.id}-trace`} author={ASSISTANT} appearance="plain">
                <Trace size="small" title="Các bước đã làm">
                  {t.steps.map((s) => (
                    <TraceStep key={s.title} title={s.title} status={s.status} duration={s.duration} />
                  ))}
                </Trace>
              </MessageBubble>,
            );
          }
          if (t.text) {
            parts.push(
              <MessageBubble key={t.id} author={ASSISTANT} streaming={t.streaming}>
                {t.text}
              </MessageBubble>,
            );
          }
          return parts;
        })}
      </MessageScroller>

      {turns.length === 1 && (
        <div className="flex flex-wrap gap-XS px-M pt-S">
          {SUGGESTIONS.map((s) => (
            <Button key={s} size="small" shape="circular" onClick={() => ask(s)}>
              {s}
            </Button>
          ))}
        </div>
      )}

      <ChatComposer
        className="m-M"
        placeholder="Hỏi trợ lý…"
        busy={busy}
        onStop={stop}
        onSend={ask}
        actions={<Button appearance="subtle" icon={<Attach20Regular />} aria-label="Đính kèm tệp" />}
      />
    </section>
  );
}
