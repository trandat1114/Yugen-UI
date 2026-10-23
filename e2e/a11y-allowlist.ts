/**
 * Ngoại lệ axe có chủ đích — giữ danh sách NGẮN, ưu tiên sửa tận gốc (component / trang docs).
 * Mỗi mục: rule axe + (route và/hoặc selector) + một dòng lý do. `selector` so bằng `element.closest(selector)`
 * trên phần tử vi phạm, nên nên trỏ tới thuộc tính ổn định (data-*) thay vì selector axe sinh ra.
 */
export interface AllowlistEntry {
  /** Id rule axe, vd. "color-contrast". */
  rule: string;
  /** Route (vd. "/foundations/color") hoặc RegExp; bỏ trống = mọi route. */
  route?: string | RegExp;
  /** Selector CSS mà phần tử vi phạm nằm trong; bỏ trống = mọi phần tử của rule trên route đó. */
  selector?: string;
  /** Theme áp dụng; bỏ trống = mọi theme. */
  theme?: "light" | "dark" | "high-contrast";
  reason: string;
}

export const A11Y_ALLOWLIST: AllowlistEntry[] = [
  {
    rule: "color-contrast",
    route: "/foundations/color",
    selector: '[data-contrast-sample="decor"]',
    reason: "Bảng tương phản cố ý vẽ mẫu 'Aa' của cặp token không yêu cầu tỉ lệ (viền trang trí, disabled) để minh hoạ.",
  },
];

export function routeMatches(entry: AllowlistEntry, route: string) {
  if (entry.route === undefined) return true;
  return typeof entry.route === "string" ? entry.route === route : entry.route.test(route);
}
