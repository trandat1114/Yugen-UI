---
"yugen-ui": minor
---

Calendar has its own prop types instead of react-day-picker's `DayPickerProps` (#371): `CalendarProps` (a union of `CalendarSingleProps`, `CalendarMultipleProps`, `CalendarRangeProps` and `CalendarNoSelectionProps`), `CalendarMatcher`, `CalendarLocale` and `DateRange` (now defined by Yugen, same shape). Every prop used in the docs and templates keeps working. **Deprecated:** react-day-picker props outside `CalendarProps` (`classNames`, `components`, `formatters`, `labels`, `styles`, `onDayClick`, `onNextClick`, `onPrevClick`…) are still forwarded, with a development warning, and are removed in 1.0. Style days with `modifiers` and `modifiersClassNames`, use `onSelect` and `onMonthChange`, and set `locale` for formatting.
