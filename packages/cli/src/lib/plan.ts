import path from "node:path";
import type { SourceConfig } from "./config.js";
import { CliError } from "./errors.js";
import { exists, readText, sameText } from "./fs.js";
import { findItem, resolveTree, suggest, type Registry, type RegistryIndex, type RegistryItem } from "./registry.js";
import { targetPath, transformFile } from "./transform.js";

/** Một file của registry so với bản trong dự án. */
export interface FilePlan {
  target: string;
  item: string;
  /** same: giống registry · changed: khác (registry mới hơn hoặc đã sửa tay) · missing: chưa có trong dự án. */
  status: "same" | "changed" | "missing";
  local: string | null;
  remote: string;
}

const installable = (i: RegistryItem) => i.type === "registry:ui" || i.type === "registry:lib";

/** File đích của item theo cấu hình dự án (bỏ file không chép vào ui / lib như theme). */
export const itemTargets = (item: RegistryItem, config: SourceConfig) =>
  item.files.map((f) => targetPath(f, config.paths)).filter((t): t is string => !!t);

/** Item có trong dự án: mọi file đích của nó đều tồn tại (đọc từ index, không tải nội dung). */
export function installedItems(index: RegistryIndex, cwd: string, config: SourceConfig): string[] {
  return index.items
    .filter(installable)
    .filter((i) => {
      const targets = itemTargets(i, config);
      return targets.length > 0 && targets.every((t) => exists(path.join(cwd, t)));
    })
    .map((i) => i.name);
}

/** Tên người dùng gõ → tên item; sai thì báo kèm gợi ý. */
export function resolveNames(index: RegistryIndex, inputs: string[]): string[] {
  return inputs.map((input) => {
    const item = findItem(index, input);
    if (item && item.name !== "all") return item.name;
    const close = suggest(index, input);
    throw new CliError(`Unknown component "${input}".`, close.length ? `Did you mean ${close.join(", ")}? See \`yugen list\`.` : "See `yugen list`.");
  });
}

/**
 * Tên người dùng gõ (rỗng = tất cả) → item đã có trong dự án. Item chưa cài được báo qua `onMissing` (gợi ý `yugen add`):
 * diff / update không cài component mới.
 */
export function namesInProject(index: RegistryIndex, inputs: string[], cwd: string, config: SourceConfig, onMissing: (names: string[]) => void) {
  const installed = installedItems(index, cwd, config);
  if (!inputs.length) return installed;
  const names = resolveNames(index, inputs);
  const missing = names.filter((n) => !installed.includes(n));
  if (missing.length) onMissing(missing);
  return names.filter((n) => installed.includes(n));
}

/** So từng file của `names` và mọi phụ thuộc registry của chúng với bản trong dự án. */
export async function planFiles(names: string[], cwd: string, config: SourceConfig, registry: Registry): Promise<FilePlan[]> {
  const items = await resolveTree(registry, names);
  const plans = new Map<string, FilePlan>();
  for (const item of items)
    for (const file of item.files) {
      const target = targetPath(file, config.paths);
      if (!target || plans.has(target)) continue;
      const remote = transformFile(file.content ?? "", target, config);
      const abs = path.join(cwd, target);
      const local = exists(abs) ? readText(abs) : null;
      plans.set(target, { target, item: item.name, status: local === null ? "missing" : sameText(local, remote) ? "same" : "changed", local, remote });
    }
  return [...plans.values()].sort((a, b) => a.target.localeCompare(b.target));
}
