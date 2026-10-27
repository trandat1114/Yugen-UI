import { Card } from "@/components/ui";
import { useAdmin } from "../context";
import { OrderList } from "../OrderList";
import { PageHeader } from "../ui";

/** Every order, read-only; each one links to its customer. */
export default function OrdersPage() {
  const { t } = useAdmin();
  return (
    <>
      <PageHeader title={t.orders.title} description={t.orders.description} />
      <Card size="large" className="min-w-0">
        <OrderList />
      </Card>
    </>
  );
}
