import * as React from "react";
import { Calendar20Regular, Dismiss16Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { fieldControlClass } from "@/components/ui/Field/Field";
import { Popover, PopoverAnchor, PopoverSurface, PopoverTrigger } from "@/components/ui/Popover/Popover";

/**
 * Vỏ chung của họ DatePicker (DatePicker, DateRangePicker, MonthPicker, YearPicker, DateTimePicker): nút combobox hiện giá
 * trị, nút xoá, icon lịch và popover. Chỉ dùng nội bộ — không export qua barrel.
 */

/** Định dạng ngày dạng số theo locale (vi-VN: dd/MM/yyyy) — một Intl.DateTimeFormat cho mỗi locale + kiểu. */
const formatCache = new Map<string, (date: Date) => string>();
export function cachedDateFormat(locale: string, options: Intl.DateTimeFormatOptions): (date: Date) => string {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = formatCache.get(key);
  if (!format) {
    let f: Intl.DateTimeFormat;
    try {
      f = new Intl.DateTimeFormat(locale, options);
    } catch {
      f = new Intl.DateTimeFormat("en-US", options);
    }
    format = (date: Date) => f.format(date);
    formatCache.set(key, format);
  }
  return format;
}

export const numericDateFormat = (locale: string) => cachedDateFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" });

const SIZE = {
  small: "h-6 ps-2 pe-0.5 text-caption1",
  medium: "h-8 ps-2.5 pe-1 text-body1",
  large: "h-10 ps-3 pe-2 text-body2",
} as const;

export interface PickerBaseProps {
  /** id cho nút kích hoạt (Field tự gắn). */
  id?: string;
  /** Mặc định lấy từ `messages.<picker>.placeholder`. */
  placeholder?: string;
  /** Hiện nút xoá khi đã có giá trị. */
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  size?: keyof typeof SIZE;
  /** Ngày nhỏ nhất / lớn nhất được chọn. */
  minDate?: Date;
  maxDate?: Date;
  /** Hàm định dạng hiển thị; mặc định theo `locale` của YugenProvider. */
  formatDate?: (date: Date) => string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export interface PickerShellProps extends Omit<PickerBaseProps, "formatDate" | "minDate" | "maxDate"> {
  display: string;
  clearLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClear?: () => void;
  surfaceClassName?: string;
  /** Icon cuối ô (mặc định lịch). */
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean; onClick?: () => void }>;
  children: React.ReactNode;
}

export function PickerShell({
  id,
  display,
  placeholder,
  disabled,
  required,
  size = "medium",
  className,
  open,
  onOpenChange,
  onClear,
  clearLabel,
  surfaceClassName,
  icon: Icon = Calendar20Regular,
  children,
  ...aria
}: PickerShellProps) {
  const invalid = aria["aria-invalid"];
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div
          data-disabled={disabled ? "true" : undefined}
          data-invalid={invalid ? "true" : undefined}
          className={cn(fieldControlClass, "flex w-full items-center gap-0.5", SIZE[size], className)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              id={id}
              disabled={disabled}
              // Combobox (như DatePicker của Fluent): tên lấy từ nhãn, nội dung là giá trị; hỗ trợ aria-required.
              role="combobox"
              aria-haspopup="dialog"
              aria-required={required || undefined}
              {...aria}
              className="flex h-full min-w-0 flex-1 items-center text-start outline-none disabled:cursor-not-allowed"
            >
              <span className={cn("truncate", !display && (disabled ? "text-foreground-disabled" : "text-foreground-4"))}>
                {display || placeholder}
              </span>
            </button>
          </PopoverTrigger>
          {onClear && display && !disabled && (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={onClear}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-small text-foreground-3 hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed"
            >
              <Dismiss16Regular />
            </button>
          )}
          <Icon
            aria-hidden
            onClick={() => !disabled && onOpenChange(true)}
            className={cn("size-5 shrink-0", disabled ? "text-foreground-disabled" : "cursor-pointer text-foreground-3")}
          />
        </div>
      </PopoverAnchor>
      <PopoverSurface size="small" align="start" className={cn("w-auto", surfaceClassName)}>
        {children}
      </PopoverSurface>
    </Popover>
  );
}

export function boundsOf(minDate?: Date, maxDate?: Date) {
  const disabled = [minDate && { before: minDate }, maxDate && { after: maxDate }].filter(
    (m): m is { before: Date } | { after: Date } => Boolean(m),
  );
  return { disabled: disabled.length ? disabled : undefined, startMonth: minDate, endMonth: maxDate };
}
