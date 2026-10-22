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

## CLI: `yugen` và `create-yugen-ui`

Hai gói trong `packages/` (`packages/cli` → npm `yugen`, `packages/create-yugen-ui` → npm `create-yugen-ui`), phát
hành **riêng** với `yugen-ui`: tag `yugen@X.Y.Z`, workflow **Release CLI** (`.github/workflows/release-cli.yml`).
Không dùng Changesets — version và CHANGELOG sửa tay. Docs cho người dùng: `#/concepts/cli`.

### Quy tắc

`packages/cli/scripts/check-release.mjs` kiểm tra tự động các quy tắc 1–4 (chạy trong CI và khi phát hành).

1. **CHANGELOG** — mỗi version có mục `## X.Y.Z` ở **đầu** `packages/cli/CHANGELOG.md`. Thay đổi của cả hai gói ghi
   chung ở đây.
2. **`create-yugen-ui` theo `yugen`** — `packages/create-yugen-ui/package.json` khai báo `"yugen": "^X.Y.0"`. Trước 1.0,
   `^0.1.0` **không** nhận `0.2.0`: khi `yugen` lên minor, sửa dependency và tăng version `create-yugen-ui` trong cùng
   commit. Bản patch của `yugen` không cần phát hành lại `create-yugen-ui`.
3. **Template theo `yugen-ui`** — template nằm trong gói CLI và ghim `yugen-ui@^<bản hiện tại>`. Sau mỗi bản minor
   của `yugen-ui`, phát hành `yugen` (patch) để `create` tạo app với bản mới.
4. **Nhánh** — bản ổn định tag trên `main` (dist-tag `latest`); prerelease `yugen@X.Y.Z-beta.N` tag trên `next`
   (dist-tag `next`, thử bằng `npx yugen@next`). `create-yugen-ui` chỉ phát hành cùng bản ổn định. Không publish lại
   một version đã có trên npm.
5. **SemVer của CLI** — `patch`: sửa lỗi, cập nhật template; `minor`: lệnh hoặc tuỳ chọn mới, đổi định dạng
   `yugen.json`. Trước 1.0 thay đổi phá vỡ (đổi tên lệnh / tuỳ chọn, đổi chỗ ghi file) cũng là `minor`, ghi rõ trong
   CHANGELOG.
6. **Registry là hợp đồng** — `yugen add` / `init` đọc `public/r` do `scripts/build-registry.mjs` sinh (tên item,
   đường dẫn `registry/yugen/{ui,lib}/…`, import `@/lib` / `@/components/ui`, item `theme`, `cn`, `yugen-provider`,
   `all`). Đổi các thứ đó thì phát hành CLI tương thích **trước** khi docs (và registry) deploy.
7. **Chỉ publish qua tag** để có provenance — không `npm publish` từ máy cá nhân.

### Các bước

```bash
git switch main && git pull
# 1. Tăng "version" trong packages/cli/package.json (+ packages/create-yugen-ui/package.json khi theo quy tắc 2)
# 2. Thêm mục "## X.Y.Z" lên đầu packages/cli/CHANGELOG.md
cd packages/cli
npm install --package-lock-only   # version trong lockfile
npm run check:release             # quy tắc 1–3
npm test
npm run smoke                     # npm pack 2 gói → cài từ .tgz → create-yugen-ui mọi template
```

Commit `chore(release): yugen X.Y.Z`, merge vào `main`, **đợi CI xanh** (job `CLI`), rồi:

```bash
git tag yugen@X.Y.Z
git push origin yugen@X.Y.Z
```

**Release CLI** chạy lại `check-release.mjs --tag` (tag khớp version, chưa có trên npm, đúng nhánh → chọn dist-tag),
typecheck, test, smoke, rồi `npm publish --provenance` cho `yugen` và `create-yugen-ui` (bỏ qua nếu version đó đã có).
`NPM_TOKEN` phải được publish **gói mới** cho lần đầu (token granular "All packages", hoặc classic Automation).

### Sau khi publish

```bash
npx yugen@latest --version
npm create yugen-ui@latest smoke-app -- --template starter
cd smoke-app && npm run build
```

Tạo GitHub Release từ tag (dán mục CHANGELOG). Hỏng sau khi publish: sửa trên `main`, phát hành bản patch; bản lỗi thì
`npm deprecate yugen@X.Y.Z "…"` (không unpublish).

### Lần đầu (0.1.0)

Mã CLI đang ở `next`. Merge `next` → `main` (cùng lúc với một bản `yugen-ui` hoặc riêng), rồi tag `yugen@0.1.0` trên
`main`. Muốn thử trước trên npm: đổi version thành `0.1.0-beta.1`, thêm mục CHANGELOG, tag `yugen@0.1.0-beta.1` trên
`next` → `npx yugen@next`.
