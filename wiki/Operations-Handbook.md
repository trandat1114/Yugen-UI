# Operations Handbook · Sổ tay vận hành

Cách dự án được vận hành hằng ngày: ai làm gì, khi nào, theo luật nào. Vai trò và quyền quyết định: [`GOVERNANCE.md`](https://github.com/trandat1114/Yugen-UI/blob/main/GOVERNANCE.md).

## 1. Cam kết thời gian phản hồi (mục tiêu, không phải hợp đồng)

| Việc | Phản hồi đầu tiên | Ghi chú |
|---|---|---|
| Báo lỗ hổng bảo mật | 3 ngày | Bản vá ưu tiên cao nhất, phát hành patch ngay khi sẵn sàng |
| Bug chặn sử dụng (crash, build hỏng, a11y nghiêm trọng) | 3 ngày | Gắn `confirmed` + mức ưu tiên trong bình luận |
| Bug thường, issue a11y khác | 7 ngày | |
| PR | 7 ngày review đầu tiên | Không có phản hồi? nhắc lịch sự trong PR sau 7 ngày |
| Discussions Q&A | 7 ngày | Cộng đồng trả lời trước càng tốt |
| Feature request / Ideas | 14 ngày | Có thể trả lời "để sau 1.0" |

## 2. Lịch vận hành

| Tần suất | Việc | Người làm |
|---|---|---|
| Hằng tuần | Phân loại `needs triage` ([[Community and Triage]]), trả lời Q&A tồn đọng, review PR | Triager / maintainer |
| Hằng tuần | Xem CI trên `main` (phải luôn xanh). Thứ Hai: merge PR Dependabot minor + patch vào `next` nếu xanh; PR major đỏ thì đóng, thêm `ignore` và ghi vào issue migration (#91) | Maintainer |
| 2–4 tuần | Phát hành nếu có changeset ([[Release Process]]) | Maintainer |
| Khi `packages/cli/CHANGELOG.md` có mục `Unreleased` | Phát hành CLI kèm mục tin trên `#/news` ([[Release Process]] › CLI) | Maintainer |
| Hằng tháng | Cập nhật ROADMAP, gắn `good first issue` mới, chọn Showcase | Maintainer |
| Hằng quý | Rà dependency lớn (React, Radix, Tailwind), ngân sách dung lượng, audit a11y thủ công với NVDA / VoiceOver | Maintainer |

## 3. Luật review & merge

1. Mọi thay đổi vào `main` qua PR; CI **phải xanh** (build, unit, React 18, e2e).
2. Ít nhất **1 approve** của maintainer (người viết PR không tự approve, trừ khi chỉ có một maintainer — khi đó tự merge
   sau khi CI xanh và đã tự review lại diff ngày hôm sau).
3. Thay đổi người dùng thấy → có changeset. Thay đổi phá vỡ → RFC đã chấp nhận + mục "Thay đổi lớn" + hướng dẫn chuyển đổi.
4. Merge kiểu **Squash and merge**, tiêu đề theo Conventional Commits (`feat(datagrid): …`).
5. Không merge khi còn thread chưa giải quyết, hoặc khi axe / visual đỏ mà chưa giải thích.
6. Review theo thứ tự: đúng hành vi & a11y → API (tên prop, mặc định) → tuân thủ Design.md → test → phong cách code.

## 4. Cấu hình GitHub khuyến nghị (làm một lần)

Bảo vệ cho `next`, `release/*`, `canary` và tag `v*`: xem [[Branching and Release Channels]].

**Settings → Branches → Branch protection cho `main`:**
- Require a pull request before merging · Require approvals: 1 · Dismiss stale approvals
- Require status checks: `Build · Node 22`, `Build · Node 24`, `Build · Node 26`, `Unit tests (React 19)`, `React 18`, `E2E (Playwright + axe)`
- Require conversation resolution · Block force pushes · Do not allow deletions

**Settings → General:** Allow squash merging (mặc định) · Automatically delete head branches · Discussions: bật.

**Settings → Code security:** Dependabot alerts + security updates · Private vulnerability reporting · Secret scanning.

**Discussions → Categories:** Announcements (chỉ maintainer đăng), General, Ideas (dùng cho RFC), Q&A (có đánh dấu trả lời), Polls, Show and tell.

## 5. Tự động hoá đang chạy

| Workflow / file | Làm gì |
|---|---|
| `ci.yml` | Build, test (React 19), React 18, e2e, các check, size |
| `release.yml` | Tag `v*` → kiểm tra nhánh + nhất quán → `npm publish --provenance` (dist-tag theo kênh) |
| `release-cli.yml` | Tag `cli@*` → `check-release.mjs --tag` (CHANGELOG, mục tin trên `#/news`, version chưa dùng) → publish `@yugen-ui/cli` + `create-yugen-ui` |
| `canary.yml` | Push vào `canary` → bản `x.y.z-canary-…` với dist-tag `canary` |
| `sync-next.yml` | Push vào `main` → mở PR `main → next` nếu `next` thiếu commit |
| `node-versions.yml` | Hằng tuần → so bản Node.js trong workflow với lịch phát hành (`scripts/node-versions.mjs`), mở PR vào `next` khi lệch rồi chạy CI trên nhánh đó |
| `react-share.yml` | Ngày 1 hằng tháng → tỉ lệ tải React theo major (`scripts/react-share.mjs`) bình luận vào #62; React 18 dưới 10% là một trong hai điều kiện để ngừng hỗ trợ |
| `engines.yml` | Hằng tuần, PR vào `main` và PR đổi `e2e/` → E2E trên Firefox và WebKit; bản chạy theo lịch hỏng thì mở / cập nhật issue, xanh lại thì đóng |
| `pages.yml` | Deploy docs (+ docs các minor cũ) lên GitHub Pages |
| `wiki.yml` | Đẩy `wiki/` lên GitHub Wiki |
| `labels.yml` | Đồng bộ nhãn từ `.github/labels.yml` |
| `pr-labeler.yml` | Tự gắn nhãn `area: …` cho PR theo đường dẫn file (`.github/labeler.yml`) |
| `stale.yml` | Issue `needs reproduction` im lặng 14 ngày → nhắc, thêm 7 ngày → đóng |
| `welcome.yml` | Chào người mở issue / PR lần đầu, chỉ đường tới CONTRIBUTING |
| `visual.yml` | Chạy tay: so ảnh / tạo ảnh chuẩn Linux |
| `CODEOWNERS` | Tự yêu cầu review của maintainer |

## 6. Xử lý sự cố

| Sự cố | Làm ngay |
|---|---|
| Bản phát hành hỏng (lỗi build / runtime nghiêm trọng) | `npm deprecate yugen-ui@x.y.z "Lỗi …, dùng x.y.z+1"` → sửa → phát hành patch. **Không** `npm unpublish` (phá dự án người khác) |
| Lộ secret (`NPM_TOKEN`…) | Thu hồi token trên npmjs.com ngay, tạo token mới, cập nhật secret, kiểm tra các bản publish gần đây |
| Lỗ hổng bảo mật được báo | Xác nhận trong Security Advisory riêng, tạo bản vá trong fork riêng tư, phát hành, công bố advisory + CVE nếu cần |
| `main` đỏ | Ưu tiên sửa trước mọi PR khác; revert commit gây lỗi nếu không sửa được trong 1 ngày |
| Docs site hỏng | Chạy lại workflow Docs với commit tốt gần nhất (`workflow_dispatch`) |

## 7. Kiểm duyệt cộng đồng

Áp dụng [Quy tắc ứng xử](https://github.com/trandat1114/Yugen-UI/blob/main/CODE_OF_CONDUCT.md) cho issue, PR, Discussions.

| Mức | Khi nào | Hành động |
|---|---|---|
| Nhắc nhở | Lạc đề, thiếu lịch sự nhẹ | Bình luận nhắc, chỉnh sửa / ẩn bình luận (*Hide → Off-topic*) |
| Cảnh cáo | Lặp lại hoặc xúc phạm | Cảnh cáo công khai hoặc riêng, khoá thread tạm thời (*Lock conversation*) |
| Chặn tạm thời | Vi phạm nghiêm trọng | *Block user* 30 ngày từ tổ chức / repo |
| Chặn vĩnh viễn | Quấy rối, đe doạ, spam có chủ đích | Block vĩnh viễn, xoá nội dung, báo GitHub nếu cần |

Spam (quảng cáo, link độc) → xoá ngay, không cần cảnh báo. Mọi quyết định kiểm duyệt ghi lại ngắn gọn cho các maintainer.

## 8. Chỉ số theo dõi

Số issue mở theo nhãn, thời gian phản hồi đầu tiên, PR chờ review > 7 ngày, tỉ lệ Q&A có câu trả lời, lượt tải npm/tuần,
ngân sách dung lượng — xem nhanh ở tab **Insights** của repo và trang npm.
