import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

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
  medium: "min-h-10 gap-S px-M",
  small: "min-h-8 gap-S px-S",
};
const SUB_INDENT: Record<NavDensity, string> = { medium: "ps-10", small: "ps-9" };

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
      "aria-label": ariaLabel = "Điều hướng chính",
      children,
      ...props
    },
    ref,
  ) => {
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
        <nav ref={ref} aria-label={ariaLabel} className={cn("flex flex-col gap-XXS", className)} {...props}>
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

function NavRow({
  forwardedRef,
  href,
  asChild,
  selected,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  forwardedRef: React.ForwardedRef<HTMLElement>;
  href?: string;
  asChild?: boolean;
  selected: boolean;
}) {
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

export const NavItem = React.forwardRef<HTMLElement, NavItemProps>(
  ({ className, value, icon, href, asChild, onClick, children, ...props }, ref) => {
    const { nav, selected, handleClick } = useNavRow(value, onClick);
    return (
      <NavRow
        forwardedRef={ref}
        href={href}
        asChild={asChild}
        selected={selected}
        onClick={handleClick}
        className={cn(rowBase, ROW[nav.density], selected && rowSelected, className)}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon}
            <span className="min-w-0 flex-1 truncate">{children}</span>
          </>
        )}
      </NavRow>
    );
  },
);
NavItem.displayName = "NavItem";

export const NavSubItem = React.forwardRef<HTMLElement, Omit<NavItemProps, "icon">>(
  ({ className, value, href, asChild, onClick, children, ...props }, ref) => {
    const { nav, category, selected, handleClick } = useNavRow(value, onClick);
    const register = category?.register;

    React.useEffect(() => register?.(value), [register, value]);

    return (
      <NavRow
        forwardedRef={ref}
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
    const open = category?.open ?? false;
    const showSelected = !open && !!category?.containsSelected;

    return (
      <button
        ref={ref}
        type="button"
        id={category?.triggerId}
        aria-expanded={open}
        aria-controls={category?.groupId}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented && category) nav.toggle(category.value);
        }}
        className={cn(rowBase, ROW[nav.density], showSelected && rowSelected, className)}
        {...props}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        <ChevronDown16Regular
          aria-hidden
          className={cn("size-4! transition-transform duration-normal ease-easy-ease", open && "rotate-180")}
        />
      </button>
    );
  },
);
NavCategoryItem.displayName = "NavCategoryItem";

export function NavSubItemGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const category = React.useContext(CategoryContext);
  return (
    <div
      id={category?.groupId}
      role="group"
      aria-labelledby={category?.triggerId}
      hidden={!(category?.open ?? true)}
      className={cn("flex flex-col gap-XXS", className)}
      {...props}
    />
  );
}

export function NavSectionHeader({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { density } = React.useContext(NavContext);
  return (
    <h3
      className={cn(
        "pt-M pb-XS text-caption1 font-semibold text-foreground-3",
        density === "small" ? "px-S" : "px-M",
        className,
      )}
      {...props}
    />
  );
}

export function NavDivider({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn("mx-S my-XS h-px shrink-0 bg-stroke-2", className)} {...props} />;
}
