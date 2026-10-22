import path from "node:path";
import { CONFIG_FILE, PACKAGE } from "./constants.js";
import { CliError } from "./errors.js";
import { exists, parseJsonc, readText, writeJson } from "./fs.js";
import { allDeps, detectFramework, readPkg, readTsconfigAlias, type Framework } from "./project.js";
import type { Placement } from "./transform.js";

export type Mode = "package" | "source";

/** yugen.json ở gốc dự án — `yugen init` ghi, `add` / `list` / `doctor` đọc. */
export interface YugenConfig {
  mode: Mode;
  framework: Framework;
  /** Giữ "use client" trong mã chép vào (Next.js App Router). */
  rsc: boolean;
  /** File CSS chính (có `@import "tailwindcss"`), tương đối với dự án. */
  css: string | null;
  /** Mode source: thư mục đặt component và helper. */
  paths?: Placement;
  /** Mode source: alias import tương ứng; không có → import tương đối. */
  aliases?: Placement;
  /** Registry khác mặc định (URL hoặc thư mục). */
  registry?: string;
}

export type SourceConfig = YugenConfig & { mode: "source"; paths: Placement };

export function loadConfig(cwd: string): YugenConfig | null {
  const file = path.join(cwd, CONFIG_FILE);
  if (!exists(file)) return fromShadcn(cwd) ?? fromPackage(cwd);
  let config: YugenConfig;
  try {
    config = JSON.parse(readText(file)) as YugenConfig;
  } catch (e) {
    throw new CliError(`${CONFIG_FILE} is not valid JSON: ${(e as Error).message}`);
  }
  if (config.mode !== "package" && config.mode !== "source")
    throw new CliError(`${CONFIG_FILE}: "mode" must be "package" or "source".`, "Run `yugen init` to recreate it.");
  if (config.mode === "source" && !(config.paths?.ui && config.paths.lib))
    throw new CliError(`${CONFIG_FILE}: source mode needs "paths": { "ui": …, "lib": … }.`, "Run `yugen init` to recreate it.");
  return config;
}

export const writeConfig = (cwd: string, config: YugenConfig) => writeJson(path.join(cwd, CONFIG_FILE), config);

/** Không có yugen.json nhưng đã cài yugen-ui (app tạo bằng `create`, hoặc cài tay theo README) → mode package. */
function fromPackage(cwd: string): YugenConfig | null {
  const pkg = readPkg(cwd);
  if (!pkg || !allDeps(pkg)[PACKAGE]) return null;
  const framework = detectFramework(pkg);
  return { mode: "package", framework, rsc: framework === "next", css: null };
}

/** Dự án đã chạy `npx shadcn init <docs>/r/init.json`: suy ra cấu hình source từ components.json + alias tsconfig. */
function fromShadcn(cwd: string): YugenConfig | null {
  const file = path.join(cwd, "components.json");
  const alias = readTsconfigAlias(cwd);
  if (!exists(file) || !alias) return null;
  const c = parseJsonc<{ rsc?: boolean; tailwind?: { css?: string }; aliases?: Record<string, string> }>(readText(file));
  const ui = c.aliases?.ui ?? (c.aliases?.components && `${c.aliases.components}/ui`);
  const lib = c.aliases?.lib;
  const toPath = (a: string | undefined) =>
    a?.startsWith(`${alias.prefix}/`) ? path.posix.join(alias.dir, a.slice(alias.prefix.length + 1)) : null;
  const paths = { ui: toPath(ui), lib: toPath(lib) };
  if (!ui || !lib || !paths.ui || !paths.lib) return null;
  return {
    mode: "source",
    framework: detectFramework(readPkg(cwd) ?? {}),
    rsc: !!c.rsc,
    css: c.tailwind?.css || null,
    paths: { ui: paths.ui, lib: paths.lib },
    aliases: { ui, lib },
  };
}
