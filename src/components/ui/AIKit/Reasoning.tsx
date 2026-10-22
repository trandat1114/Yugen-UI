/** Yugen Labs · Reasoning — khối "Đang suy luận… / Đã suy luận trong 12s" thu gọn được cho phần suy nghĩ của model. */
import * as React from "react";
import { ChevronDown16Regular, Lightbulb16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../Collapsible/Collapsible";
import { StreamingMarkdown } from "./StreamingMarkdown";

/** Thời lượng gọn theo giây: 12s · 1m 05s. */
export function formatReasoningDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "";
  const total = Math.max(1, Math.round(ms / 1000));
  if (total < 60) return `${total}s`;
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, "0")}s`;
}

export interface ReasoningProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children" | "onChange"> {
  /** Model đang suy luận: nhãn "Đang suy luận…", đồng hồ chạy, nội dung `aria-busy`. */
  streaming?: boolean;
  /** Thời lượng (ms). Bỏ trống → tự đo từ lúc streaming bật tới lúc tắt (đo trong effect, an toàn SSR). */
  duration?: number;
  open?: boolean;
  /** Mặc định: mở khi đang suy luận (nếu autoOpen), thu gọn khi đã xong. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Tự mở khi bắt đầu và tự thu gọn khi xong — trừ khi người dùng đã tự bấm. Mặc định true. */
  autoOpen?: boolean;
  /** Thay nhãn mặc định. */
  label?: React.ReactNode;
  /** Chuỗi → render bằng StreamingMarkdown (size small); ReactNode tuỳ ý cũng được. */
  children?: React.ReactNode;
}

export const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  (
    { streaming = false, duration, open: openProp, defaultOpen, onOpenChange, autoOpen = true, label, className, children, ...props },
    ref,
  ) => {
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? (autoOpen && streaming));
    const open = openProp ?? innerOpen;
    const userToggled = React.useRef(false);
    const [startedAt, setStartedAt] = React.useState<number | null>(null);
    const [measured, setMeasured] = React.useState<number | null>(null);
    const [now, setNow] = React.useState<number | null>(null);

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (openProp === undefined) setInnerOpen(next);
        onOpenChange?.(next);
      },
      [openProp, onOpenChange],
    );

    // Đo thời gian trong effect: Date.now() không bao giờ chạy lúc render (server / client lệch nhau).
    const prevStreaming = React.useRef<boolean | null>(null);
    const startRef = React.useRef<number | null>(null);
    React.useEffect(() => {
      const prev = prevStreaming.current;
      prevStreaming.current = streaming;
      if (streaming && prev !== true) {
        const t = Date.now();
        startRef.current = t;
        setStartedAt(t);
        setNow(t);
        setMeasured(null);
        if (autoOpen && !userToggled.current && prev === false) setOpen(true);
      } else if (!streaming && prev === true) {
        if (startRef.current !== null) setMeasured(Date.now() - startRef.current);
        startRef.current = null;
        setStartedAt(null);
        if (autoOpen && !userToggled.current) setOpen(false);
      }
    }, [streaming, autoOpen, setOpen]);

    React.useEffect(() => {
      if (!streaming) return;
      const id = window.setInterval(() => setNow(Date.now()), 1000);
      return () => window.clearInterval(id);
    }, [streaming]);

    const elapsed = streaming && startedAt !== null && now !== null ? formatReasoningDuration(now - startedAt) : "";
    const total = duration ?? measured;
    const doneLabel = total != null ? `Đã suy luận trong ${formatReasoningDuration(total)}` : "Đã suy luận";

    return (
      <Collapsible
        open={open}
        onOpenChange={(next) => {
          userToggled.current = true;
          setOpen(next);
        }}
      >
        <div ref={ref} data-streaming={streaming || undefined} className={cn("flex min-w-0 flex-col", className)} {...props}>
          <CollapsibleTrigger
            className={cn(
              "group/reasoning -mx-1 inline-flex max-w-full items-center gap-1 self-start rounded-medium px-1 py-0.5 text-caption1 text-foreground-3",
              "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
            )}
          >
            <Lightbulb16Regular aria-hidden className={cn("shrink-0", streaming && "text-brand-foreground-1")} />
            <span className={cn("truncate", streaming && "animate-pulse motion-reduce:animate-none")}>
              {label ?? (streaming ? "Đang suy luận…" : doneLabel)}
            </span>
            {elapsed && (
              <span aria-hidden className="tabular-nums">
                {elapsed}
              </span>
            )}
            <ChevronDown16Regular
              aria-hidden
              className="shrink-0 transition-transform duration-normal ease-easy-ease group-data-[state=open]/reasoning:rotate-180 motion-reduce:transition-none"
            />
          </CollapsibleTrigger>
          <CollapsibleContent aria-busy={streaming || undefined} className="mt-1 border-s-2 border-stroke-2 ps-3 text-foreground-2">
            {typeof children === "string" ? (
              <StreamingMarkdown size="small" streaming={streaming} className="text-foreground-2">
                {children}
              </StreamingMarkdown>
            ) : (
              children
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
);
Reasoning.displayName = "Reasoning";
