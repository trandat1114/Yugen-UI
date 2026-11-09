// @vitest-environment node
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- script .mjs không có khai báo kiểu
import { componentFolders, exportFolders, sourceFiles } from "../../scripts/css-sources.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const uiDir = path.join(root, "src", "components", "ui");

describe("CSS theo component (#169)", () => {
  const files: Map<string, string[]> = sourceFiles(uiDir);

  it("mỗi thư mục quét chính nó trước, rồi đúng các file của component khác mà nó import", () => {
    expect([...files.keys()]).toEqual(componentFolders(uiDir));
    // Button dùng Spinner (trạng thái loading) và context của YugenProvider.
    const button = files.get("Button")!;
    expect(button[0]).toBe("Button");
    expect(button).toContain("Spinner/Spinner.js");
    expect(button).toContain("YugenProvider/context.js");
    // Theo file, không theo thư mục: context.ts không kéo Tooltip mà YugenProvider.tsx dùng.
    expect(button.some((p) => p.startsWith("Tooltip/"))).toBe(false);
  });

  it("import() cũng được quét: YugenProvider giữ class của Toaster nạp lười (withToaster), Loading chỉ cần store (#346)", () => {
    expect(files.get("YugenProvider")).toEqual(expect.arrayContaining(["Toast/Toast.js", "Toast/toastStore.js"]));
    const loading = files.get("Loading")!;
    expect(loading).toContain("Toast/toastStore.js");
    expect(loading).not.toContain("Toast/Toast.js");
  });

  it("phần nạp lúc cần (#350): Breadcrumb giữ class của Menu, Nav không cần Tooltip (AppShell mang Tooltip của rail)", () => {
    expect(files.get("Breadcrumb")).toContain("Menu/Menu.js");
    expect(files.get("Nav")!.some((p) => p.startsWith("Tooltip/"))).toBe(false);
    expect(files.get("AppShell")).toContain("Tooltip/Tooltip.js");
  });

  it("phụ thuộc bắc cầu: SplitButton có đủ Menu và Button", () => {
    const split = files.get("SplitButton")!;
    expect(split).toEqual(expect.arrayContaining(["Menu/Menu.js", "Button/Button.js"]));
  });

  it("đường dẫn phụ thuộc trỏ vào file .js trong dist, không có file test", () => {
    for (const [folder, paths] of files) {
      for (const p of paths.slice(1)) {
        expect(p, folder).toMatch(/^[A-Za-z_]+\/[A-Za-z]+\.js$/);
        expect(p, folder).not.toMatch(/\.test\./);
      }
    }
  });

  it("mọi export có giá trị của gói thuộc một thư mục có file sources", { timeout: 60_000 }, () => {
    const exports: Record<string, string> = exportFolders(root);
    expect(exports.NavItem).toBe("Nav");
    expect(exports.toast).toBe("Toast");
    expect(exports.Button).toBe("Button");
    // cn nằm trong src/lib, không có class; kiểu (ButtonProps) không có CSS.
    expect(exports.cn).toBeUndefined();
    expect(exports.ButtonProps).toBeUndefined();
    for (const folder of new Set(Object.values(exports))) expect(files.has(folder), folder).toBe(true);
  });
});
