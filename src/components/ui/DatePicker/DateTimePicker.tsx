import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { CalendarClock20Regular } from "../_internal/icons";
import { Calendar } from "@/components/ui/Calendar/Calendar";
import { Button } from "@/components/ui/Button/Button";
import { TimePicker, formatTime, getDefaultHourCycle, type TimePickerHourCycle } from "@/components/ui/TimePicker/TimePicker";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { PickerShell, boundsOf, numericDateFormat, type PickerBaseProps } from "./pickerShell";
import { dateTimePickerMessagesEn } from "./messages";

export { dateTimePickerMessagesVi, dateTimePickerMessagesEn, type DateTimePickerMessages } from "./messages";

const withTime = (day: Date, time: Date | null) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), time?.getHours() ?? 0, time?.getMinutes() ?? 0, time?.getSeconds() ?? 0);

export interface DateTimePickerProps extends PickerBaseProps {
  /** Ngày giờ đã chọn (controlled). `null` = trống. */
  value?: Date | null;
  defaultValue?: Date | null;
  /** Gọi khi đổi ngày hoặc giờ, hoặc xoá; `null` khi xoá (cùng kiểu với `value`). */
  onValueChange?: (date: Date | null) => void;
  /** Bước giữa các giờ trong danh sách (phút). */
  timeIncrement?: number;
  /** "h23" (24 giờ) | "h12". Mặc định theo `locale` của YugenProvider. */
  hourCycle?: TimePickerHourCycle;
}

/**
 * DateTimePicker: lịch và ô giờ trong cùng popover. Chọn ngày giữ giờ đã chọn (mặc định 00:00); ô giờ gõ tự do như
 * TimePicker. minDate / maxDate giới hạn phần ngày.
 */
export function DateTimePicker({
  value,
  defaultValue = null,
  onValueChange,
  placeholder,
  clearable = false,
  formatDate,
  minDate,
  maxDate,
  timeIncrement = 30,
  hourCycle,
  ...props
}: DateTimePickerProps) {
  const msg = useYugenMessages("dateTimePicker", dateTimePickerMessagesEn);
  const { locale } = useYugen();
  const cycle = hourCycle ?? getDefaultHourCycle(locale);
  const format = formatDate ?? ((d: Date) => `${numericDateFormat(locale)(d)} ${formatTime(d, { hourCycle: cycle, locale })}`);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = useControllableState<Date | null>({ value, defaultValue, onChange: onValueChange });
  /** Giờ chọn trước khi có ngày: dùng khi chọn ngày. */
  const [pendingTime, setPendingTime] = React.useState<Date | null>(null);
  const timeLabelId = React.useId();

  return (
    <PickerShell
      {...props}
      icon={CalendarClock20Regular}
      placeholder={placeholder ?? msg.placeholder}
      display={selected ? format(selected) : ""}
      open={open}
      onOpenChange={setOpen}
      onClear={
        clearable
          ? () => {
              setSelected(null);
              setPendingTime(null);
            }
          : undefined
      }
      clearLabel={msg.clear}
    >
      <div className="flex flex-col gap-2">
        <Calendar
          mode="single"
          autoFocus
          selected={selected ?? undefined}
          defaultMonth={selected ?? undefined}
          onSelect={(day) => {
            if (day) setSelected(withTime(day, selected ?? pendingTime));
          }}
          {...boundsOf(minDate, maxDate)}
        />
        <div className="flex items-center gap-2 border-t border-stroke-2 pt-2">
          <span id={timeLabelId} className="shrink-0 ps-1 text-body1 text-foreground-1">
            {msg.time}
          </span>
          <TimePicker
            aria-labelledby={timeLabelId}
            className="min-w-0 flex-1"
            value={selected ?? pendingTime}
            increment={timeIncrement}
            hourCycle={cycle}
            locale={locale}
            dateAnchor={selected ?? undefined}
            onValueChange={(time) => {
              if (!time) return;
              if (selected) setSelected(withTime(selected, time));
              else setPendingTime(time);
            }}
          />
          <Button appearance="primary" onClick={() => setOpen(false)}>
            {msg.done}
          </Button>
        </div>
      </div>
    </PickerShell>
  );
}
