/** Fluent 2 Rating — https://fluent2.microsoft.design/components/web/react/core/rating/usage */
import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import {
  Star12Filled,
  Star12Regular,
  Star16Filled,
  Star16Regular,
  Star20Filled,
  Star20Regular,
  Star28Filled,
  Star28Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { ratingMessages } from "./messages";

export { ratingMessages, type RatingMessages } from "./messages";
export { ratingMessagesEn } from "./messages.en";

export type RatingColor = "brand" | "marigold" | "neutral";
export type RatingSize = "small" | "medium" | "large" | "extra-large";

const ICONS = {
  small: { Filled: Star12Filled, Regular: Star12Regular, icon: "size-3", gap: "gap-0.5", text: "text-caption1" },
  medium: { Filled: Star16Filled, Regular: Star16Regular, icon: "size-4", gap: "gap-0.5", text: "text-body1" },
  large: { Filled: Star20Filled, Regular: Star20Regular, icon: "size-5", gap: "gap-1", text: "text-body2" },
  "extra-large": { Filled: Star28Filled, Regular: Star28Regular, icon: "size-7", gap: "gap-1", text: "text-subtitle1" },
} as const;

/** Màu sao đã chọn. Marigold: thiếu token colorPaletteMarigoldBorderActive → dùng colorPaletteMarigoldForeground2. */
const FILLED = { brand: "text-brand-foreground-1", marigold: "text-marigold-active", neutral: "text-foreground-1" } as const;
/** Sao chưa chọn ở RatingDisplay (icon đặc, màu nhạt) — đúng token Fluent. */
const UNFILLED_DISPLAY = { brand: "text-brand-stroke-2", marigold: "text-marigold-bg", neutral: "text-background-1-pressed" } as const;

type Fill = "full" | "half" | "empty";

function fillOf(shown: number, n: number): Fill {
  if (shown >= n) return "full";
  if (shown >= n - 0.5) return "half";
  return "empty";
}

/** Một ngôi sao: icon nền + icon đặc bị cắt theo phần trăm đã tô. */
function Star({
  fill,
  size,
  filledClass,
  unfilledClass,
  outlineWhenEmpty,
}: {
  fill: Fill;
  size: RatingSize;
  filledClass: string;
  unfilledClass: string;
  outlineWhenEmpty: boolean;
}) {
  const { Filled, Regular, icon } = ICONS[size];
  const Base = outlineWhenEmpty ? Regular : Filled;
  return (
    <span aria-hidden className={cn("relative inline-flex shrink-0", icon)}>
      <Base className={cn("shrink-0", icon, unfilledClass)} />
      {fill !== "empty" && (
        <span className={cn("absolute inset-y-0 inset-s-0 flex overflow-hidden", fill === "half" ? "w-1/2" : "w-full")}>
          <Filled className={cn("max-w-none shrink-0", icon, filledClass)} />
        </span>
      )}
    </span>
  );
}

/* --------------------------------------------------------------- Rating */

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "color"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Số sao. Mặc định 5. */
  max?: number;
  /** 1 (mặc định) hoặc 0.5 để cho phép nửa sao. */
  step?: 1 | 0.5;
  color?: RatingColor;
  /** Mặc định extra-large (như Fluent). */
  size?: RatingSize;
  disabled?: boolean;
  /** name của nhóm radio (tự sinh nếu bỏ trống). */
  name?: string;
  /** Nhãn đọc cho từng giá trị. Mặc định lấy từ `messages.rating.item`. */
  itemLabel?: (value: number) => string;
}

/** Rating tương tác — bản chất là nhóm radio: Tab vào, phím mũi tên đổi giá trị, rê chuột để xem trước. */
export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      onValueChange,
      max = 5,
      step = 1,
      color = "neutral",
      size = "extra-large",
      disabled,
      name,
      itemLabel,
      className,
      onMouseLeave,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const dir = useDirection();
    const msg = useYugenMessages("rating", ratingMessages);
    const { locale } = useYugen();
    const labelOf = itemLabel ?? ((v: number) => msg.item(v, v.toLocaleString(locale)));
    const autoName = React.useId();
    const groupName = name ?? autoName;
    const [inner, setInner] = React.useState(defaultValue);
    const current = value !== undefined ? value : inner;
    const [hover, setHover] = React.useState<number | null>(null);
    const shown = hover ?? current;
    const { gap } = ICONS[size];

    const select = (v: number) => {
      if (value === undefined) setInner(v);
      onValueChange?.(v);
    };

    // Radio gốc xử lý ArrowLeft/Right khác nhau giữa trình duyệt khi RTL → tự xử lý theo chiều hiển thị.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      const radios = Array.from(e.currentTarget.querySelectorAll<HTMLInputElement>("input[type=radio]:not(:disabled)"));
      const index = radios.indexOf(e.target as HTMLInputElement);
      if (index === -1) return;
      e.preventDefault();
      const forward = (e.key === "ArrowRight") !== (dir === "rtl");
      const target = radios[(index + (forward ? 1 : -1) + radios.length) % radios.length];
      target.focus();
      target.click();
    };

    const radio = (v: number, position: string) => (
      <input
        type="radio"
        name={groupName}
        value={v}
        checked={current === v}
        disabled={disabled}
        aria-label={labelOf(v)}
        onChange={() => select(v)}
        onMouseEnter={() => !disabled && setHover(v)}
        className={cn(
          "absolute inset-y-0 m-0 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed",
          position,
        )}
      />
    );

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-disabled={disabled || undefined}
        onMouseLeave={(e) => {
          setHover(null);
          onMouseLeave?.(e);
        }}
        onKeyDown={handleKeyDown}
        className={cn("inline-flex items-center", gap, className)}
        {...props}
      >
        {Array.from({ length: max }, (_, k) => {
          const n = k + 1;
          return (
            <span
              key={n}
              className="relative inline-flex rounded-small has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-1 has-[input:focus-visible]:outline-stroke-focus"
            >
              <Star
                fill={fillOf(shown, n)}
                size={size}
                filledClass={disabled ? "text-foreground-disabled" : FILLED[color]}
                unfilledClass={disabled ? "text-foreground-disabled" : FILLED[color]}
                outlineWhenEmpty
              />
              {step === 0.5 && radio(n - 0.5, "inset-s-0 w-1/2")}
              {radio(n, step === 0.5 ? "inset-e-0 w-1/2" : "inset-x-0")}
            </span>
          );
        })}
      </div>
    );
  },
);
Rating.displayName = "Rating";

/* -------------------------------------------------------- RatingDisplay */

export interface RatingDisplayProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  value: number;
  /** Số sao. Mặc định 5. */
  max?: number;
  /** Số lượt đánh giá, hiển thị sau giá trị. */
  count?: number;
  /** Chỉ hiện một sao + giá trị (cho không gian hẹp). */
  compact?: boolean;
  color?: RatingColor;
  /** Mặc định medium. */
  size?: RatingSize;
  /** Ẩn chữ giá trị. */
  hideValue?: boolean;
}

/** RatingDisplay — hiển thị điểm đánh giá chỉ đọc, kèm giá trị và số lượt. */
export const RatingDisplay = React.forwardRef<HTMLDivElement, RatingDisplayProps>(
  ({ value, max = 5, count, compact, color = "neutral", size = "medium", hideValue, className, ...props }, ref) => {
    const rounded = Math.round(Math.min(Math.max(value, 0), max) * 2) / 2;
    const { gap, text } = ICONS[size];
    const msg = useYugenMessages("rating", ratingMessages);
    const { locale } = useYugen();
    const valueText = value.toLocaleString(locale, { maximumFractionDigits: 1 });
    const countText = count?.toLocaleString(locale);
    const label = msg.summary(valueText, max) + (count !== undefined ? `, ${msg.count(count, countText ?? "")}` : "");

    return (
      <div
        ref={ref}
        role="img"
        aria-label={label}
        className={cn("inline-flex items-center gap-1", text, className)}
        {...props}
      >
        <span className={cn("inline-flex items-center", gap)}>
          {compact ? (
            <Star fill="full" size={size} filledClass={FILLED[color]} unfilledClass={UNFILLED_DISPLAY[color]} outlineWhenEmpty={false} />
          ) : (
            Array.from({ length: max }, (_, k) => (
              <Star
                key={k}
                fill={fillOf(rounded, k + 1)}
                size={size}
                filledClass={FILLED[color]}
                unfilledClass={UNFILLED_DISPLAY[color]}
                outlineWhenEmpty={false}
              />
            ))
          )}
        </span>
        {!hideValue && (
          <span aria-hidden className="font-semibold text-foreground-1">
            {valueText}
          </span>
        )}
        {count !== undefined && (
          <span aria-hidden className="text-foreground-2 before:pe-1 before:content-['·']">
            {countText}
          </span>
        )}
      </div>
    );
  },
);
RatingDisplay.displayName = "RatingDisplay";
