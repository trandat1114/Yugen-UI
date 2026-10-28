import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/display-extra.tsx.
export const en: Record<string, ComponentDocEn> = {
  sonner: {
    description:
      "Place `<Sonner />` once at the app root, then call `sonner(\"…\")`, `sonner.success(…)` or `sonner.promise(…)` from anywhere. Calling again with the same `id` replaces the content in place. Hovering or focusing the region fans the stack out into a list and pauses the timers; swipe to dismiss; F8 moves focus to the region. Toast stays for a fixed list of notifications in the Fluent style.",
    examples: [
      {
        title: "Types",
        description: "Default has no icon; success, info, warning and error use the MessageBar icons; loading never closes on its own.",
      },
      {
        title: "Following a promise",
        description: "sonner.promise shows loading, then turns into success or error in place. success / error accept a function to use the result.",
      },
      {
        title: "Stack & expand",
        description: "At most visibleToasts (3) are shown; older ones wait behind. expand keeps the stack open.",
      },
      {
        title: "Position, richColors & close button",
        description: "richColors tints the background and border by type; closeButton adds an X; cancel is a secondary button that dismisses.",
      },
    ],
    dos: [
      "Use it for short feedback after an action: saved, sent, deleted with Undo.",
      "Use sonner.promise for background work so people see the result without waiting.",
      "Set altText on the action when its label is not a string.",
    ],
    donts: [
      "Don't put important information only in a notification. It disappears.",
      "Don't place a Toaster and a Sonner in the same corner of one app.",
      "Don't put a form or more than two buttons in one notification.",
    ],
    props: {
      position: "Position of the region; start / end follow the reading direction.",
      expand: "Always shown as a list.",
      visibleToasts: "Number of notifications shown at once.",
      richColors: "Background and border by type, like MessageBar.",
      closeButton: "Close (X) button on every notification; each one can override it.",
      duration: "Default time before closing (ms).",
      gap: "Space between notifications when expanded, and how much peeks out when stacked (px).",
      sonnerId: "With several Sonners: only notifications sent with the same sonnerId show here.",
      "sonner(title, options?)": "Shows a notification and returns its id. Also .success, .info, .warning, .error, .loading.",
      "sonner.promise(promise, data)": "data: { loading, success, error } plus the other options; success / error take a value or a function.",
      "sonner.dismiss(id?)": "Dismisses one notification, or all of them without an id.",
      "SonnerOptions.description": "Line below the title.",
      "SonnerOptions.action": "Primary button; call event.preventDefault() in onClick to keep the notification open.",
      "SonnerOptions.cancel": "Secondary button that dismisses the notification.",
      "SonnerOptions.id": "Call again with the id of an open notification to replace its content in place.",
      "SonnerOptions.icon": "Replaces the type icon; null = no icon.",
      "SonnerOptions.duration": "Overrides the time before closing; Infinity = stays open.",
      "SonnerOptions.onDismiss": "Closed by the user (button, swipe, Esc) or by sonner.dismiss.",
      "SonnerOptions.onAutoClose": "The timer ran out.",
    },
  },

  timeline: {
    description:
      "Timeline is an `<ol>`; each TimelineItem has a title, a time, an icon (or Avatar) and optional extra content. Pass `dateTime` to turn the time into a machine-readable `<time>`. The compact variant uses a small dot and one line per event, which suits long activity logs. Icons are decorative, so the title must describe the event on its own.",
    examples: [
      { title: "Compact", description: "Small dot, title and time on one line; extra content uses caption text." },
      { title: "Intent without icons", description: "Without an icon the item shows a dot in the intent color: neutral, brand, success, warning, danger." },
    ],
    dos: [
      "Put the newest event first, unless people follow a process from start to end.",
      "Write titles that say who did what, because icons are not read by screen readers.",
      "Pass dateTime when the shown time is relative (“2 hours ago”).",
    ],
    donts: [
      "Don't use Timeline for steps people still have to go through. Use Stepper.",
      "Don't use intent for decoration; keep color for states that really differ.",
    ],
    props: {
      variant: "detailed: 32px icon, content below · compact: small dot, one line.",
      "TimelineItem.title": "The event: who did what.",
      "TimelineItem.time": "Time shown to people.",
      "TimelineItem.dateTime": "ISO 8601 timestamp → <time dateTime>.",
      "TimelineItem.icon": "Icon or Avatar; empty = dot.",
      "TimelineItem.intent": "Color of the icon or dot.",
      "TimelineItem.children": "Extra content: a comment, files, tags.",
    },
  },

  descriptionlist: {
    description:
      "DescriptionList is a `<dl>`; each DescriptionItem is a `<dt>` and a `<dd>`. columns is the maximum number of columns: narrow containers drop columns without breakpoints. The inline layout puts label and value on one row; valueAlign end pushes values to the end of the row for totals. copyable adds a button that copies the value, and screen readers hear the item's label with it.",
    examples: [
      { title: "Inline & divided", description: "Label and value on one row with a line between items, for profile and settings pages." },
      { title: "Totals", description: "valueAlign end pushes values to the end of the row; the last item is bolder through className." },
    ],
    dos: [
      "Keep labels short, in sentence case, without a colon.",
      "Turn on copyable for values people copy: order numbers, email addresses, API keys.",
      "Use fullWidth for long values (addresses, notes) when there are several columns.",
    ],
    donts: [
      "Don't use DescriptionList for many rows with the same columns. Use Table.",
      "Don't leave a value empty; write “None yet” or a dash with an explanation.",
    ],
    props: {
      columns: "Maximum number of columns; narrow containers drop columns.",
      layout: "Label above the value, or on the same row.",
      divided: "Line above every item.",
      valueAlign: "end: values at the end of the row (inline layout).",
      "DescriptionItem.label": "Label (<dt>).",
      "DescriptionItem.children": "Value (<dd>).",
      "DescriptionItem.copyable": "Copy button: true copies the shown text, a string copies that string.",
      "DescriptionItem.fullWidth": "Spans the whole row when there are several columns.",
    },
  },

  stat: {
    description:
      "Numbers are formatted with the YugenProvider locale and shortened from 10,000 (12.9K). delta is a signed change shown as a percentage by default; goodDirection decides whether going up is good (green) or bad (red), and the direction is always spelled out for screen readers. chart takes a small chart, usually a Sparkline. StatTile in Yugen Labs is now Stat with a Sparkline drawn from trend.",
    examples: [
      { title: "Small chart & icon", description: "chart puts a chart next to the number; icon sits before the label." },
      { title: "Size", description: "medium 28px, large 40px, hero 68px. At most one hero per screen." },
    ],
    dos: [
      "Name the comparison period in deltaLabel (“vs last month”).",
      "Set goodDirection=\"down\" for metrics where lower is better: error rate, wait time, cost.",
      "Use valueFormat with style currency / unit to get units right for the locale.",
    ],
    donts: [
      "Don't put more than 4–5 Stats in one row; people won't know where to look.",
      "Don't color a change that is neither good nor bad. Set goodDirection=\"neutral\".",
    ],
    props: {
      label: "Label in sentence case, without a colon.",
      value: "Numbers are formatted for the locale; strings are shown as they are.",
      valueFormat: "Number format.",
      delta: "Signed change (0.124 = +12.4%).",
      deltaFormat: "Format of the delta.",
      deltaLabel: "Comparison period.",
      goodDirection: "Which direction is good: sets the success / danger color.",
      size: "Number size 28 / 40 / 68px.",
      icon: "Icon before the label.",
      chart: "Small chart next to the number, usually a Sparkline.",
      locale: "Locale for Intl.NumberFormat; defaults to YugenProvider.",
    },
    defaults: { valueFormat: "compact from 10,000", deltaFormat: "percent" },
  },

  prose: {
    description:
      "Wrap content in `<Prose>` (or add the theme's `yugen-prose` class); HTML elements inside are styled without classes. The selectors have zero specificity, so a class on an element always wins; add the `not-prose` class to anything that should opt out. CodeBlock, Table, Quote and Timeline already carry `not-prose`. Size large (16px) suits long articles, medium (14px) docs and notes. Prose does not sanitize HTML: content from users must be sanitized first.",
    examples: [
      { title: "Article & HTML from a CMS", description: "asChild renders into <article>; sanitized HTML can go in through dangerouslySetInnerHTML." },
      { title: "Opting out with not-prose", description: "An element with the not-prose class (and everything inside it) keeps its own styles." },
    ],
    dos: [
      "Limit the line length (max-w-prose, about 65 characters) for long content.",
      "Sanitize HTML from a CMS or from users before rendering it.",
      "Use not-prose for interface parts in the middle of content (buttons, menus, forms).",
    ],
    donts: [
      "Don't wrap a whole app screen in Prose; wrap only the content.",
      "Don't use Prose to style a short piece of text. Use Text.",
    ],
    props: {
      size: "Base text size: body1 (14px) or body2 (16px).",
      asChild: "Renders into its only child (for example <article>).",
    },
  },
};
