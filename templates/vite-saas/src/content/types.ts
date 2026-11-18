import type { AvatarProps, NotificationIntent, YugenTheme, YugenMessagesInput } from "yugen-ui";

export type PageId = "overview" | "analytics" | "assistant" | "inbox" | "calendar" | "team" | "customers" | "billing" | "settings";

export type TransactionKind = "food" | "shopping" | "income" | "transport" | "entertainment";

export type Role = "owner" | "editor" | "viewer";

export type CustomerTier = "gold" | "silver" | "bronze";

/** A row of the customer directory (pages/customers.tsx). Optional fields show "—" when empty. */
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  tier: CustomerTier;
  orders: number;
  /** Amount owed, in `currency`. */
  balance: number;
  /** ISO date (YYYY-MM-DD). */
  updated: string;
}

/** Every string in the app, and the sample data. One file per language; `content/index.ts` picks the one the app uses. */
export interface Content {
  lang: "en" | "vi";
  /** Chuỗi có sẵn của component Yugen: messagesVi cho tiếng Việt, bỏ trống = mặc định tiếng Anh. Đặt ở file ngôn ngữ để
   * `create --lang vi` (xoá en.ts) bỏ hẳn bản tiếng Anh khỏi bundle. */
  messages?: YugenMessagesInput;
  /** Dates and numbers (also `locale` on YugenProvider). */
  locale: "en-US" | "vi-VN";
  /** Currency of the sample amounts. */
  currency: "USD" | "VND";
  appName: string;
  plan: string;
  user: { name: string; email: string };
  /** Sidebar, breadcrumb, command palette, tab title (`title · appName`) and `<meta name="description">`. */
  pages: Record<PageId, { label: string; title: string; description: string }>;
  themes: Record<YugenTheme, string>;
  shell: {
    nav: string;
    workspace: string;
    manage: string;
    storage: string;
    storageUsed: string;
    storageLabel: string;
    upgrade: string;
    upgradeToast: { title: string; body: string };
    breadcrumb: string;
    search: string;
    searchLabel: string;
    appearance: string;
    mode: string;
    brand: string;
    /** Read before the avatar's name by screen readers. */
    account: string;
    profile: string;
    settings: string;
    palette: string;
    signOut: string;
    signOutToast: { title: string; body: string };
  };
  palette: {
    title: string;
    placeholder: string;
    empty: string;
    pages: string;
    actions: string;
    appearance: string;
    invite: string;
    mode: (theme: string) => string;
    brand: (brand: string) => string;
  };
  exportReport: { label: string; toast: { title: string; body: string } };
  notifications: { id: string; title: string; body: string; author?: string; intent?: NotificationIntent; minutesAgo: number; read?: boolean }[];

  stats: { vsLastMonth: string; items: { label: string; value: string; delta: string; up: boolean; bars: number[] }[] };
  transactions: {
    title: string;
    description: string;
    viewAll: string;
    items: { id: string; kind: TransactionKind; title: string; meta: string; amount: number }[];
  };
  savings: {
    title: string;
    description: string;
    add: string;
    goals: { name: string; saved: number; target: number; color: "brand" | "success" | "warning" }[];
    /** The large number of a goal. */
    amount: (n: number) => string;
    /** The smaller text after it: " / target". */
    of: (n: number) => string;
  };
  analytics: {
    title: string;
    updated: string;
    rangeLabel: string;
    ranges: Record<"7" | "30" | "90", string>;
    vsPrevious: (range: string) => string;
    revenue: string;
    orders: string;
    conversion: string;
    averageOrder: string;
    /** Average order value in `currency`. */
    averageOrderValue: number;
    visitors: { title: string; description: (range: string) => string; returning: string; new: string };
    categories: { title: string; description: string; series: string; items: { category: string; revenue: number }[] };
    devices: { title: string; description: string; items: { label: string; value: number }[] };
  };
  assistant: {
    name: string;
    disclaimer: string;
    close: string;
    thread: string;
    you: string;
    steps: string;
    greeting: string;
    plan: string[];
    answer: string;
    suggestions: string[];
    placeholder: string;
    attach: string;
    /** Added to an answer stopped halfway. */
    stopped: string;
    stoppedEmpty: string;
  };
  inbox: {
    title: string;
    refresh: string;
    tabs: { all: string; unread: string; mentions: string };
    emptyTitle: string;
    emptyBody: string;
    settings: string;
  };
  booking: {
    title: string;
    description: string;
    slotsLabel: string;
    slots: string[];
    confirm: (slot: string, date: string) => string;
    pickDate: string;
  };
  team: {
    title: string;
    description: string;
    emailPlaceholder: string;
    invite: string;
    roles: Record<Role, string>;
    members: { name: string; email: string; role: Role; presence: NonNullable<AvatarProps["presence"]> }[];
  };
  customers: {
    /** Name of the grid. */
    title: string;
    search: string;
    count: (n: number) => string;
    selected: (n: number) => string;
    /** Name of the column picker button: one per table, so two tables never both have a "Columns" button. */
    columnsLabel: string;
    add: string;
    addToast: { title: string; body: string };
    /** Read by screen readers in an empty cell (shown as "—"). */
    none: string;
    columns: Record<"name" | "code" | "email" | "phone" | "address" | "city" | "tier" | "orders" | "balance" | "updated", string>;
    tiers: Record<CustomerTier, string>;
    emptyTitle: string;
    emptyBody: string;
    clear: string;
    items: Customer[];
  };
  payout: {
    title: string;
    description: string;
    amountLabel: string;
    min: number;
    max: number;
    step: number;
    initial: number;
    note: string;
    notePlaceholder: string;
    info: string;
    cancel: string;
    save: string;
  };
  preferences: {
    title: string;
    description: string;
    currencyLabel: string;
    currencyHint: string;
    currencies: { value: string; label: string }[];
    defaultCurrency: string;
    settings: { id: string; label: string; hint: string; on: boolean }[];
    save: string;
    toast: { title: string; body: string };
  };
  feedback: {
    title: string;
    description: string;
    topic: string;
    topics: { feature: string; bug: string; other: string };
    message: string;
    placeholder: string;
    tooShort: string;
    clear: string;
    submit: string;
    toast: { title: string; body: string };
  };
  /** Trang 404 (StatusPage): nút quay về. Tiêu đề và mô tả là chuỗi có sẵn của Yugen (`messages.statusPage`). */
  notFound: { home: string };
}
