/**
 * Cảnh báo API sắp bỏ — chỉ ở môi trường phát triển, mỗi `id` một lần.
 * Bundler của người dùng (Vite, webpack, Next.js) thay `process.env.NODE_ENV` khi build production nên lời gọi
 * bị loại bỏ hoàn toàn; khi không có `process` (ESM thuần trong trình duyệt) thì im lặng.
 *
 * ```ts
 * if (appearance === "transparent") warnDeprecated("Button.appearance.transparent", 'dùng appearance="subtle"', "1.0.0");
 * ```
 */
const warned = new Set<string>();

function isDev(): boolean {
  try {
    return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

export function warnDeprecated(id: string, replacement: string, removedIn?: string): void {
  if (!isDev() || warned.has(id)) return;
  warned.add(id);
  const when = removedIn ? ` và sẽ bị xoá ở v${removedIn}` : " và sẽ bị xoá ở bản major tiếp theo";
  console.warn(`[yugen-ui] "${id}" đã lỗi thời${when}: ${replacement}. Xem https://trandat1114.github.io/Yugen-UI/#/concepts/versioning`);
}

/** Chỉ dùng trong test: cho phép cảnh báo lại. */
export function resetDeprecationWarnings(): void {
  warned.clear();
}
