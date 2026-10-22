import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach } from "vitest";
import type { RegistryItem } from "../lib/registry.js";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** Thư mục tạm, tự xoá sau mỗi test. */
export function tmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "yugen-cli-"));
  dirs.push(dir);
  return dir;
}

/** Ghi các file { "đường/dẫn": nội dung } vào `root`. */
export function writeFiles(root: string, files: Record<string, string>) {
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  }
  return root;
}

const url = (name: string) => `https://example.com/r/${name}.json`;
const ui = (folder: string, content: string, deps: string[] = [], registryDependencies: string[] = []): RegistryItem => ({
  name: folder.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  type: "registry:ui",
  title: folder,
  dependencies: deps,
  registryDependencies: registryDependencies.map(url),
  files: [{ path: `registry/yugen/ui/${folder}/${folder}.tsx`, type: "registry:ui", content }],
});

/** Registry nhỏ cùng định dạng scripts/build-registry.mjs (URL phụ thuộc trỏ host khác — CLI chỉ dùng tên). */
export const FIXTURE_ITEMS: RegistryItem[] = [
  {
    name: "theme",
    type: "registry:file",
    files: [{ path: "registry/yugen/styles/yugen.css", type: "registry:file", target: "styles/yugen.css", content: ":root { --yugen: 1; }\n" }],
  },
  {
    name: "cn",
    type: "registry:lib",
    title: "cn.ts",
    dependencies: ["clsx@^2.1.1", "tailwind-merge@^2.6.0"],
    files: [{ path: "registry/yugen/lib/cn.ts", type: "registry:lib", content: 'import { clsx } from "clsx";\nexport const cn = clsx;\n' }],
  },
  ui("Spinner", '"use client";\n\nimport { cn } from "@/lib/cn";\nexport const Spinner = () => cn("s");\n', [], ["cn"]),
  ui(
    "Button",
    '"use client";\n\nimport { cn } from "@/lib/cn";\nimport { Spinner } from "../Spinner/Spinner";\nexport const Button = () => [cn("b"), Spinner];\n',
    ["@radix-ui/react-slot@^1.1.1", "clsx@^2.1.1"],
    ["cn", "spinner"],
  ),
  ui(
    "YugenProvider",
    '"use client";\n\nimport { cn } from "@/lib/cn";\nimport { Spinner } from "@/components/ui/Spinner/Spinner";\nexport const YugenProvider = () => [cn("p"), Spinner];\n',
    ["@radix-ui/react-direction@^1.2.0"],
    ["cn", "spinner"],
  ),
  ui("_internal", "export const internal = 1;\n"),
];

export function writeRegistry(dir = tmpDir()) {
  for (const item of FIXTURE_ITEMS) fs.writeFileSync(path.join(dir, `${item.name}.json`), JSON.stringify(item));
  const index = { name: "yugen", items: FIXTURE_ITEMS.map(({ files, ...rest }) => ({ ...rest, files: files.map(({ content: _c, ...f }) => f) })) };
  fs.writeFileSync(path.join(dir, "registry.json"), JSON.stringify(index));
  return dir;
}

/** Dự án Vite + Tailwind v4 tối thiểu, alias @/* khai báo trong tsconfig.app.json (như template create-vite). */
export function viteProject(extra: Record<string, string> = {}) {
  return writeFiles(tmpDir(), {
    "package.json": JSON.stringify({
      name: "app",
      dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
      devDependencies: { vite: "^6.0.0", tailwindcss: "^4.1.0", "@tailwindcss/vite": "^4.1.0" },
    }),
    "package-lock.json": "{}",
    "tsconfig.json": '{ "files": [], "references": [{ "path": "./tsconfig.app.json" }] }',
    "tsconfig.app.json": `{
      // create-vite để chú thích và dấu phẩy thừa
      "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"], }, },
      "include": ["src"]
    }`,
    "src/index.css": '@import "tailwindcss";\n\nbody { margin: 0; }\n',
    "src/main.tsx": 'import "./index.css";\nimport { App } from "./App";\n',
    ...extra,
  });
}
