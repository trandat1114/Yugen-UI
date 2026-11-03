// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- script .mjs không có khai báo kiểu
import { codeSegments, demoLanguageErrors, vietnameseLines } from "../../scripts/check-demo-language.mjs";

/** scripts/check-demo-language.mjs: code mẫu và block viết bằng tiếng Anh (#278). */
const REGISTRY = `
const GREETING = "Xin chào bạn";
const sources = [{ label: "Trực tiếp" }];

// #region Demo
function Demo() {
  return <Button>Lưu</Button>;
}
// #endregion

export const docs = [
  {
    title: "Ví dụ có chữ tiếng Việt",
    description: "Phần chữ của trang không bị kiểm tra.",
    code: \`const sources = \${lit(sources)};
<Button>Save</Button>\`,
    setup: declarationsOf(RAW, ["GREETING"]),
  },
];
`;

describe("check-demo-language", () => {
  it("chỉ lấy code mẫu: template literal, hằng chèn vào code, declarationsOf và khối #region", () => {
    const hits = vietnameseLines(codeSegments(REGISTRY)).map((h: { text: string }) => h.text);
    expect(hits).toEqual(['const GREETING = "Xin chào bạn";', 'const sources = [{ label: "Trực tiếp" }];', "return <Button>Lưu</Button>;"]);
  });

  it("báo file:dòng, bỏ qua dòng trong ALLOW và báo mục ALLOW thừa", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "demo-language-"));
    fs.mkdirSync(path.join(root, "src/docs/registry"), { recursive: true });
    fs.mkdirSync(path.join(root, "src/docs/block-library"), { recursive: true });
    fs.writeFileSync(path.join(root, "src/docs/registry/a.tsx"), "export const docs = [{ code: `<Combobox options={[\"Đà Nẵng\"]} />` }];\n");
    fs.writeFileSync(path.join(root, "src/docs/block-library/01-x.tsx"), 'export const meta = { title: "Đăng nhập" };\n');

    expect(demoLanguageErrors(root, [])).toEqual([
      'src/docs/registry/a.tsx:1  export const docs = [{ code: `<Combobox options={["Đà Nẵng"]} />` }];',
      'src/docs/block-library/01-x.tsx:1  export const meta = { title: "Đăng nhập" };',
    ]);
    const allow = [
      { file: "src/docs/registry/a.tsx", match: '"Đà Nẵng"', reason: "lọc bỏ dấu" },
      { file: "src/docs/registry/a.tsx", match: "Hà Nội", reason: "không còn dùng" },
    ];
    expect(demoLanguageErrors(root, allow)).toEqual([
      'src/docs/block-library/01-x.tsx:1  export const meta = { title: "Đăng nhập" };',
      "ALLOW thừa: src/docs/registry/a.tsx › Hà Nội",
    ]);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
