import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { Table20Filled, Table20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { ToggleButton } from "../ToggleButton/ToggleButton";
import { Table, TableBody, TableHeader, TableHeaderCell, TableRow, TableCell } from "../Table/Table";
import { chartUid, patternId, slotDash, slotFill, slotVar, type ChartSlot } from "./chartUtils";

/* ================================================================== Hoa văn (texture) */

const PATTERNS: Partial<Record<string, { size: number; angle: number; width: number; kind: "line" | "cross" | "dot" }>> = {
  "2": { size: 6, angle: 45, width: 2, kind: "line" },
  "3": { size: 6, angle: 135, width: 2, kind: "line" },
  "4": { size: 8, angle: 45, width: 1.5, kind: "cross" },
  "5": { size: 4, angle: 45, width: 1.5, kind: "line" },
  "6": { size: 4, angle: 135, width: 1.5, kind: "line" },
  "7": { size: 6, angle: 45, width: 1.5, kind: "dot" },
  "8": { size: 10, angle: 45, width: 3, kind: "line" },
  pos: { size: 6, angle: 45, width: 2, kind: "line" },
  neg: { size: 6, angle: 135, width: 2, kind: "line" },
};

/** `<defs>` chứa hoa văn 45° / 135° cho các ô màu — nét cắt bằng màu bề mặt (tone-on-surface). */
export function ChartPatterns({ prefix, slots }: { prefix: string; slots: ChartSlot[] }) {
  const unique = Array.from(new Set(slots));
  return (
    <defs>
      {unique.map((slot) => {
        const id = patternId(prefix, slot);
        const spec = PATTERNS[String(slot)];
        if (!id || !spec) return null;
        const { size: s, angle, width: w, kind } = spec;
        const ink = { stroke: "var(--colorChartSurface)" };
        return (
          <pattern key={id} id={id} patternUnits="userSpaceOnUse" width={s} height={s} patternTransform={`rotate(${angle})`}>
            <rect width={s} height={s} style={{ fill: slotVar(slot) }} />
            {kind === "dot" ? (
              <circle cx={s / 2} cy={s / 2} r={w} style={{ fill: "var(--colorChartSurface)" }} />
            ) : (
              <line x1={s / 2} y1={0} x2={s / 2} y2={s} strokeWidth={w} style={ink} />
            )}
            {kind === "cross" && <line x1={0} y1={s / 2} x2={s} y2={s / 2} strokeWidth={w} style={ink} />}
          </pattern>
        );
      })}
    </defs>
  );
}

/* ================================================================== Legend */

export type ChartLegendShape = "rect" | "line";

export function ChartLegendSwatch({ slot, shape = "rect", textured = false }: { slot: ChartSlot; shape?: ChartLegendShape; textured?: boolean }) {
  const uid = chartUid(React.useId());
  if (shape === "line") {
    return (
      <svg width={20} height={8} aria-hidden className="shrink-0 overflow-visible">
        <line
          x1={1}
          y1={4}
          x2={19}
          y2={4}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={slotDash(slot, textured)}
          style={{ stroke: slotVar(slot) }}
        />
      </svg>
    );
  }
  return (
    <svg width={12} height={12} aria-hidden className="shrink-0">
      {textured && <ChartPatterns prefix={uid} slots={[slot]} />}
      <rect width={12} height={12} rx={2} style={{ fill: slotFill(slot, textured, uid) }} />
    </svg>
  );
}

export interface ChartLegendItem {
  key: string;
  label: React.ReactNode;
  slot: ChartSlot;
  /** Giá trị phụ hiển thị sau nhãn (vd. tỉ lệ của lát donut). */
  value?: React.ReactNode;
  hidden?: boolean;
  /** Thay ô màu mặc định (vd. hình marker của ScatterChart). */
  swatch?: React.ReactNode;
}

// onToggle của DOM (sự kiện <details>/popover) bị thay bằng callback bật/tắt chuỗi — React 19 có kiểu ToggleEvent riêng.
export interface ChartLegendProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "onToggle"> {
  items: ChartLegendItem[];
  /** Mirror mark: rect cho cột / vùng / donut, line cho đường. */
  shape?: ChartLegendShape;
  textured?: boolean;
  /** Có thì mỗi mục là nút bật/tắt chuỗi (aria-pressed). */
  onToggle?: (key: string) => void;
  orientation?: "horizontal" | "vertical";
}

/** Legend — luôn có khi ≥ 2 chuỗi. Chữ dùng token chữ, màu chỉ nằm ở swatch. */
export const ChartLegend = React.forwardRef<HTMLUListElement, ChartLegendProps>(
  ({ items, shape = "rect", textured = false, onToggle, orientation = "horizontal", className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(
        "flex text-caption1 text-foreground-2",
        orientation === "horizontal" ? "flex-wrap items-center gap-x-4 gap-y-1" : "flex-col gap-2",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const content = (
          <>
            {item.swatch ?? <ChartLegendSwatch slot={item.slot} shape={shape} textured={textured} />}
            <span className={cn("min-w-0", item.hidden && "text-foreground-disabled line-through")}>{item.label}</span>
            {item.value !== undefined && (
              <span className="ms-auto ps-2 font-semibold text-foreground-1 tabular-nums">
                <bdi>{item.value}</bdi>
              </span>
            )}
          </>
        );
        return (
          <li key={item.key} className="flex min-w-0 items-center">
            {onToggle ? (
              <button
                type="button"
                aria-pressed={!item.hidden}
                onClick={() => onToggle(item.key)}
                className={cn(
                  "-mx-1 inline-flex min-h-6 items-center gap-1.5 rounded-small px-1",
                  "transition-colors duration-faster hover:bg-subtle-hover hover:text-foreground-1",
                  item.hidden && "[&_svg]:opacity-40",
                )}
              >
                {content}
              </button>
            ) : (
              <span className="inline-flex w-full min-w-0 items-center gap-1.5">{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  ),
);
ChartLegend.displayName = "ChartLegend";

/* ================================================================== Tooltip */

export interface ChartTooltipRow {
  key: string;
  label: React.ReactNode;
  value: React.ReactNode;
  slot?: ChartSlot;
  /** Hình khoá khi bật texture (ô hoa văn cho cột / vùng); bình thường luôn là nét ngắn. */
  shape?: ChartLegendShape;
  /** Thay khoá màu mặc định (vd. hình marker của ScatterChart). */
  swatch?: React.ReactNode;
}

export interface ChartTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Toạ độ điểm neo (px) trong vùng vẽ (phần tử cha `relative`). */
  x: number;
  y: number;
  title?: React.ReactNode;
  rows?: ChartTooltipRow[];
  textured?: boolean;
  /**
   * auto: trên → bên cạnh → dưới, kẹp trong vùng vẽ · above: luôn phía trên, căn giữa điểm neo (sparkline) ·
   * outward: đẩy ra xa `origin` (donut — không che tâm vòng).
   */
  placement?: "auto" | "above" | "outward";
  origin?: [number, number];
}

/** Tooltip của biểu đồ: div định vị tuyệt đối trong vùng vẽ, tự lật xuống dưới / kẹp trong khung. Giá trị đậm, nhãn phụ. */
export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ x, y, title, rows, textured = false, placement = "auto", origin, className, children, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLDivElement>(null);
    const dir = useDirection();
    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLDivElement);

    React.useLayoutEffect(() => {
      const el = innerRef.current;
      const parent = el?.offsetParent as HTMLElement | null;
      if (!el || !parent) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const pw = parent.clientWidth;
      const ph = parent.clientHeight;
      const clampX = (v: number) => Math.min(Math.max(0, v), Math.max(0, pw - w));
      const clampY = (v: number) => Math.min(Math.max(-4, v), Math.max(-4, ph - h));
      // Ưu tiên phía trên điểm neo; không đủ chỗ thì đặt sang bên (không che mark), cuối cùng là phía dưới.
      let left: number;
      let top: number;
      if (placement === "above") {
        left = x - w / 2;
        top = y - h - 12;
      } else if (placement === "outward" && origin) {
        const ux = x - origin[0];
        const uy = y - origin[1];
        left = clampX(Math.abs(ux) < w / 4 ? x - w / 2 : ux >= 0 ? x + 12 : x - 12 - w);
        // Không kẹp dọc: được phép tràn lên tiêu đề / xuống dưới thay vì đè lên tâm vòng.
        top = Math.abs(uy) < h / 4 ? clampY(y - h / 2) : uy >= 0 ? y + 12 : y - 12 - h;
      } else if (y - h - 12 >= -4) {
        left = clampX(x - w / 2);
        top = y - h - 12;
      } else if (x + 16 + w <= pw) {
        left = x + 16;
        top = clampY(y - h / 2);
      } else if (x - 16 - w >= 0) {
        left = x - 16 - w;
        top = clampY(y - h / 2);
      } else {
        left = clampX(x - w / 2);
        top = y + 12;
      }
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.visibility = "visible";
    });

    return (
      <div
        ref={innerRef}
        aria-hidden
        dir={dir}
        className={cn(
          "pointer-events-none invisible absolute w-max max-w-64 min-w-32 rounded-medium border border-stroke-2 bg-background-1 px-3 py-2 shadow-8",
          "text-caption1 text-foreground-2",
          className,
        )}
        {...props}
      >
        {title !== undefined && <div className="mb-1 font-semibold text-foreground-1">{title}</div>}
        {rows && rows.length > 0 && (
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0.5">
            {rows.map((row) => (
              <React.Fragment key={row.key}>
                {row.swatch ? (
                  row.swatch
                ) : row.slot !== undefined ? (
                  // Khoá bằng nét ngắn (không phải ô đặc); chỉ khi có hoa văn mới cần ô để thấy hoa văn.
                  <ChartLegendSwatch slot={row.slot} shape={textured ? (row.shape ?? "line") : "line"} textured={textured} />
                ) : (
                  <span />
                )}
                <span className="min-w-0 truncate">{row.label}</span>
                <span className="text-end font-semibold text-foreground-1 tabular-nums">
                  <bdi>{row.value}</bdi>
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        {children}
      </div>
    );
  },
);
ChartTooltip.displayName = "ChartTooltip";

/* ================================================================== Bảng dữ liệu */

export interface ChartTableProps extends React.HTMLAttributes<HTMLDivElement> {
  caption?: React.ReactNode;
  columns: { key: string; label: React.ReactNode; numeric?: boolean }[];
  rows: { key: string; header: React.ReactNode; cells: React.ReactNode[] }[];
}

/** Bảng tương đương của biểu đồ (WCAG) — cột đầu là tiêu đề hàng. */
export const ChartTable = React.forwardRef<HTMLDivElement, ChartTableProps>(({ caption, columns, rows, className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full overflow-x-auto", className)} {...props}>
    <Table size="small" className="table-auto">
      {caption && <caption className="sr-only">{caption}</caption>}
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHeaderCell key={c.key} className={cn("text-caption1 whitespace-nowrap text-foreground-2", c.numeric && "text-end")}>
              {c.label}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.key}>
            <th scope="row" className="px-2 text-start align-middle font-normal whitespace-nowrap text-foreground-1">
              {r.header}
            </th>
            {r.cells.map((cell, i) => (
              <TableCell key={i} className="text-end whitespace-nowrap tabular-nums">
                <bdi>{cell}</bdi>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
));
ChartTable.displayName = "ChartTable";

/* ================================================================== Khung biểu đồ */

export interface ChartContainerProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Thao tác thêm trên thanh công cụ. */
  toolbar?: React.ReactNode;
  /** Legend — hiển thị phía trên vùng vẽ, theo hướng chữ của trang. */
  legend?: React.ReactNode;
  /**
   * Nội dung chế độ bảng (thường là ChartTable). Có thì hiện nút "Bảng dữ liệu". Truyền hàm để chỉ dựng bảng khi đang bật.
   */
  table?: React.ReactNode | (() => React.ReactNode);
  showTable?: boolean;
  defaultShowTable?: boolean;
  onShowTableChange?: (showTable: boolean) => void;
  hideTableToggle?: boolean;
}

/** Khung chung: tiêu đề, mô tả, thanh công cụ có nút "Bảng dữ liệu", legend và vùng vẽ. */
export const ChartContainer = React.forwardRef<HTMLElement, ChartContainerProps>(
  (
    {
      title,
      description,
      toolbar,
      legend,
      table,
      showTable,
      defaultShowTable = false,
      onShowTableChange,
      hideTableToggle = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const id = chartUid(React.useId());
    const [innerTable, setInnerTable] = React.useState(defaultShowTable);
    const tableOn = !!table && (showTable ?? innerTable);
    const hasToggle = !!table && !hideTableToggle;
    const hasHeader = title !== undefined || description !== undefined || toolbar !== undefined || hasToggle;

    const setTable = (next: boolean) => {
      if (showTable === undefined) setInnerTable(next);
      onShowTableChange?.(next);
    };

    return (
      <figure
        ref={ref}
        aria-labelledby={title !== undefined ? `${id}-title` : undefined}
        aria-describedby={description !== undefined ? `${id}-desc` : undefined}
        className={cn("flex w-full min-w-0 flex-col gap-3", className)}
        {...props}
      >
        {hasHeader && (
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {title !== undefined && (
                <div id={`${id}-title`} className="text-subtitle2 font-semibold text-foreground-1">
                  {title}
                </div>
              )}
              {description !== undefined && (
                <div id={`${id}-desc`} className="mt-0.5 text-caption1 text-foreground-3">
                  {description}
                </div>
              )}
            </div>
            {(toolbar !== undefined || hasToggle) && (
              <div className="flex shrink-0 items-center gap-1">
                {toolbar}
                {hasToggle && (
                  <ToggleButton
                    size="small"
                    appearance="subtle"
                    icon={<Table20Regular />}
                    checkedIcon={<Table20Filled />}
                    checked={tableOn}
                    onCheckedChange={setTable}
                  >
                    Bảng dữ liệu
                  </ToggleButton>
                )}
              </div>
            )}
          </div>
        )}
        {tableOn ? (
          typeof table === "function" ? table() : table
        ) : (
          <>
            {legend}
            {children}
          </>
        )}
      </figure>
    );
  },
);
ChartContainer.displayName = "ChartContainer";

/* ================================================================== Vòng focus cho mark */

/** Vòng focus 2px (stroke-focus) quanh mark đang được chọn bằng bàn phím — thay cho outline của trình duyệt. */
export function ChartFocusRing({ x, y, width, height, radius = 4 }: { x: number; y: number; width: number; height: number; radius?: number }) {
  return (
    <rect
      x={x - 3}
      y={y - 3}
      width={Math.max(0, width + 6)}
      height={Math.max(0, height + 6)}
      rx={radius + 2}
      fill="none"
      strokeWidth={2}
      pointerEvents="none"
      style={{ stroke: "var(--colorStrokeFocus2)" }}
    />
  );
}
