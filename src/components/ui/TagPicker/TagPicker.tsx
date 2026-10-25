/** Fluent 2 TagPicker — https://fluent2.microsoft.design/components/web/react/core/tagpicker/usage */
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useDirection } from "@radix-ui/react-direction";
import { Command as CommandPrimitive } from "cmdk";
import { ChevronDown20Regular, ChevronDown24Regular } from "@fluentui/react-icons";
import { usePortalThemeProps, useYugenMessages } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { popoverSurfaceClass } from "@/components/ui/Popover/Popover";
import { fieldAppearanceClass, type FieldAppearance } from "@/components/ui/Select/Select";
import { cmdkGroupClass, cmdkOptionClass, normalizeSearchText } from "@/components/ui/Combobox/Combobox";
import { Tag, TagGroup, type TagAppearance, type TagShape, type TagSize } from "@/components/ui/Tag/Tag";
import { tagPickerMessages } from "./messages";

export { tagPickerMessages, type TagPickerMessages } from "./messages";
export { tagPickerMessagesEn } from "./messages.en";

export interface TagPickerOption {
  value: string;
  /** Nhãn hiển thị; mặc định = value. */
  label?: string;
  /** Avatar / icon hiển thị ở option và tag. */
  media?: React.ReactNode;
  /** Dòng phụ trong option (vd: email, chức danh). */
  secondaryText?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

type PickerSize = "medium" | "large" | "extra-large";

const SIZE: Record<PickerSize, { root: string; input: string; tag: TagSize; Icon: typeof ChevronDown20Regular; icon: string }> = {
  medium: { root: "min-h-8 ps-1 gap-1", input: "h-6 text-body1", tag: "extra-small", Icon: ChevronDown20Regular, icon: "size-5" },
  large: { root: "min-h-10 ps-1 gap-1", input: "h-7 text-body1", tag: "small", Icon: ChevronDown20Regular, icon: "size-5" },
  "extra-large": { root: "min-h-12 ps-1.5 gap-2", input: "h-8 text-body2", tag: "medium", Icon: ChevronDown24Regular, icon: "size-6" },
};

export interface TagPickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange" | "type" | "children"> {
  options: (string | TagPickerOption)[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  appearance?: FieldAppearance;
  /** medium (32px, tag extra-small), large (40px, tag small), extra-large (48px, tag medium). */
  size?: PickerSize;
  tagAppearance?: TagAppearance;
  tagShape?: TagShape;
  /** Cho phép tạo tag từ văn bản tự gõ (Enter). */
  freeform?: boolean;
  /** Nội dung khi không có kết quả lọc. Mặc định lấy từ `messages.tagPicker.noResults`. */
  noResultsText?: React.ReactNode;
  /** Class cho bề mặt listbox. */
  listboxClassName?: string;
}

interface NormalizedOption extends TagPickerOption {
  label: string;
}

/** TagPicker: chọn nhiều mục, mỗi mục là một Tag trong ô nhập; gõ để lọc danh sách gợi ý. */
export const TagPicker = React.forwardRef<HTMLInputElement, TagPickerProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      appearance = "outline",
      size = "medium",
      tagAppearance,
      tagShape,
      freeform = false,
      noResultsText,
      listboxClassName,
      className,
      disabled,
      placeholder,
      onKeyDown,
      ...inputProps
    },
    ref,
  ) => {
    const msg = useYugenMessages("tagPicker", tagPickerMessages);
    const items = React.useMemo<NormalizedOption[]>(
      () => options.map((o) => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value })),
      [options],
    );
    // Chuẩn hoá nhãn một lần cho mỗi bộ option (không phải mỗi phím gõ × mỗi option).
    const searchText = React.useMemo(() => items.map((i) => normalizeSearchText(i.label)), [items]);
    const itemByValue = React.useMemo(() => new Map(items.map((i) => [i.value, i])), [items]);
    const [innerSelected, setInnerSelected] = React.useState<string[]>(defaultValue ?? []);
    const selected = value ?? innerSelected;

    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [active, setActive] = React.useState("");
    const [activeId, setActiveId] = React.useState<string>();
    const [listEl, setListEl] = React.useState<HTMLDivElement | null>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const tagsRef = React.useRef<HTMLDivElement>(null);
    // Tag nằm ở phía đầu dòng của ô nhập: LTR là bên trái, RTL là bên phải.
    // Listbox portal vào <body> cũng nhận `dir` để align="start" theo hướng chữ.
    const dir = useDirection();
    const portalTheme = usePortalThemeProps();
    const towardTagsKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const towardInputKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const s = SIZE[size];
    const invalid = inputProps["aria-invalid"] === true || inputProps["aria-invalid"] === "true";
    const selectedSet = new Set(selected);
    const filterList = (text: string) => {
      const q = normalizeSearchText(text);
      return items.filter((i, k) => !selectedSet.has(i.value) && (!q || searchText[k].includes(q)));
    };
    const available = filterList(query);
    const firstEnabled = (list: NormalizedOption[]) => list.find((i) => !i.disabled)?.value ?? "";
    const optionOf = (v: string) => itemByValue.get(v);

    useIsomorphicLayoutEffect(() => {
      if (!open || !listEl || !active) {
        setActiveId(undefined);
        return;
      }
      const el = listEl.querySelector<HTMLElement>(`[cmdk-item][data-value="${CSS.escape(active)}"]`);
      setActiveId(el?.id);
      el?.scrollIntoView({ block: "nearest" });
    }, [open, listEl, active, query, selected.length]);

    const commit = (next: string[]) => {
      if (value === undefined) setInnerSelected(next);
      onValueChange?.(next);
    };

    const openList = () => {
      if (disabled || open) return;
      setActive(firstEnabled(available));
      setOpen(true);
    };

    const add = (val: string) => {
      if (selected.includes(val)) return;
      const next = [...selected, val];
      commit(next);
      setQuery("");
      setActive(firstEnabled(items.filter((i) => !next.includes(i.value))));
    };

    const remove = (val: string) => {
      commit(selected.filter((v) => v !== val));
      requestAnimationFrame(() => {
        if (!anchorRef.current?.contains(document.activeElement)) inputRef.current?.focus();
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      const input = e.currentTarget;
      const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
      if (e.key === "Home" || e.key === "End") {
        e.stopPropagation();
        return;
      }
      if (e.key === "Backspace" && query === "" && selected.length > 0) {
        e.preventDefault();
        remove(selected[selected.length - 1]);
        return;
      }
      if (e.key === towardTagsKey && atStart && selected.length > 0) {
        e.preventDefault();
        const tags = tagsRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)");
        tags?.[tags.length - 1]?.focus();
        return;
      }
      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        openList();
        return;
      }
      if (e.key === "Enter" && freeform && query.trim() && available.length === 0) {
        e.preventDefault();
        add(query.trim());
      }
    };

    return (
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(o) => {
          if (o) openList();
          else {
            setOpen(false);
            setQuery("");
          }
        }}
      >
        <CommandPrimitive shouldFilter={false} value={active} onValueChange={setActive} loop vimBindings={false} className="contents">
          <PopoverPrimitive.Anchor asChild>
            <div
              ref={anchorRef}
              data-disabled={disabled || undefined}
              data-invalid={invalid || undefined}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("[data-tag]")) return;
                inputRef.current?.focus();
                openList();
              }}
              className={cn(
                fieldAppearanceClass[appearance],
                "flex w-full min-w-62.5 cursor-text items-center",
                open && "after:scale-x-100",
                disabled && "cursor-not-allowed",
                s.root,
                className,
              )}
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-0.5">
                {selected.length > 0 && (
                  <TagGroup
                    ref={tagsRef}
                    aria-label={msg.selectedItems}
                    size={s.tag}
                    appearance={tagAppearance}
                    disabled={disabled}
                    onDismiss={remove}
                    onKeyDown={(e) => {
                      // Không để cmdk (Enter/Home/End) bắt phím khi đang ở trên tag.
                      e.stopPropagation();
                      const buttons = tagsRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)");
                      const isLast = buttons && document.activeElement === buttons[buttons.length - 1];
                      if ((e.key === towardInputKey && isLast) || e.key === "End") {
                        e.preventDefault();
                        inputRef.current?.focus();
                      }
                      if (e.key === "Escape") inputRef.current?.focus();
                    }}
                    className="contents"
                  >
                    {selected.map((v) => {
                      const opt = optionOf(v);
                      return (
                        <Tag
                          key={v}
                          value={v}
                          dismissible
                          tabIndex={-1}
                          shape={tagShape}
                          media={opt?.media}
                        >
                          {opt?.label ?? v}
                        </Tag>
                      );
                    })}
                  </TagGroup>
                )}
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
                  placeholder={selected.length === 0 ? placeholder : undefined}
                  value={query}
                  onChange={(e) => {
                    const text = e.target.value;
                    setQuery(text);
                    setActive(firstEnabled(filterList(text)));
                    if (!open) setOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "min-w-16 flex-1 bg-transparent px-1 text-foreground-1 outline-none placeholder:text-foreground-4",
                    "disabled:cursor-not-allowed disabled:text-foreground-disabled",
                    s.input,
                  )}
                  {...inputProps}
                />
              </div>
              <button
                type="button"
                tabIndex={-1}
                aria-label={open ? msg.closeList : msg.openList}
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (open) {
                    setOpen(false);
                    setQuery("");
                  } else {
                    inputRef.current?.focus();
                    openList();
                  }
                }}
                className="flex w-8 shrink-0 cursor-pointer items-center justify-center self-stretch text-foreground-3 outline-none disabled:cursor-not-allowed disabled:text-foreground-disabled"
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
                "max-h-[min(var(--radix-popover-content-available-height),--spacing(80))] w-(--radix-popover-trigger-width) overflow-y-auto p-1",
                listboxClassName,
              )}
            >
              <CommandPrimitive.List ref={setListEl} aria-multiselectable>
                <CommandPrimitive.Empty className="px-2 py-1.5 text-body1 text-foreground-3">
                  {freeform && query.trim() ? msg.addFreeform(query.trim()) : noResultsText === undefined ? msg.noResults : noResultsText}
                </CommandPrimitive.Empty>
                {groupOptions(available).map((group) => {
                  const rendered = group.items.map((item) => (
                    <CommandPrimitive.Item
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      onSelect={() => add(item.value)}
                      className={cn(cmdkOptionClass, "gap-2")}
                    >
                      {item.media && <span className="flex shrink-0 items-center text-foreground-2 [&_svg]:size-5">{item.media}</span>}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{item.label}</span>
                        {item.secondaryText && (
                          <span className="truncate text-caption1 text-foreground-3">{item.secondaryText}</span>
                        )}
                      </span>
                    </CommandPrimitive.Item>
                  ));
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
  },
);
TagPicker.displayName = "TagPicker";

function groupOptions(items: NormalizedOption[]) {
  const groups: { name?: string; items: NormalizedOption[] }[] = [];
  for (const item of items) {
    const g = groups.find((x) => x.name === item.group);
    if (g) g.items.push(item);
    else groups.push({ name: item.group, items: [item] });
  }
  return groups;
}
