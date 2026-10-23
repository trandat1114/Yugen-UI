import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/labs-adaptive.tsx.
export const en: Record<string, ComponentDocEn> = {
  sheet: {
    description:
      "Built on Radix Dialog, so focus trapping, Esc, scroll locking and the dialog role come built in. Below the breakpoint (768px by default) Sheet becomes a bottom sheet with 16px rounded top corners: drag it by the handle or the header, and it stops at the snapPoints (fractions of the screen height). Flick to jump between snap points, swipe down to close. Content only scrolls at the highest snap point; the footer stays at the bottom of the screen and leaves room for the safe area. On wide screens it is a start / end panel (flipped in RTL) with the same three widths as Drawer. With reduced motion, every slide and bounce becomes instant.",
    examples: [
      {
        title: "Bottom sheet & snap point",
        description:
          "mode=\"bottom\" forces the bottom sheet (you can try it with a mouse on desktop). snapPoints [0.45, 0.9]; content only scrolls at the 90% snap point.",
      },
      {
        title: "Non-modal",
        description: "modal={false}: no backdrop and no focus trap, so the page behind stays usable. One snap point at 30%; swipe down to close.",
      },
      {
        title: "Start panel, choice required",
        description:
          "side=\"start\" size=\"medium\" on desktop; dismissible={false} blocks Esc, backdrop clicks and swiping down, so people have to pick an action.",
      },
    ],
    dos: [
      "Always include a SheetTitle; add a SheetDescription when the title doesn't give enough context.",
      "Put the primary action in SheetFooter. On phones it stays within thumb reach, even at a low snap point.",
      "Make the lowest snap point just big enough for the common task (a quick look) and use a higher one for details; 2–3 snap points at most.",
    ],
    donts: [
      "Don't use Sheet for short confirmations or destructive actions. Use Dialog modalType=\"alert\".",
      "Don't put horizontal drag areas (sliders, maps) in the header. The header and the handle drag the sheet.",
      "Don't open a Sheet on top of a Sheet. Use dismissible={false} only when a choice is truly required.",
    ],
    props: {
      "open / defaultOpen / onOpenChange": "Open state (controlled or uncontrolled).",
      mode: "auto: panel when the viewport is ≥ breakpoint, bottom sheet when it is narrower.",
      breakpoint: "Minimum width (px) for the panel form (through useMediaQuery).",
      side: "Edge the panel slides in from; flipped in RTL.",
      size: "Panel width: 320 / 592 / 940px.",
      snapPoints: "Bottom sheet heights (fractions of the viewport height, 0–1).",
      "snapPoint / defaultSnapPoint / onSnapPointChange":
        "Current snap point; defaults to the lowest. When uncontrolled, it starts again from defaultSnapPoint each time the sheet opens.",
      modal: "false: no backdrop, no focus trap or scroll lock, and no closing on an outside click.",
      dismissible: "false: blocks closing with Esc, a backdrop click or swiping down.",
      "SheetContent.handle / handleLabel": "Bottom sheet handle; it is a button (Enter, ↑ / ↓) when there are 2 or more snap points.",
      "SheetHeader.action": "Element at the end of the header row, usually a close button.",
      "data-sheet-no-drag": "Add it to a child element so touches on it don't drag the sheet.",
    },
    defaults: { "SheetContent.handle / handleLabel": "true / “Đổi chiều cao” (Change height)" },
  },

  aspectratio: {
    description:
      "Uses the CSS aspect-ratio property, so the space is reserved from the start and the layout doesn't jump when an image or video finishes loading. The frame takes 100% of the container's width (override it with a className such as w-24), rounds its corners and clips overflowing content. The child fills the frame (Image fit=\"cover\", BloomArt, size-full).",
    examples: [
      { title: "4:3 illustration", description: "The classic photo ratio; suits article cards and product thumbnails." },
      {
        title: "1:1 avatar grid",
        description: "Squares that scale with the grid columns; rounded-circular for avatars, rounded-xlarge for product images.",
      },
      {
        title: "21:9 banner",
        description: "A wide hero strip. The text sits on a neutral card for enough contrast instead of directly on the gradient.",
      },
      { title: "9:16 story", description: "A full-screen portrait frame for phones; set a fixed width (w-24) and let the height follow." },
    ],
    dos: [
      "Wrap images and videos loaded from the network in AspectRatio to reserve their space and avoid layout shift (CLS).",
      "Use the standard ratio for the content: 16:9 video, 4:3 photo, 1:1 avatar, 21:9 banner, 9:16 story.",
      "Make the child fill the frame: Image fit=\"cover\" or the size-full class.",
    ],
    donts: [
      "Don't set both a fixed height and a ratio. The height wins and the frame gets distorted.",
      "Don't put important text directly on an image or gradient without a background that guarantees contrast.",
      "Don't use 9:16 for content people read on desktop. It is too narrow.",
    ],
    props: {
      ratio: "Width / height ratio, e.g. 16 / 9, 4 / 3, 21 / 9, 9 / 16.",
      className: "Radius, background, width (w-full by default); the frame is always relative and overflow-hidden.",
      style: "Merged after aspect-ratio, so it can override it.",
      "...props": "Passed to the outer div.",
    },
  },

  usemediaquery: {
    description:
      "Built on useSyncExternalStore and matchMedia, so it doesn't flicker between two values and unsubscribes on unmount. Without window it returns defaultValue. Sheet uses this hook to choose between the panel and the bottom sheet. Use it only when the behavior or the component changes; for pure layout changes, Tailwind's responsive variants (md:…) are still the better fit.",
    examples: [
      {
        title: "Switch components at a breakpoint",
        description: "Wide screens show the full labeled buttons; narrow screens fold them into one icon button. Resize the window to see the change.",
      },
      {
        title: "Respect reduced motion",
        description: "Behavior written in JS (scrolling, timers) has no motion-reduce: variant, so read the preference with the hook.",
      },
      {
        title: "Default value during SSR",
        description: "There is no matchMedia on the server: the hook returns defaultValue, then updates right after hydration.",
      },
    ],
    dos: [
      "Use it for differences in behavior or component (Sheet panel ↔ bottom sheet, a collapsed menu).",
      "Write the query in valid CSS syntax, parentheses included: \"(min-width: 768px)\".",
      "Set defaultValue to match the server-rendered layout to reduce flicker on hydration.",
    ],
    donts: [
      "Don't use it to switch pure layout classes. Tailwind's md: / lg: variants are cheaper and need no JS.",
      "Don't create a new query on every render (a string built from state that keeps changing).",
      "Don't rely on (pointer: coarse) to detect a \"phone\": tablets have keyboards and laptops have touch screens.",
    ],
    props: {
      query: "CSS media query, e.g. \"(min-width: 768px)\", \"(prefers-reduced-motion: reduce)\".",
      "options.defaultValue": "Value when there is no window / matchMedia (SSR, tests).",
      "(returns)": "true while the query matches; updates when that changes.",
    },
  },
};
