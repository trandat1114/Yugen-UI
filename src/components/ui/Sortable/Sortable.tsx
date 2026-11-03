/**
 * Sortable — sắp xếp lại mục bằng kéo thả (chuột, cảm ứng, bút) hoặc bàn phím. Không dùng thư viện kéo thả: dnd-kit
 * (core + sortable) nặng ~16.6 kB gzip, phần tự viết dưới đây chỉ làm đúng việc sắp xếp danh sách.
 *
 * Bàn phím theo mẫu của ARIA APG / Salesforce Lightning: Space hoặc Enter trên tay nắm nhấc mục lên, phím mũi tên di chuyển,
 * Space / Enter thả, Esc huỷ; mỗi bước được đọc qua useAnnounce. Không kéo được (WCAG 2.5.7): bấm tay nắm để nhấc, bấm tay
 * nắm của mục khác để đặt vào chỗ đó.
 *
 * Thứ tự được cập nhật ngay trong lúc kéo (`onValueChange`) để giao diện theo kịp; lưu dữ liệu trong `onSortEnd`.
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ReOrderDotsVertical20Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { useAnnounce, type AnnounceFn } from "../AriaLive/AriaLive";
import { useYugenMessages } from "../YugenProvider/context";
import { matchesMedia } from "../hooks/useMediaQuery";
import { useComposedRefs } from "../_internal/composeRefs";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { sortableMessagesEn, type SortableMessages } from "./messages";

export { sortableMessages, sortableMessagesVi, sortableMessagesEn, type SortableMessages } from "./messages";

export type SortableOrientation = "vertical" | "horizontal" | "grid";

/** Thứ tự mục (id) của từng danh sách trong SortableGroup, theo `listId`. */
export type SortableGroupValue = Record<string, readonly string[]>;

export interface SortablePosition {
  /** `listId` của danh sách ("" với Sortable đứng riêng không đặt listId). */
  list: string;
  /** Vị trí trong danh sách, đếm từ 0. */
  index: number;
}

export interface SortableStartData {
  item: string;
  from: SortablePosition;
}

export interface SortableEndData {
  item: string;
  from: SortablePosition;
  to: SortablePosition;
  /** Esc hoặc mất pointer: thứ tự đã được trả về như lúc nhấc mục lên. */
  canceled: boolean;
}

/** Mảng mới với phần tử ở `from` chuyển sang `to` (dùng cho nút / menu "Lên trên", "Xuống dưới"). */
export function arrayMove<T>(array: readonly T[], from: number, to: number): T[] {
  const next = array.slice();
  if (from < 0 || from >= next.length) return next;
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}

/* Nhịp kéo thả (hành vi, không phải giá trị thị giác). */
/** Quãng kéo (px) trước khi bắt đầu kéo — ngắn hơn thì vẫn là một cú bấm. */
const DISTANCE = 4;
/** Giữ ngón tay (ms) trên mục là tay nắm (`handle`) trước khi kéo; vuốt sớm hơn thì trang cuộn như thường. */
const LONG_PRESS = 250;
/** Ngón tay xê dịch quá chừng này (px) trong lúc chờ giữ thì coi là cuộn trang. */
const TOLERANCE = 8;
/** Vùng sát mép khung cuộn (px) làm danh sách tự cuộn, và tốc độ tối đa (px mỗi khung hình). */
const EDGE = 48;
const MAX_SCROLL = 20;
/** Các mục khác trượt vào chỗ mới: durationNormal + curveDecelerateMid. */
const FLIP = { duration: 200, easing: "cubic-bezier(0, 0, 0, 1)" };

type DragMode = "pointer" | "keyboard";

interface ListReg {
  el: HTMLElement | null;
  orientation: SortableOrientation;
  label?: string;
  disabled: boolean;
}

interface ItemReg {
  el: HTMLElement | null;
  handle: HTMLElement | null;
  label?: string;
}

interface Drag {
  item: string;
  mode: DragMode;
  from: SortablePosition;
  snapshot: SortableGroupValue;
  /** Phần tử đang giữ focus lúc nhấc lên (bàn phím) — focus được trả về đây sau mỗi bước. */
  focus: HTMLElement | null;
  x: number;
  y: number;
  /** Vị trí con trỏ bên trong mục lúc bắt đầu kéo. */
  grabX: number;
  grabY: number;
  /** transform đang gắn lên phần tử của mục. */
  applied: { el: HTMLElement | null; x: number; y: number };
  /** Con trỏ / cuộn / bố cục đổi từ lần tính vị trí trước. */
  dirty: boolean;
  /** Đã nhả chuột, chờ thứ tự cuối cùng vào DOM rồi mới kết thúc. */
  released: number;
  frame: number;
}

interface PointerSession {
  item: string;
  id: number;
  x: number;
  y: number;
  /** Cảm ứng trên mục là tay nắm: chờ giữ LONG_PRESS. */
  longPress: boolean;
  timer?: ReturnType<typeof setTimeout>;
  dragged: boolean;
}

interface Host {
  value: SortableGroupValue;
  onValueChange?: (value: Record<string, string[]>) => void;
  onSortStart?: (data: SortableStartData) => void;
  onSortEnd?: (data: SortableEndData) => void;
  msg: SortableMessages;
  announce: AnnounceFn;
}

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));

function locate(value: SortableGroupValue, item: string): SortablePosition | null {
  for (const list in value) {
    const index = value[list].indexOf(item);
    if (index !== -1) return { list, index };
  }
  return null;
}

function sameValue(a: SortableGroupValue, b: SortableGroupValue) {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((k) => a[k].length === b[k]?.length && a[k].every((id, i) => id === b[k][i]))
  );
}

const isRtl = (el: Element | null | undefined) => !!el && getComputedStyle(el).direction === "rtl";

/** Khung theo bố cục: bỏ phần dịch của transform (animation FLIP đang chạy) để vị trí đích không rung. */
function layoutRect(el: HTMLElement): DOMRect {
  const rect = el.getBoundingClientRect();
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none" || typeof DOMMatrixReadOnly !== "function") return rect;
  const m = new DOMMatrixReadOnly(transform);
  return new DOMRect(rect.x - m.m41, rect.y - m.m42, rect.width, rect.height);
}

/** Đoạn của khung trên trục danh sách; trục ngang trong RTL được lật để `start` luôn là phía đầu dòng. */
function span(rect: DOMRect, horizontal: boolean, rtl: boolean) {
  if (!horizontal) return { start: rect.top, end: rect.bottom };
  return rtl ? { start: -rect.right, end: -rect.left } : { start: rect.left, end: rect.right };
}

/** Tốc độ tự cuộn khi con trỏ ở sát mép [start, end]; 0 khi ở giữa. */
function edgeSpeed(pos: number, start: number, end: number) {
  if (pos < start + EDGE) return -Math.ceil(MAX_SCROLL * Math.min(1, (start + EDGE - pos) / EDGE));
  if (pos > end - EDGE) return Math.ceil(MAX_SCROLL * Math.min(1, (pos - end + EDGE) / EDGE));
  return 0;
}

const MOVE_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"]);
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function createEngine() {
  const lists = new Map<string, ListReg>();
  const items = new Map<string, ItemReg>();
  const listeners = new Set<() => void>();
  const flips = new WeakMap<Element, Animation>();
  let host: Host = { value: {}, msg: sortableMessagesEn, announce: () => {} };
  let value: SortableGroupValue = {};
  let drag: Drag | null = null;
  let session: PointerSession | null = null;
  let firstRects: Map<string, DOMRect> | null = null;
  let focusAfter: { item: string; el: HTMLElement | null; target: "handle" | "item" } | null = null;
  let userSelect = "";
  /** Đã gọi onValueChange, DOM chưa render thứ tự mới: chưa tính vị trí tiếp (DOM cũ + thứ tự mới làm mục nhảy qua lại). */
  let awaiting = false;

  const emit = () => listeners.forEach((listener) => listener());
  const itemReg = (id: string) => {
    let reg = items.get(id);
    if (!reg) items.set(id, (reg = { el: null, handle: null }));
    return reg;
  };

  /* ---------------------------------------------------------- nhãn & thông báo */
  const itemLabel = (id: string) => {
    const reg = items.get(id);
    return reg?.label || reg?.el?.textContent?.trim() || id;
  };
  const listLabel = (id: string) => {
    const reg = lists.get(id);
    const labelledBy = reg?.el?.getAttribute("aria-labelledby");
    return (
      reg?.label ||
      reg?.el?.getAttribute("aria-label") ||
      (labelledBy && reg?.el?.ownerDocument.getElementById(labelledBy)?.textContent?.trim()) ||
      id
    );
  };
  const say = (template: string, item: string, at: SortablePosition, keyboard: boolean) =>
    host.announce(
      fill(template, { item: itemLabel(item), list: listLabel(at.list), position: at.index + 1, total: value[at.list]?.length ?? 0 }),
      { politeness: keyboard ? "assertive" : "polite", batchId: "yugen-sortable" },
    );

  /* ---------------------------------------------------------- đổi thứ tự + FLIP */
  const measure = (ids: Iterable<string>) => {
    const rects = firstRects ?? new Map<string, DOMRect>();
    for (const list of ids)
      for (const id of value[list] ?? []) {
        const el = items.get(id)?.el;
        if (el && !rects.has(id)) rects.set(id, el.getBoundingClientRect());
      }
    firstRects = rects;
  };

  /** Các mục đã đo trong `firstRects` trượt từ chỗ cũ về chỗ mới. */
  const flip = () => {
    const first = firstRects;
    firstRects = null;
    if (!first || matchesMedia(REDUCED_MOTION)) return;
    first.forEach((rect, id) => {
      const el = items.get(id)?.el;
      if (!el || typeof el.animate !== "function" || (drag?.mode === "pointer" && drag.item === id)) return;
      flips.get(el)?.cancel();
      const last = el.getBoundingClientRect();
      const dx = rect.left - last.left;
      const dy = rect.top - last.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      flips.set(el, el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], FLIP));
    });
  };

  const commit = (next: SortableGroupValue) => {
    value = next;
    awaiting = true;
    host.onValueChange?.(next as Record<string, string[]>);
    emit();
  };

  const move = (id: string, to: SortablePosition) => {
    const from = locate(value, id);
    if (!from || (from.list === to.list && from.index === to.index) || lists.get(to.list)?.disabled) return false;
    measure(new Set([from.list, to.list]));
    const source = value[from.list].filter((v) => v !== id);
    const target = from.list === to.list ? source : [...(value[to.list] ?? [])];
    target.splice(Math.max(0, Math.min(to.index, target.length)), 0, id);
    commit({ ...value, [from.list]: source, [to.list]: target });
    return true;
  };

  /* ---------------------------------------------------------- bàn phím */
  const listsInOrder = () =>
    [...lists.entries()]
      .filter(([, reg]) => reg.el)
      .sort(([, a], [, b]) => (a.el!.compareDocumentPosition(b.el!) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

  const adjacentList = (list: string, dir: 1 | -1) => {
    const ordered = listsInOrder();
    let i = ordered.findIndex(([key]) => key === list);
    if (i < 0) return null;
    for (i += dir; i >= 0 && i < ordered.length; i += dir) if (!ordered[i][1].disabled) return ordered[i][0];
    return null;
  };

  /** Grid (mục rộng khác nhau, như tag xuống dòng): vị trí của mục gần nhất theo chiều ngang ở hàng trên / dưới. */
  const rowNeighbor = (list: string, index: number, dir: 1 | -1) => {
    const rects = (value[list] ?? []).map((id) => {
      const el = items.get(id)?.el;
      return el ? layoutRect(el) : null;
    });
    const self = rects[index];
    if (!self) return index;
    const center = (r: DOMRect) => r.left + r.width / 2;
    let row = dir > 0 ? Infinity : -Infinity;
    for (const r of rects)
      if (r && (dir > 0 ? r.top > self.top + 1 && r.top < row : r.top < self.top - 1 && r.top > row)) row = r.top;
    let best = index;
    let dist = Infinity;
    rects.forEach((r, i) => {
      if (!r || Math.abs(r.top - row) >= 1) return;
      const d = Math.abs(center(r) - center(self));
      if (d < dist) [best, dist] = [i, d];
    });
    return best;
  };

  /** Vị trí mới của mục khi nhấn `key`; null nếu phím không di chuyển mục. */
  const targetFor = (id: string, key: string): SortablePosition | null => {
    const at = locate(value, id);
    if (!at) return null;
    const reg = lists.get(at.list);
    const orientation = reg?.orientation ?? "vertical";
    const rtl = isRtl(reg?.el);
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    const last = value[at.list].length - 1;
    const step = (delta: number) => ({ list: at.list, index: Math.max(0, Math.min(last, at.index + delta)) });
    if (key === "Home") return step(-Infinity);
    if (key === "End") return step(Infinity);
    if (orientation === "grid") {
      if (key === forward || key === backward) return step(key === forward ? 1 : -1);
      if (key === "ArrowDown" || key === "ArrowUp") return { list: at.list, index: rowNeighbor(at.list, at.index, key === "ArrowDown" ? 1 : -1) };
      return null;
    }
    const [prev, next] = orientation === "vertical" ? ["ArrowUp", "ArrowDown"] : [backward, forward];
    if (key === prev || key === next) return step(key === next ? 1 : -1);
    // Phím vuông góc với danh sách: sang danh sách kế bên trong SortableGroup, giữ hàng nếu được.
    const [prevList, nextList] = orientation === "vertical" ? [backward, forward] : ["ArrowUp", "ArrowDown"];
    if (key !== prevList && key !== nextList) return null;
    const other = adjacentList(at.list, key === nextList ? 1 : -1);
    return other === null ? null : { list: other, index: Math.min(at.index, value[other]?.length ?? 0) };
  };

  const keyMove = (id: string, key: string, focus: HTMLElement | null, target: "handle" | "item") => {
    const before = locate(value, id);
    const to = targetFor(id, key);
    if (!before || !to || !move(id, to)) return false;
    focusAfter = { item: id, el: focus, target };
    const at = locate(value, id)!;
    say(at.list !== before.list ? host.msg.movedTo : host.msg.moved, id, at, true);
    return true;
  };

  const onKey = (event: KeyboardEvent) => {
    const d = drag;
    if (!d || event.isComposing) return;
    if (d.mode === "pointer") {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        end(true);
      }
      return;
    }
    if (event.key === "Tab") return end(false);
    if (event.key === " " || event.key === "Enter") end(false);
    else if (event.key === "Escape") end(true);
    else if (MOVE_KEYS.has(event.key)) keyMove(d.item, event.key, d.focus, "handle");
    else return;
    // Chặn trước mọi listener khác (Radix Dialog đóng bằng Esc, menu đổi focus bằng mũi tên, trang cuộn).
    event.preventDefault();
    event.stopPropagation();
  };

  const ownHandle = (node: EventTarget | null) => {
    const handle = node instanceof Element ? node.closest("[data-sortable-handle]") : null;
    return !!handle && [...items.values()].some((reg) => reg.handle === handle);
  };

  /** Bấm / focus ra ngoài khi đang nhấc bằng bàn phím: thả tại chỗ. Tay nắm khác trong nhóm thì để onClick đặt mục vào đó. */
  const onOutside = (event: Event) => {
    const d = drag;
    if (!d || d.mode !== "keyboard") return;
    const target = event.target as Node | null;
    if (target && items.get(d.item)?.el?.contains(target)) return;
    if (ownHandle(target)) return;
    end(false);
  };

  /* ---------------------------------------------------------- kéo bằng con trỏ */
  /**
   * Danh sách dưới con trỏ (lồng nhau thì danh sách nhỏ nhất); con trỏ không nằm trong danh sách nào thì danh sách gần
   * nhất — cột Kanban thấp hơn hàng của nó vẫn nhận thẻ khi con trỏ ở khoảng trống bên dưới.
   */
  const listAt = (x: number, y: number) => {
    let best: string | null = null;
    let score = Infinity;
    lists.forEach((reg, key) => {
      if (!reg.el || reg.disabled) return;
      const r = reg.el.getBoundingClientRect();
      const dist = Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
      // Bên trong: điểm âm theo diện tích (nhỏ hơn thắng); bên ngoài: theo khoảng cách.
      const value = dist === 0 ? -1 / (1 + r.width * r.height) : dist;
      if (value < score) [best, score] = [key, value];
    });
    return best;
  };

  /** Vị trí chèn khi con trỏ đi vào danh sách khác. */
  const insertionIndex = (list: string, x: number, y: number) => {
    const reg = lists.get(list);
    const ids = value[list] ?? [];
    const rtl = isRtl(reg?.el);
    if (reg?.orientation === "grid") {
      let best = -1;
      let dist = Infinity;
      let after = false;
      ids.forEach((id, i) => {
        const el = items.get(id)?.el;
        if (!el) return;
        const r = layoutRect(el);
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        if (d >= dist) return;
        dist = d;
        best = i;
        after = y > r.bottom || (y >= r.top && (rtl ? x < r.left + r.width / 2 : x > r.left + r.width / 2));
      });
      return best < 0 ? ids.length : best + (after ? 1 : 0);
    }
    const horizontal = reg?.orientation === "horizontal";
    const p = horizontal ? (rtl ? -x : x) : y;
    return ids.filter((id) => {
      const el = items.get(id)?.el;
      if (!el) return false;
      const s = span(layoutRect(el), horizontal, rtl);
      return (s.start + s.end) / 2 < p;
    }).length;
  };

  /** Vị trí mới trong cùng danh sách: mục vượt quá nửa mục bên cạnh thì đổi chỗ. */
  const evaluate = (d: Drag) => {
    const at = locate(value, d.item);
    const el = items.get(d.item)?.el;
    if (!at || !el) return;
    const over = listAt(d.x, d.y);
    if (over !== null && over !== at.list) {
      move(d.item, { list: over, index: insertionIndex(over, d.x, d.y) });
      return;
    }
    const reg = lists.get(at.list);
    const ids = value[at.list];
    let index: number;
    if (reg?.orientation === "grid") {
      index = ids.findIndex((id) => {
        const other = id === d.item ? null : items.get(id)?.el;
        if (!other) return false;
        const r = layoutRect(other);
        return d.x >= r.left && d.x <= r.right && d.y >= r.top && d.y <= r.bottom;
      });
      if (index < 0) return;
    } else {
      const horizontal = reg?.orientation === "horizontal";
      const rtl = isRtl(reg?.el);
      const self = span(el.getBoundingClientRect(), horizontal, rtl);
      index = 0;
      ids.forEach((id, i) => {
        const other = id === d.item ? null : items.get(id)?.el;
        if (!other) return;
        const s = span(layoutRect(other), horizontal, rtl);
        const mid = (s.start + s.end) / 2;
        if (i < at.index ? self.start >= mid : self.end > mid) index++;
      });
    }
    if (index !== at.index) move(d.item, { list: at.list, index });
  };

  /** Gắn transform để mục nằm dưới con trỏ, bất kể bố cục vừa đổi hay khung vừa cuộn. */
  const follow = (d: Drag) => {
    const el = items.get(d.item)?.el;
    if (!el) return;
    const prev = d.applied.el === el ? d.applied : { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const x = d.x - d.grabX - (r.left - prev.x);
    const y = d.y - d.grabY - (r.top - prev.y);
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    d.applied = { el, x, y };
  };

  /** Cuộn khung cuộn gần nhất (rồi tới trang) khi con trỏ ở sát mép. */
  const autoScroll = (d: Drag) => {
    const at = locate(value, d.item);
    const root = document.scrollingElement ?? document.documentElement;
    let node: Element | null = (at && lists.get(at.list)?.el) || null;
    let doneX = false;
    let doneY = false;
    let scrolled = false;
    while (node && !(doneX && doneY)) {
      const isRoot = node === root;
      const box = isRoot ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight } : node.getBoundingClientRect();
      const inside = d.x >= box.left && d.x <= box.right && d.y >= box.top && d.y <= box.bottom;
      if (inside) {
        const style = isRoot ? null : getComputedStyle(node);
        const scrollable = (overflow: string | undefined) => isRoot || /auto|scroll|overlay/.test(overflow ?? "");
        if (!doneY && node.scrollHeight > node.clientHeight && scrollable(style?.overflowY)) {
          const speed = edgeSpeed(d.y, box.top, box.bottom);
          const before = node.scrollTop;
          if (speed) node.scrollTop += speed;
          if (node.scrollTop !== before) doneY = scrolled = true;
        }
        if (!doneX && node.scrollWidth > node.clientWidth && scrollable(style?.overflowX)) {
          const speed = edgeSpeed(d.x, box.left, box.right);
          const before = node.scrollLeft;
          if (speed) node.scrollLeft += speed;
          if (node.scrollLeft !== before) doneX = scrolled = true;
        }
      }
      node = isRoot ? null : (node.parentElement ?? root);
    }
    return scrolled;
  };

  const frame = () => {
    const d = drag;
    if (!d || d.mode !== "pointer" || d.released) return;
    if (autoScroll(d)) d.dirty = true;
    if (d.dirty) {
      follow(d);
      if (!awaiting) {
        d.dirty = false;
        evaluate(d);
      }
    }
    d.frame = requestAnimationFrame(frame);
  };

  /* ---------------------------------------------------------- vòng đời một lần kéo */
  const start = (id: string, mode: DragMode, focus: HTMLElement | null) => {
    const from = locate(value, id);
    if (!from || drag) return null;
    firstRects = null;
    awaiting = false;
    drag = { item: id, mode, from, snapshot: value, focus, x: 0, y: 0, grabX: 0, grabY: 0, applied: { el: null, x: 0, y: 0 }, dirty: true, released: 0, frame: 0 };
    window.addEventListener("keydown", onKey, true);
    if (mode === "keyboard") {
      window.addEventListener("pointerdown", onOutside, true);
      window.addEventListener("focusin", onOutside, true);
    }
    emit();
    say(host.msg.lifted, id, from, mode === "keyboard");
    host.onSortStart?.({ item: id, from });
    return drag;
  };

  const teardown = (d: Drag) => {
    cancelAnimationFrame(d.frame);
    window.removeEventListener("keydown", onKey, true);
    window.removeEventListener("pointerdown", onOutside, true);
    window.removeEventListener("focusin", onOutside, true);
    if (d.mode === "pointer") {
      document.documentElement.style.userSelect = userSelect;
      document.documentElement.style.removeProperty("-webkit-user-select");
    }
  };

  function end(canceled: boolean) {
    const d = drag;
    if (!d) return;
    const el = items.get(d.item)?.el;
    if (d.mode === "pointer" && el) {
      // Đo chỗ đang thả trước khi bỏ transform để mục trượt về chỗ của nó.
      (firstRects ??= new Map()).set(d.item, el.getBoundingClientRect());
      el.style.transform = "";
    }
    teardown(d);
    drag = null;
    let to = locate(value, d.item) ?? d.from;
    if (canceled && !sameValue(value, d.snapshot)) {
      measure(Object.keys(value));
      if (d.mode === "keyboard") focusAfter = { item: d.item, el: d.focus, target: "handle" };
      commit(d.snapshot);
      to = d.from;
    } else {
      emit();
      flip();
    }
    const msg = host.msg;
    say(canceled ? msg.canceled : to.list !== d.from.list ? msg.droppedIn : msg.dropped, d.item, to, d.mode === "keyboard");
    host.onSortEnd?.({ item: d.item, from: d.from, to, canceled });
  }

  const stopSession = () => {
    const s = session;
    if (!s) return;
    clearTimeout(s.timer);
    session = null;
    window.removeEventListener("pointermove", onPointerMove, true);
    window.removeEventListener("pointerup", onPointerUp, true);
    window.removeEventListener("pointercancel", onPointerCancel, true);
    window.removeEventListener("touchmove", blockTouch);
    window.removeEventListener("contextmenu", blockContextMenu, true);
    if (s.dragged) {
      // Cú click theo sau lần kéo không được bấm tay nắm / mục (Tag sẽ bị gỡ, menu item bị tích).
      const stop = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      window.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", stop, true), 100);
    }
  };

  const activate = (s: PointerSession, x: number, y: number) => {
    const el = items.get(s.item)?.el;
    if (!el) return stopSession();
    flips.get(el)?.cancel();
    const r = el.getBoundingClientRect();
    const d = start(s.item, "pointer", null);
    if (!d) return stopSession();
    s.dragged = true;
    clearTimeout(s.timer);
    Object.assign(d, { x, y, grabX: s.x - r.left, grabY: s.y - r.top });
    const rootStyle = document.documentElement.style;
    userSelect = rootStyle.userSelect;
    rootStyle.userSelect = "none";
    rootStyle.setProperty("-webkit-user-select", "none");
    window.getSelection()?.removeAllRanges();
    d.frame = requestAnimationFrame(frame);
  };

  function onPointerMove(event: PointerEvent) {
    const s = session;
    if (!s || event.pointerId !== s.id) return;
    if (!s.dragged) {
      const dist = Math.hypot(event.clientX - s.x, event.clientY - s.y);
      if (s.longPress) {
        if (dist > TOLERANCE) stopSession();
      } else if (dist >= DISTANCE) activate(s, event.clientX, event.clientY);
      return;
    }
    if (drag?.mode === "pointer") {
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.dirty = true;
    }
  }

  /**
   * Nhả chuột: tính chỗ thả theo vị trí cuối của con trỏ (cú kéo nhanh có thể chưa qua khung hình nào ở đó), chờ thứ tự
   * mới vào DOM (afterCommit gọi lại) rồi mới kết thúc. Vài vòng là đủ; ứng dụng không render lại thì vẫn kết thúc.
   */
  const release = (d: Drag) => {
    if (drag !== d) return;
    if (!awaiting && d.released < 4) {
      follow(d);
      evaluate(d);
    }
    d.released++;
    if (awaiting && d.released < 4) {
      if (d.released === 1) setTimeout(() => drag === d && end(false), 500);
      return;
    }
    end(false);
  };

  function onPointerUp(event: PointerEvent) {
    if (!session || event.pointerId !== session.id) return;
    if (drag?.mode === "pointer") {
      drag.x = event.clientX;
      drag.y = event.clientY;
      release(drag);
    }
    stopSession();
  }

  function onPointerCancel(event: PointerEvent) {
    if (!session || event.pointerId !== session.id) return;
    if (drag?.mode === "pointer") end(true);
    stopSession();
  }

  /** Đang kéo bằng ngón tay: chặn cuộn trang (touch-action chỉ có tác dụng ở tay nắm riêng). */
  function blockTouch(event: TouchEvent) {
    if (drag?.mode === "pointer" || session?.dragged) event.preventDefault();
  }

  function blockContextMenu(event: Event) {
    event.preventDefault();
  }

  const pointerDown = (event: PointerEvent, id: string, onItem: boolean) => {
    if (drag || session || event.button !== 0 || !event.isPrimary) return;
    const at = locate(value, id);
    if (!at || lists.get(at.list)?.disabled) return;
    const touch = event.pointerType === "touch";
    const s: PointerSession = { item: id, id: event.pointerId, x: event.clientX, y: event.clientY, longPress: touch && onItem, dragged: false };
    session = s;
    if (s.longPress) {
      s.timer = setTimeout(() => session === s && activate(s, s.x, s.y), LONG_PRESS);
      window.addEventListener("contextmenu", blockContextMenu, true);
    }
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerCancel, true);
    if (touch) window.addEventListener("touchmove", blockTouch, { passive: false });
  };

  /* ---------------------------------------------------------- API cho component */
  return {
    instructionsId: "",
    sync(next: Host) {
      host = next;
      value = next.value;
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    modeOf: (id: string): DragMode | null => (drag?.item === id ? drag.mode : null),
    isOver: (list: string) => !!drag && locate(value, drag.item)?.list === list,
    isLifted: () => drag?.mode === "keyboard",
    setList(id: string, reg: ListReg | null) {
      if (reg) lists.set(id, reg);
      else lists.delete(id);
    },
    setItem(id: string, patch: Partial<ItemReg>, prev?: HTMLElement | null) {
      const reg = itemReg(id);
      // Mục chuyển danh sách bị gỡ rồi gắn lại: chỉ xoá khi phần tử đang đăng ký đúng là phần tử vừa gỡ.
      if ("el" in patch && !patch.el && reg.el !== prev) return;
      if ("handle" in patch && !patch.handle && reg.handle !== prev) return;
      Object.assign(reg, patch);
      if (!reg.el && !reg.handle) items.delete(id);
    },
    pointerDown,
    /** Space / Enter trên tay nắm. */
    lift(id: string, focus: HTMLElement) {
      start(id, "keyboard", focus);
    },
    /** Bấm tay nắm: nhấc mục lên; đang nhấc thì thả, hoặc đặt mục đang nhấc vào chỗ của mục được bấm. */
    click(id: string, el: HTMLElement) {
      const d = drag;
      if (!d) return void start(id, "keyboard", el);
      if (d.mode !== "keyboard") return;
      if (d.item !== id) {
        const to = locate(value, id);
        if (to && move(d.item, to)) focusAfter = { item: id, el, target: "handle" };
      }
      end(false);
    },
    /** Alt + phím mũi tên trên mục `shortcuts`: di chuyển ngay, không cần nhấc lên. */
    shortcut(event: React.KeyboardEvent<HTMLElement>, id: string) {
      if (drag || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !event.key.startsWith("Arrow")) return;
      const from = locate(value, id);
      if (!from || !targetFor(id, event.key)) return;
      event.preventDefault();
      if (!keyMove(id, event.key, event.currentTarget, "item")) return;
      host.onSortEnd?.({ item: id, from, to: locate(value, id)!, canceled: false });
    },
    /** Sau mỗi lần render của nhóm (thứ tự mới đã vào DOM). */
    afterCommit() {
      awaiting = false;
      flip();
      if (drag?.mode === "pointer") {
        follow(drag);
        drag.dirty = true;
        if (drag.released) release(drag);
      }
      const f = focusAfter;
      focusAfter = null;
      if (!f) return;
      const reg = items.get(f.item);
      const target = (f.el?.isConnected ? f.el : null) ?? (f.target === "handle" ? reg?.handle : reg?.el);
      if (!target) return;
      if (target.ownerDocument.activeElement !== target) target.focus({ preventScroll: true });
      target.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    },
    dispose() {
      if (drag) teardown(drag);
      drag = null;
      stopSession();
    },
  };
}

type Engine = ReturnType<typeof createEngine>;

const EngineContext = React.createContext<Engine | null>(null);
const ListContext = React.createContext<{ listId: string; orientation: SortableOrientation }>({ listId: "", orientation: "vertical" });
const ItemContext = React.createContext<{ value: string; label?: string; disabled: boolean } | null>(null);

function useEngine(part: string) {
  const engine = React.useContext(EngineContext);
  if (!engine) throw new Error(`${part} phải nằm trong Sortable hoặc SortableGroup.`);
  return engine;
}

/* ------------------------------------------------------------------ SortableGroup */
export interface SortableGroupProps {
  /** Thứ tự của mọi danh sách, theo `listId` của từng Sortable bên trong. */
  value: SortableGroupValue;
  /** Gọi mỗi lần thứ tự đổi, kể cả giữa lúc kéo; Esc trả lại giá trị lúc bắt đầu. */
  onValueChange: (value: Record<string, string[]>) => void;
  onSortStart?: (data: SortableStartData) => void;
  /** Một lần cho mỗi lần kéo, nhấc bằng bàn phím hay phím tắt: lúc này mới lưu thứ tự. */
  onSortEnd?: (data: SortableEndData) => void;
  children?: React.ReactNode;
}

/** Nhiều Sortable (cột Kanban) dùng chung một lần kéo: mục đi được từ danh sách này sang danh sách khác. */
export function SortableGroup({ value, onValueChange, onSortStart, onSortEnd, children }: SortableGroupProps) {
  const msg = useYugenMessages("sortable", sortableMessagesEn);
  const { announce } = useAnnounce();
  const [engine] = React.useState(createEngine);
  const instructionsId = `${React.useId()}-sortable`;
  engine.instructionsId = instructionsId;
  engine.sync({ value, onValueChange, onSortStart, onSortEnd, msg, announce });

  useIsomorphicLayoutEffect(() => engine.afterCommit());
  React.useEffect(() => () => engine.dispose(), [engine]);

  // Hướng dẫn bàn phím (mô tả của tay nắm) nằm ở <body>: Sortable có thể là <ul> hay <tbody>, không chứa được <div>.
  React.useEffect(() => {
    const el = document.createElement("div");
    el.id = instructionsId;
    el.hidden = true;
    el.textContent = msg.instructions;
    document.body.appendChild(el);
    return () => el.remove();
  }, [instructionsId, msg.instructions]);

  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}

/* ------------------------------------------------------------------ Sortable */
export interface SortableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gắn hành vi lên phần tử con duy nhất (List, `<ul>`, `<tbody>`…) thay vì render `<div>`. */
  asChild?: boolean;
  /** Thứ tự mục (id của các SortableItem). Bỏ trống khi nằm trong SortableGroup. */
  value?: readonly string[];
  /** Gọi mỗi lần thứ tự đổi, kể cả giữa lúc kéo; Esc trả lại giá trị lúc bắt đầu. */
  onValueChange?: (value: string[]) => void;
  onSortStart?: (data: SortableStartData) => void;
  /** Một lần cho mỗi lần kéo, nhấc bằng bàn phím hay phím tắt: lúc này mới lưu thứ tự. */
  onSortEnd?: (data: SortableEndData) => void;
  /** Khoá của danh sách trong `value` của SortableGroup. */
  listId?: string;
  /** vertical: ↑ ↓ · horizontal: ← → (đảo trong RTL) · grid: cả bốn phím, mục xuống dòng. */
  orientation?: SortableOrientation;
  /** Tên danh sách trong thông báo khi mục chuyển danh sách. Mặc định aria-label / aria-labelledby. */
  label?: string;
  /** Không kéo mục trong danh sách này và không thả mục khác vào. */
  disabled?: boolean;
}

/** Danh sách sắp xếp được. Đứng riêng thì truyền `value` / `onValueChange`; trong SortableGroup thì truyền `listId`. */
export const Sortable = React.forwardRef<HTMLDivElement, SortableProps>(
  ({ value, onValueChange, onSortStart, onSortEnd, ...props }, ref) => {
    const listId = props.listId ?? "";
    const groupValue = React.useMemo(() => ({ [listId]: value ?? [] }), [listId, value]);
    if (value === undefined) return <SortableList ref={ref} {...props} />;
    return (
      <SortableGroup
        value={groupValue}
        onValueChange={(next) => onValueChange?.(next[listId])}
        onSortStart={onSortStart}
        onSortEnd={onSortEnd}
      >
        <SortableList ref={ref} {...props} />
      </SortableGroup>
    );
  },
);
Sortable.displayName = "Sortable";

const SortableList = React.forwardRef<HTMLDivElement, Omit<SortableProps, "value" | "onValueChange" | "onSortStart" | "onSortEnd">>(
  ({ asChild, listId = "", orientation = "vertical", label, disabled = false, ...props }, ref) => {
    const engine = useEngine("Sortable");
    const elRef = React.useRef<HTMLDivElement | null>(null);
    const composed = useComposedRefs(ref, elRef);
    const over = React.useSyncExternalStore(engine.subscribe, () => engine.isOver(listId), () => false);

    useIsomorphicLayoutEffect(() => {
      engine.setList(listId, { el: elRef.current, orientation, label, disabled });
      return () => engine.setList(listId, null);
    }, [engine, listId, orientation, label, disabled]);

    const context = React.useMemo(() => ({ listId, orientation }), [listId, orientation]);
    const Comp = asChild ? Slot : "div";
    return (
      <ListContext.Provider value={context}>
        <Comp
          ref={composed}
          data-sortable-list=""
          data-orientation={orientation}
          data-over={over || undefined}
          data-disabled={disabled || undefined}
          {...props}
        />
      </ListContext.Provider>
    );
  },
);
SortableList.displayName = "SortableList";

/* ------------------------------------------------------------------ SortableItem */
export interface SortableItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Id của mục, có trong `value` của danh sách. */
  value: string;
  /** Gắn hành vi lên phần tử con duy nhất (ListItem, `<li>`, `<tr>`, Card…) thay vì render `<div>`. */
  asChild?: boolean;
  /** Tên mục trong thông báo và nhãn tay nắm. Mặc định là chữ trong mục. */
  label?: string;
  /** Tay nắm của mục bị tắt; mục vẫn bị đẩy chỗ khi mục khác đi qua. */
  disabled?: boolean;
  /**
   * Cả mục là tay nắm khi kéo bằng chuột / cảm ứng (cảm ứng: giữ một lúc rồi kéo, vuốt nhanh vẫn cuộn trang). Bấm không
   * kéo vẫn là bấm. Hợp với mục đã có việc riêng cho Space / Enter (menu item, Tag) — dùng kèm `shortcuts`.
   */
  handle?: boolean;
  /** Alt + phím mũi tên trên mục di chuyển ngay, không cần nhấc lên (mục trong menu, toolbar, listbox). */
  shortcuts?: boolean;
}

const SHORTCUTS: Record<SortableOrientation, string> = {
  vertical: "Alt+ArrowUp Alt+ArrowDown",
  horizontal: "Alt+ArrowLeft Alt+ArrowRight",
  grid: "Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown",
};

export const SortableItem = React.forwardRef<HTMLDivElement, SortableItemProps>(
  (
    { value, asChild, label, disabled = false, handle = false, shortcuts = false, className, onPointerDown, onKeyDown, ...props },
    ref,
  ) => {
    const engine = useEngine("SortableItem");
    const { orientation } = React.useContext(ListContext);
    const dragging = React.useSyncExternalStore(engine.subscribe, () => engine.modeOf(value), () => null);
    const elRef = React.useRef<HTMLElement | null>(null);
    const register = React.useCallback(
      (el: HTMLDivElement | null) => {
        engine.setItem(value, { el }, elRef.current);
        elRef.current = el;
      },
      [engine, value],
    );
    const composed = useComposedRefs(ref, register);
    useIsomorphicLayoutEffect(() => engine.setItem(value, { label }), [engine, value, label]);

    const context = React.useMemo(() => ({ value, label, disabled }), [value, label, disabled]);
    const Comp = asChild ? Slot : "div";
    return (
      <ItemContext.Provider value={context}>
        <Comp
          ref={composed}
          data-sortable-item=""
          data-dragging={dragging ?? undefined}
          aria-keyshortcuts={shortcuts && !disabled ? SHORTCUTS[orientation] : undefined}
          className={cn(
            className,
            handle && !disabled && "select-none [-webkit-touch-callout:none]",
            dragging && "z-10 shadow-16",
            dragging === "pointer" && "cursor-grabbing",
          )}
          onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
            onPointerDown?.(event);
            if (handle && !disabled && !event.defaultPrevented) engine.pointerDown(event.nativeEvent, value, true);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(event);
            if (shortcuts && !disabled && !event.defaultPrevented) engine.shortcut(event, value);
          }}
          {...props}
        />
      </ItemContext.Provider>
    );
  },
);
SortableItem.displayName = "SortableItem";

/* ------------------------------------------------------------------ SortableHandle */
export interface SortableHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Dùng phần tử con làm tay nắm (vd. Button của bạn). Mặc định là nút icon chấm kéo. */
  asChild?: boolean;
}

/**
 * Tay nắm của SortableItem: kéo bằng chuột / cảm ứng, hoặc focus rồi Space / Enter để nhấc lên. Nhãn mặc định
 * "Sắp xếp lại {label}"; hướng dẫn bàn phím là mô tả của nút.
 */
export const SortableHandle = React.forwardRef<HTMLButtonElement, SortableHandleProps>(
  ({ asChild, className, children, disabled, onPointerDown, onKeyDown, onClick, ...props }, ref) => {
    const engine = useEngine("SortableHandle");
    const item = React.useContext(ItemContext);
    if (!item) throw new Error("SortableHandle phải nằm trong SortableItem.");
    const msg = useYugenMessages("sortable", sortableMessagesEn);
    const dragging = React.useSyncExternalStore(engine.subscribe, () => engine.modeOf(item.value), () => null);
    const elRef = React.useRef<HTMLButtonElement | null>(null);
    const register = React.useCallback(
      (el: HTMLButtonElement | null) => {
        engine.setItem(item.value, { handle: el }, elRef.current);
        elRef.current = el;
      },
      [engine, item.value],
    );
    const composed = useComposedRefs(ref, register);
    const off = disabled || item.disabled;
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={composed}
        type={asChild ? undefined : "button"}
        data-sortable-handle=""
        disabled={off}
        aria-label={item.label ? fill(msg.handleItem, { item: item.label }) : msg.handle}
        aria-describedby={engine.instructionsId}
        aria-pressed={dragging === "keyboard"}
        className={cn(
          "inline-flex size-6 shrink-0 touch-none select-none items-center justify-center rounded-medium text-foreground-3",
          "transition-colors duration-faster ease-easy-ease [&>svg]:size-5",
          off
            ? "cursor-not-allowed text-foreground-disabled"
            : "cursor-grab hover:bg-subtle-hover hover:text-foreground-2 active:cursor-grabbing",
          className,
        )}
        onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerDown?.(event);
          if (!off && !event.defaultPrevented) engine.pointerDown(event.nativeEvent, item.value, false);
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(event);
          if (off || event.defaultPrevented || event.repeat || engine.isLifted()) return;
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            engine.lift(item.value, event.currentTarget);
          }
        }}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          // detail 0: click sinh ra từ bàn phím — onKeyDown đã xử lý.
          if (!off && !event.defaultPrevented && event.detail > 0) engine.click(item.value, event.currentTarget);
        }}
        {...props}
      >
        {children ?? <ReOrderDotsVertical20Regular aria-hidden />}
      </Comp>
    );
  },
);
SortableHandle.displayName = "SortableHandle";
