/** InputOTP — ô nhập mã một lần (kiểu shadcn), giao diện theo Fluent 2 Input: https://fluent2.microsoft.design/components/web/react/core/input/usage */
import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { cn } from "@/lib/cn";
import { fieldControlClass } from "@/components/ui/Field/Field";

const PATTERNS = {
  digits: /^\d$/,
  alphanumeric: /^[a-zA-Z0-9]$/,
} as const;

const BOX = {
  small: "size-8 text-body1",
  medium: "size-10 text-body2",
  large: "size-12 text-subtitle1",
} as const;

export interface InputOTPProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Số ô. Mặc định 6. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Gọi khi đã nhập đủ `length` ký tự. */
  onComplete?: (code: string) => void;
  /** Ký tự hợp lệ: chỉ số (mặc định), chữ + số, hoặc RegExp kiểm tra từng ký tự. */
  pattern?: "digits" | "alphanumeric" | RegExp;
  /** Chia nhóm, vd `[3, 3]` → 3 ô · vạch · 3 ô. */
  groups?: number[];
  /** Phần tử ngăn cách giữa các nhóm. */
  separator?: React.ReactNode;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  autoFocus?: boolean;
  /** Tên field khi submit form (giá trị gộp). */
  name?: string;
  required?: boolean;
  "aria-invalid"?: boolean;
}

/** InputOTP: N ô một ký tự — tự nhảy ô, Backspace lùi ô, dán điền tất cả, gọi onComplete khi đủ. */
export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  (
    {
      length = 6,
      value,
      defaultValue = "",
      onValueChange,
      onComplete,
      pattern = "digits",
      groups,
      separator,
      size = "medium",
      disabled,
      autoFocus,
      name,
      required,
      id,
      className,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      ...props
    },
    ref,
  ) => {
    const regex = typeof pattern === "string" ? PATTERNS[pattern] : pattern;
    const isValid = (ch: string) => regex.test(ch);
    const sanitize = (text: string) => text.split("").filter(isValid).join("");

    const [inner, setInner] = React.useState(() => sanitize(defaultValue).slice(0, length));
    const current = (value !== undefined ? value : inner).slice(0, length);
    const inputs = React.useRef<(HTMLInputElement | null)[]>([]);
    const dir = useDirection();

    const focusAt = (index: number) => {
      const i = Math.max(0, Math.min(index, length - 1));
      const el = inputs.current[i];
      if (el) {
        el.focus();
        el.select();
      }
    };

    const update = (next: string, focusIndex?: number) => {
      const clipped = next.slice(0, length);
      if (clipped !== current) {
        if (value === undefined) setInner(clipped);
        onValueChange?.(clipped);
        if (clipped.length === length) onComplete?.(clipped);
      }
      if (focusIndex !== undefined) requestAnimationFrame(() => focusAt(focusIndex));
    };

    const fillFrom = (index: number, text: string) => {
      const chars = sanitize(text);
      if (!chars) return;
      if (chars.length >= length) {
        update(chars.slice(0, length), length - 1);
        return;
      }
      const next = (current.slice(0, index) + chars + current.slice(index + chars.length)).slice(0, length);
      update(next, Math.min(index + chars.length, length - 1));
    };

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const old = current[index] ?? "";
      if (raw.length > 2) {
        fillFrom(index, raw);
        return;
      }
      // Ô đã được select khi focus nên thường raw = ký tự mới; nếu chưa, lấy ký tự khác ký tự cũ.
      const ch = raw.length === 2 ? (raw[0] === old ? raw[1] : raw[0]) : raw;
      if (!ch || !isValid(ch)) return;
      update(current.slice(0, index) + ch + current.slice(index + 1), index + 1);
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // RTL: ô đầu nằm bên phải → ArrowLeft tiến tới ô sau, ArrowRight lùi về ô trước.
      const key =
        dir === "rtl" && (e.key === "ArrowLeft" || e.key === "ArrowRight")
          ? e.key === "ArrowLeft"
            ? "ArrowRight"
            : "ArrowLeft"
          : e.key;
      switch (key) {
        case "Backspace": {
          e.preventDefault();
          if (current[index]) update(current.slice(0, index) + current.slice(index + 1), index);
          else if (index > 0) update(current.slice(0, index - 1) + current.slice(index), index - 1);
          break;
        }
        case "Delete": {
          e.preventDefault();
          update(current.slice(0, index) + current.slice(index + 1), index);
          break;
        }
        case "ArrowLeft":
          e.preventDefault();
          focusAt(index - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          focusAt(Math.min(index + 1, current.length));
          break;
        case "Home":
          e.preventDefault();
          focusAt(0);
          break;
        case "End":
          e.preventDefault();
          focusAt(current.length);
          break;
      }
    };

    // Giữ chuỗi liền mạch: không cho focus vượt quá ô trống đầu tiên.
    const handleFocus = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
      if (index > current.length) {
        focusAt(current.length);
        return;
      }
      e.target.select();
    };

    const sizes = groups && groups.reduce((a, b) => a + b, 0) === length ? groups : [length];
    const invalid = ariaInvalid === true;

    let offset = 0;
    const rendered = sizes.map((count, g) => {
      const start = offset;
      offset += count;
      return (
        <React.Fragment key={g}>
          {g > 0 &&
            (separator ?? <span aria-hidden className="h-0.5 w-3 shrink-0 rounded-circular bg-foreground-3" />)}
          <div className="flex items-center gap-S">
            {Array.from({ length: count }, (_, k) => {
              const i = start + k;
              return (
                <span
                  key={i}
                  data-invalid={invalid || undefined}
                  data-disabled={disabled || undefined}
                  className={cn(fieldControlClass, "inline-flex shrink-0 overflow-hidden", BOX[size])}
                >
                  <input
                    ref={(el) => {
                      inputs.current[i] = el;
                    }}
                    id={i === 0 ? id : undefined}
                    type="text"
                    inputMode={pattern === "digits" ? "numeric" : "text"}
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    autoFocus={autoFocus && i === 0}
                    disabled={disabled}
                    required={required && i === 0}
                    aria-label={`Ký tự ${i + 1} trên ${length}`}
                    aria-invalid={invalid || undefined}
                    aria-describedby={ariaDescribedby}
                    value={current[i] ?? ""}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => handleFocus(i, e)}
                    onMouseUp={(e) => e.currentTarget.select()}
                    onPaste={(e) => {
                      e.preventDefault();
                      fillFrom(i, e.clipboardData.getData("text"));
                    }}
                    className="size-full bg-transparent text-center font-semibold text-foreground-1 caret-brand-foreground-1 outline-none disabled:cursor-not-allowed disabled:text-foreground-disabled"
                  />
                </span>
              );
            })}
          </div>
        </React.Fragment>
      );
    });

    return (
      <div ref={ref} role="group" className={cn("inline-flex items-center gap-S", className)} {...props}>
        {rendered}
        {name && <input type="hidden" name={name} value={current} />}
      </div>
    );
  },
);
InputOTP.displayName = "InputOTP";
