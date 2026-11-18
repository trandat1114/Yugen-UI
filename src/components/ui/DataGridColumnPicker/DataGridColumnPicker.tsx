import * as React from "react";
import {
  ArrowSortDown20Regular,
  ArrowSortUp20Regular,
  ChevronDown20Regular,
  ColumnTriple20Regular,
  Dismiss20Regular,
  LockClosed16Regular,
  ReOrderDotsVertical16Regular,
} from "../_internal/icons";
import { cn } from "@/lib/cn";
import { minWidthQuery } from "../_internal/breakpoint";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { CounterBadge } from "../CounterBadge/CounterBadge";
import { dataGridMessagesEn } from "../DataGrid/messages";
import {
  getOrderedColumns,
  getVisibleColumns,
  useDataGridColumnVisibility,
  type DataGridColumnOrderData,
  type DataGridColumnVisibilityData,
  type DataGridColumnVisibilityItem,
  type DataGridSortState,
} from "../DataGrid/useDataGrid";
import { useControllableState } from "../hooks/useControllableState";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { MenuDivider, MenuItem, MenuItemCheckbox } from "../Menu/Menu";
import { MenuButton, type MenuButtonProps } from "../MenuButton/MenuButton";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetBreakpoint,
} from "../Sheet/Sheet";
import { Sortable, SortableHandle, SortableItem } from "../Sortable/Sortable";
import { ToolbarContext } from "../Toolbar/context";
import { useYugenMessages } from "../YugenProvider/context";

/**
 * Nút "Cột" mở danh sách cột để người dùng chọn cột hiển thị. Đặt trên toolbar của DataGrid (hoặc Table) và dùng chung
 * `hiddenColumns` với lưới. Menu không đóng khi tích từng cột; cột `hideable: false` (luôn hiện, có mô tả cho trình đọc
 * màn hình) và cột hiện cuối cùng bị khoá. Nằm trong Toolbar thì tự thành mục của Toolbar (phím mũi tên, size, appearance
 * subtle). Có `onColumnOrderChange` thì kéo mục (hoặc Alt + ↑ ↓) để đổi thứ tự cột.
 *
 * Bảng dày đặc (#413): `compact` chỉ còn icon và số cột đang ẩn; `mode="auto"` đổi menu thành Sheet khi màn hình hẹp hơn
 * `breakpoint`; `resettable` thêm mục đặt lại cột về mặc định.
 */

/** menu: luôn là menu · auto: menu khi rộng ≥ breakpoint, bottom sheet khi hẹp hơn · sheet: luôn là Sheet. */
export type DataGridColumnPickerMode = "menu" | "auto" | "sheet";

/** Trạng thái mà mục đặt lại trả về. Bỏ trống: mọi cột hiện, theo thứ tự `columns`. */
export interface DataGridColumnPickerReset {
  hiddenColumns?: Iterable<string>;
  columnOrder?: readonly string[];
}

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
  /** Nút chỉ có icon và số cột đang ẩn; nhãn vẫn là tên của nút. */
  compact?: boolean;
  /** Mặc định "menu". "auto": bottom sheet khi màn hình hẹp hơn `breakpoint`; "sheet": luôn là Sheet. */
  mode?: DataGridColumnPickerMode;
  /** Độ rộng viewport tối thiểu cho menu (và cho dạng panel của Sheet), cùng token với Sheet. Mặc định "3xl" (48rem). */
  breakpoint?: SheetBreakpoint;
  /** Thêm mục "Đặt lại cột": `true` = mọi cột hiện, theo thứ tự `columns`; hoặc trạng thái mặc định của bảng. */
  resettable?: boolean | DataGridColumnPickerReset;
}

/** Radix đóng menu sau mỗi lần chọn — giữ mở để tích nhiều cột liền. */
const keepOpen = (event: Event) => event.preventDefault();

/** Padding của nút chỉ có icon, như MenuButton không nhãn. */
const COMPACT_PADDING = { small: "px-1", medium: "px-1.5", large: "px-2" } as const;

const NO_RESET: DataGridColumnPickerReset = {};

const sameIds = (a: readonly { columnId: string }[], b: readonly { columnId: string }[]) =>
  a.length === b.length && a.every((c, i) => c.columnId === b[i].columnId);

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
  compact = false,
  mode = "menu",
  breakpoint = "3xl",
  resettable,
  open: openProp,
  defaultOpen,
  onOpenChange,
  menuIcon,
  className,
  "aria-describedby": describedBy,
  ref,
  ...props
}: DataGridColumnPickerProps<C> & { ref?: React.Ref<HTMLButtonElement> }) {
  const msg = useYugenMessages("dataGrid", dataGridMessagesEn);
  const toolbar = React.useContext(ToolbarContext);
  const countId = React.useId();
  const requiredId = React.useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange });
  const wide = useMediaQuery(minWidthQuery(breakpoint), { defaultValue: true });
  const asSheet = mode === "sheet" || (mode === "auto" && !wide);

  const ordered = getOrderedColumns(columns, columnOrder);
  const visibility = useDataGridColumnVisibility({ columns: ordered, hiddenColumns, onHiddenColumnsChange });
  const hiddenCount = columns.length - visibility.visibleColumns.length;
  const label = children ?? msg.columns;
  // Tên của nhóm cột và tiêu đề Sheet: nhãn nút nếu là chữ.
  const groupLabel = typeof children === "string" ? children : msg.columns;

  const reset = resettable ? (resettable === true ? NO_RESET : resettable) : undefined;
  const resetHidden = new Set(reset?.hiddenColumns ?? []);
  const hiddenAtDefault = sameIds(visibility.visibleColumns, getVisibleColumns(ordered, resetHidden));
  const orderAtDefault = !onColumnOrderChange || sameIds(ordered, getOrderedColumns(columns, reset?.columnOrder));
  const resetColumns = (event: React.SyntheticEvent | undefined) => {
    if (!hiddenAtDefault) onHiddenColumnsChange(event, { hiddenColumns: resetHidden });
    if (!orderAtDefault) onColumnOrderChange?.(event, { columnOrder: [...(reset?.columnOrder ?? [])] });
  };

  const sortOf = (column: C) => (sortState?.sortColumn === column.columnId ? sortState.sortDirection : undefined);
  const textOf = (column: C) => column.label ?? column.columnId;
  // Tên ghép rõ ràng: trình duyệt không chắc chèn khoảng trắng giữa chữ và phần đọc riêng cho trình đọc màn hình.
  const nameOf = (column: C) => {
    const direction = sortOf(column);
    return direction && `${textOf(column)} ${direction === "ascending" ? msg.sortAscending : msg.sortDescending}`;
  };
  const sortIcon = (column: C) => {
    const direction = sortOf(column);
    if (!direction) return null;
    const SortIcon = direction === "ascending" ? ArrowSortUp20Regular : ArrowSortDown20Regular;
    return <SortIcon aria-hidden className="size-4! shrink-0" />;
  };

  /* ---------------------------------------------------------------- menu */
  const menuItem = (column: C) => {
    const required = column.hideable === false;
    return (
      <MenuItemCheckbox
        key={column.columnId}
        checked={visibility.isColumnVisible(column.columnId)}
        // Cột bắt buộc vẫn nhận focus (aria-disabled) để bàn phím và trình đọc màn hình nghe được lý do.
        disabled={!required && !visibility.canToggleColumn(column.columnId)}
        aria-disabled={required || undefined}
        aria-describedby={required ? requiredId : undefined}
        onSelect={keepOpen}
        onClick={(event) => visibility.toggleColumn(event, column.columnId)}
        aria-label={nameOf(column)}
        className={cn(required && "cursor-default text-foreground-disabled data-highlighted:text-foreground-disabled")}
        icon={onColumnOrderChange && <ReOrderDotsVertical16Regular aria-hidden className="size-4! shrink-0 text-foreground-3" />}
        secondaryContent={
          (required || sortOf(column)) && (
            <>
              {sortIcon(column)}
              {required && <LockClosed16Regular aria-hidden className="size-4!" />}
            </>
          )
        }
      >
        {textOf(column)}
      </MenuItemCheckbox>
    );
  };

  const menu = (
    <>
      {onColumnOrderChange ? (
        // Cả mục là tay nắm (Space đã dùng để tích cột); bàn phím: Alt + ↑ ↓.
        <Sortable
          role="group"
          aria-label={groupLabel}
          value={ordered.map((c) => c.columnId)}
          onValueChange={(order) => onColumnOrderChange(undefined, { columnOrder: order })}
        >
          {ordered.map((column) => (
            <SortableItem key={column.columnId} value={column.columnId} label={textOf(column)} asChild handle shortcuts>
              {menuItem(column)}
            </SortableItem>
          ))}
        </Sortable>
      ) : (
        ordered.map(menuItem)
      )}
      <MenuDivider />
      <MenuItem disabled={hiddenCount === 0} onSelect={keepOpen} onClick={visibility.showAllColumns}>
        {msg.showAllColumns}
      </MenuItem>
      {reset && (
        <MenuItem disabled={hiddenAtDefault && orderAtDefault} onSelect={keepOpen} onClick={resetColumns}>
          {msg.resetColumns}
        </MenuItem>
      )}
      <span id={requiredId} hidden>
        {msg.requiredColumn}
      </span>
    </>
  );

  /* ---------------------------------------------------------------- nút */
  const resolvedSize = size ?? toolbar?.size;
  const triggerProps = {
    ref,
    icon: icon ?? <ColumnTriple20Regular />,
    appearance: appearance ?? (toolbar ? "subtle" : "secondary"),
    size: resolvedSize,
    "data-toolbar-item": toolbar ? "" : undefined,
    // Tên nút giữ nguyên ("Cột") cho điều khiển bằng giọng nói; số cột đang ẩn là mô tả.
    "aria-describedby": [describedBy, hiddenCount > 0 ? countId : undefined].filter(Boolean).join(" ") || undefined,
    ...props,
  } as const;
  const compactClass = compact && cn("min-w-0", COMPACT_PADDING[resolvedSize ?? "medium"]);
  const triggerContent = (
    <>
      {compact ? <span className="sr-only">{label}</span> : label}
      {hiddenCount > 0 && (
        <>
          <CounterBadge aria-hidden count={hiddenCount} size="small" />
          <span id={countId} hidden>
            {msg.hiddenColumns(hiddenCount)}
          </span>
        </>
      )}
    </>
  );

  if (!asSheet) {
    return (
      <MenuButton
        {...triggerProps}
        className={cn(compactClass, className)}
        open={open}
        onOpenChange={setOpen}
        menu={menu}
        align={align}
        menuIcon={menuIcon}
      >
        {triggerContent}
      </MenuButton>
    );
  }

  /* ---------------------------------------------------------------- sheet */
  // Hàng cao 44px cho ngón tay. Đổi thứ tự bằng tay nắm: kéo, hoặc Space / Enter rồi ↑ ↓ (focus ở lại tay nắm).
  const sheetRow = (column: C, reorderable: boolean) => {
    const required = column.hideable === false;
    const rowRequiredId = `${requiredId}-${column.columnId}`;
    return (
      <div className="flex min-h-11 min-w-0 items-center gap-2 border-b border-stroke-3">
        {reorderable && <SortableHandle />}
        <div className="flex min-w-0 flex-1 items-center">
          <Checkbox
            label={<span className="wrap-break-word">{textOf(column)}</span>}
            checked={visibility.isColumnVisible(column.columnId)}
            disabled={!visibility.canToggleColumn(column.columnId)}
            onChange={(event) => visibility.toggleColumn(event, column.columnId)}
            aria-label={nameOf(column)}
            aria-describedby={required ? rowRequiredId : undefined}
          />
        </div>
        {sortIcon(column)}
        {required && (
          <span id={rowRequiredId} className="flex shrink-0 items-center gap-1 text-caption1 text-foreground-3">
            <LockClosed16Regular aria-hidden className="size-4" />
            {msg.requiredColumn}
          </span>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} breakpoint={breakpoint} snapPoints={[0.85]}>
      <SheetTrigger asChild>
        <Button {...triggerProps} className={cn("group/menubutton", compactClass, className)}>
          {triggerContent}
          <span
            aria-hidden="true"
            className="inline-flex transition-transform duration-normal ease-easy-ease motion-reduce:transition-none group-data-[state=open]/menubutton:rotate-180"
          >
            {menuIcon ?? <ChevronDown20Regular />}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader
          action={
            <SheetClose asChild>
              <Button appearance="subtle" icon={<Dismiss20Regular />} aria-label={msg.close} />
            </SheetClose>
          }
        >
          <SheetTitle>{groupLabel}</SheetTitle>
        </SheetHeader>
        <SheetBody>
          {onColumnOrderChange ? (
            <Sortable
              role="group"
              aria-label={groupLabel}
              value={ordered.map((c) => c.columnId)}
              onValueChange={(order) => onColumnOrderChange(undefined, { columnOrder: order })}
            >
              {ordered.map((column) => (
                <SortableItem key={column.columnId} value={column.columnId} label={textOf(column)}>
                  {sheetRow(column, true)}
                </SortableItem>
              ))}
            </Sortable>
          ) : (
            <div role="group" aria-label={groupLabel}>
              {ordered.map((column) => (
                <React.Fragment key={column.columnId}>{sheetRow(column, false)}</React.Fragment>
              ))}
            </div>
          )}
        </SheetBody>
        <SheetFooter>
          <Button disabled={hiddenCount === 0} onClick={visibility.showAllColumns}>
            {msg.showAllColumns}
          </Button>
          {reset && (
            <Button disabled={hiddenAtDefault && orderAtDefault} onClick={resetColumns}>
              {msg.resetColumns}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
