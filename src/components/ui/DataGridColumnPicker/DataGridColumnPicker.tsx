import * as React from "react";
import {
  ArrowSortDown20Regular,
  ArrowSortUp20Regular,
  ColumnTriple20Regular,
  ReOrderDotsVertical16Regular,
} from "../_internal/icons";
import { CounterBadge } from "../CounterBadge/CounterBadge";
import { dataGridMessagesEn } from "../DataGrid/messages";
import {
  getOrderedColumns,
  useDataGridColumnVisibility,
  type DataGridColumnOrderData,
  type DataGridColumnVisibilityData,
  type DataGridColumnVisibilityItem,
  type DataGridSortState,
} from "../DataGrid/useDataGrid";
import { MenuDivider, MenuItem, MenuItemCheckbox } from "../Menu/Menu";
import { MenuButton, type MenuButtonProps } from "../MenuButton/MenuButton";
import { Sortable, SortableItem } from "../Sortable/Sortable";
import { ToolbarContext } from "../Toolbar/context";
import { useYugenMessages } from "../YugenProvider/context";

/**
 * Nút "Cột" mở danh sách cột để người dùng chọn cột hiển thị. Đặt trên toolbar của DataGrid (hoặc Table) và dùng chung
 * `hiddenColumns` với lưới. Menu không đóng khi tích từng cột; cột `hideable: false` và cột hiện cuối cùng bị khoá.
 * Nằm trong Toolbar thì tự thành mục của Toolbar (phím mũi tên, size, appearance subtle). Có `onColumnOrderChange` thì kéo
 * mục (hoặc Alt + ↑ ↓) để đổi thứ tự cột.
 */

export interface DataGridColumnPickerProps<C extends DataGridColumnVisibilityItem>
  extends Omit<MenuButtonProps, "menu" | "children"> {
  /** Cùng mảng cột truyền cho DataGrid; với Table là `{ columnId, label, hideable? }[]`. Tên trong menu = `label`. */
  columns: readonly C[];
  /** Id các cột đang ẩn — cùng giá trị truyền cho DataGrid. */
  hiddenColumns: ReadonlySet<string>;
  onHiddenColumnsChange: (event: React.SyntheticEvent | undefined, data: DataGridColumnVisibilityData) => void;
  /** Thứ tự cột — cùng giá trị truyền cho DataGrid. */
  columnOrder?: readonly string[];
  /** Có thì mục trong menu kéo được (hoặc Alt + ↑ ↓) để đổi thứ tự cột; gọi cả trong lúc kéo để lưới đổi theo. */
  onColumnOrderChange?: (event: React.SyntheticEvent | undefined, data: DataGridColumnOrderData) => void;
  /** Trạng thái sắp xếp của lưới: cột đang sắp xếp có mũi tên trong menu, kể cả khi đang ẩn. */
  sortState?: DataGridSortState;
  /** Nhãn nút. Mặc định `messages.dataGrid.columns` ("Cột"). */
  children?: React.ReactNode;
}

/** Radix đóng menu sau mỗi lần chọn — giữ mở để tích nhiều cột liền. */
const keepOpen = (event: Event) => event.preventDefault();

/** Nút chọn cột hiển thị — generic theo kiểu cột (suy ra từ `columns`). */
export function DataGridColumnPicker<C extends DataGridColumnVisibilityItem>({
  columns,
  hiddenColumns,
  onHiddenColumnsChange,
  columnOrder,
  onColumnOrderChange,
  sortState,
  children,
  icon,
  appearance,
  size,
  align = "end",
  "aria-describedby": describedBy,
  ref,
  ...props
}: DataGridColumnPickerProps<C> & { ref?: React.Ref<HTMLButtonElement> }) {
  const msg = useYugenMessages("dataGrid", dataGridMessagesEn);
  const toolbar = React.useContext(ToolbarContext);
  const countId = React.useId();
  const ordered = getOrderedColumns(columns, columnOrder);
  const visibility = useDataGridColumnVisibility({ columns: ordered, hiddenColumns, onHiddenColumnsChange });
  const hiddenCount = columns.length - visibility.visibleColumns.length;

  const columnItem = (column: C) => {
    const label = column.label ?? column.columnId;
    const direction = sortState?.sortColumn === column.columnId ? sortState.sortDirection : undefined;
    const SortIcon = direction === "ascending" ? ArrowSortUp20Regular : ArrowSortDown20Regular;
    return (
      <MenuItemCheckbox
        key={column.columnId}
        checked={visibility.isColumnVisible(column.columnId)}
        disabled={!visibility.canToggleColumn(column.columnId)}
        onSelect={keepOpen}
        onClick={(event) => visibility.toggleColumn(event, column.columnId)}
        // Tên ghép rõ ràng: trình duyệt không chắc chèn khoảng trắng giữa chữ và phần đọc riêng cho trình đọc màn hình.
        aria-label={
          direction && `${label} ${direction === "ascending" ? msg.sortAscending : msg.sortDescending}`
        }
        icon={onColumnOrderChange && <ReOrderDotsVertical16Regular aria-hidden className="size-4! shrink-0 text-foreground-3" />}
        secondaryContent={direction && <SortIcon aria-hidden className="size-4!" />}
      >
        {label}
      </MenuItemCheckbox>
    );
  };

  const menu = (
    <>
      {onColumnOrderChange ? (
        // Cả mục là tay nắm (Space đã dùng để tích cột); bàn phím: Alt + ↑ ↓.
        <Sortable
          role="group"
          aria-label={typeof children === "string" ? children : msg.columns}
          value={ordered.map((c) => c.columnId)}
          onValueChange={(order) => onColumnOrderChange(undefined, { columnOrder: order })}
        >
          {ordered.map((column) => (
            <SortableItem
              key={column.columnId}
              value={column.columnId}
              label={column.label ?? column.columnId}
              asChild
              handle
              shortcuts
            >
              {columnItem(column)}
            </SortableItem>
          ))}
        </Sortable>
      ) : (
        ordered.map(columnItem)
      )}
      <MenuDivider />
      <MenuItem disabled={hiddenCount === 0} onSelect={keepOpen} onClick={visibility.showAllColumns}>
        {msg.showAllColumns}
      </MenuItem>
    </>
  );

  return (
    <MenuButton
      ref={ref}
      menu={menu}
      align={align}
      icon={icon ?? <ColumnTriple20Regular />}
      appearance={appearance ?? (toolbar ? "subtle" : "secondary")}
      size={size ?? toolbar?.size}
      data-toolbar-item={toolbar ? "" : undefined}
      // Tên nút giữ nguyên ("Cột") cho điều khiển bằng giọng nói; số cột đang ẩn là mô tả.
      aria-describedby={[describedBy, hiddenCount > 0 ? countId : undefined].filter(Boolean).join(" ") || undefined}
      {...props}
    >
      {children ?? msg.columns}
      {hiddenCount > 0 && (
        <>
          <CounterBadge aria-hidden count={hiddenCount} size="small" />
          <span id={countId} hidden>
            {msg.hiddenColumns(hiddenCount)}
          </span>
        </>
      )}
    </MenuButton>
  );
}
