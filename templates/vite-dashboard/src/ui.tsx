import * as React from "react";
import { CalendarEmpty24Regular } from "@fluentui/react-icons";
import {
  AsyncContent,
  Card,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  ErrorState,
  Skeleton,
  SkeletonItem,
  StatTile,
  useYugen,
  type AsyncStatus,
} from "yugen-ui";
import type { Kpis, MetricKey } from "./api";
import { useDashboard } from "./context";
import type { Bucket } from "./dates";
import type { QueryState } from "./useQuery";

/** Number and date formatting in the app's locale (YugenProvider) and currency (content). */
export function useFormat() {
  const { locale } = useYugen();
  const { content } = useDashboard();
  const currency = content.currency;
  return React.useMemo(() => {
    const formats = {
      money: { style: "currency", currency, maximumFractionDigits: 0 },
      moneyCompact: { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 },
      percent: { style: "percent", maximumFractionDigits: 1 },
      count: { maximumFractionDigits: 0 },
    } satisfies Record<string, Intl.NumberFormatOptions>;
    const money = new Intl.NumberFormat(locale, formats.money);
    const count = new Intl.NumberFormat(locale, formats.count);
    const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
    const day = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
    const month = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" });
    const regions = new Intl.DisplayNames([locale], { type: "region" });
    return {
      formats,
      money: (v: number) => money.format(v),
      count: (v: number) => count.format(v),
      date: (d: Date) => date.format(d),
      /** Chart label of a bucket: "Oct 3" for days and weeks, "Oct 2026" for months. */
      bucket: (d: Date, bucket: Bucket) => (bucket === "month" ? month : day).format(d),
      country: (code: string) => regions.of(code) ?? code,
    };
  }, [locale, currency]);
}

/** Loading, error or success of a query; `isEmpty` turns a successful but empty result into the empty state. */
export function statusOf<T>(query: QueryState<T>, isEmpty: (data: T) => boolean = () => false): AsyncStatus {
  if (query.status !== "success") return query.status;
  return query.data !== undefined && isEmpty(query.data) ? "empty" : "success";
}

/** Card title, one level below the page title. */
export function CardTitle({ children }: { children: React.ReactNode }) {
  const { headingLevel } = useDashboard();
  const Heading = headingLevel === 1 ? "h2" : "h3";
  return <Heading className="text-subtitle2 font-semibold text-foreground-1">{children}</Heading>;
}

function CardHead({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <CardTitle>{title}</CardTitle>
      {description && <p className="mt-0.5 text-caption1 text-foreground-3">{description}</p>}
    </div>
  );
}

export function EmptyNote({ title, description, action }: { title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode }) {
  const { content: t } = useDashboard();
  return (
    <Empty className="py-8">
      <EmptyHeader>
        <EmptyMedia>
          <CalendarEmpty24Regular />
        </EmptyMedia>
        <p className="font-display text-subtitle2 font-semibold text-foreground-1">{title ?? t.states.emptyTitle}</p>
        <EmptyDescription>{description ?? t.states.emptyDescription}</EmptyDescription>
      </EmptyHeader>
      {action}
    </Empty>
  );
}

export function LoadError({ retry, retrying }: { retry?: () => void | Promise<unknown>; retrying: boolean }) {
  const { content: t } = useDashboard();
  return <ErrorState size="small" title={t.states.errorTitle} description={t.states.errorDescription} onRetry={retry} retrying={retrying} />;
}

export interface DataCardProps {
  title: string;
  description?: string;
  status: AsyncStatus;
  onRetry: () => void;
  /** Height class of the loading placeholder, close to the real content. */
  skeletonClassName?: string;
  className?: string;
  /**
   * Rendered on success. Charts take `title` (a heading) and `description` and draw the header themselves; other content
   * renders `header`. Either way the card keeps the same header in every state.
   */
  children: (head: { title: React.ReactNode; description?: string; header: React.ReactNode }) => React.ReactNode;
}

/** A card whose content loads: skeleton, error with retry, empty state, then the content. */
export function DataCard({ title, description, status, onRetry, skeletonClassName = "h-60", className, children }: DataCardProps) {
  const head = <CardHead title={title} description={description} />;
  const skeleton = (
    <div className="flex flex-col gap-3">
      {head}
      <Skeleton>
        <SkeletonItem className={skeletonClassName} />
      </Skeleton>
    </div>
  );
  return (
    <Card size="large" className={className ? `min-w-0 ${className}` : "min-w-0"}>
      <AsyncContent
        status={status}
        onRetry={onRetry}
        idle={skeleton}
        skeleton={skeleton}
        error={(state) => (
          <div className="flex flex-col gap-3">
            {head}
            <LoadError {...state} />
          </div>
        )}
        empty={
          <div className="flex flex-col gap-3">
            {head}
            <EmptyNote />
          </div>
        }
      >
        {() => children({ title: <CardTitle>{title}</CardTitle>, description, header: head })}
      </AsyncContent>
    </Card>
  );
}

const FORMAT: Record<MetricKey, "money" | "moneyCompact" | "percent" | "count"> = {
  revenue: "moneyCompact",
  grossRevenue: "moneyCompact",
  refunds: "moneyCompact",
  refundRate: "percent",
  orders: "count",
  aov: "money",
  conversion: "percent",
  customers: "count",
  newCustomers: "count",
  returningRate: "percent",
  revenuePerCustomer: "money",
};

const LOWER_IS_BETTER = new Set<MetricKey>(["refunds", "refundRate"]);

/** A row of KPI tiles with the change against the previous period and a sparkline per bucket. */
export function KpiTiles({ query, metrics }: { query: QueryState<Kpis>; metrics: MetricKey[] }) {
  const { content: t } = useDashboard();
  const f = useFormat();
  const grid = "grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4";
  const skeleton = (
    <div className={grid}>
      {metrics.map((key) => (
        <Card key={key} size="large">
          <span className="text-body1 text-foreground-2">{t.kpi[key]}</span>
          <Skeleton>
            <SkeletonItem size={28} className="w-2/3" />
            <SkeletonItem size={12} className="w-1/2" />
          </Skeleton>
        </Card>
      ))}
    </div>
  );

  return (
    <AsyncContent
      status={statusOf(query)}
      onRetry={query.retry}
      idle={skeleton}
      skeleton={skeleton}
      error={(state) => (
        <Card size="large">
          <LoadError {...state} />
        </Card>
      )}
    >
      {() => {
        const k = query.data as Kpis;
        const labels = k.trendDates.map((d) => f.bucket(d, k.bucket));
        return (
          <div className={grid}>
            {metrics.map((key) => {
              const m = k.metrics[key];
              const delta = m.previous ? (m.value - m.previous) / m.previous : undefined;
              return (
                <Card key={key} size="large">
                  <StatTile
                    label={t.kpi[key]}
                    value={m.value}
                    valueFormat={f.formats[FORMAT[key]]}
                    delta={delta}
                    deltaLabel={delta === undefined ? undefined : t.range.compare(k.days)}
                    goodDirection={LOWER_IS_BETTER.has(key) ? "down" : "up"}
                    trend={m.trend.length > 1 ? m.trend : undefined}
                    trendLabels={labels}
                  />
                </Card>
              );
            })}
          </div>
        );
      }}
    </AsyncContent>
  );
}
