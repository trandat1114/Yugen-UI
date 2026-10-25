import * as React from "react";
import { ArrowClockwise20Regular, Checkmark20Regular, ChevronDown16Regular, Copy20Regular, Document16Regular } from "@fluentui/react-icons";
import {
  Button,
  CitationList,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CompoundButton,
  ErrorState,
  formatTraceDuration,
  Kbd,
  MessageBubble,
  MessageScroller,
  PromptInput,
  Reasoning,
  SimpleTooltip,
  StreamingMarkdown,
  toast,
  Trace,
  TraceStatusIcon,
  TraceStep,
  TypingIndicator,
  useAnnounce,
  type TraceStatus,
} from "@/components/ui";
import { AssistantAvatar } from "./Brand";
import type { Conversation, Message, Step } from "./conversations";
import type { Content } from "./content/types";

export interface ChatPageProps {
  t: Content;
  /** Undefined on the New chat page. */
  conversation?: Conversation;
  /** A reply is streaming in this conversation. */
  busy: boolean;
  embedded: boolean;
  onSend: (text: string, files: File[]) => void;
  onStop: () => void;
  onRegenerate: () => void;
}

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

function useFormatters(locale: string) {
  return React.useMemo(() => {
    const time = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
    const unit = (u: string) => new Intl.NumberFormat(locale, { style: "unit", unit: u, unitDisplay: "short", maximumFractionDigits: 1 });
    const units = [unit("byte"), unit("kilobyte"), unit("megabyte"), unit("gigabyte")];
    return {
      time: (ms: number) => time.format(ms),
      size: (bytes: number) => {
        let value = bytes;
        let i = 0;
        while (value >= 1024 && i < units.length - 1) {
          value /= 1024;
          i++;
        }
        return units[i].format(value);
      },
    };
  }, [locale]);
}

/* ================================================================ Answer parts */

function overallStatus(steps: Step[]): TraceStatus {
  if (steps.some((s) => s.status === "running" || s.status === "pending")) return "running";
  if (steps.some((s) => s.status === "error")) return "error";
  if (steps.some((s) => s.status === "cancelled")) return "cancelled";
  return "success";
}

/** The agent's steps: open while they run, folded into one line when done (click to see them again). */
function Steps({ steps, t }: { steps: Step[]; t: Content }) {
  const status = overallStatus(steps);
  const running = status === "running";
  const [userOpen, setUserOpen] = React.useState<boolean | null>(null);
  const open = userOpen ?? running;
  const total = steps.reduce((sum, s) => sum + (s.duration ?? 0), 0);

  return (
    <Collapsible open={open} onOpenChange={setUserOpen}>
      <CollapsibleTrigger className="group/steps -mx-1 inline-flex max-w-full items-center gap-1 self-start rounded-medium px-1 py-0.5 text-caption1 text-foreground-3 transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed">
        <TraceStatusIcon status={status} size="small" />
        <span className="truncate">{running ? t.chat.working : t.chat.ranSteps(steps.length)}</span>
        {!running && total > 0 && <span className="tabular-nums">{formatTraceDuration(total)}</span>}
        <ChevronDown16Regular
          aria-hidden
          className="shrink-0 transition-transform duration-normal ease-easy-ease group-data-[state=open]/steps:rotate-180 motion-reduce:transition-none"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 border-s-2 border-stroke-2 ps-3">
        <Trace size="small" appearance="subtle" hideHeader aria-label={t.chat.steps}>
          {steps.map((s) => (
            <TraceStep
              key={s.id}
              title={s.title}
              status={s.status}
              duration={s.duration}
              startedAt={s.status === "running" ? s.startedAt : undefined}
            />
          ))}
        </Trace>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CopyButton({ text, t }: { text: string; t: Content }) {
  const [copied, setCopied] = React.useState(false);
  const { announce } = useAnnounce();

  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      announce(t.chat.copied);
    } catch {
      toast({ intent: "error", title: t.chat.copyFailed });
    }
  };

  const label = copied ? t.chat.copied : t.chat.copy;
  return (
    <SimpleTooltip content={label}>
      <Button size="small" appearance="subtle" icon={copied ? <Checkmark20Regular /> : <Copy20Regular />} aria-label={label} onClick={copy} />
    </SimpleTooltip>
  );
}

interface AnswerProps {
  m: Message;
  t: Content;
  last: boolean;
  onRegenerate: () => void;
}

/** Reasoning, steps, the Markdown answer with sources, then copy / regenerate. */
function Answer({ m, t, last, onRegenerate }: AnswerProps) {
  const streaming = m.status === "streaming";
  return (
    <div className="flex flex-col gap-3 whitespace-normal">
      {m.reasoning && (
        <Reasoning streaming={streaming && m.reasoningMs === undefined} duration={m.reasoningMs}>
          {m.reasoning}
        </Reasoning>
      )}
      {m.steps && m.steps.length > 0 && <Steps steps={m.steps} t={t} />}
      {m.content && (
        // Read once, as plain text, when the answer is complete (the message list itself stays quiet while streaming).
        <StreamingMarkdown streaming={streaming} citations={m.sources} announceWhenDone>
          {m.content}
        </StreamingMarkdown>
      )}
      {m.content && m.sources && m.sources.length > 0 && <CitationList sources={m.sources} />}
      {m.status === "stopped" && <p className="text-caption1 text-foreground-3">{t.chat.stopped}</p>}
      {m.status === "error" && (
        <ErrorState
          size="small"
          variant="alert"
          title={t.chat.errorTitle}
          description={m.error}
          onRetry={last ? onRegenerate : undefined}
          retryLabel={t.chat.retry}
          className="rounded-large border border-stroke-2 bg-background-1"
        />
      )}
      {!streaming && m.status !== "error" && (m.content || last) && (
        <div role="group" aria-label={t.chat.actions} className="-ms-1 flex items-center gap-0.5">
          {m.content && <CopyButton text={m.content} t={t} />}
          {last && (
            <SimpleTooltip content={t.chat.regenerate}>
              <Button size="small" appearance="subtle" icon={<ArrowClockwise20Regular />} aria-label={t.chat.regenerate} onClick={onRegenerate} />
            </SimpleTooltip>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================ Page */

function Welcome({ t, embedded, onPick }: { t: Content; embedded: boolean; onPick: (prompt: string) => void }) {
  const Heading = embedded ? "h3" : "h2";
  return (
    // m-auto centers when there is room and still scrolls from the top when there is not.
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="m-auto flex w-full max-w-2xl flex-col items-center gap-6">
        <div className="flex max-w-md flex-col items-center gap-2 text-center">
          <AssistantAvatar large />
          <Heading className="mt-1 font-display text-title3 font-semibold text-balance">{t.chat.greeting}</Heading>
          <p className="text-body1 text-foreground-3">{t.chat.intro}</p>
        </div>
        <ul aria-label={t.chat.suggestionsLabel} className="grid w-full gap-2 @sm:grid-cols-2">
          {t.chat.suggestions.map((s) => (
            <li key={s.prompt} className="flex">
              <CompoundButton size="small" secondaryContent={s.prompt} className="w-full justify-start text-start" onClick={() => onPick(s.prompt)}>
                {s.title}
              </CompoundButton>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** New chat (`/`) and a conversation (`/c/:id`): messages, then the prompt input. */
export default function ChatPage({ t, conversation, busy, embedded, onSend, onStop, onRegenerate }: ChatPageProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const format = useFormatters(t.locale);
  const messages = conversation?.messages ?? [];

  // Ready to type after opening a conversation, with a mouse or trackpad (on touch it would pop up the keyboard).
  // Not in the docs preview: focus would scroll the page to it.
  React.useEffect(() => {
    if (embedded || !window.matchMedia("(pointer: fine)").matches) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [conversation?.id, embedded]);

  return (
    <div className="@container flex min-h-0 flex-1 flex-col">
      {conversation && messages.length > 0 ? (
        <MessageScroller
          key={conversation.id}
          label={t.chat.log}
          className="flex-1"
          announceIncoming={false}
          contentClassName="mx-auto w-full max-w-3xl justify-start px-3 py-6 @xl:px-6"
        >
          {messages.map((m, i) => {
            const time = format.time(m.createdAt);
            const dateTime = new Date(m.createdAt).toISOString();
            if (m.role === "user") {
              return (
                <MessageBubble key={m.id} side="outgoing" author={t.you} time={time} dateTime={dateTime}>
                  {m.attachments && m.attachments.length > 0 && (
                    <ul aria-label={t.chat.attachments} className={`flex flex-wrap gap-1 whitespace-normal ${m.content ? "mb-2" : ""}`}>
                      {m.attachments.map((a, k) => (
                        <li key={k} className="flex max-w-56 min-w-0 items-center gap-1 rounded-medium bg-background-1 px-2 py-1 text-caption1">
                          <Document16Regular aria-hidden className="shrink-0 text-foreground-2" />
                          <span className="min-w-0 truncate font-semibold">{a.name}</span>
                          <span className="shrink-0 text-foreground-3 tabular-nums">{format.size(a.size)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {m.content}
                </MessageBubble>
              );
            }
            // Before the first chunk: "Sakura is typing…" in the same place the answer will appear.
            if (m.status === "streaming" && !m.reasoning && !m.steps?.length && !m.content) {
              return <TypingIndicator key={`${m.id}-typing`} author={t.assistantName} avatar={<AssistantAvatar />} />;
            }
            return (
              <MessageBubble key={m.id} author={t.assistantName} avatar={<AssistantAvatar />} time={time} dateTime={dateTime} appearance="plain">
                <Answer m={m} t={t} last={i === messages.length - 1} onRegenerate={onRegenerate} />
              </MessageBubble>
            );
          })}
        </MessageScroller>
      ) : (
        <Welcome
          t={t}
          embedded={embedded}
          onPick={(prompt) => {
            onSend(prompt, []);
            // The suggestion button goes away: keep focus in the app (Esc stops, typing continues).
            inputRef.current?.focus({ preventScroll: true });
          }}
        />
      )}

      <div className="mx-auto w-full max-w-3xl px-3 pb-3 @xl:px-6 @xl:pb-4">
        <PromptInput
          ref={inputRef}
          placeholder={t.chat.placeholder}
          streaming={busy}
          onStop={onStop}
          onSubmit={({ text, files }) => onSend(text, files)}
          maxFiles={MAX_FILES}
          maxSize={MAX_SIZE}
          className="bg-background-1 shadow-4"
        />
        <p className="mt-2 text-center text-caption1 text-foreground-3">
          {busy ? (
            <>
              <Kbd size="small">Esc</Kbd> {t.chat.escToStop}
            </>
          ) : (
            t.chat.disclaimer
          )}
        </p>
      </div>
    </div>
  );
}
