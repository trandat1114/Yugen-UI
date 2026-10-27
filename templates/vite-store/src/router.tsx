import * as React from "react";
import { EMPTY_QUERY, parseShopQuery, shopSearch, type ShopQuery } from "./filters";

/**
 * Routes with real paths and the History API, no router library. The grid filters are in the query string, so Back,
 * Forward and shared links bring them back. On a static host, serve index.html for unknown paths (Deploy in README.md).
 */
export type Route =
  | { name: "shop"; query: ShopQuery }
  | { name: "product"; id: string }
  | { name: "checkout" }
  | { name: "order"; id: string }
  | { name: "notFound" };

const BASE = import.meta.env.BASE_URL;

export const SHOP: Route = { name: "shop", query: EMPTY_QUERY };

export function pathOf(route: Route): string {
  switch (route.name) {
    case "product":
      return `${BASE}products/${encodeURIComponent(route.id)}`;
    case "checkout":
      return `${BASE}checkout`;
    case "order":
      return `${BASE}orders/${encodeURIComponent(route.id)}`;
    case "notFound":
      return `${BASE}not-found`;
    default:
      return `${BASE}${shopSearch(route.query)}`;
  }
}

export function parseLocation(pathname: string, search = ""): Route {
  const rest = (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "")).replace(/\/$/, "");
  if (rest === "" || rest === "index.html") return { name: "shop", query: parseShopQuery(search) };
  if (rest === "checkout") return { name: "checkout" };
  const [section, id, ...more] = rest.split("/");
  if ((section === "products" || section === "orders") && id && more.length === 0) {
    try {
      return { name: section === "products" ? "product" : "order", id: decodeURIComponent(id) };
    } catch {
      /* malformed escape */
    }
  }
  return { name: "notFound" };
}

interface RouterValue {
  route: Route;
  navigate: (to: Route, options?: { replace?: boolean }) => void;
  /** href for an <a> pointing at the route. */
  href: (to: Route) => string;
}

const RouterContext = React.createContext<RouterValue | null>(null);

export function useRouter() {
  const value = React.useContext(RouterContext);
  if (!value) throw new Error("useRouter must be used inside BrowserRouter or MemoryRouter");
  return value;
}

const here = () => window.location.pathname + window.location.search;
const current = () => parseLocation(window.location.pathname, window.location.search);

/** Router of the real app: History API, Back and Forward work. */
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = React.useState(current);

  React.useEffect(() => {
    const onPopState = () => setRoute(current());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const value = React.useMemo<RouterValue>(
    () => ({
      route,
      href: pathOf,
      navigate: (to, options) => {
        const path = pathOf(to);
        if (path !== here()) window.history[options?.replace ? "replaceState" : "pushState"](null, "", path);
        setRoute(to);
      },
    }),
    [route],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** Router in memory, for a preview embedded in another page: the page URL never changes. */
export function MemoryRouter({ initial = SHOP, children }: { initial?: Route; children: React.ReactNode }) {
  const [route, setRoute] = React.useState(initial);
  const value = React.useMemo<RouterValue>(() => ({ route, href: (to) => `#${pathOf(to)}`, navigate: setRoute }), [route]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: Route;
}

/** <a> with a real href (open in a new tab, copy link) that navigates on the client on a plain click. */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ to, onClick, ...props }, ref) => {
  const { href, navigate } = useRouter();
  return (
    <a
      ref={ref}
      // Before href: a wrapper with asChild (Yugen's Link, Button) may pass href={undefined}; `to` decides.
      {...props}
      href={href(to)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
    />
  );
});
Link.displayName = "Link";
