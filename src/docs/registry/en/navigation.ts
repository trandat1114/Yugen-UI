import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/navigation.tsx.
export const en: Record<string, ComponentDocEn> = {
  buttongroup: {
    description:
      "Inner corners and overlapping borders are merged automatically (-ms-px in a row, -mt-px in a column). Use ButtonGroupSeparator when the buttons have no border (primary, subtle). Works with Button, ToggleButton and SplitButton.",
    examples: [
      {
        title: "Vertical",
        description:
          'orientation="vertical", often used for the zoom in / zoom out pair on a map or canvas.',
      },
      {
        title: "Separator",
        description:
          'Primary buttons have no border, so add ButtonGroupSeparator appearance="on-brand" between them.',
      },
      {
        title: "With SplitButton",
        description: "A SplitButton inside the group gets merged corners too.",
      },
    ],
    dos: [
      "Only group closely related actions (undo/redo, zoom in/out).",
      "Use the same appearance and size for every button in the group.",
      "Add an aria-label to icon-only buttons.",
    ],
    donts: [
      "Don't group more than 5 buttons. Consider a Toolbar or Menu.",
      "Don't mix primary and secondary buttons in one group.",
    ],
    props: {
      orientation:
        "Button direction; corners and inner borders are merged automatically.",
      children: "Button, ToggleButton, SplitButton, ButtonGroupSeparator.",
      "ButtonGroupSeparator.appearance": "on-brand between primary buttons.",
      "ButtonGroupSeparator.orientation": "Opposite to the group's direction.",
    },
  },

  togglebutton: {
    description:
      "Same appearance and size options as Button. When on, secondary gets a darker background, primary switches to a brand shade, outline gets a thicker border, and subtle / transparent color the icon and text brand. The icon can change with the state (icon → checkedIcon). Screen readers get the state from aria-pressed.",
    examples: [
      {
        title: "Appearance",
        description:
          "The buttons below start in the on state. Click them to compare with the off state.",
      },
      {
        title: "Controlled & icon swap",
        description:
          "checked / onCheckedChange; the aria-label stays the same and aria-pressed conveys the state.",
      },
      {
        title: "Size & disabled",
        description: "small, medium (default), large.",
      },
    ],
    dos: [
      "Use it for options that take effect immediately (pin, mute, bold).",
      "Switch to the Filled icon when on, for a stronger visual cue.",
      "Keep the label fixed and let aria-pressed describe the state.",
    ],
    donts: [
      "Don't change the label with the state (“On” ↔ “Off”). It confuses screen reader users.",
      "Don't use it for settings that need saving or confirmation. Use Switch or Checkbox in a form.",
    ],
    props: {
      appearance: "Display style.",
      size: "Height 24 / 32 / 40px.",
      shape: "Corner rounding.",
      "checked / defaultChecked": "On state (controlled / uncontrolled).",
      onCheckedChange: "Called when the button is clicked.",
      "icon / checkedIcon": "Icon when off / when on.",
      iconPosition: "Icon position.",
      disabled: "Disables the button.",
    },
  },

  togglegroup: {
    description:
      'type="single" for mutually exclusive choices (text alignment), type="multiple" for independent options (bold, italic, underline). Secondary and outline items are joined with shared borders; subtle and transparent items stand apart. The arrow keys move within the group.',
    examples: [
      {
        title: "Single selection",
        description:
          "Controlled; empty values are ignored so one item always stays selected.",
      },
      {
        title: "Subtle, with labels",
        description:
          'appearance="subtle": items stand apart, and the selected one gets a background and a brand icon.',
      },
      { title: "Outline, small", description: "A compact time range picker." },
    ],
    dos: [
      "Set an aria-label on the group and on every icon-only item.",
      "Use single for mutually exclusive choices, multiple for independent options.",
    ],
    donts: [
      "Don't use it in place of Tabs to switch page content.",
      "Don't use more than about 6 items. For more, use Menu or Select.",
    ],
    props: {
      type: "Required. Single or multiple selection.",
      "value / defaultValue":
        "Selected value: a string with single, an array with multiple.",
      onValueChange: "Called when the selection changes.",
      appearance:
        "Secondary/outline join borders; subtle/transparent keep items apart.",
      size: "Item size.",
      orientation: "Group direction and arrow keys.",
      "ToggleGroupItem.value / icon": "Item value and icon.",
    },
  },

  toolbar: {
    description:
      "Made of ToolbarButton (subtle), ToolbarToggleButton, ToolbarDivider and ToolbarGroup. Roving focus: Tab enters the toolbar once, and the arrow keys / Home / End move between items (wrapping around). The small, medium and large sizes match Button.",
    examples: [
      {
        title: "Groups & overflow menu",
        description:
          "ToolbarGroup splits the bar into two ends; less used commands go into a Menu.",
      },
      {
        title: "Size",
        description: "small and large (medium is the default).",
      },
      {
        title: "Vertical",
        description: 'orientation="vertical" uses the up / down arrow keys.',
      },
    ],
    dos: [
      "Always set an aria-label on the Toolbar and on every icon-only button.",
      "Group related commands with ToolbarDivider / ToolbarGroup.",
      "Put less used commands in a “More” menu at the end of the bar.",
    ],
    donts: [
      "Don't put long text inputs or complex content in a toolbar.",
      "Don't use appearance primary on several buttons in one bar.",
    ],
    props: {
      size: "Applies to every ToolbarButton inside.",
      orientation: "Bar direction and arrow keys.",
      "aria-label": "Toolbar name for screen readers.",
      ToolbarButton:
        'A Button with appearance="subtle" by default; vertical puts the icon above the label.',
      ToolbarToggleButton:
        "A subtle ToggleButton with checked / onCheckedChange.",
      "ToolbarDivider / ToolbarGroup": "1px stroke-2 divider / item group.",
    },
  },

  link: {
    description:
      "The default appearance uses the brand link color and subtle uses foreground-2; both underline on hover. An inline link (inside a sentence) is always underlined and inherits the font size. Supports disabled, external pages (icon + target=_blank) and asChild to wrap a router link.",
    examples: [
      {
        title: "Appearance & disabled",
        description: "default (brand), subtle (neutral), disabled.",
      },
      {
        title: "Inline in a paragraph",
        description:
          "inline is always underlined so the link doesn't rely on color alone.",
      },
      {
        title: "External page & asChild",
        description:
          "external adds an icon and opens a new tab; asChild keeps the styles when wrapping another element.",
      },
    ],
    dos: [
      "The label describes the destination (“View the quarterly report”), not “Click here”.",
      "Use inline for links inside a sentence so they are always underlined.",
      "Tell people when a link opens a new tab (external).",
    ],
    donts: [
      "Don't use Link for actions that change data. Use Button.",
      "Don't color plain text brand to make it look like a link.",
    ],
    props: {
      appearance: "Brand or neutral color.",
      inline: "Inside a paragraph: always underlined, inherits the font size.",
      disabled: "Removes href, sets aria-disabled and blocks clicks.",
      external:
        'Adds an external-link icon, target="_blank" and rel="noopener noreferrer".',
      asChild: "Applies the styles to the child element (a router link).",
      "href, target, onClick…": "Passed to the <a> element.",
    },
  },

  kbd: {
    description:
      "A key chip in a monospace font on background-3, with a stroke-1 border and a thicker bottom edge like a real key. KbdGroup joins several keys into a combination (Ctrl + K) using nested <kbd> elements, as HTML intends.",
    examples: [
      { title: "In instructions" },
      {
        title: "Size & icon",
        description:
          "size small / medium; arrow keys use an icon plus visually hidden (sr-only) text for screen readers.",
      },
    ],
    dos: [
      "Write key names as printed on the keyboard (Ctrl, Shift, Enter).",
      "Show the shortcut next to its command (menu, tooltip, button).",
    ],
    donts: [
      "Don't use Kbd as decoration or as a Badge.",
      "Don't list combinations of more than 3 keys in one line of text.",
    ],
    props: {
      size: "Height 16 / 20px.",
      children:
        "Key name or icon (with sr-only text, since <kbd> doesn't take aria-label).",
      KbdGroup:
        "Wraps the Kbd elements and the “+” signs of a key combination.",
    },
  },

  breadcrumb: {
    description:
      'The last item is the current page: semibold text, aria-current="page", not clickable. Three sizes: small, medium, large. Pass items + maxDisplayedItems to collapse the middle items into a “…” menu automatically.',
    examples: [
      {
        title: "Size & icon",
        description: "small, large; the icon goes on the root item.",
      },
      {
        title: "Collapsing middle items",
        description:
          "items + maxDisplayedItems: items beyond the limit go into a “…” menu.",
      },
    ],
    dos: [
      "Place the Breadcrumb at the top of the page, above the title.",
      "Collapse the middle items when the path is long; always keep the root and the current item.",
      "Make each item's label match the title of the page it leads to.",
    ],
    donts: [
      "Don't use Breadcrumb in place of the main navigation.",
      "Don't make the current item clickable.",
    ],
    props: {
      size: "Height 24 / 32 / 40px.",
      items:
        "Data mode: dividers are inserted automatically and the last item is the current page.",
      maxDisplayedItems:
        "Maximum number of visible items (with items); the middle ones go into the “…” menu.",
      overflowIndex: "Number of leading items kept before the “…” button.",
      "BreadcrumbButton.current":
        'Current page: semibold, aria-current="page", not clickable.',
      "BreadcrumbButton.href / icon / asChild":
        "With href it renders an <a>, without it a <button>; asChild for router links.",
      "aria-label": "Label of the <nav> element.",
    },
    defaults: {
      "aria-label": "“Đường dẫn điều hướng” (breadcrumb navigation)",
    },
  },

  pagination: {
    description:
      'Always shows the first page, the last page and siblingCount pages around the current one; the rest collapse into “…”. The current page has a brand tint background and aria-current="page". Works controlled (page / onPageChange) or uncontrolled (defaultPage).',
    examples: [
      { title: "Controlled" },
      {
        title: "siblingCount & few pages",
        description:
          "siblingCount={2} shows more pages on each side; with few pages, every page is shown.",
      },
      {
        title: "Small, icons only",
        description:
          'size="small" and showLabels={false} for compact data tables.',
      },
    ],
    dos: [
      "Place Pagination right below the list or table it controls.",
      "Keep it in a fixed position so people can click repeatedly without moving the mouse.",
    ],
    donts: [
      "Don't use it for continuous content (feeds). Consider loading more items instead.",
      "Don't show Pagination when there is only one page.",
    ],
    props: {
      "page / defaultPage": "Current page, starting at 1.",
      pageCount: "Required. Total number of pages.",
      onPageChange: "Called when another page is selected.",
      siblingCount: "Pages shown on each side of the current page.",
      size: "Buttons 24 / 32px.",
      showLabels: "Shows the “Trước” / “Sau” (Previous / Next) labels.",
      disabled: "Disables the whole control.",
    },
  },

  nav: {
    description:
      "Made of NavItem (icon + label), collapsible NavCategory (NavCategoryItem + NavSubItemGroup + NavSubItem), NavSectionHeader and NavDivider. The selected item has a brand tint background, brand-foreground-2 text and a 4px indicator bar on its leading edge. A closed category that contains the selected item shows the indicator too.",
    examples: [
      {
        title: "Category, section header & divider",
        description:
          "Controlled with selectedValue / onNavItemSelect; defaultOpenCategories opens groups initially.",
      },
      {
        title: "Density small",
        description: 'density="small": 32px items for tight spaces.',
      },
    ],
    dos: [
      "Keep labels short: nouns that name the area (“Reports”, “Settings”).",
      "Use NavCategory for at most 1 level of children.",
      "Place Nav on the shell-nav background and use brand only for the selected item.",
    ],
    donts: [
      "Don't fill the whole navigation bar with brand color.",
      "Don't nest categories more than one level deep.",
      "Don't put actions (Save, Delete) in Nav. It is only for navigation.",
    ],
    props: {
      "selectedValue / defaultSelectedValue": "Selected item.",
      onNavItemSelect: "Called when a NavItem / NavSubItem is selected.",
      "openCategories / defaultOpenCategories": "Open NavCategory values.",
      onNavCategoryItemToggle: "Called when a category opens or closes.",
      multiple: "Allows several categories to be open at once.",
      density: "Item height 40 / 32px.",
      "NavItem.value / icon / href / asChild":
        "With href it renders an <a>; asChild for router links.",
      "NavCategory.value": "Group key (used in openCategories).",
    },
  },

  menubar: {
    description:
      "Triggers are subtle buttons (subtle-pressed background while open). The surface and items share Menu's styles: 32px items, icon, shortcut (secondaryContent), checkbox, radio, label, divider and submenu. While a menu is open, the left / right arrow keys move between menus.",
    examples: [
      {
        title: "Checkbox, radio & submenu",
        description:
          "On/off states and exclusive choices right in the menu; submenus nest 1 level deep.",
      },
    ],
    dos: [
      "Use it in editors and tools with many grouped commands.",
      "Show shortcuts with secondaryContent so people learn them over time.",
      "Keep the Menubar fixed at the top of the work area.",
    ],
    donts: [
      "Don't use Menubar for website navigation. Use Nav or Tabs.",
      "Don't nest submenus more than 1 level deep.",
    ],
    props: {
      "Menubar.value / onValueChange": "Open menu (controlled).",
      "MenubarContent.align / sideOffset":
        "Surface position relative to the trigger.",
      "MenubarItem.icon / secondaryContent":
        "Size 20 icon and a shortcut on the right.",
      "MenubarItem.onSelect / disabled":
        "Selection handler / disables the item.",
      "MenubarCheckboxItem.checked / onCheckedChange": "On/off (controlled).",
      "MenubarRadioGroup.value / onValueChange": "Exclusive choice.",
      "MenubarSub / MenubarSubTrigger / MenubarSubContent":
        "Submenu; MenubarSubTrigger takes an icon.",
    },
  },

  contextmenu: {
    description:
      "Opens on right-click, long press on touch screens, or the Menu key / Shift+F10. Shares Menu's surface and item styles: icon, shortcut, checkbox, radio, label, divider, submenu.",
    examples: [{ title: "Checkbox, radio & submenu" }],
    dos: [
      "Only include commands that relate directly to the clicked element.",
      "Make sure every command in the ContextMenu can also be reached another way (toolbar, menu).",
    ],
    donts: [
      "Don't hide important features only in a ContextMenu.",
      "Don't override the browser's context menu on regular text areas.",
    ],
    props: {
      "ContextMenu.onOpenChange": "Called when it opens or closes.",
      "ContextMenuTrigger.asChild":
        "Uses the child element as the right-click area.",
      "ContextMenuItem.icon / secondaryContent":
        "Size 20 icon and a shortcut on the right.",
      "ContextMenuCheckboxItem.checked / onCheckedChange":
        "On/off (controlled).",
      "ContextMenuRadioGroup.value / onValueChange": "Exclusive choice.",
      "ContextMenuSub / ContextMenuSubTrigger / ContextMenuSubContent":
        "Submenu; ContextMenuSubTrigger takes an icon.",
    },
  },

  command: {
    description:
      "Built on cmdk: typing filters and ranks items by match, the up / down arrows move the selection and Enter runs it. Made of CommandInput, CommandList, CommandEmpty, CommandGroup (group heading), CommandItem, CommandShortcut and CommandSeparator. CommandDialog puts the palette in a Dialog, usually opened with Ctrl/⌘ + K.",
    examples: [
      {
        title: "Groups, shortcuts & separator",
        description:
          "Type to filter; disabled items are skipped during navigation.",
      },
      {
        title: "CommandDialog (Ctrl/⌘ + K)",
        description:
          "Press Ctrl + K (⌘ + K on macOS) or click the button to open it; Esc closes it.",
      },
    ],
    dos: [
      "Group commands by context with clear headings.",
      "Show shortcuts with CommandShortcut so people remember them.",
      "Always include CommandEmpty so there is feedback when nothing matches.",
    ],
    donts: [
      "Don't use Command in place of a search for page content (long results, pagination).",
      "Don't add several different shortcuts that open command palettes in one app.",
    ],
    props: {
      "Command.label": "Hidden label for screen readers.",
      "Command.shouldFilter / filter":
        "Turns off automatic filtering, or provides your own scoring function.",
      "Command.value / onValueChange": "Highlighted item (controlled).",
      "Command.loop": "Arrow keys wrap between the first and last item.",
      "CommandInput.value / onValueChange": "Search string (controlled).",
      "CommandGroup.heading":
        "Group heading (caption1 semibold, foreground-3).",
      "CommandItem.value / keywords / onSelect / disabled / icon":
        "Filter value, extra keywords, selection handler, disabled state, icon.",
      "CommandDialog.open / onOpenChange / title":
        "Dialog state; title is hidden and read by screen readers.",
    },
    defaults: {
      "CommandDialog.open / onOpenChange / title":
        "— / — / “Bảng lệnh” (command palette)",
    },
  },
};
