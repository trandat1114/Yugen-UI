import { createRequire } from "node:module";
import path from "node:path";
import { loadConfig, type YugenConfig } from "../lib/config.js";
import { addCssImport, addJsImport } from "../lib/css.js";
import { CliError } from "../lib/errors.js";
import { exists, readText, sameText, toPosix, walk, writeText } from "../lib/fs.js";
import {
  OUT_FILE,
  PRECOMPILE_DEPS,
  STYLES,
  STYLES_INLINE,
  THEME,
  THEME_CORE,
  codeImportsFile,
  commandOf,
  cssImportsFile,
  findGenerated,
  folderChange,
  folderOfName,
  importsCss,
  listedFolders,
  precompiledCss,
  precompiledMeta,
  readGenerated,
  readManifest,
  replaceThemeImports,
  scanUsage,
  type Recorded,
  type Usage,
} from "../lib/leanCss.js";
import { addArgs, commandLine } from "../lib/pm.js";
import {
  TAILWIND_IMPORT,
  appCodeFiles,
  detectFramework,
  detectPackageManager,
  findCssFile,
  findEntryFile,
  installedVersion,
  majorOf,
  packageMajor,
  readPkg,
  type PackageManager,
} from "../lib/project.js";
import { p, pc } from "../lib/ui.js";

export interface CssOptions {
  cwd: string;
  /** Thư mục quét, tương đối với dự án. Mặc định: như lần trước (đầu file đã sinh), không có thì cả dự án. */
  src?: string[];
  /** File ghi ra. Mặc định: file đã sinh trước đó, không có thì yugen-ui.css cạnh file CSS chính. */
  out?: string;
  /** Chỉ so, không ghi: file đã cũ → `ok: false` (exit code 1). */
  check?: boolean;
  /** Biên dịch thành CSS thường (app không có Tailwind). undefined: như lần trước. */
  precompile?: boolean;
  /** File CSS chính, nơi thêm `@import` (init truyền vào). Mặc định: yugen.json, không có thì tự tìm. */
  mainCss?: string | null;
  /** `yugen add`: component vừa yêu cầu, thêm vào dù mã chưa import. */
  extra?: string[];
}

export interface CssResult {
  /** Đường dẫn tương đối với dự án. */
  file: string;
  folders: string[];
  /** theme.css (mọi component): có import cả gói, hoặc chưa cài yugen-ui. */
  everything: boolean;
  /** false: --check thấy file đã cũ / chưa có. */
  ok: boolean;
  written: boolean;
}

interface TailwindNode {
  compile(css: string, opts: { base: string; onDependency: (file: string) => void }): Promise<{ sources: unknown; build(candidates: string[]): string }>;
  optimize(css: string, opts: { minify: boolean }): { code: string };
}
interface TailwindOxide {
  Scanner: new (opts: { sources: unknown }) => { scan(): string[] };
}

const relSpec = (fromFile: string, target: string) => path.posix.relative(path.posix.dirname(fromFile), target).replace(/^(?!\.)/, "./");

/**
 * `yugen css`: đọc import yugen-ui trong mã của app, ghi `@import "yugen-ui/theme-core.css"` + một dòng
 * `@import "yugen-ui/sources/<Thư mục>.css"` cho mỗi thư mục component, rồi import file đó vào CSS chính nếu chưa.
 */
export async function css(opts: CssOptions): Promise<CssResult> {
  const { cwd } = opts;
  const pkg = readPkg(cwd);
  if (!pkg) throw new CliError(`No package.json in ${cwd}.`, "Run `yugen css` in your project root.");
  let config: YugenConfig | null = null;
  try {
    config = loadConfig(cwd);
  } catch {
    // yugen.json hỏng: `yugen doctor` báo; ở đây chỉ cần framework và file CSS.
  }
  if (config?.mode === "source")
    throw new CliError("`yugen css` is for the yugen-ui npm package.", "In source mode Tailwind already scans the components copied into your project.");
  const framework = config?.framework ?? detectFramework(pkg);
  const pm = detectPackageManager(cwd);

  // File đích và tuỳ chọn của lần trước (ghi trong đầu file).
  const relative = (p: string) => toPosix(path.relative(cwd, path.resolve(cwd, p))) || ".";
  let target = opts.out ? relative(opts.out) : undefined;
  // `--out` ở thư mục không quét (vd. lib/) và chưa CSS nào import: vẫn là file của lần trước nếu đầu file do yugen css ghi.
  const own = target ? readGenerated(cwd, path.join(cwd, target)) : null;
  const generated = [...findGenerated(cwd).filter((g) => g.abs !== own?.abs), ...(own ? [own] : [])];
  if (!target && generated.length > 1)
    throw new CliError(`Several files were written by yugen css: ${generated.map((g) => g.file).join(", ")}.`, "Pass --out <file> to pick one, and delete the others.");
  const previous = target ? generated.find((g) => g.file === target) : generated[0];
  const recorded: Recorded = {
    src: opts.src?.length ? opts.src.map(relative) : previous?.recorded.src,
    out: opts.out ? target : previous?.recorded.out,
    precompile: opts.precompile ?? previous?.recorded.precompile,
  };
  const precompile = !!recorded.precompile;
  const main = opts.mainCss ?? config?.css ?? findCssFile(cwd, framework);
  const entry = findEntryFile(cwd, framework);
  if (!target) {
    const near = precompile ? (config?.css ?? entry) : main;
    target = previous?.file ?? path.posix.join(near ? path.posix.dirname(toPosix(near)) : exists(path.join(cwd, "src")) ? "src" : ".", OUT_FILE);
  }
  const abs = path.join(cwd, target);
  const before = exists(abs) ? readText(abs) : null;
  if (before !== null && !generated.some((g) => g.abs === abs))
    throw new CliError(`${target} exists and was not written by yugen css.`, "Pass --out <file> to write somewhere else.");

  const tailwind = packageMajor(cwd, pkg, "tailwindcss");
  if (!precompile && tailwind !== 4)
    throw new CliError(
      "`yugen css` writes @import lines for Tailwind CSS v4, which this project does not have.",
      `Without Tailwind, \`yugen css --precompile\` compiles plain CSS (it needs ${PRECOMPILE_DEPS.join(", ")} as dev dependencies), or keep ${STYLES}.`,
    );
  if (precompile && tailwind === 4 && TAILWIND_IMPORT.test(main && exists(path.join(cwd, main)) ? readText(path.join(cwd, main)) : ""))
    p.log.warn("This app builds its CSS with Tailwind CSS v4: without --precompile, that build compiles the components together with your own classes.");

  const manifest = readManifest(cwd);
  if (!manifest && precompile)
    throw new CliError(`yugen-ui 0.14.0 or later is not installed.`, commandLine(pm, addArgs(pm, ["yugen-ui@latest"])));
  for (const dir of recorded.src ?? [])
    if (!exists(path.resolve(cwd, dir))) throw new CliError(`--src ${dir}: folder not found.`);
  let usage: Usage | null = manifest ? scanUsage(cwd, recorded.src ?? ["."], manifest) : null;
  if (usage && manifest && opts.extra?.length) {
    const extra = opts.extra.flatMap((n) => folderOfName(n, manifest) ?? []);
    usage = { ...usage, folders: [...new Set([...usage.folders, ...extra])].sort() };
  }

  let content: string;
  if (precompile) {
    const { compiled, version } = await compile(cwd, usage!, pm);
    content = precompiledCss(recorded, precompiledMeta(manifest!.version, version, usage!), usage!, compiled);
  } else content = importsCss(recorded, usage);
  const result: CssResult = { file: target, folders: usage?.folders ?? [], everything: !usage || !!usage.everything, ok: true, written: false };
  const upToDate = before !== null && sameText(before, content);

  if (opts.check) {
    if (upToDate) p.log.success(`${target} is up to date`);
    else {
      const change = before === null ? "" : folderChange(listedFolders(before), listedFolders(content));
      p.log.error(`${before === null ? `${target} not found` : `${target} is out of date`}${change ? `: ${change}` : ""}\n${pc.dim(`Run \`${commandOf(recorded)}\`.`)}`);
      result.ok = false;
    }
    return result;
  }

  if (!upToDate) {
    writeText(abs, content);
    result.written = true;
  }
  const what = !usage
    ? "theme.css (yugen-ui 0.14.0 or later is not installed yet)"
    : usage.everything
      ? `theme.css: ${usage.everything.file} uses \`${usage.everything.syntax}\` from "yugen-ui", which can reach any component`
      : `${precompile ? "compiled CSS of " : "theme-core.css + "}${usage.folders.length} component folder${usage.folders.length === 1 ? "" : "s"}`;
  const list = usage && !usage.everything && usage.folders.length ? `\n${pc.dim(usage.folders.join(", "))}` : "";
  if (!usage || usage.everything) p.log.warn(`${result.written ? "Wrote" : "Up to date:"} ${target} → ${what}`);
  else p.log.success(`${result.written ? "Wrote" : "Up to date:"} ${target} → ${what}${list}`);
  if (!usage) p.log.info(`Run ${pc.cyan("yugen css")} again after installing yugen-ui.`);

  if (precompile) wireCode(cwd, target, abs, entry);
  else wireCss(cwd, target, abs, main);
  if (before === null)
    p.note(
      [
        "Run it again after you import another component.",
        "With @yugen-ui/cli in devDependencies, package.json scripts can do it:",
        pc.cyan(`"predev": "${commandOf(recorded)}",`),
        pc.cyan(`"prebuild": "${commandOf(recorded)}"`),
        `In CI, ${pc.cyan(`${commandOf(recorded)} --check`)} exits with 1 when it is out of date.`,
      ].join("\n"),
      "Keep it up to date",
    );
  return result;
}

/** Import file vừa ghi vào CSS chính (thay dòng theme.css / theme-core.css / sources cũ), nếu chưa CSS nào import nó. */
function wireCss(cwd: string, target: string, abs: string, main: string | null) {
  const cssFiles = [
    ...walk(cwd, /\.css$/, 0),
    ...["src", "app", "styles"].flatMap((d) => walk(path.join(cwd, d), /\.css$/, 5)),
    ...(main && exists(path.join(cwd, main)) ? [path.join(cwd, main)] : []),
  ];
  if (cssFiles.some((f) => f !== abs && cssImportsFile(f, readText(f), abs))) return;
  if (!main || !exists(path.join(cwd, main))) {
    p.log.warn(`Import it in your main CSS file, below @import "tailwindcss": ${pc.cyan(`@import "./${path.posix.basename(target)}";`)}`);
    return;
  }
  const mainAbs = path.join(cwd, main);
  const spec = relSpec(toPosix(main), target);
  const text = readText(mainAbs);
  const replaced = replaceThemeImports(text, spec);
  if (replaced) {
    writeText(mainAbs, replaced.css);
    p.log.success(`${main}: replaced ${replaced.removed.join(" ")} with @import "${spec}";`);
    return;
  }
  const added = addCssImport(text, spec);
  if (!added.changed) return;
  writeText(mainAbs, added.css);
  p.log.success(`Added @import "${spec}" to ${main}`);
  if (!TAILWIND_IMPORT.test(text)) p.log.warn(`${main} has no @import "tailwindcss" — add it above the Yugen import.`);
}

/** `--precompile`: import file vừa ghi trong file gốc của app (thay `import "yugen-ui/styles.css"`), nếu chưa có. */
function wireCode(cwd: string, target: string, abs: string, entry: string | null) {
  if (appCodeFiles(cwd).some((f) => codeImportsFile(f, readText(f), abs))) return;
  if (!entry) {
    p.log.warn(`Import it once in your entry file: ${pc.cyan(`import "./${path.posix.basename(target)}";`)}`);
    return;
  }
  const entryAbs = path.join(cwd, entry);
  const spec = relSpec(entry, target);
  const text = readText(entryAbs);
  const styles = new RegExp(`^([ \\t]*import\\s+)(["'])${STYLES.replace(/[./]/g, "\\$&")}\\2;?`, "m");
  if (styles.test(text)) {
    writeText(entryAbs, text.replace(styles, `$1$2${spec}$2;`));
    p.log.success(`${entry}: replaced import "${STYLES}" with import "${spec}"`);
    return;
  }
  writeText(entryAbs, addJsImport(text, `import "${spec}";`).code);
  p.log.success(`Added import "${spec}" to ${entry}`);
}

/** Biên dịch bằng tailwindcss / @tailwindcss/node / @tailwindcss/oxide của chính dự án (CLI không mang theo Tailwind). */
async function compile(cwd: string, usage: Usage, pm: PackageManager): Promise<{ compiled: string; version: string }> {
  const version = installedVersion(cwd, "tailwindcss");
  const require = createRequire(path.join(cwd, "package.json"));
  let node: TailwindNode;
  let oxide: TailwindOxide;
  try {
    if (!version) throw new Error("tailwindcss");
    node = require("@tailwindcss/node") as TailwindNode;
    oxide = require("@tailwindcss/oxide") as TailwindOxide;
  } catch {
    throw new CliError(
      "`--precompile` compiles the CSS with Tailwind CSS, which is not installed in this project.",
      `Install it as a dev dependency (only this command uses it): ${commandLine(pm, addArgs(pm, PRECOMPILE_DEPS, true))}`,
    );
  }
  if (majorOf(version) !== 4) throw new CliError(`Tailwind CSS ${version} is installed; \`--precompile\` needs v4.`);
  const input = [
    '@import "tailwindcss" source(none);',
    ...(usage.everything ? [`@import "${THEME}";`] : [`@import "${THEME_CORE}";`, ...usage.folders.map((f) => `@import "yugen-ui/sources/${f}.css";`)]),
    `@source inline("${STYLES_INLINE}");`,
  ].join("\n");
  try {
    const compiler = await node.compile(input, { base: cwd, onDependency: () => {} });
    const candidates = new oxide.Scanner({ sources: compiler.sources }).scan();
    return { compiled: node.optimize(compiler.build(candidates), { minify: true }).code, version };
  } catch (e) {
    throw new CliError(`Tailwind CSS could not compile the stylesheet: ${(e as Error).message}`);
  }
}
