import * as React from "react";

/** Routes with real paths and the History API, no router library: `/`, `/trips/<id>`, `/explore`, `/settings`. */
export type Route =
  | { name: "home" }
  | { name: "trip"; id: string }
  | { name: "explore" }
  | { name: "settings" }
  | { name: "notFound" };

const BASE = import.meta.env.BASE_URL;

export function pathOf(route: Route) {
  if (route.name === "trip") return `${BASE}trips/${encodeURIComponent(route.id)}`;
  if (route.name === "explore") return `${BASE}explore`;
  if (route.name === "settings") return `${BASE}settings`;
  return BASE;
}

export function parsePath(pathname: string): Route {
  const rest = (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "")).replace(/\/$/, "");
  if (rest === "" || rest === "index.html") return { name: "home" };
  if (rest === "explore") return { name: "explore" };
  if (rest === "settings") return { name: "settings" };
  const [section, id, ...more] = rest.split("/");
  if (section === "trips" && id && more.length === 0) return { name: "trip", id: decodeURIComponent(id) };
  return { name: "notFound" };
}

interface RouterValue {
  route: Route;
  navigate: (to: Route) => void;
  /** href for an <a> pointing at the route. */
  href: (to: Route) => string;
}

const RouterContext = React.createContext<RouterValue | null>(null);

export function useRouter() {
  const value = React.useContext(RouterContext);
  if (!value) throw new Error("useRouter must be used inside BrowserRouter or MemoryRouter");
  return value;
}

/** Router of the real app: History API, Back and Forward work. Unknown paths need index.html from the host (README). */
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

/** Router in memory, for a preview embedded in another page: the page URL never changes. */
export function MemoryRouter({ initial = { name: "home" }, children }: { initial?: Route; children: React.ReactNode }) {
  const [route, setRoute] = React.useState<Route>(initial);
  const value = React.useMemo<RouterValue>(() => ({ route, href: (to) => `#${pathOf(to)}`, navigate: (to) => setRoute(to) }), [route]);
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
