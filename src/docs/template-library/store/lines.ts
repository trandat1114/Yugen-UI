import { lineKey, type CartLine } from "./cart";
import type { Content } from "./content/types";
import { sum, type Currency } from "./money";
import { findProduct, SHIPPING, shippingOption, unitPrice, type Product, type ShippingId } from "./products";

export interface LineView extends CartLine {
  key: string;
  product: Product;
  name: string;
  /** "Celadon, 300 ml". */
  variant: string;
  /** Prices in the app's currency. */
  unit: number;
  total: number;
}

/** Cart lines with names and prices for display. Lines of products no longer in the catalog are left out. */
export function describeLines(lines: CartLine[], t: Content, price: (usd: number) => number): LineView[] {
  return lines.flatMap((line) => {
    const product = findProduct(line.productId);
    if (!product) return [];
    const size = product.sizes?.find((s) => s.id === line.size);
    const unit = price(unitPrice(product, line.size));
    return [
      {
        ...line,
        key: lineKey(line),
        product,
        name: t.products[product.id].name,
        variant: [t.colors[line.color], size?.label].filter(Boolean).join(", "),
        unit,
        total: unit * line.quantity,
      },
    ];
  });
}

export const subtotalOf = (lines: LineView[], currency: Currency) => sum(lines.map((l) => l.total), currency);

/** Cost of a shipping method for this subtotal, in the app's currency. */
export function shippingCost(id: ShippingId, subtotal: number, price: (usd: number) => number) {
  const option = shippingOption(id);
  return "freeFrom" in option && subtotal >= price(option.freeFrom) ? 0 : price(option.price);
}

/** Threshold of free standard shipping, in the app's currency. */
export const freeShippingFrom = (price: (usd: number) => number) => price(SHIPPING[0].freeFrom);
