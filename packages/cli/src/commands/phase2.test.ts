import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { unifiedDiff } from "../lib/diff.js";
import { CliError } from "../lib/errors.js";
import { wrapWithProvider } from "../lib/provider.js";
import { downloadTemplates } from "../lib/remote.js";
import { tmpDir, viteProject, writeFiles, writeRegistry } from "../test/fixtures.js";
import { add } from "./add.js";
import { diff } from "./diff.js";
import { init } from "./init.js";
import { remove } from "./remove.js";
import { theme } from "./theme.js";
import { update } from "./update.js";

/** CLI giai đoạn 2 (#64): diff, update, remove, theme, codemod YugenProvider, create --ref. */
const ctx = { interactive: false };
const read = (cwd: string, file: string) => fs.readFileSync(path.join(cwd, file), "utf8");
const has = (cwd: string, file: string) => fs.existsSync(path.join(cwd, file));

/** Sửa nội dung một item trong registry local (giả lập bản registry mới hơn). */
function bumpRegistry(dir: string, name: string, edit: (content: string) => string) {
  const file = path.join(dir, `${name}.json`);
  const item = JSON.parse(fs.readFileSync(file, "utf8"));
  item.files[0].content = edit(item.files[0].content);
  fs.writeFileSync(file, JSON.stringify(item));
}

async function sourceProject() {
  const registry = writeRegistry();
  const cwd = viteProject();
  await init({ cwd, mode: "source", registry, install: false }, ctx);
  await add({ cwd, names: ["button"], registry, install: false }, ctx);
  return { registry, cwd };
}

describe("unifiedDiff", () => {
  it("giống nhau → rỗng; khác → hunk có số dòng đúng", () => {
    expect(unifiedDiff("a\nb\n", "a\r\nb\r\n").lines).toEqual([]);
    const d = unifiedDiff("1\n2\n3\n4\n5\n6\n7\n8\n9\n", "1\n2\n3\n4\nfive\n6\n7\n8\n9\n10\n", { from: "x", to: "y" });
    expect(d.lines).toEqual([
      "--- x",
      "+++ y",
      "@@ -2,8 +2,9 @@",
      " 2",
      " 3",
      " 4",
      "-5",
      "+five",
      " 6",
      " 7",
      " 8",
      " 9",
      "+10",
    ]);
    expect(d).toMatchObject({ added: 2, removed: 1 });
  });

  it("thay đổi cách xa nhau thành hai hunk", () => {
    const a = Array.from({ length: 30 }, (_, i) => `l${i}`).join("\n");
    const b = a.replace("l2\n", "L2\n").replace("l27", "L27");
    expect(unifiedDiff(a, b).lines.filter((l) => l.startsWith("@@"))).toHaveLength(2);
  });
});

describe("diff / update", () => {
  it("báo file khác registry, update xem trước với --dry-run rồi ghi; file mới của phụ thuộc cũng được thêm", async () => {
    const { registry, cwd } = await sourceProject();
    expect((await diff({ cwd, names: [], registry })).changed).toEqual([]);

    bumpRegistry(registry, "spinner", (c) => c.replace('cn("s")', 'cn("s", "v2")'));
    const changed = (await diff({ cwd, names: [], registry })).changed.map((f) => f.target);
    expect(changed).toEqual(["src/components/ui/Spinner/Spinner.tsx"]);

    await update({ cwd, names: ["spinner"], registry, dryRun: true, install: false }, ctx);
    expect(read(cwd, "src/components/ui/Spinner/Spinner.tsx")).not.toContain("v2");
    await update({ cwd, names: [], registry, install: false }, ctx);
    expect(read(cwd, "src/components/ui/Spinner/Spinner.tsx")).toContain('cn("s", "v2")');
    expect((await diff({ cwd, names: [], registry })).changed).toEqual([]);

    // Sửa tay cũng hiện là khác registry; update ghi đè.
    fs.writeFileSync(path.join(cwd, "src/components/ui/Button/Button.tsx"), "// edited\n");
    expect((await diff({ cwd, names: ["Button"], registry })).changed.map((f) => f.target)).toEqual(["src/components/ui/Button/Button.tsx"]);
  });

  it("mode package không có mã nguồn để so", async () => {
    const cwd = viteProject();
    await init({ cwd, mode: "package", install: false }, ctx);
    await expect(diff({ cwd, names: [] })).rejects.toSatisfy((e) => e instanceof CliError && /source mode/.test(e.message));
  });
});

describe("remove", () => {
  it("giữ file còn được import, xoá phần còn lại và thư mục rỗng", async () => {
    const { registry, cwd } = await sourceProject();
    const kept = await remove({ cwd, names: ["spinner"], registry }, ctx);
    expect(kept.removed).toEqual([]);
    expect(Object.keys(kept.kept)).toEqual(["src/components/ui/Spinner/Spinner.tsx"]);
    // init (mode source) đã chép YugenProvider, cũng import Spinner.
    expect(kept.kept["src/components/ui/Spinner/Spinner.tsx"].sort()).toEqual([
      "src/components/ui/Button/Button.tsx",
      "src/components/ui/YugenProvider/YugenProvider.tsx",
    ]);

    expect((await remove({ cwd, names: ["button"], registry, dryRun: true }, ctx)).removed).toEqual([]);
    expect(has(cwd, "src/components/ui/Button/Button.tsx")).toBe(true);

    const result = await remove({ cwd, names: ["button"], registry }, ctx);
    expect(result.removed).toEqual(["src/components/ui/Button/Button.tsx"]);
    expect(has(cwd, "src/components/ui/Button")).toBe(false);
    expect(has(cwd, "src/components/ui/Spinner/Spinner.tsx")).toBe(true);

    // Bỏ YugenProvider thì không còn ai import Spinner → xoá được.
    await remove({ cwd, names: ["yugen-provider"], registry }, ctx);
    expect((await remove({ cwd, names: ["spinner"], registry }, ctx)).removed).toEqual(["src/components/ui/Spinner/Spinner.tsx"]);
  });

  it("đọc import qua alias @/ của dự án", async () => {
    const { registry, cwd } = await sourceProject();
    writeFiles(cwd, { "src/App.tsx": 'import { Button } from "@/components/ui/Button/Button";\nexport const App = Button;\n' });
    expect((await remove({ cwd, names: ["button"], registry }, ctx)).kept["src/components/ui/Button/Button.tsx"]).toEqual(["src/App.tsx"]);
  });
});

describe("theme", () => {
  it("ghi yugen-brand.css cạnh file CSS chính và import nó; --dry-run không ghi; key quá sáng báo tương phản", async () => {
    const cwd = viteProject();
    expect(theme({ cwd, brand: "#0f6cbd", name: "acme", dryRun: true }).file).toBe("src/yugen-brand.css");
    expect(has(cwd, "src/yugen-brand.css")).toBe(false);

    const result = theme({ cwd, brand: "0f6cbd", name: "acme" });
    expect(read(cwd, "src/yugen-brand.css")).toContain('[data-brand="acme"] {');
    expect(read(cwd, "src/yugen-brand.css")).toMatch(/--brand-80: #[0-9a-f]{6};/);
    expect(read(cwd, "src/index.css")).toContain('@import "./yugen-brand.css";');
    expect(result.contrast).toBeGreaterThanOrEqual(4.5);

    theme({ cwd, brand: "#0f6cbd", name: "acme" });
    expect(read(cwd, "src/index.css").match(/yugen-brand\.css/g)).toHaveLength(1);
    expect(theme({ cwd, brand: "#ffd400" }).contrast).toBeLessThan(4.5);
    expect(() => theme({ cwd, brand: "blue" })).toThrow(/HEX/);
    expect(() => theme({ cwd, brand: "#0f6cbd", name: "Bad Name" })).toThrow(/not valid/);
  });
});

describe("YugenProvider codemod", () => {
  const VITE_MAIN = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

  it("Vite: bọc <App /> trong render, giữ thụt lề, thêm import", () => {
    const { code, changed } = wrapWithProvider(VITE_MAIN, "vite", "yugen-ui");
    expect(changed).toBe(true);
    expect(code).toContain('import { YugenProvider } from "yugen-ui";');
    expect(code).toContain("  <StrictMode>\n    <YugenProvider applyToDocument withToaster>\n      <App />\n    </YugenProvider>\n  </StrictMode>");
    expect(wrapWithProvider(code, "vite", "yugen-ui").changed).toBe(false);
    expect(wrapWithProvider("export {};\n", "vite", "yugen-ui").changed).toBe(false);
  });

  it("Next.js: bọc {children} trong <body>", () => {
    const layout = `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`;
    const { code, changed } = wrapWithProvider(layout, "next", "@/components/ui/YugenProvider/YugenProvider");
    expect(changed).toBe(true);
    expect(code).toContain('<body className="antialiased"><YugenProvider applyToDocument withToaster>{children}</YugenProvider></body>');
    expect(code.startsWith('import { YugenProvider } from "@/components/ui/YugenProvider/YugenProvider";')).toBe(true);
  });

  it("init không bọc thêm khi app đã render YugenProvider ở file khác (starter: App.tsx)", async () => {
    const cwd = viteProject({
      "src/main.tsx": VITE_MAIN,
      "src/App.tsx": 'import { YugenProvider } from "yugen-ui";\nexport default () => <YugenProvider applyToDocument>hi</YugenProvider>;\n',
    });
    await init({ cwd, mode: "package", install: false }, ctx);
    expect(read(cwd, "src/main.tsx")).toBe(VITE_MAIN);
  });

  it("init bọc app (mode package); --no-provider thì không", async () => {
    const cwd = viteProject({ "src/main.tsx": VITE_MAIN });
    await init({ cwd, mode: "package", install: false }, ctx);
    expect(read(cwd, "src/main.tsx")).toContain("<YugenProvider applyToDocument withToaster>");

    const other = viteProject({ "src/main.tsx": VITE_MAIN });
    await init({ cwd: other, mode: "package", install: false, provider: false }, ctx);
    expect(read(other, "src/main.tsx")).not.toContain("YugenProvider");
  });
});

describe("create --ref", () => {
  it("tải templates/ của ref theo SHA commit; ref không tồn tại báo rõ", async () => {
    const files: Record<string, string> = {
      "templates/templates.json": '[{"dir":"vite-starter","name":"starter","title":"Starter","hint":"x"}]',
      "templates/vite-starter/package.json": '{"name":"vite-starter"}',
      "templates/vite-starter/src/main.tsx": "export {};\n",
    };
    const calls: string[] = [];
    const fake = (async (input: string | URL | Request) => {
      const url = String(input);
      calls.push(url);
      if (url.includes("/commits/feat%2Fnew")) return Response.json({ sha: "abc123" });
      if (url.includes("/commits/")) return new Response("", { status: 404 });
      if (url.includes("/git/trees/abc123"))
        return Response.json({ tree: [...Object.keys(files), "README.md"].map((p) => ({ path: p, type: "blob" })).concat({ path: "templates", type: "tree" }) });
      const raw = /raw\.githubusercontent\.com\/[^/]+\/[^/]+\/abc123\/(.+)$/.exec(url);
      if (raw && files[raw[1]] !== undefined) return new Response(files[raw[1]]);
      return new Response("", { status: 404 });
    }) as typeof fetch;

    const dir = await downloadTemplates("feat/new", fake);
    expect(fs.readFileSync(path.join(dir, "vite-starter/src/main.tsx"), "utf8")).toBe("export {};\n");
    expect(fs.existsSync(path.join(dir, "README.md"))).toBe(false);
    expect(calls.filter((c) => c.includes("raw.githubusercontent.com"))).toHaveLength(3);
    fs.rmSync(dir, { recursive: true, force: true });

    await expect(downloadTemplates("nope", fake)).rejects.toSatisfy((e) => e instanceof CliError && /"nope" not found/.test(e.message));
    expect(tmpDir()).toBeTruthy();
  });
});

describe("theme cùng chế độ source", () => {
  it("không ghi đè theme đã chép (yugen.css)", async () => {
    const { cwd } = await sourceProject();
    const copied = read(cwd, "src/yugen.css");
    theme({ cwd, brand: "#0f6cbd", name: "acme" });
    expect(read(cwd, "src/yugen.css")).toBe(copied);
    expect(read(cwd, "src/index.css")).toMatch(/@import "\.\/yugen\.css";[\s\S]*@import "\.\/yugen-brand\.css";|@import "\.\/yugen-brand\.css";[\s\S]*@import "\.\/yugen\.css";/);
  });

  it("diff / update không cài component chưa có", async () => {
    const { registry, cwd } = await sourceProject();
    expect((await diff({ cwd, names: ["yugen-provider"], registry })).files.length).toBeGreaterThan(0);
    fs.rmSync(path.join(cwd, "src/components/ui/Button"), { recursive: true });
    expect((await diff({ cwd, names: ["button"], registry })).files).toEqual([]);
    await update({ cwd, names: ["button"], registry, install: false }, ctx);
    expect(has(cwd, "src/components/ui/Button/Button.tsx")).toBe(false);
  });
});
