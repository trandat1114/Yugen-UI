/**
 * Component có bản tiếng Anh (src/docs/registry/en/<file>.ts). Thêm slug ở đây khi dịch xong một trang — test
 * (registry/en.test.ts) kiểm tra danh sách khớp với các file en/ và mỗi bản dịch đủ mục.
 */
export const COMPONENTS_TRANSLATED: ReadonlySet<string> = new Set<string>([
  // core.tsx
  "button",
  "badge",
  "avatar",
  "card",
  "input",
  "checkbox",
  "switch",
  "tabs",
  "tooltip",
  "dialog",
  "messagebar",
  // base.tsx
  "field",
  "popover",
]);
