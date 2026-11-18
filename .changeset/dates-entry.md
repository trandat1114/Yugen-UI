---
"yugen-ui": minor
---

**Breaking:** Calendar, DatePicker, DateRangePicker and DateTimePicker move to a new entry, `yugen-ui/dates`, and `react-day-picker` becomes an optional peer dependency (#356). An app without date components no longer installs react-day-picker, date-fns and @date-fns/tz (about 11 MB and 6,000 files), and nothing imported from `yugen-ui` loads them: `import *` from the root goes from about 329 to 298.5 kB gzip and `{ messagesVi }` from 17.7 to 6.5 kB. MonthPicker, YearPicker and TimePicker stay in the root. Migration: run `npm i react-day-picker`, import the date components from `yugen-ui/dates` (or `yugen-ui/Calendar`, `yugen-ui/DatePicker`), and for Vietnamese add the calendar locale, which `messagesVi` no longer carries: `messages={{ ...messagesVi, calendar: calendarMessagesVi }}` with `calendarMessagesVi` from `yugen-ui/dates`. A codemod in `yugen migrate` follows (#164).
