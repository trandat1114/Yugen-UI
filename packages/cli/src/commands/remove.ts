import fs from "node:fs";
import path from "node:path";
import type { SourceConfig } from "../lib/config.js";
import { CliError } from "../lib/errors.js";
import { exists, readText, toPosix, walk } from "../lib/fs.js";
import { itemTargets, resolveNames } from "../lib/plan.js";
import { readTsconfigAlias } from "../lib/project.js";
import { confirm, fileList, p, pc, type Ctx } from "../lib/ui.js";
import { registryFor } from "./add.js";
import { sourceConfig } from "./diff.js";

export interface RemoveOptions {
  cwd: string;
  names: string[];
  dryRun?: boolean;
  registry?: string;
}

export interface RemoveResult {
  removed: string[];
  /** File còn được import ở nơi khác → giữ lại: file → các file import nó. */
  kept: Record<string, string[]>;
}

const SOURCE = /\.(m?[jt]sx?)$/;
const IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)["']([^"']+)["']/g;
const stripExt = (file: string) => file.replace(/\.(m?[jt]sx?)$/, "").replace(/\/index$/, "");

/** Đường dẫn import → file trong dự án (posix, tương đối, không đuôi), hoặc null nếu là gói npm. */
function resolveSpec(spec: string, fromFile: string, config: SourceConfig, alias: { prefix: string; dir: string } | null): string | null {
  if (spec.startsWith(".")) return stripExt(path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec)));
  for (const key of ["ui", "lib"] as const) {
    const a = config.aliases?.[key];
    if (a && (spec === a || spec.startsWith(`${a}/`))) return stripExt(path.posix.join(config.paths[key], spec.slice(a.length)));
  }
  if (alias && spec.startsWith(`${alias.prefix}/`)) return stripExt(path.posix.join(alias.dir, spec.slice(alias.prefix.length + 1)));
  return null;
}

/** Xoá file đã chép của component, trừ file mà mã khác trong dự án còn import. */
export async function remove(opts: RemoveOptions, ctx: Ctx): Promise<RemoveResult> {
  if (!opts.names.length) throw new CliError("Name the components to remove.", "Example: yugen remove data-grid");
  const config = sourceConfig(opts.cwd, "remove");
  const registry = registryFor(opts.cwd, opts.registry, config);
  const index = await registry.index();
  const names = resolveNames(index, opts.names);
  const items = await Promise.all(names.map((n) => registry.item(n)));

  const candidates = items.flatMap((i) => itemTargets(i, config)).filter((t) => exists(path.join(opts.cwd, t)));
  if (!candidates.length) {
    p.log.info(`Not in this project: ${names.join(", ")}`);
    return { removed: [], kept: {} };
  }

  // Ai import file nào: quét mã nguồn của dự án, bỏ chính các file sắp xoá.
  const removing = new Set(candidates);
  const byKey = new Map(candidates.map((t) => [stripExt(t), t]));
  const alias = readTsconfigAlias(opts.cwd);
  const kept: Record<string, string[]> = {};
  for (const abs of walk(opts.cwd, SOURCE, 8)) {
    const file = toPosix(path.relative(opts.cwd, abs));
    if (removing.has(file)) continue;
    for (const m of readText(abs).matchAll(IMPORT)) {
      const hit = byKey.get(resolveSpec(m[1], file, config, alias) ?? "");
      if (hit) (kept[hit] ??= []).push(file);
    }
  }
  const removed = candidates.filter((t) => !kept[t]);

  for (const [file, users] of Object.entries(kept))
    p.log.warn(`Keeping ${file}: still imported by\n${fileList([...new Set(users)])}`);
  if (!removed.length) return { removed, kept };
  p.log.info(`${opts.dryRun ? "Would delete" : "Deleting"} ${removed.length} file(s)\n${fileList(removed)}`);
  if (opts.dryRun) {
    p.log.info(pc.dim("Dry run: nothing deleted."));
    return { removed: [], kept };
  }
  if (!(await confirm(ctx, "Delete these files?", true))) return { removed: [], kept };

  for (const target of removed) {
    fs.rmSync(path.join(opts.cwd, target));
    // Gỡ thư mục component đã rỗng, không đi lên quá thư mục ui / lib.
    const stop = new Set([config.paths.ui, config.paths.lib].map((d) => path.join(opts.cwd, d)));
    for (let dir = path.dirname(path.join(opts.cwd, target)); !stop.has(dir) && dir.startsWith(opts.cwd); dir = path.dirname(dir)) {
      if (fs.readdirSync(dir).length) break;
      fs.rmdirSync(dir);
    }
  }
  p.log.success(`Removed ${removed.length} file(s). npm dependencies stay installed; remove the ones you no longer use by hand.`);
  return { removed, kept };
}
