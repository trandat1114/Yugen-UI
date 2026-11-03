---
"yugen-ui": minor
---

New prop names from the pre-1.0 API review (#157), so the same idea has the same name everywhere: Carousel `gap="extra-small" | "small" | "medium" | "large" | "extra-large"` (default `"small"`), Tree `onSelectionChange`, DatePicker and DateRangePicker `onValueChange` (receives `null` when cleared, like `value`), List `appearance`, RatingDisplay `showValue` (default `true`), toast option `dismissible` (default `true`), CarouselNavContainer `previousLabel` and Autocomplete `noResultsText`. Sheet and NotificationCenter `breakpoint` take the same tokens as AppShell (`"lg"` … `"5xl"`, default `"3xl"` = 48rem = 768px). Also new: TimePicker `onValueChange(Date | null)` next to `onTimeChange`, Carousel `activeIndex` / `defaultActiveIndex`, and Stepper `defaultActiveStep`.

The old names keep working until 1.0 and print a one-time warning in development: Carousel `gap="XS" | "S" | "M" | "L" | "XL"` and `circular`, Tree `onSelectedChange`, DatePicker `onSelectDate`, DateRangePicker `onSelectRange`, List `variant`, RatingDisplay `hideValue`, toast `hideDismiss`, CarouselNavContainer `prevLabel`, Autocomplete `emptyMessage`, a px number for Sheet / NotificationCenter `breakpoint`, and `formatDateVi`. The unsuffixed `…Messages` constants (for example `carouselMessages`) are marked `@deprecated` in favour of `…MessagesVi` / `…MessagesEn`.
