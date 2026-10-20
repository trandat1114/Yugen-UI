/** Fluent 2 Combobox — https://fluent2.microsoft.design/components/web/react/core/combobox/usage */
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useDirection } from "@radix-ui/react-direction";
import { Command as CommandPrimitive } from "cmdk";
import {
  Checkmark12Filled,
  Checkmark16Filled,
  ChevronDown16Regular,
  ChevronDown20Regular,
  ChevronDown24Regular,
} from "@fluentui/react-icons";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { popoverSurfaceClass } from "@/components/ui/Popover/Popover";
import { fieldAppearanceClass, type FieldAppearance } from "@/components/ui/Select/Select";
import { listboxOptionClass } from "@/components/ui/Dropdown/Dropdown";

export interface ComboboxOption {
  value: string;
  /** Nhãn hiển thị; mặc định = value. */
  label?: string;
  disabled?: boolean;
  /** Tên nhóm — option cùng group được gom dưới một tiêu đề. */
  group?: string;
}

/** Bỏ dấu tiếng Việt + về chữ thường để lọc ("viet" khớp "Việt"). */
export function normalizeSearchText(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/** Class cho option cmdk (highlight = data-selected, disabled = data-disabled=true). */
export const cmdkOptionClass = cn(
  listboxOptionClass,
  "data-[selected=true]:bg-background-1-hover data-[disabled=true]:pointer-events-none data-[disabled=true]:text-foreground-disabled",
);

/** Class cho cmdk Group: tiêu đề + vạch chia giữa các nhóm. */
export const cmdkGroupClass = cn(
  "not-last:mb-XS not-last:border-b not-last:border-stroke-2 not-last:pb-XS",
  "**:[[cmdk-group-heading]]:flex **:[[cmdk-group-heading]]:h-8 **:[[cmdk-group-heading]]:items-center **:[[cmdk-group-heading]]:px-S",
  "**:[[cmdk-group-heading]]:text-caption1 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-foreground-3",
);

const SIZE = {
  small: { root: "h-6 ps-S pe-XXS text-caption1", Icon: ChevronDown16Regular, icon: "size-4", button: "w-6" },
  medium: { root: "h-8 ps-M pe-XXS text-body1", Icon: ChevronDown20Regular, icon: "size-5", button: "w-8" },
  large: { root: "h-10 ps-M pe-XS text-body2", Icon: ChevronDown24Regular, icon: "size-6", button: "w-9" },
} as const;

type InputAttrs = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "defaultValue" | "onChange" | "type" | "children" | "multiple"
>;

interface ComboboxBaseProps extends InputAttrs {
  options: (string | ComboboxOption)[];
  appearance?: FieldAppearance;
  size?: "small" | "medium" | "large";
  /** Cho phép giữ văn bản tự gõ không khớp option nào (Enter hoặc rời ô để xác nhận). */
  freeform?: boolean;
  /** Nội dung khi không có kết quả lọc. */
  noResultsText?: React.ReactNode;
  /** Class cho bề mặt listbox. */
  listboxClassName?: string;
}

interface ComboboxSingleProps {
  multiselect?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface ComboboxMultiProps {
  multiselect: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxBaseProps & (ComboboxSingleProps | ComboboxMultiProps);

interface NormalizedOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

function toArray(v: string | string[] | undefined): string[] | undefined {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v;
  return v === "" ? [] : [v];
}

function groupOptions(items: NormalizedOption[]) {
  const groups: { name?: string; items: NormalizedOption[] }[] = [];
  for (const item of items) {
    const g = groups.find((x) => x.name === item.group);
    if (g) g.items.push(item);
    else groups.push({ name: item.group, items: [item] });
  }
  return groups;
}

/** Combobox: ô nhập có thể gõ để lọc listbox; hỗ trợ chọn một / nhiều và freeform. */
export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => {
  const {
    options,
    appearance = "outline",
    size = "medium",
    freeform = false,
    noResultsText = "Không tìm thấy kết quả",
    listboxClassName,
    className,
    disabled,
    placeholder,
    multiselect,
    value,
    defaultValue,
    onValueChange,
    onKeyDown,
    onClick,
    ...inputProps
  } = props;

  const items = React.useMemo<NormalizedOption[]>(
    () => options.map((o) => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value })),
    [options],
  );
  const [innerSelected, setInnerSelected] = React.useState<string[]>(() => toArray(defaultValue) ?? []);
  const selected = toArray(value) ?? innerSelected;
  const labelOf = (v: string) => items.find((i) => i.value === v)?.label ?? v;
  const displayText = selected.map(labelOf).join(", ");

  const [open, setOpen] = React.useState(false);
  /** null = chưa gõ gì kể từ lúc mở → hiện toàn bộ option. */
  const [query, setQuery] = React.useState<string | null>(null);
  const [active, setActive] = React.useState("");
  const [activeId, setActiveId] = React.useState<string>();
  const [listEl, setListEl] = React.useState<HTMLDivElement | null>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Listbox portal vào <body>: gắn `dir` để align="start" và nội dung theo hướng chữ của provider.
  const dir = useDirection();
  const portalTheme = usePortalThemeProps();
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const filtered = query ? items.filter((i) => normalizeSearchText(i.label).includes(normalizeSearchText(query))) : items;
  const firstEnabled = (list: NormalizedOption[]) => list.find((i) => !i.disabled)?.value ?? "";
  const s = SIZE[size];
  const invalid = inputProps["aria-invalid"] === true || inputProps["aria-invalid"] === "true";

  // aria-activedescendant + cuộn option đang highlight vào tầm nhìn.
  useIsomorphicLayoutEffect(() => {
    if (!open || !listEl || !active) {
      setActiveId(undefined);
      return;
    }
    const el = listEl.querySelector<HTMLElement>(`[cmdk-item][data-value="${CSS.escape(active)}"]`);
    setActiveId(el?.id);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, listEl, active, query]);

  const commit = (next: string[]) => {
    if (value === undefined) setInnerSelected(next);
    if (multiselect) (onValueChange as ((v: string[]) => void) | undefined)?.(next);
    else (onValueChange as ((v: string) => void) | undefined)?.(next[0] ?? "");
  };

  const openList = () => {
    if (disabled || open) return;
    setActive(selected.find((v) => items.some((i) => i.value === v && !i.disabled)) ?? firstEnabled(items));
    setOpen(true);
  };

  const closeList = () => {
    setOpen(false);
    if (query !== null && freeform && !multiselect) {
      const text = query.trim();
      const exact = items.find((i) => normalizeSearchText(i.label) === normalizeSearchText(text));
      commit(text ? [exact?.value ?? text] : []);
    }
    setQuery(null);
  };

  const selectOption = (val: string) => {
    if (multiselect) {
      commit(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
      setActive(val);
    } else {
      commit([val]);
      setQuery(null);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    // Home/End giữ hành vi di chuyển con trỏ trong ô nhập (không để cmdk bắt).
    if (e.key === "Home" || e.key === "End") {
      e.stopPropagation();
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      openList();
      return;
    }
    if (e.key === "Enter" && freeform && query?.trim() && filtered.length === 0) {
      e.preventDefault();
      const text = query.trim();
      if (multiselect) {
        if (!selected.includes(text)) commit([...selected, text]);
        setQuery("");
      } else {
        commit([text]);
        setQuery(null);
        setOpen(false);
      }
    }
  };

  const multiPlaceholder = multiselect && open && displayText ? displayText : placeholder;
  const inputValue = multiselect ? (open ? (query ?? "") : displayText) : (query ?? displayText);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => (o ? openList() : closeList())}>
      <CommandPrimitive shouldFilter={false} value={active} onValueChange={setActive} loop vimBindings={false} className="contents">
        <PopoverPrimitive.Anchor asChild>
          <div
            ref={anchorRef}
            data-disabled={disabled || undefined}
            data-invalid={invalid || undefined}
            onClick={() => inputRef.current?.focus()}
            className={cn(
              fieldAppearanceClass[appearance],
              "inline-flex min-w-62.5 cursor-text items-center gap-XXS",
              open && "after:scale-x-100",
              disabled && "cursor-not-allowed",
              s.root,
              className,
            )}
          >
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={open && listEl ? listEl.id : undefined}
              aria-activedescendant={activeId}
              autoComplete="off"
              disabled={disabled}
              placeholder={multiPlaceholder}
              value={inputValue}
              onChange={(e) => {
                const text = e.target.value;
                const next = text ? items.filter((i) => normalizeSearchText(i.label).includes(normalizeSearchText(text))) : items;
                setQuery(text);
                setActive(firstEnabled(next));
                if (!open) setOpen(true);
              }}
              onClick={(e) => {
                onClick?.(e);
                openList();
              }}
              onKeyDown={handleKeyDown}
              className="h-full min-w-0 flex-1 bg-transparent text-foreground-1 outline-none placeholder:text-foreground-4 disabled:cursor-not-allowed disabled:text-foreground-disabled"
              {...inputProps}
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={open ? "Đóng danh sách" : "Mở danh sách"}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                if (open) closeList();
                else {
                  inputRef.current?.focus();
                  openList();
                }
              }}
              className={cn(
                "flex h-full shrink-0 cursor-pointer items-center justify-center text-foreground-3 outline-none",
                "disabled:cursor-not-allowed disabled:text-foreground-disabled",
                s.button,
              )}
            >
              <s.Icon className={s.icon} />
            </button>
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            {...portalTheme}
            dir={dir}
            role="presentation"
            align="start"
            sideOffset={2}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
            }}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              popoverSurfaceClass,
              "max-h-[min(var(--radix-popover-content-available-height),--spacing(80))] w-(--radix-popover-trigger-width) overflow-y-auto p-XS",
              listboxClassName,
            )}
          >
            <CommandPrimitive.List ref={setListEl} aria-multiselectable={multiselect || undefined}>
              <CommandPrimitive.Empty className="px-S py-SNudge text-body1 text-foreground-3">
                {freeform && query?.trim() ? `Nhấn Enter để dùng “${query.trim()}”` : noResultsText}
              </CommandPrimitive.Empty>
              {groupOptions(filtered).map((group) => {
                const rendered = group.items.map((item) => {
                  const checked = selected.includes(item.value);
                  return (
                    <CommandPrimitive.Item
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      onSelect={() => selectOption(item.value)}
                      aria-checked={multiselect ? checked : undefined}
                      className={cmdkOptionClass}
                    >
                      {multiselect ? (
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-small border",
                            item.disabled
                              ? "border-stroke-disabled text-foreground-disabled"
                              : checked
                                ? "border-brand-background bg-brand-background text-foreground-on-brand"
                                : "border-stroke-accessible",
                          )}
                        >
                          {checked && <Checkmark12Filled className="size-3" />}
                        </span>
                      ) : (
                        <span className="flex size-4 shrink-0 items-center justify-center">
                          {checked && <Checkmark16Filled className="size-4" />}
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </CommandPrimitive.Item>
                  );
                });
                return group.name ? (
                  <CommandPrimitive.Group key={group.name} heading={group.name} className={cmdkGroupClass}>
                    {rendered}
                  </CommandPrimitive.Group>
                ) : (
                  <React.Fragment key="__ungrouped">{rendered}</React.Fragment>
                );
              })}
            </CommandPrimitive.List>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </CommandPrimitive>
    </PopoverPrimitive.Root>
  );
});
Combobox.displayName = "Combobox";
