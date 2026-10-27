import * as React from "react";
import { YugenProvider } from "yugen-ui";
import { DEFAULT_APPEARANCE, type Appearance } from "./appearance";
import { useCart } from "./cart";
import defaultContent from "./content";
import type { Content } from "./content/types";
import { StoreContext, type StoreValue } from "./context";
import { Layout } from "./Layout";
import { convert, createFormat } from "./money";
import { createOrderStore } from "./orders";
import { BrowserRouter, MemoryRouter, type Route } from "./router";

/** Same key as the no-flash script in index.html (it reads `theme` and `brand`). */
const STORAGE_KEY = "yugen-store-appearance";

function initialAppearance(): Appearance {
  // The script in index.html set data-theme / data-brand before React ran: read them back so both agree.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as Appearance["theme"] | null) ?? DEFAULT_APPEARANCE.theme,
    brand: (root.getAttribute("data-brand") as Appearance["brand"] | null) ?? DEFAULT_APPEARANCE.brand,
  };
}

export interface AppProps {
  /** Embedded in another page (the docs preview): router, cart and orders in memory, nothing saved, no changes to <html>. */
  embedded?: boolean;
  /** App text; defaults to the language picked in `content/index.ts`. */
  content?: Content;
  /** Appearance to start with; defaults to what was saved. */
  defaultAppearance?: Appearance;
  /** First page of the embedded preview. */
  initialRoute?: Route;
}

export default function App({ embedded = false, content = defaultContent, defaultAppearance, initialRoute }: AppProps) {
  const [appearance, setAppearance] = React.useState(() => defaultAppearance ?? initialAppearance());
  const [cartOpen, setCartOpen] = React.useState(false);
  const cart = useCart(embedded);
  const orders = React.useMemo(() => createOrderStore(embedded), [embedded]);

  React.useEffect(() => {
    if (embedded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage blocked */
    }
  }, [appearance, embedded]);

  const value = React.useMemo<StoreValue>(
    () => ({
      t: content,
      format: createFormat(content.locale, content.currency),
      price: (usd) => convert(usd, content.currency),
      cart,
      cartOpen,
      setCartOpen,
      orders,
      appearance,
      setAppearance: (patch) => setAppearance((a) => ({ ...a, ...patch })),
      embedded,
    }),
    [content, cart, cartOpen, orders, appearance, embedded],
  );

  return (
    <YugenProvider
      applyToDocument={!embedded}
      withToaster={!embedded}
      theme={appearance.theme}
      brand={appearance.brand}
      // Built-in component strings (wizard, carousel, spin button…) in the app's language.
      messages={content.messages}
      locale={content.locale}
      className={embedded ? "h-full" : undefined}
    >
      <StoreContext.Provider value={value}>
        {embedded ? (
          <MemoryRouter initial={initialRoute}>
            <Layout />
          </MemoryRouter>
        ) : (
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        )}
      </StoreContext.Provider>
    </YugenProvider>
  );
}
