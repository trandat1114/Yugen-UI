import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/extras.tsx.

/** Shared props of the presence motion components (PRESENCE_PROPS in extras.tsx). */
const PRESENCE_PROPS: Record<string, string> = {
  visible: "true runs the enter motion; false runs the exit motion.",
  appear: "Runs the enter motion on the first render (when visible = true).",
  unmountOnExit: "Removes the element from the DOM once the exit finishes. When false, the element is hidden (visibility: hidden).",
  duration: "Enter duration, mapped to the --durationFaster … --durationSlow tokens; easing --curveDecelerateMid.",
  exitDuration: "Exit duration; easing --curveAccelerateMid.",
  onMotionFinish: "Called when a motion phase ends.",
  children: "A single element. It receives the motion classes through Slot.",
};

export const en: Record<string, ComponentDocEn> = {
  compoundbutton: {
    description:
      "Shares appearance/size/shape with Button, but its height follows the content and the icon is 32px (small) or 40px (medium, large). The second line is one step smaller than the label (caption2 / caption1 / body1 by size), in foreground-2 (foreground-on-brand on primary and danger). Supports asChild, iconPosition and icon-only.",
    examples: [
      { title: "Appearance", description: "secondary (default), primary, outline, subtle, transparent." },
      { title: "Size", description: "small (32px icon), medium and large (40px icon)." },
      {
        title: "Icon position, icon-only & disabled",
        description: "iconPosition=\"after\"; leave out children for an icon-only button (aria-label required).",
      },
      { title: "Link (asChild)", description: "Keeps the CompoundButton look but renders an <a> element." },
    ],
    dos: [
      "Use it when the description helps people understand the consequence of the action.",
      "Keep the second line short: one line, no final period.",
      "Use 24/28 icons (scaled up to 32/40) so they balance the button height.",
    ],
    donts: [
      "Don't use it in toolbars or dense rows of buttons. Use Button.",
      "Don't place several primary CompoundButtons side by side.",
      "Don't put long paragraphs in secondaryContent.",
    ],
    props: {
      secondaryContent: "Second line of description (one step smaller than the label, foreground-2).",
      icon: "Large icon: 32px (small) / 40px (medium, large).",
      iconPosition: "Icon position.",
      appearance: "Same as Button.",
      size: "Padding, font size and icon size.",
      shape: "Corner rounding.",
      iconOnly: "Turns on when there is an icon and no children / secondaryContent.",
      asChild: "Renders into the child element (e.g. <a>).",
    },
  },

  menubutton: {
    description:
      "Takes every Button prop plus `menu` (the MenuPopover content). The chevron rotates 180° while the menu is open (data-[state=open]), and the button keeps its pressed color. Unlike SplitButton, the whole button only opens the menu; there is no default action.",
    examples: [
      { title: "Appearance", description: "primary, secondary (default), outline, subtle, transparent." },
      { title: "Size", description: "small, medium, large." },
      {
        title: "Icon-only, menuIcon & disabled",
        description: "Without a label, the button shrinks to the icon and chevron (it needs an aria-label). menuIcon replaces the default chevron.",
      },
      { title: "Controlled open state", description: "open / onOpenChange to keep it in sync with outside state." },
    ],
    dos: [
      "The label names the group of options (Sort, Export, View…).",
      "Use it when the options are equal and none of them is the default.",
      "Icon-only buttons always have an aria-label.",
    ],
    donts: ["Don't use it when there is a clear default action. Use SplitButton.", "Don't put complex forms in the menu. Use Popover."],
    props: {
      menu: "MenuPopover content: MenuItem, MenuItemRadio, MenuDivider…",
      menuIcon: "Trailing icon; rotates 180° when the menu opens.",
      "open / defaultOpen / onOpenChange": "Controls the menu state.",
      align: "Menu alignment relative to the button.",
      "appearance / size / shape / icon / disabled…": "Passed to the inner Button.",
    },
  },

  counterbadge: {
    description:
      "Hidden when count = 0 (unless showZero); above overflowCount it shows \"99+\". In dot mode the dot is always shown. Screen readers don't read the visible number; they read a label such as “5 thông báo” (5 notifications) instead, which you can change with the label prop.",
    examples: [
      { title: "Appearance & color", description: "filled (default) / ghost × brand, danger, important, informative." },
      { title: "Size & shape", description: "small, medium, large, extra-large; shape circular (default) or rounded." },
      { title: "Overflow, zero & dot", description: "overflowCount defaults to 99; showZero still shows 0; dot is only a dot." },
      {
        title: "On an icon button",
        description: "Position the badge absolutely in the top-end corner (logical: -inset-e-1) so it flips in RTL.",
      },
    ],
    dos: [
      "Use danger for things that need urgent attention and brand for ordinary counts.",
      "Set a suitable overflowCount so the badge doesn't grow too wide.",
      "Set label when the items counted aren't notifications, so screen readers say the right unit.",
    ],
    donts: ["Don't use CounterBadge for text labels. Use Badge.", "Don't show 0 unless the zero itself means something."],
    props: {
      count: "The count.",
      overflowCount: "Above this value it shows \"N+\".",
      showZero: "Still shown when count = 0.",
      dot: "Shows only a dot (always visible).",
      appearance: "Solid background or text only.",
      color: "important = inverted background (foreground-1).",
      shape: "Shape.",
      size: "Same as Badge.",
      label: "Screen reader label; defaults to “{count} thông báo” ({count} notifications).",
    },
  },

  presencebadge: {
    description:
      "Uses Fluent's presence icons (filled for available, away, busy and do-not-disturb; outlined for offline, blocked, out-of-office and with outOfOffice) in the status token colors. It has role=\"img\" and a Vietnamese aria-label. Add `ring` when it sits on top of an Avatar, to separate it from the image.",
    examples: [
      { title: "Status", description: "Eight statuses. Show the status as text next to it when there is room (don't rely on color alone)." },
      { title: "Out of office", description: "outOfOffice switches to the outlined icon and keeps the status color (away/offline turn purple)." },
      { title: "Size", description: "tiny 6px · extra-small 10 · small 12 · medium 16 (default) · large 20 · extra-large 28." },
      {
        title: "On an Avatar",
        description: "ring adds a 2px border in the background color. Position it with logical properties (-inset-e-px) so it is also correct in RTL.",
      },
    ],
    dos: [
      "Match the size to the Avatar (Avatar 32 → small, 48 → medium, 64+ → large).",
      "Turn on ring when it sits on top of an image or Avatar.",
      "Show the status as text as well in lists and user profiles.",
    ],
    donts: [
      "Don't change the status colors to match the brand.",
      "Don't use PresenceBadge for system status (a server being online/offline). Use Badge or MessageBar.",
    ],
    props: {
      status: "Presence status.",
      outOfOffice: "Out of office: outlined icon, and “không ở văn phòng” (out of office) is added to the label.",
      size: "6 / 10 / 12 / 16 / 20 / 28px.",
      ring: "ring-2 ring-background-1 border for use on an Avatar.",
      label: "Overrides the aria-label (default: “Có mặt” (Available), “Bận” (Busy)…).",
    },
  },

  swatchpicker: {
    description:
      "Made of ColorSwatch (any CSS color; this is data, so HEX is allowed), ImageSwatch (a pattern image) and EmptySwatch (an empty swatch, e.g. \"Add color\"). The selected swatch has a 2px brand-stroke ring with a background-1 gap inside. Keyboard: arrow keys move focus (flipped in RTL), Enter/Space selects, and Tab enters or leaves the group in one step.",
    examples: [
      { title: "Grid", description: "layout=\"grid\" + columnCount; ↑/↓ move by column, ←/→ in order." },
      { title: "Size & shape", description: "size extra-small 20 · small 24 · medium 28 · large 32px; shape square, rounded, circular." },
      {
        title: "Image, empty & disabled",
        description: "ImageSwatch for materials; disabled swatches are skipped by keyboard navigation; EmptySwatch works as an add button.",
      },
    ],
    dos: [
      "Give each swatch an aria-label with a readable color name (“Cherry blossom pink”), not just the HEX code.",
      "Show the name of the selected color nearby, so the choice doesn't rely on color alone.",
      "In the grid layout, group colors of the same family by row or column.",
    ],
    donts: [
      "Don't use SwatchPicker for choices that aren't colors or materials. Use RadioGroup.",
      "Don't show too many swatches (>40). Consider a free color input (input type=\"color\") or a HEX input.",
    ],
    props: {
      "selectedValue / defaultSelectedValue": "Selected value (controlled / uncontrolled).",
      onSelectionChange: "Called when a new swatch is selected (click, Enter, Space).",
      layout: "Row (wraps) or grid.",
      columnCount: "Number of columns when layout=\"grid\".",
      size: "20 / 24 / 28 / 32px.",
      shape: "Swatch shape.",
      spacing: "Gap 2 / 4px.",
      "ColorSwatch.color / value": "CSS color (data) and the value returned on selection.",
      "ImageSwatch.src": "Pattern image URL.",
      "*.disabled / aria-label / icon": "Disables the swatch, screen reader label, icon over the swatch.",
    },
  },

  teachingpopover: {
    description:
      "Built on Popover (shadow-16, with an arrow). It has a Header (icon, small title and close button), a Body (optional illustration, title and content), a Footer (primary and secondary buttons) and a Carousel for several steps (\"1/3\", navigation dots, “Quay lại” (Back) / “Tiếp” (Next) / “Hoàn tất” (Done)). appearance=\"brand\" fills this small surface with the brand color.",
    examples: [
      { title: "Brand & illustration", description: "appearance=\"brand\" on TeachingPopover; media appears above the content." },
      { title: "Vertical footer", description: "layout=\"vertical\" stacks the two buttons at full width, which suits long labels." },
      {
        title: "Multiple steps (Carousel)",
        description: "Each child of TeachingPopoverCarousel is one step. The first step has “Để sau” (Later), the last one “Hoàn tất” (Done).",
      },
    ],
    dos: [
      "Show only one TeachingPopover at a time, attached to the element it introduces.",
      "Keep the title short and the content to 1–2 sentences. Always offer a way to close it (the X button or the secondary button).",
      "Limit multi-step tours to 3–5 steps.",
    ],
    donts: [
      "Don't use it for error messages or confirmations. Use MessageBar / Dialog.",
      "Don't open it again after people have dismissed it.",
      "Don't put forms or long content in the surface.",
    ],
    props: {
      "TeachingPopover.appearance": "Applies to the surface, header and buttons.",
      "TeachingPopover.open / onOpenChange": "Controls visibility (Radix Popover).",
      "TeachingPopoverSurface.side / align / withArrow": "Surface position (320px wide).",
      "TeachingPopoverHeader.icon / dismissible": "Icon before the title; close button.",
      "TeachingPopoverBody.media": "Illustration above the content.",
      "TeachingPopoverFooter.primary / secondary": "Labels of the two buttons; the secondary button closes the popover.",
      "TeachingPopoverFooter.closeOnPrimary / layout": "Closes the popover when the primary button is clicked; button layout.",
      "TeachingPopoverCarousel.step / defaultStep / onStepChange": "Current step (starting at 0).",
      "TeachingPopoverCarousel.onFinish / *Label":
        "onFinish runs when “Hoàn tất” (Done) is clicked. nextLabel / previousLabel / finishLabel / dismissLabel replace “Tiếp” (Next) / “Quay lại” (Back) / “Hoàn tất” (Done) / “Để sau” (Later).",
    },
    defaults: { "TeachingPopoverHeader.icon / dismissible": "lightbulb / true" },
  },

  fade: {
    description:
      "All presence components (Fade, Scale, Slide, Collapse, Blur, Rotate) share the usePresence state machine (exited → entering → entered → exiting) and use CSS transitions. Durations come from the --duration* tokens; entering uses --curveDecelerateMid and exiting uses --curveAccelerateMid. Motion is skipped when people turn on prefers-reduced-motion. The child receives its classes through Slot, so it must be a single element.",
    examples: [
      { title: "Duration", description: "duration: faster (100ms), fast, normal (default, 200ms), gentle, slow (300ms)." },
      {
        title: "unmountOnExit & onMotionFinish",
        description: "Removes the element from the DOM after the exit finishes; the callback reports which phase just ended.",
      },
    ],
    dos: [
      "Use Fade for content that appears in place (small notices, placeholders, images that finish loading).",
      "Keep durations short (faster–normal) for small elements.",
    ],
    donts: [
      "Don't wrap several direct children. Fade takes exactly one element.",
      "Don't use Fade to signal an important state without text or an icon.",
    ],
    props: {
      ...PRESENCE_PROPS,
      "usePresence(visible, durationMs, options)": "The shared state machine. Returns { status, mounted, active } so you can build your own motion.",
    },
  },

  scale: {
    description:
      "Animates the scale transform and opacity; turn off the fade with animateOpacity={false}. Use appear to run the motion as soon as it mounts.",
    examples: [
      { title: "Enter/exit duration & animateOpacity", description: "Enter slower than exit (gentle / fast), or scale only without changing opacity." },
      { title: "appear", description: "Runs the enter motion on the first mount (change key to run it again)." },
    ],
    dos: [
      "Use it for small surfaces that pop up: custom popovers, quick-view cards, illustrations.",
      "Pair it with an exitDuration shorter than duration.",
    ],
    donts: ["Don't scale large surfaces (pages, drawers). Use Slide.", "Don't keep scaling body text to draw attention."],
    props: {
      ...PRESENCE_PROPS,
      animateOpacity: "Fades as well.",
    },
  },

  slide: {
    description:
      "start/end are logical directions: in RTL, start is the right edge (flipped through the rtl: variant). It moves 20px (spacingXL) while fading. Use it for notices, action bars and content that changes between steps.",
    examples: [
      {
        title: "Logical direction in RTL",
        description: "The same from=\"start\", but inside a dir=\"rtl\" region the element slides in from the right.",
      },
      { title: "Sliding notice", description: "from=\"bottom\" + unmountOnExit for a temporary notice." },
    ],
    dos: [
      "Slide in from the side the element is anchored to (notices from the bottom, panels from the edge).",
      "Use start/end instead of left/right so RTL works.",
    ],
    donts: [
      "Don't slide several elements in different directions at the same time.",
      "Don't use Slide for tooltips or menus. They have their own animation.",
    ],
    props: {
      ...PRESENCE_PROPS,
      from: "Edge it slides in from (start/end follow the text direction).",
      animateOpacity: "Fades as well.",
    },
  },

  collapse: {
    description:
      "Uses the CSS grid-template-rows 0fr → 1fr technique, so there is no height to measure in JavaScript. Collapse renders its own wrapper, so children can be any content. Unlike Collapsible (Layout), Collapse is only the motion: it has no trigger or state of its own.",
    examples: [
      {
        title: "Horizontal",
        description: "orientation=\"horizontal\" collapses and expands the width, e.g. for a collapsible navigation panel.",
      },
      {
        title: "Duration & no opacity",
        description: "Opens slowly (slow) and closes quickly (fast); animateOpacity={false} changes only the size.",
      },
    ],
    dos: ["Set aria-expanded on the control button.", "Use it for secondary content: details, advanced filters, notes."],
    donts: [
      "Don't put content people must read in a region that is collapsed by default.",
      "Don't nest several Collapses that run at the same time. The layout jumps.",
    ],
    props: {
      ...PRESENCE_PROPS,
      orientation: "Collapses the height or the width.",
      animateOpacity: "Fades as well.",
      children: "Any content (Collapse adds the wrapper).",
      "className / …div props": "Passed to the outer wrapper.",
    },
  },

  blurrotate: {
    description:
      "Same API as Fade (visible, appear, unmountOnExit, duration…). Blur uses the blur-md filter; Rotate uses the rotate property and turns the other way in RTL. Use them to swap an icon in place (play/pause) or to bring in an illustration once it has loaded.",
    examples: [
      {
        title: "Swapping icons with Rotate",
        description: "Two Rotates stacked in one grid cell: the old icon rotates out while the new one rotates in.",
      },
      { title: "Blur on appear", description: "appear + duration=\"slow\" so large text comes into focus gradually." },
    ],
    dos: ["Use them sparingly: one motion accent per view.", "Keep the duration at fast when swapping an icon inside a button."],
    donts: ["Don't blur text people need to read right away.", "Don't rotate large elements or elements with a lot of text."],
    props: {
      ...PRESENCE_PROPS,
      animateOpacity: "Fades as well (both Blur and Rotate).",
    },
  },

  stagger: {
    description:
      "When visible turns on, Stagger sets visible on each child in turn; when it turns off, the children hide in reverse order. Fade/Scale/Slide/Blur/Rotate/Collapse children are controlled directly; other elements are wrapped in a Fade automatically. Stagger renders a fragment, so place it inside a layout element (flex, grid).",
    examples: [
      {
        title: "With Slide",
        description: "The children are presence components, so they keep their own motion; itemDelay=\"fast\".",
      },
      { title: "appear with Scale", description: "A grid of tiles scales in one by one as soon as it mounts." },
    ],
    dos: ["Use it for short lists (≤ 10 items) to give rhythm when content appears.", "Keep itemDelay short (faster/fast)."],
    donts: [
      "Don't stagger long lists or data that updates constantly.",
      "Don't make people wait for the animation to finish before they can interact.",
    ],
    props: {
      visible: "Shows or hides the whole group.",
      itemDelay: "Delay between two items (--duration* tokens).",
      appear: "Runs the sequence on the first mount.",
      unmountOnExit: "Passed to each child (unless the child sets its own).",
      children: "Presence components or plain elements (wrapped in Fade).",
    },
  },

  visuallyhidden: {
    description:
      "Applies the sr-only class. Use asChild to merge it into an existing element and focusable to show it again when it receives focus (skip link). The visuallyHiddenClass constant can be used directly in className.",
    examples: [
      { title: "Skip link (focusable)", description: "Press Tab into the example frame: the hidden button appears when it receives focus." },
      {
        title: "Extra context for a link",
        description: "Sighted users see “Đọc thêm” (Read more); screen readers hear “Đọc thêm về bản phát hành 2.0” (Read more about release 2.0).",
      },
    ],
    dos: ["Use it for icon-only button labels, table captions and link context.", "Set focusable on skip links."],
    donts: [
      "Don't hide interactive content (except focusable skip links).",
      "Don't add it to an element that already has a visible label: screen readers would read it twice.",
    ],
    props: {
      asChild: "Merges the sr-only class into the child element instead of rendering a <span>.",
      focusable: "Shows the content again when the element (or a child) receives focus.",
      visuallyHiddenClass: "Class constant for direct use.",
    },
  },

  arialive: {
    description:
      "AriaLiveAnnouncer renders two hidden live regions (polite and assertive); add it once at the app root. useAnnounce() returns { announce }, called as announce(message, { politeness, batchId }). Announcements are queued, and batchId collapses a burst of announcements into the latest one. Without the provider, useAnnounce creates its own live regions in <body>.",
    examples: [
      { title: "Provider at the root", description: "Wrap the app in AriaLiveAnnouncer; any child component can then use useAnnounce." },
      {
        title: "batchId: merging repeated announcements",
        description: "Type quickly in the search box: only the latest result count is read.",
      },
    ],
    dos: [
      "Use polite for ordinary feedback (saved, result count); use assertive only for urgent errors.",
      "Keep announcements short and clear when heard on their own.",
      "Use batchId for events that repeat quickly (typing, dragging a slider).",
    ],
    donts: [
      "Don't announce every small change in the UI.",
      "Don't use announcements instead of visible content. Sighted users need the feedback too.",
    ],
    props: {
      "AriaLiveAnnouncer.children": "The app tree; rendered together with the two hidden live regions.",
      "useAnnounce()": "Returns the announce function (falls back to a live region in <body> when there is no provider).",
      "announce(message, options?)": "Adds an announcement to the queue.",
      "options.politeness": "Reading priority.",
      "options.batchId": "A queued announcement with the same batchId is replaced by the new one.",
    },
  },

  focusmanagement: {
    description:
      "useArrowNavigationGroup uses a roving tabindex: Tab enters or leaves the group in one step, the arrow keys move between items (axis horizontal / vertical / both / grid), Home/End jump to the first/last item, circular wraps around and memorizeCurrent remembers the position. ←/→ flip in RTL. useFocusableGroup turns the container into a single Tab stop: Enter moves inside, Esc moves back out. Combine the two hooks to navigate between cards. Spread the whole hook result onto the container.",
    examples: [
      {
        title: "Grid & memorizeCurrent",
        description: "↑/↓ follow the visual columns, ←/→ follow the order. Tabbing out and back in returns to the item you left.",
      },
      { title: "Vertical, circular", description: "axis=\"vertical\" + circular: ↓ on the last item goes back to the first." },
      {
        title: "useFocusableGroup inside an arrow group",
        description: "←/→ move between cards; Enter goes into a card, Tab cycles through its buttons (limited-trap-focus), Esc returns to the card.",
      },
    ],
    dos: [
      "Use arrow navigation for toolbars, lists and tile grids: any group of many similar items.",
      "Set a suitable role and aria-label on the container (toolbar, group, list).",
      "Add useFocusableGroup for cards that contain several buttons.",
    ],
    donts: [
      "Don't put text inputs inside an arrow group (the arrow keys move the caret).",
      "Don't set tabIndex on the children yourself. The hook manages the roving tabindex.",
    ],
    props: {
      axis: "Which arrow keys are used.",
      circular: "Wraps around at both ends.",
      memorizeCurrent: "Tabbing back into the group focuses the most recently focused item.",
      tabbable: "Keeps every item in the Tab order (turns off the roving tabindex).",
      role: "Returned in the props object as well.",
      "useFocusableGroup({ tabBehavior })": "limited: Enter to go in, Esc to go out · trap: Tab cycles inside · unlimited: Tab moves through the items.",
      "(returns)": "Spread it onto the container. If you need your own handlers, merge them with the returned ones.",
    },
  },
};
