# Lộ trình Yugen UI · Roadmap

<!-- Sinh từ src/docs/roadmap.ts bằng `npm run roadmap`. Đừng sửa tay. -->

Kế hoạch theo từng bản phát hành, cập nhật 2026-10-28. Mỗi bản là một milestone trên GitHub; ưu tiên, độ lớn và
phụ thuộc nằm ở [GitHub Project](https://github.com/users/trandat1114/projects/6). `[x]` đã xong, `[~]` đang làm, `[ ]` dự kiến.

Muốn nhận một mục? Bình luận vào issue trước khi bắt tay làm. English: the community page
(https://trandat1114.github.io/Yugen-UI/community?lang=en) shows the same roadmap.

## Đang làm

### 0.13.0 · minor · hạn 2026-11-10

Khúc xạ cho glass, mùa hoa anh đào trong template Glass, Sonner và bốn component hiển thị.

- [x] Glass phần 2: menu mọc từ nút, thumb glass cho Slider và Switch, trục Glass trong Theme Designer (#210)
- [x] GlassRefraction: mép bề mặt glass bẻ cong nền phía sau (Chromium); template Glass có chuyến đi ở Nhật Bản và xem trước trên ảnh (#227)
- [x] Trang Templates: xem toàn màn hình, một khung lớn cho các template khác (#224)
- [x] Checkbox, Switch, Field: input ẩn của form không kéo dài trang (#223)
- [x] Sonner: thông báo xếp chồng, theo promise từ loading tới success / error (#234)
- [x] Timeline, DescriptionList, Stat và Prose; template Blog và Docs dùng Prose (#174)

### 1.0.0 · major

API ổn định. Chưa định ngày: phát hành khi danh sách điều kiện hoàn tất.

- [ ] Rà soát API, gỡ deprecation, quyết định về React 18 và class spacing viết hoa (#65)
- [x] SEO: URL theo đường dẫn, prerender từng trang, sitemap (#63)
- [ ] Đề xuất cho 1.0 (đang chờ duyệt): AppShell, Form, NavigationMenu, block 2.0, codemod, kiểm thử (#160)

## Tiếp theo

### Backlog

Chưa xếp lịch.

- [ ] Glass: YugenProvider đổi mọi component điều hướng sang glass (sau #171) (#230)
- [ ] Đăng ký @yugen vào danh mục registry của shadcn (#68)
- [ ] Đang cân nhắc: bộ Figma, gói icon Sakura

## Đã phát hành

Chi tiết ở trang Có gì mới (`/news`) và `CHANGELOG.md`.

- **0.12.0** (2026-10-27): Glass, sáu template mới và chọn cột trong DataGrid
- **0.11.1** (2026-10-26): Hiệu ứng wave của Skeleton chạy mượt trở lại
- **0.11.0** (2026-10-25): Chuỗi giao diện thay được, docs tiếng Anh và template mới
- **0.10.0** (2026-10-23): Spacing theo thang số, Theme Designer và trang Motion
- **0.9.0** (2026-10-23): React 19 và starter tối giản
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
