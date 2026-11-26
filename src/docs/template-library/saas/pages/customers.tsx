import { useMemo, useState } from "react";
import { DocumentSearch24Regular } from "@fluentui/react-icons";
import {
  Badge,
  Button,
  createColumn,
  DataGrid,
  DataGridColumnPicker,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  SearchBox,
  useMediaQuery,
  type DataGridColumn,
} from "@/components/ui";
import type { Content, Customer } from "../content/types";
import { money } from "../format";
import type { PageProps } from "../pages";

/**
 * Customer directory: a data page with `layout: { width: "fluid", density: "compact" }` in pages.tsx. The grid takes the
 * full width and the remaining height, scrolls inside its own box and keeps the name column pinned.
 */

const TIER_COLOR = { gold: "warning", silver: "informative", bronze: "subtle" } as const;

/** The table's default view: "Reset columns" brings it back. */
const DEFAULT_VIEW = { hiddenColumns: ["phone", "updated"] };

/** Lowercase without accents, so "da nang" finds "Đà Nẵng". */
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");

function columnsFor(t: Content, narrow: boolean): DataGridColumn<Customer>[] {
  const c = t.customers.columns;
  const count = new Intl.NumberFormat(t.locale);
  const date = new Intl.DateTimeFormat(t.locale, { dateStyle: "short", timeZone: "UTC" });
  // Empty cell: a dash on screen, words for screen readers.
  const none = (
    <>
      <span aria-hidden className="text-foreground-3">
        —
      </span>
      <span className="sr-only">{t.customers.none}</span>
    </>
  );
  // Long text wraps instead of being cut with "…": nothing is only visible in a tooltip.
  const wrap = (text: string, className = "") => <span className={`min-w-0 py-1 wrap-break-word ${className}`}>{text}</span>;

  return [
    createColumn<Customer>({
      columnId: "name",
      label: c.name,
      renderCell: (x) => wrap(x.name, "font-semibold"),
      compare: (a, b) => a.name.localeCompare(b.name, t.locale),
      // Pinned on wide screens; on phones a pinned 240px column would leave no room to scroll.
      width: narrow ? 176 : 240,
      sticky: narrow ? undefined : "start",
      hideable: false,
    }),
    createColumn<Customer>({ columnId: "code", label: c.code, renderCell: (x) => x.id, compare: (a, b) => a.id.localeCompare(b.id), width: 120 }),
    createColumn<Customer>({
      columnId: "email",
      label: c.email,
      renderCell: (x) => (x.email ? wrap(x.email, "wrap-anywhere") : none),
      minWidth: 220,
    }),
    createColumn<Customer>({
      columnId: "phone",
      label: c.phone,
      renderCell: (x) => (x.phone ? <span className="whitespace-nowrap">{x.phone}</span> : none),
      width: 144,
    }),
    createColumn<Customer>({ columnId: "address", label: c.address, renderCell: (x) => wrap(x.address), minWidth: 280 }),
    createColumn<Customer>({
      columnId: "city",
      label: c.city,
      renderCell: (x) => wrap(x.city),
      compare: (a, b) => a.city.localeCompare(b.city, t.locale),
      width: 160,
    }),
    createColumn<Customer>({
      columnId: "tier",
      label: c.tier,
      renderCell: (x) => (
        <Badge appearance="tint" color={TIER_COLOR[x.tier]}>
          {t.customers.tiers[x.tier]}
        </Badge>
      ),
      width: 112,
    }),
    createColumn<Customer>({
      columnId: "orders",
      label: c.orders,
      renderCell: (x) => count.format(x.orders),
      compare: (a, b) => a.orders - b.orders,
      width: 104,
      align: "end",
    }),
    createColumn<Customer>({
      columnId: "balance",
      label: c.balance,
      renderCell: (x) => money(t, x.balance),
      compare: (a, b) => a.balance - b.balance,
      width: 168,
      align: "end",
    }),
    createColumn<Customer>({
      columnId: "updated",
      label: c.updated,
      renderCell: (x) => date.format(new Date(x.updated)),
      compare: (a, b) => a.updated.localeCompare(b.updated),
      width: 120,
    }),
  ];
}

export default function CustomersPage({ t }: PageProps) {
  const c = t.customers;
  const narrow = !useMediaQuery("(min-width: 40rem)", { defaultValue: true });
  const columns = useMemo(() => columnsFor(t, narrow), [t, narrow]);
  const [query, setQuery] = useState("");
  const [hiddenColumns, setHiddenColumns] = useState<ReadonlySet<string>>(() => new Set(DEFAULT_VIEW.hiddenColumns));
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  const items = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return c.items;
    return c.items.filter((x) => [x.name, x.id, x.email ?? "", x.city].some((value) => fold(value).includes(q)));
  }, [c.items, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SearchBox aria-label={c.search} placeholder={c.search} value={query} onValueChange={setQuery} rootClassName="w-full @2xl:w-80" />
        <p role="status" className="me-auto text-body1 text-foreground-3 tabular-nums">
          {selected.size > 0 ? c.selected(selected.size) : c.count(items.length)}
        </p>
        <DataGridColumnPicker
          compact
          mode="auto"
          resettable={DEFAULT_VIEW}
          columns={columns}
          hiddenColumns={hiddenColumns}
          onHiddenColumnsChange={(_, data) => setHiddenColumns(data.hiddenColumns)}
          columnOrder={columnOrder}
          onColumnOrderChange={(_, data) => setColumnOrder(data.columnOrder)}
        >
          {c.columnsLabel}
        </DataGridColumnPicker>
      </div>

      <DataGrid
        aria-label={c.title}
        items={items}
        columns={columns}
        getRowId={(x) => x.id}
        hiddenColumns={hiddenColumns}
        columnOrder={columnOrder}
        sortable
        defaultSortState={{ sortColumn: "name", sortDirection: "ascending" }}
        selectionMode="multiselect"
        selectedItems={selected}
        onSelectionChange={(_, data) => setSelected(data.selectedItems)}
        empty={
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <DocumentSearch24Regular />
              </EmptyMedia>
              <EmptyTitle>{c.emptyTitle}</EmptyTitle>
              <EmptyDescription>{c.emptyBody}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setQuery("")}>{c.clear}</Button>
            </EmptyContent>
          </Empty>
        }
        // The remaining height of the page, at least 20rem: the header stays in view while the rows scroll.
        className="min-h-80 flex-1 rounded-xlarge border border-stroke-2"
      />
    </div>
  );
}
