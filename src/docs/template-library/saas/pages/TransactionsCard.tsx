import { Cart20Regular, Food20Regular, VehicleCar20Regular, Video20Regular, Wallet20Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, List, ListItem } from "@/components/ui";
import type { Content, TransactionKind } from "../content/types";
import { signedMoney } from "../format";

const ICONS: Record<TransactionKind, typeof Food20Regular> = {
  food: Food20Regular,
  shopping: Cart20Regular,
  income: Wallet20Regular,
  transport: VehicleCar20Regular,
  entertainment: Video20Regular,
};

/** Giao dịch gần đây — trang Tổng quan và Thanh toán. */
export function TransactionsCard({ t }: { t: Content }) {
  const c = t.transactions;
  return (
    <Card size="large" className="gap-3 rounded-xlarge p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
          <p className="mt-0.5 text-body1 text-foreground-3">{c.description}</p>
        </div>
        <Button appearance="transparent" size="small">
          {c.viewAll}
        </Button>
      </div>

      <List aria-label={c.title}>
        {c.items.map(({ id, kind, title, meta, amount }) => {
          const Icon = ICONS[kind];
          return (
            <ListItem
              key={id}
              value={id}
              media={
                <span className="inline-flex size-9 items-center justify-center rounded-circular bg-brand-background-2 text-brand-foreground-2">
                  <Icon />
                </span>
              }
              title={title}
              description={meta}
              actions={
                amount > 0 ? (
                  <Badge appearance="tint" color="success" size="large">
                    {signedMoney(t, amount)}
                  </Badge>
                ) : (
                  <span className="text-body1 font-semibold tabular-nums">{signedMoney(t, amount)}</span>
                )
              }
            />
          );
        })}
      </List>
    </Card>
  );
}
