/**
 * The AppShell cookie (`persistKey`): no React here, so the build leaves out "use client" (scripts/server-safe.mjs) and
 * a Server Component can call `readAppShellCookie()` while rendering (#345). AppShell.tsx re-exports it.
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface AppShellSavedState {
  collapsed: boolean;
  /** Chỉ có khi Sidebar `resizable` đã được kéo. */
  width?: number;
}

/**
 * Đọc trạng thái đã lưu theo `persistKey` từ chuỗi cookie: `document.cookie`, hoặc header Cookie khi render ở server
 * để truyền `defaultCollapsed` / `defaultWidth` và không nháy bố cục. Trong Server Component, import từ `yugen-ui` (gốc gói):
 * qua `yugen-ui/AppShell` (file "use client") nó chỉ là client reference.
 */
export function readAppShellCookie(cookie: string | null | undefined, persistKey: string): AppShellSavedState | undefined {
  const name = `${encodeURIComponent(persistKey)}=`;
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
  const value = `${collapsed ? "collapsed" : "expanded"}${width === undefined ? "" : `:${Math.round(width)}`}`;
  document.cookie = `${encodeURIComponent(persistKey)}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}
