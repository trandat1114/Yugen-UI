import { Add16Regular, ArrowTrending16Regular, ArrowTrendingDown16Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, ProgressBar } from "yugen-ui";
import type { PageProps } from "../pages";
import { TransactionsCard } from "./TransactionsCard";

function Stats({ t }: PageProps) {
  return (
    <div className="grid gap-3">
      {t.stats.items.map((s) => (
        <Card key={s.label} className="flex-row items-end justify-between gap-4 rounded-xlarge p-4">
          <div className="min-w-0">
            <p className="text-caption1 text-foreground-3">{s.label}</p>
            <p className="mt-0.5 font-display text-title2 font-semibold tabular-nums">{s.value}</p>
            <Badge
              appearance="tint"
              color={s.up ? "success" : "danger"}
              icon={s.up ? <ArrowTrending16Regular className="rtl:-scale-x-100" /> : <ArrowTrendingDown16Regular className="rtl:-scale-x-100" />}
              className="mt-2"
            >
              {s.delta} {t.stats.vsLastMonth}
            </Badge>
          </div>
          <div className="flex h-16 shrink-0 items-end gap-0.5" aria-hidden>
            {s.bars.map((h, i) => (
              <span
                key={i}
                className={i === s.bars.length - 1 ? "w-2 rounded-small bg-brand-background" : "w-2 rounded-small bg-brand-background-2-hover"}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function Savings({ t }: PageProps) {
  const c = t.savings;
  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
          <p className="mt-0.5 text-body1 text-foreground-3">{c.description}</p>
        </div>
        <Button size="small" icon={<Add16Regular />}>
          {c.add}
        </Button>
      </div>

      {c.goals.map((g) => {
        const pct = Math.round((g.saved / g.target) * 100);
        return (
          <div key={g.name} className="rounded-large bg-background-2 p-3">
            <div className="flex items-baseline justify-between">
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{g.name}</p>
              <p className="text-caption1 text-foreground-3">{pct}%</p>
            </div>
            <p className="mt-1 font-display text-title2 font-semibold tabular-nums">
              {c.amount(g.saved)}
              <span className="text-body1 font-normal text-foreground-3">{c.of(g.target)}</span>
            </p>
            <ProgressBar value={g.saved / g.target} thickness="large" color={g.color} className="mt-2" aria-label={g.name} />
          </div>
        );
      })}
    </Card>
  );
}

export default function OverviewPage({ t }: PageProps) {
  return (
    <>
      <Stats t={t} />
      <div className="grid items-start gap-4 @3xl:grid-cols-2">
        <TransactionsCard t={t} />
        <Savings t={t} />
      </div>
    </>
  );
}
