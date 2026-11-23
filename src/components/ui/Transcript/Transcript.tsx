/** Yugen Labs · Transcript — các lượt nói của một cuộc hội thoại giọng nói (người dùng, trợ lý), có lượt đang nhận dữ liệu. */
import * as React from "react";
import { cn } from "@/lib/cn";
import { ErrorCircle16Filled } from "../_internal/icons";
import { useAnnounce } from "../AriaLive/AriaLive";
import { useComposedRefs } from "../_internal/composeRefs";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { useYugenLocale, useYugenMessages } from "../YugenProvider/context";
import { transcriptMessagesEn } from "./messages";

export { transcriptMessagesVi, transcriptMessagesEn, type TranscriptMessages } from "./messages";

export type TranscriptTurnStatus = "complete" | "streaming" | "error";

export interface TranscriptTurn {
  id: string;
  /** Tên người nói, hiện ở đầu lượt và dùng khi đọc lượt vừa xong. */
  speaker: string;
  /** user / assistant đổi màu tên người nói; giá trị khác dùng màu trung tính. */
  role?: "user" | "assistant" | "system" | (string & {});
  text: string;
  /** Thời điểm của lượt; định dạng giờ:phút theo `locale`. */
  timestamp?: Date | number;
  /** Thay chuỗi giờ tự định dạng. */
  time?: React.ReactNode;
  /** streaming: đang nhận chữ · error: nhận dạng thất bại. Mặc định complete. */
  status?: TranscriptTurnStatus;
  /** Lý do lỗi (khi status="error"). */
  error?: React.ReactNode;
  avatar?: React.ReactNode;
}

export interface TranscriptProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  turns: readonly TranscriptTurn[];
  /** Lượt đang diễn ra: viền nhấn, nhãn chữ và `aria-current`. Mặc định: lượt đang streaming (nếu có). */
  activeId?: string | null;
  /** Giữ cuộn ở cuối khi có chữ mới, nếu người dùng đang ở cuối (cần khung cuộn: đặt chiều cao + overflow). */
  autoScroll?: boolean;
  /** Đọc mỗi lượt khi nó xong (streaming → complete) qua vùng live; lịch sử không bao giờ bị đọc lại. */
  announce?: boolean;
  loading?: boolean;
  /** Nội dung khi chưa có lượt nào. */
  empty?: React.ReactNode;
  /** Thay cách hiện chữ của lượt (Markdown, highlight); được gọi lại chỉ khi lượt đó đổi. */
  renderText?: (turn: TranscriptTurn) => React.ReactNode;
  locale?: string;
}

function lastStreamingId(turns: readonly TranscriptTurn[]) {
  for (let i = turns.length - 1; i >= 0; i--) if (turns[i].status === "streaming") return turns[i].id;
  return undefined;
}

/** Khoảng cách tới đáy (px) vẫn coi là "đang ở cuối". */
const PINNED_SLACK = 24;

const ROLE_COLOR: Record<string, string> = {
  user: "text-foreground-1",
  assistant: "text-brand-foreground-1",
};

interface TurnViewProps {
  turn: TranscriptTurn;
  active: boolean;
  timeFormat: Intl.DateTimeFormat;
  renderText?: (turn: TranscriptTurn) => React.ReactNode;
  currentLabel: string;
  streamingLabel: string;
  errorLabel: string;
}

/** Một lượt; memo nên khi chỉ lượt cuối nhận thêm chữ, các lượt cũ không render lại. */
const TurnView = React.memo(function TurnView({ turn, active, timeFormat, renderText, currentLabel, streamingLabel, errorLabel }: TurnViewProps) {
  const status = turn.status ?? "complete";
  const date = turn.timestamp === undefined ? undefined : new Date(turn.timestamp);
  const time =
    turn.time ??
    (date && !Number.isNaN(date.getTime()) ? (
      <time dateTime={date.toISOString()}>{timeFormat.format(date)}</time>
    ) : null);
  return (
    <li
      data-transcript-turn={turn.id}
      data-status={status}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex min-w-0 gap-3 rounded-medium border-s-2 border-transparent py-2 ps-3 pe-2",
        active && "border-brand-stroke bg-background-2 forced-colors:border-[Highlight]",
      )}
    >
      {turn.avatar && <div className="shrink-0 pt-0.5">{turn.avatar}</div>}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={cn("min-w-0 truncate text-body1 font-semibold", ROLE_COLOR[turn.role ?? ""] ?? "text-foreground-2")}>{turn.speaker}</span>
          {active && <span className="text-caption1 font-semibold text-brand-foreground-1">{currentLabel}</span>}
          {time && <span className="shrink-0 text-caption1 text-foreground-3 tabular-nums">{time}</span>}
        </div>
        <div className="mt-0.5 wrap-break-word whitespace-pre-wrap text-body1 text-foreground-1">
          {renderText ? renderText(turn) : turn.text}
          {status === "streaming" && (
            <>
              <span aria-hidden className="ms-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 animate-pulse bg-foreground-3 motion-reduce:animate-none" />
              <span className="sr-only"> {streamingLabel}</span>
            </>
          )}
        </div>
        {status === "error" && (
          <p className="mt-1 flex items-center gap-1 text-caption1 text-danger-foreground-1">
            <ErrorCircle16Filled aria-hidden className="shrink-0" />
            <span>{turn.error ?? errorLabel}</span>
          </p>
        )}
      </div>
    </li>
  );
});

export function Transcript({
  turns,
  activeId,
  autoScroll = true,
  announce = false,
  loading = false,
  empty,
  renderText,
  locale: localeProp,
  className,
  onScroll,
  ref,
  ...props
}: TranscriptProps & { ref?: React.Ref<HTMLElement> }) {
  const msg = useYugenMessages("transcript", transcriptMessagesEn);
  const yugenLocale = useYugenLocale();
  const locale = localeProp ?? yugenLocale;
  const timeFormat = React.useMemo(() => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }), [locale]);
  const streamingId = lastStreamingId(turns);
  const streaming = streamingId !== undefined;
  const current = activeId === undefined ? streamingId : activeId;

  // Khung cuộn: giữ ở cuối khi có chữ mới nếu người dùng đang ở cuối.
  const boxRef = React.useRef<HTMLElement | null>(null);
  const pinned = React.useRef(true);
  const setRefs = useComposedRefs(ref, boxRef);
  const last = turns[turns.length - 1];
  useIsomorphicLayoutEffect(() => {
    const box = boxRef.current;
    if (autoScroll && box && pinned.current) box.scrollTop = box.scrollHeight;
  }, [autoScroll, turns.length, last?.text, last?.status]);
  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const box = event.currentTarget;
    pinned.current = box.scrollHeight - box.scrollTop - box.clientHeight <= PINNED_SLACK;
    onScroll?.(event);
  };

  // Đọc mỗi lượt đúng một lần khi nó xong; lượt đã có từ đầu (lịch sử) không được đọc.
  const { announce: say } = useAnnounce();
  const spoken = React.useRef<Map<string, TranscriptTurnStatus> | null>(null);
  React.useEffect(() => {
    const seen = spoken.current;
    const next = new Map(turns.map((t) => [t.id, t.status ?? "complete"] as const));
    spoken.current = next;
    if (!announce || seen === null) return;
    for (const turn of turns) {
      const before = seen.get(turn.id);
      const now = turn.status ?? "complete";
      if (now === "complete" && before !== "complete" && turn.text.trim()) say(msg.announce(turn.speaker, turn.text), { batchId: `transcript-${turn.id}` });
    }
  }, [announce, turns, say, msg]);

  return (
    <section
      ref={setRefs}
      aria-label={props["aria-labelledby"] ? undefined : msg.label}
      aria-busy={loading || streaming || undefined}
      onScroll={handleScroll}
      className={cn("min-w-0 overscroll-contain", className)}
      {...props}
    >
      {turns.length === 0 ? (
        <p role="status" className="px-3 py-6 text-center text-body1 text-foreground-3">
          {loading ? msg.loading : (empty ?? msg.empty)}
        </p>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-1 p-0">
          {turns.map((turn) => (
            <TurnView
              key={turn.id}
              turn={turn}
              active={turn.id === current}
              timeFormat={timeFormat}
              renderText={renderText}
              currentLabel={msg.current}
              streamingLabel={msg.streaming}
              errorLabel={msg.error}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
