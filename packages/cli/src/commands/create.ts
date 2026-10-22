import path from "node:path";
import { fileURLToPath } from "node:url";
import { DOCS_URL } from "../lib/constants.js";
import { CliError } from "../lib/errors.js";
import { copyDir, exists, isEmptyDir, readText, writeJson } from "../lib/fs.js";
import { exec, gitAvailable, insideGitRepo, runScript } from "../lib/pm.js";
import { pmFromUserAgent, type PackageJson, type PackageManager } from "../lib/project.js";
import { confirm, p, pc, select, text, type Ctx } from "../lib/ui.js";

/** Template đóng gói cùng CLI (scripts/copy-templates.mjs): dist/commands → ../../templates. */
export const BUNDLED_TEMPLATES = fileURLToPath(new URL("../../templates", import.meta.url));

export interface TemplateInfo {
  dir: string;
  /** Tên ngắn cho --template: "starter", "saas"… */
  name: string;
  title: string;
  hint: string;
}

export interface CreateOptions {
  cwd: string;
  dir?: string;
  template?: string;
  pm?: string;
  install?: boolean;
  git?: boolean;
  force?: boolean;
  /** Thư mục chứa templates.json + các template (mặc định: bản đóng gói). */
  templatesDir?: string;
}

const PMS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

export function loadTemplates(dir = BUNDLED_TEMPLATES): TemplateInfo[] {
  const file = path.join(dir, "templates.json");
  if (!exists(file)) throw new CliError(`Templates not found in ${dir}.`, "Reinstall the CLI: npm create yugen-ui@latest");
  return JSON.parse(readText(file)) as TemplateInfo[];
}

/** Như create-vite, thêm bỏ dấu: "My App" → "my-app", "Ứng dụng" → "ung-dung". */
export const toPackageName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-")
    .replace(/^-+|-+$/g, "") || "yugen-app";

export async function create(opts: CreateOptions, ctx: Ctx) {
  const templatesDir = opts.templatesDir ?? BUNDLED_TEMPLATES;
  const templates = loadTemplates(templatesDir);

  const dir =
    opts.dir ??
    (await text(ctx, "Where should we create your app?", "yugen-app", (v) => (v.trim() ? undefined : "Enter a directory name.")));
  const target = path.resolve(opts.cwd, dir);
  const shown = path.relative(opts.cwd, target) || ".";

  if (!isEmptyDir(target) && !opts.force) {
    const ok = await confirm(ctx, `${shown} is not empty. Write into it anyway (files with the same name are replaced)?`, false);
    if (!ok) throw new CliError(`${shown} is not empty.`, "Pick another directory or pass --force.");
  }

  let template: TemplateInfo | undefined;
  if (opts.template) {
    template = templates.find((t) => t.name === opts.template || t.dir === opts.template);
    if (!template)
      throw new CliError(`Unknown template "${opts.template}".`, `Available: ${templates.map((t) => t.name).join(", ")}.`);
  } else {
    const name = await select(
      ctx,
      "Pick a template",
      templates.map((t) => ({ value: t.name, label: t.title, hint: t.hint })),
      templates[0].name,
    );
    template = templates.find((t) => t.name === name)!;
  }

  const pm = (opts.pm ?? pmFromUserAgent() ?? "npm") as PackageManager;
  if (!PMS.includes(pm)) throw new CliError(`Unknown package manager "${opts.pm}".`, `Use one of: ${PMS.join(", ")}.`);

  copyDir(path.join(templatesDir, template.dir), target, (name) => (name === "_gitignore" ? ".gitignore" : name));
  const pkgFile = path.join(target, "package.json");
  const pkg = JSON.parse(readText(pkgFile)) as PackageJson;
  writeJson(pkgFile, { ...pkg, name: toPackageName(path.basename(target)) });
  p.log.success(`Created ${pc.bold(template.title)} in ${pc.cyan(shown)}`);

  if (opts.install !== false) {
    p.log.step(`Installing dependencies with ${pm}`);
    await exec(pm, ["install"], target);
  }

  if (opts.git !== false && gitAvailable() && !insideGitRepo(target)) {
    try {
      await exec("git", ["init", "-q"], target, true);
      p.log.success("Initialized a git repository");
    } catch {
      p.log.warn("Could not initialize a git repository.");
    }
  }

  const steps = [
    shown !== "." && `cd ${shown.includes(" ") ? `"${shown}"` : shown}`,
    opts.install === false && `${pm} install`,
    runScript(pm, "dev"),
  ].filter(Boolean);
  p.note(steps.map((s) => pc.cyan(String(s))).join("\n"), "Next steps");
  p.outro(`Docs: ${pc.underline(DOCS_URL)}`);
  return { target, template };
}
