# Lộ trình Yugen UI · Roadmap

Lộ trình từ **0.5.0** tới **1.0**. Mục đã xong được đánh dấu `[x]`; trang Cộng đồng (`#/community`) hiển thị bản tóm tắt.
Muốn nhận một mục? Mở issue hoặc bình luận vào issue sẵn có trước khi bắt tay làm.

> **English summary** — 0.5 ships the first npm release. 0.6 adds automated tests (unit, interaction, axe, visual,
> touch) and release tooling. 0.7 improves developer experience (shadcn-compatible registry, lazy docs, generated props,
> English docs, StackBlitz, token export). 0.8 grows the component set (Overflow, date/time range, DataGrid, forms,
> AI and chart additions). 1.0 freezes the API with a SemVer and deprecation policy. The SEO track moves the docs to
> path-based, prerendered pages and ships SEO-ready templates.

---

## Giai đoạn 0 — Phát hành 0.5.0

- [x] Điền `repository`, `homepage`, `bugs` trong `package.json` và link trong `src/docs/site.ts`
- [x] Bật GitHub Discussions rồi điền link `discussions`
- [x] Workflow GitHub Pages (`.github/workflows/pages.yml`) — maintainer bật Settings → Pages → Source: GitHub Actions
- [x] Thử gói `.tgz` trong app Vite (React 18) và Next.js 16 App Router (React 19), cả `theme.css` lẫn `styles.css`
- [x] Link so sánh phiên bản trong `CHANGELOG.md`, ảnh chụp cho README
- [x] Phát hành lên npm — `yugen-ui@0.6.0`, `0.7.0` (`latest`)

## Giai đoạn 1 — 0.6: Chất lượng & niềm tin

- [x] Vitest + Testing Library: logic thuần (`brandRamp`, `useSpinDelay`, `tokenizeCode`, `validateQuestion`, `chartUtils`, `parseLineRanges`)
- [x] Test bàn phím: Tree, Toolbar, Tabs, Menu, Combobox, Questionnaire (+ SSR/hydration cho 37 nhóm component)
- [x] Playwright + axe trên mọi trang docs × sáng / tối / tương phản cao × LTR / RTL
- [x] So sánh ảnh chụp (visual regression)
- [x] Mô phỏng chạm cho Sheet, Resizable, Carousel
- [x] CI: job test, ngân sách dung lượng (`size-limit`), ma trận React 18 / 19
- [x] Changesets cho phiên bản & CHANGELOG; kiểm tra `news.ts` khớp `package.json` (`npm run check:release`)

## Giai đoạn 2 — 0.7: Trải nghiệm nhà phát triển

- [x] Registry tương thích shadcn: `npx shadcn add <url>/r/<component>.json` (`npm run registry`, trang `#/concepts/shadcn-registry`)
- [x] `npx shadcn@latest init <url>/r/init.json` (và `init-next.json`): một lệnh tạo `components.json`, chép theme + `cn()` + `YugenProvider`, tự `@import` theme vào CSS, không kéo style mặc định của shadcn
- [ ] Đăng ký `@yugen` vào danh mục registry của shadcn (maintainer, PR vào `shadcn-ui/ui`) để `npx shadcn add @yugen/button` chạy không cần cấu hình
- [x] Bắt đầu nhanh rút còn 1 lệnh (template) hoặc 3 bước (npm) — bỏ hướng dẫn chép tay & danh sách phụ thuộc
- [x] Tải lười demo từng component trên docs (metadata trích lúc build; JS lần đầu 970 kB → 108 kB)
- [x] Kiểm tra lệch props docs/code từ type TypeScript (`npm run check:props`, chạy trong CI)
- [~] Docs tiếng Anh (i18n): khung, trang chủ, Cộng đồng, 4 trang khái niệm, tên/mô tả 111 component — còn nội dung chi tiết từng component & các khái niệm khác
- [x] Nút "Open in StackBlitz" cho ví dụ (hiện khi đã publish npm) + `npm run check:examples` typecheck mọi ví dụ
- [x] Theme Designer xuất JSON / Tokens Studio (`rampToDesignTokens`, `rampToTokensStudio`)

## Giai đoạn 3 — 0.8: Mở rộng component

- [x] Overflow (Toolbar, Tabs, Breadcrumb, TagGroup tự ẩn bớt item — ghép qua `Overflow`/`OverflowItem`)
- [x] DateRangePicker (preset), TimePicker
- [x] DataGrid: sắp xếp, chọn dòng, đổi cỡ cột, ảo hoá
- [x] FileUpload / Dropzone, Stepper / Wizard, ví dụ react-hook-form + zod
- [x] Labs AI: StreamingMarkdown, Citation, Reasoning, PromptInput có đính kèm
- [x] Labs: Tour, NotificationCenter
- [x] Chart: Scatter, Heatmap, stacked area, zoom / brush

## Giai đoạn 4 — 1.0: Ổn định & hệ sinh thái

- [x] Chính sách SemVer & deprecate (cảnh báo trước ít nhất một bản minor) — `#/concepts/versioning`, `warnDeprecated()`
- [x] Docs theo phiên bản (`/vX.Y/` từ tag + menu chọn bản), audit a11y đạt (axe trong e2e), test đủ React 18 & 19 (CI)
- [ ] Nhãn `good first issue` (maintainer, trên GitHub)
- [x] Starter template `templates/vite-dashboard`, `templates/vite-ai-chat` (sinh từ block — `node scripts/sync-templates.mjs`); mục showcase trên trang Cộng đồng
- [x] Trang `#/templates` (preview chạy thật, lệnh `npx giget … --install` một dòng, Open in StackBlitz) + template `vite-starter`, `vite-saas`, `vite-blog` (Markdown, SEO lúc build)
- [x] CLI `@yugen-ui/cli` (`packages/cli`, lệnh `yugen`): `create` (template đóng gói sẵn, chọn tương tác), `init` (gói npm / mã nguồn), `add`, `list`, `doctor` — `create-yugen-ui` (`npm create yugen-ui@latest`) gọi `yugen create`
- [x] Trang docs `#/concepts/cli` (vi + en); quy tắc phát hành CLI (wiki › Release Process › CLI, `check-release.mjs`, `npm run smoke`)
- [ ] Publish `@yugen-ui/cli` + `create-yugen-ui` lên npm (maintainer: tạo npm org `yugen-ui`, cấp quyền cho `NPM_TOKEN`, đẩy tag `cli@0.1.0` trên `main`; tên `yugen` bị npm chặn vì giống `hygen`)
- [ ] CLI giai đoạn 2: `yugen diff` / `update` (so mã local với registry), `yugen theme --brand <hex>` (brandRamp), `yugen remove`, codemod bọc `YugenProvider`, `create --ref <branch>` (template từ GitHub)
- [ ] Đang cân nhắc: Figma kit, gói icon Sakura

## Giai đoạn SEO — docs dễ tìm, template sẵn SEO

Docs đang định tuyến bằng hash (`#/components/button`) — công cụ tìm kiếm coi mọi trang là một URL. Lộ trình:

- [x] `<head>` cơ bản: `description`, canonical, Open Graph + ảnh `public/og.jpg` (`node scripts/og-image.mjs`), Twitter card, JSON-LD `SoftwareSourceCode`, `theme-color`
- [x] Tiêu đề tab, `description`, `og:title` theo trang khi chuyển route (`src/docs/seo.ts`)
- [x] Template sẵn SEO: `description`, Open Graph, `robots.txt`; `vite-blog` sinh HTML tĩnh từng bài, canonical, JSON-LD `BlogPosting`, `sitemap.xml`, `rss.xml`
- [ ] Định tuyến theo đường dẫn (`/components/button`) bằng History API; tự chuyển link `#/…` cũ sang URL mới; `404.html` cho GitHub Pages
- [ ] Prerender mọi route thành HTML tĩnh lúc build (`renderToString` — component đã có test SSR) với `<title>`, `description`, canonical riêng
- [ ] `sitemap.xml` sinh từ danh sách route; `hreflang` vi / en khi bản tiếng Anh có URL riêng
- [ ] Ảnh Open Graph riêng cho từng trang component (sinh lúc build)
- [ ] Lighthouse CI trên workflow Pages: SEO ≥ 95, cảnh báo khi trang thiếu `description`
- [ ] Trang khái niệm "SEO với Yugen UI" cho người dùng: Next.js `metadata`, heading đúng cấp, `Link` / `asChild` cho link crawl được, `alt` cho `Image`
- [ ] Gửi sitemap lên Google Search Console (maintainer, sau khi có URL theo đường dẫn)
