import type { YugenTheme, YugenMessagesInput } from "yugen-ui";
import type { CategoryKey, ChannelKey, CustomerStatus, MetricKey, MockLabels, Scenario, SegmentKey } from "../api";
import type { Bucket } from "../dates";
import type { PageId } from "../router";

/** Text with inline code: `["Edit ", { code: "src/api.ts" }, "."]`. */
export type Rich = (string | { code: string })[];

/** Every string of the dashboard, mock data included. One file per language; `content/index.ts` picks the one the app uses. */
export interface Content {
  lang: "en" | "vi";
  /** Chuỗi có sẵn của component Yugen: messagesEn cho tiếng Anh, bỏ trống = mặc định tiếng Việt. Đặt ở file ngôn ngữ để
   * `create --lang vi` (xoá en.ts) bỏ hẳn bản tiếng Anh khỏi bundle. */
  messages?: YugenMessagesInput;
  /** ISO 4217 code for money. */
  currency: string;
  appName: string;
  storeName: string;
  user: { name: string; email: string; role: string };

  nav: {
    skip: string;
    label: string;
    reports: string;
    workspace: string;
    open: string;
    appearance: string;
    mode: string;
    brand: string;
    account: string;
    signOut: string;
    signOutBody: string;
  };
  search: { label: string; placeholder: string };
  themes: Record<YugenTheme, string>;
  pages: Record<PageId, { label: string; title: string; description: string }>;
  notFound: { title: string; description: string; back: string };

  range: {
    label: string;
    last90Days: string;
    last12Months: string;
    /** Delta label under a KPI, e.g. "vs. previous 30 days". */
    compare: (days: number) => string;
  };
  buckets: Record<Bucket, string>;
  states: { errorTitle: string; errorDescription: string; emptyTitle: string; emptyDescription: string };
  kpi: Record<MetricKey, string>;

  overview: {
    trendTitle: string;
    current: string;
    previous: string;
    channelsTitle: string;
    channelsDescription: string;
    categoriesTitle: string;
    categoriesDescription: string;
    recentTitle: string;
    recentDescription: string;
    viewCustomers: string;
    columns: { order: string; customer: string; category: string; date: string; amount: string; status: string };
    paid: string;
    refunded: string;
  };
  revenue: {
    byCategoryTitle: string;
    segmentsTitle: string;
    segmentsDescription: string;
    countriesTitle: string;
    countriesDescription: string;
  };
  customers: {
    gridTitle: string;
    gridDescription: string;
    segment: string;
    status: string;
    all: string;
    statuses: Record<CustomerStatus, string>;
    columns: { customer: string; email: string; segment: string; status: string; country: string; orders: string; revenue: string; lastOrder: string };
    /** "128 customers" or, with filters, "12 of 128 customers". */
    count: (shown: string, total: string, filtered: boolean) => string;
    query: (text: string) => string;
    pageInfo: (from: string, to: string, total: string) => string;
    noResultsTitle: string;
    noResultsDescription: string;
    clearFilters: string;
    export: string;
    exported: (count: string) => string;
    /** File name without the extension. */
    file: string;
  };
  settings: {
    appearanceTitle: string;
    appearanceDescription: string;
    reportsTitle: string;
    reportsDescription: string;
    weekly: string;
    weeklyHint: string;
    refundAlerts: string;
    refundAlertsHint: string;
    save: string;
    saved: string;
    savedBody: string;
    mockTitle: string;
    mockDescription: Rich;
    latency: string;
    scenario: string;
    scenarios: Record<Scenario, string>;
    reset: string;
  };

  /** Labels of the keys the API returns. */
  data: {
    channels: Record<ChannelKey, string>;
    categories: Record<CategoryKey, string>;
    segments: Record<SegmentKey, string>;
  };
  /** Names, email domain and currency scale of the generated customers (see `api.ts`). */
  mock: MockLabels;
}
