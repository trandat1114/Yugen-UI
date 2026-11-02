import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/sortable.tsx.
export const en: Record<string, ComponentDocEn> = {
  sortable: {
    description:
      "Sortable is a list people can reorder: SortableItem is each item, SortableHandle its handle. Drag the handle with a mouse, pen or finger; an item swaps places once it passes the middle of its neighbor, and the frame scrolls by itself near its edges. With a keyboard: focus the handle, press Space or Enter to pick the item up, the arrow keys to move it, Space or Enter to drop it and Escape to cancel; each step is announced through useAnnounce. Without dragging, click a handle to pick its item up, then click another item's handle to put it there. `onValueChange` runs during the drag so the UI keeps up; save the order in `onSortEnd`. SortableGroup joins several lists (Kanban columns): items can move to another list, with the arrow keys across the list direction. When an item already uses Space / Enter for something else (a button, menu item or Tag), set `handle` to make the whole item the handle and `shortcuts` to move it with Alt + arrow keys; DataGridColumnPicker and TagPicker (`reorderable`) work this way. Horizontal and grid lists follow RTL; with reduced motion on, items swap without sliding. No drag-and-drop library underneath.",
    examples: [
      { title: "Horizontal", description: "orientation=\"horizontal\": ← → move the item, flipped in RTL." },
      {
        title: "Grid",
        description: "orientation=\"grid\": items wrap; ← → go to the next item, ↑ ↓ to the row above or below.",
      },
      {
        title: "Kanban: SortableGroup",
        description:
          "Each column is a Sortable with a `listId`; SortableGroup holds the order of every column. With a keyboard, ← → move a card to the next column. The column receiving a card has `data-over`. `onSortEnd` runs once on drop: the place to save.",
      },
      {
        title: "Move up / down commands",
        description:
          "Add commands in a menu for people who don't notice the handle. arrayMove returns a new array; useAnnounce reads the new position as dragging does.",
      },
      {
        title: "The whole item as handle",
        description:
          "A button already uses Space / Enter to open: `handle` lets the whole button be dragged (a click without dragging is still a click; on touch screens, hold briefly then drag), `shortcuts` moves it with Alt + arrow keys. The buttons wrap in narrow frames, hence orientation=\"grid\".",
      },
    ],
    dos: [
      "Save the order in onSortEnd; onValueChange also runs during the drag.",
      "Give SortableItem a `label` when the item has a lot of text, so announcements stay short.",
      "Add Move up / down commands when people may not notice the handle.",
    ],
    donts: [
      "Don't put a SortableHandle inside an item with role option or menuitem: those can't contain buttons. Use `handle` and `shortcuts`.",
      "Don't make a list draggable when its order is automatic (by date, by name).",
      "Don't change an item's id between renders: `key` and `value` must stay stable.",
    ],
    props: {
      value: "Item ids in order. Leave it out inside a SortableGroup.",
      onValueChange: "Called each time the order changes, including during a drag; Escape calls it again with the order from pick-up.",
      onSortStart: "When an item is picked up.",
      onSortEnd: "Once per drop, including moves with the shortcut. `from` / `to` are `{ list, index }`; `canceled` on Escape. Save the order here.",
      orientation: "The list direction: which arrow keys move an item and how the drop position is found while dragging.",
      listId: "The list's key in the SortableGroup `value`.",
      label: "The list name in announcements when an item changes lists. Defaults to aria-label / aria-labelledby.",
      disabled: "Items in this list can't be dragged and other items can't be dropped in.",
      asChild: "Attach to the child element (List, ul, tbody) instead of rendering a div.",
      "SortableGroup.value": "The order of every list, by listId.",
      "SortableGroup.onValueChange": "Like Sortable's onValueChange, for the whole group.",
      "SortableGroup.onSortStart / onSortEnd": "Like Sortable's; `from.list` / `to.list` tell which list the item is in.",
      "SortableItem.value": "The item id, present in the list's value.",
      "SortableItem.label": "The item name in announcements and in the handle label. Defaults to the item's text.",
      "SortableItem.disabled": "Can't be picked up; the item still moves aside when others pass.",
      "SortableItem.handle": "The whole item is the handle for mouse / touch dragging.",
      "SortableItem.shortcuts": "Alt + arrow keys on the item move it right away, without picking it up.",
      "SortableItem.asChild": "Attach to the child element (ListItem, li, tr, Card) instead of rendering a div.",
      "SortableHandle.asChild": "Use the child element as the handle instead of the default icon button.",
      "arrayMove(array, from, to)": "A new array with the element at `from` moved to `to`.",
    },
  },
};
