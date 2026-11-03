# Yugen UI Roadmap

<!-- Sinh từ src/docs/roadmap.ts bằng `npm run roadmap`. Đừng sửa tay. -->

*Tiếng Việt: [xem bên dưới](#tiếng-việt).*

Plans for each release, updated 2026-11-04. Each release is a GitHub milestone; priority, size and
dependencies are in the [GitHub Project](https://github.com/users/trandat1114/projects/6). `[x]` done, `[~]` in progress, `[ ]` planned.

Want to pick something up? Comment on the issue before you start. The same roadmap is on the
[community page](https://trandat1114.github.io/Yugen-UI/community).

## Now

### 0.15.0 · minor · due 2026-11-25

Reviews before 1.0 (API, Labs, security), default props and density from YugenProvider, a scroll lock setting.

- [~] API review: new names for the outlier props, old names deprecated until 1.0 (#157)
- [ ] Yugen Labs: promote what is mature, mark the rest experimental (#158)
- [x] Default props and density from YugenProvider (#171)
- [ ] Glass as a default for navigation components, through default props (#230)
- [ ] Scroll lock: keep or hide the page scrollbar while Menu, ContextMenu or Dropdown is open (#243)
- [ ] Security review of components that render untrusted content (#165)
- [x] Built-in icons: installing yugen-ui is ~180 MB lighter (#320)
- [x] React 19 only: React 18 leaves the peer dependencies and CI (#62)

### 0.16.0 · minor · due 2026-12-09

The missing pieces of a complete kit.

- [ ] NavigationMenu for website headers (#168)
- [ ] Missing form controls: PasswordInput, formatted inputs, month / year / date-time pickers, ColorPicker (#173)
- [ ] Typography: a Typeset page to tune Prose (fonts, size, spacing) and copy the CSS (#244)
- [ ] HTTP status pages: a StatusPage component, a docs 404 route, not-found routes in the templates (#238)
- [ ] A unit test floor for every component, with coverage in CI (#167)
- [ ] Visual regression for every component (3 themes + RTL) (#166)

### 1.0.0 · major

Stable API. No fixed date: ships when the readiness checklist is done.

- [ ] API review, deprecations removed, decision on upper-case spacing (#65)
- [x] SEO: path URLs, prerendered pages, sitemap (#63)
- [ ] 1.0 proposals (approved): Form, NavigationMenu, blocks 2.0, codemods, testing (#160)
- [ ] @yugen-ui/cli writes the @import lines for per-component CSS (init, doctor) (#169)

## Next

### Backlog

Not scheduled yet.

- [ ] Glass: a YugenProvider default that switches navigation components to glass (after #171) (#230)
- [ ] Register @yugen in the shadcn registry index (#68)
- [ ] Under consideration: Figma kit, Sakura icon set

## Released

Details on What's new (`/news`) and in `CHANGELOG.md`.

- **0.14.0** (2026-11-03): AppShell, Sortable and a Contributors page
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

Kế hoạch theo từng bản phát hành, cập nhật 2026-11-04. Mỗi bản là một milestone trên GitHub; ưu tiên, độ lớn và
phụ thuộc nằm ở [GitHub Project](https://github.com/users/trandat1114/projects/6). `[x]` đã xong, `[~]` đang làm, `[ ]` dự kiến.

Muốn nhận một mục? Bình luận vào issue trước khi bắt tay làm. Trang [Cộng đồng](https://trandat1114.github.io/Yugen-UI/vi/community) có cùng lộ trình.

### Đang làm

#### 0.15.0 · minor · hạn 2026-11-25

Rà soát trước 1.0 (API, Labs, bảo mật), prop mặc định và mật độ từ YugenProvider, tuỳ chọn thanh cuộn.

- [~] Rà soát API: tên mới cho các prop lệch chuẩn, tên cũ cảnh báo deprecation tới 1.0 (#157)
- [ ] Yugen Labs: promote component đã chín, phần còn lại đánh dấu thử nghiệm (#158)
- [x] Prop mặc định và mật độ (density) từ YugenProvider (#171)
- [ ] Glass làm mặc định cho component điều hướng, qua prop mặc định (#230)
- [ ] Khóa cuộn: chọn giữ hay ẩn thanh cuộn khi mở Menu, ContextMenu, Dropdown (#243)
- [ ] Rà soát bảo mật các component hiển thị nội dung không tin cậy (#165)
- [x] Icon có sẵn trong thư viện: cài yugen-ui nhẹ hơn ~180 MB (#320)
- [x] Chỉ hỗ trợ React 19: bỏ React 18 khỏi peer dependency và CI (#62)

#### 0.16.0 · minor · hạn 2026-12-09

Những phần còn thiếu của một bộ component đầy đủ.

- [ ] NavigationMenu cho header website (#168)
- [ ] Form control còn thiếu: PasswordInput, input có định dạng, chọn tháng / năm / ngày giờ, ColorPicker (#173)
- [ ] Typography: trang Typeset tinh chỉnh Prose (font, cỡ chữ, khoảng cách) và copy CSS (#244)
- [ ] Trang lỗi HTTP: component StatusPage, trang 404 cho docs, not-found trong template (#238)
- [ ] Unit test tối thiểu cho mọi component, coverage trong CI (#167)
- [ ] Visual regression cho mọi component (3 theme + RTL) (#166)

#### 1.0.0 · major

API ổn định. Chưa định ngày: phát hành khi danh sách điều kiện hoàn tất.

- [ ] Rà soát API, gỡ deprecation, quyết định về class spacing viết hoa (#65)
- [x] SEO: URL theo đường dẫn, prerender từng trang, sitemap (#63)
- [ ] Đề xuất cho 1.0 (đã duyệt): Form, NavigationMenu, block 2.0, codemod, kiểm thử (#160)
- [ ] @yugen-ui/cli ghi các dòng @import của CSS theo component (init, doctor) (#169)

### Tiếp theo

#### Backlog

Chưa xếp lịch.

- [ ] Glass: YugenProvider đổi mọi component điều hướng sang glass (sau #171) (#230)
- [ ] Đăng ký @yugen vào danh mục registry của shadcn (#68)
- [ ] Đang cân nhắc: bộ Figma, gói icon Sakura

### Đã phát hành

Chi tiết ở trang Có gì mới (`/news`) và `CHANGELOG.md`.

- **0.14.0** (2026-11-03): AppShell, Sortable, trang Người đóng góp
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
