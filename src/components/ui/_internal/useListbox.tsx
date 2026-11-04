import * as React from "react";
import { listboxGroupLabelClass } from "../Dropdown/Dropdown";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Listbox của ô combobox (Combobox, TagPicker): focus ở ô nhập, option highlight qua `aria-activedescendant`.
 * Component tự lọc; hook lo id, option đang highlight, bàn phím và cuộn. Highlight tính ngay trong render (không có
 * lượt commit thứ hai) nên mỗi phím mũi tên chỉ vẽ lại hai option đã memo.
 * Chỉ dùng nội bộ — không export qua barrel.
 */
export interface ListboxItem {
  value: string;
  disabled?: boolean;
  group?: string;
}

export interface ListboxGroup<T extends ListboxItem> {
  name?: string;
  items: T[];
}

/** Gom option theo `group`, giữ thứ tự xuất hiện đầu tiên của mỗi nhóm (option không nhóm là một nhóm không tên). */
export function groupListboxItems<T extends ListboxItem>(items: readonly T[]): ListboxGroup<T>[] {
  const groups = new Map<string | undefined, ListboxGroup<T>>();
  for (const item of items) {
    const group = groups.get(item.group);
    if (group) group.items.push(item);
    else groups.set(item.group, { name: item.group, items: [item] });
  }
  return [...groups.values()];
}

const optionId = (listId: string, value: string) => `${listId}-${encodeURIComponent(value)}`;

/** Cuộn option vào tầm nhìn; option đầu nhóm kéo theo tiêu đề nhóm. */
function reveal(list: HTMLElement | null, value: string) {
  const el = list && value ? list.ownerDocument.getElementById(optionId(list.id, value)) : null;
  if (!el) return;
  const heading = el.previousElementSibling;
  if (heading && heading.getAttribute("role") !== "option") heading.scrollIntoView({ block: "nearest" });
  el.scrollIntoView({ block: "nearest" });
}

interface UseListboxOptions<T extends ListboxItem> {
  open: boolean;
  /** Option đang hiện (đã lọc), theo thứ tự vẽ. */
  groups: readonly ListboxGroup<T>[];
  /** Giá trị đang highlight. Không còn trong danh sách (hoặc rỗng) → option bật đầu tiên. */
  active: string;
  onActiveChange: (value: string) => void;
  onSelect: (value: string) => void;
}

export function useListbox<T extends ListboxItem>({ open, groups, active, onActiveChange, onSelect }: UseListboxOptions<T>) {
  const listId = `${React.useId()}-listbox`;
  const enabled = React.useMemo(() => groups.flatMap((g) => g.items.filter((i) => !i.disabled).map((i) => i.value)), [groups]);
  const current = enabled.includes(active) ? active : (enabled[0] ?? "");

  // Handler ổn định cho option đã memo, luôn gọi callback mới nhất.
  const latest = React.useRef({ onActiveChange, onSelect, current });
  useIsomorphicLayoutEffect(() => {
    latest.current = { onActiveChange, onSelect, current };
  });
  const hover = React.useCallback((value: string) => {
    if (value !== latest.current.current) latest.current.onActiveChange(value);
  }, []);
  const select = React.useCallback((value: string) => latest.current.onSelect(value), []);

  // Popover portal gắn danh sách sau một lượt commit: cuộn ngay khi danh sách vào DOM, sau đó theo mỗi lần đổi.
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const setList = React.useCallback((el: HTMLDivElement | null) => {
    listRef.current = el;
    reveal(el, latest.current.current);
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (open) reveal(listRef.current, current);
  }, [open, current, groups]);

  const move = (step: 1 | -1, e: React.KeyboardEvent) => {
    const last = enabled.length - 1;
    if (e.metaKey) return step > 0 ? enabled[last] : enabled[0];
    if (e.altKey) {
      // Alt + mũi tên: option bật đầu tiên của nhóm có tên kế tiếp / trước đó (option không nhóm: như mũi tên thường).
      const at = groups.findIndex((g) => g.items.some((i) => i.value === current));
      for (let k = at + step; groups[at]?.name && k >= 0 && k < groups.length; k += step) {
        const first = groups[k].name ? groups[k].items.find((i) => !i.disabled) : undefined;
        if (first) return first.value;
      }
    }
    const index = enabled.indexOf(current) + step;
    return enabled[index > last ? 0 : index < 0 ? last : index];
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.defaultPrevented || e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && current) select(current);
    } else if (open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      const next = move(e.key === "ArrowDown" ? 1 : -1, e);
      if (next !== undefined) onActiveChange(next);
    }
  };

  return {
    /** Giá trị đang highlight (đã rơi về option bật đầu tiên khi cần). */
    active: current,
    idOf: (value: string) => optionId(listId, value),
    hover,
    select,
    onKeyDown,
    /** Gắn lên ô nhập (role="combobox"). */
    inputProps: {
      "aria-controls": open ? listId : undefined,
      "aria-activedescendant": open && current ? optionId(listId, current) : undefined,
    },
    /** Gắn lên phần tử listbox. Nhãn giữ như cmdk trước đây. */
    listProps: { ref: setList, id: listId, role: "listbox", "aria-label": "Suggestions" },
  };
}

/** Props của một option: ARIA + `data-selected` / `data-disabled` ("true" | "false") cho `cmdkOptionClass`. */
export function listboxOptionProps(
  id: string,
  value: string,
  disabled: boolean | undefined,
  active: boolean,
  onHover: (value: string) => void,
  onSelect: (value: string) => void,
) {
  return {
    id,
    role: "option",
    "aria-selected": active,
    "aria-disabled": !!disabled,
    "data-selected": active,
    "data-disabled": !!disabled,
    "data-value": value,
    onPointerMove: disabled ? undefined : () => onHover(value),
    onClick: disabled ? undefined : () => onSelect(value),
  } as const;
}

/** Nhóm có tên: `role="group"` + tiêu đề, vạch chia giữa các nhóm; option không nhóm nằm thẳng trong listbox. */
export function ListboxGroups<T extends ListboxItem>({
  groups,
  listId,
  renderItem,
}: {
  groups: readonly ListboxGroup<T>[];
  listId: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  return groups.map((group, index) => {
    const items = group.items.map(renderItem);
    if (!group.name) return <React.Fragment key="__ungrouped">{items}</React.Fragment>;
    const headingId = `${listId}-group-${index}`;
    return (
      <div
        key={group.name}
        role="group"
        aria-labelledby={headingId}
        className="not-last:mb-1 not-last:border-b not-last:border-stroke-2 not-last:pb-1"
      >
        <div id={headingId} aria-hidden className={listboxGroupLabelClass}>
          {group.name}
        </div>
        {items}
      </div>
    );
  });
}
