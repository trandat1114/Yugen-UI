import { Food20Regular, Cart20Regular, VehicleCar20Regular, Wallet20Regular, Video20Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, List, ListItem } from "@/components/ui";

export const meta = { title: "Recent transactions", description: "A List with icons, descriptions and amounts", order: 6 };

const ITEMS = [
  { id: "1", icon: Food20Regular, title: "Sakura Café", meta: "Food & drink · Today", amount: -6.5 },
  { id: "2", icon: Cart20Regular, title: "Green Market", meta: "Shopping · Yesterday", amount: -48.2 },
  { id: "3", icon: Wallet20Regular, title: "October salary", meta: "Income · Oct 15", amount: 4_250 },
  { id: "4", icon: VehicleCar20Regular, title: "Ride share", meta: "Transport · Oct 14", amount: -12.4 },
  { id: "5", icon: Video20Regular, title: "Streaming plan", meta: "Entertainment · Oct 12", amount: -15.99 },
];

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (n: number) => (n > 0 ? "+" : "−") + usd.format(Math.abs(n));

export default function TransactionsBlock() {
  return (
    <Card size="large" className="gap-3 rounded-xlarge p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-subtitle1 font-semibold">Recent transactions</h3>
          <p className="mt-0.5 text-body1 text-foreground-3">5 transactions in the last 7 days.</p>
        </div>
        <Button appearance="transparent" size="small">
          View all
        </Button>
      </div>

      <List aria-label="Recent transactions">
        {ITEMS.map(({ id, icon: Icon, title, meta: sub, amount }) => (
          <ListItem
            key={id}
            value={id}
            media={
              <span className="inline-flex size-9 items-center justify-center rounded-circular bg-brand-background-2 text-brand-foreground-2">
                <Icon />
              </span>
            }
            title={title}
            description={sub}
            actions={
              amount > 0 ? (
                <Badge appearance="tint" color="success" size="large">
                  {money(amount)}
                </Badge>
              ) : (
                <span className="text-body1 font-semibold tabular-nums">{money(amount)}</span>
              )
            }
          />
        ))}
      </List>
    </Card>
  );
}
