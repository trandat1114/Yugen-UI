import { vi } from "vitest";
import { resetDeprecationWarnings } from "@/lib/deprecate";

/**
 * Bắt cảnh báo của warnDeprecated trong một test (không in ra) và trả về hàm đếm số lần cảnh báo cho một id.
 * Xoá trạng thái "đã cảnh báo" trước, nên mỗi test đếm từ 0; spy tự gỡ sau test (`restoreMocks`).
 *
 * ```ts
 * const warnings = watchDeprecations();
 * render(<Tree onSelectedChange={fn} />);
 * expect(warnings("Tree.onSelectedChange")).toBe(1);
 * ```
 */
export function watchDeprecations(): (id: string) => number {
  resetDeprecationWarnings();
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  return (id) => warn.mock.calls.filter(([message]) => String(message).includes(`"${id}"`)).length;
}
