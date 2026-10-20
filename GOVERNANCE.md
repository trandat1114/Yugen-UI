# Quản trị dự án · Governance

> **English summary** — Yugen UI is maintained by its creator, [trandat1114](https://github.com/trandat1114) (BDFL
> model while the project is small). Small changes go through normal PR review; large or breaking changes need an
> approved RFC in Discussions › Ideas. Contributors can become triagers and maintainers through sustained, quality
> contributions. Everyone follows the [Code of Conduct](./CODE_OF_CONDUCT.md).

## 1. Vai trò

| Vai trò | Ai | Quyền & trách nhiệm |
|---|---|---|
| **Người dùng** | Mọi người | Hỏi ở Discussions, báo lỗi, upvote ý tưởng |
| **Contributor** | Ai có PR được merge | Gửi PR theo [CONTRIBUTING.md](./CONTRIBUTING.md), review PR của người khác (không bắt buộc) |
| **Triager** | Được maintainer mời | Gắn nhãn, đóng issue trùng / không hợp lệ, chuyển câu hỏi sang Discussions, kiểm duyệt Discussions |
| **Maintainer** | [trandat1114](https://github.com/trandat1114) (+ người được mời) | Review & merge, phát hành, quyết định lộ trình, quản lý bảo mật và quyền truy cập |
| **Lead maintainer** | [trandat1114](https://github.com/trandat1114) | Quyết định cuối cùng khi không đạt đồng thuận; sở hữu npm package, domain, secrets |

**Trở thành triager**: ≥ 3 PR có giá trị được merge hoặc tham gia trả lời Discussions đều đặn trong 2 tháng, tôn trọng
Quy tắc ứng xử. **Trở thành maintainer**: là triager ≥ 3 tháng, hiểu Design.md, đã review PR của người khác — maintainer
hiện tại đề cử và đồng ý. Không hoạt động 6 tháng → chuyển sang *emeritus* (giữ ghi công, bỏ quyền ghi).

## 2. Ra quyết định

| Loại thay đổi | Cách quyết | Ví dụ |
|---|---|---|
| Sửa lỗi, docs, test, refactor nội bộ | 1 maintainer approve PR | sửa focus ring, dịch một trang |
| Prop / biến thể / token mới, component nhỏ | Issue `confirmed` → PR, 1 maintainer approve | thêm `size="large"` cho TimePicker |
| Component mới lớn, thay đổi kiến trúc, dependency runtime mới | **RFC** được chấp nhận trước khi code | thêm Kanban, đổi thư viện popover |
| Thay đổi phá vỡ API, đổi luật trong Design.md | **RFC** + lead maintainer đồng ý | đổi tên token, bỏ prop |

Mặc định là **đồng thuận lười** (lazy consensus): đề xuất công khai, không ai phản đối có lý do trong thời hạn → thông qua.
Bất đồng kéo dài → lead maintainer quyết, ghi rõ lý do trong thread.

## 3. Quy trình RFC

1. Mở Discussion ở **Ideas** với tiêu đề `[RFC] …`: bài toán, đề xuất API, phương án đã cân nhắc, ảnh hưởng tới a11y /
   bundle size / tương thích ngược, kế hoạch chuyển đổi (nếu phá vỡ).
2. Thời gian góp ý tối thiểu **7 ngày** (14 ngày nếu phá vỡ API).
3. Maintainer ghi kết luận ngay trong thread: **Accepted** / **Declined** / **Needs work**, rồi tạo issue `enhancement`
   (hoặc `breaking change`) link ngược lại.
4. Thay đổi đã chấp nhận vào [ROADMAP.md](./ROADMAP.md).

## 4. Nguyên tắc ưu tiên

Khi phải chọn, theo thứ tự: **khả năng tiếp cận → tương thích ngược → nhất quán với Design.md → dung lượng / hiệu năng →
tính năng mới**. Không merge thứ làm giảm a11y, dù tiện đến đâu.

## 5. Bảo mật & quyền truy cập

- Lỗ hổng: theo [SECURITY.md](./SECURITY.md), xử lý riêng tư qua GitHub Security Advisories.
- Quyền publish npm và secrets (`NPM_TOKEN`) chỉ lead maintainer giữ; bật 2FA bắt buộc cho mọi maintainer.
- Mọi thay đổi vào `main` qua PR (xem cấu hình bảo vệ nhánh trong wiki *Operations Handbook*).

## 6. Sửa đổi tài liệu này

Thay đổi GOVERNANCE.md cần RFC và sự đồng ý của lead maintainer.
