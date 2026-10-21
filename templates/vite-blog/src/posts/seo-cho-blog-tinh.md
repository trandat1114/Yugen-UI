---
title: "SEO cho blog tĩnh: template đã làm sẵn những gì"
description: HTML riêng cho từng bài, canonical, Open Graph, JSON-LD, sitemap.xml và RSS — sinh tự động mỗi lần build.
date: 2026-10-07
tags: [SEO, Vite]
---

Ứng dụng React một trang thường chỉ có một file `index.html` — công cụ tìm kiếm và mạng xã hội thấy cùng một tiêu đề cho
mọi URL. Template này sửa điều đó ngay lúc build.

## Mỗi bài một file HTML

Plugin `blogSeo` trong `vite.config.ts` chạy sau khi Vite build xong và tạo:

- `posts/<slug>/index.html` — `<title>`, `description`, `canonical`, Open Graph và JSON-LD `BlogPosting` của đúng bài đó.
- `tags/<thẻ>/index.html` cho từng thẻ.
- `sitemap.xml`, `rss.xml`, `robots.txt` và `404.html`.

Vì mỗi URL là một file thật, blog chạy trên mọi host tĩnh mà không cần cấu hình chuyển hướng.

## Khi chuyển trang

Định tuyến dùng History API (`/posts/<slug>/`, không có `#`), nên mỗi bài có địa chỉ riêng. Khi người đọc bấm sang bài khác,
`document.title` và thẻ `description` được cập nhật theo bài.

## Trước khi triển khai

1. Đặt `url` trong `src/site.ts` thành domain thật — build sẽ nhắc nếu bạn quên.
2. Triển khai ở thư mục con (GitHub Pages)? Build bằng `BASE=/ten-repo/ npm run build`.
3. Gửi `https://domain-cua-ban/sitemap.xml` cho Google Search Console.

> Mẹo: mô tả (`description`) dài 120–160 ký tự hiển thị đẹp nhất trong kết quả tìm kiếm.
