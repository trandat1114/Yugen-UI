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
  // Sortable (#175): 304.4 → 310.8 kB.
  js("Toàn bộ thư viện (import *)", "*", "318 kB"),
  js("{ cn }", "{ cn }", "10 kB"),
  js("{ Button }", "{ Button }", "14 kB"),
  js("{ YugenProvider }", "{ YugenProvider }", "43 kB"),
  js("{ Dialog, DialogSurface }", "{ Dialog, DialogSurface }", "24 kB"),
  js("{ Combobox }", "{ Combobox }", "59 kB"),
  js("{ DatePicker }", "{ DatePicker }", "68 kB"),
  js("{ BarChart, LineChart }", "{ BarChart, LineChart }", "38 kB"),
  js("{ Sheet }", "{ Sheet }", "28 kB"),
  js("{ Trace }", "{ Trace }", "21 kB"),
  js("{ MessageScroller }", "{ MessageScroller }", "23 kB"),
  js("{ CodeBlock }", "{ CodeBlock }", "33 kB"),
  js("{ DataGrid }", "{ DataGrid }", "36 kB"),
  // Sortable tự viết (#175): 20.76 kB khi thêm, phần riêng ~6.5 kB (dnd-kit core + sortable: 16.6 kB).
  js("{ Sortable, SortableItem, SortableHandle }", "{ Sortable, SortableItem, SortableHandle }", "23 kB"),
  js("{ StreamingMarkdown, PromptInput }", "{ StreamingMarkdown, PromptInput }", "70 kB"),
  js("{ messagesEn }", "{ messagesEn }", "5 kB"),
  // Bộ tiếng Việt, chỉ khi import (#277: mặc định là tiếng Anh): 17.7 kB khi thêm, phần lớn là locale vi của
  // react-day-picker cho Calendar / DatePicker.
  js("{ messagesVi }", "{ messagesVi }", "18.5 kB"),
  // Sonner, Timeline, DescriptionList, Stat, utility yugen-prose (#174, #234): 24.6 kB khi thêm.
  // AppShell / Sidebar + rail của Nav (#161): 24.97 kB khi thêm; 25.08 kB với layout / scroll / footer. 28 kB: chỗ cho vài
  // component nữa (styles.css luôn chứa mọi component, #169 không làm nó nhỏ đi).
  css("styles.css", "28 kB"),
  // Glass (#178): token + utility + fallback trợ năng (12.49 / 8.15 kB khi thêm).
  css("theme.css", "15 kB"), // Prose: biến --prose-* và 4 preset (#244)
  css("tokens.css", "9 kB"),
];
