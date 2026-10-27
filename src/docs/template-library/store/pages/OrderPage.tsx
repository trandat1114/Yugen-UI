import type { ReactNode } from "react";
import { CheckmarkCircle24Regular, Receipt20Regular } from "@fluentui/react-icons";
import { Button, Card, Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, MessageBar } from "@/components/ui";
import { useHeadings, useStore } from "../context";
import { LineList } from "../LineList";
import { describeLines } from "../lines";
import { createFormat } from "../money";
import { deliveryWindow, type Order } from "../orders";
import { shippingOption } from "../products";
import { Link, SHOP } from "../router";

function OrderNotFound() {
  const { t } = useStore();
  const { H1 } = useHeadings();
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia>
          <Receipt20Regular />
        </EmptyMedia>
        <H1 className="font-display text-subtitle1 font-semibold text-foreground-1">{t.order.notFoundTitle}</H1>
        <EmptyDescription>{t.order.notFoundBody}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild appearance="primary">
          <Link to={SHOP}>{t.order.continue}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/** Order confirmation, read back from where checkout saved it (sessionStorage in this demo). */
export default function OrderPage({ id }: { id: string }) {
  const { orders } = useStore();
  const order = orders.get(id);
  return order ? <OrderView order={order} /> : <OrderNotFound />;
}

function OrderView({ order }: { order: Order }) {
  const { t } = useStore();
  const { H1, H2 } = useHeadings();
  // Amounts in the currency the order was placed in.
  const format = createFormat(t.locale, order.currency);
  const lines = order.lines.flatMap((line) =>
    describeLines([line], t, (usd) => usd).map((view) => ({ ...view, total: line.unitPrice * line.quantity })),
  );
  const option = shippingOption(order.shipping);
  const [from, to] = deliveryWindow(order.placedAt, option.days);
  const arrival = order.shipping === "pickup" ? t.order.pickup(format.date(from)) : t.order.arrives(format.date(from), format.date(to));
  const a = order.address;
  const firstName = order.contact.name.split(/\s+/)[0];

  const block = (title: string, body: ReactNode) => (
    <div className="flex min-w-0 flex-col gap-1">
      <H2 className="text-body1 font-semibold">{title}</H2>
      {body}
    </div>
  );
  const row = (label: string, value: string, strong = false) => (
    <div className={strong ? "flex justify-between gap-2 text-subtitle2 font-semibold" : "flex justify-between gap-2 text-body1"}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-start gap-2">
        <CheckmarkCircle24Regular aria-hidden className="size-10 text-success-foreground-1" />
        <H1 className="font-display text-title2 font-semibold">{t.order.title}</H1>
        <p className="text-subtitle2">{t.order.thanks(firstName)}</p>
        <p className="text-body1 text-foreground-3">{t.order.lead(order.contact.email)}</p>
      </div>

      <Card size="large" className="gap-5">
        <dl className="grid gap-3 @xl/app:grid-cols-2">
          <div>
            <dt className="text-caption1 text-foreground-3">{t.order.number}</dt>
            <dd className="font-mono text-subtitle2 font-semibold">{order.id}</dd>
          </div>
          <div>
            <dt className="text-caption1 text-foreground-3">{t.order.placed}</dt>
            <dd className="text-body1">{format.date(new Date(order.placedAt))}</dd>
          </div>
        </dl>

        {block(t.order.items, <LineList lines={lines} money={format.money} />)}

        <div className="grid gap-5 border-t border-stroke-2 pt-4 @xl/app:grid-cols-2">
          {block(
            t.order.delivery,
            <div className="text-body1 text-foreground-2">
              <p>{`${t.checkout.methods[order.shipping].name} · ${arrival}`}</p>
              {order.shipping !== "pickup" && (
                <address className="not-italic">
                  {order.contact.name}
                  <br />
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  <br />
                  {[a.city, a.postalCode].filter(Boolean).join(" ")}, {format.country(a.country)}
                </address>
              )}
            </div>,
          )}
          {block(
            t.order.payment,
            <p className="text-body1 text-foreground-2">
              {order.payment.method === "card" ? t.order.paidCard(order.payment.last4) : t.order.payOnDelivery}
            </p>,
          )}
        </div>

        <dl className="flex flex-col gap-2 border-t border-stroke-2 pt-4">
          {row(t.checkout.subtotal, format.money(order.subtotal))}
          {row(t.checkout.shipping, order.shippingCost === 0 ? t.checkout.free : format.money(order.shippingCost))}
          {row(t.checkout.total, format.money(order.total), true)}
        </dl>
      </Card>

      <MessageBar intent="info">{t.order.demo}</MessageBar>
      <Button asChild appearance="primary" className="self-start">
        <Link to={SHOP}>{t.order.continue}</Link>
      </Button>
    </div>
  );
}
