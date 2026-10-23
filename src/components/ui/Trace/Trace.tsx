/** Yugen Labs · Trace — dòng thời gian thực thi (agent AI, CI pipeline, triển khai). Không có trong Fluent 2. */
import * as React from "react";
import {
  ArrowMaximizeVertical20Regular,
  ArrowMinimizeVertical20Regular,
  CheckmarkCircle16Filled,
  CheckmarkCircle20Filled,
  ChevronRight16Regular,
  Circle16Regular,
  Circle20Regular,
  ErrorCircle16Filled,
  ErrorCircle20Filled,
  Prohibited16Regular,
  Prohibited20Regular,
  SubtractCircle16Regular,
  SubtractCircle20Regular,
  Timer16Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Spinner } from "../Spinner/Spinner";
import { useYugenMessages } from "../YugenProvider/context";
import { traceMessages } from "./messages";

export { traceMessages, traceMessagesEn, type TraceMessages } from "./messages";

/* ================================================================ Trạng thái */

export type TraceStatus = "pending" | "running" | "success" | "error" | "skipped" | "cancelled";
export type TraceSize = "small" | "medium";

type IconComponent = React.ComponentType<{ className?: string }>;

/** `label` là nhãn mặc định (tiếng Việt); component dùng `messages.trace[status]`. */
export const TRACE_STATUS_META: Record<
  TraceStatus,
  { label: string; color: string; icon16: IconComponent | null; icon20: IconComponent | null }
> = {
  pending: { label: traceMessages.pending, color: "text-foreground-3", icon16: Circle16Regular, icon20: Circle20Regular },
  running: { label: traceMessages.running, color: "text-brand-foreground-1", icon16: null, icon20: null },
  success: { label: traceMessages.success, color: "text-success-foreground-1", icon16: CheckmarkCircle16Filled, icon20: CheckmarkCircle20Filled },
  error: { label: traceMessages.error, color: "text-danger-foreground-1", icon16: ErrorCircle16Filled, icon20: ErrorCircle20Filled },
  skipped: { label: traceMessages.skipped, color: "text-foreground-3", icon16: SubtractCircle16Regular, icon20: SubtractCircle20Regular },
  cancelled: { label: traceMessages.cancelled, color: "text-warning-foreground-1", icon16: Prohibited16Regular, icon20: Prohibited20Regular },
};

/** Thứ tự hiển thị trong phần tổng kết. */
const SUMMARY_ORDER: TraceStatus[] = ["success", "error", "running", "cancelled", "skipped", "pending"];

/** Định dạng thời lượng (ms) gọn: 320ms · 4.2s · 2m 05s. */
export function formatTraceDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "";
  // So sánh sau khi làm tròn: 999.6ms → "1.0s" (không phải "1000ms"), 59.96s → "1m 00s" (không phải "60.0s").
  if (Math.round(ms) < 1000) return `${Math.round(ms)}ms`;
  const seconds = ms / 1000;
  if (Math.round(seconds * 10) < 600) return `${seconds.toFixed(1)}s`;
  const whole = Math.max(60, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}m ${String(rest).padStart(2, "0")}s`;
}

/**
 * Thời điểm hiện tại, cập nhật đều khi `active` (đồng hồ chạy cho bước đang chạy).
 * `null` cho tới khi mount: giờ của server và client khác nhau, đọc trong render sẽ làm lệch hydration.
 */
function useNow(active: boolean, interval = 100) {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [active, interval]);
  return now;
}

function LiveDuration({ since }: { since: number }) {
  const now = useNow(true);
  return <>{now === null ? "" : formatTraceDuration(Math.max(0, now - since))}</>;
}

export interface TraceStatusIconProps {
  status: TraceStatus;
  size?: TraceSize;
  className?: string;
}

/** Icon trạng thái (đã kèm màu token). Luôn đi cùng chữ — icon chỉ là tín hiệu phụ. */
export function TraceStatusIcon({ status, size = "medium", className }: TraceStatusIconProps) {
  const meta = TRACE_STATUS_META[status];
  if (status === "running") {
    return (
      <Spinner
        aria-hidden
        size={size === "small" ? "extra-tiny" : "tiny"}
        className={cn("shrink-0 [&_svg]:motion-reduce:animate-none", className)}
      />
    );
  }
  const Icon = (size === "small" ? meta.icon16 : meta.icon20) as IconComponent;
  return <Icon aria-hidden className={cn("shrink-0", size === "small" ? "size-4" : "size-5", meta.color, className)} />;
}

/* ================================================================ Context */

interface StepRecord {
  status: TraceStatus;
  expandable: boolean;
  expanded: boolean;
}

interface TraceContextValue {
  size: TraceSize;
  register: (id: string, record: StepRecord | null) => void;
  notify: (label: string, status: TraceStatus) => void;
  /** Tín hiệu "mở rộng / thu gọn tất cả" — seq tăng mỗi lần bấm. */
  expandSignal: { expanded: boolean; seq: number };
}

const TraceContext = React.createContext<TraceContextValue | null>(null);
const DepthContext = React.createContext(0);
const LastContext = React.createContext(false);

/* ================================================================ Trace */

export interface TraceProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Tiêu đề lần chạy (vd. "Agent: tóm tắt hợp đồng"). */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Trạng thái tổng; mặc định suy ra từ các bước. */
  status?: TraceStatus;
  /** Tổng thời lượng (ms) khi đã kết thúc. */
  duration?: number;
  /** Mốc bắt đầu (Date.now()) — khi đang chạy, phần đầu hiện đồng hồ trực tiếp. */
  startedAt?: number;
  /** Hành động thêm ở phần đầu (Huỷ, Chạy lại…). */
  actions?: React.ReactNode;
  /** outline: khung viền · subtle: không khung, nhúng vào bề mặt khác. */
  appearance?: "outline" | "subtle";
  size?: TraceSize;
  /** Ẩn phần đầu (tiêu đề, tổng kết, nút thu gọn). */
  hideHeader?: boolean;
  /** Đọc thay đổi trạng thái của từng bước qua live region (polite). Mặc định true. */
  announceChanges?: boolean;
  /** Nhãn cho danh sách khi không có title. Mặc định lấy từ `messages.trace.label`. */
  "aria-label"?: string;
  children?: React.ReactNode;
}

function overallStatus(counts: Record<TraceStatus, number>, total: number): TraceStatus {
  if (total === 0) return "pending";
  if (counts.running > 0) return "running";
  if (counts.error > 0) return "error";
  if (counts.cancelled > 0) return "cancelled";
  if (counts.pending > 0) return counts.success + counts.skipped > 0 ? "running" : "pending";
  return "success";
}

export const Trace = React.forwardRef<HTMLElement, TraceProps>(
  (
    {
      title,
      description,
      status,
      duration,
      startedAt,
      actions,
      appearance = "outline",
      size = "medium",
      hideHeader = false,
      announceChanges = true,
      className,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const titleId = React.useId();
    const msg = useYugenMessages("trace", traceMessages);
    const [records, setRecords] = React.useState<Record<string, StepRecord>>({});
    const [expandSignal, setExpandSignal] = React.useState({ expanded: false, seq: 0 });
    const [message, setMessage] = React.useState("");
    const queue = React.useRef<string[]>([]);
    const flushTimer = React.useRef<number | undefined>(undefined);

    const register = React.useCallback((id: string, record: StepRecord | null) => {
      setRecords((prev) => {
        const current = prev[id];
        if (record === null) {
          if (!current) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        }
        if (
          current &&
          current.status === record.status &&
          current.expandable === record.expandable &&
          current.expanded === record.expanded
        ) {
          return prev;
        }
        return { ...prev, [id]: record };
      });
    }, []);

    const notify = React.useCallback(
      (label: string, stepStatus: TraceStatus) => {
        if (!announceChanges) return;
        queue.current.push(`${label}: ${msg[stepStatus]}`);
        // Gộp các thay đổi cùng nhịp thành một thông báo.
        window.clearTimeout(flushTimer.current);
        flushTimer.current = window.setTimeout(() => {
          setMessage(queue.current.join(". "));
          queue.current = [];
        }, 0);
      },
      [announceChanges, msg],
    );

    React.useEffect(() => () => window.clearTimeout(flushTimer.current), []);

    const list = Object.values(records);
    const counts = SUMMARY_ORDER.reduce(
      (acc, s) => ({ ...acc, [s]: list.filter((r) => r.status === s).length }),
      {} as Record<TraceStatus, number>,
    );
    const total = list.length;
    const done = counts.success + counts.error + counts.skipped + counts.cancelled;
    const current = status ?? overallStatus(counts, total);
    const expandable = list.filter((r) => r.expandable);
    const anyExpanded = expandable.some((r) => r.expanded);

    const context = React.useMemo<TraceContextValue>(
      () => ({ size, register, notify, expandSignal }),
      [size, register, notify, expandSignal],
    );

    const small = size === "small";

    return (
      <TraceContext.Provider value={context}>
        <section
          ref={ref}
          aria-labelledby={title && !hideHeader ? titleId : undefined}
          aria-label={title && !hideHeader ? undefined : (ariaLabel ?? msg.label)}
          className={cn(
            "flex min-w-0 flex-col text-foreground-1",
            appearance === "outline" && "rounded-xlarge border border-stroke-2 bg-background-1",
            className,
          )}
          {...props}
        >
          {!hideHeader && (
            <header
              className={cn(
                "flex flex-wrap items-center gap-x-3 gap-y-2",
                appearance === "outline" ? "border-b border-stroke-2 px-4 py-3" : "pb-3",
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <TraceStatusIcon status={current} size={size} className={small ? undefined : "mt-0.5"} />
                <div className="min-w-0">
                  {title && (
                    <h3 id={titleId} className={cn("font-semibold text-foreground-1", small ? "text-body1" : "text-subtitle2")}>
                      {title}
                    </h3>
                  )}
                  <p className="text-caption1 text-foreground-3">
                    {msg[current]}
                    {total > 0 && ` · ${msg.steps(done, total)}`}
                    {description && <> · {description}</>}
                  </p>
                </div>
              </div>

              {total > 0 && (
                <ul aria-label={msg.summary} className="flex flex-wrap items-center gap-2 text-caption1 text-foreground-2">
                  {SUMMARY_ORDER.filter((s) => counts[s] > 0).map((s) => (
                    <li key={s} className="inline-flex items-center gap-0.5 tabular-nums">
                      <TraceStatusIcon status={s} size="small" />
                      <span>{counts[s]}</span>
                      <span className="sr-only">{msg[s]}</span>
                    </li>
                  ))}
                </ul>
              )}

              {(duration !== undefined || (startedAt !== undefined && current === "running")) && (
                <span className="inline-flex items-center gap-0.5 text-caption1 text-foreground-2 tabular-nums">
                  <Timer16Regular aria-hidden className="shrink-0" />
                  <span className="sr-only">{msg.duration} </span>
                  {startedAt !== undefined && current === "running" ? (
                    <LiveDuration since={startedAt} />
                  ) : (
                    formatTraceDuration(duration ?? 0)
                  )}
                </span>
              )}

              {(actions || expandable.length > 0) && (
                <div className="flex items-center gap-1">
                  {actions}
                  {expandable.length > 0 && (
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={anyExpanded ? <ArrowMinimizeVertical20Regular /> : <ArrowMaximizeVertical20Regular />}
                      onClick={() => setExpandSignal((s) => ({ expanded: !anyExpanded, seq: s.seq + 1 }))}
                    >
                      {anyExpanded ? msg.collapseAll : msg.expandAll}
                    </Button>
                  )}
                </div>
              )}
            </header>
          )}

          <TraceStepList className={appearance === "outline" ? "px-4 pt-3 pb-1" : undefined}>{children}</TraceStepList>

          <div role="status" className="sr-only">
            {message}
          </div>
        </section>
      </TraceContext.Provider>
    );
  },
);
Trace.displayName = "Trace";

/* ================================================================ Danh sách bước */

function TraceStepList({ className, children }: { className?: string; children?: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(React.isValidElement);
  if (items.length === 0) return null;
  return (
    <ul role="list" className={cn("flex flex-col", className)}>
      {items.map((child, i) => (
        <LastContext.Provider key={child.key ?? i} value={i === items.length - 1}>
          {child}
        </LastContext.Provider>
      ))}
    </ul>
  );
}

/* ================================================================ TraceStep */

export interface TraceStepProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  status?: TraceStatus;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Thời lượng (ms) khi đã xong. */
  duration?: number;
  /** Mốc bắt đầu cho đồng hồ trực tiếp khi `running` — bỏ trống thì tự ghi lúc chuyển sang running. */
  startedAt?: number;
  /** Badge thông tin (model, số token, nhánh…): mảng chuỗi hoặc ReactNode tuỳ ý. */
  metadata?: React.ReactNode | string[];
  /** Nội dung mở rộng: log, code, JSON… (xem TraceLog). */
  details?: React.ReactNode;
  /** Thay icon trạng thái. */
  icon?: React.ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Nhãn đọc trong thông báo trạng thái; mặc định lấy title nếu là chuỗi. */
  announceLabel?: string;
  /** Các TraceStep con (bước lồng). */
  children?: React.ReactNode;
}

export const TraceStep = React.forwardRef<HTMLLIElement, TraceStepProps>(
  (
    {
      status = "pending",
      title,
      description,
      duration,
      startedAt,
      metadata,
      details,
      icon,
      expanded: expandedProp,
      defaultExpanded,
      onExpandedChange,
      announceLabel,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const ctx = React.useContext(TraceContext);
    const depth = React.useContext(DepthContext);
    const last = React.useContext(LastContext);
    const msg = useYugenMessages("trace", traceMessages);
    const size = ctx?.size ?? "medium";
    const small = size === "small";
    const id = React.useId();
    const regionId = `${id}-details`;

    const hasChildren = React.Children.toArray(children).some(React.isValidElement);
    const expandable = details != null || hasChildren;

    const [innerExpanded, setInnerExpanded] = React.useState(
      defaultExpanded ?? (status === "running" || status === "error"),
    );
    const expanded = expandedProp ?? innerExpanded;
    const setExpanded = React.useCallback(
      (next: boolean) => {
        if (expandedProp === undefined) setInnerExpanded(next);
        onExpandedChange?.(next);
      },
      [expandedProp, onExpandedChange],
    );

    // Ghi mốc bắt đầu khi chuyển sang running (nếu không truyền startedAt).
    const [autoStart, setAutoStart] = React.useState<number | null>(() => (status === "running" ? Date.now() : null));
    const prevStatus = React.useRef(status);
    React.useEffect(() => {
      const prev = prevStatus.current;
      if (prev === status) return;
      prevStatus.current = status;
      if (status === "running") setAutoStart(Date.now());
      // Tự mở khi bắt đầu chạy hoặc lỗi — người dùng vẫn đóng lại được.
      if ((status === "running" || status === "error") && expandable && expandedProp === undefined) setInnerExpanded(true);
      const label = announceLabel ?? (typeof title === "string" ? title : undefined);
      if (label && status !== "pending") ctx?.notify(label, status);
    }, [status, announceLabel, title, ctx, expandable, expandedProp]);

    // Đăng ký với Trace để tính tổng kết.
    const register = ctx?.register;
    React.useEffect(() => {
      register?.(id, { status, expandable, expanded });
    }, [register, id, status, expandable, expanded]);
    React.useEffect(() => () => register?.(id, null), [register, id]);

    // Mở rộng / thu gọn tất cả.
    const seq = ctx?.expandSignal.seq ?? 0;
    const signalExpanded = ctx?.expandSignal.expanded ?? false;
    const seenSeq = React.useRef(seq);
    React.useEffect(() => {
      if (seq === seenSeq.current) return;
      seenSeq.current = seq;
      if (expandable) setExpanded(signalExpanded);
    }, [seq, signalExpanded, expandable, setExpanded]);

    const since = startedAt ?? autoStart;
    const timeText =
      status === "running" && since !== null ? (
        <LiveDuration since={since} />
      ) : duration !== undefined ? (
        formatTraceDuration(duration)
      ) : null;

    const titleClass = cn(
      small ? "text-caption1" : "text-body1",
      depth === 0 ? "font-semibold" : "font-normal",
      status === "pending" ? "text-foreground-2" : "text-foreground-1",
    );

    const titleContent = (
      <>
        <span className="min-w-0 wrap-break-word">{title}</span>
        <span className="sr-only">, {msg[status]}</span>
      </>
    );

    const metadataNode = Array.isArray(metadata) ? (
      metadata.length > 0 ? (
        <>
          {metadata.map((m, i) =>
            typeof m === "string" ? (
              <Badge key={`${m}-${i}`} appearance="tint" color="informative" shape="rounded" size="small">
                {m}
              </Badge>
            ) : (
              <React.Fragment key={i}>{m}</React.Fragment>
            ),
          )}
        </>
      ) : null
    ) : (
      metadata
    );

    return (
      <li
        ref={ref}
        data-status={status}
        className={cn("flex gap-2 animate-fade-in motion-reduce:animate-none", className)}
        {...props}
      >
        {/* Cột icon + đường nối tới bước kế tiếp */}
        <div aria-hidden className={cn("flex shrink-0 flex-col items-center", small ? "w-4" : "w-5")}>
          <span className={cn("flex items-center justify-center", small ? "h-4" : "h-5")}>
            {icon ?? <TraceStatusIcon status={status} size={size} />}
          </span>
          {!last && <span className="my-0.5 w-px flex-1 bg-stroke-2" />}
        </div>

        <div className={cn("min-w-0 flex-1", last ? "pb-1" : small ? "pb-2" : "pb-3")}>
          <div className={cn("flex items-start gap-2", small ? "min-h-4" : "min-h-5")}>
            {expandable ? (
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={regionId}
                onClick={() => setExpanded(!expanded)}
                className={cn(
                  "-mx-1 flex min-w-0 items-start gap-0.5 rounded-medium px-1 text-start",
                  "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover active:bg-subtle-pressed",
                  titleClass,
                )}
              >
                {titleContent}
                <ChevronRight16Regular
                  aria-hidden
                  className={cn(
                    "shrink-0 text-foreground-3 transition-transform duration-normal ease-easy-ease motion-reduce:transition-none rtl:-scale-x-100",
                    small ? "mt-0 size-4" : "mt-0.5 size-4",
                    expanded && "rotate-90 rtl:-rotate-90",
                  )}
                />
              </button>
            ) : (
              <div className={cn("flex min-w-0 items-start", titleClass)}>{titleContent}</div>
            )}
            {timeText !== null && (
              <span
                className={cn(
                  "ms-auto shrink-0 tabular-nums",
                  small ? "text-caption2" : "text-caption1",
                  status === "error" ? "text-danger-foreground-1" : "text-foreground-3",
                  !small && "pt-0.5",
                )}
              >
                {timeText}
              </span>
            )}
          </div>

          {description && (
            <p className={cn("mt-0.5 text-foreground-2", small ? "text-caption2" : "text-caption1")}>{description}</p>
          )}

          {metadataNode && <div className="mt-1 flex flex-wrap items-center gap-1">{metadataNode}</div>}

          {expandable && (
            <div id={regionId} hidden={!expanded} className={cn("mt-2 min-w-0", small ? "text-caption1" : "text-body1")}>
              {details != null && <div className="min-w-0">{details}</div>}
              {hasChildren && (
                <DepthContext.Provider value={depth + 1}>
                  <TraceStepList className={details != null ? "mt-2" : undefined}>{children}</TraceStepList>
                </DepthContext.Provider>
              )}
            </div>
          )}
        </div>
      </li>
    );
  },
);
TraceStep.displayName = "TraceStep";

/* ================================================================ TraceLog */

export interface TraceLogProps extends React.HTMLAttributes<HTMLPreElement> {
  /** Màu nhấn cho log lỗi. */
  intent?: "neutral" | "error";
}

/** Khối log đơn giản (monospace, cuộn, luôn LTR) cho slot `details`. Cần tô màu cú pháp → dùng CodeBlock. */
export const TraceLog = React.forwardRef<HTMLPreElement, TraceLogProps>(({ intent = "neutral", className, ...props }, ref) => (
  <pre
    ref={ref}
    dir="ltr"
    tabIndex={0}
    className={cn(
      "max-h-60 overflow-auto rounded-medium border px-3 py-2 text-start font-mono text-caption1 whitespace-pre-wrap",
      intent === "error"
        ? "border-danger-border-1 bg-danger-background-1 text-danger-foreground-1"
        : "border-stroke-2 bg-background-3 text-foreground-2",
      className,
    )}
    {...props}
  />
));
TraceLog.displayName = "TraceLog";
