import { useSyncExternalStore } from "react";

/**
 * Độ rộng và trạng thái thu gọn của sidebar docs (#46). Lưu ở localStorage; script trong index.html đọc cùng key và đặt
 * `--docs-sidebar-width` + `data-docs-sidebar` lên <html> trước khi React render để không nháy bố cục.
 */
export const SIDEBAR_STORAGE_KEY = "yugen-docs-sidebar";
export const SIDEBAR_MIN = 240;
export const SIDEBAR_MAX = 400;
export const SIDEBAR_DEFAULT = 320;
/** Bước của phím mũi tên trên thanh chia. */
export const SIDEBAR_STEP = 16;
/** Độ rộng dạng rail (chỉ icon). */
export const SIDEBAR_RAIL = 56;

export interface SidebarLayout {
  width: number;
  collapsed: boolean;
}

export const clampWidth = (width: number) => Math.round(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, width)));

function read(): SidebarLayout {
  try {
    const saved = JSON.parse(localStorage.getItem(SIDEBAR_STORAGE_KEY) ?? "{}") as Partial<SidebarLayout>;
    return {
      width: typeof saved.width === "number" ? clampWidth(saved.width) : SIDEBAR_DEFAULT,
      collapsed: saved.collapsed === true,
    };
  } catch {
    return { width: SIDEBAR_DEFAULT, collapsed: false };
  }
}

let state: SidebarLayout = typeof window === "undefined" ? { width: SIDEBAR_DEFAULT, collapsed: false } : read();
const listeners = new Set<() => void>();

function apply({ width, collapsed }: SidebarLayout) {
  const root = document.documentElement;
  root.style.setProperty("--docs-sidebar-width", `${collapsed ? SIDEBAR_RAIL : width}px`);
  if (collapsed) root.setAttribute("data-docs-sidebar", "rail");
  else root.removeAttribute("data-docs-sidebar");
}

if (typeof document !== "undefined") apply(state);

/** `persist: false` khi đang kéo: chỉ cập nhật bố cục, ghi localStorage lúc thả tay. */
export function setSidebarLayout(next: Partial<SidebarLayout>, { persist = true } = {}) {
  state = { ...state, ...next, width: clampWidth(next.width ?? state.width) };
  apply(state);
  if (persist) {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage bị chặn — giữ trong phiên hiện tại.
    }
  }
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useSidebarLayout(): SidebarLayout {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}
