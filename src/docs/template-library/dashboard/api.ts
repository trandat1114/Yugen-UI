import { addDays, bucketOf, daysBetween, rangeDays, splitRange, startOfDay, type Bucket, type DateRange } from "./dates";

/*
 * Mock data layer of the dashboard: an online store with about 18 months of orders, generated in the browser from a
 * fixed seed. Every call resolves after a short delay, like a network request, so the loading, empty and error states
 * in the UI are real.
 *
 * To use your own backend, keep the `DashboardApi` interface and return an object whose methods call `fetch`, for example
 * `getKpis: (range, signal) => fetch(`/api/kpis?from=…&to=…`, { signal }).then((r) => r.json())`.
 */

export type ChannelKey = "organic" | "ads" | "email" | "social" | "referral";
export type CategoryKey = "audio" | "keyboards" | "monitors" | "desk" | "cables";
export type SegmentKey = "retail" | "business";
/** "new": the customer's first order falls inside the selected range. */
export type CustomerStatus = "new" | "returning";

export const CHANNELS: ChannelKey[] = ["organic", "ads", "email", "social", "referral"];
export const CATEGORIES: CategoryKey[] = ["audio", "keyboards", "monitors", "desk", "cables"];
export const SEGMENTS: SegmentKey[] = ["retail", "business"];
/** ISO 3166 region codes. The UI shows their names with `Intl.DisplayNames`. */
export const COUNTRIES = ["US", "VN", "GB", "DE", "JP", "AU", "CA", "SG", "FR", "NL"];

export type MetricKey =
  | "revenue"
  | "grossRevenue"
  | "refunds"
  | "refundRate"
  | "orders"
  | "aov"
  | "conversion"
  | "customers"
  | "newCustomers"
  | "returningRate"
  | "revenuePerCustomer";

const METRIC_KEYS: MetricKey[] = [
  "revenue",
  "grossRevenue",
  "refunds",
  "refundRate",
  "orders",
  "aov",
  "conversion",
  "customers",
  "newCustomers",
  "returningRate",
  "revenuePerCustomer",
];

export interface Metric {
  value: number;
  /** The same metric over the period of equal length just before the range. `null` when the store had no data yet. */
  previous: number | null;
  /** One value per bucket of the range, for sparklines. */
  trend: number[];
}

export interface Kpis {
  metrics: Record<MetricKey, Metric>;
  /** Length of the range in days (and of the period it is compared with). */
  days: number;
  bucket: Bucket;
  /** First day of each trend bucket. */
  trendDates: Date[];
}

/** One chart point. Money is net of refunds; category keys hold the net revenue of that category. */
export type SeriesPoint = {
  date: Date;
  revenue: number;
  /** Revenue of the bucket one period earlier, `null` before the store's first day. */
  previousRevenue: number | null;
  refunds: number;
  orders: number;
  newCustomers: number;
} & Record<CategoryKey, number>;

export interface Timeseries {
  bucket: Bucket;
  points: SeriesPoint[];
}

export interface Breakdown {
  channels: { key: ChannelKey; orders: number; revenue: number }[];
  categories: { key: CategoryKey; orders: number; revenue: number }[];
  segments: { key: SegmentKey; customers: number; revenue: number }[];
  /** Highest revenue first. */
  countries: { code: string; revenue: number }[];
}

export interface Order {
  id: string;
  date: Date;
  customer: string;
  email: string;
  category: CategoryKey;
  channel: ChannelKey;
  amount: number;
  refunded: boolean;
}

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  segment: SegmentKey;
  country: string;
  joined: Date;
  status: CustomerStatus;
  /** Orders inside the range. */
  orders: number;
  /** Net revenue inside the range. */
  revenue: number;
  lastOrder: Date;
}

export interface DashboardApi {
  getKpis(range: DateRange, signal?: AbortSignal): Promise<Kpis>;
  getTimeseries(range: DateRange, signal?: AbortSignal): Promise<Timeseries>;
  getBreakdown(range: DateRange, signal?: AbortSignal): Promise<Breakdown>;
  /** Newest first. */
  getRecentOrders(range: DateRange, limit: number, signal?: AbortSignal): Promise<Order[]>;
  /** Customers with at least one order inside the range. */
  getCustomers(range: DateRange, signal?: AbortSignal): Promise<CustomerRow[]>;
}

/** Names and currency of the generated customers. Each language has its own, in `content/`. */
export interface MockLabels {
  givenNames: string[];
  familyNames: string[];
  /** Family name first (Vietnamese order). */
  familyFirst: boolean;
  emailDomain: string;
  /** Prices are generated in US dollars and multiplied by this, e.g. 25000 for Vietnamese dong. */
  moneyScale: number;
}

export type Scenario = "normal" | "empty" | "error";

export interface MockOptions {
  /** Average response time in ms. */
  latency: number;
  /** "empty" returns no data, "error" fails every request. */
  scenario: Scenario;
}

export const DEFAULT_MOCK_OPTIONS: MockOptions = { latency: 700, scenario: "normal" };

/** Error of a failed request. `status` is the HTTP status a real backend would send. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Days of history in the mock store, ending today. Ranges before that come back empty. */
export const HISTORY_DAYS = 548;

/* ------------------------------------------------------------------ Generated store */

interface RawCustomer {
  given: number;
  family: number;
  segment: number;
  country: number;
  joinedDay: number;
}

interface RawOrder {
  day: number;
  customer: number;
  category: number;
  channel: number;
  /** US dollars. */
  amount: number;
  refunded: boolean;
}

interface Store {
  start: Date;
  customers: RawCustomer[];
  /** Sorted by day. */
  orders: RawOrder[];
  /** Index of each day's first order, plus one entry past the end. */
  dayStart: number[];
  visitors: number[];
}

/** mulberry32: small seeded generator, so every reload shows the same numbers. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weighted(weights: number[], r: number) {
  let x = r * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < weights.length; i++) {
    x -= weights[i];
    if (x < 0) return i;
  }
  return weights.length - 1;
}

const CHANNEL_WEIGHTS = [34, 24, 16, 14, 12];
const CATEGORY_WEIGHTS = [26, 24, 12, 22, 16];
const CATEGORY_PRICE = [120, 95, 260, 45, 18];
const COUNTRY_WEIGHTS = [28, 14, 10, 9, 9, 7, 7, 6, 5, 5];
/** Sunday first, like Date.getDay(). */
const WEEKDAY = [0.82, 1.04, 1.06, 1.05, 1.02, 0.98, 0.86];
const MONTH = [0.9, 0.92, 1, 1, 1, 0.96, 0.94, 0.97, 1.02, 1.06, 1.24, 1.32];

function buildStore(today: Date): Store {
  const rand = seeded(20260101);
  const start = addDays(today, -(HISTORY_DAYS - 1));
  const customers: RawCustomer[] = [];
  const orders: RawOrder[] = [];
  const dayStart: number[] = [];
  const visitors: number[] = [];

  for (let day = 0; day < HISTORY_DAYS; day++) {
    const date = addDays(start, day);
    const growth = 1 + (0.7 * day) / HISTORY_DAYS;
    const count = Math.round(24 * growth * WEEKDAY[date.getDay()] * MONTH[date.getMonth()] * (0.85 + 0.3 * rand()));
    const newShare = 0.26 + 0.1 * rand();
    dayStart.push(orders.length);
    visitors.push(Math.round(count / (0.022 + 0.01 * rand())));

    for (let i = 0; i < count; i++) {
      let customer: number;
      if (customers.length < 40 || rand() < newShare) {
        customer =
          customers.push({
            given: Math.floor(rand() * 1e6),
            family: Math.floor(rand() * 1e6),
            segment: rand() < 0.22 ? 1 : 0,
            country: weighted(COUNTRY_WEIGHTS, rand()),
            joinedDay: day,
          }) - 1;
      } else {
        // Recent customers order more often than old ones.
        customer = Math.floor(customers.length * Math.sqrt(rand()));
      }
      const category = weighted(CATEGORY_WEIGHTS, rand());
      const business = customers[customer].segment === 1;
      orders.push({
        day,
        customer,
        category,
        channel: weighted(CHANNEL_WEIGHTS, rand()),
        amount: Math.round(CATEGORY_PRICE[category] * (0.6 + 0.9 * rand()) * (business ? 1.8 : 1) * 100) / 100,
        refunded: rand() < 0.035,
      });
    }
  }
  dayStart.push(orders.length);
  return { start, customers, orders, dayStart, visitors };
}

let cached: { day: number; store: Store } | undefined;

/** The store ends today; it is rebuilt when the date changes. */
function storeFor(now: Date) {
  const day = startOfDay(now).getTime();
  if (cached?.day !== day) cached = { day, store: buildStore(startOfDay(now)) };
  return cached.store;
}

/** Day indexes of a range clipped to the store's history, or `null` when they do not overlap. */
function span(store: Store, range: DateRange): [number, number] | null {
  const from = Math.max(0, daysBetween(store.start, range.from));
  const to = Math.min(store.visitors.length - 1, daysBetween(store.start, range.to));
  return from <= to ? [from, to] : null;
}

function* ordersIn(store: Store, range: DateRange) {
  const s = span(store, range);
  if (!s) return;
  for (let i = store.dayStart[s[0]]; i < store.dayStart[s[1] + 1]; i++) yield store.orders[i];
}

interface Totals {
  gross: number;
  refunds: number;
  orders: number;
  visitors: number;
  customers: number;
  newCustomers: number;
  returning: number;
}

const NO_TOTALS: Totals = { gross: 0, refunds: 0, orders: 0, visitors: 0, customers: 0, newCustomers: 0, returning: 0 };

function totals(store: Store, range: DateRange): Totals | null {
  const s = span(store, range);
  if (!s) return null;
  const t = { ...NO_TOTALS };
  const seen = new Set<number>();
  for (let d = s[0]; d <= s[1]; d++) t.visitors += store.visitors[d];
  for (const o of ordersIn(store, range)) {
    t.orders++;
    t.gross += o.amount;
    if (o.refunded) t.refunds += o.amount;
    if (!seen.has(o.customer)) {
      seen.add(o.customer);
      if (store.customers[o.customer].joinedDay < s[0]) t.returning++;
      else t.newCustomers++;
    }
  }
  t.customers = seen.size;
  return t;
}

const money = (usd: number, scale: number) => Math.round(usd * scale * 100) / 100;

function metricsOf(t: Totals, scale: number): Record<MetricKey, number> {
  const net = money(t.gross - t.refunds, scale);
  return {
    revenue: net,
    grossRevenue: money(t.gross, scale),
    refunds: money(t.refunds, scale),
    refundRate: t.gross ? t.refunds / t.gross : 0,
    orders: t.orders,
    aov: t.orders ? money(t.gross / t.orders, scale) : 0,
    conversion: t.visitors ? t.orders / t.visitors : 0,
    customers: t.customers,
    newCustomers: t.newCustomers,
    returningRate: t.customers ? t.returning / t.customers : 0,
    revenuePerCustomer: t.customers ? Math.round((net / t.customers) * 100) / 100 : 0,
  };
}

/** The period of equal length that ends the day before `range` starts. */
export const previousRange = (range: DateRange): DateRange => {
  const days = rangeDays(range);
  return { from: addDays(range.from, -days), to: addDays(range.from, -1) };
};

/** Days before the store's first day have no data at all: a range there is the empty state. */
function kpis(store: Store | null, range: DateRange, scale: number): Kpis {
  const bucket = bucketOf(rangeDays(range));
  const parts = splitRange(range, bucket);
  const now = metricsOf((store && totals(store, range)) ?? NO_TOTALS, scale);
  const before = store && totals(store, previousRange(range));
  const prev = before ? metricsOf(before, scale) : null;
  const trends = store ? parts.map((p) => metricsOf(totals(store, p) ?? NO_TOTALS, scale)) : [];
  const metrics = Object.fromEntries(
    METRIC_KEYS.map((key) => [key, { value: now[key], previous: prev ? prev[key] : null, trend: trends.map((t) => t[key]) }]),
  ) as Record<MetricKey, Metric>;
  return { metrics, days: rangeDays(range), bucket, trendDates: store ? parts.map((p) => p.from) : [] };
}

function timeseries(store: Store, range: DateRange, scale: number): Timeseries {
  const bucket = bucketOf(rangeDays(range));
  const days = rangeDays(range);
  if (!span(store, range)) return { bucket, points: [] };
  const points = splitRange(range, bucket).map((part): SeriesPoint => {
    const byCategory = CATEGORIES.map(() => 0);
    let gross = 0;
    let refunds = 0;
    let orders = 0;
    let newCustomers = 0;
    for (const o of ordersIn(store, part)) {
      orders++;
      gross += o.amount;
      if (o.refunded) refunds += o.amount;
      else byCategory[o.category] += o.amount;
      if (isFirstOrder(store, o)) newCustomers++;
    }
    const before = totals(store, { from: addDays(part.from, -days), to: addDays(part.to, -days) });
    return {
      date: part.from,
      revenue: money(gross - refunds, scale),
      previousRevenue: before ? money(before.gross - before.refunds, scale) : null,
      refunds: money(refunds, scale),
      orders,
      newCustomers,
      ...(Object.fromEntries(CATEGORIES.map((key, i) => [key, money(byCategory[i], scale)])) as Record<CategoryKey, number>),
    };
  });
  return { bucket, points };
}

const firstOrder = new WeakMap<Store, Int32Array>();

/** True for the first order a customer ever placed. */
function isFirstOrder(store: Store, order: RawOrder) {
  let first = firstOrder.get(store);
  if (!first) {
    first = new Int32Array(store.customers.length).fill(-1);
    store.orders.forEach((o, i) => {
      if (first![o.customer] === -1) first![o.customer] = i;
    });
    firstOrder.set(store, first);
  }
  return store.orders[first[order.customer]] === order;
}

function breakdown(store: Store, range: DateRange, scale: number): Breakdown {
  const channels = CHANNELS.map((key) => ({ key, orders: 0, revenue: 0 }));
  const categories = CATEGORIES.map((key) => ({ key, orders: 0, revenue: 0 }));
  const segments = SEGMENTS.map((key) => ({ key, customers: 0, revenue: 0 }));
  const countries = COUNTRIES.map((code) => ({ code, revenue: 0 }));
  const seen = new Set<number>();
  for (const o of ordersIn(store, range)) {
    const c = store.customers[o.customer];
    const net = o.refunded ? 0 : o.amount;
    channels[o.channel].orders++;
    channels[o.channel].revenue += net;
    categories[o.category].orders++;
    categories[o.category].revenue += net;
    segments[c.segment].revenue += net;
    countries[c.country].revenue += net;
    if (!seen.has(o.customer)) {
      seen.add(o.customer);
      segments[c.segment].customers++;
    }
  }
  const scaled = <T extends { revenue: number }>(rows: T[]) => rows.map((r) => ({ ...r, revenue: money(r.revenue, scale) }));
  return {
    channels: scaled(channels),
    categories: scaled(categories),
    segments: scaled(segments),
    countries: scaled(countries).sort((a, b) => b.revenue - a.revenue),
  };
}

/* ------------------------------------------------------------------ Names */

const ascii = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const peopleCache = new WeakMap<MockLabels, { store: Store; people: { name: string; email: string }[] }>();

function peopleOf(store: Store, labels: MockLabels) {
  const hit = peopleCache.get(labels);
  if (hit?.store === store) return hit.people;
  const used = new Map<string, number>();
  const people = store.customers.map((c) => {
    const given = labels.givenNames[c.given % labels.givenNames.length];
    const family = labels.familyNames[c.family % labels.familyNames.length];
    const base = `${ascii(given.split(" ").pop() ?? given)}.${ascii(family)}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return { name: labels.familyFirst ? `${family} ${given}` : `${given} ${family}`, email: `${base}${n > 1 ? n : ""}@${labels.emailDomain}` };
  });
  peopleCache.set(labels, { store, people });
  return people;
}

/* ------------------------------------------------------------------ Requests */

const abortError = () => new DOMException("The request was aborted.", "AbortError");

/** Resolves after about `latency` ms, or fails, depending on the mock options. */
function respond<T>(options: MockOptions, signal: AbortSignal | undefined, empty: () => T, load: () => T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    const timer = setTimeout(
      () => {
        signal?.removeEventListener("abort", onAbort);
        if (options.scenario === "error") {
          reject(new ApiError(503, "The mock API is set to fail every request."));
          return;
        }
        try {
          resolve(options.scenario === "empty" ? empty() : load());
        } catch (error) {
          reject(error);
        }
      },
      options.latency * (0.6 + 0.8 * Math.random()),
    );
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * The mock API. `labels` gives the generated customers names in the app's language; `now` is only there for tests.
 */
export function createMockApi(labels: MockLabels, options: MockOptions = DEFAULT_MOCK_OPTIONS, now: () => Date = () => new Date()): DashboardApi {
  const store = () => storeFor(now());
  const scale = labels.moneyScale;

  return {
    getKpis: (range, signal) => respond(options, signal, () => kpis(null, range, scale), () => kpis(store(), range, scale)),

    getTimeseries: (range, signal) =>
      respond(options, signal, () => ({ bucket: bucketOf(rangeDays(range)), points: [] }), () => timeseries(store(), range, scale)),

    getBreakdown: (range, signal) =>
      respond(
        options,
        signal,
        () => ({ channels: [], categories: [], segments: [], countries: [] }),
        () => breakdown(store(), range, scale),
      ),

    getRecentOrders: (range, limit, signal) =>
      respond(
        options,
        signal,
        () => [],
        () => {
          const s = store();
          const people = peopleOf(s, labels);
          const days = span(s, range);
          if (!days) return [];
          const out: Order[] = [];
          for (let i = s.dayStart[days[1] + 1] - 1; i >= s.dayStart[days[0]] && out.length < limit; i--) {
            const o = s.orders[i];
            out.push({
              id: String(10000 + i),
              date: addDays(s.start, o.day),
              customer: people[o.customer].name,
              email: people[o.customer].email,
              category: CATEGORIES[o.category],
              channel: CHANNELS[o.channel],
              amount: money(o.amount, scale),
              refunded: o.refunded,
            });
          }
          return out;
        },
      ),

    getCustomers: (range, signal) =>
      respond(
        options,
        signal,
        () => [],
        () => {
          const s = store();
          const people = peopleOf(s, labels);
          const fromDay = daysBetween(s.start, range.from);
          const byCustomer = new Map<number, { orders: number; revenue: number; last: number }>();
          for (const o of ordersIn(s, range)) {
            const row = byCustomer.get(o.customer) ?? { orders: 0, revenue: 0, last: o.day };
            row.orders++;
            if (!o.refunded) row.revenue += o.amount;
            row.last = o.day;
            byCustomer.set(o.customer, row);
          }
          return [...byCustomer].map(([index, row]): CustomerRow => {
            const c = s.customers[index];
            return {
              id: `c${index}`,
              name: people[index].name,
              email: people[index].email,
              segment: SEGMENTS[c.segment],
              country: COUNTRIES[c.country],
              joined: addDays(s.start, c.joinedDay),
              status: c.joinedDay >= fromDay ? "new" : "returning",
              orders: row.orders,
              revenue: money(row.revenue, scale),
              lastOrder: addDays(s.start, row.last),
            };
          });
        },
      ),
  };
}
