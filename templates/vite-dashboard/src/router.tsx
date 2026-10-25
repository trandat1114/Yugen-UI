import * as React from "react";

/**
 * A small path router on the History API: /, /revenue, /customers, /settings. No router library.
 * On a static host, serve index.html for unknown paths (most hosts call it a SPA fallback or a 404 rewrite).
 */
export type PageId = "overview" | "revenue" | "customers" | "settings";
export type Route = PageId | "notFound";

export const PAGE_IDS: PageId[] = ["overview", "revenue", "customers", "settings"];

const BASE = import.meta.env.BASE_URL;

export const pathOf = (page: PageId) => (page === "overview" ? BASE : `${BASE}${page}`);

export function parsePath(pathname: string): Route {
  const rest = (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "")).replace(/\/$/, "");
  if (rest === "" || rest === "index.html") return "overview";
  return (PAGE_IDS as string[]).includes(rest) && rest !== "overview" ? (rest as PageId) : "notFound";
}

interface RouterValue {
  route: Route;
  navigate: (to: PageId) => void;
  /** href for an <a> that points to a page. */
  href: (to: PageId) => string;
}

const RouterContext = React.createContext<RouterValue | null>(null);

export function useRouter() {
  const value = React.useContext(RouterContext);
  if (!value) throw new Error("useRouter must be used inside BrowserRouter or MemoryRouter");
  return value;
}

/** Router of the real app: the URL follows the page and Back / Forward work. */
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = React.useState(() => parsePath(window.location.pathname));

  React.useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const value = React.useMemo<RouterValue>(
    () => ({
      route,
      href: pathOf,
      navigate: (to) => {
        const path = pathOf(to);
        if (path !== window.location.pathname) window.history.pushState(null, "", path);
        setRoute(to);
      },
    }),
    [route],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** Router kept in memory, for a preview embedded in another page: the page's URL never changes. */
export function MemoryRouter({ initial = "overview", children }: { initial?: Route; children: React.ReactNode }) {
  const [route, setRoute] = React.useState<Route>(initial);
  const value = React.useMemo<RouterValue>(() => ({ route, href: (to) => `#${pathOf(to)}`, navigate: setRoute }), [route]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: PageId;
}

/** An <a> with a real href (open in a new tab and copy link still work) that navigates in place on a plain click. */
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
