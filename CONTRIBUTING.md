# Contributing to Yugen UI

*Tiếng Việt: [xem bên dưới](#tiếng-việt).*

Thanks for your interest! This guide comes in English first, then the same content in Vietnamese. Both point to
[Design.md](./Design.md), the project rulebook, which wins when in doubt.

Everyone taking part follows the [Code of Conduct](./CODE_OF_CONDUCT.md). Roles, decisions and RFCs:
[GOVERNANCE.md](./GOVERNANCE.md); architecture and operations: the [Wiki](https://github.com/trandat1114/Yugen-UI/wiki).
Security vulnerabilities: do **not** open a public issue, see [SECURITY.md](./SECURITY.md).

## Contributors

**Code and docs**

<a href="https://trandat1114.github.io/Yugen-UI/contributors#code"><img src="https://raw.githubusercontent.com/trandat1114/Yugen-UI/contributors-data/contributors-code.svg" alt="Avatars of everyone credited for code, templates, docs and translations"></a>

**Ideas and discussion**

<a href="https://trandat1114.github.io/Yugen-UI/contributors#ideas"><img src="https://raw.githubusercontent.com/trandat1114/Yugen-UI/contributors-data/contributors-ideas.svg" alt="Avatars of everyone credited for ideas, design, bug reports, reviews and feedback"></a>

Names and what each person did are on the [Contributors page](https://trandat1114.github.io/Yugen-UI/contributors).
The page and these images update a few minutes after each contribution, see [Contributor credit](#contributor-credit).

---

## English

### Setup

Requires Node.js **24 LTS** or newer and npm. CI runs the two newest LTS lines (24 and 26 today).

```bash
npm install
npm run dev          # docs site at http://localhost:5173
```

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs the docs site (Vite) |
| `npm run typecheck` | Type check (`tsc -b` with TypeScript 7, the native compiler) |
| `npm run lint:classes` | Checks that Tailwind classes are canonical (`node scripts/canonical-classes.mjs --fix` repairs them) |
| `npm run icons` | Regenerates the built-in icons (`src/components/ui/_internal/icons.tsx`) from the ones components import (`--check` in CI) |
| `npm run build:lib` | Builds the library into `dist/` (JS + `.d.ts` + `theme.css` / `styles.css` / `tokens.css`) |
| `npm run build:docs` | Builds the docs site into `dist-docs/` |
| `npm run build` | Both |
| `npm run pack:check` | Previews the npm package contents (`npm pack --dry-run`) |
| `npm test` | Unit and interaction tests (Vitest + Testing Library, `src/**/*.test.ts(x)`) |
| `npm run test:e2e` | Playwright on the docs site: axe (a11y), mouse drag, emulated touch |
| `npm run test:visual` | Screenshot comparison (the `visual` Playwright project) |
| `npm run test:engines` | Interaction E2E on Firefox and WebKit (Safari desktop, iPhone) |
| `npm run size` | Package size budgets (`size-limit`, after `build:lib`) |
| `npm run changeset` | Adds a changeset to the PR (`npx changeset`) |
| `npm run check:release` | Checks `package.json` = `src/docs/news` = `CHANGELOG.md` and the rules for each number |
| `npm run check:changesets` | Checks that each changeset's bump follows the rules for each number |
| `npm run check:deps` | Installs the packed package and checks its dependency tree against `deps-policy.json` (see [Dependencies](#dependencies)) |
| `npm run check:examples` | Every docs example type-checks when copied out and used with `yugen-ui` |
| `npm run check:props` | Props tables in the docs match the real types |
| `npm run registry` | Generates the shadcn registry into `public/r/` (runs inside `build:docs`) |
| `npm run contributors` | Refreshes `src/docs/contributors.json` from GitHub (needs `GITHUB_TOKEN`) |
| `npm run version-packages` | (maintainers) Versions from changesets and syncs templates and the lockfile |
| `node scripts/sync-templates.mjs` | Regenerates `templates/` from the blocks and `src/docs/template-library/` (`--check` to verify) |
| `node scripts/og-image.mjs` | Regenerates the share image `public/og.jpg` (Open Graph) |

### Tests

- `npm test` — unit and interaction tests (Vitest + Testing Library, jsdom), colocated as
  `src/components/ui/<Name>/<Name>.test.tsx`; `npm run test:watch` while writing them.
- `npm run test:e2e` — Playwright against the docs site (it builds the docs and serves them with `vite preview` on port
  5200; `YUGEN_E2E_DEV=1` uses the dev server instead, faster for a single spec): axe accessibility,
  mouse drag and emulated touch. Locally it uses the installed Microsoft Edge; CI uses Playwright's Chromium (without
  Edge: `npx playwright install chromium` and run with `CI=1`). Open the report with `npx playwright show-report`.
- `npm run test:visual` — screenshot comparison. Only Linux baselines (`e2e/__screenshots__/**/*-linux.png`) are
  committed, and CI compares them on every PR that changes components, styles or the docs layout. On Windows / macOS the
  first run creates baselines for your machine (gitignored). After an intended visual change, run the **Visual
  regression** workflow on your branch (Actions → Run workflow, tick `update`), download the `visual-screenshots`
  artifact, copy it into `e2e/__screenshots__/`, look at the files git shows as changed, and commit those. The update
  rewrites every baseline, so screenshots that drifted below the 1% tolerance are refreshed too. The workflow never
  commits.
- `npm run test:engines` — interaction E2E on Firefox and WebKit (Safari desktop, iPhone); run
  `npx playwright install firefox webkit` once. CI runs it weekly, on PRs into `main` and on PRs that change
  `e2e/` or `playwright.config.ts` (the **Browser engines** workflow), not on every PR. Touch-drag tests go through CDP,
  so they run on Chromium only.
- `npm run size` — size budgets (`.size-limit.cjs`), after `npm run build:lib`. If a budget fails, find the cause first
  (an extra import, a new dependency); raise a `limit` only on purpose, and say why in the PR. A limit is the measured
  size + 8%, rounded up to 0.5 kB. When a change makes an entry smaller, lower its limit in the same PR:
  `node scripts/check-size-slack.mjs` (CI) fails when a limit is more than 20% above the measured size.

### Rules (summary of Design.md §0)

1. No hard-coded HEX / rgb, px, ms or cubic-bezier in `.tsx`; only utilities mapped to tokens.
2. Tailwind's default palette is disabled (`bg-blue-500`, `rounded-lg`, `shadow-md`, `text-sm` don't exist).
3. Spacing uses the numeric scale on the Fluent ramp: `p-3`, `gap-2`, `px-5` (Design.md §3.2). Font sizes use the type
   ramp only, `text-caption2 … text-display`.
4. Always merge classes with `cn()` (`src/lib/cn.ts`), never with `twMerge` directly.
5. No `dark:` variant; logical properties only (`ms/me/ps/pe/start/end`) so RTL works.
6. Neutral colours for surfaces / text / borders · brand only for CTAs, selection, focus and links · semantic colours
   only for states.
7. Gradients only for illustrations / heroes, never on controls.
8. Text contrast ≥ 4.5:1, UI parts ≥ 3:1; colour is never the only signal.
9. Complex behaviour uses Radix / `cmdk` / `react-day-picker`; icons are Fluent System Icons only: inside components from `../_internal/icons` (see [Adding a component](#adding-a-component)), in demos and blocks from `@fluentui/react-icons`. No other UI
   or animation library.

### Dependencies

Every runtime dependency ships to every app that installs `yugen-ui`. Before adding one:

- Give the reason in the PR, and say why a small implementation of our own is not enough (as with Sortable, and the
  listbox of Combobox and TagPicker).
- It must be maintained, have no install scripts (`preinstall` / `install` / `postinstall`), and carry npm provenance
  when possible.

`npm run check:deps` (workflow **Dependencies**, on PRs that change `package.json`, `package-lock.json` or
`deps-policy.json`) installs the packed package like an app does and fails when the tree grows past `maxPackages`,
when a package has an install script, when a package's last publish is more than 5 years old, when a direct dependency
has no provenance, or when a version comes from a different npm account than the one before. Accepted cases go in
`allow` in `deps-policy.json` with a reason and a review date. When a dependency goes away, lower `maxPackages`
(`node scripts/check-deps.mjs --write`).

### Adding a component

1. Create `src/components/ui/<Name>/<Name>.tsx` following Design.md §5 (named function export that takes `ref` as a
   prop, user `className` last in `cn(...)`, hover / pressed / disabled / focus-visible states, keyboard support,
   `aria-*`).
   - Icons: import them by their Fluent name from `../_internal/icons` (for example `Dismiss20Regular`), then run
     `npm run icons`. The script copies the icon from `@fluentui/react-icons` into the library, so `yugen-ui` doesn't
     depend on the icon package. For an icon passed in by the user, give the slot a size with `[&_svg]:size-…`, so any
     SVG icon set fits.
2. Add `export * from "./<Name>/<Name>";` to the right group in `src/components/ui/index.ts`. The npm package exports
   everything in that barrel.
3. Write the docs page: add a `ComponentDoc` to a file in `src/docs/registry/` (`slug`, `name`, `category`, `lead`,
   `description`, `importCode`, `hero`, `examples` — **`code` must match the JSX in `render` exactly**, `dos` / `donts`,
   `props`). The sidebar, search and home page are generated from the registry.
   - A prop whose default is a built-in string (aria-label, placeholder…) shows the English value in **Default**, the
     library default since 0.14 (`"Breadcrumb"`, not the Vietnamese one); `registry.test.ts` fails on a quoted
     Vietnamese default.
   - `slug`, `name`, `category` and `lead` must be **string literals** (they are extracted at build time to lazy-load
     the page).
   - Examples with state or data: write a demo component in the file and slice its code with `// #region Name` …
     `// #endregion` (see `src/docs/registry/content-search.tsx`), so `code` always matches `render`.
   - `code` must **run when copied out**: shared data goes in `setup` (`declarationsOf(RAW, ["NAME"])`).
4. Add the English lead: `<slug>: { lead: "…" }` in `src/docs/i18n/en/components.ts` (a test requires every slug).
5. Tests next to the component (`<Name>.test.tsx`): behaviour, keyboard, ARIA. A component that reads time, media
   queries or storage also gets a case in `src/test/ssrCases.tsx`.
6. Check before opening a PR:
   ```bash
   npm run typecheck && npm run lint:classes && npm test
   npm run check:examples && npm run check:props          # examples run on their own · props tables match the types
   npx playwright test e2e/a11y.spec.ts --project=a11y --grep "<slug>"   # axe on your page
   ```
7. Changeset (`npx changeset`, usually `minor` for a new component); see [Changesets](#changesets).
8. A new dependency, if really needed, goes in `dependencies` of `package.json`; the maintainer decides.
9. Visual baselines: the hero demo of every component page is screenshotted in light, dark and high contrast, so
   **Visual (compare)** fails until the PR has the new `component-<slug>-*` baselines (run the **Visual regression**
   workflow with `update`, see [Tests](#tests)). If the layout follows the text direction, add the slug to `RTL` in
   `e2e/visual.spec.ts`.

### Adding a block

1. Create `src/docs/block-library/NN-name.tsx` with `export const meta = { title, description, order }` and
   `export default function …`. Add `wide: true` to `meta` for a block with several cards inside (it spans two columns
   on `/blocks`).
2. Import only from `@/components/ui` and `@fluentui/react-icons`, so people can copy the whole file.
3. Add its Vietnamese title to `META_VI` in `src/docs/pages/BlocksPage.tsx` and its strings to
   `src/docs/block-library/vi/NN-name.json`.

### Translating the docs

UI strings live in `src/docs/i18n/vi.ts` (source of the keys) and `src/docs/i18n/en.ts`. English component names and
leads: `src/docs/i18n/en/components.ts` (a test requires every slug). English concept pages: add
`src/docs/concepts/en/<slug>.tsx` with the same section ids as the Vietnamese page, and its lead and table of contents
in `src/docs/i18n/en/concepts.ts`. English component pages: add the entry to `src/docs/registry/en/<registry file>.ts`
(description, example titles in the same order, dos / don'ts, a description for every prop; demos and code stay as
they are); the page is marked translated at build time and `registry/en.test.ts` checks the entry is complete.
Untranslated pages show a notice and the Vietnamese original.

Demos, code samples and blocks are written in English. Vietnamese pages (`/vi/`) swap their text through
`src/docs/registry/vi/<registry file>.json` (blocks: `src/docs/block-library/vi/<file>.json`): English string →
Vietnamese, exact matches only. `registry/vi.test.ts` lists demo strings that have no entry.

Copy (docs, templates, CLI messages, changesets) follows wiki › *Writing*: short and clear, no repeating what the UI
next to it already says, package names as users see them.

### Branches

Bug fixes, docs, tests → PR to `main`. New components / props / tokens and breaking changes → PR to `next` (when it
exists, otherwise `main`). Branch names: `feat/…`, `fix/…`, `docs/…`, `chore/…`, `exp/…`. Release channels (`latest`,
`next`, `canary`, `release-X.Y`): wiki › *Branching and Release Channels*.

### Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(button): add the "tint" appearance
fix(combobox): keep focus when a tag is removed with Backspace
docs(theming): example of a custom brand
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Breaking API changes add
`!` (`feat(field)!: …`) and describe the change in the commit body.

### Keep PRs few

Every push to a PR reruns the whole CI (~5 min, plus Visual), so fewer PRs and fewer pushes are faster for everyone.

- **One PR per issue.** Small changes in the same area (copy, docs of one page) go together, not one PR each. Avoid
  stacked PRs (PR B built on PR A's branch); if one is unavoidable, state the merge order in the description.
- **Open it as a draft** while you are still working: CI does not run on drafts; click *Ready for review* once.
- **Check locally before pushing** (typecheck, `lint:classes`, the related tests), then push once.
- **PRs that only touch Markdown / `wiki/`** skip CI.
- **Dependabot** (`.github/dependabot.yml`): all updates go to `next`, at most one minor + patch PR and one major PR a
  week; the CLI and GitHub Actions get one PR a month; 7-day cooldown. Majors that need code changes are ignored in the
  config and tracked in a migration issue (#91) instead of sitting as red PRs.

### Changesets

From 0.6.0, `CHANGELOG.md` is generated by [Changesets](https://github.com/changesets/changesets) — do not edit it by
hand. A PR with a user-facing change (component, prop, token, CSS, bug fix) adds a changeset; docs / test / CI-only
PRs do not need one.

A PR into `next` with a user-facing change (docs included) also adds an item to the **upcoming news entry**: the two
files `src/docs/news/yugen-ui/<version>.vi.md` and `.en.md` marked `upcoming: true` (create them if missing, with the
version from `npx changeset status`). CLI changes go to `src/docs/news/cli` / `create-yugen-ui`.
`node scripts/check-news.mjs` checks the format; preview it on the `/next/` docs. Details: wiki › *Release Process* ›
News on the What's new page.

```bash
npx changeset    # pick yugen-ui → patch or minor → write a user-facing summary
```

- `patch` for fixes and small improvements, `minor` for new components / props / tokens and — while the version is
  `0.x` — for breaking changes too (start the summary with "**Breaking:**" and explain the migration).
- Version numbers follow the **rules for each number** (docs › Versioning › Rules for each number): only new API is
  `minor`, everything else is `patch`; PRs into `main` or `release/*` carry `patch` only; `major` starts at 1.0.
  `npm run check:changesets` (CI) rejects a summary starting with "Fix" on a `minor`, "New" on a `patch` and
  "**Breaking:**" on a `patch`. `check:release` checks the news in `src/docs/news`: no `new` / `breaking` item in a
  patch, at least one `new` item in a minor, no skipped numbers, ≥ 14 days between minors and ≥ 180 days between
  majors.
- Write the summary for package users (in English, like the CHANGELOG): "`Combobox`: keep focus when a tag is removed
  with Backspace.", not "fix bug".
- Commit the generated `.changeset/*.md` file with your PR; you can edit its text.
- One changeset per change (two new components → two files), any file name, for example:

  ```md
  ---
  "yugen-ui": minor
  ---

  New `Quote` component: attributed quotations rendered as <figure> › <blockquote cite> + <figcaption>…
  ```

- **Needs a changeset**: anything people installing `yugen-ui` receive (components, props, exports, tokens, CSS,
  fixes, a11y). **No changeset**: docs pages / examples, tests, CI, wiki (for example a redesigned docs example).
- `npx changeset status` previews the bump before a release.
- **On the `next` branch (prerelease mode)**: `.changeset/pre.json` lives only on `next` — commit it there, never edit
  it by hand or bring it to `main`. Changeset files are **kept** after each `-next.N` release (that is normal) and
  removed when the cycle exits pre mode for a stable release. Details: wiki › *Branching and Release Channels*.
- To thank someone with no commit in the PR (a bug reporter, say), end the summary with a `Thanks: @name` line; the
  CHANGELOG then reads "Thanks [@name](…)!". The PR author is thanked automatically when `npm run version-packages`
  runs with `GITHUB_TOKEN` set (for example from `gh auth token`). Maintainers are not listed.

### Contributor credit

The `/contributors` page and the images at the top of this file list everyone with a merged pull request (including
commits in someone else's pull request and `Co-authored-by` lines), an issue (bug report, accessibility report, idea), a
review or a feedback comment on an issue or pull request, read from the GitHub API: `npm run contributors` (needs
`GITHUB_TOKEN`) writes `src/docs/contributors.json`, the snapshot the Docs workflow refreshes on every deploy. The
Contributors data workflow runs again a few minutes after each issue, comment or merged pull request (and daily) and
pushes the data and the images to the `contributors-data` branch; the page loads it and falls back to the snapshot.
Contributions outside GitHub (design, ideas), or a comment that deserves a more specific type, go by hand into
`src/docs/contributors.extra.json`; titles always come from GitHub as written. To take your name off the page, open an
issue or contact a maintainer, who adds your login to `exclude` in that file.

### Pull request checklist

- [ ] `npm run typecheck`, `npm run lint:classes`, `npm test`, `npm run build:lib` and `npm run build:docs` pass.
- [ ] `npm run test:e2e` passes (new UI or interactions); `npm run size` is within budget.
- [ ] The **Visual (compare)** check is green, or the baselines were updated in the same PR for an intended visual
  change.
- [ ] No arbitrary HEX / px / ms; spacing on the numeric scale; font sizes on the type ramp; shared classes used
  (Design.md §5.7).
- [ ] Colours match their roles; no large brand areas; no gradients on controls.
- [ ] Hover / pressed / disabled / focus-visible states; keyboard works; tried in RTL.
- [ ] Checked Sakura / Web / Teams × Light / Dark and High contrast.
- [ ] Registry entry (or block file) added; example code matches the render.
- [ ] Changeset added (`npx changeset`) if the change affects users.
- [ ] Copy follows wiki › *Writing* (checklist at the end of the page).
- [ ] PR into `next`: an item added to the upcoming news entry in `src/docs/news`, in both vi and en.

### Releasing (maintainers)

1. `npm run version-packages` (= `changeset version` + syncs `templates/` and the lockfile — skipping it turns CI red)
   — writes the pending changesets into `CHANGELOG.md` (new section at the top), bumps `version` in `package.json` and
   deletes the used changeset files. Review the generated entry.
2. Finalize the news: remove `upcoming` from the two newest files in `src/docs/news/yugen-ui` and set the release date
   (add `<version>.vi.md` and `.en.md` if there is no upcoming entry). The docs site reads its version from
   `package.json` automatically.
3. `npm install --package-lock-only` (syncs the version in `package-lock.json`), then `npm run check:release`
   (`package.json` = `src/docs/news` = `CHANGELOG.md`).
4. Commit (`chore(release): vX.Y.Z`) and merge to `main`.
5. `git tag vX.Y.Z && git push --tags` — `.github/workflows/release.yml` re-checks the version against the tag, runs
   the tests, builds and runs `npm publish --provenance` (npm trusted publishing, no token). Tags containing `-`
   (e.g. `v0.6.0-beta.1`) are published under the `next` dist-tag.

The `@yugen-ui/cli` CLI and `create-yugen-ui` (`packages/`) are released separately with a `cli@X.Y.Z` tag, outside
Changesets — rules and steps in the wiki › *Release Process* › CLI. PRs that change `packages/cli` or
`packages/create-yugen-ui` add a line under `## Unreleased` in `packages/cli/CHANGELOG.md`. Every release needs news in
`src/docs/news/cli` (and `src/docs/news/create-yugen-ui` when `create-yugen-ui` changes version), in Vietnamese and
English, shown in its own tab on the What's new page; `check-release` fails without it. Before tagging run
`npm run check:release --prefix packages/cli -- --npm` and `npm run smoke --prefix packages/cli`.

---

## Tiếng Việt

Cảm ơn bạn đã quan tâm! Phần này cùng nội dung với bản tiếng Anh ở trên. Cả hai dẫn về [Design.md](./Design.md), bộ
luật của dự án, luôn được ưu tiên khi có điều chưa rõ.

Mọi người tham gia đều tuân thủ [Quy tắc ứng xử](./CODE_OF_CONDUCT.md). Vai trò, cách ra quyết định và RFC:
[GOVERNANCE.md](./GOVERNANCE.md); kiến trúc và vận hành: [Wiki](https://github.com/trandat1114/Yugen-UI/wiki). Lỗ hổng
bảo mật: **không** mở issue công khai, xem [SECURITY.md](./SECURITY.md). Ảnh những người đã đóng góp nằm ở mục
[Contributors](#contributors) đầu trang.

### Cài đặt

Yêu cầu Node.js **24 LTS** trở lên và npm. CI chạy 2 bản LTS mới nhất (hiện là 24 và 26).

```bash
npm install
npm run dev          # trang docs tại http://localhost:5173
```

### Lệnh

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Chạy trang docs (Vite) |
| `npm run typecheck` | Kiểm tra kiểu (`tsc -b` bằng TypeScript 7, trình biên dịch native) |
| `npm run lint:classes` | Kiểm tra class Tailwind ở dạng canonical (`node scripts/canonical-classes.mjs --fix` để tự sửa) |
| `npm run icons` | Sinh lại icon có sẵn (`src/components/ui/_internal/icons.tsx`) theo các icon component đang import (CI chạy `--check`) |
| `npm run build:lib` | Build thư viện vào `dist/` (JS + `.d.ts` + `theme.css` / `styles.css` / `tokens.css`) |
| `npm run build:docs` | Build trang docs vào `dist-docs/` |
| `npm run build` | Cả hai |
| `npm run pack:check` | Xem trước nội dung gói npm (`npm pack --dry-run`) |
| `npm test` | Unit + tương tác (Vitest + Testing Library, `src/**/*.test.ts(x)`) |
| `npm run test:e2e` | Playwright trên trang docs: axe (a11y), kéo chuột, chạm mô phỏng |
| `npm run test:visual` | So sánh ảnh chụp (project `visual` của Playwright) |
| `npm run test:engines` | E2E tương tác trên Firefox và WebKit (Safari desktop, iPhone) |
| `npm run size` | Ngân sách dung lượng gói (`size-limit`, chạy sau `build:lib`) |
| `npm run changeset` | Thêm changeset cho PR (`npx changeset`) |
| `npm run check:release` | Kiểm tra `package.json` = `src/docs/news` = `CHANGELOG.md` và quy tắc cho từng số |
| `npm run check:changesets` | Loại bump của changeset đúng quy tắc cho từng số |
| `npm run check:deps` | Cài gói đã đóng gói và kiểm tra cây dependency theo `deps-policy.json` (xem [Dependency](#dependency)) |
| `npm run check:examples` | Mọi ví dụ docs typecheck được khi chép ra dùng với `yugen-ui` |
| `npm run check:props` | Bảng props trên docs khớp type thật |
| `npm run registry` | Sinh registry shadcn vào `public/r/` (tự chạy trong `build:docs`) |
| `npm run contributors` | Làm mới `src/docs/contributors.json` từ GitHub (cần `GITHUB_TOKEN`) |
| `npm run version-packages` | (maintainer) Đánh số phiên bản từ changeset + đồng bộ templates & lockfile |
| `node scripts/sync-templates.mjs` | Sinh lại `templates/` từ block và `src/docs/template-library/` (`--check` để kiểm tra) |
| `node scripts/og-image.mjs` | Sinh lại ảnh chia sẻ `public/og.jpg` (Open Graph) |

### Kiểm thử

- `npm test` — Vitest (jsdom). Test đặt cạnh component: `src/components/ui/<Name>/<Name>.test.tsx`. Chạy
  `npm run test:watch` khi đang viết test.
- `npm run test:e2e` — Playwright tự build docs và chạy `vite preview` ở cổng 5200 (`YUGEN_E2E_DEV=1` dùng dev server,
  nhanh hơn khi chỉ chạy một spec). Trên máy dùng Microsoft Edge đã cài sẵn; CI dùng
  Chromium của Playwright (`npx playwright install chromium`, rồi chạy với `CI=1` nếu máy không có Edge). Báo cáo:
  `npx playwright show-report`.
- `npm run test:visual` — chỉ ảnh Linux (`e2e/__screenshots__/**/*-linux.png`) được commit; CI so sánh trên mọi PR đổi
  component, style hoặc khung docs. Trên Windows / macOS, lần chạy đầu tạo ảnh riêng cho máy bạn (gitignore). Cố ý đổi
  giao diện: chạy workflow **Visual regression** trên nhánh của bạn (Actions → Run workflow, tick `update`), tải artifact
  `visual-screenshots`, chép vào `e2e/__screenshots__/`, xem các file git báo đổi rồi commit chúng. Lần update ghi lại
  mọi ảnh, nên ảnh lệch dưới ngưỡng 1% cũng được làm mới. Workflow không tự commit.
- `npm run test:engines` — cần `npx playwright install firefox webkit` một lần. CI chạy hằng tuần, trên PR vào `main` và
  trên PR có đổi `e2e/` hoặc `playwright.config.ts` (workflow **Browser engines**), không chạy trên mọi PR. Test chạm-kéo dùng CDP nên chỉ chạy trên Chromium.
- `npm run size` — sau `npm run build:lib`. Vượt ngân sách thì tìm nguyên nhân trước (import thừa, dependency mới);
  tăng có chủ đích thì sửa `limit` trong `.size-limit.cjs` và ghi lý do trong PR. Giới hạn = kích thước đo được + 8%,
  làm tròn lên 0.5 kB. Thay đổi làm một mục nhỏ đi thì hạ `limit` của mục đó trong cùng PR:
  `node scripts/check-size-slack.mjs` (CI) báo lỗi khi giới hạn cao hơn kích thước đo được quá 20%.

### Luật bắt buộc (tóm tắt Design.md §0)

1. Không hard-code HEX/rgb, px, ms, cubic-bezier trong `.tsx` — chỉ dùng utility map từ token.
2. Palette mặc định của Tailwind đã tắt (`bg-blue-500`, `rounded-lg`, `shadow-md`, `text-sm` không tồn tại).
3. Spacing dùng thang số trong ramp Fluent: `p-3`, `gap-2`, `px-5` (Design.md §3.2). Cỡ chữ chỉ dùng type ramp `text-caption2 … text-display`.
4. Luôn gộp class bằng `cn()` (`src/lib/cn.ts`), không dùng `twMerge` gốc.
5. Không dùng `dark:`; chỉ dùng thuộc tính logic (`ms/me/ps/pe/start/end`) để RTL hoạt động.
6. Neutral cho bề mặt/chữ/viền · Brand chỉ cho CTA, trạng thái chọn, focus, link · Semantic chỉ cho trạng thái.
7. Gradient chỉ cho minh hoạ/hero — không bao giờ trên control.
8. Tương phản chữ ≥ 4.5:1, thành phần UI ≥ 3:1; không dùng màu làm tín hiệu duy nhất.
9. Hành vi phức tạp dùng Radix / `cmdk` / `react-day-picker`; icon chỉ dùng Fluent System Icons: trong component lấy từ `../_internal/icons` (xem [Thêm component](#thêm-component)), trong demo và block lấy từ `@fluentui/react-icons`. Không thêm thư
   viện UI/animation khác.

### Dependency

Mỗi dependency runtime đi vào mọi ứng dụng cài `yugen-ui`. Trước khi thêm:

- Ghi lý do trong PR, và vì sao một bản tự viết nhỏ không đủ (như Sortable, và listbox của Combobox và TagPicker).
- Thư viện phải còn được bảo trì, không có install script (`preinstall` / `install` / `postinstall`), và có npm
  provenance khi được.

`npm run check:deps` (workflow **Dependencies**, trên PR đổi `package.json`, `package-lock.json` hoặc
`deps-policy.json`) cài gói đã đóng gói như một ứng dụng và báo lỗi khi cây dependency vượt `maxPackages`, khi một gói
có install script, khi lần phát hành cuối của một gói đã quá 5 năm, khi dependency trực tiếp không có provenance, hoặc
khi một phiên bản do tài khoản npm khác với bản trước phát hành. Trường hợp chấp nhận được ghi vào `allow` trong
`deps-policy.json`, kèm lý do và ngày xem lại. Khi bỏ một dependency, hạ `maxPackages`
(`node scripts/check-deps.mjs --write`).

### Thêm component

1. Tạo `src/components/ui/<Name>/<Name>.tsx` theo Design.md §5 (named export dạng hàm, nhận `ref` như một prop,
   `className` cuối `cn(...)`, đủ trạng thái hover/pressed/disabled/focus-visible, bàn phím, `aria-*`).
   - Icon: import theo tên Fluent từ `../_internal/icons` (vd. `Dismiss20Regular`) rồi chạy `npm run icons`. Script chép
     icon từ `@fluentui/react-icons` vào thư viện, nên `yugen-ui` không phụ thuộc gói icon. Ô nhận icon của người dùng
     thì đặt cỡ bằng `[&_svg]:size-…` để bộ icon SVG nào cũng vừa.
2. Thêm `export * from "./<Name>/<Name>";` vào đúng nhóm trong `src/components/ui/index.ts` — gói npm export mọi thứ
   có trong barrel này.
3. Viết trang docs: thêm một `ComponentDoc` vào file trong `src/docs/registry/` (`slug`, `name`, `category`, `lead`,
   `description`, `importCode`, `hero`, `examples` — **`code` phải giống hệt JSX trong `render`**, `dos`/`donts`,
   `props`). Sidebar, tìm kiếm, trang chủ tự sinh từ registry.
   - Prop có mặc định là chuỗi có sẵn (aria-label, placeholder…) ghi giá trị tiếng Anh ở cột **Mặc định**, vì đó là mặc
     định của thư viện từ 0.14 (`"Breadcrumb"`, không phải bản tiếng Việt); `registry.test.ts` báo lỗi nếu gặp chuỗi
     tiếng Việt trong ngoặc kép.
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
9. Ảnh visual: demo hero của mọi trang component được chụp ở theme sáng, tối và tương phản cao, nên **Visual (compare)**
   đỏ cho tới khi PR có baseline `component-<slug>-*` mới (chạy workflow **Visual regression** với `update`, xem mục
   [Kiểm thử](#kiểm-thử)). Bố cục đổi theo hướng chữ thì thêm slug vào `RTL` trong `e2e/visual.spec.ts`.

### Thêm block

1. Tạo `src/docs/block-library/NN-ten.tsx` với `export const meta = { title, description, order }` và
   `export default function …`. Block có nhiều thẻ bên trong thì thêm `wide: true` vào `meta` (chiếm hai cột trên
   `/blocks`).
2. Chỉ import từ `@/components/ui` và `@fluentui/react-icons` để người dùng copy được nguyên file.
3. Thêm tên tiếng Việt vào `META_VI` trong `src/docs/pages/BlocksPage.tsx` và các chuỗi vào
   `src/docs/block-library/vi/NN-ten.json`.

### Dịch tài liệu

Chuỗi giao diện docs nằm ở `src/docs/i18n/vi.ts` (nguồn khoá) và `src/docs/i18n/en.ts`. Tên / mô tả component tiếng
Anh: `src/docs/i18n/en/components.ts` (test bắt buộc đủ mọi slug). Trang khái niệm tiếng Anh: thêm
`src/docs/concepts/en/<slug>.tsx` cùng id mục với bản tiếng Việt, kèm lead và mục lục trong
`src/docs/i18n/en/concepts.ts`. Trang component tiếng Anh: thêm mục vào `src/docs/registry/en/<file registry>.ts` (mô
tả, tiêu đề ví dụ đúng thứ tự, nên / không nên, mô tả cho mọi prop; demo và code giữ nguyên); trang được đánh dấu đã
dịch lúc build và `registry/en.test.ts` kiểm tra mục đủ. Trang chưa dịch tự hiện thông báo và nội dung gốc.

Demo, code mẫu và block viết bằng tiếng Anh. Trang tiếng Việt (`/vi/`) đổi chữ qua
`src/docs/registry/vi/<file registry>.json` (block: `src/docs/block-library/vi/<file>.json`): chuỗi tiếng Anh → tiếng
Việt, khớp nguyên văn. `registry/vi.test.ts` liệt kê chuỗi demo chưa có mục.

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

### Giữ ít PR

Mỗi lần push vào một PR chạy lại toàn bộ CI (~5 phút, cộng Visual), nên ít PR và ít lần push thì nhanh hơn cho mọi người.

- **Một PR cho một issue.** Các sửa nhỏ cùng khu vực (chữ, docs của cùng một trang) gộp chung một PR, không mở PR cho
  từng chỗ. Tránh PR xếp chồng (PR B dựng trên nhánh của PR A); nếu bắt buộc, ghi rõ thứ tự merge trong mô tả.
- **Mở ở dạng Draft khi còn đang làm.** CI không chạy với PR draft; bấm *Ready for review* khi xong để chạy một lần.
- **Kiểm tra trên máy trước khi push** (typecheck, `lint:classes`, test liên quan), gom commit rồi push một lần.
- **PR chỉ đổi Markdown / `wiki/`** không chạy CI.
- **Dependabot** (`.github/dependabot.yml`): mọi bản cập nhật vào `next`, mỗi tuần tối đa một PR minor + patch và một PR
  major; CLI và GitHub Actions mỗi tháng một PR; cooldown 7 ngày. Bản major cần sửa code được bỏ qua trong cấu hình và
  theo dõi ở issue migration (#91), không để PR đỏ nằm chờ.

### Changeset

Từ 0.6.0, `CHANGELOG.md` do [Changesets](https://github.com/changesets/changesets) sinh — **không sửa tay**. PR có
thay đổi người dùng thấy được (component, prop, token, CSS, sửa lỗi) thêm một changeset; PR chỉ đổi docs / test / CI
thì không cần.

PR vào `next` có thay đổi người dùng thấy được (kể cả docs) còn thêm một mục vào **tin sắp phát hành**: hai file
`src/docs/news/yugen-ui/<version>.vi.md` và `.en.md` mang `upcoming: true` (tạo nếu chưa có, `version` theo
`npx changeset status`). Bản CLI ghi vào `src/docs/news/cli` / `create-yugen-ui`. `node scripts/check-news.mjs` kiểm tra
định dạng; xem trước ở docs `/next/`. Chi tiết: wiki › *Release Process* › Tin trên trang Có gì mới.

```bash
npx changeset    # chọn yugen-ui → patch hoặc minor → viết tóm tắt cho người dùng
```

- `patch`: sửa lỗi, cải tiến nhỏ. `minor`: component / prop / token mới, và — khi còn `0.x` — cả thay đổi phá vỡ API
  (mở đầu tóm tắt bằng "**Breaking:**" kèm cách chuyển đổi).
- Số phiên bản theo **quy tắc cho từng số** (docs › Phiên bản › Quy tắc cho từng số): chỉ có API mới mới là `minor`,
  còn lại là `patch`; PR vào `main` hoặc `release/*` chỉ mang `patch`; `major` chỉ từ 1.0. `npm run check:changesets`
  (CI) chặn changeset sai loại: tóm tắt mở đầu bằng "Fix" mà là `minor`, "New" mà là `patch`, "**Breaking:**" mà là
  `patch`. `check:release` kiểm tin trong `src/docs/news`: bản patch không có mục `new` / `breaking`, bản minor có
  ít nhất một mục `new`, không nhảy số, minor cách nhau ≥ 14 ngày, major ≥ 180 ngày.
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
- Cảm ơn người không có commit trong PR (vd. người báo lỗi): thêm dòng `Thanks: @tên` cuối tóm tắt, CHANGELOG ghi
  "Thanks [@tên](…)!". Tác giả PR được cảm ơn tự động khi `npm run version-packages` chạy có `GITHUB_TOKEN`
  (vd. `gh auth token`). Maintainer không được liệt kê.

### Ghi tên người đóng góp

Trang `/contributors` và ảnh ở đầu file này liệt kê mọi người có PR được merge (kể cả commit trong PR của người khác
và dòng `Co-authored-by`), issue (báo lỗi, báo lỗi tiếp cận, đề xuất), review hay bình luận góp ý trong issue và PR,
lấy từ GitHub API: `npm run contributors` (cần `GITHUB_TOKEN`) ghi `src/docs/contributors.json`, snapshot mà workflow
Docs làm mới mỗi lần deploy. Workflow Contributors data chạy lại vài phút sau mỗi issue, bình luận hay PR được merge (và
hằng ngày), đẩy dữ liệu và ảnh lên nhánh `contributors-data`; trang tải bản đó, lỗi thì dùng snapshot. Đóng góp ngoài
GitHub (thiết kế, ý tưởng), hoặc một bình luận cần loại cụ thể hơn, ghi tay vào `src/docs/contributors.extra.json`;
tiêu đề luôn lấy nguyên bản từ GitHub. Muốn bỏ tên khỏi trang: mở issue hoặc nhắn maintainer, maintainer thêm login vào
`exclude` trong file đó.

### Checklist PR

- [ ] `npm run typecheck`, `npm run lint:classes`, `npm test`, `npm run build:lib`, `npm run build:docs` đều pass.
- [ ] `npm run test:e2e` pass (component có giao diện / tương tác mới); `npm run size` vẫn trong ngân sách.
- [ ] Check **Visual (compare)** xanh, hoặc đã chụp lại baseline ngay trong PR khi cố ý đổi giao diện.
- [ ] Không HEX/px/ms tuỳ ý; spacing theo thang số; cỡ chữ theo type ramp; dùng class dùng chung (Design.md §5.7).
- [ ] Màu đúng vai trò; không brand diện tích lớn; không gradient trên control.
- [ ] Đủ trạng thái hover / pressed / disabled / focus-visible; bàn phím hoạt động; đã thử RTL.
- [ ] Đã kiểm tra Sakura / Web / Teams × Light / Dark và High contrast.
- [ ] Có mục registry (hoặc file block); code mẫu khớp với render.
- [ ] Đã thêm changeset (`npx changeset`) nếu thay đổi ảnh hưởng người dùng.
- [ ] Nội dung theo wiki › *Writing* (checklist cuối trang).
- [ ] PR vào `next`: đã thêm mục vào tin sắp phát hành (`upcoming`) trong `src/docs/news`, cả bản vi và en.

### Phát hành (maintainer)

1. `npm run version-packages` (= `changeset version` + đồng bộ `templates/` + lockfile — thiếu bước đồng bộ thì CI đỏ) — gộp các changeset vào `CHANGELOG.md` (mục mới ở đầu file), tăng `version` trong
   `package.json` và xoá file đã dùng. Xem lại phần CHANGELOG vừa sinh.
2. Chốt tin: bỏ `upcoming` khỏi hai file tin mới nhất trong `src/docs/news/yugen-ui` và điền ngày phát hành (chưa có tin
   `upcoming` thì thêm `<version>.vi.md` và `.en.md`). Số phiên bản trên site docs lấy thẳng từ `package.json`, không cần sửa.
3. `npm install --package-lock-only` (đồng bộ `version` trong `package-lock.json`) rồi `npm run check:release`
   (`package.json` = `src/docs/news` = `CHANGELOG.md`).
4. Commit (`chore(release): vX.Y.Z`), mở PR hoặc đẩy lên `main`.
5. `git tag vX.Y.Z && git push --tags` — workflow `.github/workflows/release.yml` kiểm tra lại, chạy test, build và
   `npm publish --provenance` (npm trusted publishing, không cần token). Tag có `-` (vd. `v0.6.0-beta.1`) phát hành với dist-tag `next`.

CLI `@yugen-ui/cli` và `create-yugen-ui` (`packages/`) phát hành riêng bằng tag `cli@X.Y.Z`, không qua Changesets — quy tắc và
các bước ở wiki › *Release Process* › CLI. PR đổi `packages/cli` hoặc `packages/create-yugen-ui`: ghi một dòng vào mục
`## Unreleased` của `packages/cli/CHANGELOG.md`. Mỗi bản phát hành cần tin trong `src/docs/news/cli` (và `src/docs/news/create-yugen-ui`
khi `create-yugen-ui` đổi version), cả bản vi và en, hiện ở tab riêng trên trang Có gì mới. `check-release` báo lỗi
nếu thiếu. Trước khi tag: `npm run check:release --prefix packages/cli -- --npm` và `npm run smoke --prefix packages/cli`.
