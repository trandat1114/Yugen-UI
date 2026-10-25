import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/forms.tsx.
export const en: Record<string, ComponentDocEn> = {
  label: {
    description:
      "Label has three sizes, two weights, a * marker for required fields and a disabled state. Field already renders a label, so use Label on its own only when you build the form layout yourself.",
    examples: [
      { title: "Size", description: "small (12px), medium (14px, default), large (16px semibold)." },
      { title: "Required & disabled", description: "required adds a danger-colored *; disabled dims the label." },
      { title: "Linked to an input", description: "Link them with htmlFor + id (useId) so clicking the label focuses the input." },
    ],
    dos: [
      "Keep labels short and use sentence case.",
      "Always link the label to its control with htmlFor (or use Field).",
      "Mark required fields with required instead of writing “(required)”.",
    ],
    donts: [
      "Don't use Label as a section heading. Use the subtitle style from the type ramp.",
      "Don't end a label with a colon.",
      "Don't give labels the brand color.",
    ],
    props: {
      size: "Font size 12 / 14 / 16px (large is semibold by default).",
      weight: "Font weight; follows size by default.",
      required: "Shows a danger-colored * (or a custom marker).",
      disabled: "Text in foreground-disabled.",
      htmlFor: "id of the labeled control.",
    },
  },

  textarea: {
    description:
      "Textarea shares Input's look: a stroke-accessible bottom border and a brand bar that grows from the middle on focus. Put it in a Field for a label, hint and validation; set resize to let people drag it larger.",
    examples: [
      { title: "Appearance", description: "outline (default), filled-darker, filled-lighter. Use the filled styles on a contrasting colored background." },
      { title: "Size", description: "small, medium, large. Changes the font size, padding and minimum height." },
      { title: "Resize", description: "none (default), vertical, horizontal, both." },
      { title: "Validation & disabled", description: "Field passes aria-invalid / disabled down to the Textarea." },
    ],
    dos: [
      "Use it for content that can run longer than one line (descriptions, feedback, notes).",
      "Allow vertical resize when the length of the content is hard to predict.",
      "State the character limit in hint, if there is one.",
    ],
    donts: [
      "Don't use Textarea for single-line data such as a name or email. Use Input.",
      "Don't make a Textarea so short that people have to scroll right away.",
    ],
    props: {
      appearance: "Input style.",
      size: "Font size, padding and minimum height 40 / 52 / 64px.",
      resize: "Directions people can resize it in.",
      className: "Class for the outer wrapper (set the width here).",
      textareaClassName: "Class for the textarea element itself.",
      "value, onChange, rows…": "Native textarea attributes.",
    },
  },

  select: {
    description:
      "Select uses the native <select> element, so the list opens in the operating system's style. That works well on mobile and in simple forms. For options with icons, custom groups or the same look on every platform, use Dropdown.",
    examples: [
      { title: "Appearance", description: "outline (default), underline, filled-darker, filled-lighter." },
      { title: "Size", description: "small (24px), medium (32px), large (40px)." },
      { title: "Option groups & disabled", description: "optgroup groups options; a single option or the whole Select can be disabled." },
    ],
    dos: [
      "Use it for short to medium lists of plain-text values.",
      "Prefer Select in mobile forms: the OS picker is easy to use.",
      "Order options in a meaningful way (alphabetically, by frequency or logically).",
    ],
    donts: [
      "Don't use it when options need an icon, avatar or secondary text. Use Dropdown.",
      "Don't use it for very long lists that need search. Use Combobox.",
    ],
    props: {
      appearance: "Control style.",
      size: "Height 24 / 32 / 40px.",
      className: "Class for the outer wrapper (set the width here).",
      selectClassName: "Class for the select element itself.",
      "value, defaultValue, onChange, disabled…": "Native select attributes.",
    },
  },

  dropdown: {
    description:
      "Unlike Select, the listbox is a custom surface (shadow-16, rounded-medium), so it supports a checkmark, groups with headings, disabled options and custom content. Keyboard: arrow keys, Home/End, type a character to jump, Enter to select, Esc to close.",
    examples: [
      { title: "Groups & disabled options", description: "DropdownGroup adds a heading; groups are separated by a divider automatically." },
      { title: "Controlled", description: "value / onValueChange." },
      { title: "Options with icons", description: "media places an icon before the label." },
      { title: "Appearance, size & disabled", description: "Same appearance / size options as Input." },
    ],
    dos: [
      "Use an action placeholder (“Choose a department”) when there is no default value.",
      "Group options with DropdownGroup when the list mixes several kinds of items.",
      "Keep option labels short and clearly distinct.",
    ],
    donts: [
      "Don't use it when there are only 2–3 options that should always be visible. Use RadioGroup.",
      "Don't use it for very long lists without search. Use Combobox.",
      "Don't put actions (commands) in a Dropdown. Use Menu.",
    ],
    props: {
      placeholder: "Shown when nothing is selected.",
      "value / defaultValue": "Selected value (controlled / uncontrolled).",
      onValueChange: "Called when an option is selected.",
      appearance: "Trigger style.",
      size: "Height 24 / 32 / 40px.",
      "disabled, required, name": "Same as on a native form control.",
      "className / listboxClassName": "Class for the trigger / the listbox surface.",
      "DropdownOption.media": "Icon before the option label.",
      "DropdownGroup.label": "Group heading.",
    },
  },

  radiogroup: {
    description:
      "A 16px circle with a stroke-accessible border; when selected, the border turns brand and a 10px brand dot appears. Unselected labels use foreground-3 and get darker on hover and when selected. Tab into the group, then use the arrow keys to change the selection.",
    examples: [
      { title: "Horizontal layout", description: "layout=\"horizontal\" when there are only a few short options." },
      { title: "Horizontal, labels below", description: "layout=\"horizontal-stacked\", suited to rating scales." },
      { title: "Disabled", description: "Disable a single option or the whole group." },
      { title: "Controlled + Label", description: "Name the group with Label + aria-labelledby." },
    ],
    dos: [
      "Use it for 2–7 mutually exclusive options that people need to see all at once.",
      "Preselect the safest or most common option when it makes sense.",
      "Stack options vertically when labels are long; lay them out horizontally only when labels are very short.",
    ],
    donts: [
      "Don't use it for a single on/off choice. Use Checkbox or Switch.",
      "Don't use it when there are too many options. Use Dropdown or Combobox.",
    ],
    props: {
      layout: "Group layout.",
      "value / defaultValue": "Selected value.",
      onValueChange: "Called when the selection changes.",
      "disabled / required / name": "Apply to the whole group.",
      "Radio.value": "Value of the option.",
      "Radio.label": "Clickable label.",
      "Radio.disabled": "Disables this option only.",
    },
  },

  combobox: {
    description:
      "Filtering ignores diacritics (typing “da nang” finds “Đà Nẵng”). Keyboard: arrow keys to move, Enter to select, Esc to close. multiselect shows a checkbox for each option; freeform keeps typed text that isn't in the list as the value.",
    examples: [
      { title: "Multiple selection", description: "multiselect: the listbox stays open after each pick and the input lists the selected items." },
      { title: "Groups & disabled options", description: "Options with a group are listed under that group's heading." },
      { title: "Freeform (controlled)", description: "Type a value that isn't in the list, then press Enter or leave the input to keep it." },
      { title: "Appearance, size & disabled", description: "Same appearance / size options as Input." },
    ],
    dos: [
      "Use it for long lists (more than ~10 items) when people know what they are looking for.",
      "Write a placeholder that tells people they can type to search.",
      "Turn on freeform when valid values aren't limited to the list.",
    ],
    donts: [
      "Don't use it for a few short options. Use Dropdown or RadioGroup.",
      "Don't use multiselect when each selected value needs to stay clearly visible. Use TagPicker.",
    ],
    props: {
      options: "List of options.",
      "value / defaultValue": "string for single selection; string[] with multiselect.",
      onValueChange: "Called when an option is selected.",
      multiselect: "Allows multiple selection (options get a checkbox).",
      freeform: "Keeps typed text as the value.",
      noResultsText: "Shown when filtering matches no options.",
      appearance: "Control style.",
      size: "Height 24 / 32 / 40px.",
      "className / listboxClassName": "Class for the input / the listbox surface.",
    },
    defaults: { noResultsText: "“Không tìm thấy kết quả” (No results found)" },
  },

  tag: {
    description:
      "A static Tag only displays content. A dismissible Tag is a button: click it or press Delete or Backspace to remove it. InteractionTag splits the main action from a separate X button. TagGroup lays out tags, supports arrow-key navigation and moves focus to the neighboring tag when one is removed.",
    examples: [
      { title: "Appearance", description: "filled (default), outline, brand." },
      { title: "Size & shape", description: "medium (32px), small (24px), extra-small (20px); rounded or circular." },
      { title: "Avatar & secondaryText", description: "media places an Avatar flush with the edge; secondaryText adds a second line (size medium)." },
      { title: "Dismissible in a TagGroup", description: "Click a tag or press Delete/Backspace to remove it; focus moves to the next tag." },
      { title: "InteractionTag", description: "The main action and the X button are separate focus stops." },
    ],
    dos: [
      "Keep tag labels short (1–3 words); long labels are truncated with …",
      "Use TagGroup so tags wrap neatly and get keyboard navigation.",
      "Use the brand appearance sparingly, only for tags that need emphasis.",
    ],
    donts: [
      "Don't use Tag instead of Button for the main action on a page.",
      "Don't use Tag to report status (success, error). Use Badge.",
      "Don't mix appearances in one group without a reason.",
    ],
    props: {
      appearance: "Tag style.",
      size: "Height 20 / 24 / 32px.",
      shape: "Corner rounding.",
      "icon / media": "Icon or Avatar before the label.",
      secondaryText: "Second line below the label.",
      "dismissible / onDismiss": "Turns the tag into a remove button.",
      value: "Identifier; TagGroup.onDismiss receives this value.",
      "TagGroup.onDismiss": "Removes a tag from the group and manages focus.",
      "TagGroup.size / appearance / disabled": "Defaults for every tag in the group.",
    },
  },

  tagpicker: {
    description:
      "Type to filter the suggestions (diacritics are ignored), press Enter to add, Backspace in an empty input to remove the last tag, Left arrow to move between tags. Selected options are hidden from the list.",
    examples: [
      { title: "Avatar & secondary text", description: "media shows on both the option and the tag; size large uses small tags, which fit a 20px Avatar." },
      { title: "Freeform", description: "Type a new keyword and press Enter to create a tag." },
      { title: "Controlled", description: "value / onValueChange; tagAppearance and tagShape change the tag style." },
      { title: "Size", description: "medium (extra-small tags), large (small tags), extra-large (medium tags)." },
    ],
    dos: [
      "Use it when people pick several items and need to see each selected item clearly.",
      "Add an Avatar or secondary text when picking people, so people with the same name can be told apart.",
      "Turn on freeform for keywords, email addresses and other values that aren't in the list.",
    ],
    donts: [
      "Don't use it for single selection. Use Combobox or Dropdown.",
      "Don't let tags pile up until the input grows out of the layout. Consider limiting the count.",
    ],
    props: {
      options: "Suggestions.",
      "value / defaultValue": "Selected values.",
      onValueChange: "Called when a tag is added or removed.",
      size: "Minimum height 32 / 40 / 48px.",
      appearance: "Control style.",
      "tagAppearance / tagShape": "Style of the selected tags.",
      freeform: "Enter creates a tag from the typed text.",
      noResultsText: "Shown when no suggestions match.",
    },
  },

  spinbutton: {
    description:
      "Two stacked arrow buttons on the right (press and hold to repeat). Keyboard: ↑/↓ by step, PageUp/PageDown by stepPage, Home/End to min/max, Enter to commit a typed number. The value is always clamped to [min, max].",
    examples: [
      { title: "Decimal step", description: "step={0.1}: the number of decimal places is derived from step." },
      { title: "Display format", description: "formatValue adds a unit; non-numeric characters are ignored while typing." },
      { title: "Controlled", description: "value / onValueChange (null when the input is empty)." },
      { title: "Appearance, size & disabled", description: "outline, underline, filled-darker, filled-lighter; size small / medium." },
    ],
    dos: [
      "Use it for small numbers that change in small steps (quantity, number of guests, font size).",
      "Always set a sensible min/max to rule out meaningless values.",
      "Show the unit with formatValue rather than in the label, where that fits.",
    ],
    donts: [
      "Don't use it for large numbers or values that don't change in steps (phone numbers, postal codes). Use Input.",
      "Don't use it when the relative value matters more than the exact number. Use Slider.",
    ],
    props: {
      "value / defaultValue": "Numeric value (null = empty).",
      onValueChange: "Called when the value changes.",
      "min / max": "Limits; the matching button is disabled at the limit.",
      "step / stepPage": "Step for ↑↓ and for PageUp/PageDown.",
      precision: "Number of decimal places (derived from step by default).",
      displayValue: "Text shown instead of the number (controlled).",
      "formatValue / parseValue": "Custom number formatting and parsing.",
      appearance: "Control style.",
      size: "Height 24 / 32px.",
    },
  },

  searchbox: {
    description:
      "The X button appears only when the box has content; Esc also clears it. Works controlled (value + onValueChange) or uncontrolled (defaultValue). Accepts every Input prop (label, hint, appearance, size…).",
    examples: [
      {
        title: "Filter a list (controlled)",
        description:
          "Results sit in a list panel with a count, highlighted matches (diacritics are ignored: “xoai” finds “Xoài”) and an empty state. onValueChange also runs when X or Esc clears the box.",
      },
      { title: "Appearance", description: "outline (default), underline, filled-darker, filled-lighter." },
      { title: "Size & disabled", description: "small, medium, large; the icon is 16 / 20 / 24px." },
    ],
    dos: [
      "Place the SearchBox where it's easy to see, above the content it searches.",
      "Update results as people type when the data set is small; debounce API calls.",
      "Use a placeholder that describes the search scope (“Search documents”).",
    ],
    donts: [
      "Don't use SearchBox for regular data entry. Use Input.",
      "Don't clear the search text when people move to another page of results.",
    ],
    props: {
      "value / defaultValue": "Content (controlled / uncontrolled).",
      onValueChange: "Called on typing, clicking X or pressing Esc.",
      onChange: "Native event (also fires when the box is cleared).",
      dismissLabel: "aria-label of the X button.",
      "contentBefore / contentAfter": "Replaces the magnifier icon / adds content after the X button.",
      "appearance, size, label, hint, rootClassName…": "Inherited from Input.",
    },
    defaults: { dismissLabel: "“Xoá nội dung tìm kiếm” (Clear search text)" },
  },

  inputotp: {
    description:
      "Typing moves to the next box, Backspace goes back to the previous one, pasting (Ctrl+V) fills in the whole code, and onComplete runs once every box is filled. The boxes share Input's styling; the first one has autocomplete=\"one-time-code\" so the browser can fill in a code received by SMS.",
    examples: [
      { title: "onComplete", description: "Called when all 6 digits are entered." },
      { title: "Letters and digits", description: "pattern=\"alphanumeric\", length={4}." },
      { title: "In a Field, with an error", description: "Field links the label to the first box and passes aria-invalid to every box." },
      { title: "Size & disabled", description: "small (32px) and disabled. medium (40px) is the default; large (48px) is in the Letters and digits example." },
    ],
    dos: [
      "Say where the code was sent (“Code sent to 09xx xxx 678”).",
      "Verify automatically through onComplete once the code is complete, instead of making people press a button.",
      "Split long codes into groups (groups) so they are easier to read and check.",
    ],
    donts: [
      "Don't use InputOTP for passwords or long data. Use Input.",
      "Don't clear the whole code when one character is wrong; let people fix individual boxes.",
    ],
    props: {
      length: "Number of boxes.",
      "value / defaultValue": "Current code.",
      onValueChange: "Called whenever the code changes.",
      onComplete: "Called when length characters have been entered.",
      pattern: "Allowed characters.",
      "groups / separator": "Box groups and the element between them.",
      size: "Box size 32 / 40 / 48px.",
      "disabled, name, autoFocus": "name adds a hidden input that holds the code when the form is submitted.",
    },
  },

  rating: {
    description:
      "Rating is a radio group: Tab into it, use the arrow keys to change the score, hover to preview. Supports half stars (step 0.5), three colors (brand, marigold, neutral) and four sizes. RatingDisplay adds the value and the number of ratings.",
    examples: [
      { title: "Color", description: "neutral (default), brand, marigold." },
      { title: "Half stars (controlled)", description: "step={0.5}: each star has two click targets." },
      { title: "RatingDisplay", description: "Read-only display with the value and count; compact shows a single star." },
      { title: "Size", description: "small (12px), medium (16px), large (20px), extra-large (28px, default)." },
    ],
    dos: [
      "Always add an aria-label that names what is being rated.",
      "Show RatingDisplay with the count so people can judge how reliable the score is.",
      "Use one star color across the whole product.",
    ],
    donts: [
      "Don't use Rating for choices that aren't a scale. Use RadioGroup.",
      "Don't rely on star color alone. Show the numeric value as well.",
    ],
    props: {
      "value / defaultValue": "Current score (0 = not rated).",
      onValueChange: "Called when a score is picked.",
      max: "Number of stars.",
      step: "Allows half stars.",
      color: "Star color.",
      size: "Star size 12 / 16 / 20 / 28px.",
      itemLabel: "Screen reader label for each score.",
      "RatingDisplay.count / compact": "Number of ratings; show a single star.",
      "RatingDisplay.size": "Star and text size.",
    },
  },
};
