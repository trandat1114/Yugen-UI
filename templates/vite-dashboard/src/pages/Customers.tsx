import * as React from "react";
import { ArrowDownload20Regular } from "@fluentui/react-icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  createColumn,
  DataGrid,
  Dropdown,
  DropdownOption,
  Field,
  Pagination,
  sortItems,
  toast,
  useYugen,
  type DataGridSortState,
} from "yugen-ui";
import { SEGMENTS, type CustomerRow, type CustomerStatus, type SegmentKey } from "../api";
import { useDashboard } from "../context";
import { downloadCsv, toCsv } from "../csv";
import { isoDate } from "../dates";
import { CardTitle, EmptyNote, KpiTiles, LoadError, useFormat } from "../ui";
import { useQuery } from "../useQuery";

const PAGE_SIZE = 10;
const STATUSES: CustomerStatus[] = ["new", "returning"];

/** Lowercase without accents, so "nguyen" finds "Nguyễn". */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

export default function Customers() {
  const { api, range, query, setQuery, content: t } = useDashboard();
  const { locale } = useYugen();
  const f = useFormat();
  const c = t.customers.columns;
  const kpis = useQuery((signal) => api.getKpis(range, signal), [api, range]);
  const customers = useQuery((signal) => api.getCustomers(range, signal), [api, range]);
  const [segment, setSegment] = React.useState<SegmentKey | "all">("all");
  const [status, setStatus] = React.useState<CustomerStatus | "all">("all");
  const [sort, setSort] = React.useState<DataGridSortState>({ sortColumn: "revenue", sortDirection: "descending" });

  const columns = React.useMemo(() => {
    const collator = new Intl.Collator(locale);
    return [
      createColumn<CustomerRow>({
        columnId: "customer",
        renderHeaderCell: () => c.customer,
        renderCell: (r) => (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={r.name} size={32} color="colorful" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{r.name}</p>
              <p className="truncate text-caption1 text-foreground-3">{r.email}</p>
            </div>
          </div>
        ),
        compare: (a, b) => collator.compare(a.name, b.name),
        minWidth: 240,
        sticky: "start",
      }),
      createColumn<CustomerRow>({
        columnId: "status",
        renderHeaderCell: () => c.status,
        renderCell: (r) => (
          <Badge appearance="tint" color={r.status === "new" ? "brand" : "informative"}>
            {t.customers.statuses[r.status]}
          </Badge>
        ),
        compare: (a, b) => a.status.localeCompare(b.status),
        width: 120,
      }),
      createColumn<CustomerRow>({
        columnId: "segment",
        renderHeaderCell: () => c.segment,
        renderCell: (r) => t.data.segments[r.segment],
        compare: (a, b) => a.segment.localeCompare(b.segment),
        width: 136,
      }),
      createColumn<CustomerRow>({
        columnId: "country",
        renderHeaderCell: () => c.country,
        renderCell: (r) => f.country(r.country),
        compare: (a, b) => collator.compare(f.country(a.country), f.country(b.country)),
        minWidth: 140,
      }),
      createColumn<CustomerRow>({
        columnId: "orders",
        renderHeaderCell: () => c.orders,
        renderCell: (r) => f.count(r.orders),
        compare: (a, b) => a.orders - b.orders,
        align: "end",
        width: 112,
      }),
      createColumn<CustomerRow>({
        columnId: "revenue",
        renderHeaderCell: () => c.revenue,
        renderCell: (r) => f.money(r.revenue),
        compare: (a, b) => a.revenue - b.revenue,
        align: "end",
        width: 152,
      }),
      createColumn<CustomerRow>({
        columnId: "lastOrder",
        renderHeaderCell: () => c.lastOrder,
        renderCell: (r) => f.date(r.lastOrder),
        compare: (a, b) => a.lastOrder.getTime() - b.lastOrder.getTime(),
        align: "end",
        width: 144,
      }),
    ];
  }, [locale, c, t, f]);

  // Filter, then sort the whole list, then cut the page: sorting only the visible page would be wrong.
  const all = customers.data;
  const indexed = React.useMemo(() => (all ?? []).map((row) => ({ row, text: fold(`${row.name} ${row.email}`) })), [all]);
  const needle = fold(query.trim());
  const filtered = React.useMemo(
    () =>
      indexed
        .filter(({ row, text }) => (segment === "all" || row.segment === segment) && (status === "all" || row.status === status) && text.includes(needle))
        .map(({ row }) => row),
    [indexed, segment, status, needle],
  );
  const sorted = React.useMemo(() => sortItems(filtered, columns, sort), [filtered, columns, sort]);

  // Back to page 1 whenever the list changes.
  const listKey = [range.from.getTime(), range.to.getTime(), needle, segment, status, sort.sortColumn, sort.sortDirection].join("|");
  const [paging, setPaging] = React.useState({ key: listKey, page: 1 });
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = paging.key === listKey ? Math.min(paging.page, pageCount) : 1;
  const rows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filteredView = needle !== "" || segment !== "all" || status !== "all";
  const clearFilters = () => {
    setQuery("");
    setSegment("all");
    setStatus("all");
  };

  const exportCsv = () => {
    const csv = toCsv(sorted, [
      { header: c.customer, value: (r) => r.name },
      { header: c.email, value: (r) => r.email },
      { header: c.status, value: (r) => t.customers.statuses[r.status] },
      { header: c.segment, value: (r) => t.data.segments[r.segment] },
      { header: c.country, value: (r) => f.country(r.country) },
      { header: c.orders, value: (r) => r.orders },
      { header: `${c.revenue} (${t.currency})`, value: (r) => r.revenue },
      { header: c.lastOrder, value: (r) => isoDate(r.lastOrder) },
    ]);
    downloadCsv(`${t.customers.file}-${isoDate(range.from)}-${isoDate(range.to)}.csv`, csv);
    toast({ intent: "success", title: t.customers.exported(f.count(sorted.length)) });
  };

  return (
    <>
      <KpiTiles query={kpis} metrics={["customers", "newCustomers", "returningRate", "revenuePerCustomer"]} />

      <Card size="large" className="min-w-0">
        <div className="min-w-0">
          <CardTitle>{t.customers.gridTitle}</CardTitle>
          <p className="mt-0.5 text-caption1 text-foreground-3">{t.customers.gridDescription}</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label={t.customers.segment}>
            <Dropdown value={segment} onValueChange={(v) => setSegment(v as SegmentKey | "all")} className="w-40">
              <DropdownOption value="all">{t.customers.all}</DropdownOption>
              {SEGMENTS.map((s) => (
                <DropdownOption key={s} value={s}>
                  {t.data.segments[s]}
                </DropdownOption>
              ))}
            </Dropdown>
          </Field>
          <Field label={t.customers.status}>
            <Dropdown value={status} onValueChange={(v) => setStatus(v as CustomerStatus | "all")} className="w-40">
              <DropdownOption value="all">{t.customers.all}</DropdownOption>
              {STATUSES.map((s) => (
                <DropdownOption key={s} value={s}>
                  {t.customers.statuses[s]}
                </DropdownOption>
              ))}
            </Dropdown>
          </Field>
          {filteredView && (
            <Button appearance="subtle" onClick={clearFilters}>
              {t.customers.clearFilters}
            </Button>
          )}
          <Button className="ms-auto" icon={<ArrowDownload20Regular />} disabled={sorted.length === 0 || customers.status !== "success"} onClick={exportCsv}>
            {t.customers.export}
          </Button>
        </div>

        <p aria-live="polite" className="text-caption1 text-foreground-3">
          {all && t.customers.count(f.count(sorted.length), f.count(all.length), filteredView)}
          {all && needle !== "" && ` · ${t.customers.query(query.trim())}`}
        </p>

        {customers.status === "error" ? (
          <LoadError retry={customers.retry} retrying={false} />
        ) : (
          <DataGrid
            aria-label={t.customers.gridTitle}
            items={rows}
            columns={columns}
            getRowId={(r) => r.id}
            sortable
            sortState={sort}
            onSortChange={(_, next) => setSort(next)}
            focusMode="row"
            loading={customers.status === "loading"}
            empty={
              filteredView ? (
                <EmptyNote
                  title={t.customers.noResultsTitle}
                  description={t.customers.noResultsDescription}
                  action={
                    <Button appearance="primary" onClick={clearFilters}>
                      {t.customers.clearFilters}
                    </Button>
                  }
                />
              ) : (
                <EmptyNote />
              )
            }
          />
        )}

        {sorted.length > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-caption1 text-foreground-3 tabular-nums">
              {t.customers.pageInfo(f.count((page - 1) * PAGE_SIZE + 1), f.count((page - 1) * PAGE_SIZE + rows.length), f.count(sorted.length))}
            </span>
            <Pagination page={page} pageCount={pageCount} onPageChange={(next) => setPaging({ key: listKey, page: next })} showLabels={false} />
          </div>
        )}
      </Card>
    </>
  );
}
