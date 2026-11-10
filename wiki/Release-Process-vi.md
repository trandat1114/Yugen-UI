# Release Process · Phát hành

*English: [Release-Process](Release-Process).*

Trang này mô tả kênh ổn định (`main` → `latest`). Bản thử nghiệm `next`, `canary` và vá minor cũ `release/X.Y`: [Branching and Release Channels](Branching-and-Release-Channels-vi).

Phiên bản theo [SemVer](https://trandat1114.github.io/Yugen-UI/concepts/versioning). Trước 1.0, bản minor có thể
có thay đổi phá vỡ — luôn ghi rõ.

## Quy tắc cho từng số

Áp dụng cho các bản phát hành sau 0.12.0 (`RULES_SINCE` trong `scripts/release-rules.mjs`), cho `yugen-ui` và
`@yugen-ui/cli`. Mục tiêu: phần lớn thay đổi ra ở bản patch, số minor và major không tăng vì những thay đổi nhỏ.

| Số | Tăng khi | Không tăng cho | Nhịp |
| --- | --- | --- | --- |
| PATCH `x.y.Z` | Sửa lỗi (kể cả lỗi do bản trước), a11y, hiệu năng, kiểu TS sai, tinh chỉnh giao diện nhỏ | API mới, thay đổi phá vỡ | Không giới hạn; gom các sửa lỗi gần nhau |
| MINOR `x.Y.0` | Ít nhất một API mới (component, prop, giá trị prop, token, export, template); deprecate; trước 1.0 cả thay đổi phá vỡ | Chỉ sửa lỗi / tinh chỉnh | Mỗi milestone một bản, cách minor trước ≥ 14 ngày |
| MAJOR `X.0.0` | Thay đổi phá vỡ, từ 1.0; xoá cùng lúc mọi API đã deprecate, kèm hướng dẫn chuyển đổi | Tính năng không phá vỡ | Cách major trước ≥ 180 ngày |

- Không nhảy số: sau `0.12.0` là `0.12.1` hoặc `0.13.0`.
- Chỉ đổi docs site, test, CI thì không phát hành; workflow **Docs** deploy riêng.
- `main` và `release/X.Y` chỉ ra bản patch (hotfix). Tính năng vào `next`, phát hành khi đóng milestone.
- Prerelease (`-next.N`, `cli@X.Y.Z-beta.N`, canary) không tính.
- `create-yugen-ui` không theo nhịp riêng: lên minor cùng `@yugen-ui/cli` (quy tắc 2 của CLI).

Kiểm tra tự động:

- `npm run check:changesets` (CI): `major` trước 1.0; `major` thiếu "**Breaking:**"; "**Breaking:**" ở `patch`; tóm tắt
  mở đầu bằng "Fix" ở `minor`, "New" ở `patch`; PR vào `main` / `release/*` (trừ `next → main`) có `minor` / `major`.
- `check:release` (gốc repo và CLI) đọc loại (`## Mới`, `## Sửa lỗi`…) của các tin trong `src/docs/news` — bản hiện tại và tin
  `upcoming` trên next: bản patch không có `new` / `breaking`; bản minor có ít nhất một `new` (trước 1.0: hoặc
  `breaking`); từ 1.0, `breaking` chỉ ở bản major; major có ít nhất một `breaking`; không nhảy số; nhịp minor / major
  tính theo `date` của tin.

Muốn phát hành minor sớm hơn 14 ngày: không có cách vượt qua trong script. Tính năng chờ milestone; sửa lỗi phát hành
bằng bản patch.

## Trong mỗi PR

`npx changeset` → chọn `patch` (sửa lỗi) / `minor` (tính năng, deprecate) / `major` (từ 1.0, xoá API) → viết một câu cho
người dùng (tiếng Anh, như CHANGELOG). File nằm ở `.changeset/*.md`.

PR vào `next` có thay đổi người dùng thấy được còn thêm một dòng vào **tin sắp phát hành** (mục dưới).

## Tin trên trang Có gì mới

Mỗi bản phát hành là hai file Markdown, tiếng Việt và tiếng Anh, trong `src/docs/news/<gói>/` (`yugen-ui`, `cli`,
`create-yugen-ui`): `0.14.0.vi.md` và `0.14.0.en.md`. Số version lấy từ tên file.

```md
---
date: 2026-11-11
upcoming: true
---

# AppShell, Sortable và trang Người đóng góp

Một đoạn tóm tắt.

## Mới

- AppShell và Sidebar: … `layout="header"` cho thanh trên cùng trải ngang. [→](/components/appshell)

## Sửa lỗi

- …
```

- Loại thay đổi là heading `##`: `Mới`, `Cải tiến`, `Sửa lỗi`, `Thay đổi lớn` (bản en: `New`, `Improved`, `Fixed`,
  `Breaking`). Mỗi mục một dòng `- …`; `[→](/đường-dẫn)` ở cuối là nút "Xem" tới trang docs.
- Trong mục dùng được Markdown inline: `` `code` `` cho prop, hàm, file, lệnh; tên component để chữ thường.
- Bản vi và en phải khớp: cùng `date`, `upcoming`, số mục, loại và link theo cùng thứ tự. `node scripts/check-news.mjs`
  kiểm tra (vài giây, không cần `npm ci`); build docs báo cùng lỗi kèm file và dòng.
- PR chỉ sửa `src/docs/news/**` không chạy CI đầy đủ, chỉ chạy workflow `News`. Sau khi merge, Pages build lại docs.

## Tin cho bản sắp phát hành (next)

Tin của bản kế tiếp được viết dần trên `next`, không đợi tới lúc phát hành.

- File của bản mới nhất trong thư mục của gói mang `upcoming: true` trong frontmatter, ở cả bản vi và en. Tên file là số
  mà bản kế tiếp sẽ có (`npx changeset status`; với CLI theo quy tắc SemVer của CLI), `date` là ngày dự kiến (hạn của
  milestone).
- Mỗi PR vào `next` có thay đổi người dùng thấy được thêm một mục vào cả hai file, tạo file nếu chưa có. Changeset vẫn
  bắt buộc như cũ; tin là phần dành cho người đọc docs.
- Trang Có gì mới hiện mục này với nhãn **Sắp phát hành** và ngày "Dự kiến …". Xem trước ở `/next/`
  (https://trandat1114.github.io/Yugen-UI/next/): docs build lại từ `next` sau mỗi push.
- Chỉ bản mới nhất được là `upcoming`. `check-release` chấp nhận khi version của nó lớn hơn `package.json`, và báo lỗi khi
  `package.json` đã bằng version đó mà tin vẫn `upcoming` (quên chốt), hoặc khi có tag.
- Tin `upcoming` tới `main` qua PR `next → main` và được **chốt trong commit `chore(release)`**: bỏ `upcoming`, điền
  ngày phát hành ở cả hai file, rà lại nội dung theo CHANGELOG.

## Khi phát hành (maintainer)

```bash
git pull
npm run version-packages      # changeset version → bump package.json, ghi CHANGELOG, đồng bộ templates, lockfile
```

1. Tin trong `src/docs/news/yugen-ui`: nếu đã có tin `upcoming` (viết trên next) thì bỏ `upcoming`, điền ngày phát hành
   ở cả `.vi.md` và `.en.md` và rà lại nội dung; nếu chưa có thì thêm hai file cho version mới (mục
   [Tin trên trang Có gì mới](#tin-trên-trang-có-gì-mới)).
2. Thêm link `[x.y.z]: …/releases/tag/vx.y.z` cuối CHANGELOG.
   Cập nhật `src/docs/roadmap.ts`: mục của milestone vừa xong thành `done`, chuyển milestone sang Đã phát hành (bỏ khỏi
   `now`, dời `next` lên) rồi `npm run roadmap` (ghi ROADMAP.md; `roadmap.test.ts` báo lỗi nếu lệch).
3. `npm run check:release && npm test && npm run build`
4. Commit `chore(release): vx.y.z`, push, **đợi CI xanh**.
5. Tag và đẩy tag:

```bash
git tag vx.y.z
git push origin vx.y.z
```

Workflow **Release** kiểm tra tag khớp `package.json` và nằm đúng nhánh, chạy test, build và đóng gói. Sau đó job publish
**chờ bạn duyệt** (environment `npm-release`, xem [Các job phát hành và bước duyệt](#các-job-phát-hành-và-bước-duyệt)):
mở lần chạy › **Review deployments** › duyệt. Job này chạy `npm publish --provenance` với file `.tgz` đã đóng gói, qua npm
trusted publishing (không cần token). Dist-tag do `scripts/release-channel.mjs` chọn: `latest`, `next` (prerelease) hoặc `release-X.Y`.

Sau khi publish, workflow tự tạo GitHub Release cho tag từ mục CHANGELOG của bản đó (`scripts/release-notes.mjs`; bản
`latest` được đánh dấu Latest, prerelease đánh dấu Pre-release). Workflow **Docs** build lại site (kèm docs các minor cũ ở
`/vX.Y/`). Maintainer đăng tóm tắt ở Discussions **Announcements**.

## Bản major (1.0.0, 2.0.0…)

README là trang đầu trên GitHub và npm, nên bản major phải rà lại trước khi phát hành. Thêm vào commit
`chore(release)`, sau bước 2 ở trên:

- **Cài đặt và yêu cầu:** lệnh cài, peer dependency (React, Tailwind CSS), Node.js tối thiểu đúng với bản mới.
- **Ví dụ:** code trong README chạy được với API mới, không còn API đã xoá hay deprecated.
- **Tính năng:** danh sách tính năng, số component, theme và brand khớp docs.
- **Link:** docs, hướng dẫn chuyển đổi từ bản major trước, CHANGELOG, npm.
- Sửa nếu cần, rồi ghi `<!-- readme-reviewed: X.0.0 -->` ở đầu `README.md`, kể cả khi không phải sửa gì.
  `check:release` chặn PR release của bản major nếu thiếu dấu này hoặc dấu còn là bản major trước. Minor, patch và
  prerelease (`-rc.N`) không cần.

Bản major của CLI làm tương tự với `packages/cli/README.md` (lệnh, tuỳ chọn, yêu cầu Node.js, ví dụ); `check-release`
của CLI kiểm cùng dấu.

## Sửa nhanh sau phát hành (hotfix)

Sửa trên `main` → changeset `patch` → lặp lại quy trình (vd. `0.6.1`). Không publish lại cùng số phiên bản — npm không cho phép.
Hotfix chỉ là bản patch: `check:changesets` chặn changeset `minor` / `major` trong PR vào `main`.

## CLI: `@yugen-ui/cli` và `create-yugen-ui`

Hai gói trong `packages/` (`packages/cli` → npm `@yugen-ui/cli`, lệnh sau khi cài là `yugen`;
`packages/create-yugen-ui` → npm `create-yugen-ui`), phát hành **riêng** với `yugen-ui`: tag `cli@X.Y.Z`, workflow
**Release CLI** (`.github/workflows/release-cli.yml`). Không dùng Changesets — version và CHANGELOG sửa tay. Docs cho
người dùng: `#/concepts/cli`.

Tên `yugen` (không scope) không dùng được: npm trả 403 *"Package name too similar to existing package hygen"*. Gói có
scope không bị kiểm tra này; scope `@yugen-ui` là một npm org (miễn phí).

### Quy tắc

`packages/cli/scripts/check-release.mjs` kiểm tra tự động các quy tắc 1–4 (chạy trong CI và khi phát hành).

1. **CHANGELOG và Có gì mới** — mỗi version có mục `## X.Y.Z` ở **đầu** `packages/cli/CHANGELOG.md` (thay đổi của
   cả hai gói ghi chung ở đây), và tin trong `src/docs/news/cli` (tab `@yugen-ui/cli` trên
   `/news`). Khi `create-yugen-ui` đổi version, thêm cả tin trong `src/docs/news/create-yugen-ui`. Viết cả tiếng Việt và
   tiếng Anh, link tới `/concepts/cli`. Bản prerelease của CLI không cần mục tin. Trong lúc phát triển, PR đổi `packages/cli` ghi
   một dòng vào mục `## Unreleased` của CHANGELOG; khi phát hành, đổi `Unreleased` thành số version.
2. **`create-yugen-ui` theo CLI** — `packages/create-yugen-ui/package.json` khai báo `"@yugen-ui/cli": "^X.Y.0"`. Trước
   1.0, `^0.1.0` **không** nhận `0.2.0`: khi CLI lên minor, sửa dependency và tăng version `create-yugen-ui` trong cùng
   commit. Bản patch của CLI không cần phát hành lại `create-yugen-ui`.
3. **Template theo `yugen-ui`** — template nằm trong gói CLI và ghim `yugen-ui@^<bản hiện tại>`. Sau mỗi bản minor
   của `yugen-ui`, phát hành CLI (patch) để `create` tạo app với bản mới.
   CLI chỉ được publish sau khi `yugen-ui` bản đó đã lên npm: `check-release --tag` chặn nếu chưa có. Trước đó, job
   `Template · …` của CI build template với gói `npm pack` của chính commit, nên PR release không cần bản đã publish.
4. **Không dùng lại version** — kể cả bản đã unpublish: npm chặn vĩnh viễn, và `npm view` không thấy bản đã unpublish.
   Kiểm tra bằng `npm run check:release -- --npm`. Bản lỗi thì `npm deprecate`, không unpublish.
5. **Nhánh** — bản ổn định tag trên `main` (dist-tag `latest`); prerelease `cli@X.Y.Z-beta.N` tag trên `next`
   (dist-tag `next`, thử bằng `npx @yugen-ui/cli@next`). `create-yugen-ui` chỉ phát hành cùng bản ổn định.
6. **SemVer của CLI** — `patch`: sửa lỗi, cập nhật template; `minor`: lệnh hoặc tuỳ chọn mới, đổi định dạng
   `yugen.json`, template mới. Trước 1.0 thay đổi phá vỡ (đổi tên lệnh / tuỳ chọn, đổi chỗ ghi file) cũng là `minor`,
   ghi rõ trong CHANGELOG. Nhịp và tin theo [quy tắc cho từng số](#quy-tắc-cho-từng-số) (`src/docs/news/cli`).
7. **Registry là hợp đồng** — `yugen add` / `init` đọc `public/r` do `scripts/build-registry.mjs` sinh (tên item,
   đường dẫn `registry/yugen/{ui,lib}/…`, import `@/lib` / `@/components/ui`, item `theme`, `cn`, `yugen-provider`,
   `all`). Đổi các thứ đó thì phát hành CLI tương thích **trước** khi docs (và registry) deploy.
8. **Chỉ publish qua tag** để có provenance — không `npm publish` từ máy cá nhân.

### Các bước

```bash
git switch main && git pull
# 1. Tăng "version" trong packages/cli/package.json (+ packages/create-yugen-ui/package.json khi theo quy tắc 2)
# 2. Đổi "## Unreleased" thành "## X.Y.Z" ở đầu packages/cli/CHANGELOG.md
# 3. Chốt tin upcoming trong src/docs/news/cli (và news/create-yugen-ui nếu create-yugen-ui đổi version):
#    bỏ upcoming, điền ngày phát hành ở cả .vi.md và .en.md; chưa có thì thêm hai file cho version mới
# 4. Cập nhật milestone cli X.Y.Z trong src/docs/roadmap.ts rồi npm run roadmap (ở thư mục gốc repo)
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

**Release CLI** chạy `check-release.mjs --tag` (tag khớp version, đúng nhánh, version chưa bị unpublish, `yugen-ui` mà template ghim đã có trên npm → chọn dist-tag),
typecheck, test, smoke và đóng gói cả hai gói. Sau khi bạn duyệt (environment `npm-release`, như **Release**) nó chạy
`npm publish --provenance` cho `@yugen-ui/cli`, rồi `create-yugen-ui`. Mỗi gói bỏ qua nếu version đó đã có trên npm, nên
một bước publish lỗi (token, tên gói) thì sửa xong chỉ cần **Re-run** các job lỗi.

### Sau khi publish

```bash
npx @yugen-ui/cli@latest --version
npx create-yugen-ui@latest smoke-app --template starter
cd smoke-app && npm run build
```

Docs deploy từ `main` đưa mục tin lên `#/news` (tab `@yugen-ui/cli` / `create-yugen-ui`) và bật chấm "có tin mới" trên
thanh trên cho người đã xem bản trước. **Release CLI** tự tạo GitHub Release cho tag từ mục của `packages/cli/CHANGELOG.md`
(không đánh dấu Latest, để trang repo vẫn chỉ bản `yugen-ui`). Hỏng sau khi publish: sửa trên `main`, phát hành bản patch; bản lỗi thì
`npm deprecate @yugen-ui/cli@X.Y.Z "…"` (không unpublish).

### Trusted publishing (OIDC, #202)

Từ 0.14.0 và CLI 0.6.0 mọi lần publish đều qua OIDC; repository không giữ npm token. Hai workflow phát hành dùng
npm ≥ 11.5.1 và chỉ cấp `permissions: id-token: write` cho job publish. Trên npmjs.com, mỗi gói › **Settings** ›
**Trusted Publisher** › GitHub Actions:

- repository `trandat1114/Yugen-UI`, workflow `release.yml` cho `yugen-ui` (bản ổn định, prerelease và canary);
  `release-cli.yml` cho `@yugen-ui/cli` và `create-yugen-ui`. Không cần environment.
- Chọn **Allow npm publish**. Thiếu nó, bước publish lỗi `E403 … OIDC permission denied for this action`.
- Bỏ chọn **Allow npm dist-tag**: dist-tag do `npm publish --tag` đặt.

npm chỉ nhận một workflow trusted publisher cho mỗi gói, nên các job canary nằm trong `release.yml`. Gói mới cần một lần
`npm publish` bằng tay trước khi khai báo được trusted publisher. Trusted publisher gắn với tên file workflow: không đổi tên
`release.yml` hay `release-cli.yml`.

### Các job phát hành và bước duyệt

Job nào xin được token OIDC của npm thì publish được một bản có provenance hợp lệ. Vì vậy job giữ token không chạy mã nào
của repository hay dependency (#379):

| Job | Quyền | Chạy |
| --- | --- | --- |
| `build` (`canary-build`) | `contents: read` | `npm ci`, kiểm tra phát hành, test, build, `npm pack`. Tải các file `.tgz` và `SHA256SUMS` lên làm artifact. |
| `publish` (`canary-publish`) | `id-token: write` | Chỉ `setup-node`, kèm bước kiểm tra npm đi kèm ≥ 11.5.1 (không `npm install -g npm`: tải không ghim hash). Tải artifact, so `SHA256SUMS` với mã băm job `build` báo, rồi `npm publish <file>.tgz --provenance --ignore-scripts`. Không checkout, không `npm ci`, không script của repo. |
| `github-release` | `contents: write` | Checkout và `scripts/release-notes.mjs` → GitHub Release. Sau đó `scripts/release-provenance.mjs` đính kèm tarball và SLSA provenance của nó (`<file>.tgz.intoto.jsonl`, Sigstore bundle npm ghi lúc publish), sau khi đối chiếu cả hai với sha512 của tarball từ `build`. Không có `id-token`. |

`release-cli.yml` có đúng ba job đó; job publish của nó publish `@yugen-ui/cli` trước, rồi `create-yugen-ui`.

Job `publish` của `release.yml` và `release-cli.yml` dùng GitHub environment **`npm-release`** (repository **Settings** ›
**Environments**): người duyệt bắt buộc `trandat1114`, chỉ deploy từ tag `v*` và `cli@*`. Sau khi đẩy tag, lần chạy dừng
trước `publish` cho tới khi bạn mở nó và chọn **Review deployments** › **Approve and deploy**. Từ chối thì dừng phát hành:
không publish gì, không tạo GitHub Release. Muốn thử lại sau thì chạy lại workflow. Các job canary không dùng environment,
nên mỗi push lên `canary` vẫn phát hành mà không cần duyệt.

Ô **Environment** của trusted publisher trên npm để trống: `yugen-ui` có một trusted publisher chung cho canary và bản ổn
định, ghi `npm-release` ở đó sẽ chặn mọi bản canary.

### Lần đầu (`cli@0.1.0`)

1. Trên npmjs.com: **Add Organization** → tên `yugen-ui` (gói public, miễn phí).
2. Publish bản đầu tiên bằng tay (`npm publish --access public` kèm 2FA), rồi khai báo `release-cli.yml` làm trusted
   publisher (xem trên).
3. Tag `cli@0.1.0` trên `main` như trên.
