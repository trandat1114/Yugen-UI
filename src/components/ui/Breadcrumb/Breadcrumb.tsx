import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  ChevronRight12Regular,
  ChevronRight16Regular,
  ChevronRight20Regular,
  MoreHorizontal16Regular,
  MoreHorizontal20Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "../Menu/Menu";
import { useYugenMessages } from "../YugenProvider/context";
import { breadcrumbMessages } from "./messages";

export { breadcrumbMessages, breadcrumbMessagesEn, type BreadcrumbMessages } from "./messages";

/** Fluent 2 Breadcrumb — https://fluent2.microsoft.design/components/web/react/core/breadcrumb/usage */
type BreadcrumbSize = "small" | "medium" | "large";

const BreadcrumbContext = React.createContext<{ size: BreadcrumbSize }>({ size: "medium" });

const BUTTON_SIZE: Record<BreadcrumbSize, string> = {
  small: "h-6 gap-1 px-1 text-caption1 [&_svg]:size-4",
  medium: "h-8 gap-1 px-1.5 text-body1 [&_svg]:size-5",
  large: "h-10 gap-1.5 px-2.5 text-body2 [&_svg]:size-6",
};

const ICON_ONLY: Record<BreadcrumbSize, string> = { small: "w-6 px-0", medium: "w-8 px-0", large: "w-10 px-0" };

const buttonBase = cn(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-medium text-foreground-2 select-none",
  "transition-colors duration-faster ease-easy-ease [&_svg]:shrink-0",
);
const buttonInteractive = cn(
  "cursor-pointer hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
  "data-[state=open]:bg-subtle-pressed data-[state=open]:text-foreground-1",
  "disabled:pointer-events-none disabled:text-foreground-disabled",
);

export interface BreadcrumbItemData {
  key?: string;
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  size?: BreadcrumbSize;
  /** Dữ liệu các mục — tự chèn divider, mục cuối là trang hiện tại. Bỏ qua để tự viết children. */
  items?: BreadcrumbItemData[];
  /** Số mục tối đa hiển thị (chỉ áp dụng với `items`); phần giữa gom vào menu "…". */
  maxDisplayedItems?: number;
  /** Vị trí chèn nút "…" (số mục đầu được giữ lại). */
  overflowIndex?: number;
  /** aria-label của nút "…". Mặc định lấy từ `messages.breadcrumb.overflow`. */
  overflowLabel?: string;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      className,
      size = "medium",
      items,
      maxDisplayedItems,
      overflowIndex = 1,
      overflowLabel,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("breadcrumb", breadcrumbMessages);
    let content: React.ReactNode = children;

    if (items) {
      const max = maxDisplayedItems ?? items.length;
      const overflowing = items.length > max && max > overflowIndex;
      const start = overflowing ? items.slice(0, overflowIndex) : items;
      const overflow = overflowing ? items.slice(overflowIndex, items.length - (max - overflowIndex)) : [];
      const end = overflowing ? items.slice(items.length - (max - overflowIndex)) : [];
      const last = items[items.length - 1];

      const renderItem = (item: BreadcrumbItemData, i: number) => (
        <React.Fragment key={item.key ?? i}>
          <BreadcrumbItem>
            <BreadcrumbButton href={item.href} onClick={item.onClick} icon={item.icon} current={item === last}>
              {item.label}
            </BreadcrumbButton>
          </BreadcrumbItem>
          {item !== last && <BreadcrumbDivider />}
        </React.Fragment>
      );

      content = (
        <>
          {start.map(renderItem)}
          {overflowing && (
            <>
              <BreadcrumbItem>
                <BreadcrumbOverflow label={overflowLabel} items={overflow} />
              </BreadcrumbItem>
              <BreadcrumbDivider />
            </>
          )}
          {end.map((item, i) => renderItem(item, overflowIndex + overflow.length + i))}
        </>
      );
    }

    return (
      <BreadcrumbContext.Provider value={{ size }}>
        <nav ref={ref} aria-label={ariaLabel ?? msg.label} className={className} {...props}>
          <ol className="flex flex-wrap items-center">{content}</ol>
        </nav>
      </BreadcrumbContext.Provider>
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("flex items-center", className)} {...props} />,
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbButtonProps extends React.HTMLAttributes<HTMLElement> {
  href?: string;
  target?: string;
  rel?: string;
  /** Mục hiện tại: chữ semibold, `aria-current="page"`, không bấm được. */
  current?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Bọc link của router (ví dụ `<RouterLink>`). */
  asChild?: boolean;
}

export const BreadcrumbButton = React.forwardRef<HTMLElement, BreadcrumbButtonProps>(
  ({ className, href, target, rel, current, icon, disabled, asChild, children, ...props }, ref) => {
    const { size } = React.useContext(BreadcrumbContext);
    const classes = cn(
      buttonBase,
      BUTTON_SIZE[size],
      current ? "cursor-default font-semibold" : buttonInteractive,
      className,
    );

    if (current) {
      return (
        <span ref={ref} aria-current="page" className={classes} {...props}>
          {icon}
          {children}
        </span>
      );
    }

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    if (href && !disabled) {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} target={target} rel={rel} className={classes} {...props}>
          {icon}
          {children}
        </a>
      );
    }

    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" disabled={disabled} className={classes} {...props}>
        {icon}
        {children}
      </button>
    );
  },
);
BreadcrumbButton.displayName = "BreadcrumbButton";

export function BreadcrumbDivider({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  const { size } = React.useContext(BreadcrumbContext);
  const Icon = size === "small" ? ChevronRight12Regular : size === "large" ? ChevronRight20Regular : ChevronRight16Regular;
  return (
    <li
      role="presentation"
      aria-hidden
      className={cn("flex items-center text-foreground-3", size === "small" ? "px-0.5" : "px-1", className)}
      {...props}
    >
      <Icon className={cn("rtl:-scale-x-100", size === "small" ? "size-3" : size === "large" ? "size-5" : "size-4")} />
    </li>
  );
}

/** Nút "…" mở menu chứa các mục bị thu gọn. */
export function BreadcrumbOverflow({
  items,
  label,
  className,
}: {
  items: BreadcrumbItemData[];
  /** aria-label của nút. Mặc định lấy từ `messages.breadcrumb.overflow`. */
  label?: string;
  className?: string;
}) {
  const { size } = React.useContext(BreadcrumbContext);
  const msg = useYugenMessages("breadcrumb", breadcrumbMessages);
  return (
    <Menu>
      <MenuTrigger asChild>
        <button type="button" aria-label={label ?? msg.overflow} className={cn(buttonBase, BUTTON_SIZE[size], ICON_ONLY[size], buttonInteractive, className)}>
          {size === "small" ? <MoreHorizontal16Regular /> : <MoreHorizontal20Regular />}
        </button>
      </MenuTrigger>
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
