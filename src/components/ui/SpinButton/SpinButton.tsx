/** Fluent 2 SpinButton — https://fluent2.microsoft.design/components/web/react/core/spinbutton/usage */
import * as React from "react";
import { ChevronDown12Regular, ChevronDown16Regular, ChevronUp12Regular, ChevronUp16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { fieldAppearanceClass, type FieldAppearance } from "@/components/ui/Select/Select";
import { useYugenMessages } from "../YugenProvider/context";
import { spinButtonMessages } from "./messages";

export { spinButtonMessages, type SpinButtonMessages } from "./messages";
export { spinButtonMessagesEn } from "./messages.en";

const decimals = (n: number) => {
  const [, frac = ""] = String(n).split(".");
  return frac.length;
};

const SIZE = {
  small: { root: "h-6 text-caption1", input: "ps-2", button: "w-5", Up: ChevronUp12Regular, Down: ChevronDown12Regular, icon: "size-3" },
  medium: { root: "h-8 text-body1", input: "ps-3", button: "w-6", Up: ChevronUp16Regular, Down: ChevronDown16Regular, icon: "size-4" },
} as const;

export interface SpinButtonProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
  > {
  value?: number | null;
  defaultValue?: number | null;
  /** Gọi khi giá trị số thay đổi (bấm nút, phím mũi tên, hoặc xác nhận khi gõ). */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Bước cho mũi tên / nút. Mặc định 1. */
  step?: number;
  /** Bước cho PageUp / PageDown. Mặc định step × 10. */
  stepPage?: number;
  /** Số chữ số thập phân; mặc định suy ra từ step. */
  precision?: number;
  /** Chuỗi hiển thị thay cho số (controlled, như Fluent). */
  displayValue?: string;
  /** Định dạng số thành chuỗi hiển thị, vd thêm đơn vị. */
  formatValue?: (value: number) => string;
  /** Đọc số từ chuỗi người dùng gõ; mặc định bỏ ký tự không phải số. */
  parseValue?: (text: string) => number | null;
  appearance?: FieldAppearance;
  size?: "small" | "medium";
  /** aria-label nút tăng. Mặc định lấy từ `messages.spinButton.increment`. */
  incrementLabel?: string;
  /** aria-label nút giảm. Mặc định lấy từ `messages.spinButton.decrement`. */
  decrementLabel?: string;
}

const defaultParse = (text: string) => {
  const cleaned = text.replace(/,/g, ".").replace(/[^\d.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const n = Number.parseFloat(cleaned);
  return Number.isNaN(n) ? null : n;
};

/** SpinButton: nhập số, tăng/giảm theo bước bằng nút hoặc bàn phím. */
export const SpinButton = React.forwardRef<HTMLInputElement, SpinButtonProps>(
  (
    {
      value,
      defaultValue = null,
      onValueChange,
      min,
      max,
      step = 1,
      stepPage,
      precision,
      displayValue,
      formatValue,
      parseValue = defaultParse,
      appearance = "outline",
      size = "medium",
      incrementLabel,
      decrementLabel,
      className,
      disabled,
      readOnly,
      onKeyDown,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("spinButton", spinButtonMessages);
    const [inner, setInner] = React.useState<number | null>(defaultValue);
    const current = value !== undefined ? value : inner;
    const [text, setTextState] = React.useState<string | null>(null);
    // Ref giữ giá trị mới nhất cho vòng lặp "nhấn giữ" (tránh closure cũ).
    const valueRef = React.useRef(current);
    valueRef.current = current;
    const textRef = React.useRef(text);
    textRef.current = text;
    const onValueChangeRef = React.useRef(onValueChange);
    onValueChangeRef.current = onValueChange;
    const timer = React.useRef<number | undefined>(undefined);

    const page = stepPage ?? step * 10;
    const digits = precision ?? Math.max(decimals(step), decimals(page));
    const round = (n: number) => Number(n.toFixed(digits));
    const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
    const format = (n: number) => (formatValue ? formatValue(n) : n.toFixed(digits));

    const setText = (next: string | null) => {
      textRef.current = next;
      setTextState(next);
    };

    /** Trả về true nếu giá trị thực sự đổi. */
    const setValue = (next: number | null) => {
      if (next === valueRef.current) return false;
      valueRef.current = next;
      if (value === undefined) setInner(next);
      onValueChangeRef.current?.(next);
      return true;
    };

    const commitText = () => {
      const typed = textRef.current;
      if (typed === null) return valueRef.current;
      setText(null);
      if (typed.trim() === "") {
        setValue(null);
        return null;
      }
      const parsed = parseValue(typed);
      if (parsed === null) return valueRef.current;
      const next = round(clamp(parsed));
      setValue(next);
      return next;
    };

    const stepBy = (delta: number) => {
      const committed = commitText();
      const next = committed === null ? clamp(delta > 0 ? (min ?? 0) : (max ?? 0)) : round(clamp(committed + delta));
      return setValue(next);
    };

    const stopSpin = () => window.clearTimeout(timer.current);
    React.useEffect(() => stopSpin, []);

    const startSpin = (delta: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      stopSpin();
      stepBy(delta);
      const repeat = (wait: number) => {
        timer.current = window.setTimeout(() => {
          if (stepBy(delta)) repeat(75);
        }, wait);
      };
      repeat(400);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || readOnly) return;
      const actions: Record<string, () => void> = {
        ArrowUp: () => void stepBy(step),
        ArrowDown: () => void stepBy(-step),
        PageUp: () => void stepBy(page),
        PageDown: () => void stepBy(-page),
        Enter: () => void commitText(),
        Escape: () => setText(null),
      };
      if (min !== undefined)
        actions.Home = () => {
          setText(null);
          setValue(min);
        };
      if (max !== undefined)
        actions.End = () => {
          setText(null);
          setValue(max);
        };
      const action = actions[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    const s = SIZE[size];
    const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
    const shown = text ?? (displayValue !== undefined ? displayValue : current === null ? "" : format(current));
    const atMax = current !== null && max !== undefined && current >= max;
    const atMin = current !== null && min !== undefined && current <= min;

    const buttonClass = cn(
      "col-start-2 flex cursor-pointer items-center justify-center bg-transparent text-foreground-3 outline-none",
      "transition-colors duration-faster ease-easy-ease",
      "enabled:hover:bg-subtle-hover enabled:hover:text-foreground-2 enabled:active:bg-subtle-pressed enabled:active:text-foreground-1",
      "disabled:cursor-not-allowed disabled:text-foreground-disabled",
      s.button,
    );

    return (
      <span
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        className={cn(fieldAppearanceClass[appearance], "inline-grid grid-cols-[minmax(0,1fr)_auto] grid-rows-2", s.root, className)}
      >
        <input
          ref={ref}
          type="text"
          role="spinbutton"
          inputMode="decimal"
          autoComplete="off"
          aria-valuenow={current ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={shown || undefined}
          disabled={disabled}
          readOnly={readOnly}
          value={shown}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            commitText();
            onBlur?.(e);
          }}
          className={cn(
            "row-span-2 h-full w-full min-w-0 bg-transparent pe-1 text-foreground-1 outline-none placeholder:text-foreground-4",
            "disabled:cursor-not-allowed disabled:text-foreground-disabled",
            s.input,
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={incrementLabel ?? msg.increment}
          disabled={disabled || readOnly || atMax}
          onPointerDown={startSpin(step)}
          onPointerUp={stopSpin}
          onPointerLeave={stopSpin}
          onPointerCancel={stopSpin}
          className={cn(buttonClass, "row-start-1 rounded-se-small pt-px")}
        >
          <s.Up className={s.icon} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label={decrementLabel ?? msg.decrement}
          disabled={disabled || readOnly || atMin}
          onPointerDown={startSpin(-step)}
          onPointerUp={stopSpin}
          onPointerLeave={stopSpin}
          onPointerCancel={stopSpin}
          className={cn(buttonClass, "row-start-2 rounded-ee-small pb-px")}
        >
          <s.Down className={s.icon} />
        </button>
      </span>
    );
  },
);
SpinButton.displayName = "SpinButton";
