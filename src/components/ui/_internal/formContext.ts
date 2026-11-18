import * as React from "react";

/**
 * Context chung của Form (gốc) và HookForm (`yugen-ui/form`, #162): Field đọc lỗi theo `name`, FormErrorSummary liệt kê
 * lỗi, Button `type="submit"` hiện trạng thái đang gửi. Ở `_internal` để Field / Button không kéo theo Form, và để gốc gói
 * không import react-hook-form. Chỉ dùng nội bộ — không export qua barrel.
 */

/** Nhãn và id control mà Field đăng ký cho `name` của control (link của FormErrorSummary, focus). */
export interface FormFieldEntry {
  label?: React.ReactNode;
  id: string;
}

export interface FormFieldRegistry {
  get(): ReadonlyMap<string, FormFieldEntry>;
  subscribe(listener: () => void): () => void;
  /** Đăng ký; trả về hàm gỡ. Thứ tự là thứ tự mount (thứ tự của Field trong form). */
  set(name: string, entry: FormFieldEntry): () => void;
}

/** Store nhỏ cho useSyncExternalStore: Field đăng ký không làm cả form render lại, chỉ FormErrorSummary. */
export function createFieldRegistry(): FormFieldRegistry {
  let fields: ReadonlyMap<string, FormFieldEntry> = new Map();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    get: () => fields,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set(name, entry) {
      fields = new Map(fields).set(name, entry);
      emit();
      return () => {
        if (fields.get(name) !== entry) return;
        const next = new Map(fields);
        next.delete(name);
        fields = next;
        emit();
      };
    },
  };
}

export interface FormContextValue {
  /** Lỗi theo tên control, đã gộp (kiểm tra ở client, action / resolver, prop `errors`). */
  errors: Readonly<Record<string, string>>;
  /** Tăng 1 mỗi khi một lần gửi kết thúc (kiểm tra ở client không qua, action trả về, react-hook-form gửi xong). */
  attempt: number;
  fields: FormFieldRegistry;
  /** Phần tử control của `name` trong form (để focus, đọc nhãn), hoặc null. */
  control(name: string): HTMLElement | null;
}

export const FormContext = React.createContext<FormContextValue | null>(null);

/** Lỗi của `name` (chỉ khoá riêng: control tên "constructor" không đọc nhầm Object.prototype). */
export const errorOf = (errors: Readonly<Record<string, string>>, name: string): string | undefined =>
  Object.hasOwn(errors, name) ? errors[name] : undefined;

/**
 * Đang gửi, cho Button `type="submit"`: undefined ngoài Form / HookForm (Button không tự đổi), HookForm: `isSubmitting`,
 * Form: false (Button cộng thêm `useFormStatus()` của React 19).
 */
export const FormPendingContext = React.createContext<boolean | undefined>(undefined);

const FOCUSABLE =
  'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusable = (el: Element): el is HTMLElement =>
  el.matches(FOCUSABLE) && (el as HTMLElement).tabIndex !== -1 && el.getAttribute("aria-hidden") !== "true";

/**
 * Control của `name`: phần tử có id mà Field đăng ký, không thì phần tử form đầu tiên mang tên đó (radio đang chọn trước).
 * Gốc của nhóm (RadioGroup, Rating…) không focus được thì lấy phần tử focus được đầu tiên bên trong.
 */
export function controlOf(form: HTMLFormElement, name: string, fields: ReadonlyMap<string, FormFieldEntry>): HTMLElement | null {
  const id = fields.get(name)?.id;
  let el: Element | null = id ? form.ownerDocument.getElementById(id) : null;
  if (!el) {
    const item = form.elements.namedItem(name);
    if (item && !(item instanceof Element)) {
      const radios = Array.from(item as RadioNodeList) as HTMLInputElement[];
      el = radios.find((radio) => radio.checked) ?? radios[0] ?? null;
    } else el = item;
  }
  if (!el) return null;
  if (focusable(el)) return el;
  return Array.from(el.querySelectorAll(FOCUSABLE)).find(focusable) ?? null;
}

/** Tên lỗi có control đứng đầu trong form (thứ tự tài liệu), hoặc undefined khi không lỗi nào có control. */
export function firstInvalid(names: readonly string[], control: (name: string) => HTMLElement | null): string | undefined {
  let first: { name: string; el: HTMLElement } | undefined;
  for (const name of names) {
    const el = control(name);
    if (el && (!first || first.el.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)) first = { name, el };
  }
  return first?.name;
}
