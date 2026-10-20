/** Fluent 2 Overflow — https://react.fluentui.dev/?path=/docs/utilities-overflow--docs */
import * as React from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";

export type OverflowAxis = "horizontal" | "vertical";
/** Phía bị thu gọn trước khi các item cùng priority: "end" (mặc định) ẩn từ cuối, "start" ẩn từ đầu. */
export type OverflowDirection = "start" | "end";
/** Trạng thái một nhóm: mọi item hiện · một phần bị ẩn · ẩn hết. */
export type OverflowGroupVisibility = "visible" | "overflow" | "hidden";

/* ------------------------------------------------------------------ Thuật toán thuần (không đụng DOM) */

export interface OverflowMeasuredItem {
  id: string;
  /** Kích thước theo trục đang xét (đã gồm margin). */
  size: number;
  /** Số lớn hơn được giữ hiển thị lâu hơn. Mặc định 0. */
  priority?: number;
  groupId?: string;
}

export interface OverflowMeasuredDivider {
  groupId: string;
  size: number;
}

export interface ComputeOverflowInput {
  /** Không gian khả dụng theo trục (đã trừ padding / viền của container). */
  available: number;
  /** Các item theo thứ tự DOM. */
  items: OverflowMeasuredItem[];
  /** Divider thuộc nhóm — ẩn khi mọi item trong nhóm bị ẩn. */
  dividers?: OverflowMeasuredDivider[];
  /** Kích thước nút menu "…" — chỉ tính khi có item bị ẩn. */
  menuSize?: number;
  /** Tổng kích thước các phần tử cố định khác cùng hàng và số lượng của chúng (để cộng gap). */
  fixedSize?: number;
  fixedCount?: number;
  /** Khoảng cách giữa các phần tử (column-gap / row-gap). */
  gap?: number;
  /** Khoảng chừa thêm ở cuối. */
  padding?: number;
  /** Số item tối thiểu luôn hiển thị (theo thứ tự ưu tiên). */
  minimumVisible?: number;
  overflowDirection?: OverflowDirection;
}

export interface ComputeOverflowResult {
  visibleIds: string[];
  hiddenIds: string[];
}

/** Sai số làm tròn cho phép (px). */
const EPSILON = 0.5;

/**
 * Chọn item nào được hiển thị: giữ theo thứ tự priority giảm dần (cùng priority thì theo `overflowDirection`),
 * dừng ở item đầu tiên không còn vừa — item ưu tiên thấp không bao giờ "chen" lên trước item ưu tiên cao.
 * Hàm thuần: dùng cho Overflow và để kiểm thử không cần layout.
 */
export function computeOverflow({
  available,
  items,
  dividers = [],
  menuSize = 0,
  fixedSize = 0,
  fixedCount = 0,
  gap = 0,
  padding = 0,
  minimumVisible = 0,
  overflowDirection = "end",
}: ComputeOverflowInput): ComputeOverflowResult {
  const limit = available - padding + EPSILON;
  const minVisible = Math.max(0, Math.floor(minimumVisible));
  const allIds = items.map((i) => i.id);

  const groupsWithItems = new Set(items.flatMap((i) => (i.groupId ? [i.groupId] : [])));
  const dividersByGroup = new Map<string, number[]>();
  let baseSize = fixedSize;
  let baseCount = fixedCount;
  for (const d of dividers) {
    if (!groupsWithItems.has(d.groupId)) {
      // Divider của nhóm không có item nào → luôn hiển thị như phần tử cố định.
      if (d.size > 0) {
        baseSize += d.size;
        baseCount += 1;
      }
      continue;
    }
    const list = dividersByGroup.get(d.groupId) ?? [];
    list.push(d.size);
    dividersByGroup.set(d.groupId, list);
  }

  const fits = (size: number, count: number) => size + gap * Math.max(0, count - 1) <= limit;
  const cost = (item: OverflowMeasuredItem, shownGroups: Set<string>) => {
    let size = item.size;
    let count = item.size > 0 ? 1 : 0;
    if (item.groupId && !shownGroups.has(item.groupId)) {
      for (const s of dividersByGroup.get(item.groupId) ?? []) {
        size += s;
        if (s > 0) count += 1;
      }
    }
    return { size, count };
  };

  // 1. Mọi item vừa (không cần menu)?
  {
    let size = baseSize;
    let count = baseCount;
    const shown = new Set<string>();
    for (const item of items) {
      const c = cost(item, shown);
      size += c.size;
      count += c.count;
      if (item.groupId) shown.add(item.groupId);
    }
    if (items.length <= minVisible || fits(size, count)) return { visibleIds: allIds, hiddenIds: [] };
  }

  // 2. Có menu: thêm dần theo thứ tự ưu tiên.
  const order = items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        (b.item.priority ?? 0) - (a.item.priority ?? 0) ||
        (overflowDirection === "end" ? a.index - b.index : b.index - a.index),
    );
  let size = baseSize + menuSize;
  let count = baseCount + (menuSize > 0 ? 1 : 0);
  const shownGroups = new Set<string>();
  const visible = new Set<string>();
  for (const { item } of order) {
    const c = cost(item, shownGroups);
    if (visible.size >= minVisible && !fits(size + c.size, count + c.count)) break;
    size += c.size;
    count += c.count;
    visible.add(item.id);
    if (item.groupId) shownGroups.add(item.groupId);
  }

  if (visible.size === items.length) return { visibleIds: allIds, hiddenIds: [] };
  return {
    visibleIds: allIds.filter((id) => visible.has(id)),
    hiddenIds: allIds.filter((id) => !visible.has(id)),
  };
}

/** Trạng thái từng nhóm sau khi tính (nhóm không có trong kết quả = "visible"). */
export function getOverflowGroups(
  items: Pick<OverflowMeasuredItem, "id" | "groupId">[],
  hiddenIds: readonly string[],
): Record<string, OverflowGroupVisibility> {
  const hidden = new Set(hiddenIds);
  const tally = new Map<string, { total: number; hidden: number }>();
  for (const item of items) {
    if (!item.groupId) continue;
    const t = tally.get(item.groupId) ?? { total: 0, hidden: 0 };
    t.total += 1;
    if (hidden.has(item.id)) t.hidden += 1;
    tally.set(item.groupId, t);
  }
  const groups: Record<string, OverflowGroupVisibility> = {};
  for (const [groupId, t] of tally) groups[groupId] = t.hidden === 0 ? "visible" : t.hidden === t.total ? "hidden" : "overflow";
  return groups;
}

/* ------------------------------------------------------------------ Đo DOM */

interface ItemEntry {
  id: string;
  element: HTMLElement;
  priority: number;
  groupId?: string;
}

interface DividerEntry {
  element: HTMLElement;
  groupId: string;
}

interface OverflowState {
  hiddenIds: string[];
  visibleIds: string[];
  groups: Record<string, OverflowGroupVisibility>;
}

interface OverflowContextValue {
  state: OverflowState;
  hidden: ReadonlySet<string>;
  registerItem: (entry: ItemEntry) => void;
  unregisterItem: (id: string) => void;
  registerDivider: (entry: DividerEntry) => void;
  unregisterDivider: (element: HTMLElement) => void;
  registerMenu: (element: HTMLElement | null) => void;
}

const OverflowContext = React.createContext<OverflowContextValue | null>(null);

const EMPTY_STATE: OverflowState = { hiddenIds: [], visibleIds: [], groups: {} };
const EMPTY_IDS: string[] = [];

const px = (value: string | null | undefined) => parseFloat(value ?? "") || 0;

function sameState(a: OverflowState, b: OverflowState) {
  if (a.hiddenIds.length !== b.hiddenIds.length || a.visibleIds.length !== b.visibleIds.length) return false;
  if (a.hiddenIds.some((id, i) => id !== b.hiddenIds[i]) || a.visibleIds.some((id, i) => id !== b.visibleIds[i])) return false;
  const ka = Object.keys(a.groups);
  return ka.length === Object.keys(b.groups).length && ka.every((k) => a.groups[k] === b.groups[k]);
}

/** Kích thước ngoài (gồm margin) theo trục, quy về px layout (bỏ ảnh hưởng của transform scale). */
function outerSize(el: Element, horizontal: boolean, scale: number) {
  const rect = el.getBoundingClientRect();
  const raw = horizontal ? rect.width : rect.height;
  if (raw <= 0) return 0;
  const cs = getComputedStyle(el);
  const margin = horizontal ? px(cs.marginLeft) + px(cs.marginRight) : px(cs.marginTop) + px(cs.marginBottom);
  return raw / scale + margin;
}

/** ref của element con (React 18: `element.ref`; React 19: `props.ref`) — giống cách Radix Slot đọc. */
function getElementRef(element: React.ReactElement): React.Ref<unknown> | undefined {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get as { isReactWarning?: boolean } | undefined;
  if (getter && "isReactWarning" in getter && getter.isReactWarning) return (element as unknown as { ref: React.Ref<unknown> }).ref;
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get as { isReactWarning?: boolean } | undefined;
  if (getter && "isReactWarning" in getter && getter.isReactWarning) return (element.props as { ref?: React.Ref<unknown> }).ref;
  return (element.props as { ref?: React.Ref<unknown> }).ref ?? (element as unknown as { ref?: React.Ref<unknown> }).ref;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T>).current = value;
}

function useMergedRef<T>(...refs: (React.Ref<T> | undefined)[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback((node: T) => refs.forEach((ref) => setRef(ref, node)), refs);
}

const byDomOrder = (a: { element: HTMLElement }, b: { element: HTMLElement }) =>
  a.element === b.element ? 0 : a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

/* ------------------------------------------------------------------ Overflow */

/** Class gắn lên container: một hàng không xuống dòng, item không co lại (để đo đúng kích thước tự nhiên), cắt phần tràn; focus ring vẽ vào trong. */
const CONTAINER_CLASS: Record<OverflowAxis, { size: string; base: string }> = {
  horizontal: {
    size: "w-full",
    base: "min-w-0 flex-nowrap overflow-hidden *:shrink-0 *:flex-nowrap **:data-overflow-item:shrink-0 **:focus-visible:-outline-offset-2",
  },
  vertical: {
    size: "h-full",
    base: "min-h-0 flex-nowrap overflow-hidden *:shrink-0 *:flex-nowrap **:data-overflow-item:shrink-0 **:focus-visible:-outline-offset-2",
  },
};

export interface OverflowChangeData {
  hiddenIds: string[];
  visibleIds: string[];
}

export interface OverflowProps {
  /**
   * Đúng một element container (div, Toolbar, TabsList, TagGroup, Breadcrumb…) — phải chuyển tiếp `ref` và nhận
   * `className`. Overflow gắn ref đo kích thước và thêm class `min-w-0 overflow-hidden flex-nowrap`.
   */
  children: React.ReactElement;
  /** Trục đo. Mặc định "horizontal" (container cần chiều cao cố định khi "vertical"). */
  overflowAxis?: OverflowAxis;
  /** Cùng priority thì ẩn từ cuối ("end", mặc định) hay từ đầu ("start"). */
  overflowDirection?: OverflowDirection;
  /** Số item luôn hiển thị dù không đủ chỗ. Mặc định 0. */
  minimumVisible?: number;
  /** Khoảng (px) chừa thêm ở cuối — nút menu đã được tự đo, chỉ cần khi có phần tử khác chen vào. Mặc định 0. */
  padding?: number;
  /** Gọi mỗi khi danh sách item bị ẩn thay đổi. */
  onOverflowChange?: (data: OverflowChangeData) => void;
}

/**
 * Overflow: item không vừa chiều rộng container được ẩn (vẫn mounted, gắn `hidden` + `data-overflowing`) theo priority,
 * để hiện trong menu "…" (`useOverflowMenu` + `useOverflowItems`).
 * Đo bằng ResizeObserver, cache kích thước item khi còn hiển thị; render đầu (và SSR) luôn hiện đủ mọi item.
 */
export const Overflow = React.forwardRef<HTMLElement, OverflowProps>(
  (
    { children, overflowAxis = "horizontal", overflowDirection = "end", minimumVisible = 0, padding = 0, onOverflowChange },
    forwardedRef,
  ) => {
    const containerRef = React.useRef<HTMLElement | null>(null);
    const itemsRef = React.useRef(new Map<string, ItemEntry>());
    const dividersRef = React.useRef(new Map<HTMLElement, DividerEntry>());
    const menuRef = React.useRef<HTMLElement | null>(null);
    const sizeCache = React.useRef(new WeakMap<Element, number>());
    const menuSizeRef = React.useRef(0);
    const observerRef = React.useRef<ResizeObserver | null>(null);
    const stateRef = React.useRef<OverflowState>(EMPTY_STATE);
    const guardRef = React.useRef({ changes: 0, frame: 0 });
    const [state, setState] = React.useState<OverflowState>(EMPTY_STATE);
    const [version, bump] = React.useReducer((x: number) => x + 1, 0);

    const observe = React.useCallback((el: Element | null) => {
      if (!el || typeof ResizeObserver === "undefined") return;
      observerRef.current ??= new ResizeObserver(() => updateRef.current(true));
      observerRef.current.observe(el);
    }, []);
    const unobserve = React.useCallback((el: Element | null) => {
      if (el) observerRef.current?.unobserve(el);
    }, []);

    const update = (sync: boolean) => {
      const container = containerRef.current;
      if (!container || !container.isConnected) return;
      const horizontal = overflowAxis === "horizontal";
      const rect = container.getBoundingClientRect();
      const raw = horizontal ? rect.width : rect.height;
      // Container chưa hiển thị (display:none, tab đang ẩn…) → giữ nguyên, đo lại khi ResizeObserver báo.
      if (raw <= 0) return;
      const offset = horizontal ? container.offsetWidth : container.offsetHeight;
      const scale = offset > 0 ? raw / offset : 1;
      const cs = getComputedStyle(container);
      const edges = horizontal
        ? px(cs.paddingLeft) + px(cs.paddingRight) + px(cs.borderLeftWidth) + px(cs.borderRightWidth)
        : px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth);
      const available = raw / scale - edges;

      const items = [...itemsRef.current.values()].filter((e) => e.element.isConnected).sort(byDomOrder);
      const dividers = [...dividersRef.current.values()].filter((e) => e.element.isConnected);
      const line = items[0]?.element.parentElement ?? container;
      const lineStyle = getComputedStyle(line);
      const gap = px(horizontal ? lineStyle.columnGap : lineStyle.rowGap);

      // Item đang ẩn không đo được → dùng kích thước đã cache lúc còn hiển thị.
      const measure = (el: HTMLElement) => {
        if (el.hasAttribute("data-overflowing")) return sizeCache.current.get(el) ?? 0;
        const size = outerSize(el, horizontal, scale);
        sizeCache.current.set(el, size);
        return size;
      };

      const menu = menuRef.current?.isConnected ? menuRef.current : null;
      const menuBox = menu ? ((Array.from(line.children).find((c) => c.contains(menu)) as HTMLElement | undefined) ?? menu) : null;
      if (menuBox) {
        const size = outerSize(menuBox, horizontal, scale);
        if (size > 0) menuSizeRef.current = size;
      }

      // Phần tử khác cùng hàng (không phải item / divider / menu) chiếm chỗ cố định.
      const registered = new Set<Element>([...items.map((i) => i.element), ...dividers.map((d) => d.element)]);
      let fixedSize = 0;
      let fixedCount = 0;
      for (const child of Array.from(line.children)) {
        if (registered.has(child) || child === menuBox) continue;
        const position = getComputedStyle(child).position;
        if (position === "absolute" || position === "fixed") continue;
        const size = outerSize(child, horizontal, scale);
        if (size > 0) {
          fixedSize += size;
          fixedCount += 1;
        }
      }
      if (line !== container) {
        fixedSize += horizontal
          ? px(lineStyle.paddingLeft) + px(lineStyle.paddingRight) + px(lineStyle.borderLeftWidth) + px(lineStyle.borderRightWidth)
          : px(lineStyle.paddingTop) + px(lineStyle.paddingBottom) + px(lineStyle.borderTopWidth) + px(lineStyle.borderBottomWidth);
      }

      const measuredItems = items.map((e) => ({ id: e.id, size: measure(e.element), priority: e.priority, groupId: e.groupId }));
      const result = computeOverflow({
        available,
        items: measuredItems,
        dividers: dividers.map((d) => ({ groupId: d.groupId, size: measure(d.element) })),
        menuSize: menuSizeRef.current,
        fixedSize,
        fixedCount,
        gap,
        padding,
        minimumVisible,
        overflowDirection,
      });
      const next: OverflowState = { ...result, groups: getOverflowGroups(measuredItems, result.hiddenIds) };
      if (sameState(stateRef.current, next)) return;

      // Chốt chặn vòng lặp: tối đa 12 lần đổi trạng thái trong một khung hình.
      const now = typeof performance !== "undefined" ? Math.floor(performance.now() / 16) : 0;
      if (guardRef.current.frame !== now) guardRef.current = { changes: 0, frame: now };
      if (++guardRef.current.changes > 12) return;

      stateRef.current = next;
      if (sync) flushSync(() => setState(next));
      else setState(next);
      onOverflowChangeRef.current?.({ hiddenIds: next.hiddenIds, visibleIds: next.visibleIds });
    };

    const updateRef = React.useRef(update);
    updateRef.current = update;
    const onOverflowChangeRef = React.useRef(onOverflowChange);
    onOverflowChangeRef.current = onOverflowChange;

    const registerItem = React.useCallback(
      (entry: ItemEntry) => {
        const prev = itemsRef.current.get(entry.id);
        if (prev && prev.element === entry.element && prev.priority === entry.priority && prev.groupId === entry.groupId) return;
        if (prev && prev.element !== entry.element) unobserve(prev.element);
        itemsRef.current.set(entry.id, entry);
        if (prev?.element !== entry.element) observe(entry.element);
        bump();
      },
      [observe, unobserve],
    );
    const unregisterItem = React.useCallback(
      (id: string) => {
        const prev = itemsRef.current.get(id);
        if (!prev) return;
        itemsRef.current.delete(id);
        unobserve(prev.element);
        bump();
      },
      [unobserve],
    );
    const registerDivider = React.useCallback(
      (entry: DividerEntry) => {
        const prev = dividersRef.current.get(entry.element);
        if (prev && prev.groupId === entry.groupId) return;
        dividersRef.current.set(entry.element, entry);
        if (!prev) observe(entry.element);
        bump();
      },
      [observe],
    );
    const unregisterDivider = React.useCallback(
      (element: HTMLElement) => {
        if (!dividersRef.current.delete(element)) return;
        unobserve(element);
        bump();
      },
      [unobserve],
    );
    const registerMenu = React.useCallback(
      (element: HTMLElement | null) => {
        if (menuRef.current === element) return;
        unobserve(menuRef.current);
        menuRef.current = element;
        observe(element);
        bump();
      },
      [observe, unobserve],
    );

    // Đo lại sau mỗi lần đăng ký / đổi cấu hình — trong layout effect nên không nháy.
    useIsomorphicLayoutEffect(() => {
      updateRef.current(false);
    }, [version, overflowAxis, overflowDirection, minimumVisible, padding]);

    useIsomorphicLayoutEffect(() => {
      // (Re)mount — StrictMode chạy effect hai lần: quan sát lại mọi phần tử đã đăng ký.
      observe(containerRef.current);
      itemsRef.current.forEach((e) => observe(e.element));
      dividersRef.current.forEach((e) => observe(e.element));
      observe(menuRef.current);
      return () => {
        observerRef.current?.disconnect();
        observerRef.current = null;
      };
    }, [observe]);

    const hidden = React.useMemo(() => new Set(state.hiddenIds), [state.hiddenIds]);
    const ctx = React.useMemo<OverflowContextValue>(
      () => ({ state, hidden, registerItem, unregisterItem, registerDivider, unregisterDivider, registerMenu }),
      [state, hidden, registerItem, unregisterItem, registerDivider, unregisterDivider, registerMenu],
    );

    const child = React.Children.only(children) as React.ReactElement<{ className?: string }>;
    const setContainer = React.useCallback(
      (node: HTMLElement | null) => {
        if (containerRef.current && containerRef.current !== node) unobserve(containerRef.current);
        containerRef.current = node;
        observe(node);
      },
      [observe, unobserve],
    );
    const ref = useMergedRef<HTMLElement | null>(setContainer, getElementRef(child) as React.Ref<HTMLElement | null>, forwardedRef);
    const classes = CONTAINER_CLASS[overflowAxis];

    return (
      <OverflowContext.Provider value={ctx}>
        {React.cloneElement(child, {
          ref,
          "data-overflow-container": "",
          className: cn(classes.size, child.props.className, classes.base),
        } as Record<string, unknown>)}
      </OverflowContext.Provider>
    );
  },
);
Overflow.displayName = "Overflow";

/* ------------------------------------------------------------------ OverflowItem */

/** Thuộc tính gắn lên phần tử bị ẩn: `hidden` (display:none → không focus được), `data-disabled` để nhóm roving focus tự viết (Toolbar) bỏ qua. */
const HIDDEN_PROPS = { hidden: true, "data-overflowing": "", "data-disabled": "" } as const;

export interface OverflowItemProps {
  /** Định danh duy nhất trong Overflow — trả về qua `useOverflowItems()`. */
  id: string;
  /** Số lớn hơn được giữ hiển thị lâu hơn (vd. tab đang chọn). Mặc định 0. */
  priority?: number;
  /** Nhóm — dùng với `OverflowDivider` / `useIsOverflowGroupVisible`. */
  groupId?: string;
  /** Đúng một element chuyển tiếp `ref` và rải props xuống DOM (ToolbarButton, TabsTrigger, Tag, BreadcrumbItem…). */
  children: React.ReactElement;
}

/** Bọc một item có thể bị thu vào menu. Không thêm phần tử DOM — gắn ref + thuộc tính lên chính element con. */
export const OverflowItem = React.forwardRef<HTMLElement, OverflowItemProps>(({ id, priority = 0, groupId, children }, forwardedRef) => {
  const ctx = React.useContext(OverflowContext);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const child = React.Children.only(children);
  const ref = useMergedRef<HTMLElement | null>(elementRef, getElementRef(child) as React.Ref<HTMLElement | null>, forwardedRef);
  const register = ctx?.registerItem;
  const unregister = ctx?.unregisterItem;

  // Chạy mỗi lần render: Overflow tự bỏ qua nếu không có gì đổi (element, priority, groupId).
  useIsomorphicLayoutEffect(() => {
    if (register && elementRef.current) register({ id, element: elementRef.current, priority, groupId });
  });
  useIsomorphicLayoutEffect(() => () => unregister?.(id), [unregister, id]);

  const isHidden = ctx?.hidden.has(id) ?? false;
  return React.cloneElement(child, { ref, "data-overflow-item": id, ...(isHidden ? HIDDEN_PROPS : null) } as Record<string, unknown>);
});
OverflowItem.displayName = "OverflowItem";

/* ------------------------------------------------------------------ OverflowDivider */

export interface OverflowDividerProps {
  /** Nhóm mà divider đi kèm — divider ẩn khi mọi item của nhóm bị ẩn. */
  groupId: string;
  children: React.ReactElement;
}

/**
 * Divider (BreadcrumbDivider, ToolbarDivider…) tự ẩn cùng nhóm item của nó.
 * Divider thường không chuyển tiếp ref → tìm phần tử qua một `<template>` đánh dấu ngay sau nó
 * (`<template>` hợp lệ trong `<ol>`/`<ul>`, không hiển thị, không vào cây trợ năng).
 */
export const OverflowDivider = React.forwardRef<HTMLElement, OverflowDividerProps>(({ groupId, children }, forwardedRef) => {
  const ctx = React.useContext(OverflowContext);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const markerRef = React.useRef<HTMLTemplateElement | null>(null);
  const registeredRef = React.useRef<HTMLElement | null>(null);
  const child = React.Children.only(children);
  const ref = useMergedRef<HTMLElement | null>(elementRef, getElementRef(child) as React.Ref<HTMLElement | null>, forwardedRef);
  // Function component thường (không forwardRef) không nhận ref — React sẽ cảnh báo nếu truyền.
  const type: unknown = child.type;
  const acceptsRef = typeof type !== "function" || !!(type as { prototype?: { isReactComponent?: unknown } }).prototype?.isReactComponent;
  const register = ctx?.registerDivider;
  const unregister = ctx?.unregisterDivider;

  useIsomorphicLayoutEffect(() => {
    const el = elementRef.current ?? (markerRef.current?.previousElementSibling as HTMLElement | null);
    if (!register || !el) return;
    if (registeredRef.current && registeredRef.current !== el) unregister?.(registeredRef.current);
    registeredRef.current = el;
    register({ element: el, groupId });
  });
  useIsomorphicLayoutEffect(
    () => () => {
      if (registeredRef.current) unregister?.(registeredRef.current);
      registeredRef.current = null;
    },
    [unregister],
  );

  const isHidden = ctx?.state.groups[groupId] === "hidden";
  return (
    <>
      {React.cloneElement(child, {
        ...(acceptsRef ? { ref } : null),
        "data-overflow-divider": groupId,
        ...(isHidden ? HIDDEN_PROPS : null),
      } as Record<string, unknown>)}
      <template ref={markerRef} data-overflow-marker="" />
    </>
  );
});
OverflowDivider.displayName = "OverflowDivider";

/* ------------------------------------------------------------------ Hooks */

export interface OverflowMenuState<T extends HTMLElement> {
  /** Gắn lên phần tử ngoài cùng của nút menu để Overflow đo và chừa chỗ. */
  ref: React.RefCallback<T>;
  /** Số item đang bị ẩn. */
  overflowCount: number;
  /** Có item bị ẩn — chỉ render nút menu khi `true`. */
  isOverflowing: boolean;
}

/**
 * Dành cho nút menu "…": trả `ref` (để đo), số item ẩn và cờ `isOverflowing`.
 * Chỉ render nút khi `isOverflowing` (trả `null` nếu không) — Overflow chừa chỗ cho nút khi cần.
 */
export function useOverflowMenu<T extends HTMLElement = HTMLElement>(): OverflowMenuState<T> {
  const ctx = React.useContext(OverflowContext);
  const registerMenu = ctx?.registerMenu;
  const ref = React.useCallback((el: T | null) => registerMenu?.(el), [registerMenu]);
  const overflowCount = ctx?.state.hiddenIds.length ?? 0;
  return { ref, overflowCount, isOverflowing: overflowCount > 0 };
}

/** `true` nếu item đang hiển thị trong container (false = đã thu vào menu). */
export function useIsOverflowItemVisible(id: string): boolean {
  const ctx = React.useContext(OverflowContext);
  return !(ctx?.hidden.has(id) ?? false);
}

/** id các item đang bị ẩn, theo thứ tự DOM — dùng để render MenuItem tương ứng. */
export function useOverflowItems(): string[] {
  return React.useContext(OverflowContext)?.state.hiddenIds ?? EMPTY_IDS;
}

/** Trạng thái của một nhóm: "visible" | "overflow" (ẩn một phần) | "hidden". */
export function useIsOverflowGroupVisible(groupId: string): OverflowGroupVisibility {
  return React.useContext(OverflowContext)?.state.groups[groupId] ?? "visible";
}
