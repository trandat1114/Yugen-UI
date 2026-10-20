# Community and Triage · Cộng đồng & phân loại

## Hỏi ở đâu?

| Bạn có… | Đi tới |
|---|---|
| Câu hỏi cách dùng | [Discussions › Q&A](https://github.com/trandat1114/Yugen-UI/discussions/categories/q-a) — đánh dấu câu trả lời đúng |
| Ý tưởng còn sơ khai | [Discussions › Ideas](https://github.com/trandat1114/Yugen-UI/discussions/categories/ideas) — upvote để ưu tiên |
| Sản phẩm muốn khoe | [Discussions › Show and tell](https://github.com/trandat1114/Yugen-UI/discussions/categories/show-and-tell) |
| Lỗi tái hiện được | [Issue › Bug report](https://github.com/trandat1114/Yugen-UI/issues/new/choose) |
| Vấn đề bàn phím / trình đọc màn hình | Issue › Accessibility |
| Ví dụ sai, props thiếu, bản dịch | Issue › Documentation |
| Lỗ hổng bảo mật | [Báo riêng tư](https://github.com/trandat1114/Yugen-UI/security/advisories/new) — không mở issue |

**Announcements** chỉ maintainer đăng (phát hành, thay đổi lớn). **Polls** dùng để hỏi ý kiến cộng đồng khi chọn API.

## Quy tắc Discussions

1. **Tìm trước khi hỏi** — docs, [[FAQ]] và Discussions cũ; câu hỏi trùng sẽ được đánh dấu *Duplicate* và khoá.
2. **Mỗi thread một chủ đề**, tiêu đề nói rõ vấn đề ("DataGrid không cuộn trong Sheet trên iOS", không phải "Giúp với!!").
3. **Đưa đủ ngữ cảnh**: phiên bản `yugen-ui`, React, framework, đoạn code tối thiểu (khối code `tsx`) — tốt nhất là link StackBlitz.
4. **Đánh dấu câu trả lời** (*Mark as answer*) khi đã được giải quyết; quay lại chia sẻ cách bạn làm nếu tự tìm ra.
5. **Không "up bài"** bằng bình luận "+1" — dùng 👍 (reaction) để ưu tiên; bình luận chỉ khi có thông tin mới.
6. **Tiếng Việt hoặc tiếng Anh** đều được; trả lời bằng ngôn ngữ người hỏi dùng khi có thể.
7. **Không đăng thông tin riêng tư** (token, mật khẩu, dữ liệu khách hàng) và **không báo lỗ hổng bảo mật** ở Discussions.
8. **Ideas / RFC** theo mẫu [RFC trong GOVERNANCE.md](https://github.com/trandat1114/Yugen-UI/blob/main/GOVERNANCE.md#3-quy-trình-rfc);
   maintainer ghi kết luận *Accepted / Declined / Needs work* trong thread.
9. **Announcements** chỉ maintainer đăng; bình luận ở đó nên ngắn và đúng chủ đề.
10. Câu hỏi được hỏi nhiều lần → maintainer bổ sung vào [[FAQ]] hoặc docs rồi khoá thread bằng link.

Vi phạm xử lý theo mục *Kiểm duyệt* trong [[Operations Handbook]].

## Nhãn

Nguồn: [`.github/labels.yml`](https://github.com/trandat1114/Yugen-UI/blob/main/.github/labels.yml) — workflow **Labels** tự đồng bộ.

- **Loại**: `bug`, `enhancement`, `documentation`, `accessibility`, `performance`, `question`
- **Khu vực**: `area: components`, `area: labs`, `area: tokens & theming`, `area: docs site`, `area: build & package`, `area: ci & tests`
- **Trạng thái**: `needs triage` → `needs reproduction` / `confirmed` → `in progress` (· `blocked`) ; `breaking change`
- **Cộng đồng**: `good first issue`, `help wanted`

## Quy trình phân loại (maintainer, mỗi tuần)

1. Lọc `label:"needs triage"`.
2. Câu hỏi → chuyển sang Discussions (**Convert to discussion**). Trùng → `duplicate` + link, đóng.
3. Lỗi chưa tái hiện được → `needs reproduction`, xin StackBlitz (nút StackBlitz trên mọi ví dụ docs). Không phản hồi 14 ngày → đóng.
4. Hợp lệ → bỏ `needs triage`, thêm `confirmed` + nhãn khu vực; việc nhỏ, rõ ràng → `good first issue` kèm gợi ý file cần sửa.
5. Ý tưởng ở Discussions được nhiều upvote và đủ rõ → tạo issue `enhancement`, link ngược lại.

## Good first issue tốt trông thế nào

- Phạm vi 1–2 file, có link tới file / dòng cần sửa.
- Tiêu chí hoàn thành rõ ràng ("`npm run check:props` hết cảnh báo cho Wizard").
- Ví dụ hay: dịch một trang khái niệm sang tiếng Anh, document prop còn thiếu (danh sách trong `npm run check:props`),
  thêm test bàn phím cho một component.

## Showcase

Bài ở **Show and tell** có tick đồng ý sẽ được đưa lên mục Showcase của
[trang Cộng đồng](https://trandat1114.github.io/Yugen-UI/#/community).
