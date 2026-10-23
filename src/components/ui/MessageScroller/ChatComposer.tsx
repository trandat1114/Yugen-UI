/** Yugen Labs · ChatComposer — ô soạn tin tự giãn: Enter gửi, Shift+Enter xuống dòng. */
import * as React from "react";
import { Send20Filled, Stop20Filled } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { Button } from "../Button/Button";
import { fieldControlClass } from "../Field/Field";

export interface ChatComposerProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Gọi với nội dung đã trim; ô soạn tự xoá sau khi gửi. */
  onSend: (text: string) => void;
  placeholder?: string;
  /** Nhãn truy cập cho ô soạn. Mặc định "Tin nhắn". */
  label?: string;
  disabled?: boolean;
  /** Giới hạn ký tự. */
  maxLength?: number;
  /** Hiện bộ đếm ký tự (cần maxLength). */
  showCount?: boolean;
  /** Số dòng tối đa trước khi cuộn. Mặc định 6. */
  maxRows?: number;
  /** Slot đầu thanh công cụ: đính kèm, emoji, chọn model… */
  actions?: React.ReactNode;
  /** Đang chờ phản hồi (AI) — chặn gửi; có onStop thì nút gửi thành nút Dừng. */
  busy?: boolean;
  onStop?: () => void;
  sendLabel?: string;
  /** Hiện gợi ý phím (Enter gửi · Shift+Enter xuống dòng). */
  showHint?: boolean;
  textareaProps?: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange">;
}

/** ref trỏ vào <textarea> (để focus lại sau khi gửi, chèn nội dung…). */
export const ChatComposer = React.forwardRef<HTMLTextAreaElement, ChatComposerProps>(
  (
    {
      value,
      defaultValue = "",
      onValueChange,
      onSend,
      placeholder = "Nhập tin nhắn…",
      label = "Tin nhắn",
      disabled = false,
      maxLength,
      showCount = false,
      maxRows = 6,
      actions,
      busy = false,
      onStop,
      sendLabel = "Gửi",
      showHint = false,
      textareaProps,
      className,
      ...props
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const counterId = React.useId();
    const hintId = React.useId();
    const [inner, setInner] = React.useState(defaultValue);
    const text = value ?? inner;
    const canSend = text.trim().length > 0 && !disabled && !busy;

    const setText = (next: string) => {
      if (value === undefined) setInner(next);
      onValueChange?.(next);
    };

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // Tự giãn chiều cao theo nội dung, tối đa maxRows dòng.
    useIsomorphicLayoutEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      const style = window.getComputedStyle(el);
      const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4;
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const max = line * maxRows + padding;
      el.style.height = `${Math.min(el.scrollHeight, max)}px`;
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    }, [text, maxRows]);

    const send = () => {
      if (!canSend) return;
      onSend(text.trim());
      setText("");
      textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      textareaProps?.onKeyDown?.(e);
      if (e.defaultPrevented) return;
      // Không gửi khi bộ gõ (Telex/VNI, IME) còn đang ghép chữ.
      if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        send();
      }
    };

    const nearLimit = maxLength !== undefined && text.length >= maxLength * 0.9;
    const describedBy = cn(showCount && maxLength !== undefined && counterId, showHint && hintId, textareaProps?.["aria-describedby"]) || undefined;

    return (
      <form
        data-disabled={disabled || undefined}
        className={cn(fieldControlClass, "flex flex-col", className)}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        {...props}
      >
        <textarea
          rows={1}
          {...textareaProps}
          ref={setRefs}
          value={text}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={textareaProps?.["aria-label"] ?? label}
          aria-describedby={describedBy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "block w-full resize-none bg-transparent px-3 pt-2 pb-1 text-body1 text-foreground-1 outline-none",
            "placeholder:text-foreground-4 disabled:cursor-not-allowed disabled:text-foreground-disabled",
            textareaProps?.className,
          )}
        />
        <div className="flex items-center gap-1 px-1 pb-1">
          {actions && <div className="flex min-w-0 items-center gap-0.5">{actions}</div>}
          {showHint && (
            <span id={hintId} className="hidden min-w-0 truncate ps-1 text-caption1 text-foreground-3 sm:inline">
              Enter để gửi · Shift+Enter xuống dòng
            </span>
          )}
          <div className="ms-auto flex shrink-0 items-center gap-2">
            {showCount && maxLength !== undefined && (
              <span
                id={counterId}
                className={cn("text-caption1 tabular-nums", nearLimit ? "text-warning-foreground-1" : "text-foreground-3")}
              >
                <span className="sr-only">Đã nhập </span>
                {text.length}/{maxLength}
                <span className="sr-only"> ký tự</span>
              </span>
            )}
            {busy && onStop ? (
              <Button appearance="secondary" icon={<Stop20Filled />} aria-label="Dừng phản hồi" onClick={onStop} />
            ) : (
              <Button
                type="submit"
                appearance="primary"
                disabled={!canSend}
                icon={<Send20Filled className="rtl:-scale-x-100" />}
                aria-label={sendLabel}
              />
            )}
          </div>
        </div>
      </form>
    );
  },
);
ChatComposer.displayName = "ChatComposer";
