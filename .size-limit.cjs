/**
 * Ngân sách dung lượng của gói npm (`npm run size`, chạy sau `npm run build:lib`).
 *
 * - JS: @size-limit/esbuild bundle + minify + tree-shake đúng phần import từ `dist/lib.js`, như bundler của người
 *   dùng. Peer dependency (`react`, `react-dom` — kể cả `react/jsx-runtime` — và `tailwindcss`) được size-limit tự
 *   loại ra; dependency thường (Radix, cmdk, react-day-picker, tailwind-merge…) được tính vào.
 * - CSS: đo nguyên file đã phát hành (loader `copy` — esbuild không biến đổi gì, nhất là `theme.css` vốn là nguồn
 *   Tailwind v4 với `@theme` / `@utility` / `@source`), và CSS app thật sự nhận được sau khi Tailwind biên dịch
 *   (`compiledCss`, #360).
 * - Mọi con số là gzip. Giới hạn = kích thước đo được + 8%, làm tròn lên 0.5 kB. Khi tăng có chủ đích: sửa `limit`
 *   trong cùng PR và ghi lý do trong mô tả PR. Khi một PR làm mục nhỏ đi, hạ `limit` trong chính PR đó:
 *   scripts/check-size-slack.mjs (CI, sau `npm run size`) báo lỗi khi giới hạn cao hơn kích thước đo được quá 20%.
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

/**
 * CSS đã biên dịch của cách dùng lean (#169): `@import "tailwindcss"` + `theme-core.css` + `sources/<Folder>.css` cho
 * các component mà mã trong `app` import + class của chính app, biên dịch và minify như bundler của app
 * (scripts/measure-css.mjs). Không có `app`: phần sàn mọi app đều trả (preflight, token, base). Plugin thay nội dung
 * của `theme-core.css` bằng CSS đã biên dịch, loader `copy` ghi nguyên văn kết quả đó.
 */
const compiledCss = (name, app, limit) => ({
  name,
  path: "dist/theme-core.css",
  gzip: true,
  limit,
  modifyEsbuildConfig: (config) => ({
    ...config,
    loader: { ".css": "copy" },
    plugins: [
      ...(config.plugins ?? []),
      {
        name: "compiled-css",
        setup(build) {
          build.onLoad({ filter: /theme-core\.css$/ }, async () => {
            const { compileCss, leanCss, usedFolders } = await import("./scripts/measure-css.mjs");
            const dir = app && require("node:path").resolve(__dirname, app);
            return { contents: await compileCss(leanCss(dir ? usedFolders(dir) : [], dir)), loader: "copy" };
          });
        },
      },
    ],
  }),
});

module.exports = [
  // Sortable (#175): 304.4 → 310.8 kB. Form control mới (#173): 309.3 → 318.0 kB. NavigationMenu + StatusPage
  // (#168, #238): → ~328 kB.
  // #360: mọi giới hạn đặt lại = đo được + 8%. cvx (#355) thêm 0.25–0.28 kB cho mục có Button, Input, Badge, Tag….
  js("Toàn bộ thư viện (import *)", "*", "355.5 kB"),
  js("{ cn }", "{ cn }", "10 kB"),
  // cvx (#355): 12.95 → 13.22 kB.
  js("{ Button }", "{ Button }", "14.5 kB"),
  // Toaster nạp lúc cần (#346): 25.95 → 13.52 kB (lần tải đầu; Toaster là chunk riêng).
  js("{ YugenProvider }", "{ YugenProvider }", "15 kB"),
  // Một app cỡ vừa: provider, form, dialog, menu, tooltip, tabs, card (#360): 57.79 kB khi thêm.
  js(
    "App: 22 common exports",
    "{ YugenProvider, Button, Input, Field, Checkbox, Switch, Select, Dialog, DialogTrigger, DialogSurface, Menu, MenuTrigger, MenuPopover, MenuItem, SimpleTooltip, Tabs, TabsList, TabsTrigger, TabsContent, Card, Badge, Avatar }",
    "62.5 kB",
  ),
  js("{ Dialog, DialogSurface }", "{ Dialog, DialogSurface }", "26 kB"),
  // Listbox riêng thay cmdk (#351): 42.57 → 38.59 kB.
  js("{ Combobox }", "{ Combobox }", "42 kB"),
  // #351: không cmdk, Sortable nạp lúc cần khi `reorderable`: 50.30 → 40.38 kB.
  js("{ TagPicker }", "{ TagPicker }", "44 kB"),
  // Calendar không kéo locale vi của react-day-picker (#349): 61.93 → 59.72 kB.
  js("{ DatePicker }", "{ DatePicker }", "65 kB"),
  // #173: họ DatePicker dùng chung vỏ; MonthPicker / DateTimePicker kéo theo Calendar (react-day-picker) như DatePicker.
  // Không kéo locale vi (#349): 69.00 → 66.76 kB.
  js("{ MonthPicker, YearPicker, DateTimePicker }", "{ MonthPicker, YearPicker, DateTimePicker }", "72.5 kB"),
  js("{ PasswordInput, FormattedInput }", "{ PasswordInput, FormattedInput }", "17 kB"),
  js("{ ColorPicker }", "{ ColorPicker }", "30 kB"),
  // Hình học / nhãn nhớ theo props, lớp điểm dùng chung, màu tô trên nhóm (#352): 30.18 → 31.10 kB.
  js("{ BarChart, LineChart }", "{ BarChart, LineChart }", "34 kB"),
  // Trước đây `{ Sheet }`: chỉ context gốc (5.87 kB); SheetContent mới là phần nặng (#360): 27.52 kB.
  js("{ Sheet, SheetTrigger, SheetContent }", "{ Sheet, SheetTrigger, SheetContent }", "30 kB"),
  // Nav không import Tooltip, Sidebar của AppShell truyền Tooltip của rail (#350): 31.40 → 12.33 kB.
  js("{ Nav, NavItem }", "{ Nav, NavItem }", "13.5 kB"),
  // Menu của nút "…" nạp lúc cần (#350): 42.49 → 13.04 kB (lần tải đầu; menu là chunk riêng).
  js("{ Breadcrumb }", "{ Breadcrumb }", "14.5 kB"),
  // #168: Radix Navigation Menu (dependency mới) + viewport.
  js("{ NavigationMenu }", "{ NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink }", "26 kB"),
  js("{ StatusPage, ErrorBoundary }", "{ StatusPage, ErrorBoundary }", "18 kB"),
  js("{ Trace }", "{ Trace }", "18 kB"),
  js("{ MessageScroller }", "{ MessageScroller }", "22 kB"),
  js("{ CodeBlock }", "{ CodeBlock }", "21.5 kB"),
  js("{ DataGrid }", "{ DataGrid }", "28 kB"),
  // Sortable tự viết (#175): 20.76 kB khi thêm, phần riêng ~6.5 kB (dnd-kit core + sortable: 16.6 kB).
  js("{ Sortable, SortableItem, SortableHandle }", "{ Sortable, SortableItem, SortableHandle }", "19.5 kB"),
  // Citation (Popover) nạp lúc cần (#350): 57.00 → 32.42 kB (lần tải đầu; Citation là chunk riêng).
  js("{ StreamingMarkdown, PromptInput }", "{ StreamingMarkdown, PromptInput }", "35.5 kB"),
  // Chuỗi của 6 component mới (#173): 4.80 → 5.11 kB; NavigationMenu + StatusPage (#168, #238): → ~5.7 kB.
  js("{ messagesEn }", "{ messagesEn }", "6.5 kB"),
  // Bộ tiếng Việt, chỉ khi import (#277: mặc định là tiếng Anh): 17.7 kB khi thêm, phần lớn là locale vi của
  // react-day-picker cho Calendar / DatePicker.
  js("{ messagesVi }", "{ messagesVi }", "20 kB"),
  // Sonner, Timeline, DescriptionList, Stat, utility yugen-prose (#174, #234): 24.6 kB khi thêm.
  // AppShell / Sidebar + rail của Nav (#161): 24.97 kB khi thêm; 25.08 kB với layout / scroll / footer. styles.css luôn
  // chứa mọi component (#169 không làm nó nhỏ đi).
  css("styles.css", "29 kB"),
  // Glass (#178): token + utility + fallback trợ năng (12.49 / 8.15 kB khi thêm). Prose: biến --prose-* và 4 preset (#244).
  // #353: theme.css chỉ còn `@import "./theme-core.css"` + `@source` (14.68 → 0.18 kB), nên theme được đo ở theme-core.css:
  // 14.69 → 14.79 kB (token animate-wave-flow, keyframes vào @theme).
  css("theme-core.css", "16 kB"),
  // Hai dòng: giới hạn tính theo byte (0.5 kB sẽ gần gấp 3 kích thước).
  css("theme.css", "200 B"),
  // #353: bỏ khối @theme của charts.css, 8.22 → 8.02 kB.
  css("tokens.css", "9 kB"),
  // CSS đã biên dịch (#360): sàn của mọi app dùng theme-core.css (6.74 kB), và Starter với sources của 5 thư mục nó
  // import (13.08 kB; 26.7 kB với theme.css quét mọi component, scripts/measure-css.mjs).
  compiledCss("theme-core.css compiled (floor)", null, "7.5 kB"),
  compiledCss("Starter: lean CSS compiled", "src/docs/template-library/starter", "14.5 kB"),
];
