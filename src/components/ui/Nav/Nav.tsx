import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useDirection } from "@radix-ui/react-direction";
import { ChevronDown16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useYugenMessages } from "../YugenProvider/context";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip";
import { useComposedRefs } from "../_internal/composeRefs";
import { NavHostContext, type NavHostValue } from "./context";
import { navMessages } from "./messages";

export { navMessages, navMessagesEn, type NavMessages } from "./messages";

/** Fluent 2 Nav — https://fluent2.microsoft.design/components/web/react/core/nav/usage */
type NavDensity = "medium" | "small";

interface NavContextValue {
  selectedValue?: string;
  density: NavDensity;
  select: (value: string, categoryValue?: string) => void;
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

const NavContext = React.createContext<NavContextValue>({
  density: "medium",
  select: () => {},
  isOpen: () => false,
  toggle: () => {},
});

interface CategoryContextValue {
  value: string;
  open: boolean;
  containsSelected: boolean;
  triggerId: string;
  groupId: string;
  register: (value: string) => () => void;
}

const CategoryContext = React.createContext<CategoryContextValue | null>(null);

const ROW: Record<NavDensity, string> = {
  medium: "min-h-10 gap-2 px-3",
  small: "min-h-8 gap-2 px-2",
};
const SUB_INDENT: Record<NavDensity, string> = { medium: "ps-10", small: "ps-9" };
/** Sidebar thu về rail: ô vuông 40px chỉ còn icon; phần còn lại (nhãn, badge) chỉ dành cho trình đọc màn hình. */
const RAIL_ROW = "size-10 justify-center gap-0 px-0 [&>:not(svg)]:sr-only";

const rowBase = cn(
  "relative flex w-full cursor-pointer items-center rounded-xlarge text-start text-body1 text-foreground-2 select-none",
  "transition-colors duration-faster ease-easy-ease",
  "hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
  "[&_svg]:size-5 [&_svg]:shrink-0",
);
const rowSelected = cn(
  "bg-brand-background-2-hover text-brand-foreground-2 hover:bg-brand-background-2-hover hover:text-brand-foreground-2 active:bg-brand-background-2-pressed",
  // Thanh chỉ báo 4px ở mép đầu.
  "before:absolute before:inset-s-0 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-circular before:bg-brand-stroke",
);

export interface NavProps extends React.HTMLAttributes<HTMLElement> {
  /** Giá trị mục đang chọn (controlled). */
  selectedValue?: string;
  defaultSelectedValue?: string;
  onNavItemSelect?: (value: string, data: { categoryValue?: string }) => void;
  /** Các NavCategory đang mở (controlled). */
  openCategories?: string[];
  defaultOpenCategories?: string[];
  onNavCategoryItemToggle?: (value: string, open: boolean) => void;
  /** Cho phép mở nhiều category cùng lúc. */
  multiple?: boolean;
  density?: NavDensity;
  /**
   * Yugen Labs — sidebar nổi bằng glass trên nội dung (bo góc, đổ bóng, có đệm).
   * Đặt khoảng cách với mép màn hình ở phần tử bao ngoài.
   */
  material?: "glass" | "glass-clear";
}

export const Nav = React.forwardRef<HTMLElement, NavProps>(
  (
    {
      className,
      selectedValue,
      defaultSelectedValue,
      onNavItemSelect,
      openCategories,
      defaultOpenCategories = [],
      onNavCategoryItemToggle,
      multiple = true,
      density = "medium",
      material,
      "aria-label": ariaLabel,
      children,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("nav", navMessages);
    const host = React.useContext(NavHostContext);
    const [innerSelected, setInnerSelected] = React.useState(defaultSelectedValue);
    const [innerOpen, setInnerOpen] = React.useState<string[]>(defaultOpenCategories);
    const selected = selectedValue ?? innerSelected;
    const open = openCategories ?? innerOpen;

    const ctx: NavContextValue = {
      selectedValue: selected,
      density,
      select: (value, categoryValue) => {
        if (selectedValue === undefined) setInnerSelected(value);
        onNavItemSelect?.(value, { categoryValue });
        host?.onSelect?.();
      },
      isOpen: (value) => open.includes(value),
      toggle: (value) => {
        const willOpen = !open.includes(value);
        const next = willOpen ? (multiple ? [...open, value] : [value]) : open.filter((v) => v !== value);
        if (openCategories === undefined) setInnerOpen(next);
        onNavCategoryItemToggle?.(value, willOpen);
      },
    };

    return (
      <NavContext.Provider value={ctx}>
        <nav
          ref={ref}
          aria-label={ariaLabel ?? msg.label}
          className={cn(
            "flex flex-col gap-0.5",
            // 3xlarge (16px) − đệm 8px = rounded-xlarge của hàng: góc đồng tâm sẵn.
            material && cn(material, "rounded-3xlarge border border-transparent p-2 shadow-16"),
            className,
          )}
          {...props}
        >
          {children}
        </nav>
      </NavContext.Provider>
    );
  },
);
Nav.displayName = "Nav";

export interface NavItemProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
  icon?: React.ReactNode;
  href?: string;
  /** Bọc link của router. */
  asChild?: boolean;
  /** Nhãn trong Tooltip khi Sidebar của AppShell thu về rail. Mặc định: chữ của mục. */
  tooltip?: React.ReactNode;
}

function useNavRow(value: string, onClick: React.MouseEventHandler<HTMLElement> | undefined) {
  const nav = React.useContext(NavContext);
  const category = React.useContext(CategoryContext);
  const selected = nav.selectedValue === value;
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) nav.select(value, category?.value);
  };
  return { nav, category, selected, handleClick };
}

/**
 * Trong Sidebar của AppShell: Tooltip mang nhãn của mục, chỉ mở khi sidebar đang là rail. Luôn bọc (kể cả khi chưa
 * thu gọn) để thu gọn / mở rộng không mount lại hàng đang giữ focus. Ngoài AppShell: trả nguyên hàng.
 */
function HostTooltip({
  host,
  label,
  rowRef,
  children,
}: {
  host: NavHostValue | null;
  label?: React.ReactNode;
  rowRef: React.RefObject<HTMLElement | null>;
  children: React.ReactElement;
}) {
  const dir = useDirection();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  if (!host) return children;
  return (
    <Tooltip
      open={host.rail && open}
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

type NavRowProps = React.HTMLAttributes<HTMLElement> & { href?: string; asChild?: boolean; selected: boolean };

const NavRow = React.forwardRef<HTMLElement, NavRowProps>(function NavRow(
  { href, asChild, selected, className, children, ...props },
  forwardedRef,
) {
  const shared = {
    "aria-current": selected ? ("page" as const) : undefined,
    "data-selected": selected || undefined,
    className,
    ...props,
  };
  if (asChild) {
    return (
      <Slot ref={forwardedRef} {...shared}>
        {children}
      </Slot>
    );
  }
  if (href) {
    return (
      <a ref={forwardedRef as React.Ref<HTMLAnchorElement>} href={href} {...shared}>
        {children}
      </a>
    );
  }
  return (
    <button ref={forwardedRef as React.Ref<HTMLButtonElement>} type="button" {...shared}>
      {children}
    </button>
  );
});

export const NavItem = React.forwardRef<HTMLElement, NavItemProps>(
  ({ className, value, icon, href, asChild, tooltip, onClick, children, ...props }, ref) => {
    const { nav, selected, handleClick } = useNavRow(value, onClick);
    const host = React.useContext(NavHostContext);
    const rowRef = React.useRef<HTMLElement>(null);
    const refs = useComposedRefs(ref, rowRef);
    return (
      <HostTooltip host={host} label={tooltip ?? (asChild ? undefined : children)} rowRef={rowRef}>
        <NavRow
          ref={refs}
          href={href}
          asChild={asChild}
          selected={selected}
          onClick={handleClick}
          className={cn(rowBase, host?.rail ? RAIL_ROW : ROW[nav.density], selected && rowSelected, className)}
          {...props}
        >
          {asChild ? (
            children
          ) : (
            <>
              {icon}
              <span className={host?.rail ? "sr-only" : "min-w-0 flex-1 truncate"}>{children}</span>
            </>
          )}
        </NavRow>
      </HostTooltip>
    );
  },
);
NavItem.displayName = "NavItem";

export const NavSubItem = React.forwardRef<HTMLElement, Omit<NavItemProps, "icon" | "tooltip">>(
  ({ className, value, href, asChild, onClick, children, ...props }, ref) => {
    const { nav, category, selected, handleClick } = useNavRow(value, onClick);
    const register = category?.register;

    React.useEffect(() => register?.(value), [register, value]);

    return (
      <NavRow
        ref={ref}
        href={href}
        asChild={asChild}
        selected={selected}
        onClick={handleClick}
        className={cn(rowBase, ROW[nav.density], SUB_INDENT[nav.density], selected && rowSelected, className)}
        {...props}
      >
        {asChild ? children : <span className="min-w-0 flex-1 truncate">{children}</span>}
      </NavRow>
    );
  },
);
NavSubItem.displayName = "NavSubItem";

export interface NavCategoryProps {
  value: string;
  children: React.ReactNode;
}

/** Nhóm có thể thu gọn: chứa một NavCategoryItem và một NavSubItemGroup. */
export function NavCategory({ value, children }: NavCategoryProps) {
  const nav = React.useContext(NavContext);
  const [subValues, setSubValues] = React.useState<string[]>([]);
  const id = React.useId();

  const register = React.useCallback((sub: string) => {
    setSubValues((prev) => [...prev, sub]);
    return () => setSubValues((prev) => prev.filter((v) => v !== sub));
  }, []);

  const ctx: CategoryContextValue = {
    value,
    open: nav.isOpen(value),
    containsSelected: nav.selectedValue !== undefined && subValues.includes(nav.selectedValue),
    triggerId: `${id}-trigger`,
    groupId: `${id}-group`,
    register,
  };

  return <CategoryContext.Provider value={ctx}>{children}</CategoryContext.Provider>;
}

export interface NavCategoryItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export const NavCategoryItem = React.forwardRef<HTMLButtonElement, NavCategoryItemProps>(
  ({ className, icon, onClick, children, ...props }, ref) => {
    const nav = React.useContext(NavContext);
    const category = React.useContext(CategoryContext);
    const host = React.useContext(NavHostContext);
    const rail = !!host?.rail;
    const open = category?.open ?? false;
    // Rail không hiện nhóm con: mục chọn nằm trong nhóm thì category mang chỉ báo.
    const showSelected = (!open || rail) && !!category?.containsSelected;
    const rowRef = React.useRef<HTMLButtonElement>(null);
    const refs = useComposedRefs(ref, rowRef);

    return (
      <HostTooltip host={host} label={children} rowRef={rowRef}>
        <button
          ref={refs}
          type="button"
          id={category?.triggerId}
          aria-expanded={rail ? false : open}
          aria-controls={category?.groupId}
          onClick={(e) => {
            onClick?.(e);
            if (e.defaultPrevented || !category) return;
            // Rail: mở rộng sidebar và mở nhóm để thấy các mục con.
            if (rail) {
              host?.expand();
              if (!open) nav.toggle(category.value);
            } else nav.toggle(category.value);
          }}
          className={cn(rowBase, rail ? RAIL_ROW : ROW[nav.density], showSelected && rowSelected, className)}
          {...props}
        >
          {icon}
          <span className={rail ? "sr-only" : "min-w-0 flex-1 truncate"}>{children}</span>
          {!rail && (
            <ChevronDown16Regular
              aria-hidden
              className={cn("size-4! transition-transform duration-normal ease-easy-ease", open && "rotate-180")}
            />
          )}
        </button>
      </HostTooltip>
    );
  },
);
NavCategoryItem.displayName = "NavCategoryItem";

export function NavSubItemGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const category = React.useContext(CategoryContext);
  const rail = !!React.useContext(NavHostContext)?.rail;
  return (
    <div
      id={category?.groupId}
      role="group"
      aria-labelledby={category?.triggerId}
      hidden={rail || !(category?.open ?? true)}
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

export function NavSectionHeader({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { density } = React.useContext(NavContext);
  const rail = !!React.useContext(NavHostContext)?.rail;
  if (rail) {
    // Rail: vạch ngăn giữa các nhóm icon; tên nhóm vẫn đọc được bằng trình đọc màn hình.
    return (
      <h3 className={cn("mx-2 my-1.5 h-px shrink-0 bg-stroke-2 first:bg-transparent", className)} {...props}>
        <span className="sr-only">{children}</span>
      </h3>
    );
  }
  return (
    <h3
      className={cn(
        "pt-3 pb-1 text-caption1 font-semibold text-foreground-3",
        density === "small" ? "px-2" : "px-3",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function NavDivider({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn("mx-2 my-1 h-px shrink-0 bg-stroke-2", className)} {...props} />;
}
