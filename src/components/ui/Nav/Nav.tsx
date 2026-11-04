import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown16Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { useYugenMessages, useComponentDefaults } from "../YugenProvider/context";
import { useComposedRefs } from "../_internal/composeRefs";
import { NavHostContext, type NavHostValue } from "./context";
import { navMessagesEn } from "./messages";

export { navMessages, navMessagesVi, navMessagesEn, type NavMessages } from "./messages";

/** Fluent 2 Nav — https://fluent2.microsoft.design/components/web/react/core/nav/usage */
type NavDensity = "medium" | "small";

/** YugenProvider density="compact": hàng của Nav dùng density small (#171). */
const NAV_COMPACT = { density: "small" } as const;

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

export function Nav(inProps: NavProps & { ref?: React.Ref<HTMLElement> }) {
  const {
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
    ref,
    ...props
  } = useComponentDefaults("Nav", inProps, NAV_COMPACT);
  const msg = useYugenMessages("nav", navMessagesEn);
  const host = React.useContext(NavHostContext);
  // Callback có thêm tham số (categoryValue, open) nên tự gọi, không truyền làm onChange.
  const [selected, setSelected] = useControllableState({ value: selectedValue, defaultValue: defaultSelectedValue });
  const [open, setOpen] = useControllableState({ value: openCategories, defaultValue: defaultOpenCategories });

  const ctx: NavContextValue = {
    selectedValue: selected,
    density,
    select: (value, categoryValue) => {
      setSelected(value);
      onNavItemSelect?.(value, { categoryValue });
      host?.onSelect?.();
    },
    isOpen: (value) => open.includes(value),
    toggle: (value) => {
      const willOpen = !open.includes(value);
      const next = willOpen ? (multiple ? [...open, value] : [value]) : open.filter((v) => v !== value);
      setOpen(next);
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
}

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
 * Trong Sidebar của AppShell: Tooltip (host truyền vào, #350) mang nhãn của mục, chỉ mở khi sidebar đang là rail. Luôn
 * bọc (kể cả khi chưa thu gọn) để thu gọn / mở rộng không mount lại hàng đang giữ focus. Ngoài AppShell: trả nguyên hàng.
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
  const RowTooltip = host?.RowTooltip;
  if (!host || !RowTooltip) return children;
  return (
    <RowTooltip rail={host.rail} label={label} rowRef={rowRef}>
      {children}
    </RowTooltip>
  );
}

type NavRowProps = React.HTMLAttributes<HTMLElement> & { href?: string; asChild?: boolean; selected: boolean };

function NavRow({
  href,
  asChild,
  selected,
  className,
  children,
  ref: forwardedRef,
  ...props
}: NavRowProps & { ref?: React.Ref<HTMLElement> }) {
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
}

export function NavItem({
  className,
  value,
  icon,
  href,
  asChild,
  tooltip,
  onClick,
  children,
  ref,
  ...props
}: NavItemProps & { ref?: React.Ref<HTMLElement> }) {
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
}

export function NavSubItem({
  className,
  value,
  href,
  asChild,
  onClick,
  children,
  ref,
  ...props
}: Omit<NavItemProps, "icon" | "tooltip"> & { ref?: React.Ref<HTMLElement> }) {
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
}

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

export function NavCategoryItem({
  className,
  icon,
  onClick,
  children,
  ref,
  ...props
}: NavCategoryItemProps & { ref?: React.Ref<HTMLButtonElement> }) {
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
}

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

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Nav: NavProps;
  }
}
