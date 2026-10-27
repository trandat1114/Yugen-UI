import * as React from "react";

/**
 * Logic thuần của DataGrid (sắp xếp, chọn hàng, ẩn / hiện cột) — tách khỏi giao diện để test dễ và để người dùng tự
 * điều khiển trạng thái từ bên ngoài (toolbar, URL, server…). Tương đương `useTableSort` / `useTableSelection` của Fluent.
 */

/* ================================================================ Kiểu dữ liệu */

export type DataGridSize = "small" | "medium" | "large";
export type DataGridSortDirection = "ascending" | "descending";
export type DataGridSelectionMode = "single" | "multiselect";
export type DataGridFocusMode = "cell" | "row";
export type DataGridColumnAlign = "start" | "end" | "center";

export interface DataGridSortState {
  /** `columnId` đang sắp xếp; `undefined` = giữ thứ tự gốc của `items`. */
  sortColumn: string | undefined;
  sortDirection: DataGridSortDirection;
}

/** Định nghĩa một cột — tạo bằng `createColumn<T>()` để TypeScript suy ra kiểu của `item`. */
export interface DataGridColumn<T> {
  /** Định danh duy nhất của cột (dùng cho sortState, columnSizingOptions, onColumnResize, hiddenColumns). */
  columnId: string;
  /** Tên cột dạng chữ: tiêu đề khi không có `renderHeaderCell` và tên trong DataGridColumnPicker. Mặc định `columnId`. */
  label?: string;
  /** Nội dung ô tiêu đề khi cần hơn chữ (icon, Tooltip…). Bỏ trống = `label`. */
  renderHeaderCell?: () => React.ReactNode;
  /** Nội dung ô của một hàng. Chuỗi / số tự cắt bằng "…" khi cột hẹp. */
  renderCell: (item: T) => React.ReactNode;
  /** Hàm so sánh tăng dần (như `Array.prototype.sort`). Có `compare` thì cột mới sắp xếp được. */
  compare?: (a: T, b: T) => number;
  /** Độ rộng cố định (px). Bỏ trống = cột co giãn chia phần còn lại. */
  width?: number;
  /** Độ rộng tối thiểu khi co giãn / kéo (px). Mặc định 80. */
  minWidth?: number;
  /** Độ rộng tối đa khi kéo (px). */
  maxWidth?: number;
  /** Tắt kéo đổi độ rộng riêng cho cột này (khi DataGrid có `resizableColumns`). */
  resizable?: boolean;
  /** Căn nội dung: end cho số / tiền tệ. */
  align?: DataGridColumnAlign;
  /** Ghim cột ở đầu dòng khi cuộn ngang — chỉ áp dụng cho các cột liền nhau ở đầu. */
  sticky?: "start";
  /** `false`: cột luôn hiện, `hiddenColumns` không ẩn được (cột chính, vd. tên). Mặc định true. */
  hideable?: boolean;
}

/** Ghi đè kích thước theo `columnId` (giống `columnSizingOptions` của Fluent). */
export interface DataGridColumnSizingOptions {
  /** Độ rộng ban đầu (px), thay cho `width` của cột. */
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

/** Tạo định nghĩa cột có kiểu — tương đương `createTableColumn` của Fluent. */
export function createColumn<T>(column: DataGridColumn<T>): DataGridColumn<T> {
  return column;
}

/* ================================================================ sortItems */

/**
 * Sắp xếp **ổn định** (hai hàng bằng nhau giữ thứ tự gốc, kể cả khi giảm dần). Trả về mảng mới, không đổi `items`.
 * Cột không có `compare` hoặc `sortColumn` trống → bản sao theo thứ tự gốc.
 */
export function sortItems<T>(
  items: readonly T[],
  columns: readonly DataGridColumn<T>[],
  sortState: DataGridSortState | undefined,
): T[] {
  const sortColumn = sortState?.sortColumn;
  const compare = sortColumn === undefined ? undefined : columns.find((c) => c.columnId === sortColumn)?.compare;
  if (!compare) return items.slice();
  const sign = sortState?.sortDirection === "descending" ? -1 : 1;
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => sign * compare(a.item, b.item) || a.index - b.index)
    .map((entry) => entry.item);
}

/* ================================================================ useControllableState (nội bộ) */

function useControllableState<V>(value: V | undefined, defaultValue: V | (() => V)): [V, (next: V) => void] {
  const [inner, setInner] = React.useState<V>(defaultValue);
  const controlled = value !== undefined;
  const set = React.useCallback(
    (next: V) => {
      if (!controlled) setInner(() => next);
    },
    [controlled],
  );
  return [controlled ? value : inner, set];
}

/* ================================================================ useDataGridSort */

export interface UseDataGridSortOptions<T> {
  columns: readonly DataGridColumn<T>[];
  /** Điều khiển từ ngoài. */
  sortState?: DataGridSortState;
  defaultSortState?: DataGridSortState;
  onSortChange?: (event: React.SyntheticEvent | undefined, state: DataGridSortState) => void;
}

export interface UseDataGridSortResult<T> {
  sortState: DataGridSortState;
  /** Hướng đang sắp xếp của cột; `undefined` = cột không được sắp xếp. */
  getSortDirection: (columnId: string) => DataGridSortDirection | undefined;
  /** Cột khác → tăng dần; cùng cột → đảo chiều. */
  toggleColumnSort: (event: React.SyntheticEvent | undefined, columnId: string) => void;
  setColumnSort: (event: React.SyntheticEvent | undefined, columnId: string, direction: DataGridSortDirection) => void;
  /** Sắp xếp một mảng theo trạng thái hiện tại (ổn định). */
  sort: (items: readonly T[]) => T[];
}

const NO_SORT: DataGridSortState = { sortColumn: undefined, sortDirection: "ascending" };

export function useDataGridSort<T>({
  columns,
  sortState,
  defaultSortState,
  onSortChange,
}: UseDataGridSortOptions<T>): UseDataGridSortResult<T> {
  const [state, setState] = useControllableState(sortState, defaultSortState ?? NO_SORT);

  const setColumnSort = React.useCallback(
    (event: React.SyntheticEvent | undefined, columnId: string, direction: DataGridSortDirection) => {
      const next: DataGridSortState = { sortColumn: columnId, sortDirection: direction };
      setState(next);
      onSortChange?.(event, next);
    },
    [setState, onSortChange],
  );

  const toggleColumnSort = React.useCallback(
    (event: React.SyntheticEvent | undefined, columnId: string) =>
      setColumnSort(
        event,
        columnId,
        state.sortColumn === columnId && state.sortDirection === "ascending" ? "descending" : "ascending",
      ),
    [setColumnSort, state],
  );

  const getSortDirection = React.useCallback(
    (columnId: string) => (state.sortColumn === columnId ? state.sortDirection : undefined),
    [state],
  );

  const sort = React.useCallback((items: readonly T[]) => sortItems(items, columns, state), [columns, state]);

  return { sortState: state, getSortDirection, toggleColumnSort, setColumnSort, sort };
}

/* ================================================================ useDataGridSelection */

export interface DataGridSelectionData {
  selectedItems: Set<string>;
}

export interface UseDataGridSelectionOptions {
  /** Không truyền = không chọn được hàng. */
  selectionMode?: DataGridSelectionMode;
  /** Id các hàng theo đúng thứ tự đang hiển thị (sau sắp xếp) — dùng cho chọn theo khoảng và "chọn tất cả". */
  rowIds: readonly string[];
  /** Điều khiển từ ngoài. */
  selectedItems?: ReadonlySet<string>;
  defaultSelectedItems?: Iterable<string>;
  onSelectionChange?: (event: React.SyntheticEvent | undefined, data: DataGridSelectionData) => void;
}

export interface UseDataGridSelectionResult {
  selectedItems: ReadonlySet<string>;
  isSelected: (rowId: string) => boolean;
  /** Mọi hàng đang hiển thị đều được chọn (và có ít nhất một hàng). */
  allSelected: boolean;
  /** Có hàng được chọn nhưng chưa phải tất cả — checkbox tiêu đề ở trạng thái indeterminate. */
  someSelected: boolean;
  /** single: chọn / bỏ chọn hàng đó · multiselect: bật / tắt hàng đó. Đặt mốc (anchor) cho chọn theo khoảng. */
  toggleItem: (event: React.SyntheticEvent | undefined, rowId: string) => void;
  /** single: chỉ chọn hàng đó · multiselect: thêm hàng đó. */
  selectItem: (event: React.SyntheticEvent | undefined, rowId: string) => void;
  /**
   * multiselect (Shift + click / Shift + mũi tên): chọn khoảng từ mốc tới `rowId`, cộng với lựa chọn trước khi bắt
   * đầu khoảng. Chưa có mốc → dùng `fallbackAnchor` (hàng đang focus). single → như selectItem.
   */
  extendSelection: (event: React.SyntheticEvent | undefined, rowId: string, fallbackAnchor?: string) => void;
  /** Checkbox tiêu đề: đã chọn hết → bỏ chọn các hàng đang hiển thị; chưa → chọn hết. */
  toggleAllItems: (event: React.SyntheticEvent | undefined) => void;
  selectAllItems: (event: React.SyntheticEvent | undefined) => void;
  clearSelection: (event: React.SyntheticEvent | undefined) => void;
}

export function useDataGridSelection({
  selectionMode,
  rowIds,
  selectedItems,
  defaultSelectedItems,
  onSelectionChange,
}: UseDataGridSelectionOptions): UseDataGridSelectionResult {
  const [selected, setSelected] = useControllableState<ReadonlySet<string>>(
    selectedItems,
    () => new Set(defaultSelectedItems ?? []),
  );
  // Mốc và lựa chọn nền của khoảng Shift đang kéo dài.
  const anchor = React.useRef<string | null>(null);
  const base = React.useRef<ReadonlySet<string>>(new Set());

  const commit = React.useCallback(
    (event: React.SyntheticEvent | undefined, next: Set<string>) => {
      setSelected(next);
      onSelectionChange?.(event, { selectedItems: next });
    },
    [setSelected, onSelectionChange],
  );

  const toggleItem = React.useCallback(
    (event: React.SyntheticEvent | undefined, rowId: string) => {
      if (!selectionMode) return;
      let next: Set<string>;
      if (selectionMode === "single") next = selected.has(rowId) ? new Set() : new Set([rowId]);
      else {
        next = new Set(selected);
        if (next.has(rowId)) next.delete(rowId);
        else next.add(rowId);
      }
      anchor.current = rowId;
      base.current = next;
      commit(event, next);
    },
    [selectionMode, selected, commit],
  );

  const selectItem = React.useCallback(
    (event: React.SyntheticEvent | undefined, rowId: string) => {
      if (!selectionMode) return;
      const next = selectionMode === "single" ? new Set([rowId]) : new Set(selected).add(rowId);
      anchor.current = rowId;
      base.current = next;
      commit(event, next);
    },
    [selectionMode, selected, commit],
  );

  const extendSelection = React.useCallback(
    (event: React.SyntheticEvent | undefined, rowId: string, fallbackAnchor?: string) => {
      if (!selectionMode) return;
      if (selectionMode === "single") {
        selectItem(event, rowId);
        return;
      }
      const to = rowIds.indexOf(rowId);
      if (to < 0) return;
      if (anchor.current === null || !rowIds.includes(anchor.current)) {
        anchor.current = fallbackAnchor !== undefined && rowIds.includes(fallbackAnchor) ? fallbackAnchor : rowId;
        base.current = new Set(selected);
      }
      const from = rowIds.indexOf(anchor.current);
      const next = new Set(base.current);
      for (let i = Math.min(from, to); i <= Math.max(from, to); i++) next.add(rowIds[i]);
      commit(event, next);
    },
    [selectionMode, rowIds, selected, selectItem, commit],
  );

  const { allSelected, someSelected } = React.useMemo(() => {
    const all = rowIds.length > 0 && rowIds.every((id) => selected.has(id));
    return { allSelected: all, someSelected: !all && rowIds.some((id) => selected.has(id)) };
  }, [rowIds, selected]);

  const selectAllItems = React.useCallback(
    (event: React.SyntheticEvent | undefined) => {
      if (selectionMode !== "multiselect" || rowIds.length === 0) return;
      anchor.current = null;
      commit(event, new Set([...selected, ...rowIds]));
    },
    [selectionMode, selected, rowIds, commit],
  );

  const clearSelection = React.useCallback(
    (event: React.SyntheticEvent | undefined) => {
      if (!selectionMode) return;
      anchor.current = null;
      commit(event, new Set());
    },
    [selectionMode, commit],
  );

  const toggleAllItems = React.useCallback(
    (event: React.SyntheticEvent | undefined) => {
      if (selectionMode !== "multiselect" || rowIds.length === 0) return;
      if (!allSelected) {
        selectAllItems(event);
        return;
      }
      anchor.current = null;
      const visible = new Set(rowIds);
      commit(event, new Set([...selected].filter((id) => !visible.has(id))));
    },
    [selectionMode, allSelected, selectAllItems, rowIds, selected, commit],
  );

  const isSelected = React.useCallback((rowId: string) => selected.has(rowId), [selected]);

  return {
    selectedItems: selected,
    isSelected,
    allSelected,
    someSelected,
    toggleItem,
    selectItem,
    extendSelection,
    toggleAllItems,
    selectAllItems,
    clearSelection,
  };
}

/* ================================================================ Ẩn / hiện cột */

/** Phần của cột mà việc ẩn / hiện cần. `DataGridColumn<T>` thoả mãn; với Table, truyền mảng `{ columnId, label }`. */
export type DataGridColumnVisibilityItem = Pick<DataGridColumn<unknown>, "columnId" | "label" | "hideable">;

export interface DataGridColumnVisibilityData {
  hiddenColumns: Set<string>;
}

/**
 * Các cột được hiện, theo thứ tự `columns`. Cột `hideable: false` luôn hiện, id không có trong `columns` bị bỏ qua, và
 * lưới không bao giờ trống: ẩn hết thì giữ cột đầu. Không có gì bị ẩn → trả về chính `columns` (giữ tham chiếu).
 */
export function getVisibleColumns<C extends DataGridColumnVisibilityItem>(
  columns: readonly C[],
  hiddenColumns: ReadonlySet<string> | undefined,
): readonly C[] {
  if (!hiddenColumns || hiddenColumns.size === 0) return columns;
  const visible = columns.filter((c) => c.hideable === false || !hiddenColumns.has(c.columnId));
  if (visible.length === columns.length) return columns;
  return visible.length > 0 ? visible : columns.slice(0, 1);
}

export interface UseDataGridColumnVisibilityOptions<C extends DataGridColumnVisibilityItem> {
  columns: readonly C[];
  /** Id các cột đang ẩn (điều khiển từ ngoài). */
  hiddenColumns?: ReadonlySet<string>;
  defaultHiddenColumns?: Iterable<string>;
  onHiddenColumnsChange?: (event: React.SyntheticEvent | undefined, data: DataGridColumnVisibilityData) => void;
}

export interface UseDataGridColumnVisibilityResult<C extends DataGridColumnVisibilityItem> {
  /** Tập id đang ẩn, nguyên như đã nhận — kể cả id của cột tạm không có trong `columns` — để lưu lại không mất gì. */
  hiddenColumns: ReadonlySet<string>;
  /** Cột đang hiện, theo thứ tự `columns` (getVisibleColumns). */
  visibleColumns: readonly C[];
  isColumnVisible: (columnId: string) => boolean;
  /** false với cột `hideable: false` và với cột đang hiện cuối cùng. */
  canToggleColumn: (columnId: string) => boolean;
  setColumnVisible: (event: React.SyntheticEvent | undefined, columnId: string, visible: boolean) => void;
  toggleColumn: (event: React.SyntheticEvent | undefined, columnId: string) => void;
  showAllColumns: (event: React.SyntheticEvent | undefined) => void;
}

export function useDataGridColumnVisibility<C extends DataGridColumnVisibilityItem>({
  columns,
  hiddenColumns,
  defaultHiddenColumns,
  onHiddenColumnsChange,
}: UseDataGridColumnVisibilityOptions<C>): UseDataGridColumnVisibilityResult<C> {
  const [hidden, setHidden] = useControllableState<ReadonlySet<string>>(
    hiddenColumns,
    () => new Set(defaultHiddenColumns ?? []),
  );
  const visibleColumns = React.useMemo(() => getVisibleColumns(columns, hidden), [columns, hidden]);
  const visibleIds = React.useMemo(() => new Set(visibleColumns.map((c) => c.columnId)), [visibleColumns]);

  const isColumnVisible = React.useCallback((columnId: string) => visibleIds.has(columnId), [visibleIds]);

  const canToggleColumn = React.useCallback(
    (columnId: string) => {
      const column = columns.find((c) => c.columnId === columnId);
      if (!column || column.hideable === false) return false;
      return !visibleIds.has(columnId) || visibleIds.size > 1;
    },
    [columns, visibleIds],
  );

  const setColumnVisible = React.useCallback(
    (event: React.SyntheticEvent | undefined, columnId: string, visible: boolean) => {
      if (visible === visibleIds.has(columnId) || !canToggleColumn(columnId)) return;
      // Cột đang hiện thì giữ hiện — kể cả cột chỉ hiện nhờ quy tắc "ẩn hết thì giữ cột đầu".
      const next = new Set(hidden);
      visibleIds.forEach((id) => next.delete(id));
      if (visible) next.delete(columnId);
      else next.add(columnId);
      setHidden(next);
      onHiddenColumnsChange?.(event, { hiddenColumns: next });
    },
    [hidden, visibleIds, canToggleColumn, setHidden, onHiddenColumnsChange],
  );

  const toggleColumn = React.useCallback(
    (event: React.SyntheticEvent | undefined, columnId: string) =>
      setColumnVisible(event, columnId, !visibleIds.has(columnId)),
    [setColumnVisible, visibleIds],
  );

  const showAllColumns = React.useCallback(
    (event: React.SyntheticEvent | undefined) => {
      if (hidden.size === 0) return;
      const next = new Set<string>();
      setHidden(next);
      onHiddenColumnsChange?.(event, { hiddenColumns: next });
    },
    [hidden, setHidden, onHiddenColumnsChange],
  );

  return {
    hiddenColumns: hidden,
    visibleColumns,
    isColumnVisible,
    canToggleColumn,
    setColumnVisible,
    toggleColumn,
    showAllColumns,
  };
}
