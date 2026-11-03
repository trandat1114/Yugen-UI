import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { useControllableState } from "../hooks/useControllableState";
import { ChevronLeft20Regular, ChevronRight20Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { PickerShell, cachedDateFormat, type PickerBaseProps } from "./pickerShell";
import { monthPickerMessagesEn, yearPickerMessagesEn } from "./messages";

export {
  monthPickerMessagesVi,
  monthPickerMessagesEn,
  yearPickerMessagesVi,
  yearPickerMessagesEn,
  type MonthPickerMessages,
  type YearPickerMessages,
} from "./messages";

type View = "month" | "year";

/** Mỗi trang của YearPicker có 12 năm, bắt đầu từ bội số của 12 (2016–2027). */
const YEARS_PER_PAGE = 12;
const COLUMNS = 3;

/** Khoá so sánh theo tháng / năm (bỏ ngày, giờ). */
const keyOf = (date: Date, view: View) => (view === "month" ? date.getFullYear() * 12 + date.getMonth() : date.getFullYear());
const dateOf = (key: number, view: View) => (view === "month" ? new Date(Math.floor(key / 12), key % 12, 1) : new Date(key, 0, 1));
/** Ô đầu trang chứa `key`: tháng 1 của năm đó, hoặc năm đầu của nhóm 12 năm. */
const pageStart = (key: number, view: View) => (view === "month" ? key - (key % 12) : key - (((key % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE));

const navButtonClass = cn(
  "inline-flex size-8 items-center justify-center rounded-medium text-foreground-2",
  "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
  "disabled:pointer-events-none disabled:text-foreground-disabled",
);

interface PeriodGridProps {
  view: View;
  selected: Date | null;
  minDate?: Date;
  maxDate?: Date;
  locale: string;
  previousLabel: string;
  nextLabel: string;
  onSelect: (date: Date) => void;
}

/** Lưới 4 × 3 tháng hoặc năm, điều khiển bằng bàn phím như lịch ngày (mũi tên, Home / End, PageUp / PageDown). */
function PeriodGrid({ view, selected, minDate, maxDate, locale, previousLabel, nextLabel, onSelect }: PeriodGridProps) {
  const dir = useDirection();
  const headingId = React.useId();
  const min = minDate ? keyOf(minDate, view) : -Infinity;
  const max = maxDate ? keyOf(maxDate, view) : Infinity;
  const nowKey = React.useMemo(() => keyOf(new Date(), view), [view]);
  const [focused, setFocused] = React.useState(() => {
    const key = selected ? keyOf(selected, view) : nowKey;
    return Math.min(max, Math.max(min, key));
  });
  const gridRef = React.useRef<HTMLDivElement>(null);
  const moveFocus = React.useRef(true);

  // Mở popover: focus ô đang chọn (như Calendar autoFocus); sau đó chỉ khi di chuyển bằng bàn phím.
  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-key="${focused}"]`)?.focus();
  }, [focused]);

  const start = pageStart(focused, view);
  const keys = Array.from({ length: 12 }, (_, i) => start + i);
  const monthName = cachedDateFormat(locale, { month: "short" });
  const label = (key: number) => (view === "month" ? monthName(dateOf(key, view)) : String(key));
  const heading = view === "month" ? String(Math.floor(start / 12)) : `${start} – ${start + YEARS_PER_PAGE - 1}`;
  const pageSize = 12;

  const go = (key: number, focus: boolean) => {
    moveFocus.current = focus;
    setFocused(key);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const forward = dir === "rtl" ? -1 : 1;
    const column = (focused - start) % COLUMNS;
    const delta: Record<string, number> = {
      ArrowRight: forward,
      ArrowLeft: -forward,
      ArrowDown: COLUMNS,
      ArrowUp: -COLUMNS,
      Home: -column,
      End: COLUMNS - 1 - column,
      PageDown: pageSize,
      PageUp: -pageSize,
    };
    const step = delta[event.key];
    if (step === undefined) return;
    event.preventDefault();
    go(focused + step, true);
  };

  const selectedKey = selected ? keyOf(selected, view) : null;

  return (
    <div className="flex w-56 flex-col gap-2">
      <div className="flex h-8 items-center justify-between ps-2">
        <span id={headingId} aria-live="polite" className="text-body1 font-semibold text-foreground-1 tabular-nums">
          {heading}
        </span>
        <div className="flex items-center gap-0.5">
          <button type="button" aria-label={previousLabel} disabled={start - 1 < min} onClick={() => go(focused - pageSize, false)} className={navButtonClass}>
            <ChevronLeft20Regular aria-hidden className="size-5 rtl:-scale-x-100" />
          </button>
          <button type="button" aria-label={nextLabel} disabled={start + pageSize > max} onClick={() => go(focused + pageSize, false)} className={navButtonClass}>
            <ChevronRight20Regular aria-hidden className="size-5 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
      <div ref={gridRef} role="grid" aria-labelledby={headingId} onKeyDown={onKeyDown} className="flex flex-col gap-1">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} role="row" className="grid grid-cols-3 gap-1">
            {keys.slice(row * COLUMNS, row * COLUMNS + COLUMNS).map((key) => {
              const isSelected = key === selectedKey;
              const isCurrent = key === nowKey;
              const outOfRange = key < min || key > max;
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  data-key={key}
                  tabIndex={key === focused ? 0 : -1}
                  aria-selected={isSelected}
                  aria-disabled={outOfRange || undefined}
                  aria-current={isCurrent ? "date" : undefined}
                  onFocus={() => key !== focused && go(key, false)}
                  onClick={() => !outOfRange && onSelect(dateOf(key, view))}
                  className={cn(
                    "relative inline-flex h-10 items-center justify-center rounded-medium text-body1 text-foreground-1 tabular-nums",
                    "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover active:bg-subtle-pressed",
                    isCurrent &&
                      "font-semibold text-brand-foreground-1 after:absolute after:bottom-1.5 after:left-1/2 after:h-0.5 after:w-3 after:-translate-x-1/2 after:rounded-circular after:bg-brand-stroke",
                    isSelected &&
                      "bg-brand-background text-foreground-on-brand after:bg-foreground-on-brand hover:bg-brand-background-hover active:bg-brand-background-pressed",
                    outOfRange && "cursor-not-allowed bg-transparent font-normal text-foreground-disabled after:hidden hover:bg-transparent active:bg-transparent",
                  )}
                >
                  {label(key)}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

interface PeriodPickerProps extends PickerBaseProps {
  /** Giá trị (controlled). `null` = trống. */
  value?: Date | null;
  defaultValue?: Date | null;
  /** Gọi khi chọn hoặc xoá; `null` khi xoá (cùng kiểu với `value`). */
  onValueChange?: (date: Date | null) => void;
}

interface PeriodPickerShellProps extends PeriodPickerProps {
  view: View;
  msg: { placeholder: string; clear: string; previous: string; next: string };
  defaultFormat: Intl.DateTimeFormatOptions;
}

function PeriodPicker({
  view,
  msg,
  defaultFormat,
  value,
  defaultValue = null,
  onValueChange,
  clearable = false,
  formatDate,
  minDate,
  maxDate,
  placeholder,
  ...props
}: PeriodPickerShellProps) {
  const { locale } = useYugen();
  const format = formatDate ?? cachedDateFormat(locale, defaultFormat);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = useControllableState<Date | null>({ value, defaultValue, onChange: onValueChange });

  return (
    <PickerShell
      {...props}
      placeholder={placeholder ?? msg.placeholder}
      display={selected ? format(selected) : ""}
      open={open}
      onOpenChange={setOpen}
      onClear={clearable ? () => setSelected(null) : undefined}
      clearLabel={msg.clear}
    >
      <PeriodGrid
        view={view}
        selected={selected}
        minDate={minDate}
        maxDate={maxDate}
        locale={locale}
        previousLabel={msg.previous}
        nextLabel={msg.next}
        onSelect={(date) => {
          setSelected(date);
          setOpen(false);
        }}
      />
    </PickerShell>
  );
}

const MONTH_FORMAT: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
const YEAR_FORMAT: Intl.DateTimeFormatOptions = { year: "numeric" };

/* ------------------------------------------------------------------ MonthPicker */

export type MonthPickerProps = PeriodPickerProps;

/**
 * MonthPicker: chọn tháng + năm trong lưới 12 tháng (thẻ hết hạn, kỳ báo cáo). Giá trị là ngày 1 của tháng.
 * Cùng vỏ, bàn phím và locale với DatePicker; PageUp / PageDown đổi năm.
 */
export function MonthPicker(props: MonthPickerProps) {
  const m = useYugenMessages("monthPicker", monthPickerMessagesEn);
  return (
    <PeriodPicker
      {...props}
      view="month"
      msg={{ placeholder: m.placeholder, clear: m.clear, previous: m.previousYear, next: m.nextYear }}
      defaultFormat={MONTH_FORMAT}
    />
  );
}

/* ------------------------------------------------------------------ YearPicker */

export type YearPickerProps = PeriodPickerProps;

/** YearPicker: chọn năm trong lưới 12 năm. Giá trị là ngày 1/1 của năm. PageUp / PageDown sang 12 năm trước / sau. */
export function YearPicker(props: YearPickerProps) {
  const m = useYugenMessages("yearPicker", yearPickerMessagesEn);
  return (
    <PeriodPicker
      {...props}
      view="year"
      msg={{ placeholder: m.placeholder, clear: m.clear, previous: m.previousYears, next: m.nextYears }}
      defaultFormat={YEAR_FORMAT}
    />
  );
}
