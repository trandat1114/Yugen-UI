---
"yugen-ui": minor
---

`DataGridColumnPicker` gets opt-in props for dense tables (#413): `compact` shows only the icon and the number of hidden columns (the label stays the button's name), `mode="auto"` opens a bottom sheet instead of the menu below `breakpoint` (default `"3xl"`, 768px) and `mode="sheet"` always uses a `Sheet`, with one 44px row per column and a reorder handle (drag, or Space then the arrow keys), and `resettable` adds "Reset columns", back to every column in definition order or to the view you pass (`{ hiddenColumns, columnOrder }`). Columns with `hideable: false` now show a lock and are described as "Always shown"; in the menu they take focus instead of being skipped. New messages: `dataGrid.resetColumns`, `dataGrid.requiredColumn` and `dataGrid.close`. Without the new props the picker renders as before.
