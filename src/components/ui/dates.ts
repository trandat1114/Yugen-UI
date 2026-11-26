/**
 * `yugen-ui/dates` (#356): the components built on react-day-picker, an optional peer dependency
 * (`npm i react-day-picker`). Nothing in the root entry imports this file, so an app without dates installs and bundles
 * no date library. MonthPicker and YearPicker need no date library and are in the root entry as well.
 *
 * Vietnamese apps add the date-fns locale of Calendar: `messages={{ ...messagesVi, calendar: calendarMessagesVi }}`.
 */
export * from "./Calendar/Calendar";
export * from "./DatePicker/DatePicker";
