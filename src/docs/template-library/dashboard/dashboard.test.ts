import { describe, expect, it } from "vitest";
import { ApiError, createMockApi, HISTORY_DAYS } from "./api";
import en from "./content/en";
import vi from "./content/vi";
import { toCsv } from "./csv";
import { addDays, bucketOf, lastDays, rangeDays, splitRange } from "./dates";
import { parsePath } from "./router";

const TODAY = new Date(2026, 9, 25);
const now = () => TODAY;
const fast = { latency: 0, scenario: "normal" as const };

describe("dates", () => {
  it("splitRange covers the range without gaps", () => {
    const range = { from: new Date(2026, 0, 30), to: new Date(2026, 3, 2) };
    for (const bucket of ["day", "week", "month"] as const) {
      const parts = splitRange(range, bucket);
      expect(parts[0].from).toEqual(range.from);
      expect(parts.at(-1)!.to).toEqual(range.to);
      expect(parts.reduce((n, p) => n + rangeDays(p), 0)).toBe(rangeDays(range));
    }
    expect(splitRange(range, "month").map((p) => p.from.getMonth())).toEqual([0, 1, 2, 3]);
  });

  it("picks daily, weekly or monthly points by length", () => {
    expect([1, 31, 32, 120, 121].map(bucketOf)).toEqual(["day", "day", "week", "week", "month"]);
  });
});

describe("mock api", () => {
  const api = createMockApi(en.mock, fast, now);
  const range = lastDays(30, TODAY);

  it("KPIs, chart points and customer rows agree", async () => {
    const [kpis, series, customers] = await Promise.all([api.getKpis(range), api.getTimeseries(range), api.getCustomers(range)]);
    const m = kpis.metrics;
    expect(m.orders.value).toBeGreaterThan(0);
    expect(series.bucket).toBe("day");
    expect(series.points).toHaveLength(30);
    expect(series.points.reduce((n, p) => n + p.orders, 0)).toBe(m.orders.value);
    expect(customers.reduce((n, c) => n + c.orders, 0)).toBe(m.orders.value);
    expect(customers).toHaveLength(m.customers.value);
    expect(customers.filter((c) => c.status === "new")).toHaveLength(m.newCustomers.value);
    expect(m.revenue.value).toBeCloseTo(m.grossRevenue.value - m.refunds.value, 1);
    expect(m.revenue.trend).toHaveLength(30);
    expect(m.revenue.previous).not.toBeNull();
  });

  it("is repeatable and names customers in the content language", async () => {
    const [a, b] = await Promise.all([api.getRecentOrders(range, 3), createMockApi(vi.mock, fast, now).getRecentOrders(range, 3)]);
    expect(a.map((o) => o.id)).toEqual(b.map((o) => o.id));
    expect(b[0].amount).toBeCloseTo(a[0].amount * vi.mock.moneyScale, 0);
    expect(en.mock.givenNames.some((n) => a[0].customer.startsWith(n))).toBe(true);
    expect(vi.mock.familyNames.some((n) => b[0].customer.startsWith(n))).toBe(true);
    expect(b[0].email).toMatch(/^[a-z0-9.]+@example\.com$/);
  });

  it("returns nothing before the store opened", async () => {
    const before = { from: addDays(TODAY, -HISTORY_DAYS - 60), to: addDays(TODAY, -HISTORY_DAYS - 1) };
    const [kpis, series] = await Promise.all([api.getKpis(before), api.getTimeseries(before)]);
    expect(kpis.metrics.orders.value).toBe(0);
    expect(kpis.metrics.orders.previous).toBeNull();
    expect(series.points).toEqual([]);
  });

  it("empty and error scenarios, abort", async () => {
    expect(await createMockApi(en.mock, { latency: 0, scenario: "empty" }, now).getCustomers(range)).toEqual([]);
    await expect(createMockApi(en.mock, { latency: 0, scenario: "error" }, now).getKpis(range)).rejects.toBeInstanceOf(ApiError);
    const controller = new AbortController();
    const pending = createMockApi(en.mock, { latency: 1000, scenario: "normal" }, now).getKpis(range, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("csv", () => {
  it("quotes commas, quotes and line breaks, and defuses formulas", () => {
    const csv = toCsv(
      [{ a: 'He said "hi", twice', b: -3 }, { a: "=SUM(A1)", b: 2 }],
      [
        { header: "Name", value: (r) => r.a },
        { header: "N", value: (r) => r.b },
      ],
    );
    expect(csv).toBe('Name,N\r\n"He said ""hi"", twice",-3\r\n\'=SUM(A1),2');
  });
});

describe("router", () => {
  it("maps paths to pages", () => {
    expect(parsePath("/")).toBe("overview");
    expect(parsePath("/revenue")).toBe("revenue");
    expect(parsePath("/customers/")).toBe("customers");
    expect(parsePath("/overview")).toBe("notFound");
    expect(parsePath("/nope")).toBe("notFound");
  });
});
