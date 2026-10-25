import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";
import { normalizeSearchText } from "../Combobox/Combobox";
import { listboxGroupLabelClass, listboxOptionClass } from "../Dropdown/Dropdown";
import { useSpinDelay } from "../Loading/Loading";
import { popoverSurfaceClass } from "../Popover/Popover";
import { SearchBox, type SearchBoxProps } from "../SearchBox/SearchBox";
import { Spinner } from "../Spinner/Spinner";
import { usePortalThemeProps, useYugenMessages } from "../YugenProvider/context";
import { autocompleteMessages } from "./messages";

export { autocompleteMessages, type AutocompleteMessages } from "./messages";
export { autocompleteMessagesEn } from "./messages.en";

/* ================================================================ HighlightMatch */

/**
 * Vị trí [đầu, cuối) của mọi đoạn khớp `query` trong `text`, so khớp không dấu & không phân biệt hoa thường
 * ("xoai" khớp "Xoài"). Chỉ số trả về là chỉ số trong chuỗi gốc.
 */
export function highlightRanges(text: string, query: string): [number, number][] {
  const needle = normalizeSearchText(query.trim());
  if (!needle) return [];
  let haystack = "";
  const origin: number[] = [];
  // Vị trí (UTF-16) của từng ký tự trong `text`, cộng dồn thay vì nối lại phần đầu mỗi vòng (trước đây O(n²)).
  let at = 0;
  for (const char of text) {
    for (const c of normalizeSearchText(char)) {
      haystack += c;
      origin.push(at);
    }
    at += char.length;
  }
  const ranges: [number, number][] = [];
  for (let from = haystack.indexOf(needle); from !== -1; from = haystack.indexOf(needle, from + needle.length)) {
    const last = from + needle.length - 1;
    const end = origin[last] + (Array.from(text.slice(origin[last]))[0]?.length ?? 1);
    ranges.push([origin[from], end]);
  }
  return ranges;
}

export interface HighlightMatchProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  query: string;
}

/** Tô đậm phần khớp với từ khoá (không dấu). Dùng trong gợi ý tìm kiếm và danh sách đã lọc. */
export function HighlightMatch({ text, query, className, ...props }: HighlightMatchProps) {
  const ranges = highlightRanges(text, query);
  if (ranges.length === 0)
    return (
      <span className={className} {...props}>
        {text}
      </span>
    );
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={i} className="rounded-small bg-transparent font-semibold text-brand-foreground-1">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return (
    <span className={className} {...props}>
      {parts}
    </span>
  );
}

/* ================================================================ Autocomplete */

export interface AutocompleteSuggestion {
  /** Chuỗi điền vào ô khi chọn — cũng là khoá duy nhất. */
  value: string;
  /** Nhãn hiển thị (mặc định = value, có tô sáng phần khớp). */
  label?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Tên nhóm ("Tìm gần đây", "Sản phẩm"…) — giữ thứ tự xuất hiện. */
  group?: string;
  disabled?: boolean;
}

export interface AutocompleteProps extends Omit<SearchBoxProps, "onSelect" | "onSubmit"> {
  /** Danh sách gợi ý (chuỗi hoặc object). */
  suggestions: ReadonlyArray<string | AutocompleteSuggestion>;
  /**
   * true (mặc định): tự lọc theo từ khoá, không dấu. false: hiển thị nguyên danh sách (khi server đã lọc).
   * Hàm: bộ lọc tuỳ biến.
   */
  filter?: boolean | ((suggestion: AutocompleteSuggestion, query: string) => boolean);
  /** Chọn một gợi ý (chuột, Enter trên gợi ý đang chọn). */
  onSelect?: (suggestion: AutocompleteSuggestion) => void;
  /** Enter khi không có gợi ý nào đang được chọn — tìm với nguyên từ khoá. */
  onSubmit?: (query: string) => void;
  /** Đang tải gợi ý (server). Spinner chỉ hiện nếu chờ > 300ms (Wait UX). */
  loading?: boolean;
  /** Nội dung khi không có gợi ý nào khớp. null = đóng danh sách. Mặc định lấy từ `messages.autocomplete.empty`. */
  emptyMessage?: React.ReactNode;
  maxSuggestions?: number;
  /** Số ký tự tối thiểu trước khi mở gợi ý (0 = mở ngay khi focus, hợp với "Tìm gần đây"). */
  minChars?: number;
  /** Tô sáng phần khớp trong nhãn. */
  highlight?: boolean;
  /** aria-label của danh sách gợi ý. Mặc định lấy từ `messages.autocomplete.listLabel`. */
  listLabel?: string;
  listboxClassName?: string;
}

const toSuggestion = (s: string | AutocompleteSuggestion): AutocompleteSuggestion => (typeof s === "string" ? { value: s } : s);
const includesQuery = (s: AutocompleteSuggestion, query: string) =>
  normalizeSearchText(s.value).includes(normalizeSearchText(query.trim()));

/**
 * Autocomplete — ô tìm kiếm có gợi ý (mẫu ARIA combobox + listbox). Khác Combobox: giá trị là từ khoá tự do,
 * gợi ý chỉ giúp điền nhanh; Enter khi không chọn gợi ý → `onSubmit(query)`.
 * Bàn phím: ↓/↑ di chuyển gợi ý · Enter chọn / tìm · Esc đóng danh sách (lần nữa: xoá ô) · Tab rời ô.
 */
export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      suggestions,
      filter = true,
      onSelect,
      onSubmit,
      loading = false,
      emptyMessage,
      maxSuggestions = 8,
      minChars = 1,
      highlight = true,
      listLabel,
      listboxClassName,
      value,
      defaultValue,
      onValueChange,
      onKeyDown,
      onFocus,
      onBlur,
      dir,
      ...props
    },
    ref,
  ) => {
    const portalTheme = usePortalThemeProps();
    const msg = useYugenMessages("autocomplete", autocompleteMessages);
    const baseId = React.useId();
    const listId = `${baseId}-list`;
    const optionId = (i: number) => `${baseId}-opt-${i}`;
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const [inner, setInner] = React.useState(defaultValue === undefined ? "" : String(defaultValue));
    const query = value !== undefined ? String(value) : inner;
    const setQuery = (next: string) => {
      if (value === undefined) setInner(next);
      onValueChange?.(next);
    };

    const [focused, setFocused] = React.useState(false);
    const [dismissed, setDismissed] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    const showSpinner = useSpinDelay(loading);

    const items = React.useMemo(() => {
      const all = suggestions.map(toSuggestion);
      const q = query.trim();
      const kept =
        filter === false || !q ? all : all.filter((s) => (typeof filter === "function" ? filter(s, query) : includesQuery(s, query)));
      return kept.slice(0, maxSuggestions);
    }, [suggestions, query, filter, maxSuggestions]);

    const enough = query.trim().length >= minChars;
    const showEmpty = emptyMessage !== null && query.trim() !== "" && !loading && items.length === 0;
    const open = focused && !dismissed && enough && (items.length > 0 || showSpinner || showEmpty);

    // Gõ tiếp → mở lại danh sách, bỏ chọn gợi ý cũ.
    React.useEffect(() => {
      setActive(-1);
    }, [query, suggestions]);

    React.useEffect(() => {
      if (active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
      // optionId chỉ phụ thuộc baseId (ổn định).
    }, [active]);

    const move = (delta: 1 | -1) => {
      if (items.length === 0) return;
      let next = active;
      for (let step = 0; step < items.length; step++) {
        next = (next + delta + items.length) % items.length;
        if (next === -1) next = delta === 1 ? 0 : items.length - 1;
        if (!items[next].disabled) break;
      }
      setActive(next);
    };

    const choose = (s: AutocompleteSuggestion) => {
      if (s.disabled) return;
      setQuery(s.value);
      onSelect?.(s);
      setDismissed(true);
    };

    const groups = React.useMemo(() => {
      const map = new Map<string, { s: AutocompleteSuggestion; i: number }[]>();
      items.forEach((s, i) => {
        const key = s.group ?? "";
        map.set(key, [...(map.get(key) ?? []), { s, i }]);
      });
      return [...map.entries()];
    }, [items]);

    const renderOption = ({ s, i }: { s: AutocompleteSuggestion; i: number }) => (
      <div
        key={s.value}
        id={optionId(i)}
        role="option"
        aria-selected={active === i}
        aria-disabled={s.disabled || undefined}
        data-active={active === i ? "" : undefined}
        onMouseMove={() => !s.disabled && active !== i && setActive(i)}
        onClick={() => choose(s)}
        className={cn(
          listboxOptionClass,
          "data-active:bg-background-1-hover aria-disabled:cursor-not-allowed aria-disabled:text-foreground-disabled",
        )}
      >
        {s.icon && <span className="flex shrink-0 text-foreground-2 [&_svg]:size-5">{s.icon}</span>}
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{s.label ?? (highlight ? <HighlightMatch text={s.value} query={query} /> : s.value)}</span>
          {s.description && <span className="truncate text-caption1 text-foreground-3">{s.description}</span>}
        </span>
      </div>
    );

    return (
      // Radix bắt Esc / bấm ra ngoài ở cấp document (trước ô nhập) → đóng qua onOpenChange.
      <PopoverPrimitive.Root open={open} onOpenChange={(next) => !next && setDismissed(true)}>
        <PopoverPrimitive.Anchor asChild>
          <div ref={anchorRef}>
            <SearchBox
              ref={ref}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
              autoComplete="off"
              value={query}
              onValueChange={(next) => {
                setQuery(next);
                setFocused(true); // đang gõ ⇒ đang focus (kể cả khi sự kiện focus không phát, vd. cửa sổ nền)
                setDismissed(false);
              }}
              onFocus={(e) => {
                setFocused(true);
                setDismissed(false);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              onKeyDown={(e) => {
                onKeyDown?.(e);
                if (e.defaultPrevented || e.nativeEvent.isComposing) return;
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  if (!open) setDismissed(false);
                  else move(e.key === "ArrowDown" ? 1 : -1);
                } else if (e.key === "Enter") {
                  if (open && active >= 0) {
                    e.preventDefault();
                    choose(items[active]);
                  } else if (onSubmit) {
                    e.preventDefault();
                    onSubmit(query);
                    setDismissed(true);
                  }
                } else if (e.key === "Escape" && open) {
                  e.preventDefault(); // SearchBox chỉ xoá ô khi danh sách đã đóng
                  setDismissed(true);
                } else if (e.key === "Tab") {
                  setDismissed(true);
                }
              }}
              {...props}
            />
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            {...portalTheme}
            dir={dir}
            align="start"
            sideOffset={2}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
              else setDismissed(true);
            }}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              popoverSurfaceClass,
              "max-h-[min(var(--radix-popover-content-available-height),--spacing(80))] w-(--radix-popover-trigger-width) overflow-y-auto p-1",
              listboxClassName,
            )}
          >
            <div id={listId} role="listbox" aria-label={listLabel ?? msg.listLabel} aria-busy={loading || undefined}>
              {groups.map(([group, entries]) =>
                group ? (
                  <div key={group} role="group" aria-labelledby={`${listId}-${group}`}>
                    <div id={`${listId}-${group}`} role="presentation" className={listboxGroupLabelClass}>
                      {group}
                    </div>
                    {entries.map(renderOption)}
                  </div>
                ) : (
                  entries.map(renderOption)
                ),
              )}
            </div>
            {showSpinner && (
              <div className="flex items-center gap-2 px-2 py-1.5 text-body1 text-foreground-3">
                <Spinner size="extra-tiny" />
                {msg.searching}
              </div>
            )}
            {showEmpty && <div className="px-2 py-1.5 text-body1 text-foreground-3">{emptyMessage === undefined ? msg.empty : emptyMessage}</div>}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
        <span aria-live="polite" className="sr-only">
          {open && !loading ? (items.length ? msg.count(items.length) : "") : ""}
        </span>
      </PopoverPrimitive.Root>
    );
  },
);
Autocomplete.displayName = "Autocomplete";
