# Architecture · Kiến trúc

*English: [Architecture](Architecture).*

## Cấu trúc repo

```
src/
  styles/tokens.css, charts.css   token Global + Alias (light / dark / high contrast, brand) — nguồn giá trị duy nhất
  index.css                        tắt scale mặc định Tailwind, @theme bridge, @utility, keyframes
  lib/                             cn(), brandRamp, tokenExport, deprecate
  components/ui/<Name>/            1 component = 1 thư mục; barrel index.ts theo nhóm
  lib.ts                           entry gói npm
  docs/                            site docs (không thuộc gói)
    registry/*.tsx                 trang component (ComponentDoc) — nạp lười theo file
    concepts/, block-library/      trang khái niệm, block
    i18n/                          VI / EN
scripts/                           build CSS, registry shadcn, các bước check
templates/                         starter template sinh từ block + src/docs/template-library (sync-templates)
wiki/                              nguồn của GitHub Wiki này
e2e/                               Playwright (a11y, visual, touch)
```

## Token 3 lớp

```
Global   --brand-80, --grey-14, --shared-teal          (giá trị thô, chỉ tokens.css dùng)
  ↓
Alias    --colorBrandBackground, --spacingM, --shadow16  (tên Fluent UI v9)
  ↓
Utility  bg-brand-background, p-3, shadow-16            (component chỉ dùng lớp này)
```

Theme / brand đổi bằng `data-theme` / `data-brand` trên bất kỳ phần tử nào → lồng theme được. Chi tiết: Design.md §2–§4.

## Các bản build

| Lệnh | Ra | Ghi chú |
|---|---|---|
| `npm run build:lib` | `dist/` | ESM `preserveModules`, `.d.ts`, `"use client"` trên mỗi file component; `theme.css`, `styles.css`, `tokens.css` (scripts/build-css.mjs) |
| `npm run build:docs` | `dist-docs/` + `public/r/` | Chạy `npm run registry` (item shadcn) rồi Vite build site docs |
| Pages workflow | GitHub Pages | Thêm docs các minor cũ vào `/vX.Y/` từ tag (scripts/build-versioned-docs.mjs) |

## Site docs — những phần "ẩn"

- **Metadata trích lúc build**: plugin `yugenDocsMeta` (vite.plugins.ts) đọc `slug / name / category / lead` của mọi
  `ComponentDoc` bằng parser Oxc đi kèm Vite (`parseSync`; TypeScript 7 không có JavaScript API) → sidebar, tìm kiếm,
  trang chủ hiện ngay; demo nạp lười theo file registry. Vì vậy 4 trường này **phải là chuỗi literal**.
- **Demo tiếng Việt**: demo, code mẫu và block chỉ viết một lần, bằng tiếng Anh. Plugin `yugenDemoLang` phục vụ
  `<file>.tsx?lang=vi` với chuỗi đã thay theo `registry/vi/<file>.json` (block: `block-library/vi/`), chỉ khớp nguyên văn.
  Trang `/vi/` nạp module đó thay cho file gốc, nên HTML prerender đã là tiếng Việt. Một lượt build client chạy trước ghi
  lại module nào vào chunk `common` / `icons`, để module tiếng Việt không làm đổi chunk tiếng Anh; vì vậy build client
  lâu gấp khoảng hai lần.
- **Chunk** (`vite.config.ts`): React, `shell` (những gì entry import), `messages`, `icons` (họ icon dùng ở 4+ trang) và
  `common` (code thư viện dùng ở 16+ trang). Phần còn lại tách theo route. Gom cả thư viện từng làm trang nào cũng tải
  ~465 kB, nên đừng thêm nhóm theo package. `vite.perf.ts › fluentIconAtoms` đổi import `@fluentui/react-icons` sang file
  theo họ icon để shell không kéo theo mọi icon.
- **Prefetch** (`src/docs/prefetch.ts`): rê chuột, focus hoặc chạm vào link nội bộ thì nạp chunk, demo và bản dịch của
  trang đó một lần. Bỏ qua khi bật Save-Data hoặc mạng 2G.
- **Service worker** (`src/docs/sw/sw.js`): file có hash lấy từ cache trước, trang lấy từ mạng trước và giữ bản offline.
  Tắt: [Operations Handbook](Operations-Handbook-vi) › Service worker của docs.
- **`virtual:yugen-type-exports`**: danh sách type export, để converter StackBlitz tự thêm `import { type X }`.
- **Ví dụ chạy độc lập**: `Example.code` (+ `setup` dùng chung) → `exampleToApp()` (src/docs/stackblitz.ts). Cùng hàm này
  dùng cho nút StackBlitz và `npm run check:examples`.
- **Registry shadcn**: `scripts/build-registry.mjs` suy ra dependency npm và component phụ thuộc từ import của từng file.

## Quyết định thiết kế chính

| Quyết định | Lý do |
|---|---|
| Tailwind v4 CSS-first, reset scale mặc định | Buộc dùng token, không lẫn `bg-blue-500` |
| Spacing theo thang số của Tailwind (`p-3`) | Ramp Fluent trùng thang 4px của Tailwind; code từ shadcn/ui dùng thẳng được. Alias viết hoa (`p-M`) deprecated từ 0.10 (#42) |
| Radix + cmdk + react-day-picker | Hành vi & a11y đã được kiểm chứng |
| Chart SVG tự viết | Kiểm soát màu theo token, a11y (bảng dữ liệu, bàn phím), không thêm dependency nặng |
| Logical properties + `rtl:` | RTL không cần code riêng |
| Chỉ dùng TypeScript 7 | Trình biên dịch native kiểm tra kiểu nhanh ~5 lần. Script build parse bằng Oxc (từ Vite); `check:props` dùng API đồng bộ của TypeScript 7 |
| Demo tiếng Anh + từ điển tiếng Việt theo file | Code demo chỉ một bản; trang `/vi/` vẫn đọc tự nhiên, test liệt kê chuỗi chưa dịch |
