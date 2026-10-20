import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Calendar20Regular, Dismiss16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Calendar } from "@/components/ui/Calendar/Calendar";
import { fieldControlClass } from "@/components/ui/Field/Field";
import { Popover, PopoverAnchor, PopoverSurface, PopoverTrigger } from "@/components/ui/Popover/Popover";

/** Fluent 2 DatePicker — https://fluent2.microsoft.design/components/web/react/core/datepicker/usage */
export type { DateRange };

/** Định dạng mặc định dd/MM/yyyy. */
export function formatDateVi(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

const SIZE = {
  small: "h-6 ps-S pe-XXS text-caption1",
  medium: "h-8 ps-MNudge pe-XS text-body1",
  large: "h-10 ps-M pe-S text-body2",
} as const;

interface PickerBaseProps {
  /** id cho nút kích hoạt (Field tự gắn). */
  id?: string;
  placeholder?: string;
  /** Hiện nút xoá khi đã có giá trị. */
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  size?: keyof typeof SIZE;
  /** Ngày nhỏ nhất / lớn nhất được chọn. */
  minDate?: Date;
  maxDate?: Date;
  /** Hàm định dạng hiển thị; mặc định dd/MM/yyyy. */
  formatDate?: (date: Date) => string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

interface PickerShellProps extends Omit<PickerBaseProps, "formatDate" | "minDate" | "maxDate"> {
  display: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClear?: () => void;
  surfaceClassName?: string;
  children: React.ReactNode;
}

function PickerShell({
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
  surfaceClassName,
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
          className={cn(fieldControlClass, "flex w-full items-center gap-XXS", SIZE[size], className)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              id={id}
              disabled={disabled}
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
              aria-label="Xoá giá trị"
              onClick={onClear}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-small text-foreground-3 hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed"
            >
              <Dismiss16Regular />
            </button>
          )}
          <Calendar20Regular
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

function boundsOf(minDate?: Date, maxDate?: Date) {
  const disabled = [minDate && { before: minDate }, maxDate && { after: maxDate }].filter(
    (m): m is { before: Date } | { after: Date } => Boolean(m),
  );
  return { disabled: disabled.length ? disabled : undefined, startMonth: minDate, endMonth: maxDate };
}

/* ------------------------------------------------------------------ DatePicker */

export interface DatePickerProps extends PickerBaseProps {
  /** Giá trị (controlled). `null` = trống. */
  value?: Date | null;
  defaultValue?: Date | null;
  /** Gọi khi chọn hoặc xoá ngày. */
  onSelectDate?: (date: Date | undefined) => void;
}

export function DatePicker({
  value,
  defaultValue = null,
  onSelectDate,
  placeholder = "Chọn ngày…",
  clearable = false,
  formatDate = formatDateVi,
  minDate,
  maxDate,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inner, setInner] = React.useState<Date | null>(defaultValue);
  const current = (value !== undefined ? value : inner) ?? undefined;

  const commit = (date: Date | undefined) => {
    if (value === undefined) setInner(date ?? null);
    onSelectDate?.(date);
  };

  return (
    <PickerShell
      {...props}
      placeholder={placeholder}
      display={current ? formatDate(current) : ""}
      open={open}
      onOpenChange={setOpen}
      onClear={clearable ? () => commit(undefined) : undefined}
    >
      <Calendar
        mode="single"
        autoFocus
        selected={current}
        defaultMonth={current}
        onSelect={(date) => {
          commit(date);
          setOpen(false);
        }}
        {...boundsOf(minDate, maxDate)}
      />
    </PickerShell>
  );
}

/* ------------------------------------------------------------------ DateRangePicker */

export interface DateRangePickerProps extends PickerBaseProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onSelectRange?: (range: DateRange | undefined) => void;
  /** Số tháng hiển thị trong popover. */
  numberOfMonths?: number;
}

export function DateRangePicker({
  value,
  defaultValue = null,
  onSelectRange,
  placeholder = "Chọn khoảng ngày…",
  clearable = false,
  formatDate = formatDateVi,
  minDate,
  maxDate,
  numberOfMonths = 2,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inner, setInner] = React.useState<DateRange | null>(defaultValue);
  const current = (value !== undefined ? value : inner) ?? undefined;

  const commit = (range: DateRange | undefined) => {
    if (value === undefined) setInner(range ?? null);
    onSelectRange?.(range);
  };

  const display = current?.from ? `${formatDate(current.from)} – ${current.to ? formatDate(current.to) : "…"}` : "";

  return (
    <PickerShell
      {...props}
      placeholder={placeholder}
      display={display}
      open={open}
      onOpenChange={setOpen}
      onClear={clearable ? () => commit(undefined) : undefined}
      surfaceClassName="max-w-[calc(100vw-24px)]"
    >
      <Calendar
        mode="range"
        autoFocus
        resetOnSelect
        numberOfMonths={numberOfMonths}
        selected={current}
        defaultMonth={current?.from}
        onSelect={(range) => {
          commit(range);
          if (range?.from && range.to) setOpen(false);
        }}
        {...boundsOf(minDate, maxDate)}
      />
    </PickerShell>
  );
}
