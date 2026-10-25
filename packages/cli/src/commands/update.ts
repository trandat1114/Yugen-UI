import { namesInProject, planFiles } from "../lib/plan.js";
import { confirm, fileList, p, pc, type Ctx } from "../lib/ui.js";
import { installItems, registryFor, type InstallResult } from "./add.js";
import { printDiff, sourceConfig } from "./diff.js";

export interface UpdateOptions {
  cwd: string;
  /** Rỗng: mọi component đã có trong dự án. */
  names: string[];
  dryRun?: boolean;
  registry?: string;
  /** false: chỉ in lệnh cài npm dependencies mới. */
  install?: boolean;
}

/** Áp bản registry cho component đã chép: xem trước diff, hỏi lại, rồi ghi (kể cả file / phụ thuộc mới). */
export async function update(opts: UpdateOptions, ctx: Ctx): Promise<InstallResult | null> {
  const config = sourceConfig(opts.cwd, "update");
  const registry = registryFor(opts.cwd, opts.registry, config);
  const index = await registry.index();
  const names = namesInProject(index, opts.names, opts.cwd, config, (missing) =>
    p.log.warn(`Not in this project: ${missing.join(", ")}. Add with \`yugen add ${missing.join(" ")}\`.`),
  );
  if (!names.length) {
    if (!opts.names.length) p.log.info("No Yugen components found in this project. Add one with `yugen add button`.");
    return null;
  }

  const files = await planFiles(names, opts.cwd, config, registry);
  const changed = files.filter((f) => f.status === "changed");
  const missing = files.filter((f) => f.status === "missing");
  if (!changed.length && !missing.length) {
    p.log.success(`Up to date: ${names.join(", ")}`);
    return null;
  }

  for (const f of changed) printDiff(f);
  if (changed.length) p.log.warn(`Will replace ${changed.length} file(s); local edits in them are lost\n${fileList(changed.map((f) => f.target))}`);
  if (missing.length) p.log.info(`Will add ${missing.length} new file(s)\n${fileList(missing.map((f) => f.target))}`);

  if (opts.dryRun) {
    p.log.info(pc.dim("Dry run: nothing written."));
    return null;
  }
  if (!(await confirm(ctx, "Apply these changes?", true))) {
    p.log.info("Nothing changed.");
    return null;
  }
  return installItems(names, { cwd: opts.cwd, config, registry, overwrite: true, install: opts.install });
}
