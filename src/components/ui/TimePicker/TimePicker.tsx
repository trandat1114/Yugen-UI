/** Fluent 2 TimePicker — https://react.fluentui.dev/?path=/docs/components-timepicker--docs */
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useDirection } from "@radix-ui/react-direction";
import { Checkmark16Filled, Clock16Regular, Clock20Regular, Clock24Regular } from "@fluentui/react-icons";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { popoverSurfaceClass } from "@/components/ui/Popover/Popover";
import { fieldAppearanceClass, type FieldAppearance } from "@/components/ui/Select/Select";
import { cmdkOptionClass } from "@/components/ui/Combobox/Combobox";

export type TimePickerHourCycle = "h23" | "h12";
export type TimeSelectionErrorType = "invalid-input" | "out-of-start-bound" | "out-of-end-bound";

export interface TimeSelectionData {
  /** Giờ hợp lệ đã chọn; `null` khi xoá trống hoặc có lỗi. */
  selectedTime: Date | null;
  /** Chữ trong ô nhập lúc xác nhận (đã định dạng nếu hợp lệ). */
  selectedTimeText: string;
  errorType?: TimeSelectionErrorType;
}

/* ------------------------------------------------------------------ Helper thuần */

const pad = (n: number) => String(n).padStart(2, "0");
const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();
const secondsOfDay = (d: Date) => d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
const atTime = (anchor: Date, h: number, m: number, s = 0) => new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), h, m, s, 0);
const normalizeWord = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase().replace(/[\s.]/g, "");

const periodCache = new Map<string, [string, string]>();

/** Nhãn buổi theo locale (vi-VN → "SA" / "CH", en-US → "AM" / "PM"). */
function getDayPeriodLabels(locale: string): [string, string] {
  const cached = periodCache.get(locale);
  if (cached) return cached;
  let labels: [string, string] = ["AM", "PM"];
  try {
    const f = new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true });
    const get = (h: number) => f.formatToParts(new Date(2000, 0, 1, h)).find((p) => p.type === "dayPeriod")?.value;
    const am = get(9);
    const pm = get(21);
    if (am && pm) labels = [am, pm];
  } catch {
    // locale không hợp lệ → AM / PM
  }
  periodCache.set(locale, labels);
  return labels;
}

/** Chu kỳ giờ mặc định của locale qua Intl: vi-VN → "h23" (24 giờ), en-US → "h12". */
export function getDefaultHourCycle(locale = "vi-VN"): TimePickerHourCycle {
  try {
    const hc = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
    return hc === "h11" || hc === "h12" ? "h12" : "h23";
  } catch {
    return "h23";
  }
}

export interface FormatTimeOptions {
  hourCycle?: TimePickerHourCycle;
  locale?: string;
  showSeconds?: boolean;
}

/** Định dạng giờ: h23 → "09:30", h12 → "9:30 SA" (vi-VN) / "9:30 AM" (en-US). Không phụ thuộc chuỗi Intl đầy đủ. */
export function formatTime(date: Date, { hourCycle = "h23", locale = "vi-VN", showSeconds = false }: FormatTimeOptions = {}) {
  const h = date.getHours();
  const tail = `${pad(date.getMinutes())}${showSeconds ? `:${pad(date.getSeconds())}` : ""}`;
  if (hourCycle === "h23") return `${pad(h)}:${tail}`;
  const [am, pm] = getDayPeriodLabels(locale);
  return `${h % 12 || 12}:${tail} ${h < 12 ? am : pm}`;
}

export interface ParseTimeOptions {
  /** Ngày gắn vào kết quả. Mặc định hôm nay. */
  dateAnchor?: Date;
  /** Thêm nhãn buổi của locale vào danh sách được hiểu. Mặc định "vi-VN". */
  locale?: string;
}

const AM_WORDS = ["am", "a", "sa", "sang"];
const PM_WORDS = ["pm", "p", "ch", "chieu", "toi"];

/**
 * Hiểu giờ gõ tự do: "9", "9:30", "09.30", "930", "0930", "9h30", "9h", "9 giờ 30", "21:15", "9:30 PM", "9pm",
 * "9:30 CH", "9:30:15". Trả `null` nếu không hợp lệ (phút phải đủ 2 chữ số khi có dấu phân cách).
 */
export function parseTimeString(text: string, { dateAnchor, locale = "vi-VN" }: ParseTimeOptions = {}): Date | null {
  let s = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/\s*phut$/, "");
  if (!s) return null;

  const [amLabel, pmLabel] = getDayPeriodLabels(locale).map(normalizeWord);
  let meridiem: "am" | "pm" | null = null;
  const suffix = /([a-z.]+)$/.exec(s);
  if (suffix) {
    const word = suffix[1].replace(/\./g, "");
    if (AM_WORDS.includes(word) || word === amLabel) meridiem = "am";
    else if (PM_WORDS.includes(word) || word === pmLabel) meridiem = "pm";
    if (meridiem) s = s.slice(0, -suffix[1].length).trim();
  }
  s = s
    .replace(/\s*(gio|g|h)\s*/g, ":")
    .replace(/\s*[.:]\s*/g, ":")
    .replace(/\s+/g, ":")
    .replace(/:$/, "");

  let h: number;
  let m = 0;
  let sec = 0;
  let match = /^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/.exec(s);
  if (match) {
    h = Number(match[1]);
    m = match[2] ? Number(match[2]) : 0;
    sec = match[3] ? Number(match[3]) : 0;
  } else if ((match = /^(\d{1,2})(\d{2})$/.exec(s))) {
    h = Number(match[1]);
    m = Number(match[2]);
  } else {
    return null;
  }

  if (meridiem) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (meridiem === "pm" ? 12 : 0);
  }
  if (h > 23 || m > 59 || sec > 59) return null;
  return atTime(dateAnchor ?? new Date(), h, m, sec);
}

export interface TimeRangeOptions {
  /** Giờ bắt đầu (gồm). Mặc định 0. */
  startHour?: number;
  /** Giờ kết thúc (không gồm), 1–24. Mặc định 24. */
  endHour?: number;
  /** Bước (phút). Mặc định 30. */
  increment?: number;
  /** Giờ sớm / muộn nhất được chọn (gồm, chỉ so phần giờ). */
  minTime?: Date;
  maxTime?: Date;
}

/** Danh sách giờ từ `startHour` đến trước `endHour`, cách nhau `increment` phút, lọc theo minTime / maxTime. */
export function getTimesInRange({
  startHour = 0,
  endHour = 24,
  increment = 30,
  minTime,
  maxTime,
  dateAnchor = new Date(),
}: TimeRangeOptions & { dateAnchor?: Date } = {}): Date[] {
  const step = Math.max(1, Math.round(increment));
  const start = Math.min(24, Math.max(0, Math.floor(startHour))) * 60;
  const end = Math.min(24, Math.max(0, Math.ceil(endHour))) * 60;
  const lo = minTime ? secondsOfDay(minTime) : -Infinity;
  const hi = maxTime ? secondsOfDay(maxTime) : Infinity;
  const times: Date[] = [];
  for (let m = start; m < end; m += step) {
    if (m * 60 >= lo && m * 60 <= hi) times.push(atTime(dateAnchor, Math.floor(m / 60), m % 60));
  }
  return times;
}

/** Kiểm tra giờ nằm trong khoảng cho phép; trả loại lỗi hoặc `undefined`. Chỉ so phần giờ (bỏ ngày). */
export function getTimeBoundsError(
  date: Date,
  { startHour = 0, endHour = 24, minTime, maxTime }: Omit<TimeRangeOptions, "increment"> = {},
): TimeSelectionErrorType | undefined {
  const t = secondsOfDay(date);
  if (t < startHour * 3600 || (minTime && t < secondsOfDay(minTime))) return "out-of-start-bound";
  if ((endHour < 24 && t >= endHour * 3600) || (maxTime && t > secondsOfDay(maxTime))) return "out-of-end-bound";
  return undefined;
}

/** Vị trí option gần nhất với `target` (phút trong ngày); bằng nhau thì lấy option sớm hơn. */
function nearestIndex(list: number[], target: number) {
  let best = -1;
  let bestDiff = Infinity;
  list.forEach((m, i) => {
    const diff = Math.abs(m - target);
    if (diff < bestDiff) {
      best = i;
      bestDiff = diff;
    }
  });
  return best;
}

/** Option để highlight khi đang gõ: giờ hiểu được → gần nhất; chưa đủ (vd. "9:3") → khớp tiền tố chữ số. */
function matchIndex(text: string, list: number[], locale: string) {
  const parsed = parseTimeString(text, { locale });
  if (parsed) return nearestIndex(list, minutesOfDay(parsed));
  const digits = text.replace(/\D/g, "");
  if (!digits) return -1;
  return list.findIndex((m) => {
    const h = Math.floor(m / 60);
    const mm = pad(m % 60);
    const h12 = h % 12 || 12;
    return [`${pad(h)}${mm}`, `${h}${mm}`, `${h12}${mm}`, `${pad(h12)}${mm}`].some((c) => c.startsWith(digits));
  });
}

/* ------------------------------------------------------------------ TimePicker */

const SIZE = {
  small: { root: "h-6 ps-S pe-XXS text-caption1", Icon: Clock16Regular, icon: "size-4", button: "w-6" },
  medium: { root: "h-8 ps-M pe-XXS text-body1", Icon: Clock20Regular, icon: "size-5", button: "w-8" },
  large: { root: "h-10 ps-M pe-XS text-body2", Icon: Clock24Regular, icon: "size-6", button: "w-9" },
} as const;

type InputAttrs = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "defaultValue" | "onChange" | "type" | "children" | "min" | "max" | "step" | "list"
>;

export interface TimePickerProps extends InputAttrs, TimeRangeOptions {
  /** Giờ đã chọn (controlled). `null` = trống. */
  value?: Date | null;
  defaultValue?: Date | null;
  /** Gọi khi chọn option hoặc xác nhận chữ gõ (Enter / rời ô). Có `errorType` nếu không hợp lệ. */
  onTimeChange?: (event: React.SyntheticEvent<HTMLElement>, data: TimeSelectionData) => void;
  /** "h23" (24 giờ) | "h12" (SA/CH). Mặc định theo `locale` qua Intl. */
  hourCycle?: TimePickerHourCycle;
  /** Locale cho chu kỳ giờ và nhãn buổi. Mặc định "vi-VN". */
  locale?: string;
  /** Ngày gắn vào giờ trả về. Mặc định ngày của `value`, nếu không thì hôm nay. */
  dateAnchor?: Date;
  /** Định dạng hiển thị tuỳ biến (thay `formatTime`). */
  formatDateToTimeString?: (date: Date) => string;
  appearance?: FieldAppearance;
  size?: "small" | "medium" | "large";
  /** Class cho bề mặt listbox. */
  listboxClassName?: string;
  /** Nội dung khi khoảng giờ rỗng. */
  noOptionsText?: React.ReactNode;
}

/**
 * TimePicker: ô nhập kiểu combobox liệt kê giờ theo `increment`; gõ tự do (9, 930, 9h30, 9:30 PM…) rồi Enter / rời ô
 * để xác nhận, gõ dở sẽ nhảy tới giờ gần nhất. ArrowDown mở / di chuyển, Enter chọn, Escape đóng.
 */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>((props, ref) => {
  const {
    value,
    defaultValue = null,
    onTimeChange,
    startHour = 0,
    endHour = 24,
    increment = 30,
    minTime,
    maxTime,
    hourCycle,
    locale = "vi-VN",
    dateAnchor,
    formatDateToTimeString,
    appearance = "outline",
    size = "medium",
    listboxClassName,
    noOptionsText = "Không có giờ phù hợp",
    placeholder = "Chọn giờ…",
    className,
    disabled,
    onKeyDown,
    onBlur,
    onClick,
    ...inputProps
  } = props;

  const controlled = value !== undefined;
  const [inner, setInner] = React.useState<Date | null>(defaultValue);
  const selected = controlled ? value : inner;
  /** Chữ người dùng đang gõ (hoặc chữ không hợp lệ đã xác nhận); null = hiển thị giờ đã chọn. */
  const [draft, setDraft] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const invalidRef = React.useRef(false);
  const lastEmittedRef = React.useRef<number | null | undefined>(undefined);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  const listId = React.useId();
  const dir = useDirection();
  const portalTheme = usePortalThemeProps();

  const cycle = React.useMemo(() => hourCycle ?? getDefaultHourCycle(locale), [hourCycle, locale]);
  const format = React.useCallback(
    (d: Date) => (formatDateToTimeString ? formatDateToTimeString(d) : formatTime(d, { hourCycle: cycle, locale })),
    [formatDateToTimeString, cycle, locale],
  );
  const minKey = minTime ? secondsOfDay(minTime) : null;
  const maxKey = maxTime ? secondsOfDay(maxTime) : null;
  /** Option dưới dạng phút trong ngày (không phụ thuộc ngày → memo ổn định). */
  const options = React.useMemo(
    () => getTimesInRange({ startHour, endHour, increment, minTime, maxTime, dateAnchor: new Date(2000, 0, 1) }).map(minutesOfDay),
    // minTime / maxTime so theo giá trị, không theo tham chiếu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startHour, endHour, increment, minKey, maxKey],
  );
  const labels = React.useMemo(() => options.map((m) => format(new Date(2000, 0, 1, Math.floor(m / 60), m % 60))), [options, format]);
  const selectedMinutes = selected ? minutesOfDay(selected) : null;

  // value đổi từ bên ngoài (không phải giá trị vừa phát ra) → bỏ chữ đang gõ / chữ lỗi.
  const valueKey = controlled ? (value?.getTime() ?? null) : undefined;
  useIsomorphicLayoutEffect(() => {
    if (!controlled) return;
    if (valueKey !== lastEmittedRef.current) {
      setDraft(null);
      invalidRef.current = false;
    }
    lastEmittedRef.current = valueKey;
  }, [valueKey, controlled]);

  const emit = (event: React.SyntheticEvent<HTMLElement>, data: TimeSelectionData) => {
    lastEmittedRef.current = data.selectedTime?.getTime() ?? null;
    onTimeChange?.(event, data);
  };

  const anchorDate = () => dateAnchor ?? selected ?? new Date();

  const selectTime = (event: React.SyntheticEvent<HTMLElement>, time: Date) => {
    const changed = selected?.getTime() !== time.getTime() || invalidRef.current;
    invalidRef.current = false;
    setDraft(null);
    if (!controlled) setInner(time);
    if (changed) emit(event, { selectedTime: time, selectedTimeText: format(time) });
  };

  const fail = (event: React.SyntheticEvent<HTMLElement>, text: string, errorType: TimeSelectionErrorType) => {
    invalidRef.current = true;
    setDraft(text);
    if (!controlled) setInner(null);
    emit(event, { selectedTime: null, selectedTimeText: text, errorType });
  };

  /** Xác nhận chữ đang gõ. */
  const commitText = (event: React.SyntheticEvent<HTMLElement>, raw: string) => {
    const text = raw.trim();
    if (!text) {
      const changed = selected !== null || invalidRef.current;
      invalidRef.current = false;
      setDraft(null);
      if (!controlled) setInner(null);
      if (changed) emit(event, { selectedTime: null, selectedTimeText: "" });
      return;
    }
    const parsed = parseTimeString(text, { dateAnchor: anchorDate(), locale });
    if (!parsed) return fail(event, text, "invalid-input");
    const error = getTimeBoundsError(parsed, { startHour, endHour, minTime, maxTime });
    if (error) return fail(event, text, error);
    selectTime(event, parsed);
  };

  const selectOption = (event: React.SyntheticEvent<HTMLElement>, index: number) => {
    const m = options[index];
    if (m === undefined) return;
    const anchor = anchorDate();
    selectTime(event, atTime(anchor, Math.floor(m / 60), m % 60));
  };

  const openList = () => {
    if (disabled || open) return;
    const fromDraft = draft ? matchIndex(draft, options, locale) : -1;
    setActive(fromDraft >= 0 ? fromDraft : selectedMinutes !== null ? nearestIndex(options, selectedMinutes) : options.length ? 0 : -1);
    setOpen(true);
  };

  const move = (delta: number) => {
    if (!options.length) return;
    setActive((i) => (i < 0 ? (delta > 0 ? 0 : options.length - 1) : (i + delta + options.length) % options.length));
  };

  // aria-activedescendant + cuộn option đang highlight vào tầm nhìn.
  useIsomorphicLayoutEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const page = Math.max(1, Math.round(60 / Math.max(1, increment)));
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else move(e.key === "ArrowDown" ? 1 : -1);
        break;
      case "PageDown":
      case "PageUp":
        if (!open) return;
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, Math.max(0, (i < 0 ? 0 : i) + (e.key === "PageDown" ? page : -page))));
        break;
      case "Enter":
        if (open) {
          e.preventDefault();
          // Gõ đủ giờ hợp lệ → dùng chính giờ đó; gõ dở → chọn option đang highlight.
          if (draft !== null && (parseTimeString(draft, { locale }) || active < 0)) commitText(e, draft);
          else if (active >= 0) selectOption(e, active);
          setOpen(false);
        } else if (draft !== null) {
          e.preventDefault();
          commitText(e, draft);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        } else if (draft !== null && !invalidRef.current) {
          // Đang gõ dở mà đã đóng danh sách → Escape trả lại giá trị cũ.
          e.preventDefault();
          setDraft(null);
        }
        break;
    }
  };

  const s = SIZE[size];
  const invalid = inputProps["aria-invalid"] === true || inputProps["aria-invalid"] === "true";
  const text = draft ?? (selected ? format(selected) : "");
  const activeId = open && active >= 0 ? `${listId}-${active}` : undefined;
  const listLabelProps = inputProps["aria-labelledby"]
    ? { "aria-labelledby": inputProps["aria-labelledby"] }
    : { "aria-label": inputProps["aria-label"] ?? "Chọn giờ" };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => (o ? openList() : setOpen(false))}>
      <PopoverPrimitive.Anchor asChild>
        <div
          ref={anchorRef}
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          onClick={() => inputRef.current?.focus()}
          className={cn(
            fieldAppearanceClass[appearance],
            "inline-flex min-w-32 cursor-text items-center gap-XXS",
            open && "after:scale-x-100",
            disabled && "cursor-not-allowed",
            s.root,
            className,
          )}
        >
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            inputMode="text"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? listId : undefined}
            aria-activedescendant={activeId}
            autoComplete="off"
            disabled={disabled}
            placeholder={placeholder}
            value={text}
            onChange={(e) => {
              const next = e.target.value;
              setDraft(next);
              invalidRef.current = false;
              const index = matchIndex(next, options, locale);
              if (index >= 0) setActive(index);
              if (!open && !disabled) setOpen(true);
            }}
            onClick={(e) => {
              onClick?.(e);
              openList();
            }}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              onBlur?.(e);
              setOpen(false);
              if (draft !== null && !invalidRef.current) commitText(e, draft);
            }}
            className="h-full min-w-0 flex-1 bg-transparent text-foreground-1 tabular-nums outline-none placeholder:text-foreground-4 disabled:cursor-not-allowed disabled:text-foreground-disabled"
            {...inputProps}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={open ? "Đóng danh sách giờ" : "Mở danh sách giờ"}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              if (open) setOpen(false);
              else {
                inputRef.current?.focus();
                openList();
              }
            }}
            className={cn(
              "flex h-full shrink-0 cursor-pointer items-center justify-center text-foreground-3 outline-none",
              "disabled:cursor-not-allowed disabled:text-foreground-disabled",
              s.button,
            )}
          >
            <s.Icon className={s.icon} />
          </button>
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          {...portalTheme}
          dir={dir}
          role="presentation"
          align="start"
          sideOffset={2}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            popoverSurfaceClass,
            "max-h-[min(var(--radix-popover-content-available-height),--spacing(72))] w-(--radix-popover-trigger-width) overflow-y-auto p-XS",
            listboxClassName,
          )}
        >
          <div ref={listRef} id={listId} role="listbox" {...listLabelProps}>
            {options.length === 0 && <div className="px-S py-SNudge text-body1 text-foreground-3">{noOptionsText}</div>}
            {options.map((m, i) => {
              const isSelected = selectedMinutes === m && draft === null;
              return (
                <div
                  key={m}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  data-index={i}
                  data-selected={i === active ? "true" : undefined}
                  onMouseMove={() => active !== i && setActive(i)}
                  onClick={(e) => {
                    selectOption(e, i);
                    setOpen(false);
                  }}
                  className={cn(cmdkOptionClass, "tabular-nums")}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    {isSelected && <Checkmark16Filled className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{labels[i]}</span>
                </div>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
});
TimePicker.displayName = "TimePicker";
