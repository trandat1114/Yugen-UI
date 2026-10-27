import * as React from "react";

/**
 * Routes with real paths and the History API, no router library. The sign-in pages are public; every other page needs
 * a session (see `Layout.tsx`). On a static host, serve index.html for unknown paths (Deploy in README.md).
 */
export type Route =
  | { name: "customers" }
  | { name: "customer"; id: string }
  | { name: "orders" }
  | { name: "settings" }
  /** `next`: where to go once signed in (a path of this app). */
  | { name: "signIn"; next?: string }
  | { name: "forgotPassword" }
  | { name: "verify"; next?: string }
  | { name: "notFound" };

const BASE = import.meta.env.BASE_URL;

/** Pages anyone can open. */
export const isPublic = (route: Route) => route.name === "signIn" || route.name === "forgotPassword" || route.name === "verify";

const withNext = (path: string, next: string | undefined) => (next ? `${path}?next=${encodeURIComponent(next)}` : path);

export function pathOf(route: Route): string {
  switch (route.name) {
    case "customer":
      return `${BASE}customers/${encodeURIComponent(route.id)}`;
    case "orders":
      return `${BASE}orders`;
    case "settings":
      return `${BASE}settings`;
    case "signIn":
      return withNext(`${BASE}sign-in`, route.next);
    case "forgotPassword":
      return `${BASE}forgot-password`;
    case "verify":
      return withNext(`${BASE}verify`, route.next);
    default:
      return `${BASE}customers`;
  }
}

/** `next` only ever points inside the app, and never back to a sign-in page. */
export function safeNext(next: string | null | undefined): string | undefined {
  if (!next || !next.startsWith(BASE) || next.startsWith("//") || next.includes("\\")) return undefined;
  return isPublic(parseLocation(next)) ? undefined : next;
}

export function parseLocation(pathname: string, search = ""): Route {
  const rest = (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "")).replace(/\/$/, "");
  const next = () => safeNext(new URLSearchParams(search).get("next"));
  switch (rest) {
    case "":
    case "index.html":
    case "customers":
      return { name: "customers" };
    case "orders":
      return { name: "orders" };
    case "settings":
      return { name: "settings" };
    case "sign-in": {
      const to = next();
      return to ? { name: "signIn", next: to } : { name: "signIn" };
    }
    case "forgot-password":
      return { name: "forgotPassword" };
    case "verify": {
      const to = next();
      return to ? { name: "verify", next: to } : { name: "verify" };
    }
  }
  const [section, id, ...more] = rest.split("/");
  if (section === "customers" && id && more.length === 0) {
    try {
      return { name: "customer", id: decodeURIComponent(id) };
    } catch {
      /* malformed escape */
    }
  }
  return { name: "notFound" };
}

interface RouterValue {
  route: Route;
  /** Current path and query, e.g. to come back here after signing in. */
  path: string;
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

/** Router of the real app: History API, Back and Forward work. */
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = React.useState(() => ({
    route: parseLocation(window.location.pathname, window.location.search),
    path: here(),
  }));

  React.useEffect(() => {
    const onPopState = () => setLocation({ route: parseLocation(window.location.pathname, window.location.search), path: here() });
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const value = React.useMemo<RouterValue>(
    () => ({
      ...location,
      href: pathOf,
      navigate: (to, options) => {
        const path = pathOf(to);
        if (path !== here()) window.history[options?.replace ? "replaceState" : "pushState"](null, "", path);
        setLocation({ route: to, path });
      },
    }),
    [location],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** Router in memory, for a preview embedded in another page: the page URL never changes. */
export function MemoryRouter({ initial = { name: "customers" }, children }: { initial?: Route; children: React.ReactNode }) {
  const [location, setLocation] = React.useState(() => ({ route: initial, path: pathOf(initial) }));
  const value = React.useMemo<RouterValue>(
    () => ({ ...location, href: (to) => `#${pathOf(to)}`, navigate: (to) => setLocation({ route: to, path: pathOf(to) }) }),
    [location],
  );
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
