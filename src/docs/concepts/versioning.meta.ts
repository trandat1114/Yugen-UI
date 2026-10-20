import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "versioning",
  title: "Phiên bản & chính sách thay đổi",
  group: "Nhà phát triển",
  order: 8,
  lead: "Yugen UI theo Semantic Versioning. Thay đổi phá vỡ luôn được báo trước bằng cảnh báo deprecate, ghi trong CHANGELOG và trang Có gì mới — để bạn nâng cấp có kế hoạch, không bất ngờ.",
  toc: [
    { id: "semver", label: "Semantic Versioning" },
    { id: "breaking", label: "Thế nào là thay đổi phá vỡ" },
    { id: "deprecation", label: "Quy trình deprecate" },
    { id: "support", label: "Phạm vi hỗ trợ" },
    { id: "upgrade", label: "Nâng cấp an toàn" },
  ],
};
