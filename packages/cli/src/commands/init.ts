import path from "node:path";
import { loadConfig, writeConfig, type Mode, type SourceConfig, type YugenConfig } from "../lib/config.js";
import { CONFIG_FILE, PACKAGE } from "../lib/constants.js";
import { addCssImport, addJsImport, hasCssImport } from "../lib/css.js";
import { CliError } from "../lib/errors.js";
import { exists, readText, sameText, writeText } from "../lib/fs.js";
import { addArgs, commandLine, exec } from "../lib/pm.js";
import {
  FRAMEWORK_LABEL,
  TAILWIND_IMPORT,
  allDeps,
  defaultCssFile,
  detectFramework,
  detectPackageManager,
  findCssFile,
  findEntryFile,
  findProviderUsage,
  packageMajor,
  readPkg,
  readTsconfigAlias,
  type Framework,
  type PackageJson,
  type PackageManager,
} from "../lib/project.js";
import { installItems, registryFor } from "./add.js";
import { css as leanCss } from "./css.js";
import { THEME_CORE, findGenerated } from "../lib/leanCss.js";
import { wrapWithProvider } from "../lib/provider.js";
import { confirm, p, pc, select, text, type Ctx } from "../lib/ui.js";

export interface InitOptions {
  cwd: string;
  mode?: string;
  css?: string;
  registry?: string;
  overwrite?: boolean;
  /** false: không chạy package manager, chỉ in lệnh. */
  install?: boolean;
  /** false: không bọc app trong YugenProvider, chỉ in hướng dẫn. */
  provider?: boolean;
}

interface Project {
  cwd: string;
  pkg: PackageJson;
  framework: Framework;
  pm: PackageManager;
  tailwind: number | null;
  /** Mode package + Tailwind v4, CSS chưa import theme: ghi yugen-ui.css (`yugen css`) sau khi bọc YugenProvider. */
  lean?: boolean;
}

const THEME_PACKAGE = `${PACKAGE}/theme.css`;
const STYLES_PACKAGE = `${PACKAGE}/styles.css`;
const CLI_PACKAGE = "@yugen-ui/cli";
const THEME_SOURCE = "yugen.css";

export async function init(opts: InitOptions, ctx: Ctx): Promise<YugenConfig> {
  const { cwd } = opts;
  const pkg = readPkg(cwd);
  if (!pkg) throw new CliError(`No package.json in ${cwd}.`, "Start a new app with `yugen create`.");
  const project: Project = {
    cwd,
    pkg,
    framework: detectFramework(pkg),
    pm: detectPackageManager(cwd),
    tailwind: packageMajor(cwd, pkg, "tailwindcss"),
  };
  p.log.info(
    [
      `Framework        ${pc.bold(FRAMEWORK_LABEL[project.framework])}`,
      `Package manager  ${pc.bold(project.pm)}`,
      `Tailwind CSS     ${project.tailwind ? pc.bold(`v${project.tailwind}`) : pc.yellow("not found")}`,
    ].join("\n"),
  );

  let previous: YugenConfig | null = null;
  try {
    previous = loadConfig(cwd);
  } catch {
    // yugen.json hỏng → ghi lại từ đầu.
  }

  const mode = (opts.mode ??
    (await select<Mode>(
      ctx,
      "How do you want to use Yugen UI?",
      [
        { value: "package", label: "npm package", hint: `${PACKAGE} from npm — update with your package manager` },
        { value: "source", label: "Source code", hint: "copy components into your project and edit them freely" },
      ],
      previous?.mode ?? "package",
    ))) as Mode;
  if (mode !== "package" && mode !== "source") throw new CliError(`Unknown mode "${mode}".`, "Use --mode package or --mode source.");
  if (mode === "source" && project.tailwind !== 4)
    throw new CliError(
      "Source mode needs Tailwind CSS v4.",
      "Install it first (https://tailwindcss.com/docs/installation) or use --mode package.",
    );

  let css = opts.css ?? previous?.css ?? findCssFile(cwd, project.framework);
  if (project.tailwind === 4) {
    css ??= await text(ctx, 'Main CSS file (the one with @import "tailwindcss")', defaultCssFile(project.framework));
    if (!exists(path.join(cwd, css)))
      throw new CliError(`CSS file not found: ${css}.`, 'Pass --css <file> — the file that has @import "tailwindcss".');
  }

  const config = mode === "package" ? await initPackage(project, css, opts) : await initSource(project, css!, previous, opts);
  writeConfig(cwd, config);
  p.log.success(`Wrote ${CONFIG_FILE}`);
  await provider(project, config, opts, ctx);
  if (project.lean) {
    try {
      await leanCss({ cwd, mainCss: css });
    } catch (e) {
      // vd. đã có một src/yugen-ui.css không do yugen css ghi: vẫn import theme.css như trước để init chạy xong.
      if (!(e instanceof CliError) || project.tailwind !== 4 || !css) throw e;
      p.log.warn(`yugen css: ${e.message}${e.hint ? `\n${pc.dim(e.hint)}` : ""}`);
      importInto(cwd, css, THEME_PACKAGE);
    }
    wireDevCss(project);
  }
  return config;
}

function importInto(cwd: string, file: string, spec: string) {
  const abs = path.join(cwd, file);
  const before = readText(abs);
  const { css, changed } = addCssImport(before, spec);
  if (!changed) return p.log.info(`${file} already imports "${spec}"`);
  writeText(abs, css);
  p.log.success(`Added @import "${spec}" to ${file}`);
  if (!TAILWIND_IMPORT.test(before)) p.log.warn(`${file} has no @import "tailwindcss" — add it above the Yugen import.`);
}

async function initPackage(project: Project, css: string | null, opts: InitOptions): Promise<YugenConfig> {
  const { cwd, pm, tailwind, framework } = project;
  const declared = allDeps(project.pkg)[PACKAGE];
  if (declared) p.log.info(`${PACKAGE} ${declared} is already in package.json`);
  else if (opts.install === false) p.log.info(`Install the package: ${pc.cyan(commandLine(pm, addArgs(pm, [PACKAGE])))}`);
  else {
    p.log.step(`Installing ${PACKAGE}`);
    await exec(pm, addArgs(pm, [PACKAGE]), cwd);
  }

  if (tailwind === 4 && css) {
    // Theme đã import thẳng (thiết lập trước đây, hoặc tự viết): giữ nguyên. Chưa có: yugen-ui.css chỉ gồm CSS của các
    // component mà mã import (`yugen css`, #169), import ngay sau "tailwindcss". File được ghi sau bước bọc YugenProvider
    // (cuối init()), để có cả YugenProvider mà codemod vừa import.
    const direct = [THEME_PACKAGE, THEME_CORE].find((spec) => hasCssImport(readText(path.join(cwd, css)), spec));
    if (direct) {
      p.log.info(`${css} already imports "${direct}"`);
      if (direct === THEME_PACKAGE)
        p.log.info(`It brings the CSS of every component. ${pc.cyan("yugen css")} replaces it with only the components your code imports.`);
    } else project.lean = true;
    if (readText(path.join(cwd, css)).includes(THEME_SOURCE))
      p.log.warn(`${css} also imports the source theme (${THEME_SOURCE}) — keep only one of them.`);
  } else if (findGenerated(cwd).some((g) => g.recorded.precompile)) {
    // Đã chạy `yugen css --precompile` (thay cho styles.css): chỉ cập nhật file đó.
    project.lean = true;
  } else {
    if (tailwind) p.log.warn(`Tailwind CSS v${tailwind} found — ${THEME_PACKAGE} needs v4, using the precompiled ${STYLES_PACKAGE}.`);
    const entry = findEntryFile(cwd, framework);
    const statement = `import "${STYLES_PACKAGE}";`;
    if (!entry) p.log.warn(`Import the styles once in your entry file: ${pc.cyan(statement)}`);
    else {
      const { code, changed } = addJsImport(readText(path.join(cwd, entry)), statement);
      if (changed) writeText(path.join(cwd, entry), code);
      p.log.success(changed ? `Added ${statement} to ${entry}` : `${entry} already imports ${STYLES_PACKAGE}`);
    }
  }
  if (tailwind === 4 && !allDeps(project.pkg)[CLI_PACKAGE]) {
    const install = addArgs(pm, [`${CLI_PACKAGE}@latest`], true);
    if (opts.install === false) p.log.info(`Install the dev tool for the Vite plugin and watch mode: ${pc.cyan(commandLine(pm, install))}`);
    else {
      p.log.step(`Installing ${CLI_PACKAGE}`);
      await exec(pm, install, cwd);
    }
  }
  return { mode: "package", framework, rsc: framework === "next", css: tailwind === 4 ? css : null };
}

/** Gắn dev safety net cho lean CSS: Vite tự sinh lại trước build và khi import thay đổi. */
function wireDevCss(project: Project) {
  if (project.framework !== "vite") return;
  const configFile = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"].find((file) => exists(path.join(project.cwd, file)));
  if (!configFile) {
    writeText(
      path.join(project.cwd, "vite.config.ts"),
      'import { defineConfig } from "vite";\nimport { yugenCss } from "@yugen-ui/cli/vite";\n\nexport default defineConfig({ plugins: [yugenCss()] });\n',
    );
    p.log.success("Created vite.config.ts with the yugen CSS plugin");
    return;
  }
  const file = path.join(project.cwd, configFile);
  const before = readText(file);
  if (before.includes("@yugen-ui/cli/vite") || /\byugenCss\s*\(/.test(before)) return;
  let code = `import { yugenCss } from "@yugen-ui/cli/vite";\n${before}`;
  const plugins = code.match(/plugins\s*:\s*\[([\s\S]*?)\]/m);
  if (plugins) {
    const body = plugins[1].trim();
    const replacement = `plugins: [${body}${body.endsWith(",") ? "" : ","} yugenCss()]`;
    code = code.replace(plugins[0], replacement);
  } else {
    code = code.replace(/defineConfig\s*\(\s*\{/, (match) => `${match}\n  plugins: [yugenCss()],`);
  }
  writeText(file, code);
  p.log.success(`Added the yugen CSS Vite plugin to ${configFile}`);
}

async function initSource(project: Project, css: string, previous: YugenConfig | null, opts: InitOptions): Promise<SourceConfig> {
  const { cwd, framework } = project;
  let { paths, aliases } = previous?.mode === "source" ? previous : { paths: undefined, aliases: undefined };
  if (!paths) {
    const alias = readTsconfigAlias(cwd);
    const root = alias?.dir ?? (exists(path.join(cwd, "src")) ? "src" : ".");
    paths = { ui: path.posix.join(root, "components/ui"), lib: path.posix.join(root, "lib") };
    aliases = alias ? { ui: `${alias.prefix}/components/ui`, lib: `${alias.prefix}/lib` } : undefined;
  }
  const config: SourceConfig = {
    mode: "source",
    framework,
    rsc: framework === "next",
    css,
    paths,
    ...(aliases ? { aliases } : {}),
    ...(opts.registry ? { registry: opts.registry } : previous?.registry ? { registry: previous.registry } : {}),
  };
  const registry = registryFor(cwd, opts.registry, previous);

  // Theme: nội dung item "theme" đặt cạnh file CSS chính → @import "./yugen.css" đúng với mọi framework.
  const theme = (await registry.item("theme")).files[0]?.content;
  if (!theme) throw new CliError('Registry item "theme" has no content.');
  const themeFile = path.posix.join(path.posix.dirname(css), THEME_SOURCE);
  const themeAbs = path.join(cwd, themeFile);
  if (!exists(themeAbs) || opts.overwrite) {
    writeText(themeAbs, theme);
    p.log.success(`Wrote the theme to ${themeFile}`);
  } else if (sameText(readText(themeAbs), theme)) p.log.info(`${themeFile} is up to date`);
  else p.log.warn(`${themeFile} differs from the registry — kept your version (re-run with --overwrite to update it).`);
  importInto(cwd, css, `./${THEME_SOURCE}`);
  if (hasCssImport(readText(path.join(cwd, css)), THEME_PACKAGE))
    p.log.warn(`${css} also imports ${THEME_PACKAGE} — remove it, the source theme replaces it.`);

  await installItems(["cn", "yugen-provider"], { cwd, config, registry, overwrite: opts.overwrite, install: opts.install });
  return config;
}

/** In đoạn bọc YugenProvider (MVP chưa sửa JSX tự động) nếu file gốc chưa dùng. */
/** Bọc app trong YugenProvider bằng codemod (hỏi trước); không được thì in hướng dẫn. */
async function provider(project: Project, config: YugenConfig, opts: InitOptions, ctx: Ctx) {
  const entry = findEntryFile(project.cwd, project.framework);
  if (!entry) return providerNote(project, config);
  const file = path.join(project.cwd, entry);
  const code = readText(file);
  // App đã render YugenProvider ở chỗ khác (vd. App.tsx của template): không bọc thêm lớp nữa.
  if (code.includes("YugenProvider") || findProviderUsage(project.cwd, config.paths?.ui)) return;
  if (opts.provider !== false && (await confirm(ctx, `Wrap your app in YugenProvider (${entry})?`, true))) {
    const result = wrapWithProvider(code, project.framework, providerImport(config, entry), toasterImport(config, entry));
    if (result.changed) {
      writeText(file, result.code);
      p.log.success(`Wrapped the app in YugenProvider — ${entry}`);
      return;
    }
    p.log.warn(`Could not find where to wrap the app in ${entry}.`);
  }
  providerNote(project, config);
}

/** Đường import YugenProvider từ `entry`: gói npm, alias của dự án hoặc đường dẫn tương đối. */
function providerImport(config: YugenConfig, entry: string | null) {
  return componentImport(config, entry, "YugenProvider/YugenProvider");
}

function toasterImport(config: YugenConfig, entry: string | null) {
  return componentImport(config, entry, "Toast/Toast");
}

function componentImport(config: YugenConfig, entry: string | null, component: string) {
  const target = config.paths ? path.posix.join(config.paths.ui, component) : "";
  return config.mode === "package"
    ? PACKAGE
    : config.aliases
      ? `${config.aliases.ui}/${component}`
      : entry
        ? path.posix.relative(path.posix.dirname(entry), target).replace(/^(?!\.)/, "./")
        : `./${target}`;
}

function providerNote({ cwd, framework }: Project, config: YugenConfig) {
  const entry = findEntryFile(cwd, framework);
  if (findProviderUsage(cwd, config.paths?.ui)) return;
  const providerFrom = providerImport(config, entry);
  const toasterFrom = toasterImport(config, entry);
  p.note(
    [
      pc.cyan(
        toasterFrom === providerFrom
          ? `import { Toaster, YugenProvider } from "${providerFrom}";`
          : `import { YugenProvider } from "${providerFrom}";\nimport { Toaster } from "${toasterFrom}";`,
      ),
      "",
      pc.cyan("<YugenProvider applyToDocument>"),
      pc.cyan("  <Toaster />"),
      pc.cyan("  {/* your app */}"),
      pc.cyan("</YugenProvider>"),
    ].join("\n"),
    `Wrap your app once${entry ? ` — ${entry}` : ""}`,
  );
}
