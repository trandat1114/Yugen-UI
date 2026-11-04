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

/**
 * `import()` trong thư viện (Toaster của YugenProvider, #346) là chunk nạp lười với bundler của app (Vite, webpack,
 * Next.js): đo lần tải đầu, không tính chunk đó. Không có plugin này, esbuild (không tách chunk) gộp chunk lười vào cùng
 * file và bọc mọi module nó dùng trong hàm khởi tạo (+0.3–0.7 kB cho mọi mục), điều bundler thật không làm.
 */
const lazyChunks = {
  name: "lazy-chunks",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => (args.kind === "dynamic-import" ? { path: args.path, external: true } : undefined));
  },
};

/** Import thật từ entry của gói. */
const js = (name, importStatement, limit) => ({
  name,
  path: "dist/lib.js",
  import: importStatement,
  ignore: PEERS,
  gzip: true,
  limit,
  modifyEsbuildConfig: (config) => ({ ...config, plugins: [...(config.plugins ?? []), lazyChunks] }),
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
  // Sortable (#175): 304.4 → 310.8 kB. Form control mới (#173): 309.3 → 318.0 kB. NavigationMenu + StatusPage
  // (#168, #238): → ~328 kB.
  js("Toàn bộ thư viện (import *)", "*", "340 kB"),
  js("{ cn }", "{ cn }", "10 kB"),
  js("{ Button }", "{ Button }", "14 kB"),
  // Toaster nạp lúc cần (#346): 25.95 → 13.52 kB (lần tải đầu; Toaster là chunk riêng).
  js("{ YugenProvider }", "{ YugenProvider }", "15 kB"),
  js("{ Dialog, DialogSurface }", "{ Dialog, DialogSurface }", "24 kB"),
  js("{ Combobox }", "{ Combobox }", "59 kB"),
  // Calendar không kéo locale vi của react-day-picker (#349): 61.93 → 59.72 kB.
  js("{ DatePicker }", "{ DatePicker }", "64.5 kB"),
  // #173: họ DatePicker dùng chung vỏ; MonthPicker / DateTimePicker kéo theo Calendar (react-day-picker) như DatePicker.
  // Không kéo locale vi (#349): 69.00 → 66.76 kB.
  js("{ MonthPicker, YearPicker, DateTimePicker }", "{ MonthPicker, YearPicker, DateTimePicker }", "72.5 kB"),
  js("{ PasswordInput, FormattedInput }", "{ PasswordInput, FormattedInput }", "16.5 kB"),
  js("{ ColorPicker }", "{ ColorPicker }", "30 kB"),
  js("{ BarChart, LineChart }", "{ BarChart, LineChart }", "38 kB"),
  js("{ Sheet }", "{ Sheet }", "28 kB"),
  // Nav không import Tooltip, Sidebar của AppShell truyền Tooltip của rail (#350): 31.40 → 12.33 kB.
  js("{ Nav, NavItem }", "{ Nav, NavItem }", "13.5 kB"),
  // Menu của nút "…" nạp lúc cần (#350): 42.49 → 13.04 kB (lần tải đầu; menu là chunk riêng).
  js("{ Breadcrumb }", "{ Breadcrumb }", "14.5 kB"),
  // #168: Radix Navigation Menu (dependency mới) + viewport.
  js("{ NavigationMenu }", "{ NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink }", "26 kB"),
  js("{ StatusPage, ErrorBoundary }", "{ StatusPage, ErrorBoundary }", "18 kB"),
  js("{ Trace }", "{ Trace }", "21 kB"),
  js("{ MessageScroller }", "{ MessageScroller }", "23 kB"),
  js("{ CodeBlock }", "{ CodeBlock }", "33 kB"),
  js("{ DataGrid }", "{ DataGrid }", "36 kB"),
  // Sortable tự viết (#175): 20.76 kB khi thêm, phần riêng ~6.5 kB (dnd-kit core + sortable: 16.6 kB).
  js("{ Sortable, SortableItem, SortableHandle }", "{ Sortable, SortableItem, SortableHandle }", "23 kB"),
  // Citation (Popover) nạp lúc cần (#350): 57.00 → 32.42 kB (lần tải đầu; Citation là chunk riêng).
  js("{ StreamingMarkdown, PromptInput }", "{ StreamingMarkdown, PromptInput }", "35.5 kB"),
  // Chuỗi của 6 component mới (#173): 4.80 → 5.11 kB; NavigationMenu + StatusPage (#168, #238): → ~5.7 kB.
  js("{ messagesEn }", "{ messagesEn }", "6 kB"),
  // Bộ tiếng Việt, chỉ khi import (#277: mặc định là tiếng Anh): 17.7 kB khi thêm, phần lớn là locale vi của
  // react-day-picker cho Calendar / DatePicker.
  js("{ messagesVi }", "{ messagesVi }", "19.5 kB"),
  // Sonner, Timeline, DescriptionList, Stat, utility yugen-prose (#174, #234): 24.6 kB khi thêm.
  // AppShell / Sidebar + rail của Nav (#161): 24.97 kB khi thêm; 25.08 kB với layout / scroll / footer. 28 kB: chỗ cho vài
  // component nữa (styles.css luôn chứa mọi component, #169 không làm nó nhỏ đi).
  css("styles.css", "28 kB"),
  // Glass (#178): token + utility + fallback trợ năng (12.49 / 8.15 kB khi thêm).
  css("theme.css", "15 kB"), // Prose: biến --prose-* và 4 preset (#244)
  css("tokens.css", "9 kB"),
];
