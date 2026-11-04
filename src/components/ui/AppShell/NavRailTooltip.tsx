import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip";
import type { NavRowTooltipProps } from "../Nav/context";

/**
 * Tooltip của mỗi hàng Nav trong Sidebar: mang nhãn của mục, chỉ mở khi sidebar đang là rail. Sidebar truyền nó qua
 * NavHostContext nên Nav không import Tooltip (#350).
 */
export function NavRailTooltip({ rail, label, rowRef, children }: NavRowTooltipProps) {
  const dir = useDirection();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  return (
    <Tooltip
      open={rail && open}
      onOpenChange={(next) => {
        // Không có nhãn riêng (asChild bọc link router): đọc chữ của hàng lúc mở.
        if (next && label === undefined) setText(rowRef.current?.textContent ?? "");
        setOpen(next);
      }}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={dir === "rtl" ? "left" : "right"}>{label ?? text}</TooltipContent>
    </Tooltip>
  );
}
