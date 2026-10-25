import { useState } from "react";
import { Cart20Regular, Money20Regular, People20Regular, Receipt20Regular } from "@fluentui/react-icons";
import { AreaChart, BarChart, Card, DonutChart, StatTile, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import type { PageProps } from "../pages";

type Range = "7" | "30" | "90";

const END = new Date(2026, 9, 20);

/** Dữ liệu mẫu: lượt khách theo ngày, kết thúc ngày 20/10/2026. */
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

const RANGES: Record<Range, { scale: number; delta: [number, number, number, number] }> = {
  "7": { scale: 1, delta: [0.084, 0.052, -0.004, 0.031] },
  "30": { scale: 4.3, delta: [0.126, 0.091, 0.012, 0.027] },
  "90": { scale: 12.8, delta: [0.214, 0.162, 0.018, 0.044] },
};

export default function AnalyticsPage({ t }: PageProps) {
  const c = t.analytics;
  const [range, setRange] = useState<Range>("30");
  const r = RANGES[range];
  const label = c.ranges[range];
  const vs = c.vsPrevious(label);
  const visitors = visitorsFor(Number(range));
  const orders = visitors.map((d) => Math.round((d.newVisitors + d.returning) * 0.034));
  const trend = orders.slice(-12);
  const totalOrders = orders.reduce((a, b) => a + b, 0);
  const totalVisitors = visitors.reduce((a, d) => a + d.newVisitors + d.returning, 0);

  return (
    <div className="@container flex flex-col gap-3">
      {/* Bộ lọc: một hàng phía trên, tác động mọi thẻ bên dưới */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
          <p className="text-caption1 text-foreground-3">{c.updated}</p>
        </div>
        <ToggleGroup type="single" size="small" value={range} onValueChange={(v) => v && setRange(v as Range)} aria-label={c.rangeLabel}>
          {(Object.keys(RANGES) as Range[]).map((key) => (
            <ToggleGroupItem key={key} value={key}>
              {c.ranges[key]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-3 @lg:grid-cols-2">
        <Card size="large">
          <StatTile
            icon={<Money20Regular />}
            label={c.revenue}
            value={totalOrders * c.averageOrderValue}
            valueFormat={{ style: "currency", currency: t.currency, notation: "compact", maximumFractionDigits: 1 }}
            delta={r.delta[0]}
            deltaLabel={vs}
            trend={trend}
          />
        </Card>
        <Card size="large">
          <StatTile icon={<Cart20Regular />} label={c.orders} value={totalOrders} delta={r.delta[1]} deltaLabel={vs} trend={trend} />
        </Card>
        <Card size="large">
          <StatTile
            icon={<People20Regular />}
            label={c.conversion}
            value={totalOrders / totalVisitors}
            valueFormat={{ style: "percent", maximumFractionDigits: 2 }}
            delta={r.delta[2]}
            deltaLabel={vs}
          />
        </Card>
        <Card size="large">
          <StatTile
            icon={<Receipt20Regular />}
            label={c.averageOrder}
            value={c.averageOrderValue * (1 + r.delta[3])}
            valueFormat={{ style: "currency", currency: t.currency, maximumFractionDigits: 0 }}
            delta={r.delta[3]}
            deltaLabel={vs}
          />
        </Card>
      </div>

      <Card size="large">
        <AreaChart
          title={c.visitors.title}
          description={c.visitors.description(label)}
          data={visitors}
          index="date"
          stacked
          series={[
            { key: "returning", label: c.visitors.returning },
            { key: "newVisitors", label: c.visitors.new },
          ]}
          height={240}
        />
      </Card>

      <div className="grid gap-3 @2xl:grid-cols-2">
        <Card size="large">
          <BarChart
            title={c.categories.title}
            description={c.categories.description}
            data={c.categories.items.map((item) => ({ ...item, revenue: Math.round(item.revenue * r.scale) }))}
            index="category"
            series={[{ key: "revenue", label: c.categories.series }]}
            orientation="horizontal"
            showValues
          />
        </Card>
        <Card size="large">
          <DonutChart
            title={c.devices.title}
            description={c.devices.description}
            data={c.devices.items.map((d) => ({ ...d, value: Math.round(d.value * r.scale) }))}
            size={168}
          />
        </Card>
      </div>
    </div>
  );
}
