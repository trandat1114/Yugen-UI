import type { CartLine } from "./cart";
import type { Currency } from "./money";
import type { ShippingId } from "./products";

/** A placed order. Amounts are in the currency of the order, as they were when it was placed. */
export interface Order {
  id: string;
  /** ISO date and time. */
  placedAt: string;
  currency: Currency;
  lines: (CartLine & { unitPrice: number })[];
  subtotal: number;
  shippingCost: number;
  total: number;
  contact: { name: string; email: string; phone: string };
  address: { line1: string; line2: string; city: string; postalCode: string; country: string };
  shipping: ShippingId;
  payment: { method: "card"; last4: string } | { method: "cod" };
}

/** Where orders are kept. This demo has no back end: orders live in sessionStorage, for this tab only. */
export interface OrderStore {
  get: (id: string) => Order | undefined;
  save: (order: Order) => void;
}

const STORAGE_KEY = "yugen-store-orders";

function readAll(): Record<string, Order> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, Order>;
  } catch {
    return {};
  }
}

/** Orders in sessionStorage; in memory when embedded in another page (nothing saved). */
export function createOrderStore(embedded: boolean): OrderStore {
  const memory = new Map<string, Order>();
  return {
    get: (id) => memory.get(id) ?? (embedded ? undefined : readAll()[id]),
    save: (order) => {
      memory.set(order.id, order);
      if (embedded) return;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [order.id]: order }));
      } catch {
        /* storage blocked: the order page works until reload */
      }
    },
  };
}

/** Short order number like "SG-4K7Q2M": easy to read out on the phone. */
export function orderId(random = Math.random) {
  const letters = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  return `SG-${Array.from({ length: 6 }, () => letters[Math.floor(random() * letters.length)]).join("")}`;
}

/** First and last delivery day of a shipping window, counted from the order date. */
export function deliveryWindow(placedAt: string, days: readonly [number, number]): [Date, Date] {
  const at = (n: number) => {
    const d = new Date(placedAt);
    d.setDate(d.getDate() + n);
    return d;
  };
  return [at(days[0]), at(days[1])];
}
