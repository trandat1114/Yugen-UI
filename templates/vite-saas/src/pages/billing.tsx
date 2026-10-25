import { useState } from "react";
import { Button, Card, Input, MessageBar, Slider } from "yugen-ui";
import { money } from "../format";
import type { PageProps } from "../pages";
import { TransactionsCard } from "./TransactionsCard";

function Payout({ t }: PageProps) {
  const c = t.payout;
  const [amount, setAmount] = useState([c.initial]);

  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">{c.description}</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-body1">{c.amountLabel}</span>
          <span className="font-display text-title3 font-semibold tabular-nums">{money(t, amount[0])}</span>
        </div>
        <Slider aria-label={c.amountLabel} value={amount} onValueChange={setAmount} min={c.min} max={c.max} step={c.step} />
        <div className="flex justify-between text-caption1 text-foreground-3">
          <span>{money(t, c.min)}</span>
          <span>{money(t, c.max)}</span>
        </div>
      </div>

      <Input label={c.note} placeholder={c.notePlaceholder} />

      <MessageBar intent="info">{c.info}</MessageBar>

      <div className="flex justify-end gap-2">
        <Button>{c.cancel}</Button>
        <Button appearance="primary">{c.save}</Button>
      </div>
    </Card>
  );
}

export default function BillingPage({ t }: PageProps) {
  return (
    <div className="grid items-start gap-4 @3xl:grid-cols-2">
      <Payout t={t} />
      <TransactionsCard t={t} />
    </div>
  );
}
