import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { Button, type ButtonProps } from "../Button/Button";
import { ToggleButton, type ToggleButtonProps } from "../ToggleButton/ToggleButton";
import { TOOLBAR_DEFAULTS, ToolbarContext, type ToolbarOrientation, type ToolbarSize } from "./context";
import { useComposedRefs } from "../_internal/composeRefs";
import { useComponentDefaults, COMPACT_SIZE } from "../YugenProvider/context";

/** Fluent 2 Toolbar — https://fluent2.microsoft.design/components/web/react/core/toolbar/usage */

const ITEM_SELECTOR = "[data-toolbar-item]:not([disabled]):not([data-disabled])";

const ROOT_SIZE: Record<ToolbarSize, string> = {
  small: "px-1",
  medium: "px-2 py-1",
  large: "px-5 py-1",
};

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ToolbarSize;
  orientation?: ToolbarOrientation;
  /**
   * Yugen Labs — thanh nổi bằng glass, bo tròn hai đầu; nút bên trong bo đồng tâm. glass-clear: trên ảnh / media
   * (đặt glass-scrim lên media bên dưới).
   */
  material?: "glass" | "glass-clear";
}

/** Thanh công cụ có roving focus: Tab vào/ra một lần, phím mũi tên / Home / End di chuyển giữa các mục. */
export function Toolbar(inProps: ToolbarProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    className,
    size = "medium",
    orientation = "horizontal",
    material,
    onKeyDown,
    onFocus,
    ref: forwardedRef,
    ...props
  } = useComponentDefaults("Toolbar", inProps, COMPACT_SIZE);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const activeRef = React.useRef<HTMLElement | null>(null);
  const dir = useDirection();

  const setRefs = useComposedRefs(rootRef, forwardedRef);

  const getItems = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);

  const syncTabIndex = () => {
    const items = getItems();
    if (items.length === 0) return;
    const active = activeRef.current && items.includes(activeRef.current) ? activeRef.current : items[0];
    items.forEach((item) => {
      item.tabIndex = item === active ? 0 : -1;
    });
  };

  useIsomorphicLayoutEffect(syncTabIndex);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    if (/^(input|textarea|select)$/i.test(target.tagName) || target.isContentEditable) return;

    const items = getItems();
    const index = items.indexOf(target);
    if (index === -1) return;

    const rtl = orientation === "horizontal" && dir === "rtl";
    const prevKey = orientation === "horizontal" ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
    const nextKey = orientation === "horizontal" ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";

    let next = -1;
    if (e.key === prevKey) next = (index - 1 + items.length) % items.length;
    else if (e.key === nextKey) next = (index + 1) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next === -1) return;

    e.preventDefault();
    activeRef.current = items[next];
    syncTabIndex();
    items[next].focus();
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(e);
    const target = e.target as HTMLElement;
    if (target.matches(ITEM_SELECTOR)) {
      activeRef.current = target;
      syncTabIndex();
    }
  };

  return (
    <ToolbarContext.Provider value={{ size, orientation }}>
      <div
        ref={setRefs}
        role="toolbar"
        aria-orientation={orientation}
        data-orientation={orientation}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={cn(
          "flex gap-0.5",
          orientation === "vertical" ? "w-fit flex-col items-stretch" : "items-center",
          ROOT_SIZE[size],
          material &&
            cn(
              material,
              "rounded-circular border border-transparent p-1 shadow-8",
              "[--concentric-padding:--spacing(1)] [--concentric-radius:var(--borderRadiusCircular)]",
              "**:data-toolbar-item:rounded-concentric",
            ),
          className,
        )}
        {...props}
      />
    </ToolbarContext.Provider>
  );
}

export interface ToolbarButtonProps extends Omit<ButtonProps, "size"> {
  /** Icon nằm trên chữ. */
  vertical?: boolean;
}

export function ToolbarButton({
  appearance = "subtle",
  vertical,
  className,
  ref,
  ...props
}: ToolbarButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { size } = React.useContext(ToolbarContext) ?? TOOLBAR_DEFAULTS;
  return (
    <Button
      ref={ref}
      data-toolbar-item=""
      appearance={appearance}
      size={size}
      className={cn("min-w-0", vertical && "h-auto flex-col gap-0.5 py-1", className)}
      {...props}
    />
  );
}

export type ToolbarToggleButtonProps = Omit<ToggleButtonProps, "size">;

export function ToolbarToggleButton({
  appearance = "subtle",
  className,
  ref,
  ...props
}: ToolbarToggleButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { size } = React.useContext(ToolbarContext) ?? TOOLBAR_DEFAULTS;
  return (
    <ToggleButton
      ref={ref}
      data-toolbar-item=""
      appearance={appearance}
      size={size}
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

export function ToolbarDivider({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { orientation } = React.useContext(ToolbarContext) ?? TOOLBAR_DEFAULTS;
  return (
    <div
      role="separator"
      aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
      className={cn(
        "shrink-0 self-stretch bg-stroke-2",
        orientation === "horizontal" ? "mx-1 my-1 w-px" : "mx-1 my-1 h-px",
        className,
      )}
      {...props}
    />
  );
}

export function ToolbarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { orientation } = React.useContext(ToolbarContext) ?? TOOLBAR_DEFAULTS;
  return (
    <div
      role="presentation"
      className={cn("flex gap-0.5", orientation === "vertical" ? "flex-col items-stretch" : "items-center", className)}
      {...props}
    />
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Toolbar: ToolbarProps;
  }
}
