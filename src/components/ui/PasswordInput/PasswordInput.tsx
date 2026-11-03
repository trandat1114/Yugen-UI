import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { Eye20Regular, EyeOff20Regular, KeyboardShiftUppercase16Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { Input, type InputProps } from "@/components/ui/Input/Input";
import { useYugenMessages, useComponentDefaults, COMPACT_SIZE } from "../YugenProvider/context";
import { passwordInputMessagesEn } from "./messages";

export { passwordInputMessagesVi, passwordInputMessagesEn, type PasswordInputMessages } from "./messages";

/** 0 = trống · 1 yếu · 2 trung bình · 3 khá · 4 mạnh. */
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * Ước lượng độ mạnh theo độ dài và số loại ký tự (thường, hoa, số, ký hiệu). Chỉ là gợi ý nhanh phía client: kiểm tra
 * thật (danh sách mật khẩu lộ, zxcvbn…) truyền vào `strength` dưới dạng hàm.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  if (password.length < 8 || /^(.)\1*$/.test(password)) return 1;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((re) => re.test(password)).length;
  const score = (password.length >= 12 ? 2 : 1) + (kinds >= 3 ? 1 : 0) + (kinds === 4 || password.length >= 16 ? 1 : 0);
  return Math.min(4, score) as PasswordStrength;
}

/** Ô nút theo cỡ Input; icon do Input chỉnh cỡ (`[&_svg]:size-4 / 5 / 6`). */
const BUTTON = { small: "size-5", medium: "size-6", large: "size-8" } as const;

const LEVELS = [
  { key: "weak", bar: "bg-danger-background-3", text: "text-danger-foreground-1" },
  { key: "fair", bar: "bg-warning-background-3", text: "text-warning-foreground-1" },
  { key: "good", bar: "bg-success-background-3", text: "text-success-foreground-1" },
  { key: "strong", bar: "bg-success-background-3", text: "text-success-foreground-1" },
] as const;

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  /** Đang hiện mật khẩu dạng chữ (controlled). */
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** Nhắc "Caps Lock is on" khi đang gõ với Caps Lock bật. Mặc định bật. */
  capsLockWarning?: boolean;
  /** Thước đo độ mạnh dưới ô nhập: `true` dùng `getPasswordStrength`, hoặc truyền hàm chấm điểm riêng (0–4). */
  strength?: boolean | ((password: string) => PasswordStrength);
}

/**
 * PasswordInput: Input có nút hiện / ẩn mật khẩu, nhắc Caps Lock và thước đo độ mạnh tuỳ chọn. Nhận mọi prop của Input
 * (label, hint, validationState…) và dùng được trong `<Field>`.
 */
export function PasswordInput(inProps: PasswordInputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const {
    visible: visibleProp,
    defaultVisible = false,
    onVisibleChange,
    capsLockWarning = true,
    strength,
    value,
    defaultValue,
    onChange,
    onKeyDown,
    onKeyUp,
    onBlur,
    size,
    disabled,
    readOnly,
    contentAfter,
    rootClassName,
    id,
    "aria-describedby": describedBy,
    ref,
    ...props
  } = useComponentDefaults("PasswordInput", inProps, COMPACT_SIZE);
  const msg = useYugenMessages("passwordInput", passwordInputMessagesEn);
  const [visible, setVisible] = useControllableState({ value: visibleProp, defaultValue: defaultVisible, onChange: onVisibleChange });
  const [capsLock, setCapsLock] = React.useState(false);
  // Chỉ cần chữ hiện tại cho thước đo; ô nhập vẫn tự giữ giá trị khi không điều khiển.
  const [text, setText] = React.useState(() => String(value ?? defaultValue ?? ""));
  const current = value !== undefined ? String(value) : text;

  const autoId = React.useId();
  const inputId = id ?? autoId;
  const capsId = `${inputId}-capslock`;
  const strengthId = `${inputId}-strength`;
  const score = strength ? (typeof strength === "function" ? strength(current) : getPasswordStrength(current)) : 0;
  const level = score > 0 ? LEVELS[Math.min(4, score) - 1] : null;

  const readCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (capsLockWarning && typeof event.getModifierState === "function") setCapsLock(event.getModifierState("CapsLock"));
  };

  const toggle = (
    <button
      type="button"
      aria-label={msg.show}
      aria-pressed={visible}
      aria-controls={inputId}
      disabled={disabled}
      // Giữ focus (và vị trí con trỏ) trong ô nhập khi bấm chuột.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => setVisible((v) => !v)}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center rounded-small text-foreground-3",
        "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover hover:text-foreground-2 active:bg-subtle-pressed active:text-foreground-1",
        "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-foreground-disabled",
        BUTTON[size ?? "medium"],
      )}
    >
      {visible ? <EyeOff20Regular /> : <Eye20Regular />}
    </button>
  );

  return (
    <div className={cn("flex flex-col", rootClassName)}>
      <Input
        ref={ref}
        id={inputId}
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        type={visible ? "text" : "password"}
        // Mật khẩu đang hiện không gửi qua kiểm tra chính tả / tự viết hoa.
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          onChange?.(event);
          setText(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          readCapsLock(event);
        }}
        onKeyUp={(event) => {
          onKeyUp?.(event);
          readCapsLock(event);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setCapsLock(false);
        }}
        // Input tự nối hint / validationMessage vào aria-describedby chỉ khi không truyền prop này — nối lại ở đây.
        aria-describedby={
          cn(describedBy, props.validationMessage && `${inputId}-message`, props.hint && `${inputId}-hint`, strength && strengthId, capsLockWarning && capsId) ||
          undefined
        }
        contentAfter={
          <>
            {toggle}
            {contentAfter}
          </>
        }
        {...props}
      />
      {strength && (
        <div className="mt-1 flex items-center gap-2">
          <div aria-hidden className="grid flex-1 grid-cols-4 gap-1">
            {LEVELS.map((l, i) => (
              <span
                key={l.key}
                className={cn(
                  "h-1 rounded-circular transition-colors duration-normal ease-easy-ease",
                  level && i < score ? level.bar : "bg-stroke-2",
                )}
              />
            ))}
          </div>
          <span id={strengthId} aria-live="polite" className={cn("min-w-14 text-end text-caption1", level ? level.text : "text-foreground-3")}>
            {level && (
              <>
                <span className="sr-only">{msg.strength}: </span>
                {msg[level.key]}
              </>
            )}
          </span>
        </div>
      )}
      {capsLockWarning && (
        // Vùng live luôn có mặt (rỗng = cao 0) để trình đọc màn hình đọc khi nhắc xuất hiện.
        <span id={capsId} aria-live="polite" className="text-caption1 text-warning-foreground-1">
          {capsLock && !disabled && !readOnly ? (
            <span className="mt-1 inline-flex items-center gap-1">
              <KeyboardShiftUppercase16Regular aria-hidden className="size-4 shrink-0" />
              {msg.capsLock}
            </span>
          ) : null}
        </span>
      )}
    </div>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    PasswordInput: PasswordInputProps;
  }
}
