import * as React from "react";
import type { Appearance } from "./appearance";
import type { Cart } from "./cart";
import type { Content } from "./content/types";
import type { Format } from "./money";
import type { OrderStore } from "./orders";

export interface StoreValue {
  t: Content;
  format: Format;
  /** A US dollar catalog price in the app's currency (`content.currency`). */
  price: (usd: number) => number;
  cart: Cart;
  /** The cart Sheet, opened from the header, the add-to-cart toast and the product page. */
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  orders: OrderStore;
  appearance: Appearance;
  setAppearance: (patch: Partial<Appearance>) => void;
  /** Embedded in another page (the docs preview): headings start at h2, nothing is saved. */
  embedded: boolean;
}

export const StoreContext = React.createContext<StoreValue | null>(null);

export function useStore() {
  const value = React.useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside the store App");
  return value;
}

/** Heading tags: h1 for the page title, h2 for sections; one level lower when embedded in another page. */
export function useHeadings() {
  const { embedded } = useStore();
  return embedded ? ({ H1: "h2", H2: "h3", H3: "h4" } as const) : ({ H1: "h1", H2: "h2", H3: "h3" } as const);
}
