import fs from "node:fs";
import path from "node:path";
import { exists, parseJsonc, readText, toPosix, walk } from "./fs.js";

export type Framework = "next" | "react-router" | "tanstack-start" | "vite" | "other";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const FRAMEWORK_LABEL: Record<Framework, string> = {
  next: "Next.js",
  "react-router": "React Router",
  "tanstack-start": "TanStack Start",
  vite: "Vite",
  other: "React",
};

export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function readPkg(cwd: string): PackageJson | null {
  const file = path.join(cwd, "package.json");
  return exists(file) ? (JSON.parse(readText(file)) as PackageJson) : null;
}

export const allDeps = (pkg: PackageJson): Record<string, string> => ({ ...pkg.devDependencies, ...pkg.dependencies });

export function detectFramework(pkg: PackageJson): Framework {
  const deps = allDeps(pkg);
  if (deps.next) return "next";
  if (deps["@react-router/dev"]) return "react-router";
  if (deps["@tanstack/react-start"]) return "tanstack-start";
  if (deps.vite) return "vite";
  return "other";
}

const LOCKFILES: [string, PackageManager][] = [
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["package-lock.json", "npm"],
];

/** `npm_config_user_agent` do npm / pnpm / yarn / bun đặt khi chạy `npm create`, `pnpm dlx`… */
export function pmFromUserAgent(ua = process.env.npm_config_user_agent): PackageManager | null {
  const name = ua?.split("/")[0];
  return name === "npm" || name === "pnpm" || name === "yarn" || name === "bun" ? name : null;
}

/** Lockfile trong `cwd` hoặc thư mục cha (monorepo) → user agent → npm. */
export function detectPackageManager(cwd: string, ua?: string): PackageManager {
  for (let dir = path.resolve(cwd); ; dir = path.dirname(dir)) {
    for (const [file, pm] of LOCKFILES) if (exists(path.join(dir, file))) return pm;
    if (path.dirname(dir) === dir) break;
  }
  return pmFromUserAgent(ua) ?? "npm";
}

/** "^4.1.0" → 4, "~18.3" → 18, "19" → 19; "latest", "workspace:*" → null. */
export function majorOf(version: string | undefined): number | null {
  const m = version?.match(/^[\^~>=<v\s]*(\d+)(?:\.|$)/);
  return m ? Number(m[1]) : null;
}

/** Phiên bản đã cài trong node_modules (tìm cả node_modules của thư mục cha). */
export function installedVersion(cwd: string, name: string): string | null {
  for (let dir = path.resolve(cwd); ; dir = path.dirname(dir)) {
    const file = path.join(dir, "node_modules", name, "package.json");
    if (exists(file)) return (JSON.parse(readText(file)) as PackageJson).version ?? null;
    if (path.dirname(dir) === dir) return null;
  }
}

/** Major của gói: bản đã cài, nếu chưa cài thì theo khoảng phiên bản khai báo trong package.json. */
export function packageMajor(cwd: string, pkg: PackageJson, name: string): number | null {
  return majorOf(installedVersion(cwd, name) ?? undefined) ?? majorOf(allDeps(pkg)[name]);
}

const CSS_CANDIDATES: Record<Framework, string[]> = {
  next: ["app/globals.css", "src/app/globals.css", "styles/globals.css", "src/styles/globals.css"],
  "react-router": ["app/app.css", "app/root.css", "app/globals.css"],
  "tanstack-start": ["src/styles.css", "src/styles/app.css", "app/styles/app.css", "src/index.css"],
  vite: ["src/index.css", "src/main.css", "src/styles.css", "src/style.css", "src/App.css"],
  other: ["src/index.css", "src/styles.css", "src/main.css", "app/globals.css", "styles/globals.css"],
};

export const TAILWIND_IMPORT = /^[ \t]*@import\s+(?:url\(\s*)?["']tailwindcss["']/m;

/** File CSS chính: ứng viên theo framework có `@import "tailwindcss"` → file bất kỳ có dòng đó → ứng viên đầu tiên tồn tại. */
export function findCssFile(cwd: string, framework: Framework): string | null {
  const candidates = CSS_CANDIDATES[framework].filter((f) => exists(path.join(cwd, f)));
  const withTailwind = (f: string) => TAILWIND_IMPORT.test(readText(path.join(cwd, f)));
  const scanned = ["src", "app", "styles"]
    .flatMap((d) => walk(path.join(cwd, d), /\.css$/, 4))
    .map((f) => toPosix(path.relative(cwd, f)));
  return candidates.find(withTailwind) ?? scanned.find(withTailwind) ?? candidates[0] ?? null;
}

export const defaultCssFile = (framework: Framework) => CSS_CANDIDATES[framework][0];

const ENTRY_CANDIDATES: Record<Framework, string[]> = {
  next: ["app/layout.tsx", "src/app/layout.tsx", "app/layout.jsx", "src/app/layout.jsx", "pages/_app.tsx", "src/pages/_app.tsx"],
  "react-router": ["app/root.tsx", "app/root.jsx"],
  "tanstack-start": ["src/routes/__root.tsx", "app/routes/__root.tsx"],
  vite: ["src/main.tsx", "src/main.jsx", "src/index.tsx", "src/index.jsx"],
  other: ["src/main.tsx", "src/main.jsx", "src/index.tsx", "src/index.jsx", "src/App.tsx"],
};

/** Mã của ứng dụng (src, app, pages), dùng cho doctor và codemod. */
export const appCodeFiles = (cwd: string) => ["src", "app", "pages"].flatMap((d) => walk(path.join(cwd, d), /\.[cm]?[jt]sx?$/, 6));

/** File của app đã render <YugenProvider> (bỏ qua chính thư mục component `ui` ở chế độ source), hoặc null. */
export function findProviderUsage(cwd: string, ui?: string): string | null {
  const uiAbs = ui ? path.join(cwd, ui) : null;
  const inUi = (f: string) => !!uiAbs && !path.relative(uiAbs, f).startsWith("..");
  return appCodeFiles(cwd).find((f) => !inUi(f) && /<YugenProvider\b/.test(readText(f))) ?? null;
}

/** File gốc nơi bọc YugenProvider / import CSS (main.tsx, app/layout.tsx…). */
export function findEntryFile(cwd: string, framework: Framework): string | null {
  return ENTRY_CANDIDATES[framework].find((f) => exists(path.join(cwd, f))) ?? null;
}

export interface TsAlias {
  /** "@" trong "@/*" (hoặc "~" với React Router). */
  prefix: string;
  /** Thư mục đích, tương đối với dự án ("src", "app", "."). */
  dir: string;
}

interface TsConfig {
  extends?: string;
  references?: { path: string }[];
  compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
}

/** Alias kiểu "@/*" → "./src/*" trong tsconfig.json / jsconfig.json, đọc cả `references` (Vite) và `extends` tương đối. */
export function readTsconfigAlias(cwd: string): TsAlias | null {
  const seen = new Set<string>();
  const queue = ["tsconfig.json", "jsconfig.json"].map((f) => path.join(cwd, f));
  while (queue.length) {
    let file = queue.shift()!;
    if (exists(file) && fs.statSync(file).isDirectory()) file = path.join(file, "tsconfig.json");
    if (seen.has(file) || !exists(file)) continue;
    seen.add(file);
    let config: TsConfig;
    try {
      config = parseJsonc<TsConfig>(readText(file));
    } catch {
      continue;
    }
    const base = path.resolve(path.dirname(file), config.compilerOptions?.baseUrl ?? ".");
    const paths = config.compilerOptions?.paths ?? {};
    const key = ["@/*", "~/*", ...Object.keys(paths)].find((k) => /^[@~#$\w-]+\/\*$/.test(k) && paths[k]?.[0]?.endsWith("/*"));
    if (key) {
      const dir = toPosix(path.relative(cwd, path.resolve(base, paths[key][0].slice(0, -2)))) || ".";
      return { prefix: key.slice(0, -2), dir };
    }
    for (const ref of config.references ?? []) queue.push(path.resolve(path.dirname(file), ref.path));
    if (config.extends?.startsWith(".")) queue.push(path.resolve(path.dirname(file), config.extends));
  }
  return null;
}
