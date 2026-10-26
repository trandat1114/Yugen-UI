---
"yugen-ui": minor
---

DataGrid: people can choose which columns are shown. The new `hiddenColumns` prop hides columns; `DataGridColumnPicker` is the "Columns" button that edits it, and it also works with Table. The menu stays open while columns are checked, a `hideable: false` column and the last visible column can't be hidden, and the sorted column keeps sorting the rows (with an arrow in the menu) while hidden. Hidden columns keep their resized width, pinned columns are re-measured, and keyboard focus stays on the same column instead of the same index. Columns can now set `label` instead of `renderHeaderCell`. `useDataGridColumnVisibility` and `getVisibleColumns` expose the logic.

Menu: long menus scroll inside the viewport instead of overflowing it, and `MenuItemCheckbox` / `MenuItemRadio` accept `secondaryContent` like `MenuItem`.
