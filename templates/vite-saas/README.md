# Sakura Studio · Yugen UI

Starter template của [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) — ứng dụng SaaS hoàn chỉnh trên Vite + React +
Tailwind CSS v4, sẵn sàng thay dữ liệu thật.

```bash
npm create yugen-ui@latest my-app -- --template saas
cd my-app
npm run dev
```

Không dùng CLI: `npx giget@latest gh:trandat1114/Yugen-UI/templates/vite-saas my-app --install`. Không muốn cài gì? Mở thẳng
trên StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-saas

Kiểm tra cấu hình bất cứ lúc nào: `npx yugen doctor` (CLI yugen, https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## Có gì bên trong

- Sidebar `Nav` có nhóm và số đếm; trên màn hẹp chuyển thành `Drawer` (container query, không cần JS đo kích thước).
- Bảng lệnh **Ctrl / ⌘ K**: chuyển trang, đổi theme / thương hiệu, hành động nhanh.
- `NotificationCenter`, menu tài khoản, breadcrumb, nút xuất báo cáo có `toast`.
- Theme sáng / tối / tương phản cao + thương hiệu Sakura / Web / Teams, lưu vào `localStorage`, **không nháy** khi tải lại
  (script nhỏ trong `index.html`).
- 8 trang mẫu ghép từ block: Tổng quan, Phân tích, Trợ lý AI, Hộp thư, Lịch hẹn, Đội ngũ, Thanh toán, Cài đặt.
- Định tuyến bằng hash (`#/analytics`) không thêm thư viện; tiêu đề tab và `<meta name="description">` đổi theo trang.
- Sẵn cho SEO cơ bản: `description`, Open Graph, `theme-color`, `robots.txt`.

## Cấu trúc

```
src/
  App.tsx             # gốc: YugenProvider, định tuyến hash, lưu theme, tiêu đề trang
  AppShell.tsx        # khung: sidebar, thanh trên, Drawer, nội dung
  CommandPalette.tsx  # bảng lệnh Ctrl K
  pages.tsx           # danh sách trang — thêm một mục là có trang mới trên sidebar & bảng lệnh
  blocks/             # các block giao diện, sửa thoải mái
```

## Tuỳ biến nhanh

- **Thêm trang**: thêm một mục vào `PAGES` trong `src/pages.tsx`.
- **Đổi thương hiệu mặc định**: sửa `"sakura"` trong `index.html` và `App.tsx`; tự tạo bảng màu ở
  [Theme Designer](https://trandat1114.github.io/Yugen-UI/#/theme-designer).
- **Dùng router thật** (React Router, TanStack Router): thay `pageFromHash` / `navigate` trong `App.tsx`, truyền `href` của
  router vào `NavItem` (`asChild`).

File trong `src/` sinh từ `src/docs/template-library/saas` (và `src/docs/block-library`) bằng `scripts/sync-templates.mjs`.
