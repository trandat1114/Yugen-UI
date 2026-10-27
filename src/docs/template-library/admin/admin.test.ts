import { describe, expect, it } from "vitest";
import { ApiError, createMockApi, DEMO_ACCOUNT, type CustomerQuery } from "./api";
import en from "./content/en";
import vi from "./content/vi";
import { parseLocation, pathOf, safeNext, type Route } from "./router";
import { customerSchema } from "./validation";

const query = (patch: Partial<CustomerQuery> = {}): CustomerQuery => ({
  page: 1,
  pageSize: 10,
  search: "",
  status: "all",
  plan: "all",
  sort: { column: "createdAt", direction: "descending" },
  ...patch,
});

const mock = (errorRate = 0, random = () => 0.5) =>
  createMockApi({ labels: en.mock, locale: en.locale, options: () => ({ latency: 0, errorRate }), now: () => new Date("2026-10-01T00:00:00Z"), random });

describe("admin template", () => {
  it("router: path ⇄ route, next only inside the app", () => {
    const routes: Route[] = [
      { name: "customers" },
      { name: "customer", id: "c-007" },
      { name: "orders" },
      { name: "settings" },
      { name: "signIn" },
      { name: "signIn", next: "/orders" },
      { name: "forgotPassword" },
      { name: "verify", next: "/customers/c-007" },
    ];
    for (const route of routes) {
      const [path, search = ""] = pathOf(route).split("?");
      expect(parseLocation(path, search ? `?${search}` : "")).toEqual(route);
    }
    expect(parseLocation("/")).toEqual({ name: "customers" });
    expect(parseLocation("/customers/c-007/orders")).toEqual({ name: "notFound" });
    expect(safeNext("https://evil.example")).toBeUndefined();
    expect(safeNext("//evil.example")).toBeUndefined();
    expect(safeNext("/sign-in")).toBeUndefined();
    expect(safeNext("/orders")).toBe("/orders");
  });

  it("lists a page with the total, sorted and filtered on the server", async () => {
    const api = mock();
    const first = await api.listCustomers(query());
    expect(first.rows).toHaveLength(10);
    expect(first.total).toBe(120);
    const dates = first.rows.map((c) => c.createdAt);
    expect(dates).toEqual([...dates].sort().reverse());

    const second = await api.listCustomers(query({ page: 2 }));
    expect(second.rows.map((c) => c.id)).not.toContain(first.rows[0].id);

    const active = await api.listCustomers(query({ status: "active", pageSize: 200 }));
    expect(active.rows.every((c) => c.status === "active")).toBe(true);
    expect(active.total).toBe(active.rows.length);

    const bySpent = await api.listCustomers(query({ sort: { column: "spent", direction: "descending" } }));
    expect(bySpent.rows[0].spent).toBeGreaterThanOrEqual(bySpent.rows[9].spent);
  });

  it("search ignores case and Vietnamese accents", async () => {
    const api = createMockApi({ labels: vi.mock, locale: vi.locale, options: () => ({ latency: 0, errorRate: 0 }) });
    const { rows } = await api.listCustomers(query({ search: "NGUYEN", pageSize: 200 }));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((c) => c.name.includes("Nguyễn"))).toBe(true);
  });

  it("writes change the data; with random errors on they fail and change nothing", async () => {
    const api = mock();
    const created = await api.createCustomer({ name: "Ada Park", email: "ada@park.example", company: "", phone: "", status: "active", plan: "pro" });
    expect((await api.getCustomer(created.id)).name).toBe("Ada Park");
    await api.updateCustomer(created.id, { ...created, name: "Ada Park-Lee" });
    expect((await api.getCustomer(created.id)).name).toBe("Ada Park-Lee");
    await api.deleteCustomers([created.id]);
    await expect(api.getCustomer(created.id)).rejects.toMatchObject({ status: 404 });

    const failing = mock(1);
    const before = await failing.listCustomers(query());
    await expect(failing.deleteCustomers([before.rows[0].id])).rejects.toBeInstanceOf(ApiError);
    expect((await failing.listCustomers(query())).total).toBe(before.total);
  });

  it("orders of one customer; deleting the customer removes them", async () => {
    const api = mock();
    const { rows } = await api.listCustomers(query({ sort: { column: "orders", direction: "descending" } }));
    const customer = rows[0];
    const orders = await api.listOrders({ page: 1, pageSize: 100, search: "", status: "all", customerId: customer.id, sort: { column: "date", direction: "descending" } });
    expect(orders.rows.every((o) => o.customerId === customer.id && o.customerName === customer.name)).toBe(true);
    expect(orders.rows.filter((o) => o.status !== "refunded")).toHaveLength(customer.orders);
    await api.deleteCustomers([customer.id]);
    const after = await api.listOrders({ page: 1, pageSize: 100, search: "", status: "all", customerId: customer.id, sort: { column: "date", direction: "descending" } });
    expect(after.total).toBe(0);
  });

  it("sign-in accepts only the demo account and code", async () => {
    const api = mock();
    await expect(api.signIn(DEMO_ACCOUNT.email, "nope")).rejects.toMatchObject({ status: 401 });
    await expect(api.signIn(` ${DEMO_ACCOUNT.email.toUpperCase()} `, DEMO_ACCOUNT.password)).resolves.toBeUndefined();
    await expect(api.verifyCode(DEMO_ACCOUNT.email, "000000")).rejects.toMatchObject({ status: 401 });
    expect(await api.verifyCode(DEMO_ACCOUNT.email, DEMO_ACCOUNT.code)).toEqual({ name: en.mock.adminName, email: DEMO_ACCOUNT.email });
  });

  it("validation messages come from the content", () => {
    const result = customerSchema(en.form.errors).safeParse({ name: "A", email: "nope", company: "", phone: "abc", status: "active", plan: "free" });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toEqual(expect.arrayContaining([en.form.errors.nameShort, en.form.errors.emailInvalid, en.form.errors.phoneInvalid]));
  });
});
