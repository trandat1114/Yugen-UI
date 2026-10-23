import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { DayPicker, type ChevronProps, type DayButtonProps, type DayPickerProps } from "react-day-picker";
import { vi } from "react-day-picker/locale/vi";
import {
  ChevronDown20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronUp20Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

/** Fluent 2 Calendar — https://fluent2.microsoft.design/components/web/react/core/calendar/usage */
export type CalendarProps = DayPickerProps;

const WEEKDAY_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

const CHEVRON = {
  left: ChevronLeft20Regular,
  right: ChevronRight20Regular,
  up: ChevronUp20Regular,
  down: ChevronDown20Regular,
} as const;

const MIRROR = { left: "right", right: "left", up: "up", down: "down" } as const;

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
 * Mặc định dùng locale tiếng Việt và tuần bắt đầu từ Thứ Hai.
 */
export function Calendar({
  className,
  classNames,
  components,
  formatters,
  locale = vi,
  showOutsideDays = true,
  dir: dirProp,
  ...props
}: CalendarProps) {
  const isVi = locale.code === vi.code;
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
        {...props}
      />
    </CalendarMirrorContext.Provider>
  );
}
