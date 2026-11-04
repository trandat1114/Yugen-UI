---
"yugen-ui": patch
---

Calendar no longer bundles the Vietnamese date-fns locale: it checks the locale code instead of importing `vi`. English apps save about 2 kB gzip on every date component: `{ Calendar }` goes from 32.4 to 30.4 kB and `{ DatePicker }` from 58.8 to 56.8 kB (Rolldown, as in Vite 8). Vietnamese apps still get the locale through `calendarMessagesVi` / `messagesVi`, and the short weekday names (CN, T2…) work as before (#349).
