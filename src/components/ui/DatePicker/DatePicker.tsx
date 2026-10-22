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
  small: "h-6 ps-2 pe-0.5 text-caption1",
  medium: "h-8 ps-2.5 pe-1 text-body1",
  large: "h-10 ps-3 pe-2 text-body2",
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

/** Một lựa chọn nhanh: `range()` được gọi lúc render / bấm nên luôn tính theo "bây giờ". */
export interface DateRangePreset {
  label: string;
  range: () => { from: Date; to: Date };
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const lastDays = (n: number) => {
  const to = startOfDay(new Date());
  return { from: new Date(to.getFullYear(), to.getMonth(), to.getDate() - (n - 1)), to };
};

/** Preset mặc định: Hôm nay, 7 ngày qua, 30 ngày qua, Tháng này (đến hôm nay), Tháng trước. */
export const DEFAULT_RANGE_PRESETS: DateRangePreset[] = [
  { label: "Hôm nay", range: () => lastDays(1) },
  { label: "7 ngày qua", range: () => lastDays(7) },
  { label: "30 ngày qua", range: () => lastDays(30) },
  {
    label: "Tháng này",
    range: () => {
      const to = startOfDay(new Date());
      return { from: new Date(to.getFullYear(), to.getMonth(), 1), to };
    },
  },
  {
    label: "Tháng trước",
    range: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0) };
    },
  },
];

const sameDay = (a?: Date, b?: Date) => !!a && !!b && startOfDay(a).getTime() === startOfDay(b).getTime();

function PresetList({
  presets,
  current,
  minDate,
  maxDate,
  label,
  onPick,
}: {
  presets: DateRangePreset[];
  current?: DateRange;
  minDate?: Date;
  maxDate?: Date;
  label: string;
  onPick: (range: { from: Date; to: Date }) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap gap-1 border-b border-stroke-2 pb-2 sm:w-36 sm:shrink-0 sm:flex-col sm:flex-nowrap sm:border-e sm:border-b-0 sm:pe-2 sm:pb-0"
    >
      {presets.map((preset) => {
        const r = preset.range();
        const active = sameDay(current?.from, r.from) && sameDay(current?.to, r.to);
        const outOfBounds = (!!minDate && r.from < startOfDay(minDate)) || (!!maxDate && startOfDay(r.to) > startOfDay(maxDate));
        return (
          <button
            key={preset.label}
            type="button"
            aria-pressed={active}
            disabled={outOfBounds}
            onClick={() => onPick(r)}
            className={cn(
              "inline-flex h-8 shrink-0 cursor-pointer items-center rounded-medium px-2 text-start text-body1 whitespace-nowrap text-foreground-2",
              "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
              "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-foreground-disabled",
              active && "bg-brand-background-2 font-semibold text-brand-foreground-2 hover:bg-brand-background-2-hover hover:text-brand-foreground-2",
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}

export interface DateRangePickerProps extends PickerBaseProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onSelectRange?: (range: DateRange | undefined) => void;
  /** Số tháng hiển thị trong popover. */
  numberOfMonths?: number;
  /** Lựa chọn nhanh hiển thị cạnh lịch (xếp trên lịch ở màn hẹp), vd. `DEFAULT_RANGE_PRESETS`. */
  presets?: DateRangePreset[];
  /** Nhãn nhóm preset cho trình đọc màn hình. */
  presetsLabel?: string;
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
  presets,
  presetsLabel = "Chọn nhanh khoảng ngày",
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
      <div className={presets?.length ? "flex flex-col gap-2 sm:flex-row" : "contents"}>
      {presets?.length ? (
        <PresetList
          presets={presets}
          current={current}
          minDate={minDate}
          maxDate={maxDate}
          label={presetsLabel}
          onPick={(r) => {
            commit({ from: r.from, to: r.to });
            setOpen(false);
          }}
        />
      ) : null}
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
      </div>
    </PickerShell>
  );
}
