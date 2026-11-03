---
"yugen-ui": minor
---

**Breaking:** built-in strings are English by default. Components show and announce English text ("Close", "Loading…", chart descriptions, live announcements) unless you pass `messages`, and `locale` defaults to `"en-US"` (dates, times, numbers, and a 12-hour TimePicker). For Vietnamese, as before: `<YugenProvider messages={messagesVi} locale="vi-VN">`. New `messagesVi` and per-component `…MessagesVi` for copied source; `…Messages` without a suffix stays the Vietnamese set so existing imports keep working, and `messagesEn` / `…MessagesEn` are the defaults. Helpers follow the same defaults: `formatFileSize`, `validateFiles`, the NotificationCenter time formatters, TimePicker's `getDefaultHourCycle` / `formatTime` / `parseTimeString`, and the DatePicker range presets.
