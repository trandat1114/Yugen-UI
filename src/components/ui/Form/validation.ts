import type { FormMessages } from "./messages";

/** Lỗi theo tên control: một chuỗi hoặc danh sách (hiện chuỗi đầu tiên); null / chuỗi rỗng = không lỗi. */
export type FormErrors = Partial<Record<string, string | readonly string[] | null>>;

const EMPTY: Readonly<Record<string, string>> = Object.freeze({});

/** Mỗi tên một thông báo (chuỗi đầu tiên), bỏ giá trị rỗng. */
export function normalizeErrors(errors: FormErrors | null | undefined): Readonly<Record<string, string>> {
  if (!errors) return EMPTY;
  let out: Record<string, string> | undefined;
  for (const [name, value] of Object.entries(errors)) {
    const message = typeof value === "string" ? value : value?.find((item) => !!item);
    if (message) (out ??= {})[name] = message;
  }
  return out ?? EMPTY;
}

export function sameErrors(a: Readonly<Record<string, string>>, b: Readonly<Record<string, string>>): boolean {
  if (a === b) return true;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}

/** Thông báo `required` theo loại control (checkbox, select / radio, file, còn lại). */
export function requiredMessage(control: unknown, m: FormMessages): string {
  const type = (control as { type?: unknown } | null | undefined)?.type;
  if (type === "checkbox") return m.requiredCheckbox;
  if (type === "radio" || type === "select-one" || type === "select-multiple") return m.requiredSelect;
  if (type === "file") return m.requiredFile;
  return m.required;
}

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const TEXT_TYPES = new Set(["text", "search", "url", "tel", "email", "password", "textarea"]);

/** Thông báo cho một control không qua ràng buộc của nó, hoặc undefined khi hợp lệ. */
export function constraintMessage(control: Control, m: FormMessages): string | undefined {
  const v = control.validity;
  if (v.customError) return control.validationMessage;
  if (v.valueMissing) return requiredMessage(control, m);
  if (v.typeMismatch) return control.type === "email" ? m.typeEmail : control.type === "url" ? m.typeUrl : m.invalid;
  if (v.badInput) return m.invalid;
  if (v.patternMismatch) return m.pattern;
  // Trình duyệt chỉ báo tooShort / tooLong sau khi người dùng sửa giá trị; giá trị có sẵn (defaultValue) cũng được kiểm.
  if (TEXT_TYPES.has(control.type) && control.value) {
    const { minLength, maxLength } = control as HTMLInputElement;
    const length = control.value.length;
    if (v.tooShort || (minLength > 0 && length < minLength)) return m.tooShort(minLength, length);
    if (v.tooLong || (maxLength >= 0 && length > maxLength)) return m.tooLong(maxLength, length);
  }
  if (v.rangeUnderflow) return m.rangeUnderflow((control as HTMLInputElement).min);
  if (v.rangeOverflow) return m.rangeOverflow((control as HTMLInputElement).max);
  return v.valid ? undefined : m.invalid;
}

/** Lỗi ràng buộc của các control trong form, mỗi tên một thông báo, theo thứ tự trong form. `only`: chỉ tên này. */
export function constraintErrors(form: HTMLFormElement, m: FormMessages, only?: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const element of Array.from(form.elements)) {
    const control = element as Control;
    const name = control.name;
    if (!name || (only !== undefined && name !== only) || Object.hasOwn(out, name) || !control.willValidate) continue;
    const message = constraintMessage(control, m);
    if (message) out[name] = message;
  }
  return out;
}
