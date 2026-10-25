import { loadConfig, type SourceConfig } from "../lib/config.js";
import { unifiedDiff } from "../lib/diff.js";
import { CliError } from "../lib/errors.js";
import { namesInProject, planFiles, type FilePlan } from "../lib/plan.js";
import { fileList, p, pc } from "../lib/ui.js";
import { registryFor } from "./add.js";

export interface DiffOptions {
  cwd: string;
  /** Rỗng: mọi component đã có trong dự án. */
  names: string[];
  registry?: string;
}

export interface DiffResult {
  files: FilePlan[];
  changed: FilePlan[];
}

/** Đọc cấu hình mode source; mode package không có mã nguồn để so. */
export function sourceConfig(cwd: string, command: string): SourceConfig {
  const config = loadConfig(cwd);
  if (!config) throw new CliError("yugen.json not found.", "Run `yugen init --mode source` first.");
  if (config.mode !== "source")
    throw new CliError(`\`yugen ${command}\` works on copied source (source mode).`, "Package mode: update with your package manager, e.g. npm i yugen-ui@latest.");
  return config as SourceConfig;
}

/** Tô màu một dòng của diff unified. */
export const colorDiffLine = (line: string) =>
  line.startsWith("@@") ? pc.cyan(line) : line.startsWith("+") ? pc.green(line) : line.startsWith("-") ? pc.red(line) : pc.dim(line);

export function printDiff(plan: FilePlan) {
  const d = unifiedDiff(plan.local ?? "", plan.remote, { from: `${plan.target} (local)`, to: `${plan.target} (registry)` });
  console.log(d.lines.map(colorDiffLine).join("\n"));
  return d;
}

/** In diff giữa mã đã chép và registry, không sửa gì. */
export async function diff(opts: DiffOptions): Promise<DiffResult> {
  const config = sourceConfig(opts.cwd, "diff");
  const registry = registryFor(opts.cwd, opts.registry, config);
  const index = await registry.index();
  const names = namesInProject(index, opts.names, opts.cwd, config, (missing) =>
    p.log.warn(`Not in this project: ${missing.join(", ")}. Add with \`yugen add ${missing.join(" ")}\`.`),
  );
  if (!names.length) {
    if (!opts.names.length) p.log.info("No Yugen components found in this project. Add one with `yugen add button`.");
    return { files: [], changed: [] };
  }

  const files = (await planFiles(names, opts.cwd, config, registry)).filter((f) => f.status !== "missing");
  const changed = files.filter((f) => f.status === "changed");
  for (const f of changed) printDiff(f);
  if (changed.length)
    p.log.warn(
      `${changed.length === 1 ? "1 file differs" : `${changed.length} files differ`} from the registry\n${fileList(changed.map((f) => f.target))}\n` +
        pc.dim("`yugen update` applies the registry version (local edits in these files are replaced)."),
    );
  else p.log.success(`${files.length} file${files.length === 1 ? "" : "s"} match the registry.`);
  return { files, changed };
}
