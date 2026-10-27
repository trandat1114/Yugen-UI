import * as React from "react";
import {
  createColumn,
  DataGrid,
  Dropdown,
  DropdownOption,
  ErrorState,
  Field,
  SearchBox,
  type DataGridSortState,
} from "@/components/ui";
import { ORDER_STATUSES, type Order, type OrderQuery, type OrderSortKey, type OrderStatus } from "./api";
import { useAdmin } from "./context";
import { Link } from "./router";
import { EmptyNote, OrderStatusBadge, Pager, serverOrder } from "./ui";
import { useDebouncedValue, useQuery } from "./useQuery";

/**
 * Read-only list of orders, paged and sorted by the server. With `customerId`: the orders of that customer, without the
 * customer column and the filters.
 */
export function OrderList({ customerId }: { customerId?: string }) {
  const { t, api, format: f } = useAdmin();
  const o = t.orders;
  const [search, setSearch] = React.useState("");
  const needle = useDebouncedValue(search.trim(), 300);
  const [status, setStatus] = React.useState<OrderStatus | "all">("all");
  const [sort, setSort] = React.useState<DataGridSortState>({ sortColumn: "date", sortDirection: "descending" });
  const [pageSize, setPageSize] = React.useState(customerId ? 5 : 10);

  const listKey = [customerId, needle, status, sort.sortColumn, sort.sortDirection, pageSize].join("|");
  const [paging, setPaging] = React.useState({ key: listKey, page: 1 });
  const page = paging.key === listKey ? paging.page : 1;
  const query: OrderQuery = {
    page,
    pageSize,
    search: needle,
    status,
    customerId,
    sort: { column: (sort.sortColumn ?? "date") as OrderSortKey, direction: sort.sortDirection },
  };
  const orders = useQuery((signal) => api.listOrders(query, signal), [api, listKey, page]);
  const filtered = needle !== "" || status !== "all";

  const columns = React.useMemo(
    () => [
      createColumn<Order>({ columnId: "id", label: o.columns.id, width: 128, compare: serverOrder, renderCell: (r) => r.id }),
      ...(customerId
        ? []
        : [
            createColumn<Order>({
              columnId: "customer",
              label: o.columns.customer,
              minWidth: 200,
              compare: serverOrder,
              renderCell: (r) => (
                <Link to={{ name: "customer", id: r.customerId }} className="truncate font-semibold text-foreground-1 hover:underline">
                  {r.customerName}
                </Link>
              ),
            }),
          ]),
      createColumn<Order>({ columnId: "date", label: o.columns.date, width: 144, compare: serverOrder, renderCell: (r) => f.date(r.date) }),
      createColumn<Order>({
        columnId: "status",
        label: o.columns.status,
        width: 128,
        compare: serverOrder,
        renderCell: (r) => <OrderStatusBadge status={r.status} />,
      }),
      createColumn<Order>({ columnId: "items", label: o.columns.items, width: 96, align: "end", compare: serverOrder, renderCell: (r) => f.count(r.items) }),
      createColumn<Order>({ columnId: "total", label: o.columns.total, width: 136, align: "end", compare: serverOrder, renderCell: (r) => f.money(r.total) }),
    ],
    [o, f, customerId],
  );

  return (
    <>
      {!customerId && (
        <div className="flex flex-wrap items-end gap-3">
          <SearchBox label={o.search} placeholder={o.searchPlaceholder} value={search} onValueChange={setSearch} rootClassName="w-full @2xl/app:w-64" />
          <Field label={o.columns.status}>
            <Dropdown value={status} onValueChange={(v) => setStatus(v as OrderStatus | "all")} className="w-40 min-w-0">
              <DropdownOption value="all">{t.common.all}</DropdownOption>
              {ORDER_STATUSES.map((s) => (
                <DropdownOption key={s} value={s}>
                  {t.orderStatuses[s]}
                </DropdownOption>
              ))}
            </Dropdown>
          </Field>
        </div>
      )}
      {orders.status === "error" ? (
        <ErrorState size="small" title={t.common.loadFailed} description={t.common.loadFailedBody} onRetry={orders.retry} />
      ) : (
        <DataGrid
          aria-label={customerId ? o.ofCustomer : o.title}
          items={orders.data?.rows ?? []}
          columns={columns}
          getRowId={(r) => r.id}
          sortable
          sortState={sort}
          onSortChange={(_, next) => setSort(next)}
          focusMode="row"
          loading={orders.status === "loading"}
          empty={<EmptyNote title={filtered ? o.noMatch : o.empty} />}
        />
      )}
      <Pager
        page={page}
        pageSize={pageSize}
        total={orders.data?.total}
        onPageChange={(next) => setPaging({ key: listKey, page: next })}
        onPageSizeChange={customerId ? undefined : setPageSize}
      />
    </>
  );
}
