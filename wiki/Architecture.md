# Architecture · Kiến trúc

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
templates/                         starter template sinh từ block (sync-templates)
wiki/                              nguồn của GitHub Wiki này
e2e/                               Playwright (a11y, visual, touch)
```

## Token 3 lớp

```
Global   --brand-80, --grey-14, --shared-teal          (giá trị thô, chỉ tokens.css dùng)
  ↓
Alias    --colorBrandBackground, --spacingM, --shadow16  (tên Fluent UI v9)
  ↓
Utility  bg-brand-background, p-M, shadow-16            (component chỉ dùng lớp này)
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
  `ComponentDoc` bằng TypeScript compiler API → sidebar, tìm kiếm, trang chủ hiện ngay; demo nạp lười theo file registry.
  Vì vậy 4 trường này **phải là chuỗi literal**.
- **`virtual:yugen-type-exports`**: danh sách type export, để converter StackBlitz tự thêm `import { type X }`.
- **Ví dụ chạy độc lập**: `Example.code` (+ `setup` dùng chung) → `exampleToApp()` (src/docs/stackblitz.ts). Cùng hàm này
  dùng cho nút StackBlitz và `npm run check:examples`.
- **Registry shadcn**: `scripts/build-registry.mjs` suy ra dependency npm và component phụ thuộc từ import của từng file.

## Quyết định thiết kế chính

| Quyết định | Lý do |
|---|---|
| Tailwind v4 CSS-first, reset scale mặc định | Buộc dùng token, không lẫn `bg-blue-500` |
| Spacing hậu tố viết hoa (`p-M`) | Không va chạm thang container của Tailwind (`max-w-xl`) |
| Radix + cmdk + react-day-picker | Hành vi & a11y đã được kiểm chứng |
| Chart SVG tự viết | Kiểm soát màu theo token, a11y (bảng dữ liệu, bàn phím), không thêm dependency nặng |
| Logical properties + `rtl:` | RTL không cần code riêng |
