import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/cn";

/** Collapsible (shadcn/ui) với chuyển động Fluent 2 — https://ui.shadcn.com/docs/components/collapsible */
export const Collapsible = CollapsiblePrimitive.Root;
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

/**
 * Nội dung luôn được mount để chuyển động chiều cao bằng grid-template-rows (0fr ↔ 1fr);
 * khi đóng phần tử bị `invisible` nên không nhận focus và không được trình đọc màn hình đọc.
 * `className` áp cho khối bên trong (đặt padding / layout ở đây).
 */
export const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  Omit<React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>, "forceMount">
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    forceMount
    className={cn(
      "grid transition-[grid-template-rows,visibility] duration-normal ease-easy-ease motion-reduce:transition-none",
      "data-[state=closed]:invisible data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]",
    )}
    {...props}
  >
    <div className="min-h-0 overflow-hidden">
      <div className={className}>{children}</div>
    </div>
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = "CollapsibleContent";
