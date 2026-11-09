import * as React from "react";
import { warnDeprecated } from "@/lib/deprecate";

/**
 * Store của Toast (#346): `toast()`, `dismissToast()`, `useToast()` và dữ liệu cho Toaster, không kèm UI. Tách khỏi
 * `Toast.tsx` để code chỉ gọi `toast()` (Loading, form…) không kéo theo `@radix-ui/react-toast`, và để YugenProvider nạp
 * Toaster lúc cần: store ở cấp module nên toast gọi trước khi Toaster nạp xong vẫn hiện khi nó mount.
 */
export type ToastIntent = "info" | "success" | "warning" | "error";

export interface ToastActionOptions {
  label: string;
  /** Mô tả thay thế cho trình đọc màn hình (cách thực hiện hành động bằng bàn phím). Mặc định = label. */
  altText?: string;
  onClick?: () => void;
}

export interface ToastOptions {
  /** id tuỳ chọn; trùng id sẽ thay thế toast cũ. */
  toastId?: string;
  intent?: ToastIntent;
  title?: React.ReactNode;
  body?: React.ReactNode;
  action?: ToastActionOptions;
  /** Thời gian tự đóng (ms). `-1` = không tự đóng. Mặc định 3000. */
  timeout?: number;
  /** Hiện nút đóng (X). Mặc định true. */
  dismissible?: boolean;
  /** @deprecated Use `dismissible: false`. Will be removed in v1.0.0. */
  hideDismiss?: boolean;
  /** Toaster đích; bỏ trống = Toaster mặc định (không có toasterId). */
  toasterId?: string;
  onDismiss?: () => void;
}

/** Một toast trong store (nội bộ, Toaster đọc qua `subscribeToasts` / `getToastSnapshot`). */
export interface ToastRecord extends ToastOptions {
  id: string;
  open: boolean;
}

let records: ToastRecord[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const REMOVE_DELAY = 1000; // giữ record đủ lâu cho animation đóng chạy xong

function emit() {
  for (const listener of listeners) listener();
}

/** Nội bộ (Toaster): đăng ký nghe thay đổi của store. */
export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Nội bộ (Toaster): danh sách toast hiện tại; cũng là snapshot phía server. */
export function getToastSnapshot() {
  return records;
}

/**
 * Hiển thị toast; trả về id để đóng sau.
 * @deprecated Use `toast(options)` or `useToast(toasterId).dispatchToast(options)`. Will be removed from the package
 * exports in v1.0.0.
 */
export function dispatchToast(options: ToastOptions): string {
  warnDeprecated("dispatchToast", "use toast() or useToast().dispatchToast", "1.0.0");
  return showToast(options);
}

function showToast(options: ToastOptions): string {
  if (options.hideDismiss !== undefined) warnDeprecated("ToastOptions.hideDismiss", "use dismissible: false", "1.0.0");
  const id = options.toastId ?? `toast-${++counter}`;
  records = [...records.filter((t) => t.id !== id), { ...options, id, open: true }];
  emit();
  return id;
}

/** Đóng một toast theo id. */
export function dismissToast(id: string) {
  const target = records.find((t) => t.id === id);
  if (!target || !target.open) return;
  records = records.map((t) => (t.id === id ? { ...t, open: false } : t));
  emit();
  target.onDismiss?.();
  window.setTimeout(() => {
    records = records.filter((t) => t.id !== id || t.open);
    emit();
  }, REMOVE_DELAY);
}

/** Đóng mọi toast (của một Toaster nếu truyền toasterId). */
export function dismissAllToasts(toasterId?: string) {
  for (const t of records) {
    if (toasterId === undefined || t.toasterId === toasterId) dismissToast(t.id);
  }
}

/** Helper tĩnh: `toast({ intent: "success", title: "Đã lưu" })` → Toaster mặc định. */
export function toast(options: ToastOptions) {
  return showToast(options);
}

/** API mệnh lệnh kiểu Fluent `useToastController(toasterId)`. */
export function useToast(toasterId?: string) {
  return React.useMemo(
    () => ({
      dispatchToast: (options: ToastOptions) => showToast({ toasterId, ...options }),
      dismissToast,
      dismissAllToasts: () => dismissAllToasts(toasterId),
    }),
    [toasterId],
  );
}
