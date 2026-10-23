import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { ArrowSortDown20Regular, ArrowSortUp20Regular, DocumentSearch24Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { Checkbox } from "../Checkbox/Checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../Empty/Empty";
import { useSpinDelay } from "../Loading/Loading";
import { SkeletonItem } from "../Skeleton/Skeleton";
import {
  useDataGridSelection,
  useDataGridSort,
  type DataGridColumn,
  type DataGridColumnAlign,
  type DataGridColumnSizingOptions,
  type DataGridFocusMode,
  type DataGridSelectionData,
  type DataGridSelectionMode,
  type DataGridSize,
  type DataGridSortState,
} from "./useDataGrid";

export * from "./useDataGrid";

/**
 * Fluent 2 DataGrid — https://react.fluentui.dev/?path=/docs/components-datagrid--docs
 * Lưới dữ liệu `role="grid"`: sắp xếp, chọn hàng, kéo đổi độ rộng cột, ảo hoá hàng (10 000+ hàng) và điều hướng
 * bàn phím (roving tabindex, đảo ArrowLeft / ArrowRight trong RTL). Cột khai báo bằng `createColumn<T>()`.
 */

/* ================================================================ Hằng số */

/** Chiều cao hàng (px) theo size — khớp với class h-8.5 / h-11 / h-14 bên dưới; dùng cho phép tính ảo hoá. */
const ROW_HEIGHT: Record<DataGridSize, number> = { small: 34, medium: 44, large: 56 };

const SIZE_CLASS: Record<DataGridSize, { fixed: string; min: string; scroll: string; icon: string }> = {
  small: { fixed: "h-8.5", min: "min-h-8.5", scroll: "scroll-pt-8.5", icon: "size-4" },
  medium: { fixed: "h-11", min: "min-h-11", scroll: "scroll-pt-11", icon: "size-5" },
  large: { fixed: "h-14", min: "min-h-14", scroll: "scroll-pt-14", icon: "size-5" },
};

const ALIGN: Record<DataGridColumnAlign, string> = {
  start: "justify-start text-start",
  end: "justify-end text-end",
  center: "justify-center text-center",
};

/** Cột chọn rộng như w-11 — viết theo biến --spacing để không hard-code px. */
const SELECTION_TRACK = "calc(var(--spacing) * 11)";
const DEFAULT_MIN_WIDTH = 80;
/** Cột ghim không khai báo width cần độ rộng cố định để tính vị trí cột ghim kế tiếp. */
const STICKY_FALLBACK_WIDTH = 160;
const RESIZE_STEP = 10;
const RESIZE_STEP_LARGE = 50;
const DEFAULT_OVERSCAN = 6;
/** Chiều cao khung nhìn ước lượng khi chưa đo được (SSR, lần render đầu). */
const ESTIMATED_VIEWPORT = 400;
const PAGE_FALLBACK = 10;

/** Độ rộng xoay vòng cho khung xương — giống SkeletonTable. */
const SKELETON_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-2/5"] as const;

/** Phần tử nhận focus của lưới (ô, ô tiêu đề hoặc cả hàng khi focusMode="row"). */
const NAV_ATTR = "data-dg-nav";
const FOCUS_RING = "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focus";
const INTERACTIVE =
  "a[href], button, input, select, textarea, summary, [contenteditable='true'], [contenteditable=''], [role='button'], [role='link'], [role='checkbox'], [role='switch'], [role='menuitem'], [role='combobox']";

const clamp = (value: number, min: number, max = Number.POSITIVE_INFINITY) => Math.min(Math.max(value, min), max);
const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

/* ================================================================ Props */

export interface DataGridProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Dữ liệu (theo thứ tự gốc — DataGrid tự sắp xếp khi `sortable`). */
  items: readonly T[];
  /** Định nghĩa cột, tạo bằng `createColumn<T>()`. */
  columns: readonly DataGridColumn<T>[];
  /** Id ổn định của một hàng — dùng cho key, lựa chọn và chọn theo khoảng. */
  getRowId: (item: T) => string;
  /** Mật độ hàng: small 34px · medium 44px · large 56px. */
  size?: DataGridSize;

  /** Bấm / Enter / Space trên tiêu đề cột có `compare` để sắp xếp. */
  sortable?: boolean;
  sortState?: DataGridSortState;
  defaultSortState?: DataGridSortState;
  onSortChange?: (event: React.SyntheticEvent | undefined, state: DataGridSortState) => void;

  /** Bật cột chọn: single (chấm tròn) hoặc multiselect (checkbox + chọn tất cả). */
  selectionMode?: DataGridSelectionMode;
  /** Tập id đang chọn (điều khiển từ ngoài). */
  selectedItems?: ReadonlySet<string>;
  defaultSelectedItems?: Iterable<string>;
  onSelectionChange?: (event: React.SyntheticEvent | undefined, data: DataGridSelectionData) => void;
  /** Nền hàng đang chọn: brand (tint Sakura) · neutral (xám) · none (chỉ checkbox). */
  selectionAppearance?: "brand" | "neutral" | "none";
  /** Checkbox / chấm chọn chỉ hiện khi hover, focus hoặc hàng đã được chọn. */
  subtleSelection?: boolean;

  /** Kéo mép phải tiêu đề (hoặc focus tay nắm rồi dùng phím mũi tên) để đổi độ rộng cột. */
  resizableColumns?: boolean;
  /** Ghi đè width / minWidth / maxWidth theo columnId. */
  columnSizingOptions?: Readonly<Record<string, DataGridColumnSizingOptions>>;
  onColumnResize?: (event: React.SyntheticEvent | undefined, data: { columnId: string; width: number }) => void;

  /** Chỉ render các hàng trong khung nhìn (+ overscan). Cần chiều cao cố định: `height` hoặc class h-*. */
  virtualized?: boolean;
  /** Chiều cao mỗi hàng (px). Mặc định theo size. Bắt buộc mọi hàng cao bằng nhau khi virtualized. */
  rowHeight?: number;
  /** Chiều cao khung cuộn (số = px). virtualized mà không truyền → h-100 (400px). */
  height?: number | string;
  /** Số hàng render thêm phía trên / dưới khung nhìn khi virtualized. */
  overscan?: number;

  /** cell: phím mũi tên đi từng ô · row: đi từng hàng (tiêu đề vẫn đi từng ô). */
  focusMode?: DataGridFocusMode;
  /** Đang tải: hiện khung xương (sau 300ms, giữ ≥ 500ms — useSpinDelay). Dữ liệu cũ vẫn hiện trong lúc chờ. */
  loading?: boolean;
  /** Nội dung khi không có hàng nào. Mặc định Empty "Không có dữ liệu". */
  empty?: React.ReactNode;
}

/* ================================================================ Cột đã tính kích thước */

interface ResolvedColumn<T> {
  column: DataGridColumn<T>;
  /** Vị trí trong lưới (đã tính cột chọn). */
  colIndex: number;
  /** px cố định; undefined = co giãn. */
  width: number | undefined;
  minWidth: number;
  maxWidth: number | undefined;
  resizable: boolean;
  sortable: boolean;
  /** inset-inline-start (CSS) khi cột được ghim: `var(--dg-sticky-<colIndex>)`, giá trị đặt trên root. */
  stickyOffset: string | undefined;
  /** Cột ghim cuối cùng — có vạch ngăn với phần cuộn. */
  stickyLast: boolean;
}

function track(c: ResolvedColumn<unknown>, autoSize?: number) {
  if (autoSize === c.colIndex) return "max-content";
  if (c.width !== undefined) return `${c.width}px`;
  return `minmax(${c.minWidth}px, ${c.maxWidth !== undefined ? `${c.maxWidth}px` : "1fr"})`;
}

function gridTemplate(hasSelection: boolean, columns: readonly ResolvedColumn<unknown>[], autoSize?: number) {
  return [...(hasSelection ? [SELECTION_TRACK] : []), ...columns.map((c) => track(c, autoSize))].join(" ");
}

/* ================================================================ Vị trí focus */

interface Position {
  /** 0 = hàng tiêu đề · 1…n = hàng dữ liệu (theo thứ tự hiển thị). */
  row: number;
  /** Chỉ số cột trong lưới; -1 = cả hàng (focusMode="row"). */
  col: number;
}

function positionOf(element: Element | null, root: HTMLElement): Position | null {
  const nav = element?.closest<HTMLElement>(`[${NAV_ATTR}]`);
  if (!nav || !root.contains(nav)) return null;
  const rowEl = nav.closest<HTMLElement>("[data-row-index]");
  if (!rowEl) return null;
  return {
    row: Number(rowEl.dataset.rowIndex),
    col: nav.dataset.colIndex !== undefined ? Number(nav.dataset.colIndex) : -1,
  };
}

function findNav(root: HTMLElement | null, { row, col }: Position) {
  const rowEl = root?.querySelector<HTMLElement>(`[data-row-index="${row}"]`);
  if (!rowEl) return null;
  return col < 0 ? rowEl : rowEl.querySelector<HTMLElement>(`[data-col-index="${col}"]`);
}

/** Click vào nút / link / ô nhập bên trong ô → không coi là click chọn hàng hay sắp xếp. */
function isInnerInteractive(target: HTMLElement, boundary: HTMLElement) {
  const hit = target.closest<HTMLElement>(INTERACTIVE);
  return !!hit && hit !== boundary && boundary.contains(hit) && !hit.hasAttribute("data-dg-select");
}

function renderContent(node: React.ReactNode) {
  return typeof node === "string" || typeof node === "number" ? <span className="min-w-0 truncate">{node}</span> : node;
}

/* ================================================================ Tay nắm đổi độ rộng cột */

interface ResizeHandleProps {
  columnId: string;
  width: number | undefined;
  minWidth: number;
  maxWidth: number | undefined;
  rtl: boolean;
  tabbable: boolean;
  /** id phần tử chứa tên cột — ghép vào nhãn "Đổi độ rộng cột …". */
  headerLabelId: string;
  onResize: (event: React.SyntheticEvent, columnId: string, width: number) => void;
  onAutoSize: (event: React.SyntheticEvent, columnId: string) => void;
}

function ColumnResizeHandle({
  columnId,
  width,
  minWidth,
  maxWidth,
  rtl,
  tabbable,
  headerLabelId,
  onResize,
  onAutoSize,
}: ResizeHandleProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const textId = React.useId();
  const drag = React.useRef<{ x: number; width: number; pointerId: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  // Cột co giãn chưa có width: đo độ rộng thật (sau khi render) cho aria-valuenow.
  const [measured, setMeasured] = React.useState<number>();

  useIsomorphicLayoutEffect(() => {
    if (width !== undefined) return;
    const cell = ref.current?.parentElement;
    if (!cell) return;
    const measure = () => {
      const next = Math.round(cell.getBoundingClientRect().width);
      if (next > 0) setMeasured(next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(cell);
    return () => observer.disconnect();
  }, [width]);

  const current = () => width ?? ref.current?.parentElement?.getBoundingClientRect().width ?? measured ?? minWidth;
  const value = Math.round(width ?? measured ?? minWidth);

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-labelledby={`${textId} ${headerLabelId}`}
      aria-valuenow={value}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuetext={`${value} px`}
      tabIndex={tabbable ? 0 : -1}
      data-dg-resize-handle=""
      data-dragging={dragging || undefined}
      className={cn(
        "group/handle absolute inset-y-0 inset-e-0 z-1 flex w-2 cursor-col-resize touch-none items-center justify-center",
        FOCUS_RING,
      )}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onAutoSize(event, columnId);
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        drag.current = { x: event.clientX, width: current(), pointerId: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={(event) => {
        const state = drag.current;
        if (!state || state.pointerId !== event.pointerId) return;
        // RTL: mép cuối của cột nằm bên trái → kéo sang trái là nới rộng.
        const delta = (event.clientX - state.x) * (rtl ? -1 : 1);
        onResize(event, columnId, state.width + delta);
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={() => {
        drag.current = null;
        setDragging(false);
      }}
      onKeyDown={(event) => {
        const grow = rtl ? "ArrowLeft" : "ArrowRight";
        const shrink = rtl ? "ArrowRight" : "ArrowLeft";
        const step = event.shiftKey ? RESIZE_STEP_LARGE : RESIZE_STEP;
        let next: number;
        switch (event.key) {
          case grow:
            next = current() + step;
            break;
          case shrink:
            next = current() - step;
            break;
          case "Home":
            next = minWidth;
            break;
          case "End":
            if (maxWidth === undefined) return;
            next = maxWidth;
            break;
          case "Enter":
          case "Escape":
            event.preventDefault();
            ref.current?.parentElement?.focus();
            return;
          default:
            return;
        }
        event.preventDefault();
        onResize(event, columnId, next);
      }}
    >
      <span id={textId} hidden>
        Đổi độ rộng cột
      </span>
      <span
        aria-hidden
        className={cn(
          "h-1/2 w-0.5 rounded-circular bg-stroke-1 opacity-0 transition-opacity duration-faster ease-easy-ease",
          "group-hover/header:opacity-100 group-hover/handle:bg-brand-stroke group-hover/handle:opacity-100",
          "group-focus-visible/handle:bg-brand-stroke group-focus-visible/handle:opacity-100",
          "group-data-dragging/handle:bg-brand-stroke group-data-dragging/handle:opacity-100",
        )}
      />
    </div>
  );
}

/* ================================================================ Hàng dữ liệu */

/** Phần của cột mà hàng cần — không gồm độ rộng, nên kéo đổi cỡ cột không render lại các hàng. */
type RowCell<T> = Pick<ResolvedColumn<T>, "column" | "colIndex" | "stickyOffset" | "stickyLast">;

interface RowViewProps<T> {
  item: T;
  rowId: string;
  /** Vị trí theo thứ tự hiển thị (0-based). */
  index: number;
  cells: readonly RowCell<T>[];
  selectionMode: DataGridSelectionMode | undefined;
  selected: boolean;
  selectionAppearance: "brand" | "neutral" | "none";
  subtleSelection: boolean;
  focusMode: DataGridFocusMode;
  /** null: hàng không chứa vị trí focus · -1: cả hàng · ≥ 0: cột đang focus. */
  activeCol: number | null;
  size: DataGridSize;
  rowHeight: number | undefined;
  /** Toạ độ top (px) khi ảo hoá; undefined = hàng nằm theo luồng bình thường. */
  virtualTop: number | undefined;
}

function RowViewImpl<T>({
  item,
  rowId,
  index,
  cells,
  selectionMode,
  selected,
  selectionAppearance,
  subtleSelection,
  focusMode,
  activeCol,
  size,
  rowHeight,
  virtualTop,
}: RowViewProps<T>) {
  const rowMode = focusMode === "row";
  const virtual = virtualTop !== undefined;
  const look = selected ? selectionAppearance : "none";
  const cellTab = (col: number) => (rowMode ? undefined : activeCol === col ? 0 : -1);
  const cellNav = rowMode ? undefined : "";
  const firstSticky = cells[0]?.stickyOffset !== undefined;

  return (
    <div
      role="row"
      aria-rowindex={index + 2}
      aria-selected={selectionMode ? selected : undefined}
      data-row-index={index + 1}
      data-row-id={rowId}
      data-dg-row=""
      data-selected={selected || undefined}
      data-dg-nav={rowMode ? "" : undefined}
      tabIndex={rowMode ? (activeCol === -1 ? 0 : -1) : undefined}
      style={virtual ? { top: virtualTop, height: rowHeight } : rowHeight !== undefined ? { minHeight: rowHeight } : undefined}
      className={cn(
        "group/row grid grid-cols-(--dg-cols) border-b border-stroke-3 bg-background-1",
        "transition-colors duration-faster ease-easy-ease",
        virtual ? cn("absolute inset-x-0", rowHeight === undefined && SIZE_CLASS[size].fixed) : SIZE_CLASS[size].min,
        look === "brand" && "bg-brand-background-2 hover:bg-brand-background-2-hover",
        look === "neutral" && "bg-subtle-pressed",
        look === "none" && "hover:bg-subtle-hover active:bg-subtle-pressed",
        rowMode && FOCUS_RING,
      )}
    >
      {selectionMode && (
        <div
          role="gridcell"
          aria-colindex={1}
          data-col-index={0}
          data-dg-nav={cellNav}
          tabIndex={cellTab(0)}
          className={cn(
            "flex items-center justify-center",
            FOCUS_RING,
            firstSticky && "sticky inset-s-0 z-1 bg-inherit",
            subtleSelection &&
              !selected &&
              "*:opacity-0 *:transition-opacity *:duration-faster group-hover/row:*:opacity-100 group-focus-within/row:*:opacity-100",
          )}
        >
          {selectionMode === "multiselect" ? (
            <Checkbox data-dg-select="" tabIndex={-1} checked={selected} onClick={preventDefault} aria-label="Chọn hàng" />
          ) : (
            <span
              aria-hidden
              className={cn(
                "flex size-4 items-center justify-center rounded-circular border transition-colors duration-faster ease-easy-ease",
                selected ? "border-brand-stroke" : "border-stroke-accessible group-hover/row:border-foreground-2",
              )}
            >
              {selected && <span className="size-2.5 rounded-circular bg-brand-stroke" />}
            </span>
          )}
        </div>
      )}
      {cells.map((c) => (
        <div
          key={c.column.columnId}
          role="gridcell"
          aria-colindex={c.colIndex + 1}
          data-col-index={c.colIndex}
          data-dg-nav={cellNav}
          tabIndex={cellTab(c.colIndex)}
          style={c.stickyOffset !== undefined ? { insetInlineStart: c.stickyOffset } : undefined}
          className={cn(
            "flex min-w-0 items-center gap-2 overflow-hidden px-2",
            ALIGN[c.column.align ?? "start"],
            FOCUS_RING,
            c.stickyOffset !== undefined && "sticky z-1 bg-inherit",
            c.stickyLast && "border-e border-stroke-3",
          )}
        >
          {renderContent(c.column.renderCell(item))}
        </div>
      ))}
    </div>
  );
}

const RowView = React.memo(RowViewImpl) as typeof RowViewImpl;

/* ================================================================ DataGrid */

function DataGridImpl<T>(
  {
    items,
    columns,
    getRowId,
    size = "medium",
    sortable = false,
    sortState,
    defaultSortState,
    onSortChange,
    selectionMode,
    selectedItems,
    defaultSelectedItems,
    onSelectionChange,
    selectionAppearance = "brand",
    subtleSelection = false,
    resizableColumns = false,
    columnSizingOptions,
    onColumnResize,
    virtualized = false,
    rowHeight,
    height,
    overscan = DEFAULT_OVERSCAN,
    focusMode = "cell",
    loading = false,
    empty,
    className,
    style,
    onKeyDown,
    onFocus,
    onClick,
    onMouseDown,
    onScroll,
    ...props
  }: DataGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const dir = useDirection();
  const rtl = dir === "rtl";
  const baseId = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLDivElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  /* ---------------------------------------------------------- sắp xếp & chọn */
  const { getSortDirection, toggleColumnSort, sort } = useDataGridSort({
    columns,
    sortState,
    defaultSortState,
    onSortChange,
  });
  const rows = React.useMemo(() => (sortable ? sort(items) : items), [sortable, sort, items]);
  // getRowId thường viết inline (hàm mới mỗi render) nhưng là hàm thuần theo item: chỉ tính lại khi danh sách hàng đổi, không
  // phải mỗi bước cuộn ảo / mỗi lần đổi focus.
  const rowIds = React.useMemo(() => rows.map((item) => getRowId(item)), [rows]);
  const selection = useDataGridSelection({ selectionMode, rowIds, selectedItems, defaultSelectedItems, onSelectionChange });
  const hasSelection = selectionMode !== undefined;
  const multiselect = selectionMode === "multiselect";
  const lead = hasSelection ? 1 : 0;
  const colCount = columns.length + lead;

  /* ---------------------------------------------------------- kích thước cột */
  const [widths, setWidths] = React.useState<Record<string, number>>({});

  const resolved = React.useMemo(() => {
    const list: ResolvedColumn<T>[] = [];
    let stickyRun = true;
    let stickyPx = 0;
    columns.forEach((column, i) => {
      const sizing = columnSizingOptions?.[column.columnId];
      const minWidth = sizing?.minWidth ?? column.minWidth ?? DEFAULT_MIN_WIDTH;
      const maxWidth = sizing?.maxWidth ?? column.maxWidth;
      const sticky = stickyRun && column.sticky === "start";
      if (!sticky) stickyRun = false;
      let width = widths[column.columnId] ?? sizing?.defaultWidth ?? column.width;
      if (sticky && width === undefined) width = Math.max(minWidth, STICKY_FALLBACK_WIDTH);
      if (width !== undefined) width = clamp(width, minWidth, maxWidth);
      const offset = hasSelection ? `calc(${SELECTION_TRACK} + ${stickyPx}px)` : `${stickyPx}px`;
      if (sticky) stickyPx += width ?? 0;
      list.push({
        column,
        colIndex: i + lead,
        width,
        minWidth,
        maxWidth,
        resizable: resizableColumns && column.resizable !== false,
        sortable: sortable && !!column.compare,
        stickyOffset: sticky ? offset : undefined,
        stickyLast: false,
      });
    });
    const lastSticky = list.filter((c) => c.stickyOffset !== undefined).pop();
    if (lastSticky) lastSticky.stickyLast = true;
    return list;
  }, [columns, columnSizingOptions, widths, hasSelection, lead, resizableColumns, sortable]);

  // Ô của hàng: chỉ phụ thuộc cột nào được ghim, không phụ thuộc độ rộng — offset ghim đọc từ biến CSS trên root
  // (--dg-sticky-<colIndex>), nên khi kéo đổi cỡ cột các hàng (React.memo) không render lại.
  const rowCells = React.useMemo<RowCell<T>[]>(() => {
    let stickyRun = true;
    const list = columns.map((column, i): RowCell<T> => {
      const sticky = stickyRun && column.sticky === "start";
      if (!sticky) stickyRun = false;
      return { column, colIndex: i + lead, stickyOffset: sticky ? `var(--dg-sticky-${i + lead})` : undefined, stickyLast: false };
    });
    const lastSticky = list.filter((c) => c.stickyOffset !== undefined).pop();
    if (lastSticky) lastSticky.stickyLast = true;
    return list;
  }, [columns, lead]);
  const stickyVars = Object.fromEntries(
    resolved.filter((c) => c.stickyOffset !== undefined).map((c) => [`--dg-sticky-${c.colIndex}`, c.stickyOffset]),
  );

  const stickyEnd = resolved.filter((c) => c.stickyOffset !== undefined).reduce((sum, c) => sum + (c.width ?? 0), 0);
  const hasSticky = resolved[0]?.stickyOffset !== undefined;
  const minTotal = resolved.reduce((sum, c) => sum + (c.width ?? c.minWidth), 0);

  const resizeColumn = React.useCallback(
    (event: React.SyntheticEvent | undefined, columnId: string, raw: number) => {
      const c = resolved.find((r) => r.column.columnId === columnId);
      if (!c) return;
      const width = Math.round(clamp(raw, c.minWidth, c.maxWidth));
      if (width === c.width) return;
      setWidths((prev) => ({ ...prev, [columnId]: width }));
      onColumnResize?.(event, { columnId, width });
    },
    [resolved, onColumnResize],
  );

  /** Nhấp đúp tay nắm: tạm đặt cột thành max-content, đo các ô đang render rồi trả lại. */
  const autoSizeColumn = React.useCallback(
    (event: React.SyntheticEvent, columnId: string) => {
      const root = rootRef.current;
      const c = resolved.find((r) => r.column.columnId === columnId);
      if (!root || !c) return;
      const previous = root.style.getPropertyValue("--dg-cols");
      root.style.setProperty("--dg-cols", gridTemplate(hasSelection, resolved as ResolvedColumn<unknown>[], c.colIndex));
      let max = 0;
      root.querySelectorAll<HTMLElement>(`[data-col-index="${c.colIndex}"]`).forEach((cell) => {
        max = Math.max(max, cell.getBoundingClientRect().width);
      });
      root.style.setProperty("--dg-cols", previous);
      if (max > 0) resizeColumn(event, columnId, Math.ceil(max));
    },
    [resolved, hasSelection, resizeColumn],
  );

  /* ---------------------------------------------------------- trạng thái tải / rỗng */
  const showSkeleton = useSpinDelay(loading, { delay: 300, minDuration: 500 });
  // Trong 300ms đầu chưa có dữ liệu: giữ chỗ bằng khung xương vô hình (không nháy Empty, không nháy loader).
  const placeholder = !showSkeleton && loading && rows.length === 0;
  const skeleton = showSkeleton || placeholder;
  const dataRows = skeleton ? 0 : rows.length;
  const isEmpty = !skeleton && rows.length === 0;

  /* ---------------------------------------------------------- ảo hoá */
  const rh = rowHeight ?? ROW_HEIGHT[size];
  const [viewport, setViewport] = React.useState({ height: 0, width: 0 });
  const [firstRow, setFirstRow] = React.useState(0);
  const viewportHeight = viewport.height > 0 ? viewport.height : typeof height === "number" ? height : ESTIMATED_VIEWPORT;

  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const next = { height: el.clientHeight, width: el.clientWidth };
      setViewport((prev) => (prev.height === next.height && prev.width === next.width ? prev : next));
      if (virtualized) setFirstRow(Math.floor(el.scrollTop / rh));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [virtualized, rh]);

  /* ---------------------------------------------------------- focus (roving tabindex) */
  const [active, setActive] = React.useState<Position>({ row: 0, col: 0 });
  const headerCol = React.useRef(0);
  const pendingFocus = React.useRef(false);
  const rowMode = focusMode === "row";
  const activeRow = Math.min(active.row, dataRows);
  const activeCol =
    rowMode && activeRow >= 1 ? -1 : clamp(active.col < 0 ? headerCol.current : active.col, 0, colCount - 1);

  // Vị trí đích của phím vừa bấm đã render → focus (sau khi cuộn ảo hoá đã đưa hàng vào DOM).
  useIsomorphicLayoutEffect(() => {
    if (!pendingFocus.current) return;
    const el = findNav(rootRef.current, { row: activeRow, col: activeCol });
    if (!el) return;
    pendingFocus.current = false;
    if (document.activeElement !== el) el.focus();
  });

  const visibleCount = Math.ceil(viewportHeight / rh) + 1;
  const first = Math.min(firstRow, Math.max(0, dataRows - 1));
  const start = virtualized ? Math.max(0, first - overscan) : 0;
  const end = virtualized ? Math.min(dataRows, first + visibleCount + overscan) : dataRows;
  const indices: number[] = [];
  for (let i = start; i < end; i++) indices.push(i);
  // Hàng đang giữ focus luôn được render (dù đã cuộn khỏi khung nhìn) để focus không rơi về <body>.
  if (virtualized && activeRow >= 1 && (activeRow - 1 < start || activeRow - 1 >= end)) {
    if (activeRow - 1 < start) indices.unshift(activeRow - 1);
    else indices.push(activeRow - 1);
  }

  /** Ảo hoá: cuộn để hàng `index` nằm trọn dưới tiêu đề sticky, và cập nhật cửa sổ render ngay trong lần này. */
  const revealRow = (index: number) => {
    const el = rootRef.current;
    if (!el) return;
    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    const view = Math.max(rh, (el.clientHeight || viewportHeight) - headerHeight);
    const top = index * rh;
    let next = el.scrollTop;
    if (top < next) next = top;
    else if (top + rh > next + view) next = top + rh - view;
    if (next !== el.scrollTop) el.scrollTop = next;
    setFirstRow(Math.floor(next / rh));
  };

  const moveTo = (next: Position) => {
    if (virtualized && next.row >= 1) revealRow(next.row - 1);
    if (next.row === activeRow && next.col === activeCol) return;
    if (next.row === 0) headerCol.current = next.col;
    pendingFocus.current = true;
    setActive(next);
  };

  const pageSize = () => {
    const root = rootRef.current;
    if (!root) return PAGE_FALLBACK;
    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    const scrolls = virtualized || root.scrollHeight > root.clientHeight + 1;
    const view = (root.clientHeight || (virtualized ? viewportHeight : 0)) - headerHeight;
    return scrolls && view > 0 ? Math.max(1, Math.floor(view / rh)) : PAGE_FALLBACK;
  };

  /** Space / Enter: tiêu đề → sắp xếp hoặc chọn tất cả; hàng → chọn (Space). */
  const activate = (event: React.KeyboardEvent, pos: Position, key: string) => {
    if (pos.row === 0) {
      if (hasSelection && pos.col === 0) {
        if (!multiselect) return false;
        selection.toggleAllItems(event);
        return true;
      }
      const c = resolved[pos.col - lead];
      if (!c?.sortable) return false;
      toggleColumnSort(event, c.column.columnId);
      return true;
    }
    if (key !== " " || !hasSelection) return false;
    const id = rowIds[pos.row - 1];
    if (id === undefined) return false;
    if (event.shiftKey && multiselect) selection.extendSelection(event, id);
    else selection.toggleItem(event, id);
    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const root = rootRef.current;
    const target = event.target as HTMLElement;
    if (event.defaultPrevented || !root || !target.hasAttribute(NAV_ATTR)) return;
    const pos = positionOf(target, root);
    if (!pos) return;

    const ctrl = event.ctrlKey || event.metaKey;
    const lastCol = colCount - 1;
    // RTL: ArrowLeft đi về cuối dòng (sang phải trong DOM), ArrowRight về đầu dòng.
    const key =
      rtl && (event.key === "ArrowLeft" || event.key === "ArrowRight")
        ? event.key === "ArrowLeft"
          ? "ArrowRight"
          : "ArrowLeft"
        : event.key;
    const at = (row: number, col = pos.col): Position => {
      const r = clamp(row, 0, dataRows);
      if (rowMode && r >= 1) return { row: r, col: -1 };
      return { row: r, col: col < 0 ? headerCol.current : clamp(col, 0, lastCol) };
    };

    let next: Position;
    switch (key) {
      case "ArrowDown":
        next = at(pos.row + 1);
        break;
      case "ArrowUp":
        next = at(pos.row - 1);
        break;
      case "ArrowRight":
        if (pos.col < 0) return;
        next = at(pos.row, pos.col + 1);
        break;
      case "ArrowLeft":
        if (pos.col < 0) return;
        next = at(pos.row, pos.col - 1);
        break;
      case "Home":
        next = pos.col < 0 ? at(1) : ctrl ? at(0, 0) : at(pos.row, 0);
        break;
      case "End":
        next = pos.col < 0 ? at(dataRows) : ctrl ? at(dataRows, lastCol) : at(pos.row, lastCol);
        break;
      case "PageDown":
        next = at(pos.row + pageSize());
        break;
      case "PageUp":
        next = at(pos.row === 0 ? 0 : Math.max(1, pos.row - pageSize()));
        break;
      case " ":
      case "Enter":
        if (activate(event, pos, key)) event.preventDefault();
        return;
      case "a":
      case "A":
        if (!ctrl || !multiselect || dataRows === 0) return;
        event.preventDefault();
        selection.selectAllItems(event);
        return;
      default:
        return;
    }

    event.preventDefault();
    // Shift + mũi tên / PageUp / PageDown trong multiselect: mở rộng khoảng chọn theo hàng đích.
    if (event.shiftKey && multiselect && pos.row >= 1 && next.row >= 1 && next.row !== pos.row) {
      const id = rowIds[next.row - 1];
      if (id !== undefined) selection.extendSelection(event, id, rowIds[pos.row - 1]);
    }
    moveTo(next);
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    const root = rootRef.current;
    if (!root) return;
    const pos = positionOf(event.target, root);
    if (!pos) return;
    if (pos.row === 0) headerCol.current = pos.col;
    setActive((prev) => (prev.row === pos.row && prev.col === pos.col ? prev : pos));
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    const root = rootRef.current;
    const target = event.target as HTMLElement;
    // Checkbox chọn tự preventDefault để Radix không tự đổi trạng thái — hàng / tiêu đề xử lý thay.
    const fromSelect = !!target.closest("[data-dg-select]");
    if (!root || (event.defaultPrevented && !fromSelect)) return;

    const header = target.closest<HTMLElement>("[data-dg-header]");
    if (header && root.contains(header)) {
      if (isInnerInteractive(target, header)) return;
      const col = Number(header.dataset.colIndex);
      if (hasSelection && col === 0) {
        selection.toggleAllItems(event);
        return;
      }
      const c = resolved[col - lead];
      if (c?.sortable) toggleColumnSort(event, c.column.columnId);
      return;
    }

    if (!hasSelection) return;
    const row = target.closest<HTMLElement>("[data-dg-row]");
    if (!row || !root.contains(row) || isInnerInteractive(target, row)) return;
    const id = row.dataset.rowId;
    if (id === undefined) return;
    if (event.shiftKey && multiselect) selection.extendSelection(event, id, rowIds[activeRow - 1]);
    else selection.toggleItem(event, id);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseDown?.(event);
    if (!event.shiftKey || !multiselect || event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    if (!target.closest("[data-dg-row]")) return;
    // Shift + click: không bôi đen chữ giữa hai lần click, nhưng vẫn chuyển focus tới ô được click.
    event.preventDefault();
    target.closest<HTMLElement>(`[${NAV_ATTR}]`)?.focus({ preventScroll: true });
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(event);
    if (!virtualized) return;
    const next = Math.floor(event.currentTarget.scrollTop / rh);
    setFirstRow((prev) => (prev === next ? prev : next));
  };

  /* ---------------------------------------------------------- render */
  const sizeClass = SIZE_CLASS[size];
  const headerTab = (col: number) => (activeRow === 0 && activeCol === col ? 0 : -1);
  const rowStyleHeight = rowHeight !== undefined ? { height: rowHeight } : undefined;
  const skeletonCount = virtualized ? clamp(Math.ceil(viewportHeight / rh), 3, 20) : 5;

  const rootStyle = {
    "--dg-cols": gridTemplate(hasSelection, resolved as ResolvedColumn<unknown>[]),
    "--dg-min": hasSelection ? `calc(${SELECTION_TRACK} + ${minTotal}px)` : `${minTotal}px`,
    ...stickyVars,
    height,
    scrollPaddingInlineStart: hasSticky ? (hasSelection ? `calc(${SELECTION_TRACK} + ${stickyEnd}px)` : `${stickyEnd}px`) : undefined,
    ...style,
  } as React.CSSProperties;

  let body: React.ReactNode;
  if (skeleton) {
    body = Array.from({ length: skeletonCount }, (_, r) => (
      <div
        key={r}
        aria-hidden
        style={rowStyleHeight}
        className={cn(
          "grid grid-cols-(--dg-cols) items-center border-b border-stroke-3",
          rowHeight === undefined && sizeClass.fixed,
          placeholder && "invisible",
        )}
      >
        {hasSelection && (
          <div className="flex justify-center">
            <SkeletonItem shape="square" size={16} className="rounded-small" />
          </div>
        )}
        {resolved.map((c, i) => (
          <div key={c.column.columnId} className={cn("flex min-w-0 px-2", ALIGN[c.column.align ?? "start"])}>
            <SkeletonItem size={12} className={SKELETON_WIDTHS[(r + i) % SKELETON_WIDTHS.length]} />
          </div>
        ))}
      </div>
    ));
  } else if (isEmpty) {
    body = (
      <div role="row" aria-rowindex={2} className="flex">
        <div
          role="gridcell"
          aria-colindex={1}
          aria-colspan={colCount}
          style={viewport.width > 0 ? { width: viewport.width } : undefined}
          className={cn("sticky inset-s-0 flex min-w-0 justify-center", viewport.width > 0 ? "shrink-0" : "flex-1")}
        >
          {empty ?? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <DocumentSearch24Regular />
                </EmptyMedia>
                <EmptyTitle>Không có dữ liệu</EmptyTitle>
                <EmptyDescription>Chưa có hàng nào để hiển thị.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    );
  } else {
    body = indices.map((i) => {
      const id = rowIds[i];
      const rowActive = activeRow === i + 1;
      return (
        <RowView<T>
          key={id}
          item={rows[i]}
          rowId={id}
          index={i}
          cells={rowCells}
          selectionMode={selectionMode}
          selected={selection.isSelected(id)}
          selectionAppearance={selectionAppearance}
          subtleSelection={subtleSelection}
          focusMode={focusMode}
          activeCol={rowActive ? activeCol : null}
          size={size}
          rowHeight={virtualized ? rh : rowHeight}
          virtualTop={virtualized ? i * rh : undefined}
        />
      );
    });
  }

  const headerChecked = selection.allSelected ? true : selection.someSelected ? "indeterminate" : false;

  return (
    <div
      ref={setRefs}
      role="grid"
      aria-rowcount={skeleton ? undefined : isEmpty ? 2 : rows.length + 1}
      aria-colcount={colCount}
      aria-multiselectable={multiselect || undefined}
      aria-busy={loading || undefined}
      data-size={size}
      className={cn(
        "relative isolate w-full min-w-0 overflow-auto bg-background-1 text-body1 text-foreground-1",
        sizeClass.scroll,
        virtualized && height === undefined && "h-100",
        className,
      )}
      style={rootStyle}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onScroll={handleScroll}
      {...props}
    >
      <div ref={headerRef} role="rowgroup" className="sticky top-0 z-2 min-w-(--dg-min) bg-background-1">
        <div
          role="row"
          aria-rowindex={1}
          data-row-index={0}
          className={cn("grid grid-cols-(--dg-cols) border-b border-stroke-2 bg-background-1", sizeClass.fixed)}
        >
          {hasSelection && (
            <div
              role="columnheader"
              aria-colindex={1}
              data-col-index={0}
              data-dg-header=""
              data-dg-nav=""
              tabIndex={headerTab(0)}
              className={cn("flex items-center justify-center", FOCUS_RING, hasSticky && "sticky inset-s-0 z-1 bg-inherit")}
            >
              {multiselect ? (
                <Checkbox
                  data-dg-select=""
                  tabIndex={-1}
                  checked={headerChecked}
                  onClick={preventDefault}
                  disabled={dataRows === 0}
                  aria-label="Chọn tất cả hàng"
                />
              ) : (
                <span className="sr-only">Chọn hàng</span>
              )}
            </div>
          )}
          {resolved.map((c) => {
            const direction = c.sortable ? getSortDirection(c.column.columnId) : undefined;
            const SortIcon = direction === "ascending" ? ArrowSortUp20Regular : ArrowSortDown20Regular;
            const labelId = `${baseId}-h${c.colIndex}`;
            return (
              <div
                key={c.column.columnId}
                role="columnheader"
                aria-colindex={c.colIndex + 1}
                aria-sort={c.sortable ? (direction ?? "none") : undefined}
                data-col-index={c.colIndex}
                data-dg-header=""
                data-dg-nav=""
                tabIndex={headerTab(c.colIndex)}
                style={c.stickyOffset !== undefined ? { insetInlineStart: c.stickyOffset } : undefined}
                className={cn(
                  "group/header relative flex min-w-0 items-center gap-1 px-2 font-semibold select-none",
                  ALIGN[c.column.align ?? "start"],
                  FOCUS_RING,
                  c.sortable &&
                    "cursor-pointer transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover active:bg-subtle-pressed",
                  c.stickyOffset !== undefined && "sticky z-1 bg-inherit",
                  c.stickyLast && "border-e border-stroke-3",
                )}
              >
                <span id={labelId} className="min-w-0 truncate">
                  {c.column.renderHeaderCell()}
                </span>
                {direction && (
                  <>
                    <SortIcon aria-hidden className={cn("shrink-0 text-foreground-2", sizeClass.icon)} />
                    <span className="sr-only">{direction === "ascending" ? "(tăng dần)" : "(giảm dần)"}</span>
                  </>
                )}
                {c.resizable && (
                  <ColumnResizeHandle
                    columnId={c.column.columnId}
                    width={c.width}
                    minWidth={c.minWidth}
                    maxWidth={c.maxWidth}
                    rtl={rtl}
                    tabbable={activeRow === 0 && activeCol === c.colIndex}
                    headerLabelId={labelId}
                    onResize={resizeColumn}
                    onAutoSize={autoSizeColumn}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        role="rowgroup"
        style={virtualized && !skeleton && !isEmpty ? { height: dataRows * rh } : undefined}
        className={cn("min-w-(--dg-min)", virtualized && !skeleton && !isEmpty && "relative")}
      >
        {body}
      </div>
    </div>
  );
}

const DataGridBase = React.forwardRef(DataGridImpl);
DataGridBase.displayName = "DataGrid";

/** Lưới dữ liệu — generic theo kiểu `item` (suy ra từ `items`). */
export const DataGrid = DataGridBase as <T>(
  props: DataGridProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
