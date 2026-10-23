import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/display.tsx.
export const en: Record<string, ComponentDocEn> = {
  avatargroup: {
    description:
      "Use it to show who takes part in a meeting, document or project. Past maxAvatars, the remaining members go into a “+N” button that opens a Popover with the full list.",
    examples: [
      { title: "Layout", description: "spread (default); stack, with a ring that separates the overlapping avatars; pie, which splits 2–3 avatars inside one circle." },
      { title: "Size", description: "Same size scale as Avatar: 20, 24, 32 (default), 40, 48, 64, 96." },
      {
        title: "Overflow & full list",
        description: "maxAvatars limits the number of slots (the overflow button included). Click “+N” or “…” to see the list in a Popover.",
      },
      { title: "Pie", description: "The most compact option for tight spaces; the whole circle is a button that opens the member list." },
    ],
    dos: [
      "Set an aria-label that describes the group (e.g. “Project members”).",
      "Use stack where space is tight and spread when each person needs to be clearly visible.",
      "Use the same size for every avatar in the group.",
    ],
    donts: [
      "Don't show more than 5–6 avatars at once. Use maxAvatars.",
      "Don't use the pie layout for large groups: the circle only fits 2–3 avatars.",
      "Don't use AvatarGroup for a single person. Use Avatar or Persona.",
    ],
    props: {
      layout: "How the avatars are arranged.",
      size: "Size of every avatar in the group.",
      maxAvatars: "Maximum number of slots (the overflow button included); doesn't apply to pie.",
      overflowIndicator: "The overflow button shows “+N” or a “…” icon.",
      overflowLabel:
        "Label read after the count on the button that opens the list (\"+2 …\"); with overflowIndicator=\"icon\" it is the button's whole name.",
      "AvatarGroupItem.name / src / color": "Details of each member.",
    },
  },

  persona: {
    description:
      "Use it in people lists, profile cards and search results. The Avatar size and font size follow size; textPosition and textAlignment adjust the layout.",
    examples: [
      { title: "Size", description: "extra-small → huge; Avatar 20 → 64px." },
      { title: "Text position", description: "after (default), before, below." },
      {
        title: "Text alignment & four lines",
        description: "textAlignment start (default) aligns the text with the top edge of the Avatar; center centers it vertically.",
      },
      { title: "Presence only", description: "presenceOnly replaces the Avatar with a presence dot, which suits dense lists." },
    ],
    dos: [
      "Keep secondary lines short: job title, status, local time.",
      "Pick size by density: small/medium for lists, huge for profile pages.",
      "When presence matters, always show it as text too.",
    ],
    donts: [
      "Don't use more than four lines of text.",
      "Don't use presenceOnly when people need the photo to recognize someone.",
      "Don't give names the brand color.",
    ],
    props: {
      name: "Name: the default primaryText and the Avatar's name.",
      "primaryText / secondaryText / tertiaryText / quaternaryText": "Four lines of text; the first is semibold, the others are caption in foreground-2.",
      size: "Avatar 20 / 24 / 32 / 40 / 48 / 64px.",
      presence: "Presence shown on the Avatar.",
      presenceOnly: "Shows only the presence dot.",
      avatar: "Options passed to the Avatar.",
      textPosition: "Position of the text block relative to the Avatar.",
      textAlignment: "Alignment of the text block.",
    },
  },

  text: {
    description:
      "size 100–1000 maps directly to the fontSizeBase/Hero tokens and their line heights; text at 20px or larger uses the Display font. Prefer the presets (Title3, Body1…) to stay consistent.",
    examples: [
      { title: "Preset", description: "Each preset is one step of the type ramp with its standard weight." },
      { title: "Size & weight", description: "size 100–1000; weight regular, medium, semibold, bold." },
      { title: "Formatting & font", description: "italic, underline, strikethrough; font base, monospace, numeric." },
      {
        title: "Truncate, alignment & as",
        description: "truncate needs wrap={false} and block; as changes the HTML element without changing the style.",
      },
    ],
    dos: [
      "Pick presets by role (Title3 for section headings, Body1 for UI text).",
      "Set `as` to the right element (h1–h6, p) so screen readers understand the structure.",
      "Use foreground-2/3 for secondary text instead of changing the font size.",
    ],
    donts: [
      "Don't use font sizes outside the type ramp (text-[15px]).",
      "Don't use Display / LargeTitle inside controls or tables.",
      "Don't make a whole paragraph bold. Keep bold for emphasis.",
    ],
    props: {
      size: "Type ramp step (10 → 68px).",
      weight: "Font weight.",
      font: "Font family; numeric uses tabular figures.",
      align: "Text alignment.",
      "italic / underline / strikethrough": "Text formatting.",
      "truncate / wrap / block": "Truncation, wrapping, block display.",
      as: "HTML element to render.",
    },
  },

  image: {
    description:
      "fit sets how the image fills its container (none, center, contain, cover). AspectRatio (from shadcn) uses CSS aspect-ratio to reserve the space before the image loads, so the layout doesn't jump.",
    examples: [
      { title: "Fit", description: "How the image fills a fixed 144 × 112 frame." },
      { title: "Shape", description: "square (default), rounded, circular." },
      { title: "Border & shadow", description: "bordered adds a stroke-1 border; shadow uses shadow-4, like Card." },
      { title: "AspectRatio", description: "16 / 9 and 1 / 1 frames; the content fills the frame." },
    ],
    dos: [
      "Always write alt text that describes the content; use alt=\"\" for purely decorative images.",
      "Use AspectRatio for images loaded over the network so the layout doesn't jump.",
      "Use fit=\"cover\" for thumbnails and \"contain\" when the whole image must be visible.",
    ],
    donts: [
      "Don't stretch an image with a width/height that doesn't match its ratio without setting fit.",
      "Don't use circular for images that aren't portraits or logos.",
      "Don't place important text over an image without a background that guarantees contrast.",
    ],
    props: {
      fit: "How the image fills its container (object-fit).",
      shape: "Corner radius 0 / 4px / round.",
      bordered: "1px stroke-1 border.",
      shadow: "shadow-4 drop shadow.",
      block: "The image takes the full width of its container.",
      "AspectRatio.ratio": "Width / height ratio, e.g. 16 / 9.",
    },
  },

  list: {
    description:
      "Each ListItem has media (Avatar / icon), a title, a description and an actions area. selectionMode turns on selection (multiselect shows a Checkbox); navigationMode=\"composite\" lets → / ← move into and out of the buttons inside an item.",
    examples: [
      { title: "Basic", description: "A static List with an icon, title and description." },
      { title: "Single selection", description: "selectionMode=\"single\": the selected item gets a brand tint and a checkmark." },
      {
        title: "Outline & actions",
        description: "variant=\"outline\" turns each item into a card; composite: → moves into the buttons, ← / Esc goes back to the item.",
      },
    ],
    dos: [
      "Give the List an aria-label, and each ListItem a stable value when selection is on.",
      "Use composite when items contain their own buttons or menus.",
      "Give each item one clear main action.",
    ],
    donts: [
      "Don't nest a List in a ListItem. Use Tree for hierarchical data.",
      "Don't mark selected items with color alone; the checkbox / checkmark already covers this.",
      "Don't use List for data with several columns. Use Table.",
    ],
    props: {
      selectionMode: "Selection mode; multiselect shows a Checkbox.",
      "selectedItems / defaultSelectedItems": "Values of the selected items (controlled / uncontrolled).",
      onSelectionChange: "Called when an item is selected or deselected.",
      navigationMode: "Arrow key navigation (roving tabindex).",
      variant: "outline: each item is a bordered card with rounded-xlarge corners.",
      "ListItem.media / title / description / actions": "Content areas of the item.",
      "ListItem.onAction": "Main action on click / Enter.",
      "ListItem.value / disabled": "Identifier and disabled state.",
    },
    defaults: { navigationMode: "items when selection is on" },
  },

  table: {
    description:
      "Made up of Table, TableHeader, TableHeaderCell (sorting with aria-sort), TableBody, TableRow, TableCell, TableCellLayout, TableSelectionCell and TableCellActions. The example at the top is a complete DataTable with filtering, sorting, row selection, an action menu and pagination.",
    examples: [
      { title: "Basic", description: "TableCellLayout combines an icon with the main content." },
      { title: "Size", description: "extra-small (24px) and small (34px); medium, the default, is 44px tall." },
      {
        title: "Row selection & actions",
        description: "A subtle TableSelectionCell shows its checkbox only on hover; TableCellActions shows buttons when the row is hovered or focused.",
      },
    ],
    dos: [
      "Align column headers with their data; use tabular-nums for numbers.",
      "Allow sorting on columns people often compare; the header shows the sort direction.",
      "Put row actions in a “…” Menu or in TableCellActions to keep the table compact.",
    ],
    donts: [
      "Don't use Table for page layout.",
      "Don't fit too many columns on narrow screens. Wrap the table in overflow-x-auto or hide secondary columns.",
      "Don't show selected rows with background color alone. Always include a checkbox.",
    ],
    props: {
      "Table.size": "Row height 24 / 34 / 44px.",
      "Table.sortable": "Turns every TableHeaderCell into a sort button.",
      "TableHeaderCell.sortDirection": "Shows the ArrowSortUp/Down icon and sets aria-sort.",
      "TableHeaderCell.sortable / onClick": "Turns sorting on / off for one column; onClick goes on the button in the header.",
      "TableRow.selected / appearance": "Background state of the row.",
      "TableCellLayout.media / description / appearance / truncate": "Cell layout: media + main content + description.",
      "TableSelectionCell.checked / onCheckedChange / subtle": "Row selection checkbox; inside TableHeader it becomes the select-all cell.",
    },
  },

  tree: {
    description:
      "A TreeItem is a branch or a leaf; put a Tree inside a branch to add a child level, indented automatically through --tree-level. Keyboard: ↑ ↓ move, → opens / moves into the children, ← closes / goes back to the parent, Enter selects.",
    examples: [
      { title: "Small size", description: "24px rows, caption1 text, 16px icons." },
      { title: "Transparent & actions", description: "appearance=\"transparent\" removes the hover background; actions appear only on hover or focus." },
      {
        title: "Selection",
        description: "selectionMode=\"single\": click or press Enter to select; the selected item gets a brand tint and an indicator bar.",
      },
    ],
    dos: [
      "Give the Tree an aria-label, and a stable value to each TreeItem you need to control.",
      "Use a leading icon (Folder / Document) to tell item types apart.",
      "Keep the depth to 3–4 levels at most so the tree is easy to scan.",
    ],
    donts: [
      "Don't use Tree for a flat list. Use List.",
      "Don't put important actions only in the hidden actions area; provide another way to reach them.",
      "Don't give folder icons the brand color.",
    ],
    props: {
      "Tree.size": "Row height 24 / 32px.",
      "Tree.appearance": "Background on hover.",
      "Tree.openItems / defaultOpenItems / onOpenChange": "Open branches.",
      "Tree.selectionMode / selectedValue / onSelectedChange": "Single selection (aria-selected).",
      "TreeItem.itemType": "A branch with a subtree, or a leaf item.",
      "TreeItem.value": "Identifier used by openItems / selectedValue.",
      "TreeItemLayout.iconBefore / iconAfter / aside / actions / expandIcon": "Areas of the row; actions appear only on hover / focus.",
    },
  },

  divider: {
    description:
      "Horizontal by default, drawn in stroke-2. Set vertical to separate items on the same row. appearance subtle / brand / strong changes the weight of the line.",
    examples: [
      { title: "Appearance", description: "default (stroke-2), subtle (stroke-3), brand, strong (stroke-1)." },
      { title: "Vertical", description: "vertical separates items on the same row and takes the height of the row." },
      { title: "Icon & inset", description: "The content can be an icon; inset indents both ends by 12px." },
    ],
    dos: ["Use it to separate different groups of content on the same surface.", "Keep text on a Divider short (“Or”, a group name)."],
    donts: [
      "Don't add a Divider where white space already separates the groups.",
      "Don't use the brand appearance everywhere. Keep it for an important boundary.",
    ],
    props: {
      vertical: "Vertical line.",
      alignContent: "Position of the text / icon on the line.",
      appearance: "Color of the line and the text.",
      inset: "Indents both ends by 12px.",
    },
  },

  scrollarea: {
    description:
      "Built on Radix Scroll Area, so native scrolling (wheel, touch, keyboard) still works. orientation picks a vertical scrollbar, a horizontal one or both.",
    examples: [
      { title: "Horizontal", description: "orientation=\"horizontal\" for strips of cards or images." },
      { title: "Both directions", description: "orientation=\"both\" for a grid larger than its frame." },
    ],
    dos: [
      "Give the ScrollArea a fixed height or width so the scroll region is clear.",
      "Use it for panels and long lists inside small surfaces (Popover, Card, Drawer).",
    ],
    donts: [
      "Don't wrap the whole page in a ScrollArea. Let the browser scroll the page.",
      "Don't nest scroll areas that scroll in the same direction.",
    ],
    props: {
      orientation: "Scrollbars shown.",
      type: "When the scrollbars appear (Radix).",
      viewportClassName: "Class for the inner viewport.",
      "ScrollBar.orientation": "For composing the Radix primitives yourself.",
    },
  },

  carousel: {
    description:
      "The track uses CSS scroll-snap, so swiping and scrolling work natively on every device. loop wraps around at both ends; slidesPerView (e.g. 1.15) and gap reveal part of the next slide. Autoplay shows its progress inside the active dot and pauses on hover, when a slide has focus or when the tab is hidden. It doesn't start on its own if the user prefers reduced motion. Each slide is labeled “Slide x / n”; the dots and thumbnails are a tablist controlled with the arrow keys (swapped in RTL) and Home / End.",
    examples: [
      {
        title: "Peek & loop",
        description: "slidesPerView={1.15} reveals 15% of the next slide, gap=\"M\" widens the spacing; loop wraps around at both ends.",
      },
      {
        title: "Autoplay with progress",
        description: "The active dot grows longer and fills up over autoplayInterval; hovering or focusing a slide, or hiding the tab, pauses it.",
      },
      {
        title: "Thumbnails",
        description: "CarouselThumbnails replaces the dots: a tablist of small images that scrolls to the active one. Give each image an aria-label.",
      },
    ],
    dos: [
      "Give the Carousel an aria-label. Each slide is labeled “Slide x / n” automatically; thumbnails should have their own aria-label.",
      "Keep 3–6 slides of the same kind; use a fractional slidesPerView (1.15, 2.5) to hint that more content follows.",
      "When autoplay is on, always show the pause button (CarouselNavContainer autoplay).",
    ],
    donts: [
      "Don't put important information only in a hidden slide.",
      "Don't turn autoplay on by default for content people need to read carefully.",
      "Don't use both dots and thumbnails in the same Carousel.",
    ],
    props: {
      loop: "Wraps around at both ends (old name: circular).",
      slidesPerView: "Number of slides visible at once; a fraction reveals the next slide (1.15, 2.5). Leave it empty for 100%.",
      gap: "Spacing between slides (spacing token).",
      "autoplay / defaultAutoplay / onAutoplayChange": "Autoplay (controlled / uncontrolled). defaultAutoplay is ignored under prefers-reduced-motion.",
      autoplayInterval: "Time per slide (ms); progress shows in the active dot / thumbnail.",
      onActiveIndexChange: "Called when the current slide changes.",
      "CarouselCard.className": "basis-full by default; basis-4/5 or basis-1/2 when slidesPerView isn't used.",
      "CarouselNavContainer.autoplay": "Shows the button that turns autoplay on / off.",
      "CarouselNavContainer.prevLabel / nextLabel": "aria-label of the navigation buttons.",
      "CarouselThumbnails / CarouselThumbnail": "Thumbnail tablist; each CarouselThumbnail matches the slide at the same position.",
    },
    defaults: { "CarouselNavContainer.prevLabel / nextLabel": "“Slide trước” (Previous slide) / “Slide tiếp theo” (Next slide)" },
  },

  resizable: {
    description:
      "Built on react-resizable-panels v4. A defaultSize / minSize string such as “30%” is a percentage; a number is pixels. The thin stroke-2 divider turns brand-colored on hover / drag. Keyboard, with the divider focused: the arrows resize by 5%, Home / End go to the limits, Enter collapses / expands, F6 moves to the next divider. Double-clicking a divider resets the panel to defaultSize. persistKey saves the layout to localStorage. In RTL, horizontal groups run right → left; dragging and the arrow keys follow the visible direction.",
    examples: [
      {
        title: "Saved layout",
        description:
          "persistKey writes the layout to localStorage after each drag (wrapped in try/catch); give each panel a fixed id. Drag, then reload the page.",
      },
      { title: "Vertical with grip", description: "orientation=\"vertical\" and ResizableHandle withHandle." },
      {
        title: "RTL reverses the order",
        description:
          "The first panel sits on the right; dragging and ArrowLeft / ArrowRight move the divider in the visible direction. mirrorInRtl={false} keeps the LTR layout of earlier versions.",
      },
    ],
    dos: [
      "Set minSize so a panel can't be dragged until its content disappears; make secondary panels (sidebar, terminal) collapsible.",
      "Use collapseButton for panels people often hide / show; Enter on the divider does the same.",
      "Give panels a fixed id when using persistKey; give a vertical group a container with a fixed height.",
    ],
    donts: [
      "Don't split a group into more than 3–4 panels.",
      "Don't leave out the ResizableHandle between two panels. In RTL, only the divider flips the drag direction.",
      "Don't use Resizable for layouts people don't need to adjust.",
    ],
    props: {
      "ResizablePanelGroup.orientation": "Direction the panels are split in.",
      "ResizablePanelGroup.persistKey": "Saves / restores the layout through localStorage (key react-resizable-panels:<persistKey>).",
      "ResizablePanelGroup.mirrorInRtl":
        "RTL: horizontal groups run right → left (dragging / arrow keys follow the visible direction); false keeps the LTR layout.",
      "ResizablePanelGroup.onLayoutChanged": "Called after a drag ends. Use it to save the layout your own way.",
      "ResizablePanel.defaultSize / minSize / maxSize": "A string such as “30%” is a percentage, a number is px. Double-clicking the divider resets to defaultSize.",
      "ResizablePanel.collapsible / collapsedSize": "Lets the panel collapse (drag past minSize, Enter, or the button).",
      "ResizableHandle.withHandle": "Shows a grip in the middle of the divider.",
      "ResizableHandle.collapseButton":
        "Button that collapses / expands the panel before (above / at the start of the line) or after the divider; that panel must be collapsible.",
      "ResizableHandle.collapseLabel / expandLabel": "Tooltip text (title) of the button.",
      "ResizableHandle.disabled / disableDoubleClick": "Locks the divider / turns off the double-click reset.",
    },
    defaults: { "ResizableHandle.collapseLabel / expandLabel": "“Thu gọn panel” (Collapse panel) / “Mở rộng panel” (Expand panel)" },
  },
};
