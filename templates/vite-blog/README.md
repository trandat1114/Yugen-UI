# Nhật ký Sakura · Yugen UI

Starter template của [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) — blog viết bằng Markdown trên Vite + React +
Tailwind CSS v4. Không cần CMS hay thư viện Markdown: thêm file `.md` là có bài mới.

```bash
npm create yugen-ui@latest my-app -- --template blog
cd my-app
npm run dev
```

Không dùng CLI: `npx giget@latest gh:trandat1114/Yugen-UI/templates/vite-blog my-app --install`. Không muốn cài gì? Mở thẳng
trên StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-blog

Kiểm tra cấu hình bất cứ lúc nào: `npx @yugen-ui/cli doctor` (CLI yugen, https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## Có gì bên trong

- Bài viết là file `src/posts/*.md` có frontmatter (`title`, `description`, `date`, `tags`, `draft`).
- Markdown hiển thị bằng parser an toàn của Yugen UI: code tô màu có nút sao chép, bảng, trích dẫn, việc cần làm, ảnh, link nội bộ.
- Trang chủ có tìm kiếm và lọc theo thẻ; trang bài có mục lục, thời gian đọc, bài trước / sau, sao chép liên kết.
- Định tuyến theo đường dẫn thật (`/posts/<slug>/`) bằng History API — không thêm thư viện.
- **SEO sinh lúc build** (plugin `blogSeo` trong `vite.config.ts`): mỗi bài / thẻ một file HTML có `<title>`, `description`,
  canonical, Open Graph, JSON-LD `BlogPosting`; kèm `sitemap.xml`, `rss.xml`, `robots.txt`, `404.html`.
- Theme sáng / tối / tương phản cao, lưu vào `localStorage`, không nháy khi tải lại.

## Cấu trúc

```
src/
  site.ts          # tên blog, mô tả, domain (SITE.url), tác giả
  posts/*.md       # bài viết — tên file là đường dẫn
  content.ts       # đọc frontmatter, thời gian đọc (dùng chung với plugin SEO)
  Markdown.tsx     # Markdown → component, heading có id cho mục lục
  BlogLayout.tsx   # thanh trên, nội dung theo route, chân trang
  PostList.tsx · PostPage.tsx · router.tsx
vite.config.ts     # plugin blogSeo: HTML tĩnh từng trang, sitemap, RSS
```

## Triển khai

1. Đặt `url` trong `src/site.ts` thành domain thật (build sẽ nhắc nếu còn `example.com`).
2. `npm run build` → đưa `dist/` lên host tĩnh bất kỳ. Ở thư mục con (GitHub Pages): `BASE=/ten-repo/ npm run build`.
3. Gửi `sitemap.xml` cho Google Search Console.

File trong `src/` sinh từ `src/docs/template-library/blog` (và `src/docs/block-library`) bằng `scripts/sync-templates.mjs`.
