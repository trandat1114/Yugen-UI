# Lộ trình Yugen UI · Roadmap

<!-- Sinh từ src/docs/roadmap.ts bằng `npm run roadmap`. Đừng sửa tay. -->

Kế hoạch theo từng bản phát hành, cập nhật 2026-10-23. Mỗi bản là một milestone trên GitHub; ưu tiên, độ lớn và
phụ thuộc nằm ở [GitHub Project](https://github.com/users/trandat1114/projects/6). `[x]` đã xong, `[~]` đang làm, `[ ]` dự kiến.

Muốn nhận một mục? Bình luận vào issue trước khi bắt tay làm. English: the community page
(https://trandat1114.github.io/Yugen-UI/?lang=en#/community) shows the same roadmap.

## Đang làm

### 0.8.4 · bản vá · hạn 2026-10-30

Công cụ và docs: E2E nhanh hơn, Node mới, nội dung gọn và đúng tên gọi.

- [x] E2E từ ~20 còn 4,4 phút: container Playwright, chạy trên bản build, a11y theo theme (#43)
- [x] CI trên Node.js 22, 24 và 26 (#60)
- [x] Có gì mới có tab riêng cho yugen-ui, @yugen-ui/cli và create-yugen-ui (#61)
- [x] Trang Giới thiệu viết lại, gọi CLI đúng tên @yugen-ui/cli (#48)
- [~] Quy tắc viết nội dung cho docs, template và CLI (#52)
- [~] Mô tả template một dòng (#57)
- [~] Lộ trình lấy từ một nguồn, trang Cộng đồng đầy đủ tiếng Anh (#58)

### cli 0.2.0 · hạn 2026-10-30

CLI cùng 0.8.4.

- [x] Yêu cầu Node.js 22 trở lên (#60)
- [~] Tên template ngắn: Starter, SaaS, Blog, Dashboard, AI chat (#53)

## Tiếp theo

### 0.9.0 · minor · hạn 2026-11-27

React 19 làm mặc định và thang spacing theo số.

- [ ] React 19 cho dev, docs và template; React 18 vẫn hỗ trợ, báo trước ngày ngừng (#62)
- [ ] So sánh ảnh chụp trên mọi PR đổi giao diện (#41)
- [ ] Spacing theo thang số (p-3, gap-5); class viết hoa vẫn chạy nhưng được đánh dấu deprecated (#42)
- [ ] E2E cho bàn phím, focus và các luồng chính của docs (#39)
- [ ] Thẻ demo của starter chuyển thành Blocks (#56)
- [ ] CI tự theo lịch phát hành của Node.js (#59)

### cli 0.3.0 · hạn 2026-11-27

CLI cùng 0.9.0.

- [ ] Starter tối giản, tiếng Anh mặc định, hai thương hiệu Sakura và Web (#54)
- [ ] create --lang en|vi chọn ngôn ngữ cho app được tạo (#55)

## Sau đó

### 0.10.0 · minor · hạn 2027-01-29

Trải nghiệm docs.

- [ ] Theme Designer: bo góc, mật độ, font, màu trung tính, bóng, chuyển động (#44)
- [ ] Trang Motion: hướng dẫn theo component, playground, xem trước giảm chuyển động (#45)
- [ ] Sidebar docs kéo được độ rộng, thu gọn về dạng icon (#46)
- [ ] Kiểm thử trên Firefox và WebKit theo lịch (#40)

### 1.0.0 · major

API ổn định. Chưa định ngày: phát hành khi danh sách điều kiện hoàn tất.

- [ ] Rà soát API, gỡ deprecation, quyết định về React 18 và class spacing viết hoa (#65)
- [ ] SEO: URL theo đường dẫn, prerender từng trang, sitemap (#63)

### Backlog

Chưa xếp lịch.

- [ ] Docs tiếng Anh cho trang component và các trang khái niệm còn lại (#69)
- [ ] CLI giai đoạn 2: diff, update, theme, remove (#64)
- [ ] Đăng ký @yugen vào danh mục registry của shadcn (#68)
- [ ] Đang cân nhắc: bộ Figma, gói icon Sakura

## Đã phát hành

Chi tiết ở trang Có gì mới (`#/news`) và `CHANGELOG.md`.

- **0.8.3** (2026-10-22): Lệnh tạo dự án chạy được trên PowerShell
- **0.8.2** (2026-10-22): CLI @yugen-ui/cli
- **0.8.1** (2026-10-22): Docs gọn hơn trên điện thoại
- **0.8.0** (2026-10-21): Templates, shadcn init một lệnh & SEO
- **0.7.0** (2026-10-21): Quote, Autocomplete & SearchBox dễ nhìn hơn
- **0.6.0** (2026-10-21): DataGrid, bộ AI, registry shadcn & kiểm thử tự động
- **0.5.0** (2026-10-20): Yugen Labs, gói npm & cộng đồng
- **0.4.0** (2026-10-20): Khái niệm, RTL & tương phản cao
- **0.3.0** (2026-10-20): Yugen UI ra đời — Sakura 桜
- **0.2.0** (2026-10-20): Ngôn ngữ thiết kế theo Fluent 2
- **0.1.0** (2026-10-20): Nền móng
