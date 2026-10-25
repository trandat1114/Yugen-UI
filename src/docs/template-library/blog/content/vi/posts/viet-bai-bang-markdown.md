---
title: Viết bài bằng Markdown
description: Mọi cú pháp blog hỗ trợ — tiêu đề, danh sách, code có tô màu, trích dẫn, bảng, ảnh và link — trong một bài.
date: 2026-10-14
tags: [Markdown, Hướng dẫn]
---

Markdown được phân tích bằng parser an toàn của Yugen UI: không chèn HTML thô, link `javascript:` bị loại bỏ. Bài này liệt kê
mọi thứ bạn có thể dùng.

## Chữ và link

Chữ **đậm**, *nghiêng*, ~~gạch ngang~~ và `code trong dòng`. Link ngoài như [Tailwind CSS](https://tailwindcss.com) mở tab mới;
link nội bộ như [bài chào mừng](/posts/chao-mung/) chuyển trang ngay, không tải lại.

## Danh sách

- Gạch đầu dòng
- Lồng nhau được
  - như thế này
- Và đánh số:

1. Bước một
2. Bước hai

Danh sách việc cần làm:

- [x] Cài template
- [ ] Viết bài đầu tiên

## Code

Khối code được tô màu theo ngôn ngữ và có nút sao chép:

```tsx
import { Button } from "yugen-ui";

export function Subscribe() {
  return <Button appearance="primary">Theo dõi</Button>;
}
```

```bash
npm run build
```

## Trích dẫn

> Thiết kế không chỉ là trông ra sao. Thiết kế là cách nó vận hành.

## Bảng

| Cú pháp | Kết quả |
| :--- | :--- |
| `**đậm**` | **đậm** |
| `*nghiêng*` | *nghiêng* |
| `~~gạch~~` | ~~gạch~~ |

## Ảnh

Ảnh đứng riêng một dòng; đường dẫn bắt đầu bằng `/` trỏ vào thư mục `public/`. Phần trong ngoặc kép là chú thích:

![Biểu tượng hoa anh đào của Yugen UI](/favicon.svg "Ảnh trong public/favicon.svg")

---

Mỗi heading `##` và `###` tự xuất hiện trong mục lục bên phải.
