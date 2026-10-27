/**
 * The catalog: ids, prices, variants and ratings. Names, descriptions and colour names are text, so they live in
 * `content/`. Prices are in US dollars; `money.ts` converts them for other currencies. Replace this file with data from
 * your back end (keep the `Product` shape, or adapt the pages that read it).
 */

export const CATEGORIES = ["tea", "ceramics", "stationery"] as const;
export type Category = (typeof CATEGORIES)[number];

/** Which drawing `ProductArt.tsx` uses for the product (the template has no photos). */
export type ArtKind = "tin" | "pouch" | "teapot" | "cup" | "bowl" | "plate" | "notebook" | "pen" | "tape" | "letter";

/** Colours of the goods themselves (glazes, tins, covers): product data, not theme colours. */
export const COLORS = {
  sakura: "#e8a5b8",
  matcha: "#7d9a4f",
  indigo: "#34507f",
  ink: "#2e2e33",
  celadon: "#9fc3b0",
  ash: "#a9a39a",
  cream: "#eee2c9",
  rust: "#b3592f",
  gold: "#c9a227",
  sky: "#8db8d8",
} as const;
export type ColorId = keyof typeof COLORS;

export interface ProductSize {
  id: string;
  /** Shown as is in every language ("100 g", "A5"). */
  label: string;
  /** Price of this size, US dollars. */
  price: number;
}

export interface Product {
  id: ProductId;
  category: Category;
  art: ArtKind;
  /** Price of the first size (or the only one), US dollars. Filters and sorting use it. */
  price: number;
  /** The first colour is the one selected when the page opens. */
  colors: ColorId[];
  sizes?: ProductSize[];
  /** Average out of 5 and the number of reviews. */
  rating: number;
  reviews: number;
}

export type ProductId =
  | "sencha"
  | "hojicha"
  | "genmaicha"
  | "matcha"
  | "kyusu"
  | "yunomi"
  | "chawan"
  | "plates"
  | "notebook"
  | "pen"
  | "washi"
  | "letters";

/** In the order of the "Featured" sort. */
export const PRODUCTS: Product[] = [
  {
    id: "kyusu",
    category: "ceramics",
    art: "teapot",
    price: 64,
    colors: ["celadon", "ink", "cream"],
    sizes: [
      { id: "300ml", label: "300 ml", price: 64 },
      { id: "450ml", label: "450 ml", price: 78 },
    ],
    rating: 4.8,
    reviews: 73,
  },
  {
    id: "sencha",
    category: "tea",
    art: "tin",
    price: 18,
    colors: ["matcha", "ink"],
    sizes: [
      { id: "50g", label: "50 g", price: 18 },
      { id: "100g", label: "100 g", price: 32 },
    ],
    rating: 4.7,
    reviews: 128,
  },
  { id: "washi", category: "stationery", art: "tape", price: 9, colors: ["sakura", "sky", "matcha"], rating: 4.8, reviews: 305 },
  { id: "yunomi", category: "ceramics", art: "cup", price: 22, colors: ["indigo", "sakura", "ash"], rating: 4.6, reviews: 140 },
  {
    id: "matcha",
    category: "tea",
    art: "tin",
    price: 34,
    colors: ["sakura", "matcha"],
    sizes: [
      { id: "30g", label: "30 g", price: 34 },
      { id: "80g", label: "80 g", price: 79 },
    ],
    rating: 4.9,
    reviews: 212,
  },
  {
    id: "notebook",
    category: "stationery",
    art: "notebook",
    price: 12,
    colors: ["sakura", "indigo", "matcha"],
    sizes: [
      { id: "a6", label: "A6", price: 12 },
      { id: "a5", label: "A5", price: 16 },
    ],
    rating: 4.7,
    reviews: 96,
  },
  { id: "chawan", category: "ceramics", art: "bowl", price: 48, colors: ["ash", "rust", "celadon"], rating: 4.7, reviews: 39 },
  {
    id: "hojicha",
    category: "tea",
    art: "pouch",
    price: 14,
    colors: ["rust", "cream"],
    sizes: [
      { id: "80g", label: "80 g", price: 14 },
      { id: "160g", label: "160 g", price: 25 },
    ],
    rating: 4.5,
    reviews: 86,
  },
  { id: "pen", category: "stationery", art: "pen", price: 42, colors: ["ink", "gold"], rating: 4.6, reviews: 47 },
  { id: "plates", category: "ceramics", art: "plate", price: 26, colors: ["indigo", "cream"], rating: 4.4, reviews: 61 },
  { id: "genmaicha", category: "tea", art: "pouch", price: 12, colors: ["cream", "sakura"], rating: 4.3, reviews: 54 },
  { id: "letters", category: "stationery", art: "letter", price: 11, colors: ["cream", "sakura"], rating: 4.2, reviews: 28 },
];

const BY_ID = new Map(PRODUCTS.map((p) => [p.id as string, p]));

export const findProduct = (id: string): Product | undefined => BY_ID.get(id);

/** Price of a size of the product (or its only price), US dollars. */
export function unitPrice(product: Product, sizeId?: string): number {
  return product.sizes?.find((s) => s.id === sizeId)?.price ?? product.price;
}

/** Delivery options. Prices in US dollars; standard is free from `freeFrom`. `days`: delivery window after the order. */
export const SHIPPING = [
  { id: "standard", price: 5, freeFrom: 50, days: [3, 5] },
  { id: "express", price: 12, days: [1, 2] },
  { id: "pickup", price: 0, days: [1, 1] },
] as const;
export type ShippingId = (typeof SHIPPING)[number]["id"];
export const shippingOption = (id: ShippingId) => SHIPPING.find((s) => s.id === id) ?? SHIPPING[0];
