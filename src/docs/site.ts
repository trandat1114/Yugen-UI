/**
 * Cấu hình trang docs. Điền các link khi đã có — mục nào để trống sẽ được ẩn hoặc hiện "Sắp có",
 * không bao giờ trỏ tới URL đoán mò.
 */
export const SITE = {
  name: "Yugen UI",
  version: "0.5.0",
  author: "trandat1114",
  packageName: "yugen-ui",
  links: {
    /** vd. "https://github.com/<owner>/yugen-ui" */
    repository: "",
    /** vd. "https://github.com/<owner>/yugen-ui/issues" */
    issues: "",
    /** vd. "https://github.com/<owner>/yugen-ui/discussions" */
    discussions: "",
    /** vd. "https://www.npmjs.com/package/yugen-ui" — chỉ điền sau khi đã publish */
    npm: "",
  },
} as const;

export type SiteLinkKey = keyof typeof SITE.links;
