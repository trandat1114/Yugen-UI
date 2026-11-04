import * as React from "react";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "../Menu/Menu";
import type { BreadcrumbItemData } from "./Breadcrumb";

/**
 * Menu của nút "…" trong Breadcrumb. Breadcrumb nạp file này lúc cần (#350): chỉ khi có mục bị gom thì mới mang Menu.
 * Chỉ dùng nội bộ — không export qua barrel.
 */
export function BreadcrumbOverflowMenu({
  items,
  defaultOpen,
  children,
}: {
  items: BreadcrumbItemData[];
  /** Đã bấm nút trước khi file này nạp xong: mở ngay. */
  defaultOpen?: boolean;
  /** Nút "…". */
  children: React.ReactElement;
}) {
  return (
    <Menu defaultOpen={defaultOpen}>
      <MenuTrigger asChild>{children}</MenuTrigger>
      <MenuPopover>
        {items.map((item, i) => (
          <MenuItem
            key={item.key ?? i}
            icon={item.icon}
            onSelect={() => {
              item.onClick?.();
              if (item.href) window.location.assign(item.href);
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </MenuPopover>
    </Menu>
  );
}
