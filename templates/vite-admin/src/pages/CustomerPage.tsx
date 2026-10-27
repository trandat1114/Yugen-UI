import * as React from "react";
import { ArrowLeft16Regular, Delete20Regular, Edit20Regular } from "@fluentui/react-icons";
import { Avatar, Button, ErrorState, Link as TextLink, Skeleton, SkeletonItem, toast, useOptimisticList } from "yugen-ui";
import { ApiError, type Customer, type CustomerInput } from "../api";
import { useAdmin } from "../context";
import { CustomerDrawer, DeleteDialog } from "../CustomerDrawer";
import { OrderList } from "../OrderList";
import { Link, useRouter } from "../router";
import { CustomerStatusBadge, EmptyNote, PageHeader, Section } from "../ui";
import { useQuery } from "../useQuery";

function BackLink() {
  const { t } = useAdmin();
  return (
    <TextLink asChild className="mb-2 inline-flex items-center gap-1 text-body1">
      <Link to={{ name: "customers" }}>
        <ArrowLeft16Regular aria-hidden className="rtl:-scale-x-100" />
        {t.customer.back}
      </Link>
    </TextLink>
  );
}

/** One customer: details, edit in the drawer (optimistic), delete after confirming (waits for the server), orders. */
export default function CustomerPage({ id }: { id: string }) {
  const { t, api, format: f, embedded } = useAdmin();
  const { navigate } = useRouter();
  const loaded = useQuery((signal) => api.getCustomer(id, signal), [api, id]);
  const { items, setItems, mutate } = useOptimisticList<Customer>([]);
  const [editing, setEditing] = React.useState<Customer | null>(null);
  const [deleting, setDeleting] = React.useState<Customer[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (loaded.data) setItems([loaded.data]);
  }, [loaded.data, setItems]);
  const customer = items[0];

  React.useEffect(() => {
    if (!embedded && customer) document.title = t.pageTitle(customer.name);
  }, [embedded, customer, t]);

  if (loaded.status === "error" && loaded.error instanceof ApiError && loaded.error.status === 404) {
    return (
      <>
        <PageHeader before={<BackLink />} title={t.customer.notFound} />
        <EmptyNote
          title={t.customer.notFoundBody}
          action={
            <Button asChild appearance="primary">
              <Link to={{ name: "customers" }}>{t.customer.back}</Link>
            </Button>
          }
        />
      </>
    );
  }
  if (loaded.status === "error") {
    return (
      <>
        <PageHeader before={<BackLink />} title={t.customer.title} />
        <ErrorState title={t.common.loadFailed} description={t.common.loadFailedBody} onRetry={loaded.retry} />
      </>
    );
  }
  if (!customer) {
    return (
      <>
        <PageHeader before={<BackLink />} title={t.customer.title} />
        <Skeleton className="gap-4">
          <SkeletonItem className="h-40" />
          <SkeletonItem className="h-64" />
        </Skeleton>
      </>
    );
  }

  const save = (values: CustomerInput) => {
    setEditing(null);
    void mutate(
      (rows) => rows.map((row) => ({ ...row, ...values })),
      async () => {
        await api.updateCustomer(customer.id, values);
        toast({ intent: "success", title: t.customers.saved(values.name) });
      },
      { errorTitle: t.customers.saveFailed(values.name), errorBody: t.common.rolledBack },
    );
  };

  // Leaving the page is not something to undo: wait for the server, then go back to the list.
  const remove = async () => {
    setBusy(true);
    try {
      await api.deleteCustomers([customer.id]);
      toast({ intent: "success", title: t.customers.deleted(1, customer.name) });
      navigate({ name: "customers" });
    } catch {
      setBusy(false);
      setDeleting(null);
      toast({ intent: "error", title: t.customers.deleteFailed(1, customer.name), body: t.common.tryAgain });
    }
  };

  const details: [string, React.ReactNode][] = [
    [t.customers.columns.email, customer.email],
    [t.customers.columns.phone, customer.phone || "–"],
    [t.customers.columns.company, customer.company || "–"],
    [t.customers.columns.plan, t.plans[customer.plan]],
    [t.customers.columns.createdAt, f.date(customer.createdAt)],
    [t.customers.columns.orders, f.count(customer.orders)],
    [t.customers.columns.spent, f.money(customer.spent)],
  ];

  return (
    <>
      <PageHeader
        before={<BackLink />}
        media={
          // The name is the heading right next to it.
          <span aria-hidden className="flex">
            <Avatar name={customer.name} size={48} color="colorful" />
          </span>
        }
        title={customer.name}
        description={customer.email}
        actions={
          <>
            <Button icon={<Edit20Regular />} onClick={() => setEditing(customer)}>
              {t.common.edit}
            </Button>
            <Button icon={<Delete20Regular />} onClick={() => setDeleting([customer])}>
              {t.common.delete}
            </Button>
          </>
        }
      />

      <div className="grid items-start gap-4 @5xl/app:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Section title={t.customer.details} action={<CustomerStatusBadge status={customer.status} />}>
          <dl className="grid gap-x-4 gap-y-3 text-body1 @lg/app:grid-cols-[auto_minmax(0,1fr)]">
            {details.map(([term, value]) => (
              <div key={term} className="contents">
                <dt className="text-foreground-3">{term}</dt>
                <dd className="min-w-0 wrap-break-word tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section title={t.orders.ofCustomer} description={t.orders.ofCustomerDescription}>
          <OrderList customerId={customer.id} />
        </Section>
      </div>

      <CustomerDrawer editing={editing} onClose={() => setEditing(null)} onSubmit={save} />
      <DeleteDialog customers={deleting} busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} />
    </>
  );
}
