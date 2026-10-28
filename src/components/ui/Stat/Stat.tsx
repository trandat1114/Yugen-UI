import * as React from "react";
import { ArrowTrending16Regular, ArrowTrendingDown16Regular, Subtract16Regular } from "@fluentui/react-icons";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { statMessages } from "./messages";
import { cn } from "@/lib/cn";

export { statMessages, statMessagesEn, type StatMessages } from "./messages";

/** Tuỳ chọn Intl.NumberFormat, hoặc hàm tự định dạng. */
export type StatNumberFormat = Intl.NumberFormatOptions | ((value: number) => string);

const formatCache = new Map<string, Intl.NumberFormat>();

function formatNumber(value: number, locale: string, format: StatNumberFormat) {
  if (typeof format === "function") return format(value);
  const key = `${locale}|${JSON.stringify(format)}`;
  let f = formatCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, format);
    formatCache.set(key, f);
  }
  return f.format(value);
}

const VALUE_SIZE = { medium: "text-title2", large: "text-large-title", hero: "text-display" } as const;

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Nhãn viết hoa chữ đầu câu, không dấu hai chấm. */
  label: React.ReactNode;
  value: number | string;
  /** Mặc định tự rút gọn từ 10.000 (12,9 N; 4,2 Tr…). */
  valueFormat?: StatNumberFormat;
  /** Locale cho Intl.NumberFormat. Mặc định lấy từ YugenProvider. */
  locale?: string;
  /** Mức thay đổi có dấu (0.124 = +12,4% với định dạng mặc định). */
  delta?: number;
  deltaFormat?: StatNumberFormat;
  /** So với kỳ nào — vd. "so với tháng trước". */
  deltaLabel?: React.ReactNode;
  /** Chiều nào là tốt: quyết định màu success / danger của delta. */
  goodDirection?: "up" | "down" | "neutral";
  /** medium 28px · large 40px · hero 68px (một hero mỗi màn hình). */
  size?: "medium" | "large" | "hero";
  icon?: React.ReactNode;
  /** Biểu đồ nhỏ cạnh con số, thường là `<Sparkline />`. */
  chart?: React.ReactNode;
}

/** Stat — con số chính + mức thay đổi + biểu đồ nhỏ tuỳ chọn. */
export const Stat = React.forwardRef<HTMLDivElement, StatProps>(function Stat(
  {
    label,
    value,
    valueFormat,
    locale: localeProp,
    delta,
    deltaFormat,
    deltaLabel,
    goodDirection = "up",
    size = "medium",
    icon,
    chart,
    className,
    ...props
  },
  ref,
) {
  const yugen = useYugen();
  const locale = localeProp ?? yugen.locale;
  const msg = useYugenMessages("stat", statMessages);
  const valueText =
    typeof value === "number"
      ? formatNumber(
          value,
          locale,
          valueFormat ?? (Math.abs(value) >= 1e4 ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 2 }),
        )
      : value;
  const deltaText =
    delta === undefined
      ? ""
      : formatNumber(delta, locale, deltaFormat ?? { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" });
  const direction = delta === undefined || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  const tone = direction === "flat" || goodDirection === "neutral" ? "neutral" : direction === goodDirection ? "good" : "bad";
  const DeltaIcon = direction === "up" ? ArrowTrending16Regular : direction === "down" ? ArrowTrendingDown16Regular : Subtract16Regular;
  const directionText = direction === "up" ? msg.increase : direction === "down" ? msg.decrease : msg.noChange;

  return (
    <div ref={ref} className={cn("flex min-w-0 flex-col gap-1", className)} {...props}>
      <div className="flex items-center gap-2 text-body1 text-foreground-2">
        {icon && <span className="flex shrink-0 text-foreground-3 [&_svg]:size-5">{icon}</span>}
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className={cn("font-sans font-semibold text-foreground-1 tabular-nums", VALUE_SIZE[size])}>
            <bdi>{valueText}</bdi>
          </div>
          {delta !== undefined && (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-caption1">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold tabular-nums",
                  tone === "good" ? "text-success-foreground-1" : tone === "bad" ? "text-danger-foreground-1" : "text-foreground-2",
                )}
              >
                <DeltaIcon aria-hidden className="shrink-0 rtl:-scale-x-100" />
                <span className="sr-only">{directionText}</span>
                <bdi>{deltaText}</bdi>
              </span>
              {deltaLabel && <span className="text-foreground-3">{deltaLabel}</span>}
            </div>
          )}
        </div>
        {chart}
      </div>
    </div>
  );
});
