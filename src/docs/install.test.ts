import { describe, expect, it } from "vitest";
import * as UI from "@/components/ui";
import uiExports from "virtual:yugen-ui-exports";

// virtual:yugen-ui-exports đọc export tĩnh lúc build (vite.plugins.ts) để trang docs không phải nạp cả thư viện.
// Đối chiếu với export thật khi nạp module, để bảng tĩnh không lệch khi thêm component hay đổi cách export.
const modules = import.meta.glob<Record<string, unknown>>(["../components/ui/*/*.{ts,tsx}", "!**/*.test.*"], { eager: true });

describe("virtual:yugen-ui-exports", () => {
  it("barrel: đúng các tên runtime của yugen-ui", () => {
    expect(uiExports.barrel).toEqual(Object.keys(UI).sort());
  });

  it("thư mục của từng tên export khớp module thật", () => {
    const folders: Record<string, string> = {};
    for (const [file, mod] of Object.entries(modules)) {
      for (const name of Object.keys(mod)) folders[name] ??= file.split("/")[3];
    }
    expect(uiExports.folders).toEqual(folders);
  });
});
