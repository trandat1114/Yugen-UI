import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TEMPLATES, templateCommand, templateName } from "./templates";

const root = path.resolve(__dirname, "../..");

describe("templates", () => {
  it("trang #/templates, scripts/sync-templates.mjs và thư mục templates/ cùng một danh sách", () => {
    const script = fs.readFileSync(path.join(root, "scripts/sync-templates.mjs"), "utf8");
    const synced = [...script.matchAll(/^\s{4}dir: "([\w-]+)",$/gm)].map((m) => m[1]).sort();
    const dirs = fs.readdirSync(path.join(root, "templates"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
    const docs = TEMPLATES.map((t) => t.dir).sort();
    expect(docs).toEqual(synced);
    expect(docs).toEqual(dirs);
  });

  it("lệnh tạo dự án: CLI chép + cài, rồi chạy — mỗi lệnh một dòng, không nối bằng && (Windows PowerShell 5.1)", () => {
    expect(templateCommand("vite-blog")).toBe("npx create-yugen-ui@latest my-app --template blog\ncd my-app\nnpm run dev");
  });

  it("tên --template trên docs khớp danh mục CLI (templates/templates.json)", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "templates/templates.json"), "utf8")) as { dir: string; name: string }[];
    expect(TEMPLATES.map((t) => [t.dir, templateName(t.dir)]).sort()).toEqual(manifest.map((t) => [t.dir, t.name]).sort());
  });
});
