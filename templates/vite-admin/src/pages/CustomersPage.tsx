import * as React from "react";
import {
  Add20Regular,
  ArrowDownload20Regular,
  Delete20Regular,
  Dismiss20Regular,
  Edit20Regular,
  MoreHorizontal20Regular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Button,
  Card,
  createColumn,
  DataGrid,
  DataGridColumnPicker,
  Dropdown,
  DropdownOption,
  ErrorState,
  Field,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  SearchBox,
  toast,
  Toolbar,
  ToolbarButton,
  useOptimisticList,
  type DataGridSortState,
} from "yugen-ui";
import {
  CUSTOMER_STATUSES,
  PLANS,
  type Customer,
  type CustomerInput,
  type CustomerQuery,
  type CustomerSortKey,
  type CustomerStatus,
  type Plan,
} from "../api";
import { useAdmin } from "../context";
import { downloadCsv, toCsv } from "../csv";
import { CustomerDrawer, DeleteDialog } from "../CustomerDrawer";
import { Link } from "../router";
import { CustomerStatusBadge, EmptyNote, PageHeader, Pager, serverOrder } from "../ui";
import { useDebouncedValue, useQuery } from "../useQuery";

/** Id of a row added on screen that the server has not confirmed yet. */
const DRAFT = "draft-";
const isDraft = (customer: Customer) => customer.id.startsWith(DRAFT);

function RowMenu({ customer, onEdit, onDelete }: { customer: Customer; onEdit: () => void; onDelete: () => void }) {
  const { t } = useAdmin();
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button
          appearance="subtle"
          size="small"
          icon={<MoreHorizontal20Regular />}
          aria-label={t.customers.actionsFor(customer.name)}
          disabled={isDraft(customer)}
        />
      </MenuTrigger>
      <MenuPopover align="end">
        <MenuItem icon={<Edit20Regular />} onSelect={onEdit}>
          {t.common.edit}
        </MenuItem>
        <MenuItem icon={<Delete20Regular />} onSelect={onDelete}>
          {t.common.delete}
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
}

/**
 * Customers: the server pages, sorts and filters (src/api.ts); the grid shows one page. Edits and deletes show at once
 * (useOptimisticList) and roll back with a toast if the request fails.
 */
export default function CustomersPage() {
  const { t, api, format: f } = useAdmin();
  const c = t.customers;
  const [search, setSearch] = React.useState("");
  const needle = useDebouncedValue(search.trim(), 300);
  const [status, setStatus] = React.useState<CustomerStatus | "all">("all");
  const [plan, setPlan] = React.useState<Plan | "all">("all");
  const [sort, setSort] = React.useState<DataGridSortState>({ sortColumn: "createdAt", sortDirection: "descending" });
  const [pageSize, setPageSize] = React.useState(10);
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(() => new Set(["phone", "plan"]));
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set());
  const [editing, setEditing] = React.useState<Customer | "new" | null>(null);
  const [deleting, setDeleting] = React.useState<Customer[] | null>(null);

  // A new search, filter, sort or page size starts again at page 1.
  const listKey = [needle, status, plan, sort.sortColumn, sort.sortDirection, pageSize].join("|");
  const [paging, setPaging] = React.useState({ key: listKey, page: 1 });
  const page = paging.key === listKey ? paging.page : 1;
  const query: CustomerQuery = {
    page,
    pageSize,
    search: needle,
    status,
    plan,
    sort: { column: (sort.sortColumn ?? "createdAt") as CustomerSortKey, direction: sort.sortDirection },
  };
  const customers = useQuery((signal) => api.listCustomers(query, signal), [api, listKey, page]);

  // The page from the server is the base; pending changes are applied on top of it until they succeed or fail.
  const { items, setItems, mutate } = useOptimisticList<Customer>([]);
  React.useEffect(() => {
    if (customers.data) setItems(customers.data.rows);
  }, [customers.data, setItems]);

  // Selection belongs to the page on screen.
  React.useEffect(() => setSelected(new Set()), [listKey, page]);

  const total = customers.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  // After deleting the last rows of the last page, step back one page.
  React.useEffect(() => {
    if (customers.data && page > pageCount) setPaging({ key: listKey, page: pageCount });
  }, [customers.data, page, pageCount, listKey]);

  const selectedRows = items.filter((row) => selected.has(row.id));
  const filtered = needle !== "" || status !== "all" || plan !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPlan("all");
  };

  const save = (values: CustomerInput, customer?: Customer) => {
    setEditing(null);
    if (customer) {
      void mutate(
        (rows) => rows.map((row) => (row.id === customer.id ? { ...row, ...values } : row)),
        async () => {
          await api.updateCustomer(customer.id, values);
          toast({ intent: "success", title: c.saved(values.name) });
        },
        { errorTitle: c.saveFailed(values.name), errorBody: t.common.rolledBack },
      );
      return;
    }
    const draft: Customer = { ...values, id: `${DRAFT}${Date.now()}`, orders: 0, spent: 0, createdAt: new Date().toISOString() };
    void mutate(
      (rows) => [draft, ...rows],
      async () => {
        await api.createCustomer(values);
        toast({ intent: "success", title: c.created(values.name) });
        // The real id, the total and the row's place in the sort order come from the server.
        customers.refresh();
      },
      { errorTitle: c.createFailed(values.name), errorBody: t.common.rolledBack },
    );
  };

  const remove = (rows: Customer[]) => {
    setDeleting(null);
    setSelected(new Set());
    const ids = rows.map((row) => row.id);
    const name = rows[0]?.name ?? "";
    void mutate(
      (list) => list.filter((row) => !ids.includes(row.id)),
      async () => {
        await api.deleteCustomers(ids);
        toast({ intent: "success", title: c.deleted(rows.length, name) });
        customers.refresh();
      },
      { errorTitle: c.deleteFailed(rows.length, name), errorBody: t.common.rolledBack },
    );
  };

  const exportCsv = (rows: Customer[]) => {
    const csv = toCsv(rows, [
      { header: c.columns.name, value: (r) => r.name },
      { header: c.columns.email, value: (r) => r.email },
      { header: c.columns.company, value: (r) => r.company },
      { header: c.columns.phone, value: (r) => r.phone },
      { header: c.columns.status, value: (r) => t.statuses[r.status] },
      { header: c.columns.plan, value: (r) => t.plans[r.plan] },
      { header: c.columns.orders, value: (r) => r.orders },
      { header: `${c.columns.spent} (${t.currency})`, value: (r) => r.spent },
      { header: c.columns.createdAt, value: (r) => r.createdAt.slice(0, 10) },
    ]);
    downloadCsv(`${c.file}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast({ intent: "success", title: c.exported(rows.length) });
  };

  const columns = React.useMemo(
    () => [
      createColumn<Customer>({
        columnId: "name",
        label: c.columns.name,
        hideable: false,
        sticky: "start",
        minWidth: 240,
        compare: serverOrder,
        renderCell: (r) => (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={r.name} size={32} color="colorful" />
            <div className="min-w-0">
              {isDraft(r) ? (
                <p className="truncate font-semibold">{r.name}</p>
              ) : (
                <Link to={{ name: "customer", id: r.id }} className="block truncate font-semibold text-foreground-1 hover:underline">
                  {r.name}
                </Link>
              )}
              <p className="truncate text-caption1 text-foreground-3">{r.email}</p>
            </div>
          </div>
        ),
      }),
      createColumn<Customer>({ columnId: "company", label: c.columns.company, minWidth: 160, compare: serverOrder, renderCell: (r) => r.company || "–" }),
      createColumn<Customer>({
        columnId: "status",
        label: c.columns.status,
        width: 120,
        compare: serverOrder,
        renderCell: (r) => <CustomerStatusBadge status={r.status} />,
      }),
      createColumn<Customer>({ columnId: "plan", label: c.columns.plan, width: 112, compare: serverOrder, renderCell: (r) => t.plans[r.plan] }),
      createColumn<Customer>({ columnId: "phone", label: c.columns.phone, width: 168, compare: serverOrder, renderCell: (r) => r.phone || "–" }),
      createColumn<Customer>({
        columnId: "orders",
        label: c.columns.orders,
        width: 104,
        align: "end",
        compare: serverOrder,
        renderCell: (r) => f.count(r.orders),
      }),
      createColumn<Customer>({
        columnId: "spent",
        label: c.columns.spent,
        width: 136,
        align: "end",
        compare: serverOrder,
        renderCell: (r) => f.money(r.spent),
      }),
      createColumn<Customer>({
        columnId: "createdAt",
        label: c.columns.createdAt,
        width: 144,
        align: "end",
        compare: serverOrder,
        renderCell: (r) => f.date(r.createdAt),
      }),
      createColumn<Customer>({
        columnId: "actions",
        label: c.columns.actions,
        hideable: false,
        width: 64,
        align: "center",
        renderHeaderCell: () => <span className="sr-only">{c.columns.actions}</span>,
        renderCell: (r) => <RowMenu customer={r} onEdit={() => setEditing(r)} onDelete={() => setDeleting([r])} />,
      }),
    ],
    [c, t, f],
  );

  return (
    <>
      <PageHeader
        title={c.title}
        description={c.description}
        actions={
          <Button appearance="primary" icon={<Add20Regular />} onClick={() => setEditing("new")}>
            {c.add}
          </Button>
        }
      />

      <Card size="large" className="min-w-0">
        {selectedRows.length > 0 ? (
          <Toolbar aria-label={c.bulk.label} className="min-h-14 flex-wrap rounded-medium bg-brand-background-2 px-2">
            <span className="px-2 text-body1 font-semibold">{c.bulk.selected(selectedRows.length)}</span>
            <ToolbarButton icon={<ArrowDownload20Regular />} onClick={() => exportCsv(selectedRows)}>
              {c.bulk.export}
            </ToolbarButton>
            <ToolbarButton icon={<Delete20Regular />} onClick={() => setDeleting(selectedRows)}>
              {c.bulk.delete}
            </ToolbarButton>
            <ToolbarButton icon={<Dismiss20Regular />} onClick={() => setSelected(new Set())} className="ms-auto">
              {c.bulk.clear}
            </ToolbarButton>
          </Toolbar>
        ) : (
          <div className="flex min-h-14 flex-wrap items-end gap-3">
            <SearchBox
              label={c.search}
              placeholder={c.searchPlaceholder}
              value={search}
              onValueChange={setSearch}
              rootClassName="w-full @2xl/app:w-64"
            />
            <Field label={c.columns.status}>
              <Dropdown value={status} onValueChange={(v) => setStatus(v as CustomerStatus | "all")} className="w-40 min-w-0">
                <DropdownOption value="all">{t.common.all}</DropdownOption>
                {CUSTOMER_STATUSES.map((s) => (
                  <DropdownOption key={s} value={s}>
                    {t.statuses[s]}
                  </DropdownOption>
                ))}
              </Dropdown>
            </Field>
            <Field label={c.columns.plan}>
              <Dropdown value={plan} onValueChange={(v) => setPlan(v as Plan | "all")} className="w-40 min-w-0">
                <DropdownOption value="all">{t.common.all}</DropdownOption>
                {PLANS.map((p) => (
                  <DropdownOption key={p} value={p}>
                    {t.plans[p]}
                  </DropdownOption>
                ))}
              </Dropdown>
            </Field>
            {filtered && (
              <Button appearance="subtle" onClick={clearFilters}>
                {t.common.clearFilters}
              </Button>
            )}
            <DataGridColumnPicker
              className="ms-auto"
              columns={columns}
              hiddenColumns={hidden}
              onHiddenColumnsChange={(_, data) => setHidden(data.hiddenColumns)}
              sortState={sort}
            />
          </div>
        )}
        {/* Announces the selection; the toolbar above appears and disappears with it. */}
        <span className="sr-only" aria-live="polite">
          {selectedRows.length > 0 ? c.bulk.selected(selectedRows.length) : ""}
        </span>

        {customers.status === "error" ? (
          <ErrorState size="small" title={t.common.loadFailed} description={t.common.loadFailedBody} onRetry={customers.retry} />
        ) : (
          <DataGrid
            aria-label={c.title}
            items={items}
            columns={columns}
            hiddenColumns={hidden}
            getRowId={(r) => r.id}
            sortable
            sortState={sort}
            onSortChange={(_, next) => setSort(next)}
            selectionMode="multiselect"
            selectedItems={selected}
            onSelectionChange={(_, data) => setSelected(data.selectedItems)}
            loading={customers.status === "loading"}
            empty={
              filtered ? (
                <EmptyNote
                  title={c.noMatch}
                  description={c.noMatchBody}
                  action={
                    <Button appearance="primary" onClick={clearFilters}>
                      {t.common.clearFilters}
                    </Button>
                  }
                />
              ) : (
                <EmptyNote title={c.emptyTitle} description={c.emptyBody} />
              )
            }
          />
        )}

        <Pager
          page={Math.min(page, pageCount)}
          pageSize={pageSize}
          total={customers.data?.total}
          onPageChange={(next) => setPaging({ key: listKey, page: next })}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <CustomerDrawer editing={editing} onClose={() => setEditing(null)} onSubmit={save} />
      <DeleteDialog customers={deleting} onCancel={() => setDeleting(null)} onConfirm={remove} />
    </>
  );
}
