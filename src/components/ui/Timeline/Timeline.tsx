import * as React from "react";
import { cn } from "@/lib/cn";

export type TimelineIntent = "neutral" | "brand" | "success" | "warning" | "danger";
export type TimelineVariant = "detailed" | "compact";

/** Nền + màu icon của ô tròn (detailed), và màu chấm (compact / không icon). */
const INTENT: Record<TimelineIntent, { bubble: string; dot: string }> = {
  neutral: { bubble: "bg-background-3 text-foreground-2", dot: "text-foreground-3" },
  brand: { bubble: "bg-brand-background-2 text-brand-foreground-1", dot: "text-brand-foreground-1" },
  success: { bubble: "bg-success-background-1 text-success-foreground-1", dot: "text-success-foreground-1" },
  warning: { bubble: "bg-warning-background-1 text-warning-foreground-1", dot: "text-warning-foreground-1" },
  danger: { bubble: "bg-danger-background-1 text-danger-foreground-1", dot: "text-danger-foreground-1" },
};

const VariantContext = React.createContext<TimelineVariant>("detailed");

export interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** detailed: ô icon 32px, nội dung bên dưới · compact: chấm nhỏ, tiêu đề và thời gian trên một dòng. */
  variant?: TimelineVariant;
}

/** Timeline — chuỗi sự kiện theo thời gian (nhật ký hoạt động, lịch sử đơn hàng). Mới nhất thường ở đầu. */
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { variant = "detailed", className, ...props },
  ref,
) {
  return (
    <VariantContext.Provider value={variant}>
      <ol ref={ref} className={cn("not-prose m-0 flex min-w-0 list-none flex-col p-0", className)} {...props} />
    </VariantContext.Provider>
  );
});

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
  /** Nội dung thêm: bình luận, tệp đính kèm, thẻ. */
  children?: React.ReactNode;
}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { title, icon, intent = "neutral", time, dateTime, children, className, ...props },
  ref,
) {
  const variant = React.useContext(VariantContext);
  const compact = variant === "compact";
  const tone = INTENT[intent];
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

  return (
    <li ref={ref} className={cn("group/timeline flex min-w-0 gap-3", className)} {...props}>
      <div aria-hidden className="flex shrink-0 flex-col items-center">
        {compact ? (
          <span className={cn("flex size-5 items-center justify-center [&_svg]:size-4", tone.dot)}>
            {icon ?? <span className="size-2 rounded-circular bg-current" />}
          </span>
        ) : icon ? (
          <span className={cn("flex size-8 items-center justify-center overflow-hidden rounded-circular [&_svg]:size-4", tone.bubble)}>
            {icon}
          </span>
        ) : (
          <span className={cn("flex size-8 items-center justify-center", tone.dot)}>
            <span className="size-2.5 rounded-circular bg-current" />
          </span>
        )}
        <span className={cn("w-px flex-1 bg-stroke-2 group-last/timeline:hidden", compact ? "my-0.5" : "my-1")} />
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col group-last/timeline:pb-0", compact ? "pb-3" : "gap-2 pt-1.5 pb-6")}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <div className={cn("min-w-0 text-body1 text-foreground-1", !compact && "flex-1")}>{title}</div>
          {timeEl}
        </div>
        {children && <div className={cn("min-w-0 text-foreground-2", compact ? "text-caption1" : "text-body1")}>{children}</div>}
      </div>
    </li>
  );
});
