import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { Checkmark20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Checkbox } from "../Checkbox/Checkbox";

/**
 * Fluent 2 List — https://fluent2.microsoft.design/components/web/react/core/list/usage
 * (bố cục item theo shadcn Item — https://ui.shadcn.com/docs/components/item)
 */
export type ListSelectionMode = "none" | "single" | "multiselect";
export type ListNavigationMode = "items" | "composite";

interface ListContextValue {
  selectionMode: ListSelectionMode;
  navigationMode?: ListNavigationMode;
  variant: "default" | "outline";
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  activeValue: string | null;
  setActiveValue: (value: string) => void;
}

const ListContext = React.createContext<ListContextValue>({
  selectionMode: "none",
  variant: "default",
  isSelected: () => false,
  toggle: () => {},
  activeValue: null,
  setActiveValue: () => {},
});

const FOCUSABLE =
  'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------ List */
export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** items: mũi tên lên/xuống giữa các item · composite: thêm → / ← để vào / ra nội dung tương tác trong item. */
  navigationMode?: ListNavigationMode;
  selectionMode?: ListSelectionMode;
  selectedItems?: string[];
  defaultSelectedItems?: string[];
  onSelectionChange?: (selectedItems: string[]) => void;
  /** default: item phẳng · outline: mỗi item là thẻ có viền. */
  variant?: "default" | "outline";
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  (
    {
      navigationMode,
      selectionMode = "none",
      selectedItems,
      defaultSelectedItems,
      onSelectionChange,
      variant = "default",
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultSelectedItems ?? []);
    const selected = selectedItems ?? uncontrolled;
    const [activeValue, setActiveValue] = React.useState<string | null>(null);
    const innerRef = React.useRef<HTMLUListElement | null>(null);
    const dir = useDirection();
    const nav = navigationMode ?? (selectionMode !== "none" ? "items" : undefined);

    const setRefs = React.useCallback(
      (node: HTMLUListElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const toggle = React.useCallback(
      (value: string) => {
        if (selectionMode === "none") return;
        const has = selected.includes(value);
        const next =
          selectionMode === "single" ? (has ? [] : [value]) : has ? selected.filter((v) => v !== value) : [...selected, value];
        if (selectedItems === undefined) setUncontrolled(next);
        onSelectionChange?.(next);
      },
      [selectionMode, selected, selectedItems, onSelectionChange],
    );

    // Roving tabindex: luôn có đúng một item nhận Tab (mục đang chọn hoặc mục đầu tiên).
    React.useEffect(() => {
      const root = innerRef.current;
      if (!nav || !root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>("[data-list-item]"));
      if (activeValue !== null && items.some((el) => el.dataset.value === activeValue)) return;
      const fallback = items.find((el) => el.getAttribute("aria-selected") === "true") ?? items[0];
      if (fallback?.dataset.value) setActiveValue(fallback.dataset.value);
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
      onKeyDown?.(event);
      const root = innerRef.current;
      if (event.defaultPrevented || !nav || !root) return;
      const target = event.target as HTMLElement;
      const item = target.closest<HTMLElement>("[data-list-item]");
      if (!item || !root.contains(item)) return;
      // Composite: phím về phía cuối dòng đi vào item, phím về phía đầu dòng thoát ra (đảo trong RTL).
      const enterKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const exitKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";

      // Focus đang ở phần tử con bên trong item (chế độ composite).
      if (target !== item) {
        if (nav === "composite" && (event.key === "Escape" || event.key === exitKey)) {
          event.preventDefault();
          item.focus();
        }
        return;
      }

      const items = Array.from(root.querySelectorAll<HTMLElement>("[data-list-item]"));
      const index = items.indexOf(item);
      let next: HTMLElement | undefined;
      switch (event.key) {
        case "ArrowDown":
          next = items[Math.min(index + 1, items.length - 1)];
          break;
        case "ArrowUp":
          next = items[Math.max(index - 1, 0)];
          break;
        case "Home":
          next = items[0];
          break;
        case "End":
          next = items[items.length - 1];
          break;
        case enterKey:
          if (nav === "composite") next = item.querySelector<HTMLElement>(FOCUSABLE) ?? undefined;
          break;
        default:
          return;
      }
      if (!next) return;
      event.preventDefault();
      next.focus();
    };

    const context = React.useMemo<ListContextValue>(
      () => ({
        selectionMode,
        navigationMode: nav,
        variant,
        isSelected: (value) => selected.includes(value),
        toggle,
        activeValue,
        setActiveValue,
      }),
      [selectionMode, nav, variant, selected, toggle, activeValue],
    );

    return (
      <ListContext.Provider value={context}>
        <ul
          ref={setRefs}
          role={selectionMode === "none" ? "list" : "listbox"}
          aria-multiselectable={selectionMode === "multiselect" || undefined}
          className={cn("m-0 flex list-none flex-col p-0", variant === "outline" ? "gap-S" : "gap-XXS", className)}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </ListContext.Provider>
    );
  },
);
List.displayName = "List";

/* ------------------------------------------------------------------ ListItem */
export interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title" | "value"> {
  /** Định danh dùng cho selection / roving focus. */
  value?: string;
  /** Avatar, icon hoặc ảnh nhỏ ở đầu item. */
  media?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Nút / menu ở cuối item (click không kích hoạt item). */
  actions?: React.ReactNode;
  /** Hành động chính khi click / Enter trên item. */
  onAction?: (event: React.SyntheticEvent<HTMLLIElement>) => void;
  disabled?: boolean;
}

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    { value: valueProp, media, title, description, actions, onAction, disabled = false, className, children, onClick, onKeyDown, onFocus, ...props },
    ref,
  ) => {
    const ctx = React.useContext(ListContext);
    const autoId = React.useId();
    const value = valueProp ?? autoId;
    const selectable = ctx.selectionMode !== "none";
    const selected = selectable && ctx.isSelected(value);
    const focusable = !!ctx.navigationMode;
    const interactive = !disabled && (selectable || !!onAction);

    const activate = (event: React.SyntheticEvent<HTMLLIElement>) => {
      if (!interactive) return;
      onAction?.(event);
      if (selectable) ctx.toggle(value);
    };

    return (
      <li
        ref={ref}
        data-list-item=""
        data-value={value}
        role={selectable ? "option" : "listitem"}
        aria-selected={selectable ? selected : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={focusable ? (ctx.activeValue === value ? 0 : -1) : interactive ? 0 : undefined}
        onFocus={(event) => {
          onFocus?.(event);
          if (focusable) ctx.setActiveValue(value);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) activate(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate(event);
          }
        }}
        className={cn(
          "group/list-item relative flex items-center gap-M text-start text-foreground-1",
          "transition-[background-color,border-color] duration-faster ease-easy-ease",
          ctx.variant === "outline"
            ? "rounded-xlarge border border-stroke-2 bg-background-1 p-M"
            : "rounded-medium border border-transparent px-M py-S",
          interactive && "cursor-pointer",
          interactive &&
            (selected
              ? "bg-brand-background-2 hover:bg-brand-background-2-hover active:bg-brand-background-2-pressed"
              : "hover:bg-subtle-hover active:bg-subtle-pressed"),
          selected && ctx.variant === "outline" && "border-brand-stroke",
          disabled && "cursor-not-allowed text-foreground-disabled",
          className,
        )}
        {...props}
      >
        {ctx.selectionMode === "multiselect" && (
          <span aria-hidden className="pointer-events-none flex shrink-0 [&>span]:py-0">
            <Checkbox checked={selected} disabled={disabled} tabIndex={-1} />
          </span>
        )}
        {media && (
          <span className={cn("flex shrink-0 items-center [&>svg]:size-5", disabled ? "text-foreground-disabled" : "text-foreground-2")}>
            {media}
          </span>
        )}
        {(title != null || description != null || children != null) && (
          <span className="flex min-w-0 flex-1 flex-col">
            {title != null && (
              <span className={cn("truncate text-body1 font-semibold", disabled ? "text-foreground-disabled" : "text-foreground-1")}>
                {title}
              </span>
            )}
            {description != null && (
              <span className={cn("line-clamp-2 text-caption1", disabled ? "text-foreground-disabled" : "text-foreground-3")}>
                {description}
              </span>
            )}
            {children}
          </span>
        )}
        {ctx.selectionMode === "single" && selected && (
          <Checkmark20Regular aria-hidden className="ms-auto shrink-0 text-brand-foreground-1" />
        )}
        {actions && (
          <span
            className="ms-auto flex shrink-0 items-center gap-XS"
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
          </span>
        )}
      </li>
    );
  },
);
ListItem.displayName = "ListItem";
