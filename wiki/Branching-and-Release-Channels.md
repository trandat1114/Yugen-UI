# Branching and Release Channels · Nhánh & kênh phát hành

Mỗi nhánh dài hạn ứng với **một kênh phát hành** — người dùng chọn mức ổn định qua dist-tag npm.

| Nhánh | Mục đích | Phiên bản | npm dist-tag | Docs |
|---|---|---|---|---|
| `main` | Bản ổn định đang dùng; chỉ nhận sửa lỗi, docs, việc vặt | `0.6.1` | `latest` → `npm i yugen-ui` | `/` |
| `next` | Gom tính năng cho minor tiếp theo, thay đổi phá vỡ | `0.7.0-next.3` | `next` → `npm i yugen-ui@next` | `/next/` |
| `release/X.Y` | Vá lỗi cho minor cũ sau khi đã ra minor mới | `0.6.4` | `release-0.6` → `npm i yugen-ui@release-0.6` | `/v0.6/` (từ tag) |
| `canary` | Thử nghiệm nhanh: mỗi push phát hành một bản | `0.7.0-canary-20261021…` | `canary` → `npm i yugen-ui@canary` | — |

Nhánh ngắn hạn (xoá sau khi merge): `feat/<scope>-<mô-tả>`, `fix/…`, `docs/…`, `chore/…`, `exp/…` (thử ý tưởng, không merge thẳng).

```
feat/datagrid-grouping ──PR──▶ next ──(0.7.0-next.N)──▶ … ──PR "release 0.7.0"──▶ main ──tag v0.7.0──▶ latest
fix/tabs-focus ─────────PR──▶ main ──tag v0.6.1──▶ latest
                               main ──PR tự động "sync main → next"──▶ next   (bản sửa không bị thiếu ở 0.7)
                       tag v0.6.x ──▶ release/0.6 ──fix──▶ tag v0.6.5 ──▶ release-0.6
bất kỳ nhánh ──push / reset──▶ canary ──▶ yugen-ui@canary
```

Docs của `next` (https://trandat1114.github.io/Yugen-UI/next/) build lại sau mỗi push vào `next`, kèm tin sắp phát hành
(`upcoming`) trên trang Có gì mới: kiểm tra ở đó trước khi mở PR `next → main` ([[Release Process]] › Tin cho bản sắp
phát hành).

## PR vào nhánh nào?

| Thay đổi | Nhánh đích |
|---|---|
| Sửa lỗi (patch), docs, test, CI | `main` |
| Component / prop / token mới (minor) | `next` |
| Thay đổi phá vỡ API (đã có RFC) | `next` |
| Vá cho minor cũ | `release/X.Y` (rồi forward-port lên `main` nếu cần) |
| Thử nghiệm cần cho người khác cài thử | đẩy lên `canary` (không cần PR) |

Khi chưa có nhánh `next` (giữa hai chu kỳ), PR tính năng vào `main` như bình thường.

## Quy trình theo kênh

**Ổn định (`main` → `latest`)** — xem [[Release Process]]: `npm run version-packages` → News → tag `vX.Y.Z` trên `main`.

**Thử nghiệm có kế hoạch (`next` → `next`)**
```bash
git switch -c next main                 # đầu chu kỳ (một lần)
npx changeset pre enter next            # bật chế độ prerelease, commit .changeset/pre.json
# … merge PR tính năng vào next …
npm run version-packages                # → 0.7.0-next.0 (CHANGELOG có mục prerelease)
git tag v0.7.0-next.0 && git push origin next v0.7.0-next.0   # release.yml phát hành dist-tag next
```
Kết thúc chu kỳ: trên `next` chạy `npx changeset pre exit` → `npm run version-packages` (→ `0.7.0`) → thêm News →
PR `next → main` → merge → tag `v0.7.0` trên `main`. Trang News chỉ ghi bản ổn định; prerelease không cần mục News.

**Vá minor cũ (`release/X.Y`)**
```bash
git switch -c release/0.6 v0.6.4        # tạo từ tag cuối của minor cũ (một lần)
# … cherry-pick / sửa, thêm changeset patch …
npm run version-packages && git tag v0.6.5 && git push origin release/0.6 v0.6.5
```
`scripts/release-channel.mjs` thấy `0.6.5 < latest` nên dùng dist-tag `release-0.6`, không chiếm `latest`.

**Canary**
```bash
git push --force origin HEAD:canary     # từ nhánh bạn muốn cho người khác thử
```
Workflow `canary.yml` chạy typecheck + test + build rồi phát hành `x.y.z-canary-<thời gian>`. Không cần tag, không cần News.

## Luật an toàn (được kiểm tra tự động)

- Tag prerelease (`-next.N`, `-rc.N`) chỉ hợp lệ trên `next` hoặc `release/*`; tag ổn định chỉ trên `main` hoặc `release/*`
  — `release.yml` dừng nếu sai.
- Tag phải trùng `package.json`; `check:release` kiểm tra CHANGELOG (+ News với bản ổn định).
- Không bao giờ force-push `main`, `next`, `release/*`. Chỉ `canary` được ghi đè.

## Dọn nhánh

Nhánh ngắn hạn xoá ngay khi PR merge. GitHub tự làm việc này khi bật Settings → General → **Automatically delete head
branches**. Phần còn lại dọn bằng `scripts/prune-branches.mjs`, theo bảng sau (PR mới nhất của nhánh quyết định):

| Nhánh | Kết luận |
|---|---|
| `main`, `next`, `canary`, `gh-pages`, `release/*`, nhánh mặc định | Không bao giờ xoá |
| Có PR đang mở | Giữ |
| Commit cuối đã nằm trong `main` hoặc `next` | Xoá |
| PR đã merge đúng commit cuối (squash nên commit không nằm trong `main`) | Xoá |
| Có commit sau khi PR merge | Cần xem |
| PR đóng không merge từ 14 ngày trở lên | Xoá (đầu PR vẫn còn ở `refs/pull/<số>/head`) |
| Không có PR, 30 ngày không có commit (`exp/`: 60 ngày) | Cần xem |
| Còn lại | Giữ |

```bash
node scripts/prune-branches.mjs                                # báo cáo, không xoá gì
node scripts/prune-branches.mjs --apply                        # xoá mục "Xoá"
node scripts/prune-branches.mjs --apply --include-abandoned    # xoá thêm mục "Cần xem"
node scripts/prune-branches.mjs --local --apply                # thêm nhánh local đã merge, git worktree prune
```

- Cần `gh` đã đăng nhập. Mỗi nhánh bị xoá được in kèm SHA; khôi phục bằng `git push origin <sha>:refs/heads/<nhánh>`.
- Mục "Cần xem" không bao giờ tự xoá. Xem `git log origin/next..origin/<nhánh>` trước: còn việc dở thì mở draft PR,
  hết dùng thì xoá với `--include-abandoned`.
- Workflow **Prune branches** chạy ngày 1 hằng tháng và chỉ ghi báo cáo vào job summary. Chạy tay (Run workflow, tick
  `apply`) để xoá mục "Xoá".
- Worktree: gỡ worktree (`git worktree remove`) trước khi xoá nhánh của nó. Worktree có `node_modules` là junction trỏ về
  repo chính thì xoá junction trước (PowerShell: `(Get-Item <worktree>
ode_modules).Delete()`), rồi mới gỡ worktree.

## Bảo vệ nhánh (Settings → Branches → Add rule)

| Pattern | Luật |
|---|---|
| `main` | PR bắt buộc, 1 approve, 5 job CI xanh, giải quyết hết thread, cấm force-push / xoá |
| `next` | PR bắt buộc, CI xanh, cấm force-push / xoá |
| `release/*` | PR bắt buộc, CI xanh, cấm xoá |
| `canary` | Không bảo vệ (maintainer được force-push) |

Tag `v*`: Settings → Rules → Rulesets → Tag ruleset, chỉ maintainer được tạo / xoá tag `v*`.
