/** Fluent 2 SearchBox — https://fluent2.microsoft.design/components/web/react/core/searchbox/usage */
import * as React from "react";
import { Dismiss16Regular, Dismiss20Regular, Dismiss24Regular, Search16Regular, Search20Regular, Search24Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Input, type InputProps } from "@/components/ui/Input/Input";
import { useYugenMessages } from "../YugenProvider/context";
import { searchBoxMessages } from "./messages";

export { searchBoxMessages, searchBoxMessagesEn, type SearchBoxMessages } from "./messages";

const ICONS = {
  small: { Search: Search16Regular, Dismiss: Dismiss16Regular },
  medium: { Search: Search20Regular, Dismiss: Dismiss20Regular },
  large: { Search: Search24Regular, Dismiss: Dismiss24Regular },
} as const;

export interface SearchBoxProps extends Omit<InputProps, "type"> {
  /** Gọi khi nội dung đổi — kể cả khi bấm X hoặc Esc để xoá. */
  onValueChange?: (value: string) => void;
  /** aria-label của nút xoá. Mặc định lấy từ `messages.searchBox.dismiss`. */
  dismissLabel?: string;
}

/** SearchBox: Input có icon tìm kiếm và nút xoá; Esc để xoá nhanh. Hỗ trợ controlled & uncontrolled. */
export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      onKeyDown,
      contentBefore,
      contentAfter,
      size,
      disabled,
      readOnly,
      dismissLabel,
      className,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("searchBox", searchBoxMessages);
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const [inner, setInner] = React.useState(defaultValue === undefined ? "" : String(defaultValue));
    const current = value !== undefined ? String(value) : inner;
    const icons = ICONS[size ?? "medium"];

    /** Xoá bằng cách phát sự kiện input gốc → onChange của React chạy như khi người dùng gõ. */
    const clear = () => {
      const input = inputRef.current;
      if (!input) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    };

    const showDismiss = current !== "" && !disabled && !readOnly;
    const after =
      showDismiss || contentAfter ? (
        <>
          {showDismiss && (
            <button
              type="button"
              aria-label={dismissLabel ?? msg.dismiss}
              onClick={clear}
              className="flex cursor-pointer items-center justify-center rounded-small text-foreground-3 transition-colors duration-faster hover:text-foreground-2 active:text-foreground-1"
            >
              <icons.Dismiss />
            </button>
          )}
          {contentAfter}
        </>
      ) : undefined;

    return (
      <Input
        ref={inputRef}
        type="search"
        role="searchbox"
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder ?? msg.placeholder}
        value={current}
        onChange={(e) => {
          if (value === undefined) setInner(e.target.value);
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented && e.key === "Escape" && current !== "" && !readOnly) {
            e.preventDefault();
            clear();
          }
        }}
        contentBefore={contentBefore ?? <icons.Search />}
        contentAfter={after}
        className={cn(
          "[&_input::-webkit-search-cancel-button]:appearance-none [&_input::-webkit-search-decoration]:appearance-none",
          className,
        )}
        {...props}
      />
    );
  },
);
SearchBox.displayName = "SearchBox";
