---
"yugen-ui": minor
---

New `MonthPicker`, `YearPicker` and `DateTimePicker` in the DatePicker family: the same field, popover, `value` / `defaultValue` / `onValueChange` (`Date | null`), `minDate` / `maxDate`, `clearable`, `formatDate` and locale handling as DatePicker. MonthPicker and YearPicker show a 12-cell grid with arrow keys, Home / End and PageUp / PageDown; DateTimePicker pairs the Calendar with a TimePicker (`timeIncrement`, `hourCycle`). Built-in strings live in `messages.monthPicker`, `messages.yearPicker` and `messages.dateTimePicker` (#173).
