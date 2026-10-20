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
