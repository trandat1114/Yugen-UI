# Đóng góp cho Yugen UI · Contributing to Yugen UI

Cảm ơn bạn đã quan tâm! · Thanks for your interest! The Vietnamese guide comes first, followed by a short English
version. Both point to [Design.md](./Design.md) — the project rulebook, which always wins when in doubt.

Mọi người tham gia đều phải tuân thủ [Quy tắc ứng xử](./CODE_OF_CONDUCT.md). Lỗ hổng bảo mật: **không** mở issue công
khai, xem [SECURITY.md](./SECURITY.md).

---

## Tiếng Việt

### Cài đặt

Yêu cầu Node.js **20+** và npm.

```bash
npm install
npm run dev          # trang docs tại http://localhost:5173
```

### Lệnh

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Chạy trang docs (Vite) |
| `npm run typecheck` | Kiểm tra kiểu (`tsc -b`) |
| `npm run lint:classes` | Kiểm tra class Tailwind ở dạng canonical (`node scripts/canonical-classes.mjs --fix` để tự sửa) |
| `npm run build:lib` | Build thư viện vào `dist/` (JS + `.d.ts` + `theme.css` / `styles.css` / `tokens.css`) |
| `npm run build:docs` | Build trang docs vào `dist-docs/` |
| `npm run build` | Cả hai |
| `npm run pack:check` | Xem trước nội dung gói npm (`npm pack --dry-run`) |
| `npm test` | Unit + tương tác (Vitest + Testing Library, `src/**/*.test.ts(x)`) |
| `npm run test:e2e` | Playwright trên trang docs: axe (a11y), kéo chuột, chạm mô phỏng |
| `npm run test:visual` | So sánh ảnh chụp (project `visual` của Playwright) |
| `npm run size` | Ngân sách dung lượng gói (`size-limit`, chạy sau `build:lib`) |
| `npm run changeset` | Thêm changeset cho PR (`npx changeset`) |
| `npm run check:release` | Kiểm tra `package.json` = `src/docs/news.ts` = `CHANGELOG.md` |

### Kiểm thử

- `npm test` — Vitest (jsdom). Test đặt cạnh component: `src/components/ui/<Name>/<Name>.test.tsx`. Chạy
  `npm run test:watch` khi đang viết test.
- `npm run test:e2e` — Playwright tự chạy `npm run dev` ở cổng 5200. Trên máy dùng Microsoft Edge đã cài sẵn; CI dùng
  Chromium của Playwright (`npx playwright install chromium`, rồi chạy với `CI=1` nếu máy không có Edge). Báo cáo:
  `npx playwright show-report`.
- `npm run test:visual` — ảnh gốc nằm trong `e2e/__screenshots__/` và **khác nhau theo hệ điều hành** (hậu tố
  `-win32` / `-linux`). Cố ý đổi giao diện thì cập nhật bằng `npm run test:visual -- --update-snapshots` rồi xem lại
  ảnh trước khi commit. Ảnh Linux cho CI: chạy workflow **Visual regression** (Actions → Run workflow, tick `update`)
  và tải artifact `visual-screenshots` về — workflow không tự commit.
- `npm run size` — sau `npm run build:lib`. Vượt ngân sách thì tìm nguyên nhân trước (import thừa, dependency mới);
  tăng có chủ đích thì sửa `limit` trong `.size-limit.cjs` và ghi lý do trong PR.
- CI chạy thêm toàn bộ bằng React 19 (job `react-19`). Muốn thử trên máy: làm trong một bản sao của repo
  (`npm i --no-save react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19`), đừng làm bẩn `node_modules` chính.

### Luật bắt buộc (tóm tắt Design.md §0)

1. Không hard-code HEX/rgb, px, ms, cubic-bezier trong `.tsx` — chỉ dùng utility map từ token.
2. Palette mặc định của Tailwind đã tắt (`bg-blue-500`, `rounded-lg`, `shadow-md`, `text-sm` không tồn tại).
3. Spacing dùng hậu tố Fluent viết hoa: `p-M`, `gap-S`, `px-XL`. Cỡ chữ chỉ dùng type ramp `text-caption2 … text-display`.
4. Luôn gộp class bằng `cn()` (`src/lib/cn.ts`), không dùng `twMerge` gốc.
5. Không dùng `dark:`; chỉ dùng thuộc tính logic (`ms/me/ps/pe/start/end`) để RTL hoạt động.
6. Neutral cho bề mặt/chữ/viền · Brand chỉ cho CTA, trạng thái chọn, focus, link · Semantic chỉ cho trạng thái.
7. Gradient chỉ cho minh hoạ/hero — không bao giờ trên control.
8. Tương phản chữ ≥ 4.5:1, thành phần UI ≥ 3:1; không dùng màu làm tín hiệu duy nhất.
9. Hành vi phức tạp dùng Radix / `cmdk` / `react-day-picker`; icon chỉ dùng `@fluentui/react-icons`. Không thêm thư
   viện UI/animation khác.

### Thêm component

1. Tạo `src/components/ui/<Name>/<Name>.tsx` theo Design.md §5 (named export, `forwardRef`, `className` cuối `cn(...)`,
   đủ trạng thái hover/pressed/disabled/focus-visible, bàn phím, `aria-*`).
2. Thêm `export * from "./<Name>/<Name>";` vào đúng nhóm trong `src/components/ui/index.ts` — gói npm export mọi thứ
   có trong barrel này.
3. Viết trang docs: thêm một `ComponentDoc` vào file trong `src/docs/registry/` (`slug`, `name`, `category`, `lead`,
   `description`, `importCode`, `hero`, `examples` — **`code` phải giống hệt JSX trong `render`**, `dos`/`donts`,
   `props`). Sidebar, tìm kiếm, trang chủ tự sinh từ registry.
4. Dependency mới (nếu thật sự cần) phải nằm trong `dependencies` của `package.json` — maintainer quyết định.

### Thêm block

1. Tạo `src/docs/block-library/NN-ten.tsx` với `export const meta = { title, description, order }` và
   `export default function …`.
2. Chỉ import từ `@/components/ui` và `@fluentui/react-icons` để người dùng copy được nguyên file.

### Dịch tài liệu

Chuỗi giao diện docs nằm ở `src/docs/i18n/vi.ts` (nguồn khoá) và `src/docs/i18n/en.ts`. Tên / mô tả component tiếng Anh: `src/docs/i18n/en/components.ts` (test bắt buộc đủ mọi slug). Trang khái niệm tiếng Anh: thêm `src/docs/concepts/en/<slug>.tsx` cùng cấu trúc mục với bản tiếng Việt. Trang chưa dịch tự hiện thông báo và nội dung gốc.

### Quy ước commit

Theo [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(button): thêm appearance "tint"
fix(combobox): giữ focus khi xoá tag bằng Backspace
docs(theming): ví dụ brand tự tạo
```

Loại: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Thay đổi phá vỡ API: thêm `!`
(`feat(field)!: …`) và mô tả trong phần thân commit.

### Changeset

Từ 0.6.0, `CHANGELOG.md` do [Changesets](https://github.com/changesets/changesets) sinh — **không sửa tay**. PR có
thay đổi người dùng thấy được (component, prop, token, CSS, sửa lỗi) thêm một changeset; PR chỉ đổi docs / test / CI
thì không cần.

```bash
npx changeset    # chọn yugen-ui → patch hoặc minor → viết tóm tắt cho người dùng
```

- `patch`: sửa lỗi, cải tiến nhỏ. `minor`: component / prop / token mới, và — khi còn `0.x` — cả thay đổi phá vỡ API
  (mở đầu tóm tắt bằng "**Breaking:**" kèm cách chuyển đổi).
- Tóm tắt viết cho người dùng gói (tiếng Anh, như CHANGELOG): "`Combobox`: keep focus when a tag is removed with
  Backspace.", không phải "fix bug".
- Commit file `.changeset/*.md` vừa tạo cùng PR; sửa lại nội dung file được nếu cần.

### Checklist PR

- [ ] `npm run typecheck`, `npm run lint:classes`, `npm test`, `npm run build:lib`, `npm run build:docs` đều pass.
- [ ] `npm run test:e2e` pass (component có giao diện / tương tác mới); `npm run size` vẫn trong ngân sách.
- [ ] Không HEX/px/ms tuỳ ý; spacing viết hoa; cỡ chữ theo type ramp; dùng class dùng chung (Design.md §5.7).
- [ ] Màu đúng vai trò; không brand diện tích lớn; không gradient trên control.
- [ ] Đủ trạng thái hover / pressed / disabled / focus-visible; bàn phím hoạt động; đã thử RTL.
- [ ] Đã kiểm tra Sakura / Web / Teams × Light / Dark và High contrast.
- [ ] Có mục registry (hoặc file block); code mẫu khớp với render.
- [ ] Đã thêm changeset (`npx changeset`) nếu thay đổi ảnh hưởng người dùng.

### Phát hành (maintainer)

1. `npx changeset version` — gộp các changeset vào `CHANGELOG.md` (mục mới ở đầu file), tăng `version` trong
   `package.json` và xoá file đã dùng. Xem lại phần CHANGELOG vừa sinh.
2. Thêm mục cho phiên bản mới vào **đầu** mảng `NEWS` trong `src/docs/news.ts` (trang "Có gì mới"). Số phiên bản trên
   site docs lấy thẳng từ `package.json`, không cần sửa.
3. `npm install --package-lock-only` (đồng bộ `version` trong `package-lock.json`) rồi `npm run check:release`
   (`package.json` = `news.ts` = `CHANGELOG.md`).
4. Commit (`chore(release): vX.Y.Z`), mở PR hoặc đẩy lên `main`.
5. `git tag vX.Y.Z && git push --tags` — workflow `.github/workflows/release.yml` kiểm tra lại, chạy test, build và
   `npm publish --provenance` (cần secret `NPM_TOKEN`). Tag có `-` (vd. `v0.6.0-beta.1`) phát hành với dist-tag `next`.

---

## English

### Setup

Requires Node.js **20+** and npm. Run `npm install`, then `npm run dev` (docs site at http://localhost:5173).
Scripts: `typecheck`, `lint:classes` (Tailwind canonical classes; `node scripts/canonical-classes.mjs --fix`
repairs them), `build:lib` (library → `dist/`), `build:docs` (docs → `dist-docs/`), `build` (both), `pack:check`,
`test`, `test:e2e`, `test:visual`, `size`, `changeset`, `check:release`.

### Tests

- `npm test` — unit and interaction tests (Vitest + Testing Library, jsdom), colocated as
  `src/components/ui/<Name>/<Name>.test.tsx`; `npm run test:watch` while writing them.
- `npm run test:e2e` — Playwright against the docs site (it starts `npm run dev` on port 5200): axe accessibility,
  mouse drag and emulated touch. Locally it uses the installed Microsoft Edge; CI uses Playwright's Chromium (without
  Edge: `npx playwright install chromium` and run with `CI=1`). Open the report with `npx playwright show-report`.
- `npm run test:visual` — screenshot comparison. Baselines live in `e2e/__screenshots__/` and are **per platform**
  (`-win32` / `-linux`). After an intended visual change run `npm run test:visual -- --update-snapshots` and review the
  images before committing. Linux baselines for CI come from the manual **Visual regression** workflow (tick `update`,
  then download the `visual-screenshots` artifact) — it never commits.
- `npm run size` — size budgets (`.size-limit.cjs`), after `npm run build:lib`. If a budget fails, find the cause
  first; raise a `limit` only on purpose, and say why in the PR.
- CI also runs typecheck, unit tests and the library build against React 19 (`react-19` job). To try it locally, use
  a copy of the repo (`npm i --no-save react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19`).

### Rules

[Design.md](./Design.md) is mandatory. In short: only token-mapped utilities (no raw HEX/px/ms), Tailwind's
default palette is disabled, upper-case Fluent spacing (`p-M`, `gap-S`), type-ramp font sizes only, always merge
classes with `cn()`, no `dark:` variant, logical properties only (RTL), brand colour only for CTAs / selection /
focus / links, gradients never on controls, WCAG contrast (4.5:1 text, 3:1 UI), Radix / `cmdk` /
`react-day-picker` for behaviour and `@fluentui/react-icons` for icons.

### Adding a component, docs or a block

1. `src/components/ui/<Name>/<Name>.tsx` (named export, `forwardRef`, user `className` last in `cn(...)`, all
   interaction states, keyboard support, ARIA), then export it from `src/components/ui/index.ts` — the npm package
   exports everything in that barrel.
2. Add a `ComponentDoc` to a file in `src/docs/registry/` (example `code` must match the rendered JSX exactly).
3. Blocks: `src/docs/block-library/NN-name.tsx` with `export const meta` + a default export, importing only from
   `@/components/ui` and `@fluentui/react-icons`.

### Translating the docs

UI strings live in `src/docs/i18n/vi.ts` (source of the keys) and `src/docs/i18n/en.ts`. English component names and leads: `src/docs/i18n/en/components.ts` (a test requires every slug). English concept pages: add `src/docs/concepts/en/<slug>.tsx` with the same section ids as the Vietnamese page. Untranslated pages show a notice and the Vietnamese original.

### Commits and pull requests

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat(scope): …`, `fix`, `docs`, `refactor`,
`chore`…; `!` for breaking changes). Before opening a PR: typecheck, class lint, `npm test`, `build:lib` and
`build:docs` pass (plus `npm run test:e2e` for new UI or interactions, and `npm run size` within budget); checked in
light / dark / high contrast, all brands and RTL; registry docs added; a changeset added for user-facing changes.
Fill in the pull-request template.

### Changesets

From 0.6.0, `CHANGELOG.md` is generated by [Changesets](https://github.com/changesets/changesets) — do not edit it by
hand. A PR with a user-facing change (component, prop, token, CSS, bug fix) adds a changeset; docs / test / CI-only
PRs do not need one.

```bash
npx changeset    # pick yugen-ui → patch or minor → write a user-facing summary
```

Use `patch` for fixes and small improvements, `minor` for new components / props / tokens and — while the version is
`0.x` — for breaking changes too (start the summary with "**Breaking:**" and explain the migration). Write the summary
for package users ("`Combobox`: keep focus when a tag is removed with Backspace."), then commit the generated
`.changeset/*.md` file with your PR.

### Releasing (maintainers)

1. `npx changeset version` — writes the pending changesets into `CHANGELOG.md` (new section at the top), bumps
   `version` in `package.json` and deletes the used changeset files. Review the generated entry.
2. Add the release at the **top** of the `NEWS` array in `src/docs/news.ts` (the "Có gì mới" page). The docs site
   reads its version from `package.json` automatically.
3. `npm install --package-lock-only` (syncs the version in `package-lock.json`), then `npm run check:release`
   (`package.json` = `news.ts` = `CHANGELOG.md`).
4. Commit (`chore(release): vX.Y.Z`) and merge to `main`.
5. `git tag vX.Y.Z && git push --tags` — `.github/workflows/release.yml` re-checks the version against the tag, runs
   the tests, builds and runs `npm publish --provenance` (needs the `NPM_TOKEN` secret). Tags containing `-`
   (e.g. `v0.6.0-beta.1`) are published under the `next` dist-tag.
