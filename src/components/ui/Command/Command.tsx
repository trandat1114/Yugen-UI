import * as React from "react";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Dialog, DialogSurface } from "../Dialog/Dialog";

/** Command (shadcn/ui + cmdk, giao diện Fluent 2 Menu) — https://ui.shadcn.com/docs/components/command */
export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => {
  // cmdk gọi scrollIntoView lên item đầu tiên ngay khi mount → cả trang bị kéo tới Command nếu nó nằm
  // dưới màn hình đầu. Giữ nguyên vị trí cuộn của cửa sổ ở lần mount đầu tiên.
  const initialScroll = React.useRef(typeof window === "undefined" ? null : { x: window.scrollX, y: window.scrollY });
  React.useEffect(() => {
    const saved = initialScroll.current;
    if (!saved) return;
    const restore = () => {
      if (window.scrollX !== saved.x || window.scrollY !== saved.y) window.scrollTo(saved.x, saved.y);
    };
    restore();
    const frame = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <CommandPrimitive
      ref={ref}
      className={cn("flex w-full flex-col overflow-hidden rounded-xlarge bg-background-1 text-foreground-1", className)}
      {...props}
    />
  );
});
Command.displayName = "Command";

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & { wrapperClassName?: string }
>(({ className, wrapperClassName, ...props }, ref) => (
  <div
    cmdk-input-wrapper=""
    className={cn(
      "flex items-center gap-S border-b border-stroke-2 px-M transition-colors duration-normal",
      "focus-within:border-b-brand-stroke",
      wrapperClassName,
    )}
  >
    <Search20Regular aria-hidden className="size-5 shrink-0 text-foreground-3" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "h-11 min-w-0 flex-1 bg-transparent text-body1 text-foreground-1 outline-none placeholder:text-foreground-4",
        "disabled:cursor-not-allowed disabled:text-foreground-disabled",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-80 scroll-py-XS overflow-x-hidden overflow-y-auto p-XS", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty ref={ref} className={cn("py-XXL text-center text-body1 text-foreground-3", className)} {...props} />
));
CommandEmpty.displayName = "CommandEmpty";

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden text-foreground-1",
      "**:[[cmdk-group-heading]]:flex **:[[cmdk-group-heading]]:h-8 **:[[cmdk-group-heading]]:items-center **:[[cmdk-group-heading]]:px-S",
      "**:[[cmdk-group-heading]]:text-caption1 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-foreground-3",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & { icon?: React.ReactNode }
>(({ className, icon, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      // Cùng giao diện với menuItemClass; cmdk dùng data-selected / data-disabled="true|false".
      "relative flex h-8 cursor-pointer items-center gap-S rounded-medium px-S text-body1 text-foreground-2 outline-none select-none",
      "data-[selected=true]:bg-background-1-hover data-[selected=true]:text-foreground-1 active:bg-background-1-pressed",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:text-foreground-disabled",
      "[&_svg]:size-5 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  >
    {icon}
    {children}
  </CommandPrimitive.Item>
));
CommandItem.displayName = "CommandItem";

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ms-auto ps-L text-caption1 text-foreground-3", className)} {...props} />;
}

export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, alwaysRender, ...props }, ref) => {
  // cmdk gắn role="separator" — không hợp lệ trong listbox (chỉ chứa option / group). Vẽ vạch trang trí riêng,
  // vẫn ẩn khi đang tìm kiếm như cmdk (trừ alwaysRender).
  const idle = useCommandState((state) => !state.search);
  if (!alwaysRender && !idle) return null;
  return <div ref={ref} role="none" cmdk-separator="" className={cn("-mx-XS my-XS h-px bg-stroke-2", className)} {...props} />;
});
CommandSeparator.displayName = "CommandSeparator";

export interface CommandDialogProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Tiêu đề cho trình đọc màn hình (ẩn). */
  title?: string;
}

/** Command đặt trong bề mặt Dialog — mở bằng phím tắt (thường Ctrl/⌘ + K). */
export function CommandDialog({
  open,
  defaultOpen,
  onOpenChange,
  title = "Bảng lệnh",
  className,
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogSurface aria-describedby={undefined} className="max-w-140 gap-0 overflow-hidden p-0">
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        <Command className={cn("rounded-none bg-transparent", className)} {...props}>
          {children}
        </Command>
      </DialogSurface>
    </Dialog>
  );
}
