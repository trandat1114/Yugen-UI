import * as React from "react";
import { cn } from "@/lib/cn";
import { useYugenMessages } from "../YugenProvider/context";
import { spinnerMessages } from "./messages";

export { spinnerMessages, spinnerMessagesEn, type SpinnerMessages } from "./messages";

/** Fluent 2 Spinner — https://fluent2.microsoft.design/components/web/react/core/spinner/usage */
const SIZE = {
  "extra-tiny": { px: 16, stroke: 2, className: "size-4", label: "text-body1" },
  tiny: { px: 20, stroke: 2, className: "size-5", label: "text-body1" },
  "extra-small": { px: 24, stroke: 2, className: "size-6", label: "text-body1" },
  small: { px: 28, stroke: 2, className: "size-7", label: "text-body1" },
  medium: { px: 32, stroke: 3, className: "size-8", label: "text-subtitle2 font-semibold" },
  large: { px: 36, stroke: 3, className: "size-9", label: "text-subtitle2 font-semibold" },
  "extra-large": { px: 40, stroke: 3, className: "size-10", label: "text-subtitle1 font-semibold" },
  huge: { px: 44, stroke: 4, className: "size-11", label: "text-subtitle1 font-semibold" },
} as const;

const APPEARANCE = {
  primary: { track: "stroke-brand-stroke-2", arc: "stroke-brand-stroke", label: "text-foreground-1" },
  inverted: {
    track: "stroke-foreground-on-brand/20",
    arc: "stroke-foreground-on-brand",
    label: "text-foreground-on-brand",
  },
} as const;

export type SpinnerSize = keyof typeof SIZE;

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  /** primary: cung brand trên rãnh brand nhạt · inverted: dùng trên nền tối / nền brand. */
  appearance?: keyof typeof APPEARANCE;
  label?: React.ReactNode;
  labelPosition?: "before" | "after" | "above" | "below";
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "medium", appearance = "primary", label, labelPosition = "after", className, ...props }, ref) => {
    const labelId = React.useId();
    const msg = useYugenMessages("spinner", spinnerMessages);
    const s = SIZE[size];
    const a = APPEARANCE[appearance];
    const r = (s.px - s.stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const vertical = labelPosition === "above" || labelPosition === "below";
    const labelFirst = labelPosition === "before" || labelPosition === "above";

    const labelEl = label ? (
      <span id={labelId} className={cn(s.label, a.label)}>
        {label}
      </span>
    ) : null;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : msg.label}
        className={cn("inline-flex items-center justify-center gap-2", vertical && "flex-col", className)}
        {...props}
      >
        {labelFirst && labelEl}
        <svg
          aria-hidden
          viewBox={`0 0 ${s.px} ${s.px}`}
          fill="none"
          className={cn("shrink-0 animate-spin", s.className)}
        >
          <circle cx={s.px / 2} cy={s.px / 2} r={r} strokeWidth={s.stroke} className={a.track} />
          <circle
            cx={s.px / 2}
            cy={s.px / 2}
            r={r}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.3} ${circumference}`}
            className={a.arc}
          />
        </svg>
        {!labelFirst && labelEl}
      </div>
    );
  },
);
Spinner.displayName = "Spinner";
