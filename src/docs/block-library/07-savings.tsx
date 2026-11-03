import { Add16Regular } from "@fluentui/react-icons";
import { Button, Card, ProgressBar } from "@/components/ui";

export const meta = { title: "Savings goal", description: "Track progress with a ProgressBar", order: 7 };

const GOALS = [
  { name: "Retirement fund", saved: 42_000, target: 60_000, color: "brand" as const },
  { name: "Kyoto in cherry blossom season", saved: 3_400, target: 4_250, color: "success" as const },
  { name: "Emergency fund", saved: 2_100, target: 10_000, color: "warning" as const },
];

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function SavingsBlock() {
  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-subtitle1 font-semibold">Savings goals</h3>
          <p className="mt-0.5 text-body1 text-foreground-3">Goals you&apos;re tracking in 2026.</p>
        </div>
        <Button size="small" icon={<Add16Regular />}>
          Add
        </Button>
      </div>

      {GOALS.map((g) => {
        const pct = Math.round((g.saved / g.target) * 100);
        return (
          <div key={g.name} className="rounded-large bg-background-2 p-3">
            <div className="flex items-baseline justify-between">
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{g.name}</p>
              <p className="text-caption1 text-foreground-3">{pct}%</p>
            </div>
            <p className="mt-1 font-display text-title2 font-semibold tabular-nums">
              {usd(g.saved)}
              <span className="text-body1 font-normal text-foreground-3"> / {usd(g.target)}</span>
            </p>
            <ProgressBar value={g.saved / g.target} thickness="large" color={g.color} className="mt-2" aria-label={g.name} />
          </div>
        );
      })}
    </Card>
  );
}
