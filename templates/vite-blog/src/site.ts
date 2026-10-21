/** Cấu hình blog — app và plugin SEO trong vite.config.ts cùng đọc file này. */
export const SITE = {
  title: "Nhật ký Sakura",
  description: "Ghi chép về thiết kế giao diện, React và Tailwind CSS — viết bằng Markdown, dựng bằng Yugen UI.",
  /** Origin khi đã triển khai, không có dấu / cuối và không gồm base (BASE=/repo/) — dùng cho canonical, sitemap.xml, rss.xml. */
  url: "https://example.com",
  author: "Trần Đạt",
  lang: "vi",
  locale: "vi-VN",
};
