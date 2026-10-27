/*
 * Mock back end of the admin: customers and their orders, generated in the browser from a fixed seed and kept in memory
 * (a reload starts over). Every call answers after a short delay like a network request. Lists are paged, sorted and
 * filtered here, as a server would, and come back as one page plus the total. With random errors on, some writes fail,
 * so the optimistic updates in the UI really roll back.
 *
 * To use your own back end, keep the `AdminApi` interface and return an object whose methods call `fetch`, e.g.
 *   listCustomers: (query, signal) => fetch(`/api/customers?${new URLSearchParams(...)}`, { signal }).then((r) => r.json()),
 * then create it in `App.tsx` instead of `createMockApi`.
 */

export const CUSTOMER_STATUSES = ["active", "invited", "suspended"] as const;
export const PLANS = ["free", "pro", "business"] as const;
export const ORDER_STATUSES = ["pending", "paid", "shipped", "refunded"] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];
export type Plan = (typeof PLANS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: CustomerStatus;
  plan: Plan;
  /** Orders that were not refunded, and their total in US dollars. */
  orders: number;
  spent: number;
  /** ISO date and time of sign-up. */
  createdAt: string;
}

/** What the create / edit form sends. */
export type CustomerInput = Pick<Customer, "name" | "email" | "company" | "phone" | "status" | "plan">;

export interface Order {
  /** Order number, e.g. "SO-10042". */
  id: string;
  customerId: string;
  customerName: string;
  /** ISO date and time. */
  date: string;
  items: number;
  /** US dollars. */
  total: number;
  status: OrderStatus;
}

export type SortDirection = "ascending" | "descending";
export type CustomerSortKey = "name" | "company" | "status" | "plan" | "phone" | "orders" | "spent" | "createdAt";
export type OrderSortKey = "id" | "customer" | "date" | "items" | "total" | "status";

export interface CustomerQuery {
  /** 1-based. */
  page: number;
  pageSize: number;
  sort: { column: CustomerSortKey; direction: SortDirection };
  /** Every word must appear in the name, email or company (case and accents ignored). */
  search: string;
  status: CustomerStatus | "all";
  plan: Plan | "all";
}

export interface OrderQuery {
  page: number;
  pageSize: number;
  sort: { column: OrderSortKey; direction: SortDirection };
  /** Order number or customer name. */
  search: string;
  status: OrderStatus | "all";
  /** Only the orders of this customer. */
  customerId?: string;
}

/** One page of a list and the number of rows across all pages. */
export interface PageResult<T> {
  rows: T[];
  total: number;
}

export interface Session {
  name: string;
  email: string;
}

export interface AdminApi {
  listCustomers(query: CustomerQuery, signal?: AbortSignal): Promise<PageResult<Customer>>;
  /** Rejects with `ApiError` 404 when there is no such customer. */
  getCustomer(id: string, signal?: AbortSignal): Promise<Customer>;
  createCustomer(input: CustomerInput): Promise<Customer>;
  updateCustomer(id: string, input: CustomerInput): Promise<Customer>;
  /** Deletes the customers and their orders. */
  deleteCustomers(ids: string[]): Promise<void>;
  listOrders(query: OrderQuery, signal?: AbortSignal): Promise<PageResult<Order>>;
  /** First step of sign-in: checks the password, then "sends" a code. Rejects with 401. */
  signIn(email: string, password: string): Promise<void>;
  /** Second step: the code from the email. Rejects with 401. */
  verifyCode(email: string, code: string): Promise<Session>;
  /** Always resolves, so the page does not reveal which emails have an account. */
  requestPasswordReset(email: string): Promise<void>;
}

/** Error of a failed request. `status` is the HTTP status a real back end would send. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface MockOptions {
  /** Average response time in ms. */
  latency: number;
  /** Share of writes (create, edit, delete) that fail, from 0 to 1. Reads never fail. */
  errorRate: number;
}

/** Error rate when "Random errors" is on in Settings. */
export const RANDOM_ERROR_RATE = 0.2;
export const DEFAULT_MOCK_OPTIONS: MockOptions = { latency: 600, errorRate: RANDOM_ERROR_RATE };

/** The one account of the mock, shown on the sign-in and code pages. */
export const DEMO_ACCOUNT = { email: "admin@sakura.dev", password: "sakura-admin", code: "246810" };

/** Text the generated data is made of, in the app's language. */
export interface MockLabels {
  /** Name of the demo administrator. */
  adminName: string;
  givenNames: string[];
  familyNames: string[];
  /** Family name first (Vietnamese order). */
  familyFirst: boolean;
  companies: string[];
  /** Start of generated phone numbers, e.g. "+1 555". */
  phonePrefix: string;
}

export interface MockApiConfig {
  labels: MockLabels;
  /** Locale used to sort names. */
  locale: string;
  /** Read on every request, so Settings can change them while the app runs. */
  options?: () => MockOptions;
  /** Fixed clock and dice, for tests. */
  now?: () => Date;
  random?: () => number;
}

/* ------------------------------------------------------------------ Data */

const CUSTOMER_COUNT = 120;
const DAY = 86_400_000;

/** Lowercase without accents, so "nguyen" finds "Nguyễn". */
export function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

/** Small seeded generator: the same data on every load. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type StoredCustomer = Omit<Customer, "orders" | "spent">;
type StoredOrder = Omit<Order, "customerName">;

function generate(labels: MockLabels, now: Date) {
  const rand = seeded(152);
  const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
  const weighted = <K extends string>(weights: Record<K, number>): K => {
    const entries = Object.entries(weights) as [K, number][];
    let r = rand();
    for (const [key, weight] of entries) if ((r -= weight) < 0) return key;
    return entries[0][0];
  };
  const digits = (n: number) => Array.from({ length: n }, () => Math.floor(rand() * 10)).join("");

  const customers: StoredCustomer[] = [];
  const orders: Omit<StoredOrder, "id">[] = [];
  const emails = new Set<string>();
  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const given = pick(labels.givenNames);
    const family = pick(labels.familyNames);
    const company = pick(labels.companies);
    const local = fold(`${given}.${family}`).replace(/[^a-z0-9.]/g, "");
    const domain = `${fold(company).replace(/[^a-z0-9]/g, "")}.example`;
    let email = `${local}@${domain}`;
    for (let n = 2; emails.has(email); n++) email = `${local}${n}@${domain}`;
    emails.add(email);

    const created = now.getTime() - Math.floor(rand() * 720 * DAY);
    const status = weighted<CustomerStatus>({ active: 0.72, invited: 0.14, suspended: 0.14 });
    const id = `c-${String(i + 1).padStart(3, "0")}`;
    customers.push({
      id,
      name: labels.familyFirst ? `${family} ${given}` : `${given} ${family}`,
      email,
      company,
      phone: `${labels.phonePrefix} ${digits(3)} ${digits(4)}`,
      status,
      plan: weighted<Plan>({ free: 0.45, pro: 0.4, business: 0.15 }),
      createdAt: new Date(created).toISOString(),
    });

    // Invited customers have not ordered yet.
    if (status === "invited") continue;
    const count = Math.floor(rand() * 9);
    for (let k = 0; k < count; k++) {
      const date = created + rand() * (now.getTime() - created);
      const age = (now.getTime() - date) / DAY;
      const items = 1 + Math.floor(rand() * 5);
      orders.push({
        customerId: id,
        date: new Date(date).toISOString(),
        items,
        total: Math.round(items * (12 + rand() * 180) * 100) / 100,
        status: rand() < 0.05 ? "refunded" : age < 2 ? "pending" : age < 7 ? "paid" : "shipped",
      });
    }
  }
  // Order numbers follow the date.
  orders.sort((a, b) => a.date.localeCompare(b.date));
  return { customers, orders: orders.map((o, i): StoredOrder => ({ ...o, id: `SO-${10001 + i}` })) };
}

/* ------------------------------------------------------------------ Requests */

const abortError = () => new DOMException("The request was aborted.", "AbortError");

/** Resolves (or rejects) after about `latency` ms; stops early when the signal aborts. */
function later<T>(latency: number, signal: AbortSignal | undefined, run: () => T): Promise<T> {
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
        try {
          resolve(run());
        } catch (error) {
          reject(error);
        }
      },
      latency * (0.6 + 0.8 * Math.random()),
    );
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function words(search: string) {
  return fold(search).split(/\s+/).filter(Boolean);
}

function paginate<T>(rows: T[], page: number, pageSize: number): PageResult<T> {
  const start = (Math.max(1, page) - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total: rows.length };
}

/** The mock API. Each call to `createMockApi` has its own data. */
export function createMockApi({ labels, locale, options = () => DEFAULT_MOCK_OPTIONS, now = () => new Date(), random = Math.random }: MockApiConfig): AdminApi {
  const data = generate(labels, now());
  let nextId = data.customers.length + 1;
  const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });

  /** Customers with their order count and total, worked out from the orders. */
  function withTotals(list: StoredCustomer[]): Customer[] {
    const totals = new Map<string, { orders: number; spent: number }>();
    for (const order of data.orders) {
      if (order.status === "refunded") continue;
      const sum = totals.get(order.customerId) ?? { orders: 0, spent: 0 };
      sum.orders += 1;
      sum.spent += order.total;
      totals.set(order.customerId, sum);
    }
    return list.map((c) => {
      const sum = totals.get(c.id);
      return { ...c, orders: sum?.orders ?? 0, spent: Math.round((sum?.spent ?? 0) * 100) / 100 };
    });
  }

  const customerOrder: Record<CustomerSortKey, (a: Customer, b: Customer) => number> = {
    name: (a, b) => collator.compare(a.name, b.name),
    company: (a, b) => collator.compare(a.company, b.company),
    status: (a, b) => CUSTOMER_STATUSES.indexOf(a.status) - CUSTOMER_STATUSES.indexOf(b.status),
    plan: (a, b) => PLANS.indexOf(a.plan) - PLANS.indexOf(b.plan),
    phone: (a, b) => a.phone.localeCompare(b.phone),
    orders: (a, b) => a.orders - b.orders,
    spent: (a, b) => a.spent - b.spent,
    createdAt: (a, b) => a.createdAt.localeCompare(b.createdAt),
  };
  const orderOrder: Record<OrderSortKey, (a: Order, b: Order) => number> = {
    id: (a, b) => collator.compare(a.id, b.id),
    customer: (a, b) => collator.compare(a.customerName, b.customerName),
    date: (a, b) => a.date.localeCompare(b.date),
    items: (a, b) => a.items - b.items,
    total: (a, b) => a.total - b.total,
    status: (a, b) => ORDER_STATUSES.indexOf(a.status) - ORDER_STATUSES.indexOf(b.status),
  };

  /** A write: same delay, and fails now and then when random errors are on. */
  function write<T>(run: () => T) {
    const { latency, errorRate } = options();
    return later(latency, undefined, () => {
      if (random() < errorRate) throw new ApiError(503, "Random error from the mock API (Settings → Random errors).");
      return run();
    });
  }

  const find = (id: string) => data.customers.find((c) => c.id === id);
  const clean = (input: CustomerInput): CustomerInput => ({
    name: input.name.trim(),
    email: input.email.trim(),
    company: input.company.trim(),
    phone: input.phone.trim(),
    status: input.status,
    plan: input.plan,
  });

  return {
    listCustomers: (query, signal) =>
      later(options().latency, signal, () => {
        const terms = words(query.search);
        const rows = withTotals(data.customers).filter(
          (c) =>
            (query.status === "all" || c.status === query.status) &&
            (query.plan === "all" || c.plan === query.plan) &&
            terms.every((w) => fold(`${c.name} ${c.email} ${c.company}`).includes(w)),
        );
        const compare = customerOrder[query.sort.column] ?? customerOrder.createdAt;
        const sign = query.sort.direction === "descending" ? -1 : 1;
        // Ties fall back to the name, then the id, so paging never shows a row twice.
        rows.sort((a, b) => sign * compare(a, b) || customerOrder.name(a, b) || a.id.localeCompare(b.id));
        return paginate(rows, query.page, query.pageSize);
      }),

    getCustomer: (id, signal) =>
      later(options().latency, signal, () => {
        const customer = find(id);
        if (!customer) throw new ApiError(404, `No customer ${id}.`);
        return withTotals([customer])[0];
      }),

    createCustomer: (input) =>
      write(() => {
        const customer: StoredCustomer = {
          ...clean(input),
          id: `c-${String(nextId++).padStart(3, "0")}`,
          createdAt: now().toISOString(),
        };
        data.customers.push(customer);
        return withTotals([customer])[0];
      }),

    updateCustomer: (id, input) =>
      write(() => {
        const customer = find(id);
        if (!customer) throw new ApiError(404, `No customer ${id}.`);
        Object.assign(customer, clean(input));
        return withTotals([customer])[0];
      }),

    deleteCustomers: (ids) =>
      write(() => {
        const gone = new Set(ids);
        data.customers = data.customers.filter((c) => !gone.has(c.id));
        data.orders = data.orders.filter((o) => !gone.has(o.customerId));
      }),

    listOrders: (query, signal) =>
      later(options().latency, signal, () => {
        const names = new Map(data.customers.map((c) => [c.id, c.name]));
        const terms = words(query.search);
        const rows = data.orders
          .filter((o) => (query.customerId === undefined || o.customerId === query.customerId) && (query.status === "all" || o.status === query.status))
          .map((o): Order => ({ ...o, customerName: names.get(o.customerId) ?? "" }))
          .filter((o) => terms.every((w) => fold(`${o.id} ${o.customerName}`).includes(w)));
        const compare = orderOrder[query.sort.column] ?? orderOrder.date;
        const sign = query.sort.direction === "descending" ? -1 : 1;
        rows.sort((a, b) => sign * compare(a, b) || a.id.localeCompare(b.id));
        return paginate(rows, query.page, query.pageSize);
      }),

    signIn: (email, password) =>
      later(options().latency, undefined, () => {
        if (email.trim().toLowerCase() !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
          throw new ApiError(401, "Wrong email or password.");
        }
      }),

    verifyCode: (email, code) =>
      later(options().latency, undefined, () => {
        if (email.trim().toLowerCase() !== DEMO_ACCOUNT.email || code !== DEMO_ACCOUNT.code) throw new ApiError(401, "Wrong code.");
        return { name: labels.adminName, email: DEMO_ACCOUNT.email };
      }),

    requestPasswordReset: () => later(options().latency, undefined, () => undefined),
  };
}
