import { useState } from "react";
import { Cart20Regular, Money20Regular, People20Regular, Receipt20Regular } from "@fluentui/react-icons";
import { AreaChart, BarChart, Card, DonutChart, StatTile, ToggleGroup, ToggleGroupItem } from "@/components/ui";

export const meta = {
  title: "Analytics",
  description: "KPIs, trends, rankings and shares, with one time filter for every card",
  order: 11,
};

type Range = "7" | "30" | "90";

const END = new Date(2026, 9, 20);
const AVERAGE_ORDER = 58;

/** Sample data: daily visitors, ending Oct 20, 2026. */
function visitorsFor(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(END);
    date.setDate(END.getDate() - (days - 1 - i));
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    return {
      date,
      newVisitors: Math.round(620 + 140 * Math.sin(i / 3) + i * 4 - (weekend ? 120 : 0)),
      returning: Math.round(980 + 90 * Math.cos(i / 4) + i * 6 - (weekend ? 160 : 0)),
    };
  });
}

const RANGES: Record<Range, { label: string; scale: number; delta: [number, number, number, number] }> = {
  "7": { label: "7 days", scale: 1, delta: [0.084, 0.052, -0.004, 0.031] },
  "30": { label: "30 days", scale: 4.3, delta: [0.126, 0.091, 0.012, 0.027] },
  "90": { label: "90 days", scale: 12.8, delta: [0.214, 0.162, 0.018, 0.044] },
};

const CATEGORIES = [
  { category: "Audio", revenue: 7400 },
  { category: "Keyboards & mice", revenue: 5700 },
  { category: "Monitors", revenue: 4800 },
  { category: "Desk accessories", revenue: 3000 },
  { category: "Cables & chargers", revenue: 1600 },
];

const DEVICES = [
  { label: "Mobile", value: 5820 },
  { label: "Desktop", value: 3410 },
  { label: "Tablet", value: 940 },
];

export default function AnalyticsBlock() {
  const [range, setRange] = useState<Range>("30");
  const r = RANGES[range];
  const visitors = visitorsFor(Number(range));
  const orders = visitors.map((d) => Math.round((d.newVisitors + d.returning) * 0.034));
  const trend = orders.slice(-12);
  const totalOrders = orders.reduce((a, b) => a + b, 0);
  const totalVisitors = visitors.reduce((a, d) => a + d.newVisitors + d.returning, 0);

  return (
    <div className="@container flex flex-col gap-3">
      {/* Filter: one row on top that drives every card below */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-subtitle1 font-semibold">Sales overview</h3>
          <p className="text-caption1 text-foreground-3">Updated Oct 20, 2026</p>
        </div>
        <ToggleGroup
          type="single"
          size="small"
          value={range}
          onValueChange={(v) => v && setRange(v as Range)}
          aria-label="Time range"
        >
          {(Object.keys(RANGES) as Range[]).map((key) => (
            <ToggleGroupItem key={key} value={key}>
              {RANGES[key].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-3 @lg:grid-cols-2">
        <Card size="large">
          <StatTile
            icon={<Money20Regular />}
            label="Revenue"
            value={totalOrders * AVERAGE_ORDER}
            valueFormat={{ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }}
            delta={r.delta[0]}
            deltaLabel={`vs. previous ${r.label}`}
            trend={trend}
            locale="en-US"
          />
        </Card>
        <Card size="large">
          <StatTile
            icon={<Cart20Regular />}
            label="Orders"
            value={totalOrders}
            delta={r.delta[1]}
            deltaLabel={`vs. previous ${r.label}`}
            trend={trend}
            locale="en-US"
          />
        </Card>
        <Card size="large">
          <StatTile
            icon={<People20Regular />}
            label="Conversion rate"
            value={totalOrders / totalVisitors}
            valueFormat={{ style: "percent", maximumFractionDigits: 2 }}
            delta={r.delta[2]}
            deltaLabel={`vs. previous ${r.label}`}
            locale="en-US"
          />
        </Card>
        <Card size="large">
          <StatTile
            icon={<Receipt20Regular />}
            label="Average order value"
            value={AVERAGE_ORDER * (1 + r.delta[3])}
            valueFormat={{ style: "currency", currency: "USD" }}
            delta={r.delta[3]}
            deltaLabel={`vs. previous ${r.label}`}
            locale="en-US"
          />
        </Card>
      </div>

      <Card size="large">
        <AreaChart
          title="Visitors"
          description={`Last ${r.label}`}
          data={visitors}
          index="date"
          stacked
          series={[
            { key: "returning", label: "Returning visitors" },
            { key: "newVisitors", label: "New visitors" },
          ]}
          height={240}
          locale="en-US"
        />
      </Card>

      <div className="grid gap-3 @2xl:grid-cols-2">
        <Card size="large">
          <BarChart
            title="Revenue by category"
            description="USD"
            data={CATEGORIES.map((c) => ({ ...c, revenue: Math.round(c.revenue * r.scale) }))}
            index="category"
            series={[{ key: "revenue", label: "Revenue" }]}
            valueFormat={{ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }}
            orientation="horizontal"
            showValues
            locale="en-US"
          />
        </Card>
        <Card size="large">
          <DonutChart
            title="Devices"
            description="Share of sessions"
            data={DEVICES.map((d) => ({ ...d, value: Math.round(d.value * r.scale) }))}
            size={168}
            locale="en-US"
          />
        </Card>
      </div>
    </div>
  );
}
