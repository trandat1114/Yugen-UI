import * as React from "react";
import { Accessibility20Regular, Cart20Regular, WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";
import {
  Button,
  CounterBadge,
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  PageProgressFallback,
  SkeletonText,
  type YugenTheme,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { BRANDS, THEMES } from "./appearance";
import { useStore } from "./context";
import { EMPTY_QUERY } from "./filters";
import { CATEGORIES, findProduct } from "./products";
import { Link, SHOP, useRouter, type Route } from "./router";

// Each page is its own chunk; hovering or focusing a link to it starts the download.
export const loaders = {
  shop: () => import("./pages/ShopPage"),
  product: () => import("./pages/ProductPage"),
  checkout: () => import("./pages/CheckoutPage"),
  order: () => import("./pages/OrderPage"),
  notFound: () => import("./pages/NotFoundPage"),
};
const ShopPage = React.lazy(loaders.shop);
const ProductPage = React.lazy(loaders.product);
const CheckoutPage = React.lazy(loaders.checkout);
const OrderPage = React.lazy(loaders.order);
const NotFoundPage = React.lazy(loaders.notFound);
// The cart Sheet loads the first time it is about to open.
const loadCart = () => import("./CartSheet");
const CartSheet = React.lazy(loadCart);

function Logo() {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background font-display text-subtitle2 font-semibold text-foreground-on-brand"
    >
      桜
    </span>
  );
}

function PageFallback() {
  const { embedded } = useStore();
  const skeleton = (
    <div className="mx-auto w-full max-w-6xl p-6">
      <SkeletonText lines={5} />
    </div>
  );
  return embedded ? skeleton : <PageProgressFallback>{skeleton}</PageProgressFallback>;
}

function ThemeMenu() {
  const { t, appearance, setAppearance } = useStore();
  const icon =
    appearance.theme === "dark" ? <WeatherMoon20Regular /> : appearance.theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label={t.nav.appearance} />
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-52">
        <MenuGroupHeader>{t.nav.theme}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.theme} onValueChange={(v) => setAppearance({ theme: v as YugenTheme })}>
          {THEMES.map((theme) => (
            <MenuItemRadio key={theme} value={theme}>
              {t.nav.themes[theme]}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
        <MenuDivider />
        <MenuGroupHeader>{t.nav.brand}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.brand} onValueChange={(v) => setAppearance({ brand: v })}>
          {BRANDS.map((b) => (
            <MenuItemRadio key={b.value} value={b.value}>
              {b.label}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}

/** Links to the grid filtered by one category. */
function CategoryLinks() {
  const { t, embedded } = useStore();
  const { route } = useRouter();
  const Nav = embedded ? "div" : "nav";
  const only = route.name === "shop" && route.query.categories.length === 1 ? route.query.categories[0] : undefined;
  return (
    <Nav aria-label={embedded ? undefined : t.nav.categories} className="hidden items-center gap-1 @3xl/app:flex">
      {CATEGORIES.map((category) => (
        <Link
          key={category}
          to={{ name: "shop", query: { ...EMPTY_QUERY, categories: [category] } }}
          aria-current={only === category ? "page" : undefined}
          onPointerEnter={() => void loaders.shop()}
          className={cn(
            "rounded-medium px-3 py-1.5 text-body1 text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1",
            "aria-[current=page]:font-semibold aria-[current=page]:text-foreground-1",
          )}
        >
          {t.categories[category]}
        </Link>
      ))}
    </Nav>
  );
}

function CartButton({ onIntent }: { onIntent: () => void }) {
  const { t, cart, setCartOpen } = useStore();
  return (
    <span className="relative inline-flex">
      <Button
        appearance="subtle"
        icon={<Cart20Regular />}
        aria-label={t.nav.cart(cart.count)}
        onPointerEnter={onIntent}
        onFocus={onIntent}
        onClick={() => {
          onIntent();
          setCartOpen(true);
        }}
      />
      <CounterBadge aria-hidden count={cart.count} size="small" className="pointer-events-none absolute -inset-e-1 -top-1" />
    </span>
  );
}

function titleOf(route: Route, t: ReturnType<typeof useStore>["t"]) {
  switch (route.name) {
    case "shop":
      return route.query.categories.length === 1 ? t.categories[route.query.categories[0]] : t.shop.title;
    case "product": {
      const product = findProduct(route.id);
      return product ? t.products[product.id].name : t.product.notFoundTitle;
    }
    case "checkout":
      return t.checkout.title;
    case "order":
      return `${t.order.number} ${route.id}`;
    default:
      return t.notFound.title;
  }
}

/** The page key: a new page scrolls to the top, a filter change on the grid does not. */
const pageKey = (route: Route) => (route.name === "product" || route.name === "order" ? `${route.name}/${route.id}` : route.name);

/** Header, the page for the route, footer and the cart Sheet. */
export function Layout() {
  const { t, embedded, cartOpen } = useStore();
  const { route } = useRouter();
  const [cartLoaded, setCartLoaded] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const loadCartSheet = React.useCallback(() => {
    void loadCart();
    setCartLoaded(true);
  }, []);
  // Embedded: no landmarks that would clash with the host page's own <header>, <main> and <footer>.
  const Header = embedded ? "div" : "header";
  const Main = embedded ? "div" : "main";
  const Footer = embedded ? "div" : "footer";

  const key = pageKey(route);
  React.useEffect(() => {
    if (embedded) rootRef.current?.scrollTo({ top: 0 });
    else window.scrollTo({ top: 0 });
  }, [key, embedded]);

  React.useEffect(() => {
    if (!embedded) document.title = t.pageTitle(titleOf(route, t));
  }, [embedded, route, t]);

  const page =
    route.name === "shop" ? (
      <ShopPage query={route.query} />
    ) : route.name === "product" ? (
      <ProductPage key={route.id} id={route.id} />
    ) : route.name === "checkout" ? (
      <CheckoutPage />
    ) : route.name === "order" ? (
      <OrderPage key={route.id} id={route.id} />
    ) : (
      <NotFoundPage />
    );

  return (
    <div
      ref={rootRef}
      className={cn("@container/app flex flex-col bg-background-2 text-foreground-1", embedded ? "h-full overflow-y-auto" : "min-h-dvh")}
    >
      {!embedded && (
        <a
          href="#content"
          className="sr-only rounded-medium bg-background-1 px-3 py-2 text-body1 font-semibold shadow-8 focus:not-sr-only focus:fixed focus:inset-s-2 focus:top-2 focus:z-50"
        >
          {t.nav.skip}
        </a>
      )}
      <Header className="sticky top-0 z-10 border-b border-stroke-2 bg-background-1">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-3 @3xl/app:px-6">
          <Link to={SHOP} className="flex min-w-0 items-center gap-2 rounded-medium pe-1" onPointerEnter={() => void loaders.shop()}>
            <Logo />
            <span className="truncate text-body1 font-semibold">{t.appName}</span>
          </Link>
          <div className="ms-4">
            <CategoryLinks />
          </div>
          <div className="ms-auto flex shrink-0 items-center gap-1">
            <ThemeMenu />
            <CartButton onIntent={loadCartSheet} />
          </div>
        </div>
      </Header>

      <Main id={embedded ? undefined : "content"} tabIndex={embedded ? undefined : -1} className="flex-1 outline-none">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 @3xl/app:px-6 @3xl/app:py-8">
          <React.Suspense fallback={<PageFallback />}>{page}</React.Suspense>
        </div>
      </Main>

      <Footer className="border-t border-stroke-2 bg-background-1">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-caption1 text-foreground-3 @3xl/app:px-6">{t.footer}</p>
      </Footer>

      {(cartLoaded || cartOpen) && (
        <React.Suspense fallback={null}>
          <CartSheet />
        </React.Suspense>
      )}
    </div>
  );
}
