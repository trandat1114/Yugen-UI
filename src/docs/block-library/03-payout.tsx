import { useState } from "react";
import { Button, Card, Input, MessageBar, Slider } from "@/components/ui";

export const meta = { title: "Payout threshold", description: "Set a minimum amount with a Slider and a note", order: 3 };

const format = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function PayoutBlock() {
  const [amount, setAmount] = useState([250]);

  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">Payout threshold</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">The minimum balance before we send a payout.</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-body1">Minimum amount</span>
          <span className="font-display text-title3 font-semibold tabular-nums">{format(amount[0])}</span>
        </div>
        <Slider aria-label="Minimum amount" value={amount} onValueChange={setAmount} min={50} max={1_000} step={50} />
        <div className="flex justify-between text-caption1 text-foreground-3">
          <span>{format(50)}</span>
          <span>{format(1_000)}</span>
        </div>
      </div>

      <Input label="Note" placeholder="Add a note for this setting…" />

      <MessageBar intent="info">Balances above the threshold are paid out on the 15th of each month.</MessageBar>

      <div className="flex justify-end gap-2">
        <Button>Cancel</Button>
        <Button appearance="primary">Save</Button>
      </div>
    </Card>
  );
}
