import * as React from "react";
import { ArrowSortDown20Regular, ArrowSortUp20Regular, ColumnTriple20Regular } from "@fluentui/react-icons";
import { CounterBadge } from "../CounterBadge/CounterBadge";
import { dataGridMessages } from "../DataGrid/messages";
import {
  useDataGridColumnVisibility,
  type DataGridColumnVisibilityData,
  type DataGridColumnVisibilityItem,
  type DataGridSortState,
} from "../DataGrid/useDataGrid";
import { MenuDivider, MenuItem, MenuItemCheckbox } from "../Menu/Menu";
import { MenuButton, type MenuButtonProps } from "../MenuButton/MenuButton";
import { ToolbarContext } from "../Toolbar/context";
import { useYugenMessages } from "../YugenProvider/context";

/**
 * Nút "Cột" mở danh sách cột để người dùng chọn cột hiển thị. Đặt trên toolbar của DataGrid (hoặc Table) và dùng chung
 * `hiddenColumns` với lưới. Menu không đóng khi tích từng cột; cột `hideable: false` và cột hiện cuối cùng bị khoá.
 * Nằm trong Toolbar thì tự thành mục của Toolbar (phím mũi tên, size, appearance subtle).
 */

export interface DataGridColumnPickerProps<C extends DataGridColumnVisibilityItem>
  extends Omit<MenuButtonProps, "menu" | "children"> {
  /** Cùng mảng cột truyền cho DataGrid; với Table là `{ columnId, label, hideable? }[]`. Tên trong menu = `label`. */
  columns: readonly C[];
  /** Id các cột đang ẩn — cùng giá trị truyền cho DataGrid. */
  hiddenColumns: ReadonlySet<string>;
  onHiddenColumnsChange: (event: React.SyntheticEvent | undefined, data: DataGridColumnVisibilityData) => void;
  /** Trạng thái sắp xếp của lưới: cột đang sắp xếp có mũi tên trong menu, kể cả khi đang ẩn. */
  sortState?: DataGridSortState;
  /** Nhãn nút. Mặc định `messages.dataGrid.columns` ("Cột"). */
  children?: React.ReactNode;
}

/** Radix đóng menu sau mỗi lần chọn — giữ mở để tích nhiều cột liền. */
const keepOpen = (event: Event) => event.preventDefault();

function DataGridColumnPickerImpl<C extends DataGridColumnVisibilityItem>(
  {
    columns,
    hiddenColumns,
    onHiddenColumnsChange,
    sortState,
    children,
    icon,
    appearance,
    size,
    align = "end",
    "aria-describedby": describedBy,
    ...props
  }: DataGridColumnPickerProps<C>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const msg = useYugenMessages("dataGrid", dataGridMessages);
  const toolbar = React.useContext(ToolbarContext);
  const countId = React.useId();
  const visibility = useDataGridColumnVisibility({ columns, hiddenColumns, onHiddenColumnsChange });
  const hiddenCount = columns.length - visibility.visibleColumns.length;

  const menu = (
    <>
      {columns.map((column) => {
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
            secondaryContent={direction && <SortIcon aria-hidden className="size-4!" />}
          >
            {label}
          </MenuItemCheckbox>
        );
      })}
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

const DataGridColumnPickerBase = React.forwardRef(DataGridColumnPickerImpl);
DataGridColumnPickerBase.displayName = "DataGridColumnPicker";

/** Nút chọn cột hiển thị — generic theo kiểu cột (suy ra từ `columns`). */
export const DataGridColumnPicker = DataGridColumnPickerBase as <C extends DataGridColumnVisibilityItem>(
  props: DataGridColumnPickerProps<C> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null;
