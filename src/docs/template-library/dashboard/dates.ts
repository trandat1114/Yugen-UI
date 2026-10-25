/** Calendar-day helpers. Dates are local midnight; day counts ignore daylight saving shifts. */

/** Both ends included. */
export interface DateRange {
  from: Date;
  to: Date;
}

/** Size of one point on a chart: a day, a 7-day step or a calendar month. */
export type Bucket = "day" | "week" | "month";

const DAY = 86_400_000;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Whole days from `a` to `b` (negative when `b` is earlier). */
export const daysBetween = (a: Date, b: Date) =>
  Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY);

/** Number of days in a range, both ends included. */
export const rangeDays = (range: DateRange) => daysBetween(range.from, range.to) + 1;

/** The last `n` days, ending today. */
export const lastDays = (n: number, today = new Date()) => ({ from: addDays(startOfDay(today), -(n - 1)), to: startOfDay(today) });

/** The current month and the `n - 1` months before it, ending today. */
export const lastMonths = (n: number, today = new Date()) => ({
  from: new Date(today.getFullYear(), today.getMonth() - (n - 1), 1),
  to: startOfDay(today),
});

/** Daily points up to a month, weekly up to four months, monthly above that. */
export const bucketOf = (days: number): Bucket => (days <= 31 ? "day" : days <= 120 ? "week" : "month");

/** "2026-10-25" in local time (file names, CSV cells). */
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Splits a range into consecutive buckets that cover it exactly (the last one may be shorter). */
export function splitRange(range: DateRange, bucket: Bucket): DateRange[] {
  const out: DateRange[] = [];
  const end = startOfDay(range.to);
  let from = startOfDay(range.from);
  while (from <= end) {
    const next = bucket === "day" ? addDays(from, 1) : bucket === "week" ? addDays(from, 7) : new Date(from.getFullYear(), from.getMonth() + 1, 1);
    const to = addDays(next, -1);
    out.push({ from, to: to > end ? end : to });
    from = next;
  }
  return out;
}
