/**
 * Docs analytics beacon (#190). Off unless the build sets VITE_ANALYTICS_URL (pages.yml reads the repository variable
 * ANALYTICS_URL); local builds, previews, CI and tests send nothing.
 *
 * One `navigator.sendBeacon` per page view, and one per click on an element with `data-analytics="<event>"`. No cookies,
 * no storage, no identifier: the collector counts visitors with a daily-salted hash of IP + user agent and keeps no raw
 * IP (privacy note: Community page › Privacy). Browsers that send Do Not Track or Global Privacy Control are skipped.
 */
export type AnalyticsEvent = "page_view" | "copy" | "stackblitz-example" | "stackblitz-template";

export interface Beacon {
  id: string;
  type: AnalyticsEvent;
  path: string;
  /** Referrer host only, never the full URL. */
  referrer: string;
  lang: string;
  version: string;
  screen: "s" | "m" | "l";
}

export interface AnalyticsEnv {
  url: string | undefined;
  nav: Pick<Navigator, "sendBeacon"> & { doNotTrack?: string | null; globalPrivacyControl?: boolean };
}

const defaultEnv = (): AnalyticsEnv => ({ url: import.meta.env.VITE_ANALYTICS_URL as string | undefined, nav: navigator });

export function analyticsEnabled({ url, nav }: AnalyticsEnv = defaultEnv()) {
  return !!url && /^https:\/\//.test(url) && nav.doNotTrack !== "1" && nav.globalPrivacyControl !== true;
}

const referrerHost = (ref: string) => {
  try {
    const host = new URL(ref).host;
    return host === location.host ? "" : host;
  } catch {
    return "";
  }
};

const screenSize = (): Beacon["screen"] => (innerWidth < 640 ? "s" : innerWidth < 1024 ? "m" : "l");

const collectorPath = (path: string) => {
  const withoutHash = path.replace(/^#/, "");
  const withoutQuery = withoutHash.split(/[?#]/, 1)[0];
  return `/${withoutQuery.replace(/^\/+/, "")}`;
};

const randomUuid = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
};

const EVENT_TYPES = new Set<AnalyticsEvent>(["copy", "stackblitz-example", "stackblitz-template"]);

/** Sends one beacon; returns false when analytics is off. Never throws. */
export function send(data: Pick<Beacon, "type" | "path" | "lang" | "version">, env: AnalyticsEnv = defaultEnv()) {
  if (!analyticsEnabled(env)) return false;
  try {
    const body: Beacon = {
      id: randomUuid(),
      ...data,
      path: collectorPath(data.path),
      referrer: referrerHost(document.referrer),
      screen: screenSize(),
    };
    const payload = new Blob([JSON.stringify(body)], { type: "application/json" });
    return env.nav.sendBeacon(env.url!, payload);
  } catch {
    return false;
  }
}

/** Click tracking by delegation: `<a data-analytics="stackblitz">`. Returns the cleanup. */
export function trackClicks(context: () => { path: string; lang: string; version: string }, env: AnalyticsEnv = defaultEnv()) {
  if (!analyticsEnabled(env)) return () => {};
  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.("[data-analytics]");
    const event = el?.getAttribute("data-analytics");
    if (event && EVENT_TYPES.has(event as AnalyticsEvent)) send({ type: event as AnalyticsEvent, ...context() }, env);
  };
  document.addEventListener("click", onClick, { capture: true });
  return () => document.removeEventListener("click", onClick, { capture: true });
}
