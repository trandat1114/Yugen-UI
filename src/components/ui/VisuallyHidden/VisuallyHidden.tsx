/** Fluent UI VisuallyHidden (useVisuallyHidden / sr-only) — https://fluent2.microsoft.design/accessibility */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

/** Class ẩn khỏi màn hình nhưng vẫn được trình đọc màn hình đọc. */
export const visuallyHiddenClass = "sr-only";

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Gộp class vào phần tử con duy nhất (Radix Slot) thay vì render <span>. */
  asChild?: boolean;
  /** Hiện lại khi phần tử (hoặc con của nó) nhận focus — dùng cho "skip link". */
  focusable?: boolean;
}

export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ asChild, focusable = false, className, ...props }, ref) => {
    // focusable: chỉ ẩn khi không có focus bên trong — khi focus, phần tử giữ nguyên style của chính nó.
    const classes = cn(focusable ? "not-focus-within:sr-only" : visuallyHiddenClass, className);
    if (asChild) return <Slot ref={ref} className={classes} {...props} />;
    return <span ref={ref} className={classes} {...props} />;
  },
);
VisuallyHidden.displayName = "VisuallyHidden";
