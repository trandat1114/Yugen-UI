import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "shadcn-registry",
  title: "Cài bằng shadcn CLI",
  group: "Bắt đầu",
  order: 4,
  lead: "Chép mã nguồn component vào dự án bằng shadcn CLI. Hai lệnh: init một lần (tự thêm theme, cn(), YugenProvider, components.json và @import CSS), rồi add component cần dùng.",
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
