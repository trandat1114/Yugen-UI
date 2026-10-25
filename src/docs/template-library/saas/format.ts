import type { Content } from "./content/types";

const formats = new Map<string, Intl.NumberFormat>();

/** 2500000 → "2.500.000 ₫" (vi) · 250 → "$250" (en): theo `locale` và `currency` của nội dung. */
export function money(t: Content, n: number) {
  const key = `${t.locale}:${t.currency}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(t.locale, { style: "currency", currency: t.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
    formats.set(key, format);
  }
  return format.format(n);
}

/** Số tiền có dấu: "+28.500.000 ₫", "−65.000 ₫". */
export const signedMoney = (t: Content, n: number) => (n > 0 ? "+" : "−") + money(t, Math.abs(n));
