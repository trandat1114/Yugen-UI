import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useComposedRefs } from "../_internal/composeRefs";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { Input, type InputProps } from "@/components/ui/Input/Input";
import { useYugen } from "../YugenProvider/context";

export type FormattedInputFormat = "phone" | "card" | "currency";

/** Cách một định dạng đọc chữ gõ và hiển thị giá trị thô. */
interface Engine {
  /** Ký tự thuộc giá trị thô (chữ số; currency thêm dấu thập phân của locale). */
  isSignificant: (char: string) => boolean;
  /** Chữ trong ô → giá trị thô (chưa chuẩn hoá). */
  parse: (text: string) => string;
  /** Cắt độ dài, bỏ số 0 thừa… */
  normalize: (raw: string) => string;
  format: (raw: string) => string;
  /** Currency: số chữ số thập phân của đồng tiền (USD 2, VND 0). */
  fractionDigits?: number;
}

/* ------------------------------------------------------------------ Mask (phone, card) */

const DIGIT = /^\d$/;
const digitsOf = (text: string) => text.replace(/\D/g, "");

/** Điền giá trị thô vào mask (`#` = một chữ số); ký tự khác chỉ chèn khi đã có chữ số đứng sau. */
export function applyMask(raw: string, mask: string): string {
  let out = "";
  let i = 0;
  for (const ch of mask) {
    if (i >= raw.length) break;
    if (ch === "#") out += raw[i++];
    else out += ch;
  }
  return out;
}

const PHONE_MASKS: Record<string, string> = {
  US: "(###) ###-####",
  CA: "(###) ###-####",
  VN: "#### ### ###",
  GB: "##### ######",
  FR: "## ## ## ## ##",
  JP: "###-####-####",
};
const DEFAULT_PHONE_MASK = "### ### ### ###";

/** Mask số điện thoại theo vùng của locale (en-US → "(###) ###-####", vi-VN → "#### ### ###"). */
export function getPhoneMask(locale: string): string {
  let region: string | undefined;
  try {
    region = new Intl.Locale(locale).maximize().region;
  } catch {
    region = undefined;
  }
  return (region && PHONE_MASKS[region]) || DEFAULT_PHONE_MASK;
}

/** Mask số thẻ theo đầu số: American Express 4-6-5, Diners Club 4-6-4, còn lại nhóm 4 (tối đa 19 số). */
export function getCardMask(digits: string): string {
  if (/^3[47]/.test(digits)) return "#### ###### #####";
  if (/^3(0[0-5]|[689])/.test(digits)) return "#### ###### ####";
  return "#### #### #### #### ###";
}

const slots = (mask: string) => mask.split("#").length - 1;

function maskEngine(maskFor: (digits: string) => string): Engine {
  return {
    isSignificant: (c) => DIGIT.test(c),
    parse: digitsOf,
    normalize: (raw) => raw.slice(0, slots(maskFor(raw))),
    format: (raw) => applyMask(raw, maskFor(raw)),
  };
}

/* ------------------------------------------------------------------ Currency */

const MAX_INTEGER_DIGITS = 15;

function currencyEngine(locale: string, currency: string): Engine {
  // Mã tiền tệ sai → định dạng số thường thay vì lỗi khi render.
  let options: Intl.NumberFormatOptions = { style: "currency", currency, numberingSystem: "latn" };
  let fractionDigits: number;
  try {
    fractionDigits = new Intl.NumberFormat(locale, options).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    options = { numberingSystem: "latn" };
    fractionDigits = 2;
  }
  const whole = new Intl.NumberFormat(locale, { ...options, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat(locale, { numberingSystem: "latn" }).formatToParts(1.5).find((p) => p.type === "decimal")?.value ?? ".";

  return {
    fractionDigits,
    isSignificant: (c) => DIGIT.test(c) || (fractionDigits > 0 && c === decimal),
    parse: (text) => {
      let out = "";
      let dot = false;
      for (const c of text) {
        if (DIGIT.test(c)) out += c;
        else if (c === decimal && fractionDigits > 0 && !dot) {
          out += ".";
          dot = true;
        }
      }
      return out;
    },
    normalize: (raw) => {
      if (!raw) return "";
      const [int = "", frac] = raw.split(".");
      const intPart = int.replace(/^0+(?=\d)/, "").slice(0, MAX_INTEGER_DIGITS);
      return frac === undefined ? intPart : `${intPart || "0"}.${frac.slice(0, fractionDigits)}`;
    },
    format: (raw) => {
      if (!raw) return "";
      const [int = "", frac] = raw.split(".");
      const parts = whole.formatToParts(Number(int || "0"));
      let last = -1;
      parts.forEach((p, i) => {
        if (p.type === "integer") last = i;
      });
      return parts.map((p, i) => (i === last && frac !== undefined ? `${p.value}${decimal}${frac}` : p.value)).join("");
    },
  };
}

/** Vị trí con trỏ ngay sau ký tự có nghĩa thứ `n` (n = 0: trước ký tự có nghĩa đầu tiên). */
function caretAfter(text: string, n: number, isSignificant: (c: string) => boolean) {
  if (n <= 0) {
    const first = [...text].findIndex(isSignificant);
    return first < 0 ? text.length : first;
  }
  let seen = 0;
  for (let i = 0; i < text.length; i++) if (isSignificant(text[i]) && ++seen === n) return i + 1;
  return text.length;
}

const countSignificant = (text: string, isSignificant: (c: string) => boolean) => [...text].filter(isSignificant).length;

/* ------------------------------------------------------------------ FormattedInput */

export interface FormattedInputDetails {
  /** Chữ đang hiển thị trong ô. */
  formatted: string;
}

export interface FormattedInputProps extends Omit<InputProps, "value" | "defaultValue" | "type"> {
  /** "phone": số điện thoại theo mask · "card": số thẻ (nhóm theo loại thẻ) · "currency": số tiền theo `locale` và `currency`. */
  format: FormattedInputFormat;
  /** Giá trị thô (controlled): chữ số với phone / card, số thập phân dạng "1234.5" với currency. */
  value?: string;
  defaultValue?: string;
  /** Gọi khi giá trị thô đổi; `details.formatted` là chữ đang hiển thị. */
  onValueChange?: (value: string, details: FormattedInputDetails) => void;
  /** Mask cho phone / card: `#` là một chữ số, ký tự khác được chèn khi gõ. Mặc định theo locale (phone) / loại thẻ (card). */
  mask?: string;
  /** Mã tiền tệ ISO 4217 cho currency. */
  currency?: string;
  /** Locale cho currency và mask phone mặc định. Mặc định `locale` của YugenProvider. */
  locale?: string;
}

const FORMAT_ATTRS = {
  phone: { type: "tel", inputMode: "tel", autoComplete: "tel", dir: "ltr" },
  card: { type: "text", inputMode: "numeric", autoComplete: "cc-number", dir: "ltr" },
  currency: { type: "text", inputMode: "decimal", autoComplete: "off", dir: undefined },
} as const;

/**
 * FormattedInput: Input định dạng khi gõ (số điện thoại, số thẻ, số tiền) mà vẫn giữ vị trí con trỏ. `value` /
 * `onValueChange` dùng giá trị thô; với `name`, form gửi giá trị thô qua một input ẩn.
 */
export function FormattedInput({
  format,
  value,
  defaultValue,
  onValueChange,
  onChange,
  onBlur,
  mask,
  currency = "USD",
  locale: localeProp,
  name,
  form,
  disabled,
  ref,
  ...props
}: FormattedInputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const providerLocale = useYugen().locale;
  const locale = localeProp ?? providerLocale;
  const engine = React.useMemo(() => {
    if (format === "currency") return currencyEngine(locale, currency);
    if (mask) return maskEngine(() => mask);
    if (format === "card") return maskEngine(getCardMask);
    const phoneMask = getPhoneMask(locale);
    return maskEngine(() => phoneMask);
  }, [format, locale, currency, mask]);

  const sanitize = (v: string | undefined) => (v ? engine.normalize(format === "currency" ? v.replace(/[^\d.]/g, "") : digitsOf(v)) : "");
  const [raw, setRaw] = useControllableState<string>({
    value: value === undefined ? undefined : sanitize(value),
    defaultValue: () => sanitize(defaultValue),
  });
  const display = engine.format(raw);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);
  const caretRef = React.useRef<number | null>(null);

  // Cha điều khiển `value` và render lại sau khi gõ: đặt lại con trỏ (React có thể đã ghi lại value).
  useIsomorphicLayoutEffect(() => {
    const input = inputRef.current;
    const caret = caretRef.current;
    caretRef.current = null;
    if (input && caret !== null && input.ownerDocument.activeElement === input && input.selectionStart !== caret) {
      input.setSelectionRange(caret, caret);
    }
  });

  const commit = (next: string) => {
    if (next === raw) return;
    setRaw(next);
    onValueChange?.(next, { formatted: engine.format(next) });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const text = input.value;
    const caret = input.selectionStart ?? text.length;
    const inputType = (event.nativeEvent as InputEvent).inputType ?? "";
    let n = countSignificant(text.slice(0, caret), engine.isSignificant);
    let next = engine.parse(text);
    // Chỉ xoá trúng dấu phân cách (khoảng trắng, ngoặc…): xoá luôn chữ số cạnh nó, như người dùng mong đợi.
    if (next === raw && text.length < display.length && inputType.startsWith("delete")) {
      if (inputType === "deleteContentBackward" && n > 0) {
        next = raw.slice(0, n - 1) + raw.slice(n);
        n -= 1;
      } else if (inputType === "deleteContentForward") {
        next = raw.slice(0, n) + raw.slice(n + 1);
      }
    }
    next = engine.normalize(next);
    const formatted = engine.format(next);
    const position = caretAfter(formatted, Math.min(n, countSignificant(formatted, engine.isSignificant)), engine.isSignificant);
    // Ghi chữ và con trỏ ngay: React thấy value trùng nên không ghi lại, con trỏ không nhảy về cuối.
    input.value = formatted;
    input.setSelectionRange(position, position);
    caretRef.current = position;
    onChange?.(event);
    commit(next);
  };

  const attrs = FORMAT_ATTRS[format];
  const fractionDigits = engine.fractionDigits ?? 0;

  return (
    <>
      <Input
        ref={composedRef}
        type={attrs.type}
        inputMode={attrs.inputMode}
        autoComplete={attrs.autoComplete}
        dir={attrs.dir}
        disabled={disabled}
        form={form}
        value={display}
        onChange={handleChange}
        onBlur={(event) => {
          onBlur?.(event);
          // Số tiền đủ chữ số thập phân khi rời ô: 12 → 12.00.
          if (format === "currency" && raw && fractionDigits > 0) {
            const [int = "", frac = ""] = raw.split(".");
            commit(`${int || "0"}.${frac.padEnd(fractionDigits, "0")}`);
          }
        }}
        {...props}
      />
      {name && <input type="hidden" name={name} form={form} disabled={disabled} value={raw} />}
    </>
  );
}
