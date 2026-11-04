import * as React from "react";
import type { BreakpointToken } from "../_internal/breakpoint";

/*
 * Phần dùng chung của AppShell.tsx và Sidebar.tsx. Hai file tách nhau để trang chỉ có thanh trên cùng (site nội dung)
 * không kéo theo Sidebar cùng Drawer, Tooltip, Kbd. Chỉ dùng nội bộ: barrel export từ hai file kia.
 */

/** Độ rộng khung (container query, rem) từ đó sidebar nằm trong bố cục; hẹp hơn thì thành Drawer. Cùng mốc với Sheet. */
export type AppShellBreakpoint = BreakpointToken;
/** icon: thu về rail chỉ icon · offcanvas: ẩn hẳn · none: luôn mở trên màn rộng. */
export type SidebarCollapsible = "icon" | "offcanvas" | "none";
/** sidebar: sidebar cao hết khung, thanh trên cùng bên cạnh · header: thanh trên cùng trải ngang, sidebar bên dưới. */
export type AppShellLayout = "sidebar" | "header";
/** main: khung cao bằng màn hình, nội dung cuộn bên trong · page: cả trang cuộn, thanh trên cùng và sidebar dính lại. */
export type AppShellScroll = "main" | "page";

/** Hiện từ breakpoint: sidebar, cột phụ, icon thu gọn của SidebarTrigger. */
export const SHOW_WIDE: Record<AppShellBreakpoint, string> = {
  lg: "@lg/app-shell:flex",
  xl: "@xl/app-shell:flex",
  "2xl": "@2xl/app-shell:flex",
  "3xl": "@3xl/app-shell:flex",
  "4xl": "@4xl/app-shell:flex",
  "5xl": "@5xl/app-shell:flex",
};
/** Ẩn từ breakpoint: icon mở Drawer của SidebarTrigger. */
export const HIDE_WIDE: Record<AppShellBreakpoint, string> = {
  lg: "@lg/app-shell:hidden",
  xl: "@xl/app-shell:hidden",
  "2xl": "@2xl/app-shell:hidden",
  "3xl": "@3xl/app-shell:hidden",
  "4xl": "@4xl/app-shell:hidden",
  "5xl": "@5xl/app-shell:hidden",
};

/** Phần tử còn hiển thị (không nằm trong nhánh display: none / bị gỡ khỏi DOM). */
export function isShown(el: HTMLElement | null | undefined): el is HTMLElement {
  if (!el?.isConnected) return false;
  return typeof el.checkVisibility === "function" ? el.checkVisibility() : true;
}

export interface AppShellContextValue {
  narrow: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  breakpoint: AppShellBreakpoint;
  layout: AppShellLayout;
  scroll: AppShellScroll;
  /** null: không có Sidebar (chỉ thanh trên cùng). */
  collapsible: SidebarCollapsible | null;
  setCollapsible: (collapsible: SidebarCollapsible | null) => void;
  shortcut: string | false;
  shellId: string;
  mainId: string;
  sidebarId: string;
  mainRef: React.MutableRefObject<HTMLElement | null>;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  sidebarRef: React.MutableRefObject<HTMLDivElement | null>;
  /** Focus đang (hoặc vừa) ở trong sidebar trên màn rộng. */
  sidebarFocused: React.MutableRefObject<boolean>;
  /** Phần tử giữ focus trước khi Drawer mở. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
  savedWidth?: number;
  persistWidth: (width: number) => void;
  focusTriggerOrMain: () => void;
}

export const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function useShell(part: string) {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) throw new Error(`${part} phải nằm trong <AppShell>.`);
  return ctx;
}

export interface SidebarContextValue {
  drawer: boolean;
  rail: boolean;
  collapsible: SidebarCollapsible;
  resizable: boolean;
  width: number;
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  setWidth: (width: number, persist: boolean) => void;
  setResizing: (resizing: boolean) => void;
}

export const SidebarContext = React.createContext<SidebarContextValue | null>(null);
