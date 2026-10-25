import * as React from "react";

/**
 * Định tuyến theo đường dẫn thật (/posts/<slug>/) — mỗi trang có URL riêng để công cụ tìm kiếm lập chỉ mục;
 * plugin SEO trong vite.config.ts sinh sẵn file HTML cho từng URL. Không cần thư viện router.
 */
export type Route = { name: "home" } | { name: "tag"; tag: string } | { name: "post"; slug: string } | { name: "notFound" };

const BASE = import.meta.env.BASE_URL;

export function pathOf(route: Route) {
  if (route.name === "post") return `${BASE}posts/${route.slug}/`;
  if (route.name === "tag") return `${BASE}tags/${route.tag}/`;
  return BASE;
}

export function parsePath(pathname: string): Route {
  const rest = (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "")).replace(/\/$/, "");
  if (rest === "" || rest === "index.html") return { name: "home" };
  const [section, slug, ...more] = rest.split("/");
  if (slug && more.length === 0 && section === "posts") return { name: "post", slug: decodeURIComponent(slug) };
  if (slug && more.length === 0 && section === "tags") return { name: "tag", tag: decodeURIComponent(slug) };
  return { name: "notFound" };
}

interface RouterValue {
  route: Route;
  navigate: (to: Route) => void;
  /** Giá trị href cho <a> trỏ tới route. */
  href: (to: Route) => string;
}

const RouterContext = React.createContext<RouterValue | null>(null);

export function useRouter() {
  const value = React.useContext(RouterContext);
  if (!value) throw new Error("useRouter() must be used inside <BrowserRouter> or <MemoryRouter>");
  return value;
}

/** Router của ứng dụng thật: History API, nút Back / Forward chạy đúng. */
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
        window.scrollTo({ top: 0 });
      },
    }),
    [route],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** Router trong bộ nhớ — cho preview nhúng trong trang khác (không đổi URL của trang chủ). */
export function MemoryRouter({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = React.useState<Route>({ name: "home" });
  const value = React.useMemo<RouterValue>(
    () => ({
      route,
      href: (to) => `#${pathOf(to)}`,
      navigate: setRoute,
    }),
    [route],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: Route;
}

/** <a> có href thật (mở tab mới, sao chép link vẫn được) nhưng điều hướng phía client khi bấm thường. */
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
