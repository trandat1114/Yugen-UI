import * as React from "react";
import type { AdminApi, MockOptions } from "./api";
import type { Appearance } from "./appearance";
import type { Content } from "./content/types";

/** Number, money and date formats in the app's locale. */
export interface Format {
  count: (value: number) => string;
  money: (value: number) => string;
  date: (iso: string) => string;
}

export function createFormat(locale: string, currency: string): Format {
  const count = new Intl.NumberFormat(locale);
  const money = new Intl.NumberFormat(locale, { style: "currency", currency });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  return { count: (v) => count.format(v), money: (v) => money.format(v), date: (iso) => date.format(new Date(iso)) };
}

export interface AdminValue {
  t: Content;
  api: AdminApi;
  format: Format;
  mock: MockOptions;
  setMock: (patch: Partial<MockOptions>) => void;
  appearance: Appearance;
  setAppearance: (patch: Partial<Appearance>) => void;
  /** Embedded in another page (the docs preview): headings start at h2, nothing is saved. */
  embedded: boolean;
}

export const AdminContext = React.createContext<AdminValue | null>(null);

export function useAdmin() {
  const value = React.useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside the admin App");
  return value;
}
