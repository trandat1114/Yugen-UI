import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "shadcn-registry",
  title: "Cài bằng shadcn CLI",
  group: "Bắt đầu",
  order: 4,
  lead: "Muốn sở hữu mã nguồn như shadcn/ui? Hai lệnh: init một lần (theme, cn(), YugenProvider, components.json, @import CSS — tự động), rồi add component nào cần.",
  toc: [
    { id: "choose", label: "npm hay chép mã nguồn" },
    { id: "init", label: "Khởi tạo một lần" },
    { id: "add", label: "Thêm component" },
    { id: "namespace", label: "Registry có tên @yugen" },
    { id: "existing", label: "Dự án đã dùng shadcn/ui" },
    { id: "update", label: "Cập nhật" },
    { id: "notes", label: "Lưu ý" },
  ],
};
