import fs from "node:fs";
import path from "node:path";
import { loadConfig, type YugenConfig } from "../lib/config.js";
import { CONFIG_FILE, PACKAGE } from "../lib/constants.js";
import { cssImports, stripCssComments } from "../lib/css.js";
import { CliError } from "../lib/errors.js";
import { exists, readText, sameText, toPosix, walk } from "../lib/fs.js";
import {
  THEME_CORE,
  codeImportsFile,
  commandOf,
  findGenerated,
  folderChange,
  importsCss,
  listedFolders,
  precompiledMeta,
  readManifest,
  scanUsage,
  specResolvesTo,
} from "../lib/leanCss.js";
import { addArgs, commandLine } from "../lib/pm.js";
import {
  TAILWIND_IMPORT,
  allDeps,
  appCodeFiles,
  detectPackageManager,
  findProviderUsage,
  installedVersion,
  majorOf,
  packageMajor,
  readPkg,
} from "../lib/project.js";
import { p, pc } from "../lib/ui.js";

export type Level = "ok" | "warn" | "error";

export interface Check {
  level: Level;
  message: string;
  hint?: string;
}

export interface DoctorOptions {
  cwd: string;
  /** Không hỏi npm phiên bản mới nhất (kiểm thử, mạng chặn). */
  offline?: boolean;
}

const THEME_PACKAGE = `${PACKAGE}/theme.css`;
const STYLES_PACKAGE = `${PACKAGE}/styles.css`;
const isSourceTheme = (spec: string) => /(^|\/)yugen\.css$/.test(spec);
const isThemeSpec = (spec: string) => spec === THEME_PACKAGE || spec === THEME_CORE || isSourceTheme(spec);

/** "0.7.2" < "0.8.0" → âm; bỏ qua hậu tố prerelease. */
export function compareVersions(a: string, b: string) {
  const parse = (v: string) => v.replace(/^v/, "").split("-")[0].split(".").map(Number);
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
}

async function latestVersion(name: string): Promise<string | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${name}/latest`, { signal: AbortSignal.timeout(3000) });
    return res.ok ? ((await res.json()) as { version: string }).version : null;
  } catch {
    return null;
  }
}

/** Kiểm tra thiết lập Yugen UI của dự án; không sửa gì. */
export async function diagnose(opts: DoctorOptions): Promise<Check[]> {
  const { cwd } = opts;
  const checks: Check[] = [];
  const add = (level: Level, message: string, hint?: string) => checks.push({ level, message, hint });
  const rel = (f: string) => toPosix(path.relative(cwd, f));

  const pkg = readPkg(cwd);
  if (!pkg) {
    add("error", "No package.json found", "Run `yugen doctor` in your project root.");
    return checks;
  }
  const deps = allDeps(pkg);
  const pm = detectPackageManager(cwd);

  let config: YugenConfig | null = null;
  try {
    config = loadConfig(cwd);
    if (config && exists(path.join(cwd, CONFIG_FILE))) add("ok", `${CONFIG_FILE}: ${config.mode} mode`);
    else if (config) add("ok", `${config.mode === "package" ? "Package" : "Source"} mode (no ${CONFIG_FILE}; read from ${config.mode === "package" ? "package.json" : "components.json"})`);
    else add("warn", `${CONFIG_FILE} not found`, "Run `yugen init` to record how Yugen UI is set up.");
  } catch (e) {
    add("error", (e as Error).message, (e as CliError).hint);
  }

  const react = installedVersion(cwd, "react") ?? deps.react;
  const reactMajor = majorOf(react);
  if (!react) add("error", "React is not installed");
  else if (reactMajor !== null && reactMajor < 19) add("error", `React ${react} — Yugen UI needs React 19 or later`);
  else add("ok", `React ${react}`);

  const cssFiles = ["src", "app", "styles"].flatMap((d) => walk(path.join(cwd, d), /\.css$/, 5));
  const codeFiles = appCodeFiles(cwd);
  // File do `yugen css` ghi (#169): bản @import là theme của file CSS import nó; bản --precompile thay cho styles.css.
  const generated = findGenerated(cwd);
  const leanFile = (from: string, spec: string) => generated.find((g) => !g.recorded.precompile && specResolvesTo(from, spec, g.abs));
  const themeImports = cssFiles
    .filter((file) => !generated.some((g) => g.abs === file))
    .flatMap((file) =>
      cssImports(readText(file))
        .filter((spec) => isThemeSpec(spec) || leanFile(file, spec))
        .map((spec) => ({ file, spec })),
    );
  const stylesImports = [
    ...codeFiles.filter((f) => readText(f).includes(`"${STYLES_PACKAGE}"`) || readText(f).includes(`'${STYLES_PACKAGE}'`)),
    ...cssFiles.filter((f) => cssImports(readText(f)).includes(STYLES_PACKAGE)),
  ];
  const precompiledImports = codeFiles.flatMap((file) => {
    const code = readText(file);
    const g = generated.find((g) => g.recorded.precompile && codeImportsFile(file, code, g.abs));
    return g ? [{ file, g }] : [];
  });
  const unimported = generated.filter((g) =>
    g.recorded.precompile ? !precompiledImports.some((i) => i.g === g) : !themeImports.some((t) => leanFile(t.file, t.spec) === g),
  );

  const tailwind = packageMajor(cwd, pkg, "tailwindcss");
  const tailwindVersion = installedVersion(cwd, "tailwindcss") ?? deps.tailwindcss;
  if (tailwind === 4) add("ok", `Tailwind CSS ${tailwindVersion}`);
  else if (themeImports.length || config?.mode === "source")
    add(
      "error",
      tailwind ? `Tailwind CSS ${tailwindVersion} — the Yugen theme needs v4` : "Tailwind CSS v4 is not installed",
      `Upgrade (https://tailwindcss.com/docs/upgrade-guide) or import ${STYLES_PACKAGE} instead.`,
    );
  else if (stylesImports.length || precompiledImports.length)
    add("ok", `No Tailwind CSS v4 — using the precompiled ${precompiledImports[0]?.g.file ?? STYLES_PACKAGE}`);

  const imports = [
    ...themeImports.map((t) => `${rel(t.file)} → ${t.spec}`),
    ...stylesImports.map((f) => `${rel(f)} → ${STYLES_PACKAGE}`),
    ...precompiledImports.map((i) => `${rel(i.file)} → ${i.g.file}`),
  ];
  for (const g of unimported)
    add(
      "error",
      `${g.file} (written by yugen css) is not imported`,
      g.recorded.precompile
        ? `Import it once in your entry file: import "./${path.basename(g.file)}";`
        : `Add @import "./${path.basename(g.file)}"; below @import "tailwindcss"; in your main CSS file.`,
    );
  if (!imports.length) {
    // File của yugen css chưa được import: đã báo ở trên, cụ thể hơn.
    if (!unimported.length)
      add("error", "The Yugen theme is not imported", `Add @import "${THEME_PACKAGE}"; below @import "tailwindcss"; — or run \`yugen init\`.`);
  } else if (imports.length > 1)
    add("warn", `The theme is imported ${imports.length} times: ${imports.join(", ")}`, "Keep a single import — duplicates bloat the CSS.");
  else add("ok", `Theme imported: ${imports[0]}`);

  for (const { file, spec } of themeImports) {
    const css = stripCssComments(readText(file));
    const tw = css.search(TAILWIND_IMPORT);
    const theme = css.indexOf(spec);
    if (tw === -1) add("warn", `${rel(file)} imports the theme but not "tailwindcss"`, 'Put @import "tailwindcss"; above it.');
    else if (theme < tw) add("error", `${rel(file)} imports the theme before "tailwindcss"`, 'Move it below @import "tailwindcss";.');
    if (isSourceTheme(spec) && spec.startsWith(".") && !exists(path.resolve(path.dirname(file), spec)))
      add("error", `${rel(file)} imports ${spec}, which does not exist`, "Run `yugen init --mode source --overwrite`.");
  }

  // CSS theo component (#169): file sinh ra còn khớp mã không; theme-core.css viết tay có đủ sources không.
  const manifest = config?.mode === "source" ? null : readManifest(cwd);
  if (manifest) {
    for (const g of generated) {
      const usage = scanUsage(cwd, g.recorded.src ?? ["."], manifest);
      const folders = usage.everything ? "all" : usage.folders;
      const fresh = g.recorded.precompile
        ? g.text.split(/\r?\n/).includes(` * ${precompiledMeta(manifest.version, installedVersion(cwd, "tailwindcss") ?? "?", usage)}`)
        : sameText(g.text, importsCss(g.recorded, usage));
      const count = folders === "all" ? "every component" : `${folders.length} component folder${folders.length === 1 ? "" : "s"}`;
      if (fresh) add("ok", `${g.file} is up to date (${count})`);
      else {
        const change = folderChange(listedFolders(g.text), folders);
        add("warn", `${g.file} is out of date${change ? `: ${change}` : ""}`, `Run \`${commandOf(g.recorded)}\`.`);
      }
    }
    if (themeImports.some((t) => t.spec === THEME_CORE)) {
      const imported = new Set(cssFiles.flatMap((f) => cssImports(readText(f)).flatMap((s) => s.match(/^yugen-ui\/sources\/(.+)\.css$/)?.[1] ?? [])));
      const usage = scanUsage(cwd, ["."], manifest);
      const missing = usage.folders.filter((f) => !imported.has(f));
      if (usage.everything)
        add(
          "warn",
          `${usage.everything.file} uses \`${usage.everything.syntax}\` from "${PACKAGE}", which can reach any component`,
          `theme-core.css + sources cannot cover that: import ${THEME_PACKAGE}, or import the components by name.`,
        );
      else if (missing.length)
        add(
          "warn",
          `No CSS for ${missing.join(", ")}: your code imports ${missing.length === 1 ? "it" : "them"}, but not yugen-ui/sources/${missing.length === 1 ? `${missing[0]}.css` : "<Folder>.css"}`,
          `Add @import "yugen-ui/sources/${missing[0]}.css";${missing.length > 1 ? " (one line per folder)" : ""}, or let \`yugen css\` write the list.`,
        );
    }
  }

  if (deps[PACKAGE] || config?.mode === "package") {
    const installed = installedVersion(cwd, PACKAGE);
    if (!deps[PACKAGE]) add("error", `${PACKAGE} is not in package.json`, commandLine(pm, addArgs(pm, [PACKAGE])));
    else if (!installed) add("error", `${PACKAGE} is in package.json but not installed`, `Run ${pm} install.`);
    else {
      const latest = opts.offline ? null : await latestVersion(PACKAGE);
      if (latest && compareVersions(installed, latest) < 0)
        add("warn", `${PACKAGE} ${installed} — ${latest} is available`, commandLine(pm, addArgs(pm, [`${PACKAGE}@latest`])));
      else add("ok", `${PACKAGE} ${installed}${latest ? " (latest)" : ""}`);
    }
  }

  const ui = config?.mode === "source" ? config.paths?.ui : undefined;
  if (config?.mode === "source" && config.paths) {
    const uiDir = path.join(cwd, config.paths.ui);
    if (!exists(uiDir)) add("error", `${config.paths.ui} not found`, "Run `yugen init --mode source`.");
    else {
      const count = fs.readdirSync(uiDir, { withFileTypes: true }).filter((d) => d.isDirectory()).length;
      add("ok", `${count} component folder${count === 1 ? "" : "s"} in ${config.paths.ui}`);
    }
    if (!exists(path.join(cwd, config.paths.lib, "cn.ts"))) add("error", `${config.paths.lib}/cn.ts not found`, "Run `yugen add cn`.");
  }

  const provider = findProviderUsage(cwd, ui);
  if (provider) add("ok", `YugenProvider found in ${rel(provider)}`);
  else add("warn", "YugenProvider not found", "Wrap your app once: <YugenProvider applyToDocument withToaster>…</YugenProvider>");

  return checks;
}

/** `yugen doctor`: in kết quả, trả về exit code (1 nếu có lỗi). */
export async function doctor(opts: DoctorOptions): Promise<number> {
  const checks = await diagnose(opts);
  for (const c of checks) {
    const text = c.hint ? `${c.message}\n${pc.dim(c.hint)}` : c.message;
    if (c.level === "ok") p.log.success(text);
    else if (c.level === "warn") p.log.warn(text);
    else p.log.error(text);
  }
  const errors = checks.filter((c) => c.level === "error").length;
  const warnings = checks.filter((c) => c.level === "warn").length;
  p.outro(
    errors
      ? pc.red(`${errors} problem${errors === 1 ? "" : "s"} to fix`)
      : warnings
        ? pc.yellow(`Looks good, ${warnings} warning${warnings === 1 ? "" : "s"}`)
        : pc.green("Everything looks good"),
  );
  return errors ? 1 : 0;
}
