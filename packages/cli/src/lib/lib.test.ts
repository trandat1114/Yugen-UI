import { describe, expect, it } from "vitest";
import { tmpDir, viteProject, writeFiles, writeRegistry } from "../test/fixtures.js";
import { addCssImport, addJsImport, cssImports } from "./css.js";
import { parseJsonc } from "./fs.js";
import { addArgs, commandLine } from "./pm.js";
import {
  detectFramework,
  detectPackageManager,
  findCssFile,
  findEntryFile,
  majorOf,
  pmFromUserAgent,
  readTsconfigAlias,
} from "./project.js";
import { Registry, depName, findItem, itemName, npmDependencies, resolveTree, suggest } from "./registry.js";
import { rewriteImports, stripUseClient, targetPath, transformFile } from "./transform.js";

describe("project", () => {
  it("detects the framework from dependencies", () => {
    expect(detectFramework({ dependencies: { next: "16.0.0", react: "19" } })).toBe("next");
    expect(detectFramework({ devDependencies: { "@react-router/dev": "^7" } })).toBe("react-router");
    expect(detectFramework({ dependencies: { "@tanstack/react-start": "^1" } })).toBe("tanstack-start");
    expect(detectFramework({ devDependencies: { vite: "^6" } })).toBe("vite");
    expect(detectFramework({})).toBe("other");
  });

  it("detects the package manager from lockfiles, then the user agent", () => {
    expect(detectPackageManager(writeFiles(tmpDir(), { "pnpm-lock.yaml": "" }))).toBe("pnpm");
    expect(detectPackageManager(writeFiles(tmpDir(), { "bun.lock": "" }))).toBe("bun");
    expect(pmFromUserAgent("yarn/4.5.0 npm/? node/v22.0.0")).toBe("yarn");
    expect(pmFromUserAgent("deno/2")).toBeNull();
  });

  it("reads majors from versions and ranges", () => {
    expect(majorOf("^4.1.0")).toBe(4);
    expect(majorOf("~18.3")).toBe(18);
    expect(majorOf("19")).toBe(19);
    expect(majorOf(">=4.0.0")).toBe(4);
    expect(majorOf("latest")).toBeNull();
    expect(majorOf("workspace:*")).toBeNull();
    expect(majorOf(undefined)).toBeNull();
  });

  it("parses JSONC and follows tsconfig references to the @/* alias", () => {
    expect(parseJsonc('{ /* a */ "x": "//not a comment", // b\n "y": [1,], }')).toEqual({ x: "//not a comment", y: [1] });
    expect(readTsconfigAlias(viteProject())).toEqual({ prefix: "@", dir: "src" });
    const rr = writeFiles(tmpDir(), { "tsconfig.json": '{ "compilerOptions": { "paths": { "~/*": ["./app/*"] } } }' });
    expect(readTsconfigAlias(rr)).toEqual({ prefix: "~", dir: "app" });
    expect(readTsconfigAlias(tmpDir())).toBeNull();
  });

  it("finds the CSS file that imports tailwindcss, and the entry file", () => {
    const cwd = viteProject({ "src/styles/app.css": '@import "tailwindcss";\n', "src/index.css": "body {}\n" });
    expect(findCssFile(cwd, "vite")).toBe("src/styles/app.css");
    expect(findCssFile(viteProject(), "vite")).toBe("src/index.css");
    expect(findEntryFile(viteProject(), "vite")).toBe("src/main.tsx");
    expect(findCssFile(tmpDir(), "next")).toBeNull();
  });
});

describe("css", () => {
  it("adds the import right after tailwindcss, once", () => {
    const { css, changed } = addCssImport('@import "tailwindcss";\n\nbody {}\n', "yugen-ui/theme.css");
    expect(changed).toBe(true);
    expect(css).toBe('@import "tailwindcss";\n@import "yugen-ui/theme.css";\n\nbody {}\n');
    expect(addCssImport(css, "yugen-ui/theme.css").changed).toBe(false);
    expect(cssImports(css)).toEqual(["tailwindcss", "yugen-ui/theme.css"]);
    expect(cssImports('/* ví dụ: @import "./styles/yugen.css"; */\n:root {}\n')).toEqual([]);
    expect(addCssImport('/* @import "./yugen.css"; */\n', "./yugen.css").changed).toBe(true);
  });

  it("keeps CRLF and falls back to the leading @import block", () => {
    expect(addCssImport('@import "tailwindcss" source(none);\r\na {}\r\n', "./yugen.css").css).toBe(
      '@import "tailwindcss" source(none);\r\n@import "./yugen.css";\r\na {}\r\n',
    );
    expect(addCssImport('@charset "utf-8";\n@import "./a.css";\nb {}\n', "./yugen.css").css).toBe(
      '@charset "utf-8";\n@import "./a.css";\n@import "./yugen.css";\nb {}\n',
    );
    expect(addCssImport("b {}\n", "./yugen.css").css).toBe('@import "./yugen.css";\nb {}\n');
  });

  it("adds a JS import after directives", () => {
    expect(addJsImport('"use client";\nimport x from "x";\n', 'import "yugen-ui/styles.css";').code).toBe(
      '"use client";\nimport "yugen-ui/styles.css";\nimport x from "x";\n',
    );
    expect(addJsImport('import "yugen-ui/styles.css";\n', 'import "yugen-ui/styles.css";').changed).toBe(false);
  });
});

describe("transform", () => {
  const paths = { ui: "src/components/ui", lib: "src/lib" };

  it("maps registry paths into the project", () => {
    expect(targetPath({ path: "registry/yugen/ui/Button/Button.tsx", type: "registry:ui" }, paths)).toBe(
      "src/components/ui/Button/Button.tsx",
    );
    expect(targetPath({ path: "registry/yugen/lib/cn.ts", type: "registry:lib" }, paths)).toBe("src/lib/cn.ts");
    expect(targetPath({ path: "registry/yugen/styles/yugen.css", type: "registry:file" }, paths)).toBeNull();
  });

  it("rewrites imports to aliases or relative paths", () => {
    const code = 'import { cn } from "@/lib/cn";\nimport { Popover } from \'@/components/ui/Popover/Popover\';\n';
    const target = "src/components/ui/Select/Select.tsx";
    expect(rewriteImports(code, target, { paths, aliases: { ui: "~/ui", lib: "~/utils" } })).toBe(
      'import { cn } from "~/utils/cn";\nimport { Popover } from \'~/ui/Popover/Popover\';\n',
    );
    expect(rewriteImports(code, target, { paths })).toBe(
      'import { cn } from "../../../lib/cn";\nimport { Popover } from \'../Popover/Popover\';\n',
    );
  });

  it("drops \"use client\" unless the project uses React Server Components", () => {
    const code = '"use client";\n\nexport const x = 1;\n';
    expect(stripUseClient(code)).toBe("export const x = 1;\n");
    expect(transformFile(code, "a.ts", { paths, rsc: true })).toBe(code);
  });
});

describe("registry", () => {
  it("resolves dependencies by name, once each", async () => {
    const registry = new Registry(writeRegistry());
    const items = await resolveTree(registry, ["button", "yugen-provider"]);
    expect(items.map((i) => i.name)).toEqual(["button", "yugen-provider", "cn", "spinner"]);
    expect(npmDependencies(items)).toEqual(["@radix-ui/react-direction@^1.2.0", "@radix-ui/react-slot@^1.1.1", "clsx@^2.1.1", "tailwind-merge@^2.6.0"]);
    await expect(registry.item("nope")).rejects.toThrow(/not found/);
  });

  it("matches names loosely and suggests close ones", async () => {
    const index = await new Registry(writeRegistry()).index();
    expect(findItem(index, "YugenProvider")?.name).toBe("yugen-provider");
    expect(findItem(index, "cn")?.name).toBe("cn");
    expect(findItem(index, "theme")).toBeNull();
    expect(suggest(index, "buton")).toContain("button");
    expect(itemName("https://x.dev/r/data-grid.json")).toBe("data-grid");
    expect(depName("@radix-ui/react-slot@^1.1.1")).toBe("@radix-ui/react-slot");
  });
});

describe("pm", () => {
  it("builds add commands and quotes cmd.exe metacharacters", () => {
    expect(addArgs("npm", ["a"])).toEqual(["install", "a"]);
    expect(addArgs("pnpm", ["a"], true)).toEqual(["add", "-D", "a"]);
    expect(addArgs("bun", ["a"], true)).toEqual(["add", "-d", "a"]);
    expect(commandLine("npm", addArgs("npm", ["clsx@^2.1.1"]))).toBe('npm install "clsx@^2.1.1"');
  });
});
