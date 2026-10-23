import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/phase3-inputs.tsx.
export const en: Record<string, ComponentDocEn> = {
  overflow: {
    description:
      "Wrap the container (Toolbar, TabsList, Breadcrumb, TagGroup or a flex div) in `<Overflow>` and each item in `<OverflowItem id priority>`. Sizes are measured with ResizeObserver and cached. Hidden items stay mounted but get `hidden` + `data-overflowing`, so they can't receive focus. The menu button uses `useOverflowMenu()` (ref + number of hidden items) and `useOverflowItems()` (ids of the hidden items, in order) to render the matching MenuItems. The first render (and SSR) always shows every item. RTL works because only widths are measured, with no left/right assumptions.",
    examples: [
      {
        title: "Priority & minimumVisible",
        description:
          "Higher priority stays visible longer: edit (3) → share (2) → delete (1) → the rest. minimumVisible={1} keeps at least one button even in a very narrow container.",
      },
      {
        title: "Tabs",
        description:
          "The selected tab has priority 1, so it is always visible; picking a tab from the menu brings it back out. The menu button sits outside TabsList (a tablist should only contain tabs).",
      },
      {
        title: "Breadcrumb & OverflowDivider",
        description:
          'Each item has its own groupId, and OverflowDivider hides with its group. The first item and the current page have priority 1; the middle items collapse into "…". Drag the corner of the frame to change its width.',
      },
      {
        title: 'TagGroup "+N"',
        description:
          'Tags that don\'t fit on one line collapse into a "+N" InteractionTag that opens a menu.',
      },
    ],
    dos: [
      "Only render the menu button when `isOverflowing`, and attach the `ref` from `useOverflowMenu()` to its outermost element.",
      "Give important or selected items (active tab, current page) a high priority so they don't get hidden.",
      "Give the container a width that doesn't depend on its content (block, `w-full`, `flex-1`). Overflow adds `w-full min-w-0` itself.",
    ],
    donts: [
      "Don't keep the menu button visible all the time. Overflow only reserves space for it when items are hidden.",
      "Don't use Overflow for readable paragraph content. Truncate or wrap the text instead.",
      "Don't put items with a flexible width (flex-1) inside: each item must have its natural size.",
    ],
    props: {
      "Overflow.children":
        "A single container that forwards its ref and accepts className.",
      overflowAxis:
        "Measured axis (vertical needs a container with a fixed height).",
      overflowDirection:
        "Among items with the same priority, hide from the end or from the start.",
      minimumVisible: "Number of items that always stay visible.",
      padding:
        "Extra space (px) reserved at the end; the menu button is already measured.",
      onOverflowChange: "Called when the set of hidden items changes.",
      "OverflowItem.id / priority / groupId":
        "Identifier, priority (higher stays longer), group.",
      "OverflowDivider.groupId":
        "The divider hides when every item in its group is hidden (no ref-forwarding child needed).",
      "useOverflowMenu<T>()": 'For the "…" menu button.',
      "useOverflowItems()": "Ids of the hidden items, in DOM order.",
      "useIsOverflowItemVisible(id) / useIsOverflowGroupVisible(groupId)":
        "State of one item / one group.",
      "computeOverflow(input)":
        "The pure algorithm (no DOM), for tests or custom layouts.",
    },
  },

  timepicker: {
    description:
      'The list holds times `increment` minutes apart between `startHour` and `endHour`. Type "9", "930", "9h30", "21:15" or "9:30 PM", then press Enter or leave the field to confirm; while you type, the list highlights the nearest time. `onTimeChange(event, { selectedTime, selectedTimeText, errorType })` reports "invalid-input" / "out-of-start-bound" / "out-of-end-bound" so you can show the error through `<Field>`. The default hour cycle follows `locale` (vi-VN → 24-hour). Shares the input shell (`fieldAppearanceClass`) and the options with Combobox.',
    examples: [
      {
        title: "Working hours, 15-minute steps",
        description:
          'startHour / endHour (endHour excluded) limit the list; typing "7" or "19:00" reports an out-of-range error.',
      },
      {
        title: "minTime / maxTime & dateAnchor",
        description:
          "Only the time part is compared; the returned time is set on the date of dateAnchor.",
      },
      {
        title: "12-hour (SA / CH, AM / PM)",
        description:
          'hourCycle="h12" uses the locale\'s day period labels; locale="en-US" defaults to 12-hour.',
      },
      {
        title: "Size, appearance & disabled",
        description:
          "small 24px, medium 32px, large 40px; appearance as in Input / Combobox.",
      },
    ],
    dos: [
      "Wrap it in `<Field>` and show a message based on the `errorType` from onTimeChange.",
      "Pick an increment (15 / 30 minutes) that keeps the list short; other times can still be typed.",
      "Set startHour / endHour or minTime / maxTime instead of checking the value yourself after selection.",
    ],
    donts: [
      'Don\'t use TimePicker for durations ("2 hours 30 minutes"). Use SpinButton.',
      "Don't format times differently from one screen to another. Use hourCycle / locale.",
    ],
    props: {
      "value / defaultValue": "Selected time (controlled / uncontrolled).",
      onTimeChange:
        "Called when an option is picked or typed text is confirmed (Enter / leaving the field).",
      increment: "Step between options (minutes).",
      "startHour / endHour": "First hour (included) and last hour (excluded).",
      "minTime / maxTime": "Earliest / latest time (included, time part only).",
      hourCycle: "24-hour, or 12-hour with day period labels.",
      locale: "Sets the default hourCycle and the SA/CH, AM/PM labels.",
      dateAnchor: "Date the returned time is set on.",
      formatDateToTimeString: "Custom display format.",
      appearance: "Input shell style.",
      size: "Height 24 / 32 / 40px.",
      "disabled / required / id / aria-*":
        "Passed by Field when wrapped in <Field>.",
      "formatTime / parseTimeString / getTimesInRange / getTimeBoundsError":
        "Pure functions to format a time, parse typed text, generate the time list and check the bounds.",
    },
    defaults: { hourCycle: "from locale", dateAnchor: "date of value / today" },
  },

  daterangepresets: {
    description:
      "Pass `presets` (an array of `{ label, range: () => ({ from, to }) }`) to show quick choices next to the calendar; on narrow screens the list sits above it. `DEFAULT_RANGE_PRESETS` contains today, the last 7 days, the last 30 days, this month and last month (with Vietnamese labels), always computed from the current date. The preset that matches the selected range is marked (aria-pressed); presets outside minDate / maxDate are disabled. All existing DateRangePicker props still work.",
    examples: [
      {
        title: "Custom presets & maxDate",
        description:
          "maxDate is today, so “30 ngày tới” (next 30 days) is disabled.",
      },
    ],
    dos: [
      "Keep to the 3–6 presets used most in your domain; people can still pick dates on the calendar.",
      "Compute the range inside `range()` (not as a constant) so presets stay correct for the current date.",
    ],
    donts: [
      "Don't add presets for future ranges when maxDate is today: they will be disabled.",
      'Don\'t use vague preset labels ("Recent"). State the number of days or months.',
    ],
    props: {
      presets:
        "{ label, range: () => ({ from, to }) }, shown next to the calendar and above it on narrow screens.",
      presetsLabel: "Label of the preset group for screen readers.",
      DEFAULT_RANGE_PRESETS:
        "Today, last 7 days, last 30 days, this month (up to today), last month.",
      numberOfMonths: "Number of months shown; 1 works better on mobile.",
      "value / onSelectRange / minDate / maxDate / clearable…":
        "As in DateRangePicker (see the DatePicker page).",
    },
    defaults: {
      presetsLabel: "“Chọn nhanh khoảng ngày” (quick date range picks)",
    },
  },
};
