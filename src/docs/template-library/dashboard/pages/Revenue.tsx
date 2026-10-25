import { BarChart, DonutChart, type ChartColor } from "@/components/ui";
import { CATEGORIES } from "../api";
import { useDashboard } from "../context";
import { DataCard, KpiTiles, statusOf, useFormat } from "../ui";
import { useQuery } from "../useQuery";

export default function Revenue() {
  const { api, range, content: t } = useDashboard();
  const f = useFormat();
  const kpis = useQuery((signal) => api.getKpis(range, signal), [api, range]);
  const series = useQuery((signal) => api.getTimeseries(range, signal), [api, range]);
  const breakdown = useQuery((signal) => api.getBreakdown(range, signal), [api, range]);

  return (
    <>
      <KpiTiles query={kpis} metrics={["grossRevenue", "refunds", "revenue", "refundRate"]} />

      <DataCard
        title={t.revenue.byCategoryTitle}
        description={series.data && t.buckets[series.data.bucket]}
        status={statusOf(series, (d) => d.points.every((p) => p.orders === 0))}
        onRetry={series.retry}
        skeletonClassName="h-72"
      >
        {({ title, description }) => {
          const { bucket, points } = series.data!;
          return (
            <BarChart
              title={title}
              description={description}
              data={points.map((p) => ({ ...p, label: f.bucket(p.date, bucket) }))}
              index="label"
              series={CATEGORIES.map((key, i) => ({ key, label: t.data.categories[key], color: (i + 1) as ChartColor }))}
              layout="stacked"
              valueFormat={f.formats.money}
              axisFormat={f.formats.moneyCompact}
              height={280}
            />
          );
        }}
      </DataCard>

      <div className="grid gap-4 @3xl:grid-cols-2">
        <DataCard
          title={t.revenue.segmentsTitle}
          description={t.revenue.segmentsDescription}
          status={statusOf(breakdown, (d) => d.segments.every((s) => s.revenue === 0))}
          onRetry={breakdown.retry}
          skeletonClassName="h-44"
        >
          {({ title, description }) => (
            <DonutChart
              title={title}
              description={description}
              data={breakdown.data!.segments.map((s, i) => ({ label: t.data.segments[s.key], value: s.revenue, color: (i + 1) as ChartColor }))}
              valueFormat={f.formats.moneyCompact}
              size={168}
            />
          )}
        </DataCard>
        <DataCard
          title={t.revenue.countriesTitle}
          description={t.revenue.countriesDescription}
          status={statusOf(breakdown, (d) => d.countries.every((c) => c.revenue === 0))}
          onRetry={breakdown.retry}
          skeletonClassName="h-44"
        >
          {({ title, description }) => (
            <BarChart
              title={title}
              description={description}
              data={breakdown.data!.countries.slice(0, 6).map((c) => ({ country: f.country(c.code), revenue: c.revenue }))}
              index="country"
              series={[{ key: "revenue", label: t.kpi.revenue }]}
              orientation="horizontal"
              valueFormat={f.formats.money}
              axisFormat={f.formats.moneyCompact}
            />
          )}
        </DataCard>
      </div>
    </>
  );
}
