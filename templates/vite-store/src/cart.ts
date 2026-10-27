import * as React from "react";
import { findProduct, type ColorId } from "./products";

/** One product in one colour and size. Prices are not stored: they come from the catalog when shown. */
export interface CartLine {
  productId: string;
  color: ColorId;
  size?: string;
  quantity: number;
}

export const MAX_QUANTITY = 10;
const STORAGE_KEY = "yugen-store-cart";

/**
 * The first visit starts with two items in the cart, so checkout can be tried at once (and the docs preview has
 * something to show). Set it to `[]` for a real shop.
 */
export const DEMO_CART: CartLine[] = [
  { productId: "sencha", color: "matcha", size: "50g", quantity: 1 },
  { productId: "yunomi", color: "indigo", quantity: 2 },
];

export const lineKey = (line: Pick<CartLine, "productId" | "color" | "size">) => `${line.productId}:${line.color}:${line.size ?? ""}`;

const clamp = (quantity: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity)));

/** Adds a line, or more of the same product / colour / size. */
export function addLine(lines: CartLine[], line: CartLine): CartLine[] {
  const key = lineKey(line);
  const existing = lines.find((l) => lineKey(l) === key);
  if (!existing) return [...lines, { ...line, quantity: clamp(line.quantity) }];
  return lines.map((l) => (l === existing ? { ...l, quantity: clamp(l.quantity + line.quantity) } : l));
}

export const setLineQuantity = (lines: CartLine[], key: string, quantity: number) =>
  lines.map((l) => (lineKey(l) === key ? { ...l, quantity: clamp(quantity) } : l));

export const removeLine = (lines: CartLine[], key: string) => lines.filter((l) => lineKey(l) !== key);

/** Keeps lines whose product, colour and size still exist (the catalog may have changed since they were saved). */
export function validLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: Partial<CartLine>) => {
    const product = typeof item?.productId === "string" ? findProduct(item.productId) : undefined;
    if (!product || !item.color || !product.colors.includes(item.color)) return [];
    if (product.sizes ? !product.sizes.some((s) => s.id === item.size) : item.size !== undefined) return [];
    const quantity = Number(item.quantity);
    return Number.isFinite(quantity) ? [{ productId: product.id, color: item.color, ...(item.size && { size: item.size }), quantity: clamp(quantity) }] : [];
  });
}

function readCart(): CartLine[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? DEMO_CART : validLines(JSON.parse(saved));
  } catch {
    return DEMO_CART;
  }
}

export interface Cart {
  lines: CartLine[];
  /** Number of items (sum of quantities). */
  count: number;
  add: (line: CartLine) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

/** Cart state, saved in localStorage (in memory only when embedded) and shared between tabs. */
export function useCart(embedded: boolean): Cart {
  const [lines, setLines] = React.useState<CartLine[]>(() => (embedded ? DEMO_CART : readCart()));

  React.useEffect(() => {
    if (embedded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage blocked: the cart lasts until the tab closes */
    }
  }, [lines, embedded]);

  // Another tab changed the cart: show the same one here.
  React.useEffect(() => {
    if (embedded) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [embedded]);

  return React.useMemo<Cart>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      add: (line) => setLines((ls) => addLine(ls, line)),
      setQuantity: (key, quantity) => setLines((ls) => setLineQuantity(ls, key, quantity)),
      remove: (key) => setLines((ls) => removeLine(ls, key)),
      clear: () => setLines([]),
    }),
    [lines],
  );
}
