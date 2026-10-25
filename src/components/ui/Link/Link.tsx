import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Open16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useYugenMessages } from "../YugenProvider/context";
import { linkMessages } from "./messages";

export { linkMessages, type LinkMessages } from "./messages";
export { linkMessagesEn } from "./messages.en";

/** Fluent 2 Link — https://fluent2.microsoft.design/components/web/react/core/link/usage */
const linkVariants = cva(
  [
    "cursor-pointer rounded-small transition-colors duration-faster ease-easy-ease",
    "aria-disabled:cursor-not-allowed aria-disabled:text-foreground-disabled aria-disabled:no-underline",
    "aria-disabled:hover:text-foreground-disabled aria-disabled:hover:no-underline",
  ],
  {
    variants: {
      appearance: {
        default: "text-link hover:text-link-hover hover:underline active:text-link-hover",
        subtle: "text-foreground-2 hover:text-foreground-1 hover:underline active:text-foreground-1",
      },
      inline: {
        // Link nằm trong đoạn văn: luôn gạch chân, kế thừa cỡ chữ của đoạn.
        true: "underline",
        // Link đứng riêng: cỡ chữ body1, chỉ gạch chân khi hover.
        false: "text-body1",
      },
    },
    defaultVariants: { appearance: "default", inline: false },
  },
);

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  disabled?: boolean;
  /** Mở tab mới và hiện icon "mở ngoài". */
  external?: boolean;
  asChild?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, appearance, inline, disabled, external, asChild, href, target, rel, onClick, children, ...props }, ref) => {
    const msg = useYugenMessages("link", linkMessages);
    const shared = {
      href: disabled ? undefined : href,
      target: external ? (target ?? "_blank") : target,
      rel: external ? (rel ?? "noopener noreferrer") : rel,
      "aria-disabled": disabled || undefined,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      },
      className: cn(linkVariants({ appearance, inline }), className),
      ...props,
    };

    const externalIcon = external ? (
      <>
        <Open16Regular aria-hidden className="ms-0.5 inline size-4 align-text-bottom" />
        <span className="sr-only"> {msg.newTab}</span>
      </>
    ) : null;

    if (asChild) {
      return (
        <Slot ref={ref} {...shared}>
          <Slottable>{children}</Slottable>
          {externalIcon}
        </Slot>
      );
    }

    return (
      <a ref={ref} role={disabled ? "link" : undefined} {...shared}>
        {children}
        {externalIcon}
      </a>
    );
  },
);
Link.displayName = "Link";

export { linkVariants };
