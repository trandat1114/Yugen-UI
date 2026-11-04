import * as React from "react";

/** Phần bọc mỗi hàng (NavItem, NavCategoryItem) mà host truyền vào, ví dụ Tooltip của rail. */
export interface NavRowTooltipProps {
  /** Sidebar đang thu về rail: chỉ khi đó Tooltip mới mở. */
  rail: boolean;
  /** Nhãn trong Tooltip. `undefined` (asChild bọc link router): đọc chữ của hàng lúc mở. */
  label?: React.ReactNode;
  rowRef: React.RefObject<HTMLElement | null>;
  children: React.ReactElement;
}

/**
 * Nav đặt trong Sidebar của AppShell. Không có (null) khi dùng Nav một mình.
 * Chỉ dùng nội bộ (AppShell) — không export qua barrel.
 */
export interface NavHostValue {
  /** Sidebar đang thu về rail: mục chỉ còn icon, nhãn ẩn và hiện trong Tooltip. */
  rail: boolean;
  /** Mở rộng sidebar (bấm NavCategoryItem khi đang ở rail). */
  expand: () => void;
  /** Gọi sau khi chọn một mục (Sidebar trong Drawer tự đóng). */
  onSelect?: () => void;
  /**
   * Tooltip của rail, do host truyền vào: Nav không import Tooltip nên app dùng Nav một mình không mang nó (#350).
   * Không có: hàng không được bọc.
   */
  RowTooltip?: React.ComponentType<NavRowTooltipProps>;
}

export const NavHostContext = React.createContext<NavHostValue | null>(null);
