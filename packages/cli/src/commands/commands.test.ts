import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CliError } from "../lib/errors.js";
import { CONFIG_FILE } from "../lib/constants.js";
import { tmpDir, viteProject, writeFiles, writeRegistry } from "../test/fixtures.js";
import { add } from "./add.js";
import { create, loadTemplates, toPackageName } from "./create.js";
import { compareVersions, diagnose } from "./doctor.js";
import { init } from "./init.js";
import { list } from "./list.js";

const ctx = { interactive: false };
const read = (cwd: string, file: string) => fs.readFileSync(path.join(cwd, file), "utf8");
const json = (cwd: string, file: string) => JSON.parse(read(cwd, file));
/** templates/ ở gốc repo (bản chưa đổi .gitignore → _gitignore). */
const repoTemplates = fileURLToPath(new URL("../../../../templates", import.meta.url));

describe("create", () => {
  it("copies a template and names the package after the directory", async () => {
    const cwd = tmpDir();
    const { target } = await create({ cwd, dir: "My App", template: "starter", install: false, git: false, templatesDir: repoTemplates }, ctx);
    expect(json(target, "package.json").name).toBe("my-app");
    expect(fs.existsSync(path.join(target, ".gitignore"))).toBe(true);
    expect(read(target, "src/index.css")).toContain('@import "yugen-ui/theme.css"');
  });

  it("--lang keeps one language: content/index.ts, the other file removed, <html lang>", async () => {
    const cwd = tmpDir();
    const base = { cwd, template: "starter", install: false, git: false, templatesDir: repoTemplates };
    const { target: vi } = await create({ ...base, dir: "vi", lang: "vi" }, ctx);
    expect(read(vi, "src/content/index.ts")).toContain('from "./vi"');
    expect(fs.existsSync(path.join(vi, "src/content/en.ts"))).toBe(false);
    expect(read(vi, "index.html")).toContain('<html lang="vi"');
    // Không truyền --lang (và không tương tác): tiếng Anh.
    const { target: en } = await create({ ...base, dir: "en" }, ctx);
    expect(read(en, "src/content/index.ts")).toContain('from "./en"');
    expect(fs.existsSync(path.join(en, "src/content/vi.ts"))).toBe(false);
    expect(read(en, "index.html")).toContain('<html lang="en"');
    await expect(create({ ...base, dir: "fr", lang: "fr" }, ctx)).rejects.toThrow(/no "fr" text/);
    // Template chưa tách nội dung: chỉ cảnh báo.
    await expect(create({ ...base, dir: "saas", template: "saas", lang: "en" }, ctx)).resolves.toBeTruthy();
  });

  it("refuses a non-empty directory without --force and unknown templates", async () => {
    const cwd = writeFiles(tmpDir(), { "app/keep.txt": "x" });
    const opts = { cwd, dir: "app", template: "saas", install: false, git: false, templatesDir: repoTemplates };
    await expect(create(opts, ctx)).rejects.toThrow(/not empty/);
    await expect(create({ ...opts, force: true }, ctx)).resolves.toBeTruthy();
    expect(read(cwd, "app/keep.txt")).toBe("x");
    await expect(create({ ...opts, dir: "b", template: "nope" }, ctx)).rejects.toThrow(/Unknown template/);
  });

  it("lists every template from the manifest", () => {
    expect(loadTemplates(repoTemplates).map((t) => t.name)).toEqual(["starter", "saas", "blog", "dashboard", "ai-chat"]);
    expect(toPackageName("  Ứng dụng Đẹp ")).toBe("ung-dung-dep");
    expect(toPackageName(".hidden App")).toBe("hidden-app");
  });
});

describe("init --mode package", () => {
  it("imports theme.css after tailwindcss and records the mode", async () => {
    const cwd = viteProject();
    await init({ cwd, mode: "package", install: false }, ctx);
    expect(read(cwd, "src/index.css")).toBe('@import "tailwindcss";\n@import "yugen-ui/theme.css";\n\nbody { margin: 0; }\n');
    expect(json(cwd, "yugen.json")).toEqual({ mode: "package", framework: "vite", rsc: false, css: "src/index.css" });
    await init({ cwd, mode: "package", install: false }, ctx);
    expect(read(cwd, "src/index.css").match(/theme\.css/g)).toHaveLength(1);
  });

  it("falls back to styles.css without Tailwind v4", async () => {
    const cwd = writeFiles(tmpDir(), {
      "package.json": JSON.stringify({ dependencies: { react: "^18.3.1", vite: "^6.0.0" } }),
      "src/main.tsx": 'import { App } from "./App";\n',
    });
    await init({ cwd, mode: "package", install: false }, ctx);
    expect(read(cwd, "src/main.tsx")).toBe('import "yugen-ui/styles.css";\nimport { App } from "./App";\n');
    await expect(init({ cwd, mode: "source", install: false }, ctx)).rejects.toThrow(/Tailwind CSS v4/);
  });
});

describe("init --mode source + add", () => {
  it("copies the theme, cn and YugenProvider with the project alias", async () => {
    const registry = writeRegistry();
    const cwd = viteProject();
    await init({ cwd, mode: "source", registry, install: false }, ctx);

    const config = json(cwd, "yugen.json");
    expect(config).toMatchObject({
      mode: "source",
      rsc: false,
      css: "src/index.css",
      paths: { ui: "src/components/ui", lib: "src/lib" },
      aliases: { ui: "@/components/ui", lib: "@/lib" },
    });
    expect(read(cwd, "src/yugen.css")).toContain("--yugen");
    expect(read(cwd, "src/index.css")).toMatch(/^@import "tailwindcss";\n@import "\.\/yugen\.css";\n/);
    expect(read(cwd, "src/lib/cn.ts")).toContain("clsx");
    const provider = read(cwd, "src/components/ui/YugenProvider/YugenProvider.tsx");
    expect(provider).not.toContain("use client");
    expect(provider).toContain('from "@/lib/cn"');
    expect(provider).toContain('from "@/components/ui/Spinner/Spinner"');

    const doctor = await diagnose({ cwd, offline: true });
    expect(doctor.filter((c) => c.level === "error")).toEqual([]);
    expect(doctor.find((c) => c.message.startsWith("YugenProvider"))?.level).toBe("warn");
  });

  it("adds components, keeps local edits unless --overwrite", async () => {
    const registry = writeRegistry();
    const cwd = viteProject();
    await init({ cwd, mode: "source", registry, install: false }, ctx);
    await add({ cwd, names: ["Button"], registry, install: false }, ctx);
    const file = "src/components/ui/Button/Button.tsx";
    expect(read(cwd, file)).toContain('import { Spinner } from "../Spinner/Spinner"');

    fs.writeFileSync(path.join(cwd, file), "// edited\n");
    await add({ cwd, names: ["button"], registry, install: false }, ctx);
    expect(read(cwd, file)).toBe("// edited\n");
    await add({ cwd, names: ["button"], registry, install: false, overwrite: true }, ctx);
    expect(read(cwd, file)).toContain("export const Button");

    await expect(add({ cwd, names: ["buton"], registry }, ctx)).rejects.toSatisfy(
      (e) => e instanceof CliError && /button/.test(e.hint ?? ""),
    );
    const rows = (await list({ cwd, registry, json: true })) as { name: string; installed: boolean }[];
    expect(rows.filter((r) => r.installed).map((r) => r.name)).toEqual(["spinner", "button", "yugen-provider"]);
  });

  it("uses relative imports when the project has no alias, and keeps \"use client\" for Next.js", async () => {
    const registry = writeRegistry();
    const cwd = writeFiles(tmpDir(), {
      "package.json": JSON.stringify({ dependencies: { next: "16.0.0", react: "19.0.0", tailwindcss: "^4.1.0" } }),
      "app/globals.css": '@import "tailwindcss";\n',
      "app/layout.tsx": "export default function Layout() {}\n",
    });
    await init({ cwd, mode: "source", registry, install: false }, ctx);
    expect(json(cwd, "yugen.json")).toMatchObject({ framework: "next", rsc: true, css: "app/globals.css", paths: { ui: "components/ui", lib: "lib" } });
    expect(fs.existsSync(path.join(cwd, "app/yugen.css"))).toBe(true);
    const provider = read(cwd, "components/ui/YugenProvider/YugenProvider.tsx");
    expect(provider.startsWith('"use client";')).toBe(true);
    expect(provider).toContain('from "../../../lib/cn"');
    expect(provider).toContain('from "../Spinner/Spinner"');
  });

  it("add does nothing in package mode", async () => {
    const cwd = viteProject();
    await init({ cwd, mode: "package", install: false }, ctx);
    await add({ cwd, names: ["button"] }, ctx);
    expect(fs.existsSync(path.join(cwd, "src/components"))).toBe(false);
  });
});

describe("doctor", () => {
  it("reports a missing theme and a theme imported before tailwindcss", async () => {
    const cwd = viteProject();
    expect((await diagnose({ cwd, offline: true })).find((c) => c.message.includes("not imported"))?.level).toBe("error");
    fs.writeFileSync(path.join(cwd, "src/index.css"), '@import "yugen-ui/theme.css";\n@import "tailwindcss";\n');
    expect((await diagnose({ cwd, offline: true })).find((c) => c.message.includes("before"))?.level).toBe("error");
  });

  it("treats an app with yugen-ui installed and no yugen.json as package mode", async () => {
    const cwd = tmpDir();
    const { target } = await create({ cwd, dir: "app", template: "starter", install: false, git: false, templatesDir: repoTemplates }, ctx);
    const checks = await diagnose({ cwd: target, offline: true });
    expect(checks.find((c) => c.message.includes(CONFIG_FILE))).toMatchObject({ level: "ok", message: expect.stringMatching(/^Package mode/) });
    await expect(add({ cwd: target, names: ["button"] }, ctx)).resolves.toBeUndefined();
  });

  it("compares versions", () => {
    expect(compareVersions("0.7.2", "0.8.0")).toBeLessThan(0);
    expect(compareVersions("1.0.0", "1.0.0-beta.1")).toBe(0);
    expect(compareVersions("v1.2.10", "1.2.9")).toBeGreaterThan(0);
  });
});
