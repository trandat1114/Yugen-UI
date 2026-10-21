import { useEffect, useState } from "react";

export type Route =
  | { kind: "home" }
  | { kind: "blocks" }
  | { kind: "templates" }
  | { kind: "theme-designer" }
  | { kind: "news" }
  | { kind: "community" }
  | { kind: "concept"; slug: string }
  | { kind: "foundation"; slug: string }
  | { kind: "component"; slug: string };

export function parseHash(hash: string): Route {
  const [, section, slug] = hash.replace(/^#/, "").split("/");
  if (section === "blocks") return { kind: "blocks" };
  if (section === "templates") return { kind: "templates" };
  if (section === "theme-designer") return { kind: "theme-designer" };
  if (section === "news") return { kind: "news" };
  if (section === "community") return { kind: "community" };
  if (section === "concepts" && slug) return { kind: "concept", slug };
  if (section === "foundations" && slug) return { kind: "foundation", slug };
  if (section === "components" && slug) return { kind: "component", slug };
  return { kind: "home" };
}

export function hrefOf(route: Route) {
  if (route.kind === "blocks") return "#/blocks";
  if (route.kind === "templates") return "#/templates";
  if (route.kind === "theme-designer") return "#/theme-designer";
  if (route.kind === "news") return "#/news";
  if (route.kind === "community") return "#/community";
  if (route.kind === "concept") return `#/concepts/${route.slug}`;
  if (route.kind === "foundation") return `#/foundations/${route.slug}`;
  if (route.kind === "component") return `#/components/${route.slug}`;
  return "#/";
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}
