import { describe, expect, it } from "vitest";
import { addLine, DEMO_CART, lineKey, MAX_QUANTITY, removeLine, setLineQuantity, validLines } from "./cart";
import en from "./content/en";
import vi from "./content/vi";
import { EMPTY_QUERY, filterProducts, parseShopQuery, priceCeiling, shopSearch } from "./filters";
import { describeLines, shippingCost, subtotalOf } from "./lines";
import { convert } from "./money";
import { orderId } from "./orders";
import { CATEGORIES, PRODUCTS } from "./products";
import { parseLocation, pathOf, type Route } from "./router";
import { addressSchema, expiryOk, luhn, paymentSchema } from "./validation";

const usd = (p: { price: number }) => p.price;

describe("store template", () => {
  it("router: path ⇄ route, filters in the query string", () => {
    const routes: Route[] = [
      { name: "shop", query: EMPTY_QUERY },
      { name: "shop", query: { categories: ["tea", "stationery"], min: 10, max: 40, sort: "price-asc" } },
      { name: "product", id: "kyusu" },
      { name: "checkout" },
      { name: "order", id: "SG-4K7Q2M" },
    ];
    for (const route of routes) {
      const [path, search = ""] = pathOf(route).split("?");
      expect(parseLocation(path, search ? `?${search}` : "")).toEqual(route);
    }
    expect(pathOf({ name: "shop", query: { categories: ["ceramics"], sort: "rating" } })).toBe("/?category=ceramics&sort=rating");
    expect(parseLocation("/products/kyusu/reviews")).toEqual({ name: "notFound" });
    // Unknown values are dropped and swapped bounds put back in order, so any shared link opens.
    expect(parseShopQuery("?category=toys&category=tea&min=50&max=x&sort=cheapest")).toEqual({ categories: ["tea"], min: 50, sort: "featured" });
    expect(parseShopQuery("?min=60&max=20")).toMatchObject({ min: 20, max: 60 });
    expect(shopSearch(EMPTY_QUERY)).toBe("");
  });

  it("filters by category and price, sorts", () => {
    const tea = filterProducts(PRODUCTS, { ...EMPTY_QUERY, categories: ["tea"] }, usd);
    expect(tea.length).toBe(4);
    expect(tea.every((p) => p.category === "tea")).toBe(true);
    const cheap = filterProducts(PRODUCTS, { ...EMPTY_QUERY, max: 15, sort: "price-asc" }, usd);
    expect(cheap.map((p) => p.price)).toEqual([...cheap.map((p) => p.price)].sort((a, b) => a - b));
    expect(cheap.every((p) => p.price <= 15)).toBe(true);
    expect(filterProducts(PRODUCTS, { ...EMPTY_QUERY, min: 1000 }, usd)).toEqual([]);
    expect(filterProducts(PRODUCTS, { ...EMPTY_QUERY, sort: "rating" }, usd)[0].id).toBe("matcha");
    expect(priceCeiling(PRODUCTS, usd, 5)).toBe(65);
  });

  it("catalog: 12 products in 3 categories, every one with text in both languages", () => {
    expect(PRODUCTS).toHaveLength(12);
    expect(new Set(PRODUCTS.map((p) => p.category))).toEqual(new Set(CATEGORIES));
    for (const content of [en, vi]) {
      for (const p of PRODUCTS) {
        expect(content.products[p.id].name).toBeTruthy();
        for (const c of p.colors) expect(content.colors[c]).toBeTruthy();
      }
    }
  });

  it("cart: merges the same variant, caps the quantity, drops unknown lines", () => {
    let lines = addLine([], { productId: "pen", color: "ink", quantity: 2 });
    lines = addLine(lines, { productId: "pen", color: "ink", quantity: 3 });
    lines = addLine(lines, { productId: "pen", color: "gold", quantity: 1 });
    expect(lines).toEqual([
      { productId: "pen", color: "ink", quantity: 5 },
      { productId: "pen", color: "gold", quantity: 1 },
    ]);
    const key = lineKey(lines[0]);
    expect(setLineQuantity(lines, key, 99)[0].quantity).toBe(MAX_QUANTITY);
    expect(removeLine(lines, key)).toHaveLength(1);
    expect(validLines(DEMO_CART)).toEqual(DEMO_CART);
    expect(
      validLines([
        { productId: "nope", color: "ink", quantity: 1 },
        { productId: "pen", color: "sakura", quantity: 1 },
        { productId: "kyusu", color: "ink", quantity: 1 },
        { productId: "kyusu", color: "ink", size: "450ml", quantity: "2" },
      ]),
    ).toEqual([{ productId: "kyusu", color: "ink", size: "450ml", quantity: 2 }]);
  });

  it("prices: US dollars in English, rounded dong in Vietnamese; free shipping from the threshold", () => {
    expect(convert(18, "USD")).toBe(18);
    expect(convert(18, "VND")).toBe(450_000);
    const toVnd = (v: number) => convert(v, "VND");
    const lines = describeLines(DEMO_CART, vi, toVnd);
    expect(lines.map((l) => l.total)).toEqual([450_000, 1_100_000]);
    expect(subtotalOf(lines, "VND")).toBe(1_550_000);
    expect(shippingCost("standard", 1_550_000, toVnd)).toBe(0);
    expect(shippingCost("standard", 100_000, toVnd)).toBe(125_000);
    expect(shippingCost("express", 1_550_000, toVnd)).toBe(300_000);
    expect(describeLines([{ productId: "kyusu", color: "celadon", size: "450ml", quantity: 1 }], en, (v) => v)[0]).toMatchObject({
      name: "Kyusu Teapot",
      variant: "Celadon, 450 ml",
      unit: 78,
    });
  });

  it("checkout: validation messages come from the content, card checks run only for card payments", () => {
    const address = addressSchema(en.checkout.errors).safeParse({
      name: "A",
      email: "nope",
      phone: "abc",
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      country: "US",
    });
    expect(address.error?.issues.map((i) => i.message)).toEqual(
      expect.arrayContaining([en.checkout.errors.nameShort, en.checkout.errors.emailInvalid, en.checkout.errors.phoneInvalid, en.checkout.errors.cityRequired]),
    );
    const now = new Date("2026-10-15T00:00:00Z");
    const payment = paymentSchema(vi.checkout.errors, now);
    expect(payment.safeParse({ payment: "cod", cardName: "", cardNumber: "", expiry: "", cvc: "" }).success).toBe(true);
    expect(payment.safeParse({ payment: "card", cardName: "Mai Anh", cardNumber: "4242 4242 4242 4242", expiry: "10/26", cvc: "123" }).success).toBe(true);
    const bad = payment.safeParse({ payment: "card", cardName: "", cardNumber: "4242 4242 4242 4241", expiry: "09/26", cvc: "1" });
    expect(bad.error?.issues.map((i) => i.message)).toEqual(
      expect.arrayContaining([vi.checkout.errors.cardNumberInvalid, vi.checkout.errors.expiryInvalid, vi.checkout.errors.cvcInvalid]),
    );
    expect(luhn("4000000000000002")).toBe(true);
    expect(expiryOk("13/30", now)).toBe(false);
  });

  it("order numbers are short and unambiguous", () => {
    expect(orderId(() => 0)).toBe("SG-222222");
    expect(orderId()).toMatch(/^SG-[2-9A-HJ-NP-Z]{6}$/);
  });
});
