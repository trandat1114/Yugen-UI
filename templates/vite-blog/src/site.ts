/**
 * Cấu hình triển khai — app và plugin SEO trong vite.config.ts cùng đọc file này. Tên blog, mô tả, tác giả và ngôn ngữ nằm
 * trong content/<lang>.ts.
 */
export const SITE = {
  /** Origin khi đã triển khai, không có dấu / cuối và không gồm base (BASE=/repo/) — dùng cho canonical, sitemap.xml, rss.xml. */
  url: "https://example.com",
};
