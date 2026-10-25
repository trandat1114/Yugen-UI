import * as React from "react";
import type { YugenBrand, YugenTheme } from "yugen-ui";
import type { DashboardApi, MockOptions } from "./api";
import type { Content } from "./content/types";
import type { DateRange } from "./dates";

export interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
}

export const THEMES: YugenTheme[] = ["light", "dark", "high-contrast"];

/** Brand names stay the same in every language. */
export const BRANDS: { value: YugenBrand; label: string }[] = [
  { value: "sakura", label: "Sakura" },
  { value: "web", label: "Web" },
  { value: "teams", label: "Teams" },
];

/** State shared by every page: one date range for the whole app, the customer search and the mock API settings. */
export interface DashboardValue {
  content: Content;
  api: DashboardApi;
  range: DateRange;
  setRange: (range: DateRange) => void;
  /** Customer search from the top bar. */
  query: string;
  setQuery: (query: string) => void;
  mock: MockOptions;
  setMock: (patch: Partial<MockOptions>) => void;
  appearance: Appearance;
  setAppearance: (patch: Partial<Appearance>) => void;
  /** Page title level: 1 in the app, 2 when embedded in another page. Card titles are one level below. */
  headingLevel: 1 | 2;
}

export const DashboardContext = React.createContext<DashboardValue | null>(null);

export function useDashboard() {
  const value = React.useContext(DashboardContext);
  if (!value) throw new Error("useDashboard must be used inside <Dashboard>");
  return value;
}
