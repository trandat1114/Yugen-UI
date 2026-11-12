import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import type { DateRange } from "@/components/ui/Calendar/Calendar";
import { cn } from "@/lib/cn";
import { warnDeprecated } from "@/lib/deprecate";
import { Calendar } from "@/components/ui/Calendar/Calendar";
import { useYugenLocale, useYugenMessages, useComponentDefaults, COMPACT_SIZE } from "../YugenProvider/context";
import { PickerShell, boundsOf, numericDateFormat, type PickerBaseProps } from "./pickerShell";
import { datePickerMessagesEn, dateRangePickerMessagesEn, type DateRangePickerMessages } from "./messages";

export {
  datePickerMessages, datePickerMessagesVi,
  datePickerMessagesEn,
  dateRangePickerMessages, dateRangePickerMessagesVi,
  dateRangePickerMessagesEn,
  type DatePickerMessages,
  type DateRangePickerMessages,
} from "./messages";

// Cùng họ, cùng vỏ (pickerShell): import được từ "@/components/ui/DatePicker/DatePicker" như DatePicker.
export * from "./MonthPicker";
export * from "./DateTimePicker";

/** Fluent 2 DatePicker — https://fluent2.microsoft.design/components/web/react/core/datepicker/usage */
export type { DateRange };

/**
 * Định dạng dd/MM/yyyy (như vi-VN).
 * @deprecated DatePicker formats dates by `locale`; use `new Intl.DateTimeFormat("vi-VN").format(date)` or the
 * `formatDate` prop. Will be removed from the package exports in v1.0.0.
 */
export function formatDateVi(date: Date) {
  warnDeprecated("formatDateVi", 'use new Intl.DateTimeFormat("vi-VN").format(date) or the formatDate prop', "1.0.0");
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/* ------------------------------------------------------------------ DatePicker */

export interface DatePickerProps extends PickerBaseProps {
  /** Giá trị (controlled). `null` = trống. */
  value?: Date | null;
  defaultValue?: Date | null;
  /** Gọi khi chọn hoặc xoá ngày; `null` khi xoá (cùng kiểu với `value`). */
  onValueChange?: (date: Date | null) => void;
  /** @deprecated Use `onValueChange` (receives `null` instead of `undefined` when cleared). Will be removed in v1.0.0. */
  onSelectDate?: (date: Date | undefined) => void;
}

export function DatePicker(inProps: DatePickerProps) {
  const {
    value,
    defaultValue = null,
    onValueChange,
    onSelectDate,
    placeholder,
    clearable = false,
    formatDate,
    minDate,
    maxDate,
    ...props
  } = useComponentDefaults("DatePicker", inProps, COMPACT_SIZE);
  const msg = useYugenMessages("datePicker", datePickerMessagesEn);
  const locale = useYugenLocale();
  const format = formatDate ?? numericDateFormat(locale);
  const [open, setOpen] = React.useState(false);
  if (onSelectDate !== undefined) warnDeprecated("DatePicker.onSelectDate", "use onValueChange", "1.0.0");
  // Callback gọi riêng, không qua hook: chọn lại đúng ngày đang chọn vẫn báo (như trước), và onSelectDate cũ nhận undefined.
  const [selected, setSelected] = useControllableState<Date | null>({ value, defaultValue });
  const current = selected ?? undefined;

  const commit = (date: Date | undefined) => {
    setSelected(date ?? null);
    if (onValueChange) onValueChange(date ?? null);
    else onSelectDate?.(date);
  };

  return (
    <PickerShell
      {...props}
      placeholder={placeholder ?? msg.placeholder}
      display={current ? format(current) : ""}
      open={open}
      onOpenChange={setOpen}
      onClear={clearable ? () => commit(undefined) : undefined}
      clearLabel={msg.clear}
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

/**
 * Preset mặc định: Hôm nay, 7 ngày qua, 30 ngày qua, Tháng này (đến hôm nay), Tháng trước. Nhãn hiển thị lấy theo
 * `messages.dateRangePicker` (`label` ở đây là bản tiếng Việt).
 */
export const DEFAULT_RANGE_PRESETS: DateRangePreset[] = [
  { label: dateRangePickerMessagesEn.today, range: () => lastDays(1) },
  { label: dateRangePickerMessagesEn.last7Days, range: () => lastDays(7) },
  { label: dateRangePickerMessagesEn.last30Days, range: () => lastDays(30) },
  {
    label: dateRangePickerMessagesEn.thisMonth,
    range: () => {
      const to = startOfDay(new Date());
      return { from: new Date(to.getFullYear(), to.getMonth(), 1), to };
    },
  },
  {
    label: dateRangePickerMessagesEn.lastMonth,
    range: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0) };
    },
  },
];

/** Preset mặc định → khoá nhãn trong `messages.dateRangePicker` (nhận theo tham chiếu, kể cả khi trộn với preset riêng). */
const DEFAULT_PRESET_KEY = new Map<DateRangePreset, keyof DateRangePickerMessages>(
  (["today", "last7Days", "last30Days", "thisMonth", "lastMonth"] as const).map((key, i) => [DEFAULT_RANGE_PRESETS[i], key]),
);

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
  const msg = useYugenMessages("dateRangePicker", dateRangePickerMessagesEn);
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
        const key = DEFAULT_PRESET_KEY.get(preset);
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
            {key ? msg[key] : preset.label}
          </button>
        );
      })}
    </div>
  );
}

export interface DateRangePickerProps extends PickerBaseProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  /** Gọi khi chọn hoặc xoá khoảng ngày; `null` khi xoá (cùng kiểu với `value`). */
  onValueChange?: (range: DateRange | null) => void;
  /** @deprecated Use `onValueChange` (receives `null` instead of `undefined` when cleared). Will be removed in v1.0.0. */
  onSelectRange?: (range: DateRange | undefined) => void;
  /** Số tháng hiển thị trong popover. */
  numberOfMonths?: number;
  /** Lựa chọn nhanh hiển thị cạnh lịch (xếp trên lịch ở màn hẹp), vd. `DEFAULT_RANGE_PRESETS`. */
  presets?: DateRangePreset[];
  /** Nhãn nhóm preset cho trình đọc màn hình. Mặc định lấy từ `messages.dateRangePicker.presets`. */
  presetsLabel?: string;
}

export function DateRangePicker(inProps: DateRangePickerProps) {
  const {
    value,
    defaultValue = null,
    onValueChange,
    onSelectRange,
    placeholder,
    clearable = false,
    formatDate,
    minDate,
    maxDate,
    numberOfMonths = 2,
    presets,
    presetsLabel,
    ...props
  } = useComponentDefaults("DateRangePicker", inProps, COMPACT_SIZE);
  const msg = useYugenMessages("dateRangePicker", dateRangePickerMessagesEn);
  const locale = useYugenLocale();
  const format = formatDate ?? numericDateFormat(locale);
  const [open, setOpen] = React.useState(false);
  if (onSelectRange !== undefined) warnDeprecated("DateRangePicker.onSelectRange", "use onValueChange", "1.0.0");
  const [selected, setSelected] = useControllableState<DateRange | null>({ value, defaultValue });
  const current = selected ?? undefined;

  const commit = (range: DateRange | undefined) => {
    setSelected(range ?? null);
    if (onValueChange) onValueChange(range ?? null);
    else onSelectRange?.(range);
  };

  const display = current?.from ? `${format(current.from)} – ${current.to ? format(current.to) : "…"}` : "";

  return (
    <PickerShell
      {...props}
      placeholder={placeholder ?? msg.placeholder}
      display={display}
      open={open}
      onOpenChange={setOpen}
      onClear={clearable ? () => commit(undefined) : undefined}
      clearLabel={msg.clear}
      surfaceClassName="max-w-[calc(100vw-24px)]"
    >
      <div className={presets?.length ? "flex flex-col gap-2 sm:flex-row" : "contents"}>
      {presets?.length ? (
        <PresetList
          presets={presets}
          current={current}
          minDate={minDate}
          maxDate={maxDate}
          label={presetsLabel ?? msg.presets}
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

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    DatePicker: DatePickerProps;
    DateRangePicker: DateRangePickerProps;
  }
}
