/**
 * The AppShell cookie (`persistKey`): no React here, so the build leaves out "use client" (scripts/server-safe.mjs) and
 * a Server Component can call `readAppShellCookie()` while rendering (#345). AppShell.tsx re-exports it.
 *
 * The cookie holds the sidebar state only: `collapsed` or `expanded`, plus the width in px once a `resizable` Sidebar
 * has been dragged (`expanded:280`). It is written with `path=/; max-age=<1 year>; samesite=lax`, and `secure` on https.
 * The cookie name is `encodeURIComponent(persistKey)`, so any key is safe: spaces, `;`, `=` and non-ASCII are escaped.
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const cookieName = (persistKey: string) => encodeURIComponent(persistKey);

export interface AppShellSavedState {
  collapsed: boolean;
  /** Only set once a `resizable` Sidebar has been dragged. */
  width?: number;
}

/**
 * Reads the state saved under `persistKey` from a cookie string: `document.cookie`, or the Cookie header when rendering
 * on the server, to pass `defaultCollapsed` / `defaultWidth` without a layout shift. In a Server Component, import it
 * from `yugen-ui` (the package root): through `yugen-ui/AppShell` (a "use client" file) it is only a client reference.
 */
export function readAppShellCookie(cookie: string | null | undefined, persistKey: string): AppShellSavedState | undefined {
  if (!persistKey) return undefined;
  const name = `${cookieName(persistKey)}=`;
  const raw = cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(name))
    ?.slice(name.length);
  if (!raw) return undefined;
  const [state, width] = raw.split(":");
  if (state !== "collapsed" && state !== "expanded") return undefined;
  const w = Number(width);
  return { collapsed: state === "collapsed", width: width && Number.isFinite(w) ? w : undefined };
}

/** Browser only (writes `document.cookie`); AppShell calls it from event handlers. */
export function writeAppShellCookie(persistKey: string, { collapsed, width }: AppShellSavedState) {
  if (!persistKey) return;
  const value = `${collapsed ? "collapsed" : "expanded"}${width === undefined ? "" : `:${Math.round(width)}`}`;
  const secure = globalThis.location?.protocol === "https:" ? "; secure" : "";
  document.cookie = `${cookieName(persistKey)}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secure}`;
}
