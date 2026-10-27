import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/core-extra.tsx.
export const en: Record<string, ComponentDocEn> = {
  splitbutton: {
    description:
      "The primary action is not repeated in the menu. Use SplitButton when there is a clear default choice and a few less common variants.",
    examples: [
      { title: "Appearance", description: "primary, secondary (default), outline, subtle." },
      { title: "Size", description: "small, medium, large." },
    ],
    dos: ["The main button runs the most common choice.", "The menu holds 2–5 variants of the same action."],
    donts: ["Don't repeat the primary action in the menu.", "Don't use it when the options are equally important. Use a regular Menu."],
    props: {
      appearance: "Applies to both halves.",
      size: "Size.",
      menu: "MenuItem / MenuItemRadio / MenuDivider.",
      menuLabel: "aria-label for the button that opens the menu.",
      "icon, onClick, disabled…": "Passed to the main button.",
    },
    defaults: { menuLabel: "“Thêm tuỳ chọn” (More options)" },
  },

  menu: {
    description:
      "Supports icons, shortcuts (secondaryContent), groups with headings, dividers, radio items, checkbox items and submenus. Navigate with the arrow keys, Enter and Esc.",
    examples: [
      { title: "Radio & checkbox", description: "Mutually exclusive choices (radio) and on/off options (checkbox) inside the menu." },
      { title: "Submenu", description: "Groups secondary commands; nest at most 1 level." },
    ],
    dos: [
      "Labels are short verbs in sentence case.",
      "Group related commands with MenuDivider / MenuGroupHeader.",
      "Put destructive commands last, after a divider.",
    ],
    donts: [
      "Don't put more than ~10 items in one menu.",
      "Don't nest submenus more than 1 level deep.",
      "Don't put complex interactive content (forms) in a menu. Use Popover.",
    ],
    props: {
      "MenuItem.icon": "Icon, size 20.",
      "MenuItem.secondaryContent": "Shortcut or secondary information at the end of the item. MenuItemCheckbox and MenuItemRadio have it too.",
      "MenuPopover.align": "Alignment with the trigger.",
      "MenuPopover.material": "Yugen Labs — a glass menu, usually opened from a glass bar, that grows out of the button that opens it. MenuSubPopover has it too.",
      "MenuRadioGroup.value / onValueChange": "Selected radio item.",
      "MenuItemCheckbox.checked / defaultChecked": "On/off state.",
    },
  },

  slider: {
    description:
      "Use it when a rough sense of the value matters more than the exact number (volume, brightness). Keyboard: arrow keys, Home/End, PageUp/PageDown.",
    examples: [
      { title: "With icon & value", description: "Controlled with value / onValueChange." },
      { title: "Range & step", description: "Two thumbs select a range; step makes the thumbs move in increments." },
      { title: "Size & disabled", description: "small, medium (default)." },
      { title: "Glass (Yugen Labs)", description: "Press or drag: the thumb turns to glass and grows, so the track shows through it." },
    ],
    dos: ["Always provide a label or aria-label.", "Show the value (showValue) when the number means something to people."],
    donts: [
      "Don't use Slider when people need to enter an exact number. Use SpinButton.",
      "Don't use it for a wide range with small steps (hard to drag precisely).",
    ],
    props: {
      "value / defaultValue": "One item = one thumb, two items = a range.",
      onValueChange: "Called while dragging.",
      "min / max / step": "Range and step.",
      size: "Thumb 16 / 20px.",
      "label / showValue": "Label and value shown above the track.",
      rootClassName: "Class for the outer wrapper (set the width here).",
      material: "Yugen Labs — the thumb turns to glass and grows while pressed or dragged.",
    },
  },
};
