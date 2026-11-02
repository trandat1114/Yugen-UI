import * as React from "react";

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
/** Chỗ giữ tạm khi localStorage không dùng được (chế độ riêng tư cũ, hết dung lượng, bị chặn): vẫn chạy trong phiên. */
const memory = new Map<string, string>();

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // truy cập localStorage có thể ném lỗi khi bị chặn cookie / site data
  }
}

function readRaw(key: string): string | null {
  // Bộ nhớ tạm chỉ có mục khi lần ghi vào localStorage thất bại → nó mới hơn bản đã lưu.
  const pending = memory.get(key);
  if (pending !== undefined) return pending;
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeRaw(key: string, raw: string | null) {
  try {
    const store = storage();
    if (store) {
      if (raw === null) store.removeItem(key);
      else store.setItem(key, raw);
      memory.delete(key);
    } else if (raw === null) memory.delete(key);
    else memory.set(key, raw);
  } catch {
    if (raw === null) memory.delete(key);
    else memory.set(key, raw);
  }
  // Sự kiện `storage` chỉ bắn ở các tab khác; tab hiện tại tự báo cho mọi hook cùng khoá.
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: Listener) {
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(listener);
  const onStorage = (e: StorageEvent) => {
    // key === null: tab khác gọi localStorage.clear().
    if (e.key === key || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    set.delete(listener);
    if (!set.size) listeners.delete(key);
    window.removeEventListener("storage", onStorage);
  };
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback; // giá trị không phải JSON (do app khác ghi) → dùng giá trị ban đầu
  }
}

/** `[value, setValue, remove]`. */
export type UseLocalStorageResult<T> = [T, (next: React.SetStateAction<T>) => void, () => void];

/**
 * State lưu vào `localStorage` dưới dạng JSON, an toàn cho SSR và đồng bộ giữa các tab.
 * - Server và lần render hydrate đầu tiên dùng `initialValue`, sau đó mới đọc giá trị đã lưu — không lệch HTML.
 * - Mọi hook cùng khoá trong trang và mọi tab khác đều cập nhật khi giá trị đổi.
 * - Không dùng được localStorage (bị chặn, đầy) thì vẫn chạy trong bộ nhớ tới khi tải lại trang.
 *
 * ```ts
 * const [sidebarOpen, setSidebarOpen, resetSidebar] = useLocalStorage("sidebar-open", true);
 * ```
 *
 * Trả về `[value, setValue, remove]`; `remove()` xoá khoá và đưa về `initialValue`.
 */
export function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageResult<T> {
  const initial = React.useRef(initialValue);
  const sub = React.useCallback((listener: Listener) => subscribe(key, listener), [key]);
  const raw = React.useSyncExternalStore(
    sub,
    () => readRaw(key),
    () => null,
  );
  // `raw` là chuỗi (so sánh theo giá trị) nên object parse ra giữ nguyên identity tới khi dữ liệu lưu thật sự đổi.
  const value = React.useMemo(() => parse(raw, initial.current), [raw]);

  const set = React.useCallback(
    (next: React.SetStateAction<T>) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(parse(readRaw(key), initial.current)) : next;
      writeRaw(key, JSON.stringify(resolved));
    },
    [key],
  );
  const remove = React.useCallback(() => writeRaw(key, null), [key]);

  return [value, set, remove];
}
