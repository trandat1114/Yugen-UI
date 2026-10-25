import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/core.tsx.
export const en: Record<string, ComponentDocEn> = {
  button: {
    description:
      "Use Button for important actions such as sending feedback, confirming a change or moving to the next step. To go to another page, use a link.",
    examples: [
      {
        title: "Appearance",
        description: "primary for the main action, secondary (default), then outline, subtle and transparent for decreasing emphasis.",
      },
      { title: "Size", description: "small (24px), medium (32px, default), large (40px)." },
      { title: "With icon", description: "The icon sits before the label to support it. Icon-only buttons need an aria-label." },
      { title: "Shape", description: "rounded (default), circular for FABs and floating toolbars, square for edge-to-edge toolbars." },
      {
        title: "Disabled",
        description: "Disable a button only when people can tell why. Otherwise leave it enabled and report the problem on click.",
      },
      { title: "Danger", description: "An addition in this library (not in Fluent) for destructive actions that can't be undone." },
      {
        title: "Loading",
        description:
          "Click a button: a Spinner replaces the icon (centered on buttons without one), the width stays the same, and the button stays focusable but ignores clicks. loadingText changes the label without shifting the layout.",
      },
    ],
    dos: [
      "Use at most one primary Button per area or screen.",
      "Labels are short verbs that describe the result: “Save”, “Send invite”.",
      "Place the primary action on the left (or on the right in a Dialog, following reading order).",
    ],
    donts: [
      "Don't use Button for navigation. Use a link.",
      "Don't change a Button's background color with className; use appearance.",
      "Don't leave an icon-only Button without an aria-label or Tooltip.",
    ],
    props: {
      appearance: "How much emphasis the action gets.",
      size: "Height 24 / 32 / 40px.",
      shape: "Corner rounding.",
      icon: "Fluent icon (@fluentui/react-icons, size 20).",
      iconPosition: "Icon position relative to the label.",
      iconOnly: "Turns on when there is an icon and no children.",
      asChild: "Renders into the child element (e.g. <a>) instead of a <button>.",
      loading:
        "Busy state: a Spinner replaces the icon (or sits in the middle of the button), the width is kept, aria-busy and aria-disabled are set, and clicks are ignored while the button stays focusable.",
      loadingText: "Label while loading (e.g. “Saving…”). The button is always as wide as the longer label, so nothing shifts.",
    },
    defaults: { iconOnly: "auto" },
  },

  badge: {
    description: "Badge is not interactive. Pick its color for meaning (danger, success, warning…), not for looks.",
    examples: [
      { title: "Appearance", description: "filled (default), tint, outline, ghost." },
      { title: "Semantic colors", description: "brand, danger, success, warning, informative, subtle." },
      { title: "Status tints", description: "Lower contrast than filled, which suits dense tables and lists." },
      { title: "Size & shape", description: "small → extra-large; circular (default), rounded, square." },
    ],
    dos: ["Keep Badge content very short (1–2 words or a number).", "Place the Badge next to the object it describes."],
    donts: ["Don't use Badge as a button.", "Don't use the danger or success colors only as decoration."],
    props: {
      appearance: "Display style.",
      color: "Semantic color.",
      size: "Height 16 / 20 / 24 / 32px.",
      shape: "Corner rounding.",
      icon: "Icon placed before the content.",
    },
  },

  avatar: {
    description: "Always pass the real name. It is used for the initials, the colorful color and the screen reader label.",
    examples: [
      { title: "Size", description: "20, 24, 32 (default), 40, 48, 64, 96." },
      { title: "Color", description: "neutral (default), brand, colorful (a stable color derived from a hash of name)." },
      { title: "Presence", description: "available, busy, away, offline." },
      { title: "Shape", description: "circular for people; square for groups, apps and bots." },
    ],
    dos: ["Use color=\"colorful\" when several people appear side by side, so they are easier to tell apart.", "Use square for entities that aren't people."],
    donts: ["Don't pass an empty or made-up name.", "Don't set the avatar background color with className."],
    props: {
      name: "Required. Used for the initials, the color and the aria-label.",
      src: "Profile image; falls back to the initials if it fails to load.",
      size: "Size in px.",
      color: "Color palette.",
      shape: "Shape.",
      presence: "Status dot.",
    },
  },

  card: {
    description:
      "Card uses elevation (shadow4) rather than a border to separate itself from the background. Compose it from CardHeader, CardPreview, CardContent and CardFooter.",
    examples: [
      { title: "Appearance", description: "filled (default), filled-alternative, outline, subtle." },
      {
        title: "Interactive",
        description: "A clickable Card: elevation increases on hover. Wrap the content in an <a> or <button> for correct semantics.",
      },
      { title: "With preview", description: "CardPreview runs edge to edge across the Card to show an image or thumbnail." },
    ],
    dos: ["Keep each Card to a single topic.", "Use outline when the Card sits on a surface that already has color or elevation."],
    donts: ["Don't nest a Card inside a Card.", "Don't put more than 2 Buttons in CardFooter."],
    props: {
      appearance: "Surface style.",
      size: "Padding and gap 8 / 12 / 16px.",
      interactive: "Enables the hover and pressed states.",
      "CardHeader.image / header / description / action": "Header slots.",
    },
  },

  input: {
    description:
      "Input has Field built in: label, required marker, hint and validation message. On focus, a brand-colored bar grows from the middle of the bottom edge.",
    examples: [
      { title: "Appearance", description: "outline (default), underline, filled-darker, filled-lighter." },
      { title: "Validation", description: "validationState + validationMessage. An error should always say how to fix it." },
      { title: "Content before / after", description: "An icon or unit inside the input." },
      { title: "Size & disabled", description: "small (24px), medium (32px), large (40px)." },
    ],
    dos: ["Always show a visible label.", "Use hint for the expected format (e.g. DD/MM/YYYY).", "Mark required fields with required."],
    donts: ["Don't use a placeholder in place of a label.", "Don't show vague errors such as “Invalid”."],
    props: {
      label: "Label linked to the input through htmlFor.",
      appearance: "Input style.",
      size: "Height 24 / 32 / 40px.",
      validationState: "Validation state.",
      validationMessage: "Message shown with validationState.",
      hint: "Hint below the input.",
      "contentBefore / contentAfter": "Content inside the input, before or after the text.",
      rootClassName: "Class for the outer Field wrapper (set the width here).",
    },
  },

  checkbox: {
    description: "Supports an indeterminate state for a “select all” checkbox when only some of the child items are selected.",
    examples: [
      { title: "States", description: "unchecked, checked, indeterminate, disabled." },
      { title: "Size & label position", description: "medium (16px), large (20px); label before or after." },
    ],
    dos: ["Stack checkbox lists vertically.", "Write the label to describe the checked state."],
    donts: ["Don't use Checkbox for changes that take effect immediately. Use Switch.", "Don't use it for mutually exclusive options. Use RadioGroup."],
    props: {
      label: "Clickable label.",
      "checked / defaultChecked": "Controlled / uncontrolled.",
      onCheckedChange: "Called when the value changes.",
      size: "Box size 16 / 20px.",
      labelPosition: "Label position.",
    },
  },

  switch: {
    description: "Use it for system or app settings that don't need a Save button.",
    examples: [
      { title: "States", description: "off, on, disabled." },
      { title: "Label before", description: "Suits settings lists aligned to the right." },
    ],
    dos: ["The label names what gets turned on, not the action (“Wi-Fi”, not “Turn on Wi-Fi”)."],
    donts: ["Don't use Switch in a form that has a Submit button. Use Checkbox."],
    props: {
      label: "Label.",
      "checked / defaultChecked": "Controlled / uncontrolled.",
      onCheckedChange: "Called when the value changes.",
      labelPosition: "Label position.",
    },
  },

  tabs: {
    description: "The selected tab has bold text and a 3px brand bar along the bottom. Hovering a tab shows a gray bar.",
    examples: [
      { title: "Appearance subtle", description: "Shows a background on hover. Use it on toolbars." },
      { title: "Size", description: "small, medium (default), large." },
      { title: "Vertical", description: "orientation=\"vertical\" for secondary navigation on settings pages." },
    ],
    dos: ["Keep tab labels short (1–2 words).", "Keep to about 6 tabs per row at most."],
    donts: ["Don't use Tabs for sequential steps. Use a wizard or stepper.", "Don't nest Tabs inside Tabs."],
    props: {
      "Tabs.defaultValue / value": "Selected tab.",
      "Tabs.orientation": "Orientation.",
      "TabsList.appearance": "Background on hover.",
      "TabsList.size": "Tab size.",
      "TabsTrigger.icon": "Icon before the label (brand-colored when active).",
    },
  },

  tooltip: {
    description: "Icon-only Buttons in particular need one. Wrap the app in <TooltipProvider> once, at the root.",
    examples: [
      { title: "Placement", description: "side: top (default), right, bottom, left." },
      { title: "No arrow", description: "withArrow={false} when the tooltip sits right next to a small element." },
    ],
    dos: ["Keep tooltip content short, one sentence at most.", "Always add a tooltip to icon-only Buttons."],
    donts: ["Don't put links or buttons in a tooltip. Use Popover.", "Don't put important information only in a tooltip."],
    props: {
      content: "(SimpleTooltip) Content.",
      appearance: "Light background or inverted colors.",
      side: "Position relative to the trigger.",
      withArrow: "Shows the arrow.",
    },
  },

  dialog: {
    description:
      "modalType=\"modal\" closes with Esc or a click on the backdrop. modalType=\"alert\" makes people choose one of the actions.",
    examples: [{ title: "Alert dialog", description: "No X button, and Esc or a backdrop click doesn't close it." }],
    dos: [
      "The title states the question or action clearly.",
      "The primary button uses a specific verb (“Delete”, not “OK”).",
      "Place the primary button to the right of Cancel.",
    ],
    donts: ["Don't open a Dialog on top of another Dialog.", "Don't use Dialog for messages that need no response. Use MessageBar or Toast."],
    props: {
      "Dialog.open / onOpenChange": "Controls the open state.",
      "DialogSurface.modalType": "How the dialog can be closed.",
      "DialogTitle.action": "Pass null to hide the close button.",
      DialogActions: "Right-aligned row of buttons at the bottom.",
    },
    defaults: { "DialogTitle.action": "close button (X)" },
  },

  messagebar: {
    description: "MessageBar stays until people dismiss it or the situation is resolved, unlike a Toast, which disappears on its own.",
    examples: [
      { title: "Intent", description: "info, success, warning, error." },
      { title: "Actions & dismiss", description: "actions holds buttons that resolve the issue; onDismiss shows a close button." },
      { title: "Multiline", description: "layout=\"multiline\" for long content; actions move to a line below." },
    ],
    dos: ["Place the MessageBar at the top of the area it describes.", "State the cause and how to fix it."],
    donts: ["Don't show more than 2–3 MessageBars at once.", "Don't use the error intent for neutral information."],
    props: {
      intent: "Severity.",
      title: "Bold title.",
      actions: "Action buttons (size small).",
      onDismiss: "Shows a close button.",
      layout: "Layout.",
    },
  },
};
