import * as React from "react";
import { cn } from "@/lib/cn";
import { useComponentDefaults } from "../YugenProvider/context";

/** Kbd (shadcn/ui, giao diện Fluent 2) — https://ui.shadcn.com/docs/components/kbd */
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  size?: "small" | "medium";
}

export function Kbd(inProps: KbdProps & { ref?: React.Ref<HTMLElement> }) {
  const { className, size = "medium", ref, ...props } = useComponentDefaults("Kbd", inProps);
  return (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-0.5 whitespace-nowrap rounded-small border border-b-2 border-stroke-1",
        "bg-background-3 font-mono font-normal text-foreground-2 select-none [&_svg]:shrink-0",
        size === "small" ? "h-4 min-w-4 px-0.5 text-caption2 [&_svg]:size-3" : "h-5 min-w-5 px-1 text-caption1 [&_svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

/** Tổ hợp phím: `<KbdGroup><Kbd>Ctrl</Kbd>+<Kbd>K</Kbd></KbdGroup>`. */
export function KbdGroup({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }) {
  return (
    <kbd
      ref={ref}
      className={cn("inline-flex items-center gap-1 font-sans text-caption1 text-foreground-3", className)}
      {...props}
    />
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Kbd: KbdProps;
  }
}
