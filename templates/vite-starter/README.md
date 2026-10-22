# Yugen Starter

<p lang="ja">はじまりは、いつも静かに。</p>

Điểm khởi đầu "trắng" của [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite + React + Tailwind CSS v4 đã nối
sẵn, kèm một trang chào để bạn thấy thư viện làm được gì — rồi xoá đi khi bắt đầu viết ứng dụng.

```bash
npm create yugen-ui@latest my-app -- --template starter
cd my-app
npm run dev
```

Không dùng CLI: `npx giget@latest gh:trandat1114/Yugen-UI/templates/vite-starter my-app --install`. Không muốn cài gì? Mở thẳng
trên StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-starter

Kiểm tra cấu hình bất cứ lúc nào: `npx @yugen-ui/cli doctor` (CLI yugen, https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## Đã có sẵn

- `YugenProvider` với theme sáng / tối / tương phản cao và thương hiệu Sakura / Web / Teams, **ghi nhớ** trong `localStorage`
  và **không nháy** khi tải lại (script nhỏ trong `index.html`).
- `toast()` dùng được ở mọi nơi, Tooltip, focus ring, RTL.
- Alias `@/` → `src/` (`vite.config.ts` + `tsconfig.json`).
- SEO cơ bản: `description`, Open Graph, `theme-color`, favicon, `robots.txt`.
- Build tách chunk vendor, không cảnh báo dung lượng.
- Trang chào: hero chữ dọc 幽玄, cánh hoa anh đào rơi (tự tắt khi bật "giảm chuyển động"), sáu thẻ component chạy thật.

## Bắt đầu viết ứng dụng

1. Mở `src/App.tsx`, thay `<Welcome />` bằng component của bạn.
2. Xoá `src/Welcome.tsx` và `src/Sakura.tsx` khi không cần nữa; bỏ thẻ `<link>` font Shippori Mincho trong `index.html`.
3. Thêm component: `import { Button, DataGrid } from "yugen-ui"` — ví dụ ở [tài liệu](https://trandat1114.github.io/Yugen-UI/).

## Cấu trúc

```
src/
  App.tsx        # YugenProvider, lưu theme — điểm bắt đầu của bạn
  Welcome.tsx    # trang chào (xoá được)
  Sakura.tsx     # cánh hoa, bông hoa SVG, font chữ Nhật (xoá được)
  index.css      # @import "tailwindcss" + theme Yugen
  main.tsx
```

File trong `src/` sinh từ `src/docs/template-library/starter` (và `src/docs/block-library`) bằng `scripts/sync-templates.mjs`.
