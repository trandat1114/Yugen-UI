import { spawn, spawnSync } from "node:child_process";
import { CliError } from "./errors.js";
import type { PackageManager } from "./project.js";

/** `npm install x` / `pnpm add x` / `yarn add x` / `bun add x` (dev: -D, bun -d). */
export function addArgs(pm: PackageManager, deps: string[], dev = false): string[] {
  for (const spec of deps) assertPackageSpec(spec);
  const flag = dev ? [pm === "bun" ? "-d" : "-D"] : [];
  return [pm === "npm" ? "install" : "add", ...flag, ...deps];
}

/**
 * Tên gói npm (có thể có scope) + tuỳ chọn @range / @tag. Dependency của registry item đọc qua mạng, nên chặn mọi ký tự
 * shell có thể hiểu (% & | ; $ ` " ' ( ) …) trước khi nó tới lệnh cài (#381).
 */
const PACKAGE_SPEC = /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*(@[A-Za-z0-9.^~<>=|*+ -]+)?$/;

export function assertPackageSpec(spec: string) {
  if (spec.length > 214 || !PACKAGE_SPEC.test(spec)) throw new CliError(`Refusing to install "${spec}": not a valid npm package spec.`);
}

export const runScript = (pm: PackageManager, script: string) =>
  pm === "npm" || pm === "bun" ? `${pm} run ${script}` : `${pm} ${script}`;

const win = process.platform === "win32";
/** cmd.exe nuốt ^ & | < > nếu không nằm trong ngoặc kép ("x@^1.2.0"). */
const quote = (a: string) => (/[\s^&|<>()"%!]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a);

export const commandLine = (cmd: string, args: string[]) => [cmd, ...args.map(quote)].join(" ");

const PACKAGE_MANAGERS = new Set(["npm", "pnpm", "yarn", "bun"]);

/**
 * Lệnh chạy không qua shell. Trình quản lý gói đang chạy CLI (npx, pnpm dlx, yarn dlx, bun x) để lại đường dẫn của nó
 * trong npm_config_user_agent / npm_execpath: file .js / .cjs chạy bằng chính Node này, file thực thi (bun) chạy thẳng.
 * null khi execpath không thuộc `cmd` (vd. gọi bằng npx trong dự án pnpm).
 */
export function directCommand(cmd: string, args: string[], env = process.env): { file: string; args: string[] } | null {
  const execpath = env.npm_execpath;
  if (!execpath || !PACKAGE_MANAGERS.has(cmd)) return null;
  const base = execpath.replace(/\\/g, "/").split("/").pop()!.toLowerCase();
  const owner = /^(npm|npx)-cli\.js$/.test(base) ? "npm" : base.startsWith("pnpm") ? "pnpm" : base.startsWith("yarn") ? "yarn" : base.startsWith("bun") ? "bun" : null;
  if (owner !== cmd) return null;
  return /\.(c|m)?js$/.test(base) ? { file: process.execPath, args: [execpath, ...args] } : { file: execpath, args };
}

/**
 * Chạy lệnh, chờ kết thúc. Không dùng shell khi được: Linux / macOS luôn vậy; Windows dùng execpath của trình quản lý gói
 * (directCommand) hoặc chạy thẳng git.exe. Chỉ còn trường hợp npm / pnpm là file .cmd mà không có execpath mới qua shell,
 * với một chuỗi đã bọc ngoặc (truyền mảng args kèm shell: true bị Node cảnh báo DEP0190); args đã qua assertPackageSpec.
 */
export function exec(cmd: string, args: string[], cwd: string, quiet = false): Promise<void> {
  if (!PACKAGE_MANAGERS.has(cmd) && cmd !== "git") return Promise.reject(new CliError(`Refusing to run "${cmd}".`));
  return new Promise((resolve, reject) => {
    const stdio = quiet ? "ignore" : "inherit";
    const direct = win ? directCommand(cmd, args) : null;
    const child = direct
      ? spawn(direct.file, direct.args, { cwd, stdio })
      : win && cmd !== "git"
        ? spawn(commandLine(cmd, args), { cwd, stdio, shell: true })
        : spawn(cmd, args, { cwd, stdio });
    child.on("error", (e) => reject(new CliError(`Failed to run ${cmd}: ${e.message}`)));
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new CliError(`\`${commandLine(cmd, args)}\` exited with code ${code}.`)),
    );
  });
}

export const gitAvailable = () => spawnSync("git", ["--version"], { stdio: "ignore" }).status === 0;

export function insideGitRepo(cwd: string) {
  const r = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd, encoding: "utf8" });
  return r.status === 0 && r.stdout.trim() === "true";
}
