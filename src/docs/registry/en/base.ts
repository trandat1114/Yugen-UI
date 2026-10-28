import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/base.tsx.
export const en: Record<string, ComponentDocEn> = {
  field: {
    description:
      "Field generates an id, links the label to the control and sets aria-describedby / aria-invalid. Pass an element (Textarea, Select…) or, for controls that don't take an id directly, a render prop (props) => <Control {...props} />.",
    examples: [
      { title: "Validation", description: "validationState error / warning / success with a validationMessage that shows an icon." },
      { title: "Horizontal", description: "Label on the left, control on the right. Use it for wide settings forms." },
      { title: "Render-prop", description: "For controls that need to receive props their own way (RadioGroup, custom components…)." },
    ],
    dos: ["Put every input control in a Field (or give it its own label).", "Make validationMessage say how to fix the error."],
    donts: ["Don't use a placeholder in place of a label.", "Don't nest a Field inside a Field."],
    props: {
      label: "Label, linked to the control through htmlFor.",
      required: "Shows a red * and passes required down to the control.",
      hint: "Hint below the control.",
      validationState: "Validation state.",
      validationMessage: "Message with a status icon.",
      orientation: "Label layout.",
      size: "Label size.",
      children: "The control, or a render prop that receives id and aria-* props.",
    },
  },

  popover: {
    description:
      "Unlike Tooltip, Popover opens on click and can hold buttons and short forms. Its surface uses the shared popoverSurfaceClass (shadow-16, rounded-medium), like HoverCard, Combobox and DatePicker.",
    examples: [
      { title: "Appearance", description: "normal (default), brand for teaching and onboarding, inverted." },
      { title: "Short form", description: "Edit a single value without opening a Dialog." },
    ],
    dos: ["Keep the content short and focused on one task.", "Give people a clear way to close it (a button, Esc, a click outside)."],
    donts: ["Don't put long or multi-step forms in it. Use Dialog or Drawer.", "Don't use Popover for plain annotations. Use Tooltip."],
    props: {
      "Popover.open / onOpenChange": "Controls the open state.",
      "PopoverSurface.size": "Padding 8 / 16 / 20px.",
      "PopoverSurface.appearance": "Surface color.",
      "PopoverSurface.withArrow": "Shows the arrow.",
      "PopoverSurface.material": "Yugen Labs — a glass surface (the arrow matches it) that grows out of the button that opens it.",
      "PopoverSurface.side / align": "Position relative to the trigger.",
    },
  },
};
