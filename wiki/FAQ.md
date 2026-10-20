# FAQ · Câu hỏi thường gặp

**Yugen UI có liên quan Microsoft không?**
Không. Yugen UI lấy cảm hứng từ token và hành vi của Fluent 2, là dự án độc lập của
[trandat1114](https://github.com/trandat1114), giấy phép MIT.

**Sau khi import `theme.css`, `bg-blue-500` / `text-sm` không chạy nữa?**
Đúng thiết kế — scale mặc định của Tailwind bị tắt để buộc dùng token. Dùng `bg-brand-background`, `text-body1`…
(bảng tra ở Design.md §3).

**Có hỗ trợ Tailwind v3 không?**
Không chính thức. Dùng `yugen-ui/styles.css` (đã biên dịch) nếu dự án không dùng Tailwind v4.

**Trộn với shadcn/ui được không?**
Cài cùng dự án được, nhưng theme Yugen thay scale mặc định nên component shadcn dùng `bg-primary`, `rounded-lg`… sẽ hỏng.
Nên chọn một hệ cho một ứng dụng.

**Dùng với Next.js App Router?**
Có. Mọi file component có `"use client"`; `cn()`, `generateBrandRamp()` gọi được trong Server Component. Xem [[Getting Started]].

**Màn hình nháy theme khi tải trang?**
Đặt `data-theme` / `data-brand` / `dir` lên `<html>` bằng script inline trước khi React chạy (ví dụ ở trang Bắt đầu nhanh).

**Component đọc tiếng Việt cho trình đọc màn hình, muốn đổi ngôn ngữ?**
Nhãn mặc định (vd. "Đóng", "Thêm N mục") đều là prop (`*Label`, `aria-label`) — truyền chuỗi của bạn.

**Ví dụ trên docs không chạy khi chép ra?**
Không nên xảy ra — CI chạy `check:examples` cho mọi ví dụ. Nếu gặp, mở issue **Documentation** kèm link trang.

**Làm sao đóng góp khi chưa rành React?**
Dịch tài liệu, sửa ví dụ, thêm bản dịch tên component tiếng Anh — lọc issue `good first issue` hoặc `documentation`.
