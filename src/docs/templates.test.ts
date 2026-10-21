import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TEMPLATES, templateCommand } from "./templates";

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

  it("lệnh tạo dự án là một dòng: tải, cài, chạy", () => {
    expect(templateCommand("vite-blog")).toBe(
      "npx giget@latest gh:trandat1114/Yugen-UI/templates/vite-blog my-app --install && cd my-app && npm run dev",
    );
  });
});
