import * as React from "react";
import { copyText } from "../_internal/copyText";

export interface UseClipboardOptions {
  /** Giữ `copied = true` bao lâu (ms) trước khi tự về false. Mặc định 1600, bằng các nút sao chép của Yugen UI. */
  timeout?: number;
}

export interface UseClipboardReturn {
  /** Chép `text` vào bộ nhớ tạm; trả về true khi thành công. Không bao giờ ném lỗi. */
  copy: (text: string) => Promise<boolean>;
  /** true trong `timeout` ms sau lần chép thành công — đổi icon / nhãn nút và báo qua live region. */
  copied: boolean;
  /** Về `copied = false` ngay. */
  reset: () => void;
}

/**
 * Chép chữ vào bộ nhớ tạm, có `copied` tự tắt. Dùng Clipboard API; ngữ cảnh không an toàn hay bị chặn quyền thì tự rơi về
 * textarea tạm.
 *
 * ```tsx
 * const { copy, copied } = useClipboard();
 * <Button onClick={() => copy(token)}>{copied ? "Đã chép" : "Chép"}</Button>
 * ```
 */
export function useClipboard({ timeout = 1600 }: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const reset = React.useCallback(() => {
    window.clearTimeout(timer.current);
    setCopied(false);
  }, []);

  const copy = React.useCallback(
    async (text: string) => {
      try {
        await copyText(text);
      } catch {
        return false;
      }
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), timeout);
      return true;
    },
    [timeout],
  );

  return { copy, copied, reset };
}
