import * as React from "react";
import { SearchInfo24Regular } from "@fluentui/react-icons";
import { Badge, Card, Empty, EmptyDescription, EmptyHeader, EmptyMedia, Pagination, Select } from "yugen-ui";
import type { CustomerStatus, OrderStatus } from "./api";
import { useAdmin } from "./context";

/** Heading tags: h1 for the page title, h2 for sections; one level lower when embedded in another page. */
export function useHeadings() {
  const { embedded } = useAdmin();
  return embedded ? ({ H1: "h2", H2: "h3" } as const) : ({ H1: "h1", H2: "h2" } as const);
}

export function PageHeader({
  title,
  description,
  actions,
  before,
  media,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Above the title, e.g. a link back to the list. */
  before?: React.ReactNode;
  /** Beside the title, e.g. an avatar. */
  media?: React.ReactNode;
}) {
  const { H1 } = useHeadings();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {before}
        <div className="flex min-w-0 items-center gap-3">
          {media}
          <div className="min-w-0">
            <H1 className="font-display text-title2 font-semibold wrap-break-word">{title}</H1>
            {description && <p className="mt-1 text-body1 text-foreground-3">{description}</p>}
          </div>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** The card of a sign-in page: title, a line under it, the form. */
export function AuthCard({ title, lead, children }: { title: React.ReactNode; lead?: React.ReactNode; children: React.ReactNode }) {
  const { H1 } = useHeadings();
  return (
    <Card size="large" className="gap-5 p-6">
      <div>
        <H1 className="font-display text-title3 font-semibold">{title}</H1>
        {lead && <p className="mt-1 text-body1 text-foreground-3">{lead}</p>}
      </div>
      {children}
    </Card>
  );
}

/** A card with a section heading. */
export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const { H2 } = useHeadings();
  const id = React.useId();
  return (
    <Card size="large" aria-labelledby={id} role="region" className={className ?? "min-w-0"}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <H2 id={id} className="text-subtitle2 font-semibold">
            {title}
          </H2>
          {description && <p className="mt-0.5 text-caption1 text-foreground-3">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

const CUSTOMER_COLOR = { active: "success", invited: "informative", suspended: "danger" } as const;
const ORDER_COLOR = { pending: "warning", paid: "brand", shipped: "success", refunded: "informative" } as const;

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const { t } = useAdmin();
  return (
    <Badge appearance="tint" color={CUSTOMER_COLOR[status]}>
      {t.statuses[status]}
    </Badge>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useAdmin();
  return (
    <Badge appearance="tint" color={ORDER_COLOR[status]}>
      {t.orderStatuses[status]}
    </Badge>
  );
}

/** Nothing to show: says why and offers the next step. */
export function EmptyNote({ title, description, action }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Empty className="py-8">
      <EmptyHeader>
        <EmptyMedia>
          <SearchInfo24Regular />
        </EmptyMedia>
        <p className="font-display text-subtitle2 font-semibold text-foreground-1">{title}</p>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action}
    </Empty>
  );
}

/**
 * `compare` of a column sorted by the server: the column becomes sortable in DataGrid, and the rows keep the order the
 * API returned (DataGrid's sort is stable).
 */
export const serverOrder = () => 0;

const PAGE_SIZES = [10, 20, 50];

/** Under a paged list: which rows are on screen, rows per page and the page buttons. */
export function Pager({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  /** Undefined until the first page arrives. */
  total: number | undefined;
  onPageChange: (page: number) => void;
  /** Leave out to hide the rows-per-page choice. */
  onPageSizeChange?: (size: number) => void;
}) {
  const { t, format: f } = useAdmin();
  const labelId = React.useId();
  const pageCount = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const from = !total ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total ?? 0, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" className="min-h-4 text-caption1 text-foreground-3 tabular-nums">
        {total !== undefined && t.list.range(f.count(from), f.count(to), f.count(total))}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span id={labelId} className="text-caption1 whitespace-nowrap text-foreground-3">
              {t.list.rowsPerPage}
            </span>
            <Select size="small" aria-labelledby={labelId} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
        )}
        {pageCount > 1 && <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} showLabels={false} />}
      </div>
    </div>
  );
}
