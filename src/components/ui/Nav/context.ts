import * as React from "react";

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
}

export const NavHostContext = React.createContext<NavHostValue | null>(null);
