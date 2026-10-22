import { spawn, spawnSync } from "node:child_process";
import { CliError } from "./errors.js";
import type { PackageManager } from "./project.js";

/** `npm install x` / `pnpm add x` / `yarn add x` / `bun add x` (dev: -D, bun -d). */
export function addArgs(pm: PackageManager, deps: string[], dev = false): string[] {
  const flag = dev ? [pm === "bun" ? "-d" : "-D"] : [];
  return [pm === "npm" ? "install" : "add", ...flag, ...deps];
}

export const runScript = (pm: PackageManager, script: string) =>
  pm === "npm" || pm === "bun" ? `${pm} run ${script}` : `${pm} ${script}`;

const win = process.platform === "win32";
/** cmd.exe nuốt ^ & | < > nếu không nằm trong ngoặc kép ("x@^1.2.0"). */
const quote = (a: string) => (/[\s^&|<>()"%!]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a);

export const commandLine = (cmd: string, args: string[]) => [cmd, ...args.map(quote)].join(" ");

/**
 * Chạy lệnh, chờ kết thúc. Windows: npm / pnpm là file .cmd nên phải qua shell — ghép sẵn một chuỗi đã bọc ngoặc
 * (truyền mảng args kèm shell: true bị Node cảnh báo DEP0190).
 */
export function exec(cmd: string, args: string[], cwd: string, quiet = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const stdio = quiet ? "ignore" : "inherit";
    const child = win ? spawn(commandLine(cmd, args), { cwd, stdio, shell: true }) : spawn(cmd, args, { cwd, stdio });
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
