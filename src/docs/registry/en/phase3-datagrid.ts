import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/phase3-datagrid.tsx.
export const en: Record<string, ComponentDocEn> = {
  datagrid: {
    description:
      'The equivalent of Fluent 2\'s DataGrid. Define columns with createColumn<T>() (label, renderCell, compare, width…) and pass items + getRowId. The grid has role="grid" with correct aria-rowcount / aria-rowindex even when virtualized, and a single tab stop (roving tabindex): the arrow keys move cell by cell (left / right swap in RTL), plus Home / End, Ctrl + Home / End and PageUp / PageDown. Space selects a row; Shift + arrow or Shift + click selects a range. People choose which columns to show with DataGridColumnPicker (hiddenColumns). The header is sticky. loading shows a skeleton following Wait UX (useSpinDelay), and a grid with no rows shows Empty. The logic is reusable through useDataGridSort, useDataGridSelection, useDataGridColumnVisibility and the pure functions sortItems and getVisibleColumns.',
    examples: [
      {
        title: "Sorting (controlled)",
        description:
          "Only columns with compare can be sorted. Sorting is stable, aria-sort is set on the header, and the icon comes with text for screen readers.",
      },
      {
        title: "Multiple selection + toolbar",
        description:
          "selectedItems / onSelectionChange is a Set<string> of ids. The header checkbox has an indeterminate state.",
      },
      {
        title: "Choosing columns",
        description:
          "DataGridColumnPicker and DataGrid share hiddenColumns, and the choice is saved to localStorage. The menu stays open while you check columns; the hideable: false column (Customer) and the last visible column can't be unchecked. Hiding the sorted column keeps the row order, and the menu still shows the arrow on that column.",
      },
      {
        title: "Column resizing, pinned first column",
        description:
          "The handle receives focus when you Tab from a header cell: ← / → ±10px, Shift ±50px, double-click to fit the content. The sticky column stays in place when scrolling horizontally.",
      },
      {
        title: "Virtualizing 10,000 rows",
        description:
          "virtualized + height: only rows in the viewport (+ overscan) are rendered. Ctrl + End scrolls to the last row and focuses it.",
      },
      {
        title: "Loading · empty · error",
        description:
          "loading shows a skeleton after 300ms (kept for at least 500ms); no rows shows Empty; errors are handled by AsyncContent, with a Retry button.",
      },
      {
        title: "RTL",
        description:
          "Columns run right to left, ArrowLeft moves toward the end of the row, and dragging the handle left widens the column. No extra prop: the direction comes from DirectionProvider / YugenProvider.",
      },
    ],
    dos: [
      "Set aria-label (or aria-labelledby) on the grid, and make getRowId return a stable id, not the array index.",
      "Turn on virtualized for lists longer than a few hundred rows, with a fixed height and a uniform rowHeight.",
      'Use align="end" for number and currency columns and a fixed width for narrow columns; let the main column flex.',
    ],
    donts: [
      "Don't put several buttons in each cell, since each one is a tab stop. Group them in an actions Menu.",
      "Don't use DataGrid for layout or card lists. Use Table (static) or List.",
      "Don't show your own spinner when reloading. Use the loading prop so the loader doesn't flash for less than 300ms.",
    ],
    props: {
      items:
        "Data in its original order; T is inferred for columns and getRowId.",
      columns:
        "Created with createColumn<T>({ columnId, label?, renderHeaderCell?, renderCell, compare?, width?, minWidth?, maxWidth?, resizable?, align?, sticky?, hideable? }). label is the plain-text header and the name in DataGridColumnPicker; use renderHeaderCell when the header needs more than text.",
      hiddenColumns:
        "Ids of the columns not shown. A hideable: false column is always shown; hiding every column keeps the first one. A hidden column keeps its resized width and still sorts the rows if it is the sort column; focus moves to the next column when the focused one is hidden.",
      getRowId: "Stable row id (key, selection).",
      size: "Row height 34 / 44 / 56px.",
      sortable:
        "Click / Enter / Space on the header of a column with compare sorts by it (the same column again reverses the direction).",
      "sortState / defaultSortState": "Sort state (controlled / initial).",
      onSortChange: "Called when the sort column or direction changes.",
      selectionMode:
        "Adds a selection column. Without it, rows can't be selected.",
      "selectedItems / defaultSelectedItems":
        "Selected ids (controlled / initial).",
      onSelectionChange:
        "Called when the selection changes (click, Space, Shift + arrow, select all, Ctrl + A).",
      selectionAppearance: "Background of selected rows.",
      subtleSelection:
        "Checkboxes only show on hover / focus or when the row is selected.",
      resizableColumns:
        "Resize handle on the trailing edge of each header (mouse, touch, keyboard; double-click fits the content).",
      columnSizingOptions: "Per-column size overrides (as in Fluent).",
      onColumnResize:
        "Called when a column width changes. Nothing is saved by default.",
      virtualized:
        "Renders only the rows in the viewport; aria-rowcount / aria-rowindex still reflect the real total.",
      rowHeight: "Row height (px); defaults to the value for size.",
      height:
        "Height of the scroll container. virtualized without it → 400px (h-100).",
      overscan: "Extra rows rendered above / below the viewport.",
      focusMode: "Arrow keys move by cell or by row.",
      loading:
        "Skeleton after 300ms, kept for at least 500ms (useSpinDelay); aria-busy on the grid.",
      empty:
        "Content when there are no rows; defaults to an Empty reading “Không có dữ liệu” (No data).",
      "DataGridColumnPicker.columns":
        "The same column array passed to DataGrid; for Table, an array of { columnId, label }. The menu shows label.",
      "DataGridColumnPicker.hiddenColumns": "Ids of the hidden columns, the same value passed to DataGrid.",
      "DataGridColumnPicker.onHiddenColumnsChange":
        "Called when a column is checked / unchecked or Show all columns is chosen. Ids of columns that are not in columns right now are kept, so they can be saved.",
      "DataGridColumnPicker.sortState": "The sorted column shows an arrow in the menu, even while hidden.",
      "DataGridColumnPicker.align":
        "Menu alignment relative to the button. Inside a Toolbar, the button takes the Toolbar size and the subtle appearance.",
      "useDataGridSort / useDataGridSelection / useDataGridColumnVisibility / sortItems / getVisibleColumns":
        "Logic you can use on its own, for example for server-side sorting, to drive the selection from a toolbar, or to build your own column picker.",
    },
  },
};
