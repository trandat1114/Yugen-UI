import * as React from "react";
import { cn } from "@/lib/cn";

/** Fluent 2 ProgressBar — https://fluent2.microsoft.design/components/web/react/core/progressbar/usage */
const COLOR = {
  brand: "bg-brand-background",
  success: "bg-success-background-3",
  warning: "bg-warning-background-3",
  error: "bg-danger-background-3",
} as const;

export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Giá trị từ 0 tới `max`. Bỏ trống để hiển thị dạng indeterminate (không xác định). */
  value?: number;
  /** Giá trị tối đa. */
  max?: number;
  /** medium = 2px, large = 4px. */
  thickness?: "medium" | "large";
  shape?: "rounded" | "square";
  color?: keyof typeof COLOR;
  /** Nhãn phía trên thanh (liên kết bằng aria-labelledby). */
  label?: React.ReactNode;
  /** Mô tả / trạng thái phía dưới thanh (liên kết bằng aria-describedby). */
  description?: React.ReactNode;
  /** Class cho khối ngoài khi có label / description. */
  rootClassName?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 1,
      thickness = "medium",
      shape = "rounded",
      color = "brand",
      label,
      description,
      className,
      rootClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const barId = id ?? autoId;
    const labelId = `${barId}-label`;
    const descriptionId = `${barId}-description`;
    const indeterminate = value === undefined || Number.isNaN(value);
    const safeMax = max > 0 ? max : 1;
    const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), safeMax);
    const radius = shape === "rounded" ? "rounded-circular" : "rounded-none";

    const bar = (
      <div
        ref={ref}
        id={barId}
        role="progressbar"
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative block w-full overflow-hidden bg-background-6",
          thickness === "large" ? "h-1" : "h-0.5",
          radius,
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "absolute inset-y-0",
            radius,
            COLOR[color],
            indeterminate
              ? // Keyframe animate `left` vật lý → RTL chạy ngược để thanh đi từ phải sang trái.
                "w-1/3 animate-indeterminate rtl:[animation-direction:reverse] motion-reduce:inset-s-0 motion-reduce:w-full motion-reduce:animate-pulse"
              : "inset-s-0 transition-[width] duration-normal ease-easy-ease motion-reduce:transition-none",
          )}
          style={indeterminate ? undefined : { width: `${(clamped / safeMax) * 100}%` }}
        />
      </div>
    );

    if (!label && !description) return bar;

    return (
      <div className={cn("flex w-full flex-col gap-XS", rootClassName)}>
        {label && (
          <span id={labelId} className="text-body1 text-foreground-1">
            {label}
          </span>
        )}
        {bar}
        {description && (
          <span id={descriptionId} className="text-caption1 text-foreground-3">
            {description}
          </span>
        )}
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
