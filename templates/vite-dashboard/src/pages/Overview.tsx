import { ArrowRight16Regular } from "@fluentui/react-icons";
import {
  Badge,
  BarChart,
  Button,
  DonutChart,
  LineChart,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  type ChartColor,
} from "yugen-ui";
import { useDashboard } from "../context";
import { Link } from "../router";
import { DataCard, KpiTiles, statusOf, useFormat } from "../ui";
import { useQuery } from "../useQuery";

export default function Overview() {
  const { api, range, content: t } = useDashboard();
  const f = useFormat();
  const kpis = useQuery((signal) => api.getKpis(range, signal), [api, range]);
  const series = useQuery((signal) => api.getTimeseries(range, signal), [api, range]);
  const breakdown = useQuery((signal) => api.getBreakdown(range, signal), [api, range]);
  const recent = useQuery((signal) => api.getRecentOrders(range, 6, signal), [api, range]);
  const c = t.overview.columns;

  return (
    <>
      <KpiTiles query={kpis} metrics={["revenue", "orders", "aov", "conversion"]} />

      <DataCard
        title={t.overview.trendTitle}
        description={series.data && t.buckets[series.data.bucket]}
        status={statusOf(series, (d) => d.points.every((p) => p.orders === 0))}
        onRetry={series.retry}
        skeletonClassName="h-66"
      >
        {({ title, description }) => {
          const { bucket, points } = series.data!;
          return (
            <LineChart
              title={title}
              description={description}
              data={points}
              index="date"
              series={[
                { key: "revenue", label: t.overview.current },
                { key: "previousRevenue", label: t.overview.previous },
              ]}
              highlight="revenue"
              valueFormat={f.formats.money}
              axisFormat={f.formats.moneyCompact}
              xFormat={(v) => f.bucket(v as Date, bucket)}
              xTooltipFormat={(v) => f.bucket(v as Date, bucket)}
              height={260}
            />
          );
        }}
      </DataCard>

      <div className="grid gap-4 @3xl:grid-cols-2">
        <DataCard
          title={t.overview.channelsTitle}
          description={t.overview.channelsDescription}
          status={statusOf(breakdown, (d) => d.channels.every((ch) => ch.orders === 0))}
          onRetry={breakdown.retry}
          skeletonClassName="h-44"
        >
          {({ title, description }) => (
            <DonutChart
              title={title}
              description={description}
              // Colors follow the channel, not its rank, so they stay put when the order changes.
              data={breakdown.data!.channels.map((ch, i) => ({ label: t.data.channels[ch.key], value: ch.orders, color: (i + 1) as ChartColor }))}
              valueFormat={f.formats.count}
              size={168}
            />
          )}
        </DataCard>
        <DataCard
          title={t.overview.categoriesTitle}
          description={t.overview.categoriesDescription}
          status={statusOf(breakdown, (d) => d.categories.every((cat) => cat.revenue === 0))}
          onRetry={breakdown.retry}
          skeletonClassName="h-44"
        >
          {({ title, description }) => (
            <BarChart
              title={title}
              description={description}
              data={[...breakdown.data!.categories]
                .sort((a, b) => b.revenue - a.revenue)
                .map((cat) => ({ category: t.data.categories[cat.key], revenue: cat.revenue }))}
              index="category"
              series={[{ key: "revenue", label: t.kpi.revenue }]}
              orientation="horizontal"
              valueFormat={f.formats.money}
              axisFormat={f.formats.moneyCompact}
            />
          )}
        </DataCard>
      </div>

      <DataCard
        title={t.overview.recentTitle}
        description={t.overview.recentDescription}
        status={statusOf(recent, (d) => d.length === 0)}
        onRetry={recent.retry}
        skeletonClassName="h-56"
      >
        {({ header }) => (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              {header}
              <Button asChild size="small" appearance="subtle">
                <Link to="customers">
                  {t.overview.viewCustomers}
                  <ArrowRight16Regular aria-hidden className="rtl:-scale-x-100" />
                </Link>
              </Button>
            </div>
            {/* Scrolls sideways on narrow screens; focusable so keyboard users can scroll it too. */}
            <div role="region" aria-label={t.overview.recentTitle} tabIndex={0} className="overflow-x-auto rounded-medium">
              <Table className="min-w-xl">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell className="w-20">{c.order}</TableHeaderCell>
                    <TableHeaderCell>{c.customer}</TableHeaderCell>
                    <TableHeaderCell>{c.category}</TableHeaderCell>
                    <TableHeaderCell className="w-28">{c.date}</TableHeaderCell>
                    <TableHeaderCell className="w-28 text-end">{c.amount}</TableHeaderCell>
                    <TableHeaderCell className="w-32">{c.status}</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.data!.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-caption1 text-foreground-3">#{o.id}</TableCell>
                      <TableCell className="truncate">{o.customer}</TableCell>
                      <TableCell className="truncate text-foreground-2">{t.data.categories[o.category]}</TableCell>
                      <TableCell className="text-foreground-2">{f.date(o.date)}</TableCell>
                      <TableCell className="text-end tabular-nums">{f.money(o.amount)}</TableCell>
                      <TableCell>
                        <Badge appearance="tint" color={o.refunded ? "warning" : "success"}>
                          {o.refunded ? t.overview.refunded : t.overview.paid}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DataCard>
    </>
  );
}
