import path from "node:path";
import { loadConfig, type SourceConfig, type YugenConfig } from "../lib/config.js";
import { DEFAULT_REGISTRY, PACKAGE } from "../lib/constants.js";
import { CliError } from "../lib/errors.js";
import { exists, readText, sameText, writeText } from "../lib/fs.js";
import { addArgs, commandLine, exec } from "../lib/pm.js";
import { allDeps, detectPackageManager, readPkg } from "../lib/project.js";
import {
  Registry,
  depName,
  findItem,
  isComponent,
  npmDependencies,
  resolveRegistry,
  resolveTree,
  suggest,
} from "../lib/registry.js";
import { targetPath, transformFile } from "../lib/transform.js";
import { fileList, multiselect, p, pc, type Ctx } from "../lib/ui.js";

export interface AddOptions {
  cwd: string;
  names: string[];
  all?: boolean;
  overwrite?: boolean;
  dryRun?: boolean;
  /** false: chỉ in lệnh cài npm dependencies. */
  install?: boolean;
  registry?: string;
}

export const registryFor = (cwd: string, flag: string | undefined, config: YugenConfig | null) =>
  new Registry(resolveRegistry(flag ?? config?.registry ?? DEFAULT_REGISTRY, cwd));

const pascal = (s: string) => s.replace(/(^|[-_\s]+)(\w)/g, (_m, _sep, c: string) => c.toUpperCase());

export async function add(opts: AddOptions, ctx: Ctx) {
  const config = loadConfig(opts.cwd);
  if (!config) throw new CliError("yugen.json not found.", "Run `yugen init` first.");

  if (config.mode === "package") {
    const names = opts.names.length ? opts.names.map(pascal) : ["Button"];
    p.note(`import { ${names.join(", ")} } from "${PACKAGE}";`, `Components ship with the ${PACKAGE} package`);
    p.log.info(`Want to own and edit the source instead? Run ${pc.cyan("yugen init --mode source")}.`);
    return;
  }

  const registry = registryFor(opts.cwd, opts.registry, config);
  const index = await registry.index();
  let names: string[];
  if (opts.all) names = ["all"];
  else if (opts.names.length) {
    names = opts.names.map((input) => {
      const item = findItem(index, input);
      if (item) return item.name;
      const close = suggest(index, input);
      throw new CliError(
        `Unknown component "${input}".`,
        close.length ? `Did you mean ${close.join(", ")}? See \`yugen list\`.` : "See `yugen list`.",
      );
    });
  } else {
    if (!ctx.interactive) throw new CliError("Name at least one component.", "Example: yugen add button dialog — see `yugen list`.");
    const choices = index.items.filter(isComponent).map((i) => ({ value: i.name, label: i.title ?? i.name }));
    names = await multiselect(ctx, "Which components do you want to add?", choices);
  }

  await installItems(names, { ...opts, config: config as SourceConfig, registry });
}

export interface InstallOptions {
  cwd: string;
  config: SourceConfig;
  registry: Registry;
  overwrite?: boolean;
  dryRun?: boolean;
  install?: boolean;
}

export interface InstallResult {
  created: string[];
  updated: string[];
  unchanged: string[];
  skipped: string[];
  dependencies: string[];
}

/** Tải item + phụ thuộc, chép file (đổi import theo dự án), cài npm dependencies còn thiếu. Dùng chung cho `add` và `init`. */
export async function installItems(names: string[], o: InstallOptions): Promise<InstallResult> {
  const spin = p.spinner();
  spin.start(`Resolving ${names.join(", ")}`);
  let items;
  try {
    items = await resolveTree(o.registry, names);
  } catch (e) {
    spin.error("Could not resolve the components");
    throw e;
  }
  spin.stop(`Resolved ${items.length} registry item${items.length === 1 ? "" : "s"}`);

  const files = new Map<string, string>();
  for (const item of items)
    for (const file of item.files) {
      const target = targetPath(file, o.config.paths);
      if (target) files.set(target, transformFile(file.content ?? "", target, o.config));
    }

  const result: InstallResult = { created: [], updated: [], unchanged: [], skipped: [], dependencies: [] };
  for (const [target, content] of files) {
    const abs = path.join(o.cwd, target);
    if (!exists(abs)) result.created.push(target);
    else if (sameText(readText(abs), content)) result.unchanged.push(target);
    else (o.overwrite ? result.updated : result.skipped).push(target);
  }
  const have = allDeps(readPkg(o.cwd) ?? {});
  result.dependencies = npmDependencies(items).filter((spec) => !have[depName(spec)]);
  const pm = detectPackageManager(o.cwd);
  const installCmd = commandLine(pm, addArgs(pm, result.dependencies));

  if (o.dryRun) {
    const writes = [...result.created, ...result.updated];
    p.log.info(`Would write ${writes.length} file${writes.length === 1 ? "" : "s"}${writes.length ? `\n${fileList(writes)}` : ""}`);
    if (result.skipped.length) p.log.warn(`Would skip ${result.skipped.length} changed file(s)\n${fileList(result.skipped)}`);
    if (result.dependencies.length) p.log.info(`Would run: ${installCmd}`);
    return result;
  }

  for (const target of [...result.created, ...result.updated]) writeText(path.join(o.cwd, target), files.get(target)!);
  const written = result.created.length + result.updated.length;
  if (written) p.log.success(`Wrote ${written} file${written === 1 ? "" : "s"}\n${fileList([...result.created, ...result.updated])}`);
  else p.log.info("All files are up to date.");
  if (result.skipped.length)
    p.log.warn(
      `Skipped ${result.skipped.length} file(s) that differ from the registry (edited locally?) — re-run with --overwrite to replace them\n${fileList(result.skipped)}`,
    );

  if (result.dependencies.length) {
    if (o.install === false) p.log.info(`Install the dependencies: ${pc.cyan(installCmd)}`);
    else {
      p.log.step(`Installing ${result.dependencies.map(depName).join(", ")}`);
      await exec(pm, addArgs(pm, result.dependencies), o.cwd);
    }
  }
  return result;
}
