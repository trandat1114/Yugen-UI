# Release Process · Phát hành

Trang này mô tả kênh ổn định (`main` → `latest`). Bản thử nghiệm `next`, `canary` và vá minor cũ `release/X.Y`: [[Branching and Release Channels]].

Phiên bản theo [SemVer](https://trandat1114.github.io/Yugen-UI/#/concepts/versioning). Trước 1.0, bản minor có thể
có thay đổi phá vỡ — luôn ghi rõ.

## Trong mỗi PR

`npx changeset` → chọn `patch` (sửa lỗi) / `minor` (tính năng, deprecate) / `major` (từ 1.0, xoá API) → viết một câu cho
người dùng (tiếng Anh, như CHANGELOG). File nằm ở `.changeset/*.md`.

## Khi phát hành (maintainer)

```bash
git pull
npm run version-packages      # changeset version → bump package.json, ghi CHANGELOG, đồng bộ templates, lockfile
```

1. Thêm mục mới **lên đầu** mảng `NEWS` trong `src/docs/news.ts` (tiếng Việt, có `href` tới trang docs).
2. Thêm link `[x.y.z]: …/releases/tag/vx.y.z` cuối CHANGELOG.
3. `npm run check:release && npm test && npm run build`
4. Commit `chore(release): vx.y.z`, push, **đợi CI xanh**.
5. Tag và đẩy tag:

```bash
git tag vx.y.z
git push origin vx.y.z
```

Workflow **Release** kiểm tra tag khớp `package.json` và nằm đúng nhánh, chạy test, build và `npm publish --provenance`
(cần secret `NPM_TOKEN`). Dist-tag do `scripts/release-channel.mjs` chọn: `latest`, `next` (prerelease) hoặc `release-X.Y`.

Sau đó: workflow **Docs** build lại site (kèm docs các minor cũ ở `/vX.Y/`); tạo GitHub Release từ tag (dán phần CHANGELOG)
và đăng tóm tắt ở Discussions **Announcements**.

## Sửa nhanh sau phát hành (hotfix)

Sửa trên `main` → changeset `patch` → lặp lại quy trình (vd. `0.6.1`). Không publish lại cùng số phiên bản — npm không cho phép.

## CLI: `@yugen-ui/cli` và `create-yugen-ui`

Hai gói trong `packages/` (`packages/cli` → npm `@yugen-ui/cli`, lệnh sau khi cài là `yugen`;
`packages/create-yugen-ui` → npm `create-yugen-ui`), phát hành **riêng** với `yugen-ui`: tag `cli@X.Y.Z`, workflow
**Release CLI** (`.github/workflows/release-cli.yml`). Không dùng Changesets — version và CHANGELOG sửa tay. Docs cho
người dùng: `#/concepts/cli`.

Tên `yugen` (không scope) không dùng được: npm trả 403 *"Package name too similar to existing package hygen"*. Gói có
scope không bị kiểm tra này; scope `@yugen-ui` là một npm org (miễn phí) và `NPM_TOKEN` phải có quyền ghi trên org đó.

### Quy tắc

`packages/cli/scripts/check-release.mjs` kiểm tra tự động các quy tắc 1–4 (chạy trong CI và khi phát hành).

1. **CHANGELOG và Có gì mới** — mỗi version có mục `## X.Y.Z` ở **đầu** `packages/cli/CHANGELOG.md` (thay đổi của
   cả hai gói ghi chung ở đây), và một mục tin ở **đầu** `CLI_NEWS` trong `src/docs/news.ts` (tab `@yugen-ui/cli` trên
   `#/news`). Khi `create-yugen-ui` đổi version, thêm cả mục ở đầu `CREATE_NEWS` (tab `create-yugen-ui`). Viết tiếng Việt,
   `href` tới `#/concepts/cli`. Bản prerelease của CLI không cần mục tin. Trong lúc phát triển, PR đổi `packages/cli` ghi
   một dòng vào mục `## Unreleased` của CHANGELOG; khi phát hành, đổi `Unreleased` thành số version.
2. **`create-yugen-ui` theo CLI** — `packages/create-yugen-ui/package.json` khai báo `"@yugen-ui/cli": "^X.Y.0"`. Trước
   1.0, `^0.1.0` **không** nhận `0.2.0`: khi CLI lên minor, sửa dependency và tăng version `create-yugen-ui` trong cùng
   commit. Bản patch của CLI không cần phát hành lại `create-yugen-ui`.
3. **Template theo `yugen-ui`** — template nằm trong gói CLI và ghim `yugen-ui@^<bản hiện tại>`. Sau mỗi bản minor
   của `yugen-ui`, phát hành CLI (patch) để `create` tạo app với bản mới.
4. **Không dùng lại version** — kể cả bản đã unpublish: npm chặn vĩnh viễn, và `npm view` không thấy bản đã unpublish.
   Kiểm tra bằng `npm run check:release -- --npm`. Bản lỗi thì `npm deprecate`, không unpublish.
5. **Nhánh** — bản ổn định tag trên `main` (dist-tag `latest`); prerelease `cli@X.Y.Z-beta.N` tag trên `next`
   (dist-tag `next`, thử bằng `npx @yugen-ui/cli@next`). `create-yugen-ui` chỉ phát hành cùng bản ổn định.
6. **SemVer của CLI** — `patch`: sửa lỗi, cập nhật template; `minor`: lệnh hoặc tuỳ chọn mới, đổi định dạng
   `yugen.json`. Trước 1.0 thay đổi phá vỡ (đổi tên lệnh / tuỳ chọn, đổi chỗ ghi file) cũng là `minor`, ghi rõ trong
   CHANGELOG.
7. **Registry là hợp đồng** — `yugen add` / `init` đọc `public/r` do `scripts/build-registry.mjs` sinh (tên item,
   đường dẫn `registry/yugen/{ui,lib}/…`, import `@/lib` / `@/components/ui`, item `theme`, `cn`, `yugen-provider`,
   `all`). Đổi các thứ đó thì phát hành CLI tương thích **trước** khi docs (và registry) deploy.
8. **Chỉ publish qua tag** để có provenance — không `npm publish` từ máy cá nhân.

### Các bước

```bash
git switch main && git pull
# 1. Tăng "version" trong packages/cli/package.json (+ packages/create-yugen-ui/package.json khi theo quy tắc 2)
# 2. Đổi "## Unreleased" thành "## X.Y.Z" ở đầu packages/cli/CHANGELOG.md
# 3. Thêm mục tin lên đầu CLI_NEWS (và CREATE_NEWS nếu create-yugen-ui đổi version) trong src/docs/news.ts
cd packages/cli
npm install --package-lock-only    # version trong lockfile
npm run check:release -- --npm     # quy tắc 1–4 (--npm cần mạng)
npm test
npm run smoke                      # npm pack 2 gói → cài từ .tgz → create-yugen-ui mọi template
```

Commit `chore(release): cli X.Y.Z`, merge vào `main`, **đợi CI xanh** (job `CLI`), rồi:

```bash
git switch main && git pull
git tag cli@X.Y.Z
git push origin cli@X.Y.Z
```

**Release CLI** chạy `check-release.mjs --tag` (tag khớp version, đúng nhánh, version chưa bị unpublish → chọn dist-tag),
typecheck, test, smoke, rồi `npm publish --provenance` cho `@yugen-ui/cli` và `create-yugen-ui`. Mỗi gói bỏ qua nếu
version đó đã có trên npm, nên một bước publish lỗi (token, tên gói) thì sửa xong chỉ cần **Re-run** workflow.

### Sau khi publish

```bash
npx @yugen-ui/cli@latest --version
npx create-yugen-ui@latest smoke-app --template starter
cd smoke-app && npm run build
```

Docs deploy từ `main` đưa mục tin lên `#/news` (tab `@yugen-ui/cli` / `create-yugen-ui`) và bật chấm "có tin mới" trên
thanh trên cho người đã xem bản trước. Tạo GitHub Release từ tag (dán mục CHANGELOG). Hỏng sau khi publish: sửa trên `main`, phát hành bản patch; bản lỗi thì
`npm deprecate @yugen-ui/cli@X.Y.Z "…"` (không unpublish).

### Lần đầu (`cli@0.1.0`)

1. Trên npmjs.com: **Add Organization** → tên `yugen-ui` (gói public, miễn phí).
2. `NPM_TOKEN`: token granular có quyền **Read and write** cho **All packages** và cho org `yugen-ui` (hoặc token
   classic Automation) — cập nhật secret trong Settings › Secrets › Actions.
3. Tag `cli@0.1.0` trên `main` như trên.
