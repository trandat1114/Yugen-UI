# Yugen UI Roadmap

<!-- Sinh từ src/docs/roadmap.ts bằng `npm run roadmap`. Đừng sửa tay. -->

*Tiếng Việt: [xem bên dưới](#tiếng-việt).*

Plans for each release, updated 2026-11-03. Each release is a GitHub milestone; priority, size and
dependencies are in the [GitHub Project](https://github.com/users/trandat1114/projects/6). `[x]` done, `[~]` in progress, `[ ]` planned.

Want to pick something up? Comment on the issue before you start. The same roadmap is on the
[community page](https://trandat1114.github.io/Yugen-UI/community).

## Now

### 0.14.0 · minor · due 2026-11-11

AppShell, Sortable, shared hooks, CSS for the components you use and a Contributors page.

- [x] AppShell and Sidebar: an icon rail on wide screens, a Drawer on narrow ones; the templates are built on it (#161)
- [x] Sortable: reorder by drag and drop or keyboard; DataGrid column order, TagPicker tag order, a Kanban board in the Admin template (#175)
- [x] Shared hooks, the ones the components use themselves: useControllableState, useDisclosure, useLocalStorage, useHotkeys… (#172)
- [x] CSS for the components you use: theme-core.css and sources/<Component>.css; templates go from about 25 kB to 14–19 kB gzip (#169)
- [x] Markdown: render static Markdown (articles, release notes, CMS fields) with Prose typography (#263)
- [x] Contributors page: credits merged PRs, bug reports, suggestions and reviews (#248)
- [x] What's new in English; release notes in Markdown, a light CI check for news-only PRs (#261)
- [x] Docs on phones: the props and Messages tables never scroll sideways, every component page fits 375px (#266)
- [~] English by default: the docs at the root (Vietnamese under /vi/, with a suggestion for Vietnamese browsers) and components' built-in text (messagesVi for Vietnamese) (#277)
- [~] Contributor avatars in CONTRIBUTING.md and the README, updated a few minutes after each contribution (#275)

### 1.0.0 · major

Stable API. No fixed date: ships when the readiness checklist is done.

- [ ] API review, deprecations removed, decisions on React 18 and upper-case spacing (#65)
- [x] SEO: path URLs, prerendered pages, sitemap (#63)
- [ ] 1.0 proposals (approved): Form, NavigationMenu, blocks 2.0, codemods, testing (#160)
- [ ] @yugen-ui/cli writes the @import lines for per-component CSS (init, doctor) (#169)
- [~] Repository documents in English first, Vietnamese below: CONTRIBUTING, README, ROADMAP, issue / PR templates, Design.md, wiki (#276)
- [ ] Demo content in English: docs examples, blocks and templates (#278)
- [ ] Scroll lock: keep or hide the page scrollbar while Menu, ContextMenu or Dropdown is open (#243)
- [ ] Typography: a Typeset page to tune Prose (fonts, size, spacing) and copy the CSS (#244)

## Next

### Backlog

Not scheduled yet.

- [ ] Glass: a YugenProvider default that switches navigation components to glass (after #171) (#230)
- [ ] Register @yugen in the shadcn registry index (#68)
- [ ] Under consideration: Figma kit, Sakura icon set

## Released

Details on What's new (`/news`) and in `CHANGELOG.md`.

- **0.13.0** (2026-10-28): Refraction for glass, cherry blossom season in the Glass template
- **0.12.0** (2026-10-27): Glass, six new templates and a column picker for DataGrid
- **0.11.1** (2026-10-26): Skeleton's wave animation runs smoothly again
- **0.11.0** (2026-10-25): Replaceable UI strings, English docs and new templates
- **0.10.0** (2026-10-23): Numeric spacing, Theme Designer and a Motion page
- **0.9.0** (2026-10-23): React 19 and a minimal starter
- **0.8.3** (2026-10-22): Create-project commands work in PowerShell
- **0.8.2** (2026-10-22): The @yugen-ui/cli command line tool
- **0.8.1** (2026-10-22): Tidier docs on phones
- **0.8.0** (2026-10-21): Templates, one-command shadcn init and SEO
- **0.7.0** (2026-10-21): Quote, Autocomplete and a clearer SearchBox
- **0.6.0** (2026-10-21): DataGrid, an AI kit, a shadcn registry and automated tests
- **0.5.0** (2026-10-20): Yugen Labs, the npm package and community
- **0.4.0** (2026-10-20): Concepts, RTL and high contrast
- **0.3.0** (2026-10-20): Yugen UI is born: Sakura 桜
- **0.2.0** (2026-10-20): A design language based on Fluent 2
- **0.1.0** (2026-10-20): Groundwork

---

## Tiếng Việt

Kế hoạch theo từng bản phát hành, cập nhật 2026-11-03. Mỗi bản là một milestone trên GitHub; ưu tiên, độ lớn và
phụ thuộc nằm ở [GitHub Project](https://github.com/users/trandat1114/projects/6). `[x]` đã xong, `[~]` đang làm, `[ ]` dự kiến.

Muốn nhận một mục? Bình luận vào issue trước khi bắt tay làm. Trang [Cộng đồng](https://trandat1114.github.io/Yugen-UI/vi/community) có cùng lộ trình.

### Đang làm

#### 0.14.0 · minor · hạn 2026-11-11

AppShell, Sortable, hooks dùng chung, CSS theo component dùng và trang Người đóng góp.

- [x] AppShell và Sidebar: thu về icon trên màn rộng, Drawer trên màn hẹp; các template dựng trên nó (#161)
- [x] Sortable: sắp xếp lại bằng kéo thả hoặc bàn phím; thứ tự cột của DataGrid, thứ tự tag của TagPicker, Kanban trong template Admin (#175)
- [x] Hooks dùng chung, chính là những hook các component dùng: useControllableState, useDisclosure, useLocalStorage, useHotkeys… (#172)
- [x] CSS theo component dùng: theme-core.css và sources/<Component>.css; template từ khoảng 25 kB xuống 14–19 kB gzip (#169)
- [x] Markdown: hiển thị Markdown tĩnh (bài viết, ghi chú phát hành, CMS) theo kiểu chữ của Prose (#263)
- [x] Trang Người đóng góp: ghi tên người gửi PR, báo lỗi, đề xuất và review (#248)
- [x] Có gì mới bằng tiếng Anh; tin viết bằng Markdown, CI nhẹ cho PR chỉ sửa tin (#261)
- [x] Docs trên điện thoại: bảng props và bảng Messages không cuộn ngang, mọi trang component vừa 375px (#266)
- [~] Tiếng Anh mặc định: docs ở gốc (tiếng Việt dưới /vi/, có gợi ý cho trình duyệt tiếng Việt) và chữ có sẵn của component (messagesVi cho tiếng Việt) (#277)
- [~] Ảnh người đóng góp trong CONTRIBUTING.md và README, cập nhật vài phút sau mỗi đóng góp (#275)

#### 1.0.0 · major

API ổn định. Chưa định ngày: phát hành khi danh sách điều kiện hoàn tất.

- [ ] Rà soát API, gỡ deprecation, quyết định về React 18 và class spacing viết hoa (#65)
- [x] SEO: URL theo đường dẫn, prerender từng trang, sitemap (#63)
- [ ] Đề xuất cho 1.0 (đã duyệt): Form, NavigationMenu, block 2.0, codemod, kiểm thử (#160)
- [ ] @yugen-ui/cli ghi các dòng @import của CSS theo component (init, doctor) (#169)
- [~] Tài liệu repo tiếng Anh trước, tiếng Việt bên dưới: CONTRIBUTING, README, ROADMAP, template issue / PR, Design.md, wiki (#276)
- [ ] Nội dung demo bằng tiếng Anh: ví dụ trên docs, block và template (#278)
- [ ] Khóa cuộn: chọn giữ hay ẩn thanh cuộn khi mở Menu, ContextMenu, Dropdown (#243)
- [ ] Typography: trang Typeset tinh chỉnh Prose (font, cỡ chữ, khoảng cách) và copy CSS (#244)

### Tiếp theo

#### Backlog

Chưa xếp lịch.

- [ ] Glass: YugenProvider đổi mọi component điều hướng sang glass (sau #171) (#230)
- [ ] Đăng ký @yugen vào danh mục registry của shadcn (#68)
- [ ] Đang cân nhắc: bộ Figma, gói icon Sakura

### Đã phát hành

Chi tiết ở trang Có gì mới (`/news`) và `CHANGELOG.md`.

- **0.13.0** (2026-10-28): Khúc xạ cho glass, mùa hoa anh đào trong template Glass
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
