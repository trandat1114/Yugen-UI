import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { ChevronRight12Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

/** Fluent 2 Tree — https://fluent2.microsoft.design/components/web/react/core/tree/usage */
export type TreeSize = "small" | "medium";
export type TreeAppearance = "subtle" | "transparent";
export type TreeItemType = "branch" | "leaf";

/**
 * Mục đang giữ tab stop (roving tabindex), để ngoài context: mỗi phím mũi tên chỉ render lại hai mục đổi trạng thái thay vì
 * mọi mục trong cây.
 */
interface ActiveStore {
  get: () => string | null;
  set: (value: string) => void;
  subscribe: (listener: () => void) => () => void;
}

function createActiveStore(): ActiveStore {
  let current: string | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => current,
    set: (value) => {
      if (value === current) return;
      current = value;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

interface TreeRootContextValue {
  size: TreeSize;
  appearance: TreeAppearance;
  selectionMode: "none" | "single";
  isOpen: (value: string) => boolean;
  toggleOpen: (value: string, open?: boolean) => void;
  selectedValue?: string;
  select: (value: string) => void;
  active: ActiveStore;
}

const TreeRootContext = React.createContext<TreeRootContextValue | null>(null);
/** Cấp (aria-level) của các TreeItem trong Tree / subtree hiện tại. */
const TreeLevelContext = React.createContext(1);

interface TreeItemContextValue {
  value: string;
  level: number;
  itemType: TreeItemType;
  open: boolean;
  selected: boolean;
}

const TreeItemContext = React.createContext<TreeItemContextValue | null>(null);

const NOOP_ROOT: TreeRootContextValue = {
  size: "medium",
  appearance: "subtle",
  selectionMode: "none",
  isOpen: () => false,
  toggleOpen: () => {},
  select: () => {},
  active: createActiveStore(),
};

const TREE_ITEM = '[role="treeitem"]';

/* ------------------------------------------------------------------ Tree */
export interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: TreeSize;
  /** subtle: hover nền xám · transparent: không nền. */
  appearance?: TreeAppearance;
  openItems?: string[];
  defaultOpenItems?: string[];
  onOpenChange?: (openItems: string[], data: { value: string; open: boolean }) => void;
  /** single: Enter / click chọn một mục (aria-selected). */
  selectionMode?: "none" | "single";
  selectedValue?: string;
  defaultSelectedValue?: string;
  onSelectedChange?: (value: string) => void;
}

/** Tree gốc (`role="tree"`); đặt bên trong TreeItem nhánh thì thành subtree (`role="group"`). */
export const Tree = React.forwardRef<HTMLDivElement, TreeProps>((props, ref) => {
  const root = React.useContext(TreeRootContext);
  const parentItem = React.useContext(TreeItemContext);
  if (root && parentItem) return <Subtree ref={ref} {...props} />;
  return <TreeRoot ref={ref} {...props} />;
});
Tree.displayName = "Tree";

const Subtree = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      size,
      appearance,
      openItems,
      defaultOpenItems,
      onOpenChange,
      selectionMode,
      selectedValue,
      defaultSelectedValue,
      onSelectedChange,
      className,
      ...props
    },
    ref,
  ) => {
    const item = React.useContext(TreeItemContext);
    if (!item?.open) return null;
    return (
      <TreeLevelContext.Provider value={item.level + 1}>
        <div ref={ref} role="group" className={cn("flex animate-fade-in flex-col", className)} {...props} />
      </TreeLevelContext.Provider>
    );
  },
);
Subtree.displayName = "Subtree";

const TreeRoot = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      size = "medium",
      appearance = "subtle",
      openItems,
      defaultOpenItems,
      onOpenChange,
      selectionMode = "none",
      selectedValue,
      defaultSelectedValue,
      onSelectedChange,
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const [openState, setOpenState] = React.useState<string[]>(defaultOpenItems ?? []);
    const open = openItems ?? openState;
    const [selectedState, setSelectedState] = React.useState(defaultSelectedValue);
    const selected = selectedValue ?? selectedState;
    const [active] = React.useState(createActiveStore);
    const openSet = React.useMemo(() => new Set(open), [open]);
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const dir = useDirection();

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const toggleOpen = React.useCallback(
      (value: string, force?: boolean) => {
        const isOpen = openSet.has(value);
        const nextOpen = force ?? !isOpen;
        if (nextOpen === isOpen) return;
        const next = nextOpen ? [...open, value] : open.filter((v) => v !== value);
        if (openItems === undefined) setOpenState(next);
        onOpenChange?.(next, { value, open: nextOpen });
      },
      [open, openSet, openItems, onOpenChange],
    );

    const select = React.useCallback(
      (value: string) => {
        if (selectionMode === "none") return;
        if (selectedValue === undefined) setSelectedState(value);
        onSelectedChange?.(value);
      },
      [selectionMode, selectedValue, onSelectedChange],
    );

    // Roving tabindex: luôn có đúng một treeitem nhận Tab (mục đang chọn hoặc mục đầu tiên).
    React.useEffect(() => {
      const rootEl = innerRef.current;
      if (!rootEl) return;
      const items = Array.from(rootEl.querySelectorAll<HTMLElement>(TREE_ITEM));
      const current = active.get();
      if (current !== null && items.some((el) => el.dataset.value === current)) return;
      const fallback = items.find((el) => el.getAttribute("aria-selected") === "true") ?? items[0];
      if (fallback?.dataset.value) active.set(fallback.dataset.value);
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      const rootEl = innerRef.current;
      const target = event.target as HTMLElement;
      // Bỏ qua phím phát ra từ nút / action bên trong item.
      if (event.defaultPrevented || !rootEl || target.getAttribute("role") !== "treeitem") return;

      const items = Array.from(rootEl.querySelectorAll<HTMLElement>(TREE_ITEM));
      const index = items.indexOf(target);
      const value = target.dataset.value ?? "";
      const isBranch = target.dataset.itemType === "branch";
      const isOpen = target.getAttribute("aria-expanded") === "true";
      const focusAt = (i: number) => items[Math.max(0, Math.min(items.length - 1, i))]?.focus();
      // RTL: phím về phía cuối dòng (ArrowLeft) mở nhánh, phím về phía đầu dòng (ArrowRight) đóng / lên cha.
      const key =
        dir === "rtl" && (event.key === "ArrowLeft" || event.key === "ArrowRight")
          ? event.key === "ArrowLeft"
            ? "ArrowRight"
            : "ArrowLeft"
          : event.key;

      switch (key) {
        case "ArrowDown":
          focusAt(index + 1);
          break;
        case "ArrowUp":
          focusAt(index - 1);
          break;
        case "Home":
          focusAt(0);
          break;
        case "End":
          focusAt(items.length - 1);
          break;
        case "ArrowRight":
          if (!isBranch) return;
          if (isOpen) focusAt(index + 1);
          else toggleOpen(value, true);
          break;
        case "ArrowLeft":
          if (isBranch && isOpen) toggleOpen(value, false);
          else target.parentElement?.closest<HTMLElement>(TREE_ITEM)?.focus();
          break;
        case "Enter":
        case " ":
          target.click();
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    const context = React.useMemo<TreeRootContextValue>(
      () => ({
        size,
        appearance,
        selectionMode,
        isOpen: (value) => openSet.has(value),
        toggleOpen,
        selectedValue: selected,
        select,
        active,
      }),
      [size, appearance, selectionMode, openSet, toggleOpen, selected, select, active],
    );

    return (
      <TreeRootContext.Provider value={context}>
        <TreeLevelContext.Provider value={1}>
          <div ref={setRefs} role="tree" className={cn("flex flex-col", className)} onKeyDown={handleKeyDown} {...props} />
        </TreeLevelContext.Provider>
      </TreeRootContext.Provider>
    );
  },
);
TreeRoot.displayName = "TreeRoot";

/* ------------------------------------------------------------------ TreeItem */
export interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** branch: có subtree, mở / đóng được · leaf: mục cuối. */
  itemType: TreeItemType;
  /** Định danh dùng cho openItems / selectedValue. */
  value?: string;
}

export const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  ({ itemType, value: valueProp, className, style, children, onClick, onFocus, ...props }, ref) => {
    const root = React.useContext(TreeRootContext) ?? NOOP_ROOT;
    const level = React.useContext(TreeLevelContext);
    const autoId = React.useId();
    const value = valueProp ?? autoId;
    const open = itemType === "branch" && root.isOpen(value);
    const isActive = React.useSyncExternalStore(root.active.subscribe, () => root.active.get() === value, () => false);
    const selected = root.selectionMode !== "none" && root.selectedValue === value;
    const itemContext = React.useMemo(
      () => ({ value, level, itemType, open, selected }),
      [value, level, itemType, open, selected],
    );

    return (
      <TreeItemContext.Provider value={itemContext}>
        <div
          ref={ref}
          role="treeitem"
          data-value={value}
          data-item-type={itemType}
          aria-level={level}
          aria-expanded={itemType === "branch" ? open : undefined}
          aria-selected={root.selectionMode !== "none" ? selected : undefined}
          tabIndex={isActive ? 0 : -1}
          style={{ "--tree-level": level, ...style } as React.CSSProperties}
          className={cn(
            "flex flex-col outline-none focus-visible:outline-none",
            // Focus ring vẽ trên hàng layout, không bao cả subtree.
            "[&:focus-visible>[data-tree-layout]]:outline-2 [&:focus-visible>[data-tree-layout]]:-outline-offset-2 [&:focus-visible>[data-tree-layout]]:outline-stroke-focus",
            className,
          )}
          onFocus={(event) => {
            onFocus?.(event);
            if (event.target === event.currentTarget) root.active.set(value);
          }}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            // Chỉ xử lý click thuộc về chính item này, không phải item con trong subtree.
            if ((event.target as HTMLElement).closest(TREE_ITEM) !== event.currentTarget) return;
            if (itemType === "branch") root.toggleOpen(value);
            root.select(value);
          }}
          {...props}
        >
          {children}
        </div>
      </TreeItemContext.Provider>
    );
  },
);
TreeItem.displayName = "TreeItem";

/* ------------------------------------------------------------------ TreeItemLayout */
export interface TreeItemLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon trước nội dung (Folder, Document…). */
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  /** Nội dung phụ luôn hiện ở cuối hàng (badge, số đếm…). */
  aside?: React.ReactNode;
  /** Nút thao tác — chỉ hiện khi hover hoặc focus vào chúng. */
  actions?: React.ReactNode;
  /** Thay icon chevron mặc định của nhánh. */
  expandIcon?: React.ReactNode;
}

export const TreeItemLayout = React.forwardRef<HTMLDivElement, TreeItemLayoutProps>(
  ({ iconBefore, iconAfter, aside, actions, expandIcon, className, children, ...props }, ref) => {
    const root = React.useContext(TreeRootContext) ?? NOOP_ROOT;
    const item = React.useContext(TreeItemContext);
    const branch = item?.itemType === "branch";
    const small = root.size === "small";
    const iconClass = cn("flex shrink-0 items-center text-foreground-2", small ? "[&>svg]:size-4" : "[&>svg]:size-5");

    return (
      <div
        ref={ref}
        data-tree-layout=""
        className={cn(
          "group/tree-layout relative flex cursor-pointer items-center gap-1 rounded-medium pe-2 text-foreground-2",
          "transition-colors duration-faster ease-easy-ease",
          small ? "min-h-6 text-caption1" : "min-h-8 text-body1",
          branch
            ? "ps-[calc((var(--tree-level)-1)*var(--spacingXXL))]"
            : "ps-[calc(var(--tree-level)*var(--spacingXXL))]",
          item?.selected
            ? [
                "bg-brand-background-2 font-semibold text-foreground-1",
                root.appearance === "subtle" && "hover:bg-brand-background-2-hover",
                "before:absolute before:inset-s-0 before:top-1/2 before:h-4 before:w-0.75 before:-translate-y-1/2 before:rounded-circular before:bg-brand-stroke",
              ]
            : root.appearance === "subtle"
              ? "hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed"
              : "hover:text-foreground-1",
          className,
        )}
        {...props}
      >
        {branch && (
          <span aria-hidden className="flex size-6 shrink-0 items-center justify-center text-foreground-3">
            {expandIcon ?? (
              <ChevronRight12Regular
                className={cn(
                  "transition-transform duration-normal ease-easy-ease rtl:-scale-x-100",
                  // scale áp trước rotate: chevron đã lật trong RTL phải xoay ngược chiều để chỉ xuống.
                  item?.open && "rotate-90 rtl:-rotate-90",
                )}
              />
            )}
          </span>
        )}
        {iconBefore && <span className={iconClass}>{iconBefore}</span>}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {iconAfter && <span className={iconClass}>{iconAfter}</span>}
        {aside && <span className="flex shrink-0 items-center gap-1">{aside}</span>}
        {actions && (
          <span
            className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-faster group-hover/tree-layout:opacity-100 focus-within:opacity-100"
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
          </span>
        )}
      </div>
    );
  },
);
TreeItemLayout.displayName = "TreeItemLayout";
