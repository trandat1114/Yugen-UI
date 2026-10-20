import { vi } from "vitest";

/** Ghép tham số console kiểu printf của React ("Warning: %s did not match…") thành một chuỗi. */
export function formatConsoleArgs(args: unknown[]): string {
  const [first, ...rest] = args;
  if (typeof first !== "string") return args.map(String).join(" ");
  let i = 0;
  const message = first.replace(/%[sdifoOc]/g, () => (i < rest.length ? String(rest[i++]) : ""));
  return [message, ...rest.slice(i).map(String)].join(" ");
}

/**
 * Rút gọn cảnh báo React để báo lỗi test dễ đọc: câu đầu + vài component gần nhất trong component stack
 * (vd. "Warning: useLayoutEffect does nothing on the server… ← Toolbar ← div").
 */
export function summarizeWarning(message: string): string {
  const [head] = message.split("\n");
  const sentence = head.length > 110 ? `${head.slice(0, 110)}…` : head;
  // Frame ẩn danh (forwardRef) chỉ có đường dẫn tệp → lấy tên tệp.
  const components = [...message.matchAll(/\n\s+at (\S+)/g)]
    .map((m) => m[1].replace(/:\d+(?::\d+)?\)?$/, "").split(/[\\/]/).pop() ?? m[1])
    .slice(0, 4);
  return components.length ? `${sentence} ← ${components.join(" ← ")}` : sentence;
}

/** Bắt console.error / console.warn (không in ra), trả về các thông điệp đã định dạng. */
export function captureConsole() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const errorSpy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    errors.push(formatConsoleArgs(args));
  });
  const warnSpy = vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    warnings.push(formatConsoleArgs(args));
  });
  return {
    errors,
    warnings,
    restore() {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    },
  };
}
