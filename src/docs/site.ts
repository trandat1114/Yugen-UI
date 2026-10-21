/**
 * Cấu hình trang docs. Điền các link khi đã có — mục nào để trống sẽ được ẩn hoặc hiện "Sắp có",
 * không bao giờ trỏ tới URL đoán mò.
 */
// Phiên bản lấy thẳng từ package.json (Vite chỉ nhúng trường `version`) — không bao giờ lệch khi phát hành.
import { version } from "../../package.json";

export const SITE = {
  name: "Yugen UI",
  version,
  author: "trandat1114",
  packageName: "yugen-ui",
  links: {
    /** Trang GitHub cá nhân của tác giả — mọi chỗ hiện "trandat1114" dẫn về đây (AuthorLink). */
    author: "https://github.com/trandat1114",
    repository: "https://github.com/trandat1114/Yugen-UI",
    issues: "https://github.com/trandat1114/Yugen-UI/issues",
    /** Điền "https://github.com/trandat1114/Yugen-UI/discussions" sau khi bật Discussions trong Settings của repo. */
    discussions: "https://github.com/trandat1114/Yugen-UI/discussions",
    npm: "https://www.npmjs.com/package/yugen-ui",
  },
} as const;

export type SiteLinkKey = keyof typeof SITE.links;
