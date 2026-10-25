---
title: Chào mừng đến với Nhật ký Sakura
description: Blog này là một starter template — viết bài bằng Markdown, dựng giao diện bằng Yugen UI, sẵn sàng cho SEO.
date: 2026-10-21
tags: [Yugen UI, Hướng dẫn]
---

Xin chào! Đây là bài viết đầu tiên của blog. Mọi thứ bạn đang thấy — thanh trên cùng, danh sách bài, thẻ, mục lục bên phải —
đều là component của **Yugen UI**, còn nội dung bài là một file Markdown bình thường.

## Viết bài mới

Tạo một file trong `src/content/vi/posts/`, ví dụ `src/content/vi/posts/bai-dau-tien.md`. Tên file chính là đường dẫn: bài này sẽ nằm ở
`/posts/bai-dau-tien/`.

```md
---
title: Bài đầu tiên
description: Một câu tóm tắt — hiện trong danh sách bài và kết quả tìm kiếm.
date: 2026-10-22
tags: [React, Ghi chép]
---

Nội dung bài viết bằng **Markdown**.
```

Lưu file là bài hiện ngay khi chạy `npm run dev`. Muốn viết dần chưa công bố? Thêm `draft: true` — bài chỉ hiện ở chế độ dev.

## Cấu trúc dự án

| File | Vai trò |
| --- | --- |
| `src/content/vi.ts` | Tên blog, mô tả, tác giả, chữ trên giao diện |
| `src/site.ts` | Domain |
| `src/content/vi/posts/*.md` | Bài viết |
| `src/Markdown.tsx` | Chuyển Markdown thành component |
| `vite.config.ts` | Plugin sinh HTML tĩnh, sitemap và RSS khi build |

## Bước tiếp theo

1. Đổi tên blog, mô tả trong `src/content/vi.ts` và `url` trong `src/site.ts`.
2. Xoá các bài mẫu, viết bài của bạn.
3. Chạy `npm run build` rồi đưa thư mục `dist/` lên bất kỳ host tĩnh nào.

Xem thêm cú pháp được hỗ trợ trong bài [Viết bài bằng Markdown](/posts/viet-bai-bang-markdown/).
