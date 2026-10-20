/** Fluent UI Focus management (Tabster: useArrowNavigationGroup, useFocusableGroup) — https://storybooks.fluentui.dev/react/?path=/docs/concepts-developer-focus-management--docs */
import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "iframe",
  "[contenteditable='true']",
  "[tabindex]:not([disabled])",
].join(",");

/** Đánh dấu một vùng quản lý focus. Phần tử nằm trong vùng con lồng bên trong không thuộc vùng cha. */
const SCOPE_ATTR = "data-focus-scope";
/** Lưu tabindex gốc khi useFocusableGroup tạm loại phần tử khỏi thứ tự Tab. */
const SAVED_TABINDEX_ATTR = "data-focus-saved-tabindex";
/** Phần tử được ưu tiên nhận Tab khi đi vào nhóm (mục đang chọn). */
const DEFAULT_ITEM_SELECTOR = "[aria-checked='true'],[aria-selected='true'],[data-default-focus]";

const TEXT_INPUT_TYPES = new Set([
  "text",
  "search",
  "email",
  "url",
  "tel",
  "password",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
]);

function isEditable(el: HTMLElement) {
  if (el.isContentEditable || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  return el instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(el.type);
}

/** Các phần tử focus được thuộc trực tiếp `container` (bỏ phần tử ẩn, aria-hidden, inert, hoặc thuộc vùng con). */
function getItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      el.getClientRects().length > 0 &&
      !el.closest("[aria-hidden='true'],[inert]") &&
      el.parentElement?.closest(`[${SCOPE_ATTR}]`) === container,
  );
}

function linearTarget(items: HTMLElement[], index: number, delta: 1 | -1, circular: boolean) {
  const next = index + delta;
  if (next >= 0 && next < items.length) return items[next];
  return circular ? items[(next + items.length) % items.length] : undefined;
}

/** Tìm phần tử ở hàng trên/dưới gần nhất theo vị trí thị giác (lưới). */
function verticalTarget(items: HTMLElement[], index: number, down: boolean, circular: boolean) {
  const rects = items.map((el, i) => ({ r: el.getBoundingClientRect(), i }));
  const current = rects[index].r;
  const centerX = current.left + current.width / 2;
  const centerY = current.top + current.height / 2;

  let candidates = rects.filter(({ r }) => (down ? r.top >= centerY : r.bottom <= centerY));
  if (candidates.length === 0) {
    if (!circular) return undefined;
    // Quay vòng: sang hàng đầu (đi xuống) hoặc hàng cuối (đi lên), trừ hàng hiện tại.
    candidates = rects.filter(({ r }) => Math.abs(r.top - current.top) >= current.height / 2);
    if (candidates.length === 0) return undefined;
  }

  const edge = down ? Math.min(...candidates.map(({ r }) => r.top)) : Math.max(...candidates.map(({ r }) => r.bottom));
  const row = candidates.filter(({ r }) => (down ? r.top - edge < r.height / 2 : edge - r.bottom < r.height / 2));
  const distance = (r: DOMRect) => Math.abs(r.left + r.width / 2 - centerX);
  const best = row.reduce((a, b) => (distance(b.r) < distance(a.r) ? b : a));
  return items[best.i];
}

/* ================================================================ useArrowNavigationGroup */

export type ArrowNavigationAxis = "horizontal" | "vertical" | "both" | "grid";

export interface UseArrowNavigationGroupOptions {
  /**
   * horizontal: ←/→ · vertical: ↑/↓ (mặc định) · both: cả bốn phím theo thứ tự DOM ·
   * grid: ←/→ theo thứ tự, ↑/↓ theo vị trí thị giác (hàng trên/dưới).
   */
  axis?: ArrowNavigationAxis;
  /** Đi tới cuối thì quay về đầu (và ngược lại). */
  circular?: boolean;
  /** Tab quay lại nhóm sẽ focus phần tử focus gần nhất (mặc định: mục đang chọn hoặc mục đầu). */
  memorizeCurrent?: boolean;
  /** true: mọi phần tử vẫn nằm trong thứ tự Tab (không dùng roving tabindex). */
  tabbable?: boolean;
  role?: React.AriaRole;
}

export interface ArrowNavigationGroupProps<T extends HTMLElement> {
  ref: React.RefCallback<T>;
  role?: React.AriaRole;
  onKeyDown: React.KeyboardEventHandler<T>;
  onFocus: React.FocusEventHandler<T>;
  onBlur: React.FocusEventHandler<T>;
  "data-focus-scope": "arrow";
}

/**
 * Điều hướng bằng phím mũi tên giữa các phần tử focus được bên trong (roving tabindex: Tab vào/ra nhóm chỉ một lần).
 * Trải toàn bộ kết quả lên phần tử chứa: `<div {...useArrowNavigationGroup({ axis: "horizontal" })}>`.
 * ←/→ tự đảo trong RTL (đọc hướng từ DirectionProvider / YugenProvider). Home/End tới đầu/cuối.
 */
export function useArrowNavigationGroup<T extends HTMLElement = HTMLElement>(
  options: UseArrowNavigationGroupOptions = {},
): ArrowNavigationGroupProps<T> {
  const { axis = "vertical", circular = false, memorizeCurrent = false, tabbable = false, role } = options;
  const dir = useDirection();
  const containerRef = React.useRef<T | null>(null);
  const activeRef = React.useRef<HTMLElement | null>(null);
  const observerRef = React.useRef<MutationObserver | null>(null);
  const latest = React.useRef({ tabbable, memorizeCurrent });
  latest.current = { tabbable, memorizeCurrent };

  /** Chỉ một phần tử có tabindex=0: đang focus › nhớ gần nhất › mục đang chọn › mục đầu. */
  const syncTabIndex = React.useCallback(() => {
    const container = containerRef.current;
    if (!container || latest.current.tabbable) return;
    const items = getItems(container);
    if (items.length === 0) return;
    const focused = items.find((el) => el === document.activeElement);
    const remembered = activeRef.current && items.includes(activeRef.current) ? activeRef.current : undefined;
    const active = focused ?? remembered ?? items.find((el) => el.matches(DEFAULT_ITEM_SELECTOR)) ?? items[0];
    for (const el of items) el.tabIndex = el === active ? 0 : -1;
  }, []);

  const ref = React.useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      containerRef.current = node;
      if (!node) return;
      syncTabIndex();
      if (typeof MutationObserver !== "undefined") {
        const observer = new MutationObserver(() => syncTabIndex());
        observer.observe(node, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["disabled", "hidden", "aria-checked", "aria-selected"],
        });
        observerRef.current = observer;
      }
    },
    [syncTabIndex],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<T>) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement;
      if (isEditable(target)) return;
      const items = getItems(event.currentTarget);
      const index = items.indexOf(target);
      if (index === -1) return;

      let next: HTMLElement | undefined;
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowRight": {
          if (axis === "vertical") return;
          const forward = (event.key === "ArrowRight") !== (dir === "rtl");
          next = linearTarget(items, index, forward ? 1 : -1, circular);
          break;
        }
        case "ArrowUp":
        case "ArrowDown": {
          if (axis === "horizontal") return;
          const down = event.key === "ArrowDown";
          next = axis === "grid" ? verticalTarget(items, index, down, circular) : linearTarget(items, index, down ? 1 : -1, circular);
          break;
        }
        case "Home":
          next = items[0];
          break;
        case "End":
          next = items[items.length - 1];
          break;
        default:
          return;
      }
      // Phím thuộc trục của nhóm: chặn cuộn trang kể cả khi đã ở biên.
      event.preventDefault();
      if (next && next !== target) next.focus();
    },
    [axis, circular, dir],
  );

  const onFocus = React.useCallback((event: React.FocusEvent<T>) => {
    const target = event.target as HTMLElement;
    const items = getItems(event.currentTarget);
    if (!items.includes(target)) return;
    activeRef.current = target;
    if (!latest.current.tabbable) for (const el of items) el.tabIndex = el === target ? 0 : -1;
  }, []);

  const onBlur = React.useCallback(
    (event: React.FocusEvent<T>) => {
      const next = event.relatedTarget as Node | null;
      if (next && event.currentTarget.contains(next)) return;
      if (!latest.current.memorizeCurrent) {
        activeRef.current = null;
        syncTabIndex();
      }
    },
    [syncTabIndex],
  );

  return { ref, role, onKeyDown, onFocus, onBlur, "data-focus-scope": "arrow" };
}

/* ================================================================ useFocusableGroup */

export type FocusableGroupTabBehavior = "limited" | "limited-trap-focus" | "unlimited";

export interface UseFocusableGroupOptions {
  /**
   * limited (mặc định): Tab dừng ở nhóm, Enter để vào trong, Esc để ra ·
   * limited-trap-focus: như limited nhưng Tab xoay vòng bên trong ·
   * unlimited: Tab đi xuyên qua các phần tử bên trong như bình thường.
   */
  tabBehavior?: FocusableGroupTabBehavior;
}

export interface FocusableGroupProps<T extends HTMLElement> {
  ref: React.RefCallback<T>;
  tabIndex: number;
  onKeyDown: React.KeyboardEventHandler<T>;
  onFocus: React.FocusEventHandler<T>;
  onBlur: React.FocusEventHandler<T>;
  "data-focus-scope": "group";
}

function limitGroup(container: HTMLElement) {
  for (const el of getItems(container)) {
    if (el.hasAttribute(SAVED_TABINDEX_ATTR)) continue;
    el.setAttribute(SAVED_TABINDEX_ATTR, el.getAttribute("tabindex") ?? "");
    el.tabIndex = -1;
  }
}

function unlimitGroup(container: HTMLElement) {
  for (const el of Array.from(container.querySelectorAll<HTMLElement>(`[${SAVED_TABINDEX_ATTR}]`))) {
    if (el.parentElement?.closest(`[${SCOPE_ATTR}]`) !== container) continue;
    const saved = el.getAttribute(SAVED_TABINDEX_ATTR) ?? "";
    el.removeAttribute(SAVED_TABINDEX_ATTR);
    if (saved === "") el.removeAttribute("tabindex");
    else el.setAttribute("tabindex", saved);
  }
}

/**
 * Biến phần tử chứa thành một điểm dừng Tab (vd. thẻ Card có nhiều nút bên trong).
 * Enter: vào nhóm (focus phần tử đầu) · Esc: trở lại phần tử chứa. Kết hợp với useArrowNavigationGroup ở
 * phần tử cha để dùng mũi tên di chuyển giữa các nhóm.
 */
export function useFocusableGroup<T extends HTMLElement = HTMLElement>(
  options: UseFocusableGroupOptions = {},
): FocusableGroupProps<T> {
  const { tabBehavior = "limited" } = options;
  const behaviorRef = React.useRef(tabBehavior);
  behaviorRef.current = tabBehavior;
  const observerRef = React.useRef<MutationObserver | null>(null);

  const ref = React.useCallback((node: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;
    if (behaviorRef.current !== "unlimited") limitGroup(node);
    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(() => {
        const active = document.activeElement;
        const inside = active !== node && node.contains(active);
        if (behaviorRef.current !== "unlimited" && !inside) limitGroup(node);
      });
      observer.observe(node, { childList: true, subtree: true });
      observerRef.current = observer;
    }
  }, []);

  const onKeyDown = React.useCallback((event: React.KeyboardEvent<T>) => {
    if (event.defaultPrevented) return;
    const container = event.currentTarget;
    const target = event.target as HTMLElement;

    if (target === container) {
      if (event.key !== "Enter") return;
      unlimitGroup(container);
      const first = getItems(container)[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      container.focus();
      if (behaviorRef.current !== "unlimited") limitGroup(container);
      return;
    }

    if (event.key === "Tab" && behaviorRef.current === "limited-trap-focus") {
      const items = getItems(container);
      const index = items.indexOf(target);
      if (index === -1 || items.length === 0) return;
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        items[items.length - 1].focus();
      } else if (!event.shiftKey && index === items.length - 1) {
        event.preventDefault();
        items[0].focus();
      }
    }
  }, []);

  const onFocus = React.useCallback((event: React.FocusEvent<T>) => {
    // Click thẳng vào phần tử bên trong cũng tính là "vào nhóm".
    if (event.target !== event.currentTarget && behaviorRef.current !== "unlimited") unlimitGroup(event.currentTarget);
  }, []);

  const onBlur = React.useCallback((event: React.FocusEvent<T>) => {
    const container = event.currentTarget;
    const next = event.relatedTarget as Node | null;
    if (next && next !== container && container.contains(next)) return;
    if (behaviorRef.current !== "unlimited") limitGroup(container);
  }, []);

  return { ref, tabIndex: 0, onKeyDown, onFocus, onBlur, "data-focus-scope": "group" };
}
