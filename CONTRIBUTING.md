# Đóng góp cho Yugen UI · Contributing to Yugen UI

Cảm ơn bạn đã quan tâm! · Thanks for your interest! The Vietnamese guide comes first, followed by a short English
version. Both point to [Design.md](./Design.md) — the project rulebook, which always wins when in doubt.

Mọi người tham gia đều phải tuân thủ [Quy tắc ứng xử](./CODE_OF_CONDUCT.md). Vai trò, cách ra quyết định và RFC: [GOVERNANCE.md](./GOVERNANCE.md); kiến trúc và vận hành: [Wiki](https://github.com/trandat1114/Yugen-UI/wiki). Lỗ hổng bảo mật: **không** mở issue công
khai, xem [SECURITY.md](./SECURITY.md).

---

## Tiếng Việt

### Cài đặt

Yêu cầu Node.js **24 LTS** (hoặc 22.22+) và npm.

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
| `npm run check:examples` | Mọi ví dụ docs typecheck được khi chép ra dùng với `yugen-ui` |
| `npm run check:props` | Bảng props trên docs khớp type thật |
| `npm run registry` | Sinh registry shadcn vào `public/r/` (tự chạy trong `build:docs`) |
| `npm run version-packages` | (maintainer) Đánh số phiên bản từ changeset + đồng bộ templates & lockfile |
| `node scripts/sync-templates.mjs` | Sinh lại `templates/` từ block và `src/docs/template-library/` (`--check` để kiểm tra) |
| `node scripts/og-image.mjs` | Sinh lại ảnh chia sẻ `public/og.jpg` (Open Graph) |

### Kiểm thử

- `npm test` — Vitest (jsdom). Test đặt cạnh component: `src/components/ui/<Name>/<Name>.test.tsx`. Chạy
  `npm run test:watch` khi đang viết test.
- `npm run test:e2e` — Playwright tự chạy `npm run dev` ở cổng 5200. Trên máy dùng Microsoft Edge đã cài sẵn; CI dùng
  Chromium của Playwright (`npx playwright install chromium`, rồi chạy với `CI=1` nếu máy không có Edge). Báo cáo:
  `npx playwright show-report`.
- `npm run test:visual` — chỉ ảnh Linux (`e2e/__screenshots__/**/*-linux.png`) được commit; CI so sánh trên mọi PR đổi
  component, style hoặc khung docs. Trên Windows / macOS, lần chạy đầu tạo ảnh riêng cho máy bạn (gitignore). Cố ý đổi
  giao diện: chạy workflow **Visual regression** trên nhánh của bạn (Actions → Run workflow, tick `update`), tải artifact
  `visual-screenshots`, chép vào `e2e/__screenshots__/` rồi commit. Workflow không tự commit.
- `npm run size` — sau `npm run build:lib`. Vượt ngân sách thì tìm nguyên nhân trước (import thừa, dependency mới);
  tăng có chủ đích thì sửa `limit` trong `.size-limit.cjs` và ghi lý do trong PR.
- Repo chạy React 19; CI chạy thêm typecheck, test và build:lib bằng React 18.3 (job `react-18`) vì bản này vẫn được
  hỗ trợ. Muốn thử trên máy: làm trong một bản sao của repo
  (`npm i --no-save react@^18.3 react-dom@^18.3 @types/react@^18.3 @types/react-dom@^18.3`), đừng làm bẩn `node_modules` chính.

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
   - `slug`, `name`, `category`, `lead` phải là **chuỗi literal** (được trích lúc build để nạp lười trang).
   - Ví dụ có state / dữ liệu: viết component demo trong file rồi cắt code bằng `// #region Tên` … `// #endregion`
     (xem `src/docs/registry/content-search.tsx`) để `code` luôn trùng `render`.
   - `code` phải **chạy được khi chép ra**: dữ liệu dùng chung đặt ở `setup` (`declarationsOf(RAW, ["TÊN"])`).
4. Thêm mô tả tiếng Anh: `<slug>: { lead: "…" }` trong `src/docs/i18n/en/components.ts` (test bắt buộc đủ mọi slug).
5. Test cạnh component (`<Name>.test.tsx`): hành vi, bàn phím, ARIA. Component đọc thời gian / media query / storage
   → thêm case vào `src/test/ssrCases.tsx`.
6. Kiểm tra trước khi mở PR:
   ```bash
   npm run typecheck && npm run lint:classes && npm test
   npm run check:examples && npm run check:props          # ví dụ chạy độc lập · bảng props khớp type
   npx playwright test e2e/a11y.spec.ts --project=a11y --grep "<slug>"   # axe cho trang của bạn
   ```
7. Changeset (`npx changeset`, thường là `minor` cho component mới) — xem mục [Changeset](#changeset).
8. Dependency mới (nếu thật sự cần) phải nằm trong `dependencies` của `package.json` — maintainer quyết định.

### Thêm block

1. Tạo `src/docs/block-library/NN-ten.tsx` với `export const meta = { title, description, order }` và
   `export default function …`.
2. Chỉ import từ `@/components/ui` và `@fluentui/react-icons` để người dùng copy được nguyên file.

### Dịch tài liệu

Chuỗi giao diện docs nằm ở `src/docs/i18n/vi.ts` (nguồn khoá) và `src/docs/i18n/en.ts`. Tên / mô tả component tiếng Anh: `src/docs/i18n/en/components.ts` (test bắt buộc đủ mọi slug). Trang khái niệm tiếng Anh: thêm `src/docs/concepts/en/<slug>.tsx` cùng cấu trúc mục với bản tiếng Việt. Trang chưa dịch tự hiện thông báo và nội dung gốc.

Viết nội dung (docs, template, thông báo CLI, changeset) theo wiki › *Writing*: ngắn, rõ, không lặp lại thứ đã hiện bên cạnh, gọi đúng tên gói.

### Nhánh

Sửa lỗi, docs, test → PR vào `main`. Component / prop / token mới và thay đổi phá vỡ → PR vào `next` (nếu đang có; nếu không thì `main`). Tên nhánh: `feat/…`, `fix/…`, `docs/…`, `chore/…`, `exp/…`. Chi tiết kênh `latest` / `next` / `canary` / `release-X.Y`: wiki › *Branching and Release Channels*.

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
- Mỗi thay đổi một changeset (2 component mới → 2 file), tên file tuỳ ý, ví dụ:

  ```md
  ---
  "yugen-ui": minor
  ---

  New `Quote` component: attributed quotations rendered as <figure> › <blockquote cite> + <figcaption>…
  ```

- **Cần changeset**: thứ người cài `yugen-ui` nhận được — component, prop, export, token, CSS, sửa lỗi, a11y.
  **Không cần**: chỉ sửa trang docs / ví dụ, test, CI, wiki (vd. thiết kế lại một ví dụ trên docs).
- `npx changeset status` cho biết phiên bản sẽ tăng thế nào trước khi phát hành.
- **Trên nhánh `next` (chế độ prerelease)**: `.changeset/pre.json` chỉ tồn tại ở `next` — commit nó ở đó, không sửa tay,
  không đưa sang `main`. Khi phát hành `-next.N`, các file changeset **được giữ lại** (bình thường); chúng chỉ bị xoá khi
  thoát chế độ pre và ra bản ổn định. Chi tiết: wiki › *Branching and Release Channels*.

### Checklist PR

- [ ] `npm run typecheck`, `npm run lint:classes`, `npm test`, `npm run build:lib`, `npm run build:docs` đều pass.
- [ ] `npm run test:e2e` pass (component có giao diện / tương tác mới); `npm run size` vẫn trong ngân sách.
- [ ] Không HEX/px/ms tuỳ ý; spacing viết hoa; cỡ chữ theo type ramp; dùng class dùng chung (Design.md §5.7).
- [ ] Màu đúng vai trò; không brand diện tích lớn; không gradient trên control.
- [ ] Đủ trạng thái hover / pressed / disabled / focus-visible; bàn phím hoạt động; đã thử RTL.
- [ ] Đã kiểm tra Sakura / Web / Teams × Light / Dark và High contrast.
- [ ] Có mục registry (hoặc file block); code mẫu khớp với render.
- [ ] Đã thêm changeset (`npx changeset`) nếu thay đổi ảnh hưởng người dùng.
- [ ] Nội dung theo wiki › *Writing* (checklist cuối trang).

### Phát hành (maintainer)

1. `npm run version-packages` (= `changeset version` + đồng bộ `templates/` + lockfile — thiếu bước đồng bộ thì CI đỏ) — gộp các changeset vào `CHANGELOG.md` (mục mới ở đầu file), tăng `version` trong
   `package.json` và xoá file đã dùng. Xem lại phần CHANGELOG vừa sinh.
2. Thêm mục cho phiên bản mới vào **đầu** mảng `NEWS` trong `src/docs/news.ts` (trang "Có gì mới"). Số phiên bản trên
   site docs lấy thẳng từ `package.json`, không cần sửa.
3. `npm install --package-lock-only` (đồng bộ `version` trong `package-lock.json`) rồi `npm run check:release`
   (`package.json` = `news.ts` = `CHANGELOG.md`).
4. Commit (`chore(release): vX.Y.Z`), mở PR hoặc đẩy lên `main`.
5. `git tag vX.Y.Z && git push --tags` — workflow `.github/workflows/release.yml` kiểm tra lại, chạy test, build và
   `npm publish --provenance` (cần secret `NPM_TOKEN`). Tag có `-` (vd. `v0.6.0-beta.1`) phát hành với dist-tag `next`.

CLI `@yugen-ui/cli` và `create-yugen-ui` (`packages/`) phát hành riêng bằng tag `cli@X.Y.Z`, không qua Changesets — quy tắc và
các bước ở wiki › *Release Process* › CLI. PR đổi `packages/cli` hoặc `packages/create-yugen-ui`: ghi một dòng vào mục
`## Unreleased` của `packages/cli/CHANGELOG.md`. Mỗi bản phát hành cần mục tin ở đầu `CLI_NEWS` (và `CREATE_NEWS` khi
`create-yugen-ui` đổi version) trong `src/docs/news.ts`, hiện ở tab riêng trên trang Có gì mới. `check-release` báo lỗi
nếu thiếu. Trước khi tag: `npm run check:release --prefix packages/cli -- --npm` và `npm run smoke --prefix packages/cli`.

---

## English

### Setup

Requires Node.js **24 LTS** (or 22.22+) and npm. Run `npm install`, then `npm run dev` (docs site at http://localhost:5173).
Scripts: `typecheck`, `lint:classes` (Tailwind canonical classes; `node scripts/canonical-classes.mjs --fix`
repairs them), `build:lib` (library → `dist/`), `build:docs` (docs → `dist-docs/`), `build` (both), `pack:check`,
`test`, `test:e2e`, `test:visual`, `size`, `changeset`, `check:release`.

### Tests

- `npm test` — unit and interaction tests (Vitest + Testing Library, jsdom), colocated as
  `src/components/ui/<Name>/<Name>.test.tsx`; `npm run test:watch` while writing them.
- `npm run test:e2e` — Playwright against the docs site (it starts `npm run dev` on port 5200): axe accessibility,
  mouse drag and emulated touch. Locally it uses the installed Microsoft Edge; CI uses Playwright's Chromium (without
  Edge: `npx playwright install chromium` and run with `CI=1`). Open the report with `npx playwright show-report`.
- `npm run test:visual` — screenshot comparison. Only Linux baselines (`e2e/__screenshots__/**/*-linux.png`) are
  committed, and CI compares them on every PR that changes components, styles or the docs layout. On Windows / macOS the
  first run creates baselines for your machine (gitignored). After an intended visual change, run the **Visual
  regression** workflow on your branch (tick `update`), download the `visual-screenshots` artifact, copy it into
  `e2e/__screenshots__/` and commit. The workflow never commits.
- `npm run size` — size budgets (`.size-limit.cjs`), after `npm run build:lib`. If a budget fails, find the cause
  first; raise a `limit` only on purpose, and say why in the PR.
- The repo runs React 19; CI also runs typecheck, unit tests and the library build against React 18.3 (`react-18` job),
  which is still supported. To try it locally, use a copy of the repo
  (`npm i --no-save react@^18.3 react-dom@^18.3 @types/react@^18.3 @types/react-dom@^18.3`).

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
   `slug` / `name` / `category` / `lead` must be string literals (extracted at build time). For stateful examples, slice
   the code from `// #region Name` … `// #endregion` in the same file; put shared data in `setup` so every example runs
   when copied (`npm run check:examples`).
   Add an English lead in `src/docs/i18n/en/components.ts` (a test requires every slug), tests next to the component
   (behaviour, keyboard, ARIA; SSR case in `src/test/ssrCases.tsx` if it reads time / media queries / storage), then run
   `npm run check:examples`, `npm run check:props` and
   `npx playwright test e2e/a11y.spec.ts --project=a11y --grep "<slug>"`, and add a changeset (`minor` for a new component).
3. Blocks: `src/docs/block-library/NN-name.tsx` with `export const meta` + a default export, importing only from
   `@/components/ui` and `@fluentui/react-icons`.

### Translating the docs

UI strings live in `src/docs/i18n/vi.ts` (source of the keys) and `src/docs/i18n/en.ts`. English component names and leads: `src/docs/i18n/en/components.ts` (a test requires every slug). English concept pages: add `src/docs/concepts/en/<slug>.tsx` with the same section ids as the Vietnamese page. Untranslated pages show a notice and the Vietnamese original.

Copy (docs, templates, CLI messages, changesets) follows wiki › *Writing*: short and clear, no repeating what the UI next to it already says, package names as users see them.

### Branches

Bug fixes, docs, tests → PR to `main`. New components / props / tokens and breaking changes → PR to `next` (when it exists, otherwise `main`). Branch names: `feat/…`, `fix/…`, `docs/…`, `chore/…`, `exp/…`. Release channels (`latest`, `next`, `canary`, `release-X.Y`): wiki › *Branching and Release Channels*.

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

One changeset per change (two new components → two files). Needs a changeset: anything people installing `yugen-ui`
receive (components, props, exports, tokens, CSS, fixes, a11y). No changeset: docs pages / examples, tests, CI, wiki.
`npx changeset status` previews the bump. On the `next` branch (prerelease mode) `.changeset/pre.json` lives only on
`next` — commit it there, never edit it by hand or bring it to `main`; changeset files are kept after each `-next.N`
release and removed when the cycle exits pre mode.

### Releasing (maintainers)

1. `npm run version-packages` (= `changeset version` + syncs `templates/` and the lockfile — skipping it turns CI red) — writes the pending changesets into `CHANGELOG.md` (new section at the top), bumps
   `version` in `package.json` and deletes the used changeset files. Review the generated entry.
2. Add the release at the **top** of the `NEWS` array in `src/docs/news.ts` (the "Có gì mới" page). The docs site
   reads its version from `package.json` automatically.
3. `npm install --package-lock-only` (syncs the version in `package-lock.json`), then `npm run check:release`
   (`package.json` = `news.ts` = `CHANGELOG.md`).
4. Commit (`chore(release): vX.Y.Z`) and merge to `main`.
5. `git tag vX.Y.Z && git push --tags` — `.github/workflows/release.yml` re-checks the version against the tag, runs
   the tests, builds and runs `npm publish --provenance` (needs the `NPM_TOKEN` secret). Tags containing `-`
   (e.g. `v0.6.0-beta.1`) are published under the `next` dist-tag.

The `@yugen-ui/cli` CLI and `create-yugen-ui` (`packages/`) are released separately with a `cli@X.Y.Z` tag, outside
Changesets — rules and steps in the wiki › *Release Process* › CLI. PRs that change `packages/cli` or
`packages/create-yugen-ui` add a line under `## Unreleased` in `packages/cli/CHANGELOG.md`. Every release needs a news
entry at the top of `CLI_NEWS` (and `CREATE_NEWS` when `create-yugen-ui` changes version) in `src/docs/news.ts`, shown
in its own tab on the What's new page; `check-release` fails without it. Before tagging run
`npm run check:release --prefix packages/cli -- --npm` and `npm run smoke --prefix packages/cli`.
