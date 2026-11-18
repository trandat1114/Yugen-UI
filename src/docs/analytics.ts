/**
 * Docs analytics beacon (#190). Off unless the build sets VITE_ANALYTICS_URL (pages.yml reads the repository variable
 * ANALYTICS_URL); local builds, previews, CI and tests send nothing.
 *
 * One `navigator.sendBeacon` per page view, and one per click on an element with `data-analytics="<event>"`. No cookies,
 * no storage, no identifier: the collector counts visitors with a daily-salted hash of IP + user agent and keeps no raw
 * IP (privacy note: Community page › Privacy). Browsers that send Do Not Track or Global Privacy Control are skipped.
 */
export interface Beacon {
  type: "view" | "event";
  path: string;
  /** Referrer host only, never the full URL. */
  referrer: string;
  lang: string;
  version: string;
  screen: "s" | "m" | "l";
  event?: string;
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

/** Sends one beacon; returns false when analytics is off. Never throws. */
export function send(data: Pick<Beacon, "type" | "path" | "lang" | "version"> & { event?: string }, env: AnalyticsEnv = defaultEnv()) {
  if (!analyticsEnabled(env)) return false;
  try {
    const body: Beacon = { ...data, referrer: referrerHost(document.referrer), screen: screenSize() };
    return env.nav.sendBeacon(env.url!, JSON.stringify(body));
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
    if (event) send({ type: "event", event, ...context() }, env);
  };
  document.addEventListener("click", onClick, { capture: true });
  return () => document.removeEventListener("click", onClick, { capture: true });
}
