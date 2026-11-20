import * as React from "react";
import { cn } from "@/lib/cn";
import { warnDeprecated } from "@/lib/deprecate";

/** Màu của sự kiện. "danger" cũ đã lỗi thời (bỏ ở 1.0): dùng "error" như MessageBar, Toast, Field. */
export type TimelineIntent = TimelineIntentName | TimelineIntentLegacy;
type TimelineIntentName = "neutral" | "brand" | "success" | "warning" | "error";
/** @deprecated Use "error". Will be removed in v1.0.0. */
type TimelineIntentLegacy = "danger";
export type TimelineVariant = "detailed" | "compact";
export type TimelineDateLayout = "inline" | "sticky";
export type TimelineItemStatus = "upcoming" | "current" | "complete";

/** Nền + màu icon của ô tròn (detailed), và màu chấm (compact / không icon). */
const INTENT: Record<TimelineIntentName, { bubble: string; dot: string }> = {
  neutral: { bubble: "bg-background-3 text-foreground-2", dot: "text-foreground-3" },
  brand: { bubble: "bg-brand-background-2 text-brand-foreground-1", dot: "text-brand-foreground-1" },
  success: { bubble: "bg-success-background-1 text-success-foreground-1", dot: "text-success-foreground-1" },
  warning: { bubble: "bg-warning-background-1 text-warning-foreground-1", dot: "text-warning-foreground-1" },
  error: { bubble: "bg-danger-background-1 text-danger-foreground-1", dot: "text-danger-foreground-1" },
};

const MIN_SCROLL_OFFSET = 0.1;
const MAX_SCROLL_OFFSET = 0.9;

interface TimelineContextValue {
  variant: TimelineVariant;
  dateLayout: TimelineDateLayout;
  progressEnabled: boolean;
  progress: number;
  activeIndex: number;
  reducedMotion: boolean;
  progressLabel: string;
}

const TimelineContext = React.createContext<TimelineContextValue>({
  variant: "detailed",
  dateLayout: "inline",
  progressEnabled: false,
  progress: 0,
  activeIndex: -1,
  reducedMotion: false,
  progressLabel: "Timeline progress",
});

const TimelineItemIndexContext = React.createContext<number | undefined>(undefined);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useTimelineScrollState(
  listRef: React.RefObject<HTMLOListElement | null>,
  enabled: boolean,
  scrollOffset: number,
  itemCount: number,
) {
  const [state, setState] = React.useState({ progress: 0, activeIndex: -1, reducedMotion: false });

  React.useEffect(() => {
    if (!enabled) {
      setState({ progress: 0, activeIndex: -1, reducedMotion: false });
      return;
    }

    const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    let frame: number | null = null;

    const measure = () => {
      frame = null;
      const list = listRef.current;
      const reducedMotion = media?.matches ?? false;
      if (!list) return;

      if (reducedMotion) {
        setState({ progress: 1, activeIndex: Math.max(itemCount - 1, -1), reducedMotion: true });
        return;
      }

      const rect = list.getBoundingClientRect();
      const markerLine = window.innerHeight * scrollOffset;
      const progress = clamp((markerLine - rect.top) / Math.max(rect.height, 1), 0, 1);
      const itemNodes = Array.from(list.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement && child.dataset.timelineItem === "true",
      );
      const relativeMarkerLine = markerLine - rect.top;
      let activeIndex = -1;
      itemNodes.forEach((item, index) => {
        if (item.getBoundingClientRect().top - rect.top <= relativeMarkerLine) activeIndex = index;
      });
      setState({ progress, activeIndex, reducedMotion: false });
    };

    const scheduleMeasure = () => {
      if (frame !== null) return;
      frame = typeof window.requestAnimationFrame === "function" ? window.requestAnimationFrame(measure) : window.setTimeout(measure, 0);
    };
    const onMotionPreferenceChange = () => scheduleMeasure();

    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    media?.addEventListener?.("change", onMotionPreferenceChange);
    media?.addListener?.(onMotionPreferenceChange);
    scheduleMeasure();

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      media?.removeEventListener?.("change", onMotionPreferenceChange);
      media?.removeListener?.(onMotionPreferenceChange);
      if (frame !== null) {
        if (typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(frame);
        else window.clearTimeout(frame);
      }
    };
  }, [enabled, itemCount, listRef, scrollOffset]);

  return state;
}

export interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** detailed: ô icon 32px, nội dung bên dưới · compact: chấm nhỏ, tiêu đề và thời gian trên một dòng. */
  variant?: TimelineVariant;
  /** Bật rail tiến độ theo vị trí cuộn trang; mặc định tắt để giữ Timeline tĩnh nhẹ. */
  progress?: boolean;
  /** Vị trí đường đánh dấu trong viewport (0.65 = 65% chiều cao viewport). */
  scrollOffset?: number;
  /** Chỉ số item hiện tại do ứng dụng điều khiển; bỏ qua khi muốn tự tính theo scroll. */
  activeIndex?: number;
  /** Nhãn cho progressbar ẩn dành cho trình đọc màn hình. */
  progressLabel?: string;
  /** inline giữ thời gian cạnh tiêu đề; sticky đặt thời gian ở cột riêng trên màn hình rộng. */
  dateLayout?: TimelineDateLayout;
}

/** Timeline — chuỗi sự kiện theo thời gian (nhật ký hoạt động, lịch sử đơn hàng). Mới nhất thường ở đầu. */
export function Timeline({
  variant = "detailed",
  progress: progressEnabled = false,
  scrollOffset: scrollOffsetProp = 0.65,
  activeIndex: activeIndexProp,
  progressLabel = "Timeline progress",
  dateLayout = "inline",
  className,
  style,
  children,
  ref,
  ...props
}: TimelineProps & { ref?: React.Ref<HTMLOListElement> }) {
  const listRef = React.useRef<HTMLOListElement>(null);
  const scrollOffset = clamp(scrollOffsetProp, MIN_SCROLL_OFFSET, MAX_SCROLL_OFFSET);
  const directItems = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === TimelineItem,
  );
  const itemCount = directItems.length;
  const scrollState = useTimelineScrollState(listRef, progressEnabled, scrollOffset, itemCount);
  const activeIndex = activeIndexProp ?? (progressEnabled ? scrollState.activeIndex : -1);
  const progress = progressEnabled ? scrollState.progress : 0;
  const setListRef = React.useCallback(
    (node: HTMLOListElement | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLOListElement | null>).current = node;
    },
    [ref],
  );
  let renderedItemIndex = 0;
  const renderedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type !== TimelineItem) return child;
    const index = renderedItemIndex++;
    return <TimelineItemIndexContext.Provider value={index}>{child}</TimelineItemIndexContext.Provider>;
  });
  const progressStyle = { "--timeline-progress": progress } as React.CSSProperties;
  const progressClasses = progressEnabled
    ? "relative before:pointer-events-none before:absolute before:inset-y-4 before:inset-s-4 before:z-0 before:w-px before:bg-stroke-2 before:content-[''] after:pointer-events-none after:absolute after:inset-y-4 after:inset-s-4 after:z-0 after:w-px after:origin-top after:scale-y-(--timeline-progress) after:bg-brand-background after:content-[''] motion-reduce:after:scale-y-100"
    : "";
  const compactProgressClasses = variant === "compact" && progressEnabled
    ? "before:inset-y-2.5 before:inset-s-2.5 after:inset-y-2.5 after:inset-s-2.5"
    : "";

  return (
    <TimelineContext.Provider value={{ variant, dateLayout, progressEnabled, progress, activeIndex, reducedMotion: scrollState.reducedMotion, progressLabel }}>
      <ol
        ref={setListRef}
        className={cn("not-prose m-0 flex min-w-0 list-none flex-col p-0", progressClasses, compactProgressClasses, className)}
        style={{ ...progressStyle, ...style }}
        data-timeline-progress={progressEnabled ? "true" : undefined}
        {...props}
      >
        {renderedChildren}
      </ol>
    </TimelineContext.Provider>
  );
}

export interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Sự kiện: ai làm gì. */
  title: React.ReactNode;
  /** Icon hoặc Avatar của người thực hiện; bỏ trống = chấm tròn. */
  icon?: React.ReactNode;
  intent?: TimelineIntent;
  /** Thời gian hiển thị ("10:24", "2 giờ trước"). */
  time?: React.ReactNode;
  /** Thời điểm máy đọc được (ISO 8601) → `<time dateTime>`. */
  dateTime?: string;
  /** Trạng thái hiển thị; khi bỏ trống sẽ tự suy ra từ Timeline progress. */
  status?: TimelineItemStatus;
  /** Nội dung thêm: bình luận, tệp đính kèm, thẻ. */
  children?: React.ReactNode;
}

function getDerivedStatus(index: number | undefined, explicitStatus: TimelineItemStatus | undefined, activeIndex: number, progressEnabled: boolean) {
  if (explicitStatus) return explicitStatus;
  if (!progressEnabled || index === undefined) return undefined;
  if (index < activeIndex) return "complete" as const;
  if (index === activeIndex) return "current" as const;
  return "upcoming" as const;
}

export function TimelineItem({
  title,
  icon,
  intent = "neutral",
  time,
  dateTime,
  status,
  children,
  className,
  ref,
  ...props
}: TimelineItemProps & { ref?: React.Ref<HTMLLIElement> }) {
  const { variant, dateLayout, progressEnabled, progress, activeIndex, progressLabel } = React.useContext(TimelineContext);
  const __timelineIndex = React.useContext(TimelineItemIndexContext);
  const compact = variant === "compact";
  const resolvedStatus = getDerivedStatus(__timelineIndex, status, activeIndex, progressEnabled);
  if (intent === "danger") warnDeprecated('TimelineItem.intent="danger"', 'use intent="error"', "1.0.0");
  const tone = INTENT[intent === "danger" ? "error" : intent];
  const markerTone = resolvedStatus === "complete" ? "text-success-foreground-1" : tone.dot;
  const statusClasses = resolvedStatus === "current" ? "ring-2 ring-brand-stroke" : "";
  const timeEl =
    time !== undefined ? (
      dateTime ? (
        <time dateTime={dateTime} className="shrink-0 text-caption1 text-foreground-3">
          {time}
        </time>
      ) : (
        <span className="shrink-0 text-caption1 text-foreground-3">{time}</span>
      )
    ) : null;
  const stickyDate = dateLayout === "sticky" && timeEl !== null;
  const content = (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <div className={cn("min-w-0 text-body1 text-foreground-1", !compact && "flex-1")}>{title}</div>
        {!stickyDate && timeEl}
      </div>
      {children && <div className={cn("min-w-0 text-foreground-2", compact ? "text-caption1" : "text-body1")}>{children}</div>}
    </>
  );

  return (
    <li
      ref={ref}
      className={cn("group/timeline flex min-w-0 gap-3", className)}
      data-timeline-item="true"
      data-timeline-index={__timelineIndex}
      data-timeline-status={resolvedStatus}
      aria-current={resolvedStatus === "current" ? "step" : undefined}
      {...props}
    >
      <div aria-hidden className="relative z-10 flex shrink-0 flex-col items-center">
        {compact ? (
          <span className={cn("flex size-5 items-center justify-center rounded-circular [&_svg]:size-4", markerTone, statusClasses)}>
            {icon ?? <span className="size-2 rounded-circular bg-current" />}
          </span>
        ) : icon ? (
          <span className={cn("flex size-8 items-center justify-center overflow-hidden rounded-circular [&_svg]:size-4", tone.bubble, statusClasses)}>
            {icon}
          </span>
        ) : (
          <span className={cn("flex size-8 items-center justify-center rounded-circular", markerTone, statusClasses)}>
            <span className="size-2.5 rounded-circular bg-current" />
          </span>
        )}
        <span className={cn("w-px flex-1 group-last/timeline:hidden", progressEnabled ? "bg-transparent" : "bg-stroke-2", compact ? "my-0.5" : "my-1")} />
      </div>
      <div className={cn("relative z-10 flex min-w-0 flex-1 flex-col group-last/timeline:pb-0", compact ? "pb-3" : "gap-2 pt-1.5 pb-6")}>
        {stickyDate ? (
          <div className="grid min-w-0 gap-x-4 sm:grid-cols-[minmax(6rem,8rem)_minmax(0,1fr)]">
            <div className="mb-2 text-caption1 text-foreground-3 sm:sticky sm:top-4 sm:mb-0 sm:self-start">{timeEl}</div>
            <div className="min-w-0">{content}</div>
          </div>
        ) : (
          content
        )}
        {progressEnabled && __timelineIndex === 0 && (
          <span
            className="sr-only"
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          />
        )}
      </div>
    </li>
  );
}
