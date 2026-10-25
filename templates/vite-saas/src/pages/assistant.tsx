import { useEffect, useRef, useState, type ReactElement } from "react";
import { Attach20Regular, Dismiss20Regular, Sparkle20Filled } from "@fluentui/react-icons";
import { Button, ChatComposer, MessageBubble, MessageScroller, Trace, TraceStep, type TraceStatus } from "yugen-ui";
import type { PageProps } from "../pages";

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

/** Trợ lý AI giả lập: các bước (Trace) chạy lần lượt rồi câu trả lời hiện dần từng chữ. Thay `ask` bằng API thật của bạn. */
function Assistant({ t }: PageProps) {
  const c = t.assistant;
  const [turns, setTurns] = useState<Turn[]>([{ id: 1, role: "assistant", text: c.greeting }]);
  const [busy, setBusy] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const patch = (id: number, fn: (turn: Turn) => Turn) => setTurns((list) => list.map((turn) => (turn.id === id ? fn(turn) : turn)));

  const setStep = (id: number, index: number, step: Partial<Step>) =>
    patch(id, (turn) => ({ ...turn, steps: turn.steps?.map((s, i) => (i === index ? { ...s, ...step } : s)) }));

  function ask(question: string) {
    const id = Date.now();
    setBusy(true);
    setTurns((list) => [
      ...list,
      { id: id - 1, role: "user", text: question },
      { id, role: "assistant", text: "", steps: c.plan.map((title) => ({ title, status: "pending" })) },
    ]);

    c.plan.forEach((_, i) => {
      later(() => setStep(id, i, { status: "running" }), i * 900 + 150);
      later(() => setStep(id, i, { status: "success", duration: 750 + i * 120 }), i * 900 + 900);
    });

    const words = c.answer.split(" ");
    const begin = c.plan.length * 900 + 250;
    words.forEach((_, i) =>
      later(() => patch(id, (turn) => ({ ...turn, text: words.slice(0, i + 1).join(" "), streaming: i < words.length - 1 })), begin + i * 60),
    );
    later(() => setBusy(false), begin + words.length * 60);
  }

  function stop() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setBusy(false);
    setTurns((list) =>
      list.map((turn) =>
        turn.role === "assistant" && (turn.streaming || turn.steps?.some((s) => s.status !== "success"))
          ? {
              ...turn,
              streaming: false,
              text: turn.text ? `${turn.text}${c.stopped}` : c.stoppedEmpty,
              steps: turn.steps?.map((s) => (s.status === "success" ? s : { ...s, status: "cancelled" })),
            }
          : turn,
      ),
    );
  }

  return (
    <section
      aria-label={c.name}
      className="flex h-140 w-full max-w-lg flex-col overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 shadow-4"
    >
      <header className="flex items-center gap-2 border-b border-stroke-2 px-4 py-3">
        <Sparkle20Filled className="shrink-0 text-brand-foreground-1" />
        <div className="min-w-0 flex-1">
          <h3 className="text-subtitle2 font-semibold">{c.name}</h3>
          <p className="truncate text-caption1 text-foreground-3">{c.disclaimer}</p>
        </div>
        <Button appearance="subtle" icon={<Dismiss20Regular />} aria-label={c.close} />
      </header>

      <MessageScroller className="flex-1" label={c.thread}>
        {turns.flatMap((turn) => {
          if (turn.role === "user") {
            return [
              <MessageBubble key={turn.id} side="outgoing" author={c.you}>
                {turn.text}
              </MessageBubble>,
            ];
          }
          const parts: ReactElement[] = [];
          if (turn.steps) {
            parts.push(
              <MessageBubble key={`${turn.id}-trace`} author={c.name} appearance="plain">
                <Trace size="small" title={c.steps}>
                  {turn.steps.map((s) => (
                    <TraceStep key={s.title} title={s.title} status={s.status} duration={s.duration} />
                  ))}
                </Trace>
              </MessageBubble>,
            );
          }
          if (turn.text) {
            parts.push(
              <MessageBubble key={turn.id} author={c.name} streaming={turn.streaming}>
                {turn.text}
              </MessageBubble>,
            );
          }
          return parts;
        })}
      </MessageScroller>

      {turns.length === 1 && (
        <div className="flex flex-wrap gap-1 px-3 pt-2">
          {c.suggestions.map((s) => (
            <Button key={s} size="small" shape="circular" onClick={() => ask(s)}>
              {s}
            </Button>
          ))}
        </div>
      )}

      <ChatComposer
        className="m-3"
        placeholder={c.placeholder}
        busy={busy}
        onStop={stop}
        onSend={ask}
        actions={<Button appearance="subtle" icon={<Attach20Regular />} aria-label={c.attach} />}
      />
    </section>
  );
}

export default function AssistantPage({ t }: PageProps) {
  return (
    <div className="flex justify-center">
      <Assistant t={t} />
    </div>
  );
}
