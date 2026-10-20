# Lộ trình Yugen UI · Roadmap

Lộ trình từ **0.5.0** tới **1.0**. Mục đã xong được đánh dấu `[x]`; trang Cộng đồng (`#/community`) hiển thị bản tóm tắt.
Muốn nhận một mục? Mở issue hoặc bình luận vào issue sẵn có trước khi bắt tay làm.

> **English summary** — 0.5 ships the first npm release. 0.6 adds automated tests (unit, interaction, axe, visual,
> touch) and release tooling. 0.7 improves developer experience (shadcn-compatible registry, lazy docs, generated props,
> English docs, StackBlitz, token export). 0.8 grows the component set (Overflow, date/time range, DataGrid, forms,
> AI and chart additions). 1.0 freezes the API with a SemVer and deprecation policy.

---

## Giai đoạn 0 — Phát hành 0.5.0

- [x] Điền `repository`, `homepage`, `bugs` trong `package.json` và link trong `src/docs/site.ts`
- [x] Bật GitHub Discussions rồi điền link `discussions`
- [x] Workflow GitHub Pages (`.github/workflows/pages.yml`) — maintainer bật Settings → Pages → Source: GitHub Actions
- [x] Thử gói `.tgz` trong app Vite (React 18) và Next.js 16 App Router (React 19), cả `theme.css` lẫn `styles.css`
- [x] Link so sánh phiên bản trong `CHANGELOG.md`, ảnh chụp cho README
- [ ] Phát hành lên npm (maintainer) — bản đầu tiên sẽ là `yugen-ui@0.6.0`

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
- [ ] Đang cân nhắc: Figma kit, gói icon Sakura
