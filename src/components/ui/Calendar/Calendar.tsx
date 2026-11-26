import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { DayPicker, labelDayButton, type ChevronProps, type DayButtonProps, type DayPickerProps } from "react-day-picker";
import {
  ChevronDown20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronUp20Regular,
} from "../_internal/icons";
import { cn } from "@/lib/cn";
import { warnDeprecated } from "@/lib/deprecate";
import { useYugenMessages } from "../YugenProvider/context";
import { calendarMessagesEn, type CalendarLocale } from "./messages";

export {
  calendarMessages,
  calendarMessagesVi,
  calendarMessagesEn,
  type CalendarLocale,
  type CalendarMessages,
} from "./messages";

/** A range of days; `to` stays unset until the second day is picked. */
export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

/**
 * Days a rule matches: `true` (every day), a day, a list of days, a range, `{ before }`, `{ after }`, both (the days
 * between), `{ dayOfWeek }` (0 = Sunday), or a function.
 */
export type CalendarMatcher =
  | boolean
  | Date
  | Date[]
  | DateRange
  | { before: Date }
  | { after: Date }
  | { before: Date; after: Date }
  | { dayOfWeek: number | number[] }
  | ((date: Date) => boolean);

/** Props of every Calendar, whatever its `mode`. */
export interface CalendarBaseProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  title?: string;
  lang?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  role?: "application" | "dialog";
  /** Reading direction; defaults to the nearest DirectionProvider. */
  dir?: "ltr" | "rtl";

  /** Month shown (controlled). */
  month?: Date;
  /** Month shown first (uncontrolled). */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** First month that can be shown. */
  startMonth?: Date;
  /** Last month that can be shown. */
  endMonth?: Date;
  numberOfMonths?: number;
  /** With several months, the arrows move by `numberOfMonths`. */
  pagedNavigation?: boolean;
  reverseMonths?: boolean;
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  reverseYears?: boolean;
  navLayout?: "around" | "after";
  hideNavigation?: boolean;
  disableNavigation?: boolean;

  /** Days that cannot be selected. */
  disabled?: CalendarMatcher | CalendarMatcher[];
  /** Days that are not shown. */
  hidden?: CalendarMatcher | CalendarMatcher[];
  /** The day marked as today. */
  today?: Date;
  /** Named day groups, e.g. `{ booked: [date1, date2] }`; style them with `modifiersClassNames`. */
  modifiers?: Record<string, CalendarMatcher | CalendarMatcher[] | undefined>;
  /** Class names per modifier, e.g. `{ booked: "line-through" }`. */
  modifiersClassNames?: Record<string, string>;
  showOutsideDays?: boolean;
  /** Always six weeks per month. */
  fixedWeeks?: boolean;
  hideWeekdays?: boolean;
  showWeekNumber?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 4;
  ISOWeek?: boolean;
  /** Overrides `messages.calendar.locale` of the YugenProvider. */
  locale?: CalendarLocale;
  /** IANA time zone, e.g. "Asia/Ho_Chi_Minh". */
  timeZone?: string;
  autoFocus?: boolean;
  footer?: React.ReactNode;
}

export interface CalendarNoSelectionProps extends CalendarBaseProps {
  mode?: undefined;
  selected?: undefined;
  onSelect?: undefined;
  required?: undefined;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined, triggerDate: Date) => void;
  /** Clicking the selected day again keeps it selected. */
  required?: boolean;
}

export interface CalendarMultipleProps extends CalendarBaseProps {
  mode: "multiple";
  selected?: Date[];
  onSelect?: (dates: Date[] | undefined, triggerDate: Date) => void;
  required?: boolean;
  /** Fewest days to keep selected. */
  min?: number;
  /** Most days that can be selected. */
  max?: number;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range";
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined, triggerDate: Date) => void;
  required?: boolean;
  /** Shortest range, in nights. */
  min?: number;
  /** Longest range, in nights. */
  max?: number;
  /** A range cannot span a disabled day. */
  excludeDisabled?: boolean;
  /** A click after a complete range starts a new one. */
  resetOnSelect?: boolean;
}

/** Fluent 2 Calendar — https://fluent2.microsoft.design/components/web/react/core/calendar/usage */
export type CalendarProps = CalendarNoSelectionProps | CalendarSingleProps | CalendarMultipleProps | CalendarRangeProps;

/**
 * react-day-picker props that Calendar still forwards. They are not part of CalendarProps and go away in 1.0 (#371):
 * keeping them would tie Yugen's API to react-day-picker, which #356 replaces.
 */
export interface CalendarDeprecatedProps {
  /** @deprecated react-day-picker prop, removed in 1.0. Style days with `modifiers` + `modifiersClassNames`. */
  classNames?: DayPickerProps["classNames"];
  /** @deprecated react-day-picker prop, removed in 1.0. Use `className` or `modifiersClassNames`. */
  styles?: DayPickerProps["styles"];
  /** @deprecated react-day-picker prop, removed in 1.0. Use `modifiersClassNames`. */
  modifiersStyles?: DayPickerProps["modifiersStyles"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  components?: DayPickerProps["components"];
  /** @deprecated react-day-picker prop, removed in 1.0. Set `locale`. */
  formatters?: DayPickerProps["formatters"];
  /** @deprecated react-day-picker prop, removed in 1.0. Set `locale`. */
  labels?: DayPickerProps["labels"];
  /** @deprecated react-day-picker prop, removed in 1.0. Set `locale`. */
  numerals?: DayPickerProps["numerals"];
  /** @deprecated react-day-picker prop, removed in 1.0. Use `onSelect`. */
  onDayClick?: DayPickerProps["onDayClick"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  onDayFocus?: DayPickerProps["onDayFocus"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  onDayBlur?: DayPickerProps["onDayBlur"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  onDayKeyDown?: DayPickerProps["onDayKeyDown"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  onDayMouseEnter?: DayPickerProps["onDayMouseEnter"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  onDayMouseLeave?: DayPickerProps["onDayMouseLeave"];
  /** @deprecated react-day-picker prop, removed in 1.0. Use `onMonthChange`. */
  onNextClick?: DayPickerProps["onNextClick"];
  /** @deprecated react-day-picker prop, removed in 1.0. Use `onMonthChange`. */
  onPrevClick?: DayPickerProps["onPrevClick"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  animate?: DayPickerProps["animate"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  broadcastCalendar?: DayPickerProps["broadcastCalendar"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  noonSafe?: DayPickerProps["noonSafe"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  nonce?: DayPickerProps["nonce"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  dateLib?: DayPickerProps["dateLib"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  useAdditionalWeekYearTokens?: DayPickerProps["useAdditionalWeekYearTokens"];
  /** @deprecated react-day-picker prop, removed in 1.0. */
  useAdditionalDayOfYearTokens?: DayPickerProps["useAdditionalDayOfYearTokens"];
}

const NO_REPLACEMENT = "it is a react-day-picker option without a Calendar prop (#371)";
const SET_LOCALE = "set the locale (prop or messages.calendar.locale)";
/** What to use instead of each deprecated prop, for the development warning. */
const DEPRECATED: Record<keyof CalendarDeprecatedProps, string> = {
  classNames: "style days with modifiers and modifiersClassNames, the calendar with className",
  styles: "use className or modifiersClassNames",
  modifiersStyles: "use modifiersClassNames",
  components: NO_REPLACEMENT,
  formatters: SET_LOCALE,
  labels: SET_LOCALE,
  numerals: SET_LOCALE,
  onDayClick: "use onSelect",
  onDayFocus: NO_REPLACEMENT,
  onDayBlur: NO_REPLACEMENT,
  onDayKeyDown: NO_REPLACEMENT,
  onDayMouseEnter: NO_REPLACEMENT,
  onDayMouseLeave: NO_REPLACEMENT,
  onNextClick: "use onMonthChange",
  onPrevClick: "use onMonthChange",
  animate: NO_REPLACEMENT,
  broadcastCalendar: NO_REPLACEMENT,
  noonSafe: NO_REPLACEMENT,
  nonce: NO_REPLACEMENT,
  dateLib: NO_REPLACEMENT,
  useAdditionalWeekYearTokens: NO_REPLACEMENT,
  useAdditionalDayOfYearTokens: NO_REPLACEMENT,
};

const WEEKDAY_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

const CHEVRON = {
  left: ChevronLeft20Regular,
  right: ChevronRight20Regular,
  up: ChevronUp20Regular,
  down: ChevronDown20Regular,
} as const;

const MIRROR = { left: "right", right: "left", up: "up", down: "down" } as const;

/**
 * Nhãn ô ngày của locale, nhưng ngày viết bằng số thường. en-US đọc "September 27th" trong khi ô hiện "27": điều khiển
 * bằng giọng nói ("click 27") không khớp và axe báo label-content-name-mismatch (WCAG 2.5.3).
 */
const labelDayButtonPlain: typeof labelDayButton = (date, modifiers, options, dateLib) => {
  const localeLabel = options?.locale?.labels?.labelDayButton;
  const label =
    typeof localeLabel === "function"
      ? localeLabel(date, modifiers, options, dateLib)
      : (localeLabel ?? labelDayButton(date, modifiers, options, dateLib));
  if (!dateLib) return label;
  const ordinal = dateLib.format(date, "do");
  const plain = dateLib.format(date, "d");
  return ordinal === plain ? label : label.replace(ordinal, plain);
};

/** Nav mặc định của DayPicker luôn truyền left/right cố định; trong RTL phải đảo để "tháng trước" chỉ về phía bắt đầu. */
const CalendarMirrorContext = React.createContext(false);

function CalendarChevron({ orientation = "left", className }: ChevronProps) {
  const mirror = React.useContext(CalendarMirrorContext);
  const Icon = CHEVRON[mirror ? MIRROR[orientation] : orientation];
  return <Icon aria-hidden className={cn("size-5", className)} />;
}

const navButtonClass = cn(
  "inline-flex size-8 items-center justify-center rounded-medium text-foreground-2",
  "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
  "aria-disabled:pointer-events-none aria-disabled:text-foreground-disabled",
);

function CalendarDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const middle = modifiers.range_middle;
  const selected = modifiers.selected && !middle;

  return (
    <button
      ref={ref}
      data-date={day.isoDate}
      className={cn(
        "relative inline-flex size-8 items-center justify-center rounded-medium text-body1 text-foreground-1",
        "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover active:bg-subtle-pressed",
        modifiers.outside && "text-foreground-4",
        modifiers.today &&
          "font-semibold text-brand-foreground-1 after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-3 after:-translate-x-1/2 after:rounded-circular after:bg-brand-stroke",
        middle && "rounded-none bg-brand-background-2 text-foreground-1 hover:bg-brand-background-2-hover active:bg-brand-background-2-pressed",
        selected &&
          "bg-brand-background text-foreground-on-brand after:bg-foreground-on-brand hover:bg-brand-background-hover active:bg-brand-background-pressed",
        "disabled:cursor-not-allowed disabled:bg-transparent disabled:font-normal disabled:text-foreground-disabled disabled:after:hidden",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Lịch tháng theo phong cách Fluent, dựng trên react-day-picker v10. Nhận mọi prop của DayPicker
 * (`mode="single" | "range" | "multiple"`, `selected`, `onSelect`, `disabled`, `numberOfMonths`…).
 * Mặc định dùng locale tiếng Việt và tuần bắt đầu từ Thứ Hai; locale mặc định lấy từ `messages.calendar.locale`.
 */
export function Calendar(allProps: CalendarProps & CalendarDeprecatedProps) {
  const { className, classNames, components, formatters, labels, locale: localeProp, showOutsideDays = true, dir: dirProp, ...props } =
    allProps;
  for (const key of Object.keys(DEPRECATED) as (keyof CalendarDeprecatedProps)[]) {
    if (allProps[key] !== undefined) warnDeprecated(`Calendar.${key}`, DEPRECATED[key], "1.0.0");
  }
  const msg = useYugenMessages("calendar", calendarMessagesEn);
  const locale = (localeProp ?? msg.locale) as DayPickerProps["locale"];
  // So mã, không import locale `vi`: app tiếng Anh không mang theo nó (#349). App tiếng Việt có locale qua calendarMessagesVi.
  const isVi = locale?.code === "vi";
  // DayPicker dùng `dir` để đảo ArrowLeft/ArrowRight; lấy từ DirectionProvider khi không truyền.
  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;
  // navLayout="around" đã tự đảo chevron theo `dir`; Nav mặc định thì không.
  const mirrorChevrons = dir === "rtl" && props.navLayout !== "around";

  return (
    <CalendarMirrorContext.Provider value={mirrorChevrons}>
      <DayPicker
        dir={dir}
        locale={locale}
        labels={{ labelDayButton: labelDayButtonPlain, ...labels }}
        showOutsideDays={showOutsideDays}
        className={cn("w-fit text-body1 text-foreground-1", className)}
        classNames={{
          root: "",
          months: "relative flex flex-wrap gap-4",
          month: "flex flex-col gap-2",
          month_caption: "flex h-8 items-center ps-2 pe-18",
          caption_label: "inline-flex items-center gap-0.5 text-body1 font-semibold text-foreground-1",
          nav: "absolute inset-e-0 top-0 z-10 flex items-center gap-0.5",
          button_previous: navButtonClass,
          button_next: navButtonClass,
          chevron: "",
          dropdowns: "flex items-center gap-1",
          dropdown_root: "relative inline-flex items-center",
          dropdown: "absolute inset-0 cursor-pointer opacity-0",
          months_dropdown: "",
          years_dropdown: "",
          month_grid: "border-collapse",
          weekdays: "",
          weekday: "size-8 p-0 text-center text-caption1 font-semibold text-foreground-2",
          weeks: "",
          week: "",
          week_number_header: "size-8 p-0 text-center text-caption1 text-foreground-3",
          week_number: "size-8 p-0 text-center text-caption1 text-foreground-3",
          day: "p-0 text-center",
          day_button: "",
          selected: "",
          today: "",
          outside: "",
          disabled: "",
          focused: "",
          range_start: "",
          range_middle: "",
          range_end: "",
          hidden: "invisible",
          footer: "pt-2 text-caption1 text-foreground-3",
          ...classNames,
        }}
        components={{ Chevron: CalendarChevron, DayButton: CalendarDayButton, ...components }}
        formatters={isVi ? { formatWeekdayName: (date: Date) => WEEKDAY_VI[date.getDay()], ...formatters } : formatters}
        {...(props as DayPickerProps)}
      />
    </CalendarMirrorContext.Provider>
  );
}
