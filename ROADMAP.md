# Yugen UI Roadmap

<!-- Sinh từ src/docs/roadmap.ts bằng `npm run roadmap`. Đừng sửa tay. -->

*Tiếng Việt: [xem bên dưới](#tiếng-việt).*

Plans for each release, updated 2026-11-23. Each release is a GitHub milestone; priority, size and
dependencies are in the [GitHub Project](https://github.com/users/trandat1114/projects/6). `[x]` done, `[~]` in progress, `[ ]` planned.

Want to pick something up? Comment on the issue before you start. The same roadmap is on the
[community page](https://trandat1114.github.io/Yugen-UI/community).

## Now

### 0.17.0 · minor

The 1.0 breaking changes ahead of time, plus Form, new charts, BentoGrid and components for voice and articles.

- [x] Native inputs for Checkbox, Switch and RadioGroup (#357)
- [x] The date stack as an optional peer (yugen-ui/dates) (#356)
- [x] CSS layering: tokens in @layer theme, opt-in token groups, components.css without a global reset (#354)
- [x] Yugen-owned prop types for Calendar and Resizable (#371)
- [x] Form: validation, an error summary, react-hook-form (yugen-ui/form) (#162)
- [x] Persona with several avatars, image options for Avatar (#401)
- [~] RadarChart: polygon, circle or no grid, keyboard, data table, size budget (#424)
- [~] PieChart and RadialChart, with the gallery variants (#431)
- [ ] Area, Bar and Line charts: full variant set, one tooltip contract, benchmarks (#433)
- [~] BentoGrid: a responsive, accessible card grid with a benchmark (#434)
- [~] Timeline that follows the scroll, with a status per item (#439)
- [~] TeachingPopover spotlight that dims the rest of the page (#438)
- [ ] AI voice: VoiceWave, Transcript, calling UI and a VoiceAssistant block (#443)
- [ ] Article and Blog from Markdown, a faster Markdown renderer (#446)
- [ ] Docs search by domain: AI, voice, Article, Blog (#445)
- [ ] Enterprise data tables: density, a compact column picker, a vite-saas app shell (#412)

## Next

### 1.0.0 · major

Stable API. No fixed date: ships when the readiness checklist is done.

- [ ] API review, deprecations removed, decision on upper-case spacing (#65)
- [x] SEO: path URLs, prerendered pages, sitemap (#63)
- [ ] Codemods 0.x → 1.0 (yugen migrate) for the renamed props and moved imports (#164)
- [ ] Block library 2.0 (marketing, app, commerce), installable with the CLI (#163)
- [ ] Yugen's own calendar grid and splitter (#356)
- [ ] Performance audit: bundle, CSS, runtime and build (#342)
- [ ] Supply chain security for the three npm packages (#384)

## Later

### Backlog

Not scheduled yet.

- [ ] Register @yugen in the shadcn registry index (#68)
- [ ] Under consideration: Figma kit, Sakura icon set

## Released

Details on What's new (`/news`) and in `CHANGELOG.md`.

- **0.16.0** (2026-11-09): Performance: lighter imports, smaller CSS and fewer re-renders
- **0.15.0** (2026-11-04): New form controls, NavigationMenu, status pages and app-wide defaults
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

Kế hoạch theo từng bản phát hành, cập nhật 2026-11-23. Mỗi bản là một milestone trên GitHub; ưu tiên, độ lớn và
phụ thuộc nằm ở [GitHub Project](https://github.com/users/trandat1114/projects/6). `[x]` đã xong, `[~]` đang làm, `[ ]` dự kiến.

Muốn nhận một mục? Bình luận vào issue trước khi bắt tay làm. Trang [Cộng đồng](https://trandat1114.github.io/Yugen-UI/vi/community) có cùng lộ trình.

### Đang làm

#### 0.17.0 · minor

Đưa sớm các thay đổi phá vỡ API của 1.0, thêm Form, biểu đồ mới, BentoGrid và component cho voice, bài viết.

- [x] Input gốc cho Checkbox, Switch và RadioGroup (#357)
- [x] Phần ngày tháng thành peer tuỳ chọn (yugen-ui/dates) (#356)
- [x] Phân lớp CSS: token trong @layer theme, nhóm token tuỳ chọn, components.css không reset toàn cục (#354)
- [x] Kiểu prop riêng của Yugen cho Calendar và Resizable (#371)
- [x] Form: kiểm tra dữ liệu, tóm tắt lỗi, react-hook-form (yugen-ui/form) (#162)
- [x] Persona nhiều avatar, tuỳ chọn ảnh cho Avatar (#401)
- [~] RadarChart: lưới đa giác / tròn / không lưới, bàn phím, bảng dữ liệu, ngân sách kích thước (#424)
- [~] PieChart và RadialChart, các biến thể theo gallery (#431)
- [ ] Biểu đồ Area, Bar, Line: đủ biến thể, tooltip thống nhất, benchmark (#433)
- [~] BentoGrid: lưới card responsive, truy cập được, có benchmark (#434)
- [~] Timeline chạy theo vị trí cuộn, trạng thái từng mục (#439)
- [~] TeachingPopover làm tối phần còn lại của trang (spotlight) (#438)
- [ ] AI voice: VoiceWave, Transcript, giao diện cuộc gọi, block VoiceAssistant (#443)
- [ ] Article và Blog từ Markdown, trình render Markdown nhanh hơn (#446)
- [ ] Tìm kiếm trong docs theo nhóm: AI, voice, Article, Blog (#445)
- [ ] Bảng dữ liệu cho doanh nghiệp: mật độ, chọn cột gọn, khung app vite-saas (#412)

### Tiếp theo

#### 1.0.0 · major

API ổn định. Chưa định ngày: phát hành khi danh sách điều kiện hoàn tất.

- [ ] Rà soát API, gỡ deprecation, quyết định về class spacing viết hoa (#65)
- [x] SEO: URL theo đường dẫn, prerender từng trang, sitemap (#63)
- [ ] Codemod 0.x → 1.0 (yugen migrate) cho các tên và đường import đã đổi (#164)
- [ ] Thư viện block 2.0 (marketing, ứng dụng, thương mại), cài bằng CLI (#163)
- [ ] Lưới lịch và splitter của riêng Yugen (#356)
- [ ] Rà soát hiệu năng: bundle, CSS, runtime và build (#342)
- [ ] Bảo mật chuỗi cung ứng cho cả ba gói npm (#384)

### Sau đó

#### Backlog

Chưa xếp lịch.

- [ ] Đăng ký @yugen vào danh mục registry của shadcn (#68)
- [ ] Đang cân nhắc: bộ Figma, gói icon Sakura

### Đã phát hành

Chi tiết ở trang Có gì mới (`/news`) và `CHANGELOG.md`.

- **0.16.0** (2026-11-09): Hiệu năng: import nhẹ hơn, CSS gọn hơn và ít render lại hơn
- **0.15.0** (2026-11-04): Form control mới, NavigationMenu, trang trạng thái và prop mặc định cho cả ứng dụng
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
