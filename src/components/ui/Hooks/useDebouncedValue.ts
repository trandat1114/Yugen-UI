import * as React from "react";

/**
 * Trả về `value` sau khi nó đứng yên `delay` ms. Giá trị đầu tiên trả ngay (không trễ lúc mount).
 *
 * ```ts
 * const [query, setQuery] = useState("");
 * const debounced = useDebouncedValue(query, 300);
 * useEffect(() => { search(debounced); }, [debounced]);
 * ```
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    if (Object.is(value, debounced)) return;
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay, debounced]);
  return debounced;
}
