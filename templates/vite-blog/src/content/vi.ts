import type { Content } from "./types";

const vi: Content = {
  lang: "vi",
  locale: "vi-VN",
  site: {
    title: "Nhật ký Sakura",
    description: "Ghi chép về thiết kế giao diện, React và Tailwind CSS — viết bằng Markdown, dựng bằng Yugen UI.",
    author: "Trần Đạt",
  },
  themes: { light: "Sáng", dark: "Tối", "high-contrast": "Tương phản cao" },
  appearance: "Giao diện",
  home: { title: "Bài viết mới", lead: "Thiết kế giao diện, React và Tailwind CSS — mỗi tuần một bài." },
  tagLead: (count, tag) => `${count} bài gắn thẻ ${tag}.`,
  search: { label: "Tìm bài viết", placeholder: "Tìm bài viết…" },
  empty: { title: "Không có bài phù hợp", body: "Thử từ khoá khác hoặc bỏ bộ lọc thẻ." },
  draft: "Bản nháp",
  readingTime: (minutes) => `${minutes} phút đọc`,
  post: {
    toc: "Trong bài này",
    more: "Bài khác",
    older: "Bài trước",
    newer: "Bài sau",
    copyLink: "Sao chép liên kết",
    copied: "Đã sao chép liên kết",
    copyFailed: { title: "Không sao chép được", body: "Trình duyệt chặn quyền clipboard." },
  },
  markdown: { done: "Đã xong", todo: "Chưa xong", table: "Bảng" },
  notFound: { title: "Không tìm thấy trang", body: "Bài viết có thể đã đổi địa chỉ hoặc chưa từng tồn tại.", home: "Về trang chủ" },
  builtWith: "Dựng bằng",
  tagDescription: (tag, site) => `Các bài viết gắn thẻ ${tag} trên ${site}.`,
};

export default vi;
