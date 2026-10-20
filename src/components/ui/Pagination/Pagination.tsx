import * as React from "react";
import {
  ChevronLeft16Regular,
  ChevronLeft20Regular,
  ChevronRight16Regular,
  ChevronRight20Regular,
  MoreHorizontal16Regular,
  MoreHorizontal20Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

/** Pagination (shadcn/ui, giao diện Fluent 2) — https://ui.shadcn.com/docs/components/pagination */
type PaginationSize = "small" | "medium";
type PageEntry = number | "ellipsis-start" | "ellipsis-end";

/** Tính dãy trang hiển thị: luôn có trang đầu/cuối, `siblingCount` trang hai bên trang hiện tại, còn lại là "…". */
function getPageRange(page: number, pageCount: number, siblingCount: number): PageEntry[] {
  const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  const totalSlots = siblingCount * 2 + 5;
  if (pageCount <= totalSlots) return range(1, pageCount);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showStartDots = left > 3;
  const showEndDots = right < pageCount - 2;
  const edgeCount = 3 + siblingCount * 2;

  if (!showStartDots && showEndDots) return [...range(1, edgeCount), "ellipsis-end", pageCount];
  if (showStartDots && !showEndDots) return [1, "ellipsis-start", ...range(pageCount - edgeCount + 1, pageCount)];
  return [1, "ellipsis-start", ...range(left, right), "ellipsis-end", pageCount];
}

const SIZE: Record<PaginationSize, { item: string; nav: string }> = {
  small: { item: "h-6 min-w-6 rounded-small px-XS text-caption1", nav: "h-6 gap-XXS rounded-small px-XS text-caption1 [&_svg]:size-4" },
  medium: { item: "h-8 min-w-8 rounded-medium px-XS text-body1", nav: "h-8 gap-XS rounded-medium px-S text-body1 [&_svg]:size-5" },
};

const interactive = cn(
  "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap text-foreground-2 tabular-nums select-none",
  "transition-colors duration-faster ease-easy-ease [&_svg]:shrink-0",
  "hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
  "disabled:pointer-events-none disabled:text-foreground-disabled",
);

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Trang hiện tại (bắt đầu từ 1) — controlled. */
  page?: number;
  defaultPage?: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  /** Số trang hiển thị mỗi bên trang hiện tại. */
  siblingCount?: number;
  size?: PaginationSize;
  /** Hiện chữ "Trước" / "Sau" cạnh mũi tên. */
  showLabels?: boolean;
  disabled?: boolean;
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      page,
      defaultPage = 1,
      pageCount,
      onPageChange,
      siblingCount = 1,
      size = "medium",
      showLabels = true,
      disabled,
      "aria-label": ariaLabel = "Phân trang",
      ...props
    },
    ref,
  ) => {
    const [innerPage, setInnerPage] = React.useState(defaultPage);
    const current = Math.min(Math.max(page ?? innerPage, 1), Math.max(pageCount, 1));
    const s = SIZE[size];

    const go = (next: number) => {
      const clamped = Math.min(Math.max(next, 1), pageCount);
      if (clamped === current) return;
      if (page === undefined) setInnerPage(clamped);
      onPageChange?.(clamped);
    };

    const PrevIcon = size === "small" ? ChevronLeft16Regular : ChevronLeft20Regular;
    const NextIcon = size === "small" ? ChevronRight16Regular : ChevronRight20Regular;
    const MoreIcon = size === "small" ? MoreHorizontal16Regular : MoreHorizontal20Regular;

    return (
      <nav ref={ref} aria-label={ariaLabel} className={cn("flex", className)} {...props}>
        <ul className="flex flex-wrap items-center gap-XS">
          <li>
            <button
              type="button"
              aria-label="Trang trước"
              disabled={disabled || current <= 1}
              onClick={() => go(current - 1)}
              className={cn(interactive, s.nav, !showLabels && cn(s.item, "px-0"))}
            >
              <PrevIcon className="rtl:-scale-x-100" />
              {showLabels && <span>Trước</span>}
            </button>
          </li>

          {getPageRange(current, pageCount, siblingCount).map((entry) =>
            typeof entry === "number" ? (
              <li key={entry}>
                <button
                  type="button"
                  aria-label={`Trang ${entry}`}
                  aria-current={entry === current ? "page" : undefined}
                  disabled={disabled}
                  onClick={() => go(entry)}
                  className={cn(
                    interactive,
                    s.item,
                    entry === current &&
                      "bg-brand-background-2 font-semibold text-brand-foreground-2 hover:bg-brand-background-2-hover hover:text-brand-foreground-2 active:bg-brand-background-2-pressed",
                  )}
                >
                  {entry}
                </button>
              </li>
            ) : (
              <li key={entry} aria-hidden className={cn("inline-flex items-center justify-center text-foreground-3", s.item, "[&_svg]:size-4")}>
                <MoreIcon />
              </li>
            ),
          )}

          <li>
            <button
              type="button"
              aria-label="Trang sau"
              disabled={disabled || current >= pageCount}
              onClick={() => go(current + 1)}
              className={cn(interactive, s.nav, !showLabels && cn(s.item, "px-0"))}
            >
              {showLabels && <span>Sau</span>}
              <NextIcon className="rtl:-scale-x-100" />
            </button>
          </li>
        </ul>
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";
