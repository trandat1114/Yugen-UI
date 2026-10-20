import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "chat-ux",
  title: "Giao diện hội thoại & AI",
  group: "Yugen Labs",
  order: 2,
  lead: "Quy tắc cho màn chat và trợ lý AI: cuộn sao cho không cướp mắt người đọc, stream chữ mà không làm phiền trình đọc màn hình, lỗi có đường thử lại, và luôn cho thấy AI đang làm gì.",
  toc: [
    { id: "anatomy", label: "Cấu trúc màn hội thoại" },
    { id: "scrolling", label: "Quy tắc cuộn" },
    { id: "streaming", label: "Stream & đang soạn" },
    { id: "errors", label: "Lỗi & thử lại" },
    { id: "a11y", label: "Live region & trình đọc màn hình" },
    { id: "composer", label: "Bàn phím trong ô soạn" },
    { id: "transparency", label: "Minh bạch với Trace" },
    { id: "ai-kit", label: "Câu trả lời AI: Markdown, nguồn, suy luận" },
    { id: "rules", label: "Nên & không nên" },
  ],
};
