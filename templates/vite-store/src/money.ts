/**
 * Money in one place. Catalog prices are US dollars; another currency uses a fixed rate and is rounded to a sensible
 * unit. A real shop would keep a price list per currency on its back end instead.
 */
export const CURRENCIES = {
  USD: { rate: 1, round: (v: number) => Math.round(v * 100) / 100, step: 5 },
  VND: { rate: 25_000, round: (v: number) => Math.round(v / 1_000) * 1_000, step: 100_000 },
} as const;
export type Currency = keyof typeof CURRENCIES;

/** A US dollar price in `currency`, rounded. */
export const convert = (usd: number, currency: Currency) => CURRENCIES[currency].round(usd * CURRENCIES[currency].rate);

/** Price filter step (slider) in `currency`. */
export const priceStep = (currency: Currency) => CURRENCIES[currency].step;

/** Sum of amounts already in one currency, without floating point dust. */
export const sum = (values: number[], currency: Currency) => CURRENCIES[currency].round(values.reduce((a, b) => a + b, 0));

export interface Format {
  /** An amount already in the app's currency. */
  money: (value: number) => string;
  count: (value: number) => string;
  date: (date: Date) => string;
  /** Country name from an ISO 3166 code. */
  country: (code: string) => string;
}

export function createFormat(locale: string, currency: Currency): Format {
  const money = new Intl.NumberFormat(locale, { style: "currency", currency });
  const count = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" });
  const regions = new Intl.DisplayNames([locale], { type: "region" });
  return {
    money: (v) => money.format(v),
    count: (v) => count.format(v),
    date: (d) => date.format(d),
    country: (code) => regions.of(code) ?? code,
  };
}
