import * as React from "react";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";

export interface UseControllableStateOptions<T> {
  /** Giá trị do bên ngoài giữ (controlled). `undefined` = không điều khiển, hook tự giữ state. */
  value?: T;
  /** Giá trị ban đầu khi không điều khiển. Truyền hàm để chỉ tính một lần, như `useState(() => …)`. */
  defaultValue: T | (() => T);
  /** Gọi mỗi khi giá trị đổi — cả khi controlled (để cha cập nhật `value`) lẫn uncontrolled. */
  onChange?: (value: T) => void;
}

/**
 * State dùng được cả kiểu controlled (`value` + `onChange`) lẫn uncontrolled (`defaultValue`) — mẫu mọi component Yugen UI có
 * cặp prop `x` / `defaultX` / `onXChange`. Hàm set có identity ổn định, nhận giá trị hoặc hàm cập nhật, và bỏ qua khi giá trị
 * không đổi (`Object.is`) nên `onChange` chỉ chạy khi thật sự có thay đổi.
 *
 * ```ts
 * const [open, setOpen] = useControllableState({ value: props.open, defaultValue: false, onChange: props.onOpenChange });
 * ```
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (next: React.SetStateAction<T>) => void] {
  const [inner, setInner] = React.useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;

  // Hàm set đọc giá trị mới nhất qua ref: identity không đổi mà vẫn không dùng giá trị cũ của lần render trước.
  const latest = React.useRef({ current, controlled, onChange });
  useIsomorphicLayoutEffect(() => {
    latest.current = { current, controlled, onChange };
  });

  const set = React.useCallback((next: React.SetStateAction<T>) => {
    const state = latest.current;
    const resolved = typeof next === "function" ? (next as (prev: T) => T)(state.current) : next;
    if (Object.is(resolved, state.current)) return;
    // Hai lần set liên tiếp trong cùng một sự kiện: lần sau phải thấy kết quả của lần trước.
    if (!state.controlled) {
      state.current = resolved;
      setInner(resolved);
    }
    state.onChange?.(resolved);
  }, []);

  return [current, set];
}
