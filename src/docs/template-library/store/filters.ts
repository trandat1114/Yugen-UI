import { CATEGORIES, type Category, type Product } from "./products";

/** Filters of the product grid. They live in the URL (`?category=tea&min=10&max=40&sort=price-asc`). */
export interface ShopQuery {
  categories: Category[];
  /** Price bounds in the app's currency; missing = no bound. */
  min?: number;
  max?: number;
  sort: Sort;
}

export const SORTS = ["featured", "price-asc", "price-desc", "rating"] as const;
export type Sort = (typeof SORTS)[number];

export const EMPTY_QUERY: ShopQuery = { categories: [], sort: "featured" };

const amount = (value: string | null) => {
  if (value === null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Reads the filters from a query string; unknown values are dropped, so any shared link opens. */
export function parseShopQuery(search: string): ShopQuery {
  const params = new URLSearchParams(search);
  const categories = CATEGORIES.filter((c) => params.getAll("category").includes(c));
  const sort = SORTS.find((s) => s === params.get("sort")) ?? "featured";
  let min = amount(params.get("min"));
  let max = amount(params.get("max"));
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  return { categories, sort, ...(min !== undefined && { min }), ...(max !== undefined && { max }) };
}

/** Query string for the filters, "" when none is set. Categories keep the catalog order. */
export function shopSearch(query: ShopQuery): string {
  const params = new URLSearchParams();
  for (const c of CATEGORIES) if (query.categories.includes(c)) params.append("category", c);
  if (query.min !== undefined) params.set("min", String(query.min));
  if (query.max !== undefined) params.set("max", String(query.max));
  if (query.sort !== "featured") params.set("sort", query.sort);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export const isFiltered = (query: ShopQuery) => query.categories.length > 0 || query.min !== undefined || query.max !== undefined;

/** Products that match the filters, in the chosen order. `price`: price of a product in the app's currency. */
export function filterProducts(products: Product[], query: ShopQuery, price: (product: Product) => number): Product[] {
  const matches = products.filter(
    (p) =>
      (query.categories.length === 0 || query.categories.includes(p.category)) &&
      (query.min === undefined || price(p) >= query.min) &&
      (query.max === undefined || price(p) <= query.max),
  );
  switch (query.sort) {
    case "price-asc":
      return matches.sort((a, b) => price(a) - price(b));
    case "price-desc":
      return matches.sort((a, b) => price(b) - price(a));
    case "rating":
      return matches.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    default:
      return matches;
  }
}

/** Upper end of the price slider: the dearest product, rounded up to a step. */
export function priceCeiling(products: Product[], price: (product: Product) => number, step: number) {
  return Math.ceil(Math.max(...products.map(price)) / step) * step;
}
