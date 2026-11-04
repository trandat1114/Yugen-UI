/** Fluent 2 TagPicker — https://fluent2.microsoft.design/components/web/react/core/tagpicker/usage */
import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useDirection } from "@radix-ui/react-direction";
import { ChevronDown20Regular, ChevronDown24Regular } from "../_internal/icons";
import { usePortalThemeProps, useYugenMessages, useComponentDefaults } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { groupListboxItems, ListboxGroups, listboxOptionProps, useListbox } from "../_internal/useListbox";
import { popoverSurfaceClass } from "@/components/ui/Popover/Popover";
import { fieldAppearanceClass, type FieldAppearance } from "@/components/ui/Select/Select";
import { cmdkOptionClass, normalizeSearchText } from "@/components/ui/Combobox/Combobox";
import { Tag, TagGroup, type TagAppearance, type TagShape, type TagSize } from "@/components/ui/Tag/Tag";
import { tagPickerMessagesEn } from "./messages";

export { tagPickerMessages, tagPickerMessagesVi, tagPickerMessagesEn, type TagPickerMessages } from "./messages";

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
  /** Kéo tag (hoặc Alt + phím mũi tên khi focus ở tag) để đổi thứ tự; `onValueChange` nhận thứ tự mới. */
  reorderable?: boolean;
  /** Nội dung khi không có kết quả lọc. Mặc định lấy từ `messages.tagPicker.noResults`. */
  noResultsText?: React.ReactNode;
  /** Class cho bề mặt listbox. */
  listboxClassName?: string;
}

interface NormalizedOption extends TagPickerOption {
  label: string;
}

/** Option đã memo: mũi tên chỉ vẽ lại option vừa mất và vừa nhận highlight. */
const OptionRow = /* @__PURE__ */ React.memo(function OptionRow({
  item,
  id,
  active,
  onHover,
  onSelect,
}: {
  item: NormalizedOption;
  id: string;
  active: boolean;
  onHover: (value: string) => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div {...listboxOptionProps(id, item.value, item.disabled, active, onHover, onSelect)} className={cn(cmdkOptionClass, "gap-2")}>
      {item.media && <span className="flex shrink-0 items-center text-foreground-2 [&_svg]:size-5">{item.media}</span>}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{item.label}</span>
        {item.secondaryText && <span className="truncate text-caption1 text-foreground-3">{item.secondaryText}</span>}
      </span>
    </div>
  );
});

type SortableModule = typeof import("@/components/ui/Sortable/Sortable");
let sortableModule: SortableModule | undefined;
let sortableLoading: Promise<void> | undefined;
const sortableListeners = new Set<() => void>();
const subscribeSortable = (listener: () => void) => {
  sortableListeners.add(listener);
  return () => void sortableListeners.delete(listener);
};

/**
 * Sortable chỉ cần khi `reorderable`: nạp lúc cần. Server và lượt hydrate vẽ tag thường (cùng kích thước, không lệch
 * hydration); kéo / Alt + mũi tên có ngay khi module về. Nạp lỗi thì tag vẫn dùng được, lần mount sau thử lại.
 */
function useSortableModule(enabled: boolean) {
  const loaded = React.useSyncExternalStore(subscribeSortable, () => (enabled ? sortableModule : undefined), () => undefined);
  React.useEffect(() => {
    if (!enabled || sortableModule) return;
    sortableLoading ??= import("@/components/ui/Sortable/Sortable").then(
      (mod) => {
        sortableModule = mod;
        sortableListeners.forEach((listener) => listener());
      },
      () => {
        sortableLoading = undefined;
      },
    );
  }, [enabled]);
  return loaded;
}

/** TagPicker: chọn nhiều mục, mỗi mục là một Tag trong ô nhập; gõ để lọc danh sách gợi ý. */
export function TagPicker(inProps: TagPickerProps & { ref?: React.Ref<HTMLInputElement> }) {
  const {
    options,
    value,
    defaultValue,
    onValueChange,
    appearance = "outline",
    size = "medium",
    tagAppearance,
    tagShape,
    freeform = false,
    reorderable = false,
    noResultsText,
    listboxClassName,
    className,
    disabled,
    placeholder,
    onKeyDown,
    ref,
    ...inputProps
  } = useComponentDefaults("TagPicker", inProps);
  const msg = useYugenMessages("tagPicker", tagPickerMessagesEn);
  const items = React.useMemo<NormalizedOption[]>(
    () => options.map((o) => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value })),
    [options],
  );
  // Chuẩn hoá nhãn một lần cho mỗi bộ option (không phải mỗi phím gõ × mỗi option).
  const searchText = React.useMemo(() => items.map((i) => normalizeSearchText(i.label)), [items]);
  const itemByValue = React.useMemo(() => new Map(items.map((i) => [i.value, i])), [items]);
  const [selected, commit] = useControllableState({ value, defaultValue: defaultValue ?? [], onChange: onValueChange });

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState("");
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
  const filterList = React.useCallback(
    (text: string) => {
      const q = normalizeSearchText(text);
      const taken = new Set(selected);
      return items.filter((i, k) => !taken.has(i.value) && (!q || searchText[k].includes(q)));
    },
    [items, searchText, selected],
  );
  const available = React.useMemo(() => filterList(query), [filterList, query]);
  const groups = React.useMemo(() => groupListboxItems(available), [available]);
  const sortable = useSortableModule(reorderable);
  const firstEnabled = (list: NormalizedOption[]) => list.find((i) => !i.disabled)?.value ?? "";
  const optionOf = (v: string) => itemByValue.get(v);

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

  const listbox = useListbox({ open, groups, active, onActiveChange: setActive, onSelect: add });

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
      return;
    }
    listbox.onKeyDown(e);
  };

  const tagGroup = selected.length > 0 && (
    <TagGroup
      ref={tagsRef}
      aria-label={msg.selectedItems}
      size={s.tag}
      appearance={tagAppearance}
      disabled={disabled}
      onDismiss={remove}
      onKeyDown={(e) => {
        // Phím trên tag (Enter / Home / End…) thuộc về tag, không đi lên các phần tử cha.
        e.stopPropagation();
        if (e.defaultPrevented) return;
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
        const tag = (
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
        // Tag là nút gỡ: cả tag là tay nắm (kéo thì không gỡ), bàn phím dùng Alt + mũi tên.
        return sortable ? (
          <sortable.SortableItem key={v} value={v} label={opt?.label ?? v} disabled={disabled} asChild handle shortcuts>
            {tag}
          </sortable.SortableItem>
        ) : (
          tag
        );
      })}
    </TagGroup>
  );

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
            {sortable && tagGroup ? (
              <sortable.Sortable asChild orientation="grid" value={selected} onValueChange={commit} disabled={disabled}>
                {tagGroup}
              </sortable.Sortable>
            ) : (
              tagGroup
            )}
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              {...listbox.inputProps}
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
          <div {...listbox.listProps} aria-multiselectable>
            {available.length === 0 && (
              <div role="presentation" className="px-2 py-1.5 text-body1 text-foreground-3">
                {freeform && query.trim() ? msg.addFreeform(query.trim()) : noResultsText === undefined ? msg.noResults : noResultsText}
              </div>
            )}
            <ListboxGroups
              groups={groups}
              listId={listbox.listProps.id}
              renderItem={(item) => (
                <OptionRow
                  key={item.value}
                  item={item}
                  id={listbox.idOf(item.value)}
                  active={item.value === listbox.active}
                  onHover={listbox.hover}
                  onSelect={listbox.select}
                />
              )}
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    TagPicker: TagPickerProps;
  }
}
