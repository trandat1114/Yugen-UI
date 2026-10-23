/**
 * Ngân sách dung lượng của gói npm (`npm run size`, chạy sau `npm run build:lib`).
 *
 * - JS: @size-limit/esbuild bundle + minify + tree-shake đúng phần import từ `dist/lib.js`, như bundler của người
 *   dùng. Peer dependency (`react`, `react-dom` — kể cả `react/jsx-runtime` — và `tailwindcss`) được size-limit tự
 *   loại ra; dependency thường (Radix, cmdk, react-day-picker, tailwind-merge…) được tính vào.
 * - CSS: đo nguyên file đã phát hành (loader `copy` — esbuild không biến đổi gì, nhất là `theme.css` vốn là nguồn
 *   Tailwind v4 với `@theme` / `@utility` / `@source`).
 * - Mọi con số là gzip. Giới hạn ≈ kích thước hiện tại + 10%. Khi tăng có chủ đích: sửa `limit` trong cùng PR và
 *   ghi lý do trong mô tả PR.
 */
const PEERS = ["react", "react-dom", "react/jsx-runtime", "tailwindcss"];

/** Import thật từ entry của gói. */
const js = (name, importStatement, limit) => ({
  name,
  path: "dist/lib.js",
  import: importStatement,
  ignore: PEERS,
  gzip: true,
  limit,
});

/** File CSS phát hành, đo nguyên trạng. */
const css = (file, limit) => ({
  name: file,
  path: `dist/${file}`,
  gzip: true,
  limit,
  modifyEsbuildConfig: (config) => ({ ...config, loader: { ".css": "copy" } }),
});

module.exports = [
  js("Toàn bộ thư viện (import *)", "*", "311 kB"),
  js("{ cn }", "{ cn }", "10 kB"),
  js("{ Button }", "{ Button }", "14 kB"),
  js("{ YugenProvider }", "{ YugenProvider }", "43 kB"),
  js("{ Dialog, DialogSurface }", "{ Dialog, DialogSurface }", "24 kB"),
  js("{ Combobox }", "{ Combobox }", "59 kB"),
  js("{ DatePicker }", "{ DatePicker }", "68 kB"),
  js("{ BarChart, LineChart }", "{ BarChart, LineChart }", "37 kB"),
  js("{ Sheet }", "{ Sheet }", "28 kB"),
  js("{ Trace }", "{ Trace }", "21 kB"),
  js("{ MessageScroller }", "{ MessageScroller }", "23 kB"),
  js("{ CodeBlock }", "{ CodeBlock }", "33 kB"),
  js("{ DataGrid }", "{ DataGrid }", "36 kB"),
  js("{ StreamingMarkdown, PromptInput }", "{ StreamingMarkdown, PromptInput }", "70 kB"),
  css("styles.css", "24 kB"),
  css("theme.css", "11 kB"),
  css("tokens.css", "8 kB"),
];
