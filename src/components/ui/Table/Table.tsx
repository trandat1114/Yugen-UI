import * as React from "react";
import { ArrowSortDown20Regular, ArrowSortUp20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Checkbox } from "../Checkbox/Checkbox";

/** Fluent 2 Table — https://fluent2.microsoft.design/components/web/react/core/table/usage */
export type TableSize = "extra-small" | "small" | "medium";
export type TableSortDirection = "ascending" | "descending";

interface TableContextValue {
  size: TableSize;
  sortable: boolean;
}

const TableContext = React.createContext<TableContextValue>({ size: "medium", sortable: false });
/** true khi đang nằm trong TableHeader (cell render thành `th`, hàng không có hover). */
const TableHeaderContext = React.createContext(false);

/** Chiều cao hàng 24 / 34 / 44px. */
const ROW_HEIGHT: Record<TableSize, string> = {
  "extra-small": "h-6",
  small: "h-8.5",
  medium: "h-11",
};

const TEXT: Record<TableSize, string> = {
  "extra-small": "text-caption1",
  small: "text-body1",
  medium: "text-body1",
};

/* ------------------------------------------------------------------ Table */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  size?: TableSize;
  /** Mọi TableHeaderCell thành nút sắp xếp (có thể tắt riêng từng cột bằng `sortable={false}`). */
  sortable?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ size = "medium", sortable = false, className, ...props }, ref) => {
    const context = React.useMemo(() => ({ size, sortable }), [size, sortable]);
    return (
      <TableContext.Provider value={context}>
        <table
          ref={ref}
          className={cn("w-full table-fixed border-collapse text-start align-middle text-foreground-1", TEXT[size], className)}
          {...props}
        />
      </TableContext.Provider>
    );
  },
);
Table.displayName = "Table";

/* ------------------------------------------------------------------ Sections */
export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <TableHeaderContext.Provider value>
      <thead ref={ref} className={className} {...props} />
    </TableHeaderContext.Provider>
  ),
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={className} {...props} />,
);
TableBody.displayName = "TableBody";

/* ------------------------------------------------------------------ TableRow */
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** none: hover subtle · neutral: nền xám (đang thao tác) · brand: tint brand (đang chọn). */
  appearance?: "none" | "neutral" | "brand";
  /** Hàng đang được chọn — tương đương appearance="brand". */
  selected?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ appearance, selected = false, className, ...props }, ref) => {
    const { size } = React.useContext(TableContext);
    const inHeader = React.useContext(TableHeaderContext);
    const look = appearance ?? (selected ? "brand" : "none");
    return (
      <tr
        ref={ref}
        data-selected={selected || undefined}
        className={cn(
          "group/row",
          ROW_HEIGHT[size],
          inHeader
            ? "border-b border-stroke-2"
            : [
                "border-b border-stroke-3 transition-colors duration-faster ease-easy-ease",
                look === "none" && "hover:bg-subtle-hover active:bg-subtle-pressed",
                look === "neutral" && "bg-subtle-pressed",
                look === "brand" && "bg-brand-background-2 hover:bg-brand-background-2-hover",
              ],
          className,
        )}
        {...props}
      />
    );
  },
);
TableRow.displayName = "TableRow";

/* ------------------------------------------------------------------ TableHeaderCell */
export interface TableHeaderCellProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "onClick"> {
  /** Ghi đè `sortable` của Table cho riêng cột này. */
  sortable?: boolean;
  /** Hướng đang sắp xếp; để trống = chưa sắp xếp theo cột này. */
  sortDirection?: TableSortDirection;
  /** Với cột sortable, gắn vào nút bên trong (bấm hoặc Enter/Space). */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ sortable, sortDirection, onClick, className, children, ...props }, ref) => {
    const ctx = React.useContext(TableContext);
    const isSortable = sortable ?? ctx.sortable;
    const SortIcon = sortDirection === "ascending" ? ArrowSortUp20Regular : ArrowSortDown20Regular;

    if (!isSortable) {
      return (
        <th
          ref={ref}
          scope="col"
          onClick={onClick}
          className={cn("relative px-S text-start align-middle font-semibold text-foreground-1", className)}
          {...props}
        >
          {children}
        </th>
      );
    }

    return (
      <th
        ref={ref}
        scope="col"
        aria-sort={sortDirection ?? "none"}
        className={cn(
          "relative p-0 text-start align-middle font-semibold text-foreground-1",
          "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover active:bg-subtle-pressed",
          className,
        )}
        {...props}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex w-full cursor-pointer items-center gap-XS px-S py-XXS text-start font-semibold"
        >
          <span className="min-w-0 truncate">{children}</span>
          {sortDirection && (
            <SortIcon aria-hidden className={cn("shrink-0 text-foreground-2", ctx.size === "extra-small" ? "size-4" : "size-5")} />
          )}
        </button>
      </th>
    );
  },
);
TableHeaderCell.displayName = "TableHeaderCell";

/* ------------------------------------------------------------------ TableCell */
export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("relative px-S align-middle", className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

/* ------------------------------------------------------------------ TableCellLayout */
export interface TableCellLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatar / icon trước nội dung chính. */
  media?: React.ReactNode;
  /** Dòng phụ dưới nội dung chính. */
  description?: React.ReactNode;
  /** primary: nội dung chính in đậm. */
  appearance?: "primary";
  /** Cắt chữ dài bằng "…". */
  truncate?: boolean;
}

export const TableCellLayout = React.forwardRef<HTMLDivElement, TableCellLayoutProps>(
  ({ media, description, appearance, truncate = false, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex min-w-0 items-center gap-S", className)} {...props}>
      {media && <span className="flex shrink-0 items-center text-foreground-2">{media}</span>}
      <div className="flex min-w-0 flex-col">
        <span className={cn(appearance === "primary" && "font-semibold", truncate && "truncate")}>{children}</span>
        {description && (
          <span className={cn("text-caption1 text-foreground-2", truncate && "truncate")}>{description}</span>
        )}
      </div>
    </div>
  ),
);
TableCellLayout.displayName = "TableCellLayout";

/* ------------------------------------------------------------------ TableCellActions */
/** Nhóm nút chỉ hiện khi hover / focus vào hàng (đặt trong TableCell). */
export const TableCellActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute inset-e-S top-1/2 flex -translate-y-1/2 items-center gap-XS opacity-0",
        "transition-opacity duration-faster ease-easy-ease group-hover/row:opacity-100 focus-within:opacity-100",
        className,
      )}
      {...props}
    />
  ),
);
TableCellActions.displayName = "TableCellActions";

/* ------------------------------------------------------------------ TableSelectionCell */
export interface TableSelectionCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "onChange"> {
  checked?: boolean | "mixed";
  onCheckedChange?: (checked: boolean) => void;
  /** Chỉ hiện checkbox khi hover hàng hoặc khi đã chọn. */
  subtle?: boolean;
  disabled?: boolean;
}

export const TableSelectionCell = React.forwardRef<HTMLTableCellElement, TableSelectionCellProps>(
  ({ checked = false, onCheckedChange, subtle = false, disabled, className, "aria-label": ariaLabel, ...props }, ref) => {
    const inHeader = React.useContext(TableHeaderContext);
    const Cell = (inHeader ? "th" : "td") as "td";
    return (
      <Cell
        ref={ref}
        className={cn(
          "w-11 px-0 text-center align-middle [&>span]:py-0",
          subtle && !checked && "opacity-0 transition-opacity duration-faster group-hover/row:opacity-100 focus-within:opacity-100",
          className,
        )}
        {...props}
      >
        <Checkbox
          checked={checked === "mixed" ? "indeterminate" : checked}
          onCheckedChange={(value) => onCheckedChange?.(value === true)}
          disabled={disabled}
          aria-label={ariaLabel ?? (inHeader ? "Chọn tất cả hàng" : "Chọn hàng")}
        />
      </Cell>
    );
  },
);
TableSelectionCell.displayName = "TableSelectionCell";
