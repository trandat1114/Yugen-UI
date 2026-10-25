/** Fluent 2 CounterBadge — https://storybooks.fluentui.dev/react/?path=/docs/components-badge-counterbadge--docs */
import * as React from "react";
import { cn } from "@/lib/cn";
import { Badge, type BadgeProps } from "../Badge/Badge";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden";
import { useYugenMessages } from "../YugenProvider/context";
import { counterBadgeMessages } from "./messages";

export { counterBadgeMessages, type CounterBadgeMessages } from "./messages";
export { counterBadgeMessagesEn } from "./messages.en";

type CounterBadgeSize = "small" | "medium" | "large" | "extra-large";
type CounterBadgeColor = "brand" | "danger" | "important" | "informative";

export interface CounterBadgeProps
  extends Omit<BadgeProps, "appearance" | "color" | "shape" | "size" | "icon" | "children"> {
  /** Số đếm. Mặc định 0. */
  count?: number;
  /** Vượt ngưỡng này hiển thị "{overflowCount}+". Mặc định 99. */
  overflowCount?: number;
  /** Vẫn hiện khi count = 0. */
  showZero?: boolean;
  /** Chỉ hiện chấm tròn (luôn hiện, không có số). */
  dot?: boolean;
  appearance?: "filled" | "ghost";
  color?: CounterBadgeColor;
  shape?: "circular" | "rounded";
  size?: CounterBadgeSize;
  /** Nhãn cho trình đọc màn hình. Mặc định lấy từ `messages.counterBadge` ("{count} thông báo" / "Hơn 99 thông báo" / "Có thông báo mới"). */
  label?: string;
}

const BADGE_COLOR: Record<CounterBadgeColor, "brand" | "danger" | "informative"> = {
  brand: "brand",
  danger: "danger",
  important: "informative",
  informative: "informative",
};

/** "important" = nền đảo (Fluent colorNeutralForeground1). */
const IMPORTANT = {
  filled: "bg-foreground-1 text-foreground-inverted",
  ghost: "text-foreground-1",
} as const;

const DOT_SIZE: Record<CounterBadgeSize, string> = {
  small: "size-1.5",
  medium: "size-2",
  large: "size-2.5",
  "extra-large": "size-3",
};

export const CounterBadge = React.forwardRef<HTMLSpanElement, CounterBadgeProps>(
  (
    {
      count = 0,
      overflowCount = 99,
      showZero = false,
      dot = false,
      appearance = "filled",
      color = "brand",
      shape = "circular",
      size = "medium",
      label,
      className,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("counterBadge", counterBadgeMessages);
    if (!dot && count === 0 && !showZero) return null;

    const overflow = count > overflowCount;
    const display = overflow ? `${overflowCount}+` : `${count}`;
    const srLabel = label ?? (dot ? msg.dot : overflow ? msg.overflow(overflowCount) : msg.count(count));
    const resolvedAppearance = dot ? "filled" : appearance;

    return (
      <Badge
        ref={ref}
        appearance={resolvedAppearance}
        color={BADGE_COLOR[color]}
        shape={shape}
        size={size}
        className={cn(
          "tabular-nums",
          color === "important" && IMPORTANT[resolvedAppearance],
          dot && cn("min-w-0 px-0", DOT_SIZE[size]),
          className,
        )}
        {...props}
      >
        {!dot && <span aria-hidden="true">{display}</span>}
        <VisuallyHidden>{srLabel}</VisuallyHidden>
      </Badge>
    );
  },
);
CounterBadge.displayName = "CounterBadge";
