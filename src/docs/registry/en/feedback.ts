import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/feedback.tsx.
export const en: Record<string, ComponentDocEn> = {
  progressbar: {
    description:
      "Use it for tasks that take longer than a few seconds, such as uploading files, installing or syncing. When the total amount of work is known, pass `value` (0 → max); otherwise leave `value` out and the bar keeps moving. Use the semantic colors (success/warning/error) only to report the result, and always add text that describes it.",
    examples: [
      { title: "Indeterminate", description: "Leave out `value` when the total time is unknown." },
      {
        title: "Color, thickness & shape",
        description: "thickness medium (2px) / large (4px); shape rounded / square. Without a label, set aria-label.",
      },
      { title: "Updating over time", description: "Switch to success when the task finishes and update the description to match." },
    ],
    dos: [
      "Add a label that describes the task and, where possible, the time or amount left.",
      "Switch to the determinate form as soon as the total amount of work is known.",
      "Switch to success / error when the task ends, with text that explains the result.",
    ],
    donts: [
      "Don't use it for tasks under 1–2 seconds. Use Spinner or show nothing.",
      "Don't let the bar move backward or sit at 99% for a long time.",
      "Don't use color as the only signal for an error.",
    ],
    props: {
      value: "Value from 0 to max. Leave it out for an indeterminate bar.",
      max: "Maximum value.",
      thickness: "Thickness 2px / 4px.",
      shape: "Rounded or square ends.",
      color: "Bar color.",
      "label / description": "Label above and description below (aria attributes are set automatically).",
      rootClassName: "Class for the outer wrapper when there is a label / description.",
    },
  },

  spinner: {
    description:
      "Use it while content loads or an action waits for a response. There are 8 sizes from 16 to 44px. The label can sit before, after, above or below the spinner, and the inverted appearance works on dark or brand backgrounds.",
    examples: [
      { title: "Size", description: "extra-tiny 16 → huge 44px." },
      { title: "Label position", description: "before, after (default), above, below." },
      { title: "Inverted", description: "For brand or dark backgrounds." },
    ],
    dos: [
      "Place the Spinner close to the content that is loading.",
      "Add a short label that says what is happening when the wait is longer than a few seconds.",
      "Match the size to the container (small button → tiny, whole page → large).",
    ],
    donts: [
      "Don't show several Spinners on one screen at the same time.",
      "Don't use it when the progress is known. Use ProgressBar.",
      "Don't use the inverted appearance on light backgrounds.",
    ],
    props: {
      size: "16 / 20 / 24 / 28 / 32 / 36 / 40 / 44px.",
      appearance: "Color of the arc and track.",
      label: "Label (linked through aria-labelledby). Without a label, the aria-label is “Đang tải” (Loading).",
      labelPosition: "Label position.",
    },
  },

  skeleton: {
    description:
      "Skeleton wraps SkeletonItems and sets aria-busy. Arrange SkeletonItems (rectangle / circle / square, 8 → 128px tall) to match the layout of the real content. The wave or pulse animation turns off when people enable reduced motion.",
    examples: [
      { title: "Pulse", description: "Fades the opacity in and out instead of a moving highlight." },
      { title: "Shape", description: "circle, square, rectangle." },
      { title: "Translucent", description: "Semi-transparent, for surfaces that have a background color." },
    ],
    dos: [
      "Match the real layout closely (a round avatar, a title line shorter than the body lines).",
      "Set an aria-label on the Skeleton that describes what is loading.",
    ],
    donts: [
      "Don't use Skeleton for user actions (save, send). Use Spinner.",
      "Don't leave the Skeleton up forever when loading fails. Replace it with an error message.",
      "Don't mix wave and pulse in the same area.",
    ],
    props: {
      "Skeleton.animation": "Animation for every child SkeletonItem.",
      "Skeleton.appearance": "Solid or semi-transparent background.",
      "SkeletonItem.shape": "Block shape.",
      "SkeletonItem.size": "Height (rectangle) or side length (circle / square), in px.",
      "SkeletonItem.animation / appearance": "Overrides the value set on the parent Skeleton.",
    },
  },

  empty: {
    description:
      "Compose it from EmptyHeader, EmptyMedia (an icon in a 48px tile, or an Avatar), EmptyTitle, EmptyDescription and EmptyContent for the actions. The outline variant has a dashed border, which suits empty content areas in a page or a file drop zone.",
    examples: [
      { title: "No results", description: "The default variant (no border) on a search page." },
      { title: "With Avatar", description: "EmptyMedia variant=\"default\" to hold an Avatar or an illustration." },
    ],
    dos: [
      "Explain why it's empty and what people should do next.",
      "Offer at most 1 primary action and 1 secondary action.",
      "Use an icon that fits the context (folder, search, inbox…).",
    ],
    donts: [
      "Don't just write “No data” without any guidance.",
      "Don't use the brand color or a large gradient for the icon tile.",
      "Don't use Empty for loading errors. Use MessageBar with intent error.",
    ],
    props: {
      "Empty.variant": "outline: dashed stroke-1 border, 12px radius.",
      "EmptyMedia.variant": "icon: 48px tile on background-4; default: rendered as is (Avatar, image).",
      EmptyTitle: "Title in subtitle1 semibold.",
      EmptyDescription: "Description in body1 foreground-3; links inside get the link color automatically.",
      EmptyContent: "Action area (Button, Link).",
    },
  },

  toast: {
    description:
      "Place `<Toaster />` once at the app root, then call `dispatchToast` from `useToast()` (or the `toast()` helper). Each toast has an intent (info / success / warning / error) with the same icons as MessageBar, a title, a body, one action and a close button. Swipe to dismiss it; hovering pauses the timer; F8 moves focus to the notification region.",
    examples: [
      { title: "Intent", description: "info, success, warning, error, with the same icons and colors as MessageBar." },
      { title: "Position", description: "Toaster position: top-start, top, top-end, bottom-start, bottom, bottom-end (default)." },
      { title: "No auto-dismiss & dismiss from code", description: "timeout: -1 keeps the toast open until people or your code dismiss it." },
    ],
    dos: [
      "Use it for short feedback after an action: saved, sent, deleted (with Undo).",
      "Keep the title short and the body to 1–2 lines.",
      "For errors that need attention right away, set timeout to -1 or use MessageBar / Dialog.",
    ],
    donts: [
      "Don't put important information only in a toast. It disappears.",
      "Don't fire a burst of toasts for the same event.",
      "Don't put a form or several actions in a toast.",
    ],
    props: {
      "Toaster.position": "Position of the notification region.",
      "Toaster.toasterId": "Identifier when there are several Toasters; use it with useToast(toasterId).",
      "Toaster.limit": "Number of toasts shown at once.",
      "useToast(toasterId?)": "Imperative API; dispatchToast returns the id.",
      intent: "Icon and icon color.",
      "title / body": "Title (body1 semibold) and body.",
      action: "Link-style action to the right of the title.",
      timeout: "Time before the toast closes on its own (ms); -1 = never.",
      "toastId / onDismiss / hideDismiss": "Fixed id, callback on dismiss, hides the X button.",
    },
  },

  infolabel: {
    description:
      "Use it when a field needs a short explanation but a permanent hint would take too much space. The (i) button opens a Popover on click or on Enter / Space; the icon switches to its filled form on hover and while the Popover is open.",
    examples: [
      { title: "Size & weight", description: "small, medium (default), large; weight regular / semibold." },
      { title: "Required & content with a link", description: "info accepts a ReactNode, so it can contain a link." },
    ],
    dos: [
      "Keep the Popover content short (1–3 sentences). It should add to the label, not repeat it.",
      "Use htmlFor so the label stays linked to the input.",
    ],
    donts: [
      "Don't put information people must read to fill in the field in the Popover. Use hint.",
      "Don't put a form or several actions in info.",
    ],
    props: {
      info: "Popover content.",
      size: "Font size of the label and button.",
      weight: "Label font weight.",
      "required / disabled": "Red *; disabled text.",
      infoButtonLabel: "aria-label of the (i) button.",
      "htmlFor, …": "Passed to the <label> element.",
    },
    defaults: { infoButtonLabel: "“Thông tin” (Info)" },
  },

  hovercard: {
    description:
      "For mouse users who want a quick look at a profile, repository or document before opening it. The surface shares its classes with Popover (shadow-16, rounded-medium). Treat the content as supplementary, because keyboard and touch users may never see it.",
    examples: [{ title: "Delay, position & arrow", description: "openDelay / closeDelay (ms), side, withArrow." }],
    dos: ["Use it to preview what's behind a link (profile, document, repository).", "Keep the content short and easy to skim."],
    donts: [
      "Don't put important actions only in a HoverCard. They are hard to reach by keyboard or touch.",
      "Don't use it in place of Tooltip (short labels) or Popover (interactive content opened on click).",
    ],
    props: {
      "HoverCard.openDelay / closeDelay": "Open / close delay (ms).",
      "HoverCard.open / onOpenChange": "Controls the open state.",
      "HoverCardContent.side / align": "Position relative to the trigger.",
      "HoverCardContent.withArrow": "Shows the arrow.",
    },
  },

  drawer: {
    description:
      "There are two kinds: overlay drawers (modal, with a backdrop, built on Radix Dialog: Drawer + DrawerSurface, or OverlayDrawer) and InlineDrawer, which sits in the layout and pushes the content next to it. Positions are start / end / bottom; sizes are small 320, medium 592, large 940 or full. Inside, use DrawerHeader, DrawerHeaderTitle, DrawerBody (scrolls) and DrawerFooter.",
    examples: [
      { title: "Overlay drawer", description: "Modal, with a backdrop; the primary button comes before Cancel in the footer." },
      { title: "Position & size", description: "OverlayDrawer combines Drawer + DrawerSurface; position start / end / bottom." },
    ],
    dos: [
      "Use an overlay drawer for temporary tasks (filters, record details) and an inline drawer for navigation or panels that should stay visible.",
      "Always include a title and a clear way to close the drawer (X button, Cancel, Esc).",
      "Pick a size that fits the content; use full only on small screens.",
    ],
    donts: [
      "Don't open a drawer on top of another drawer.",
      "Don't use a drawer for short confirmations. Use Dialog.",
      "Don't put more than 2–3 actions in the footer.",
    ],
    props: {
      "DrawerSurface / OverlayDrawer.position": "Edge the drawer slides in from.",
      "DrawerSurface / OverlayDrawer.size": "320 / 592 / 940px / full screen (width, or height when bottom).",
      "DrawerSurface.modalType": "alert: doesn't close on a backdrop click or Esc.",
      "OverlayDrawer.open / onOpenChange": "Controls the open state (the Drawer root accepts these props too).",
      "InlineDrawer.open / position / size": "Drawer inside the layout; animates its width.",
      "InlineDrawer.separator": "stroke-2 divider between the drawer and the content.",
      "DrawerHeaderTitle.action": "Element to the right of the title (usually a close button).",
    },
  },

  accordion: {
    description:
      "Open one item at a time (type=\"single\", optionally collapsible) or several (type=\"multiple\"). There are three appearances: flush (continuous, default), separated (each item is a card with an 8px radius and shadow-2) and outline (one shared border with dividers between items). A header can have an icon and a description line. An Accordion nested in a panel inherits its parent's size and shows a vertical guide line for the hierarchy. Panels animate their height and respect reduced motion.",
    examples: [
      {
        title: "Separated: cards with icon & description",
        description:
          "appearance=\"separated\": each item is a card; description is a secondary line under the title (read right after the title, as part of the button's name).",
      },
      {
        title: "Outline, multiple items & chevron at the end",
        description: "appearance=\"outline\": one shared border with stroke-2 dividers; type=\"multiple\", expandIconPosition=\"end\", a disabled item.",
      },
      {
        title: "Nested",
        description:
          "An Accordion inside an AccordionPanel inherits the parent's size / expandIconPosition and has a vertical guide line along the start edge.",
      },
      { title: "Size", description: "small, medium (default), large, extra-large." },
    ],
    dos: [
      "Keep titles short and clear about what's inside; use description for a one-line summary.",
      "Use separated for settings or FAQ pages that stand out from the background; use outline when the Accordion sits on a surface of the same color.",
      "Open the most important item by default (defaultValue); use type=\"multiple\" when people need to compare items.",
    ],
    donts: [
      "Don't hide information people must read in a collapsed item.",
      "Don't nest more than 2 levels. For deeper hierarchies, use Tree.",
      "Don't mix appearances in one group of items.",
    ],
    props: {
      type: "One or several items open at a time (required).",
      collapsible: "type=\"single\": lets people close the open item.",
      "value / defaultValue / onValueChange": "Open item(s).",
      appearance: "Continuous · separate cards (rounded-xlarge, shadow-2) · border with dividers.",
      size: "Header size; a nested Accordion follows its parent by default.",
      expandIconPosition: "Chevron position; a nested Accordion follows its parent by default.",
      "AccordionItem.value / disabled": "Item identifier; disables the item.",
      "AccordionHeader.icon": "Size 20 icon before the title.",
      "AccordionHeader.description":
        "Secondary line (caption) under the title; part of the button's accessible name (matches the visible text, WCAG 2.5.3).",
    },
  },

  collapsible: {
    description:
      "A single block, unlike Accordion, which groups several items. Closed content is hidden from screen readers and from the Tab order. The animation uses grid-template-rows and turns off when reduced motion is on.",
    examples: [{ title: "Open by default, icon button", description: "No state needed: the chevron rotates based on the trigger's data-state." }],
    dos: [
      "The button label says what will happen (“Show 3 more items”, “Collapse”).",
      "Use it for secondary content or extra details of a block.",
    ],
    donts: ["Don't stack several Collapsibles as a list. Use Accordion.", "Don't hide the primary action in the collapsed area."],
    props: {
      "open / defaultOpen / onOpenChange": "Open state.",
      disabled: "Disables the trigger.",
      "CollapsibleTrigger.asChild": "Uses your Button as the trigger (it receives data-state).",
      "CollapsibleContent.className": "Applies to the inner block; set padding / layout here.",
    },
  },

  calendar: {
    description:
      "Built on react-day-picker v10 with a Fluent look: 32px day cells with a 4px radius, today in bold brand text with an underline, selected days on a brand background, days inside a range tinted with brand-background-2. Defaults to Vietnamese, with weeks starting on Monday. Accepts every DayPicker prop (mode, selected, onSelect, disabled, numberOfMonths…).",
    examples: [
      { title: "Range selection", description: "mode=\"range\": the first and last days get a brand background, the days between a brand tint." },
      { title: "Multiple days & disabled days", description: "mode=\"multiple\"; disabled={{ dayOfWeek: [0, 6] }} disables weekends." },
    ],
    dos: [
      "Use Calendar on its own when the calendar is the main content (booking, picking time off).",
      "Disable invalid days with disabled instead of reporting an error after the pick.",
    ],
    donts: [
      "Don't use Calendar for birth dates far from today. Allow typing or use a year dropdown (captionLayout=\"dropdown\").",
      "Don't show more than 2 months side by side on narrow screens.",
    ],
    props: {
      mode: "Selection mode.",
      "selected / onSelect": "Value, depending on mode.",
      disabled: "Disabled days (Date, { before }, { after }, { dayOfWeek }…).",
      numberOfMonths: "Number of months shown.",
      showOutsideDays: "Shows days of the previous / next month (foreground-4).",
      locale: "Language; import it from react-day-picker/locale.",
      "…": "Any other react-day-picker v10 prop.",
    },
  },

  datepicker: {
    description:
      "The trigger shares Input's border style (accessible bottom border, brand bar on focus), with a calendar icon on the right and an optional clear button (clearable). Put it in a `<Field>` for a label, hint and error message. DateRangePicker picks a date range and shows two months side by side.",
    examples: [
      { title: "Date limits & validation", description: "minDate disables the days before today; Field shows the error / success message." },
      { title: "Date range", description: "DateRangePicker: the popover closes once both the start and end dates are picked." },
      { title: "Size & disabled", description: "small 24px, medium 32px, large 40px." },
    ],
    dos: [
      "Always provide a label (Field label or aria-label) and a format hint when needed.",
      "Use minDate / maxDate to block invalid dates.",
      "Turn on clearable for optional fields.",
    ],
    donts: [
      "Don't use DatePicker for dates far from today (birth dates) without a quick way to jump between years.",
      "Don't format dates differently from one screen to another. Keep dd/MM/yyyy.",
    ],
    props: {
      "value / defaultValue": "Selected date (controlled / uncontrolled).",
      onSelectDate: "Called when a date is picked or cleared.",
      placeholder: "Text shown when the field is empty.",
      clearable: "Shows a clear button when there is a value.",
      "minDate / maxDate": "Range of dates that can be picked.",
      formatDate: "Display format.",
      size: "Height 24 / 32 / 40px.",
      "disabled / required / id / aria-*": "Passed automatically by Field when wrapped in <Field>.",
      "DateRangePicker.value / onSelectRange": "Range { from, to }; numberOfMonths defaults to 2.",
    },
    defaults: { placeholder: "“Chọn ngày…” (Pick a date…)" },
  },
};
