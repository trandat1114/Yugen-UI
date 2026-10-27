import * as React from "react";

/**
 * Routes with real paths and the History API, no router library: `/` and `/<section>/<page>/`. Every page has its own URL
 * that search engines index; the SEO plugin in vite.config.ts writes an HTML file for each one. `hash` is a heading id.
 */
export type Route = { name: "home" } | { name: "page"; section: string; page: string; hash?: string } | { name: "notFound" };

const BASE = import.meta.env.BASE_URL;

export function pathOf(route: Route) {
  if (route.name === "page") return `${BASE}${encodeURIComponent(route.section)}/${encodeURIComponent(route.page)}/`;
  return BASE;
}

export function parsePath(pathname: string, hash = ""): Route {
  const rest = (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "")).replace(/\/$/, "");
  if (rest === "" || rest === "index.html") return { name: "home" };
  const [section, page, ...more] = rest.split("/");
  if (section && page && more.length === 0) {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    return { name: "page", section: decodeURIComponent(section), page: decodeURIComponent(page), ...(id && { hash: id }) };
  }
  return { name: "notFound" };
}

interface RouterValue {
  route: Route;
  navigate: (to: Route) => void;
  /** href for an <a> pointing at the route. */
  href: (to: Route) => string;
  /** Embedded preview: the page URL never changes. */
  memory: boolean;
}

const RouterContext = React.createContext<RouterValue | null>(null);

export function useRouter() {
  const value = React.useContext(RouterContext);
  if (!value) throw new Error("useRouter must be used inside BrowserRouter or MemoryRouter");
  return value;
}

const hrefOf = (to: Route) => `${pathOf(to)}${to.name === "page" && to.hash ? `#${to.hash}` : ""}`;

/** Router of the real app: History API, Back and Forward work. */
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = React.useState(() => parsePath(window.location.pathname, window.location.hash));

  React.useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname, window.location.hash));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const value = React.useMemo<RouterValue>(
    () => ({
      route,
      href: hrefOf,
      memory: false,
      navigate: (to) => {
        const url = hrefOf(to);
        if (url !== window.location.pathname + window.location.hash) window.history.pushState(null, "", url);
        setRoute(to);
      },
    }),
    [route],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** Router in memory, for a preview embedded in another page. */
export function MemoryRouter({ initial = { name: "home" }, children }: { initial?: Route; children: React.ReactNode }) {
  const [route, setRoute] = React.useState<Route>(initial);
  const value = React.useMemo<RouterValue>(() => ({ route, href: (to) => `#${hrefOf(to)}`, navigate: setRoute, memory: true }), [route]);
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
      href={href(to)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...props}
    />
  );
});
Link.displayName = "Link";
