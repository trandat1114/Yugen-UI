import { useEffect, useState } from "react";
import type { Locale } from "./i18n";

export type Route =
  | { kind: "home" }
  | { kind: "blocks" }
  | { kind: "templates" }
  | { kind: "theme-designer" }
  | { kind: "news" }
  | { kind: "community" }
  | { kind: "contributors" }
  | { kind: "concept"; slug: string }
  | { kind: "foundation"; slug: string }
  | { kind: "component"; slug: string }
  /** Đường dẫn không có trang (#238): `path` là đường dẫn gốc (sau BASE và tiền tố ngôn ngữ), giữ khi đổi ngôn ngữ. */
  | { kind: "not-found"; path: string };

/**
 * Ngôn ngữ ở gốc site, không tiền tố (#277): tiếng Anh ở /components/button, tiếng Việt ở /vi/components/button. Docs
 * ≤ 0.13 đặt tiếng Việt ở gốc và tiếng Anh dưới /en/: các URL /en/… cũ vẫn mở đúng trang (`legacy`).
 */
export const DEFAULT_LOCALE: Locale = "en";
/** Ngôn ngữ nằm dưới tiền tố /vi/. */
export const PREFIXED_LOCALE: Locale = "vi";
/** Tiền tố của docs ≤ 0.13 cho tiếng Anh. */
export const LEGACY_PREFIX = "en";

/** Trang docs đang xem: route + ngôn ngữ; `legacy` khi URL dùng tiền tố /en/ cũ (cần đổi sang URL chuẩn). */
export interface DocsLocation {
  route: Route;
  lang: Locale;
  legacy?: true;
}

/** Gốc của docs: "/" khi dev, "/Yugen-UI/" trên GitHub Pages, "/Yugen-UI/next/" cho bản xem trước. Luôn có "/" cuối. */
const BASE = import.meta.env.BASE_URL;

const PAGES = ["blocks", "templates", "theme-designer", "news", "community", "contributors"] as const;
const SECTIONS = { concepts: "concept", foundations: "foundation", components: "component" } as const;

/** "components/button" (đường dẫn sau BASE và sau "vi/", không có "/" đầu) → route; null nếu không phải trang docs. */
function matchSegments(rest: string): Route | null {
  const parts = rest.split("/").filter(Boolean);
  if (parts.length === 0) return { kind: "home" };
  const [section, slug, extra] = parts;
  if (parts.length === 1 && (PAGES as readonly string[]).includes(section)) return { kind: section as (typeof PAGES)[number] };
  if (parts.length === 2 && !extra && section in SECTIONS) return { kind: SECTIONS[section as keyof typeof SECTIONS], slug };
  return null;
}

const hasPrefix = (rest: string, prefix: string) => rest === prefix || rest.startsWith(`${prefix}/`);

/** Tách tiền tố ngôn ngữ: "vi/components/button" → { lang: "vi", rest: "components/button" }; "en/…" cũ → tiếng Anh. */
function splitLocale(rest: string): { lang: Locale; rest: string; legacy?: true } {
  if (hasPrefix(rest, PREFIXED_LOCALE)) return { lang: PREFIXED_LOCALE, rest: rest.slice(PREFIXED_LOCALE.length + 1) };
  if (hasPrefix(rest, LEGACY_PREFIX)) return { lang: "en", rest: rest.slice(LEGACY_PREFIX.length + 1), legacy: true };
  return { lang: DEFAULT_LOCALE, rest };
}

const afterBase = (pathname: string) => (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, ""));

/** Route + ngôn ngữ của một pathname trong docs (đã gồm BASE). Đường dẫn lạ → trang 404 (`not-found`). */
export function parseLocation(pathname: string): DocsLocation {
  const { lang, rest, legacy } = splitLocale(afterBase(pathname));
  return { route: matchSegments(rest) ?? { kind: "not-found", path: rest.replace(/^\/+/, "") }, lang, ...(legacy && { legacy }) };
}

export function parsePath(pathname: string): Route {
  return parseLocation(pathname).route;
}

/** Link kiểu cũ "#/components/button" (docs ≤ 0.10, demo trong registry) → route. */
export function parseHash(hash: string): Route {
  return matchSegments(hash.replace(/^#\/?/, "")) ?? { kind: "home" };
}

/** Đường dẫn của route, không gồm BASE và ngôn ngữ: "" (trang chủ), "components/button"… */
export function pathOf(route: Route): string {
  switch (route.kind) {
    case "home":
      return "";
    case "concept":
      return `concepts/${route.slug}`;
    case "foundation":
      return `foundations/${route.slug}`;
    case "component":
      return `components/${route.slug}`;
    case "not-found":
      return route.path;
    default:
      return route.kind;
  }
}

const prefixOf = (lang: Locale) => (lang === DEFAULT_LOCALE ? "" : `${lang}/`);

/** Đường dẫn gồm ngôn ngữ, không gồm BASE: "vi/components/button", "vi/" (trang chủ tiếng Việt), "components/button". */
export function localePathOf(route: Route, lang: Locale) {
  return prefixOf(lang) + pathOf(route);
}

export function hrefOf(route: Route, lang: Locale = DEFAULT_LOCALE) {
  return BASE + localePathOf(route, lang);
}

// Ngôn ngữ của link nội bộ = ngôn ngữ trang đang render. LocaleProvider đặt giá trị này trong lúc render, trước các
// component con, nên mọi docsPath() trong cây trỏ đúng bản /vi/ hoặc bản tiếng Anh (kể cả khi prerender lần lượt từng trang).
let linkLocale: Locale = DEFAULT_LOCALE;
export function setLinkLocale(lang: Locale) {
  linkLocale = lang;
}

/** Link nội bộ: docsPath("/concepts/cli") → "/Yugen-UI/concepts/cli", hoặc "/Yugen-UI/vi/concepts/cli" khi đang xem tiếng Việt. */
export function docsPath(path: string, lang: Locale = linkLocale) {
  return BASE + prefixOf(lang) + path.replace(/^\//, "");
}

const NAVIGATE = "yugen-docs:navigate";

/** Chuyển trang không tải lại (History API). */
export function navigate(href: string) {
  const url = new URL(href, window.location.href);
  if (url.href === window.location.href) return;
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(NAVIGATE));
}

/** `#/components/button` trong URL hiện tại (link chia sẻ trước khi đổi sang đường dẫn) → URL mới, giữ ?query. */
export function legacyHashTarget(location: Pick<Location, "hash" | "search">): string | null {
  if (!location.hash.startsWith("#/")) return null;
  return hrefOf(parseHash(location.hash)) + location.search;
}

/** Trang docs mà một link trỏ tới (cùng origin, dưới BASE, route có thật; cả link `#/…` cũ); null nếu không phải. */
export function docsLinkTarget(href: string): DocsLocation | null {
  if (href.startsWith("#/")) return { route: parseHash(href), lang: linkLocale };
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin || !url.pathname.startsWith(BASE)) return null;
  const { lang, rest } = splitLocale(url.pathname.slice(BASE.length));
  const route = matchSegments(rest);
  return route && { route, lang };
}

/**
 * Bấm vào `<a>` trỏ tới một trang docs (cùng origin, dưới BASE, không phải bản docs khác như next/ hay v0.9/) → đổi route
 * tại chỗ thay vì tải lại. Link `#/…` cũ cũng được đổi sang đường dẫn.
 */
function onDocumentClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
  const raw = anchor.getAttribute("href") ?? "";
  if (raw.startsWith("#/")) {
    event.preventDefault();
    navigate(docsPath(pathOf(parseHash(raw))));
    return;
  }
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || !url.pathname.startsWith(BASE)) return;
  // Cùng trang, chỉ khác #mục: để trình duyệt cuộn.
  if (url.pathname === window.location.pathname && url.hash) return;
  if (!matchSegments(splitLocale(url.pathname.slice(BASE.length)).rest)) return;
  event.preventDefault();
  navigate(url.href);
}

/** Trang hiện tại. `path` (prerender) thay cho `window.location` khi render ở Node. */
export function useDocsLocation(path?: string) {
  const [location, setLocation] = useState<DocsLocation>(() => parseLocation(path ?? window.location.pathname));

  useEffect(() => {
    let current = window.location.pathname;
    const sync = () => {
      const legacy = legacyHashTarget(window.location);
      if (legacy) window.history.replaceState(null, "", legacy);
      // Chỉ đổi #mục (quay lại sau khi bấm mục lục…): không phải trang mới.
      if (window.location.pathname === current) return;
      const previous = parseLocation(current);
      current = window.location.pathname;
      const next = parseLocation(current);
      setLocation(next);
      // Đổi ngôn ngữ giữ vị trí cuộn; sang trang khác thì lên đầu.
      if (pathOf(next.route) !== pathOf(previous.route)) window.scrollTo({ top: 0 });
    };
    const onHashChange = () => {
      if (window.location.hash.startsWith("#/")) sync();
    };
    window.addEventListener(NAVIGATE, sync);
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onDocumentClick);
    return () => {
      window.removeEventListener(NAVIGATE, sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  return location;
}
