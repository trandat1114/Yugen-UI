import path from "node:path";
import { loadConfig, type YugenConfig } from "../lib/config.js";
import { exists } from "../lib/fs.js";
import { isComponent, itemName } from "../lib/registry.js";
import { pc } from "../lib/ui.js";
import { registryFor } from "./add.js";

export interface ListOptions {
  cwd: string;
  query?: string;
  json?: boolean;
  registry?: string;
}

/** In thẳng ra stdout (không khung clack) để dễ pipe: `yugen list --json | jq`. */
export async function list(opts: ListOptions) {
  let config: YugenConfig | null = null;
  try {
    config = loadConfig(opts.cwd);
  } catch {
    // yugen.json hỏng không cản việc xem danh sách.
  }
  const index = await registryFor(opts.cwd, opts.registry, config).index();
  const q = opts.query?.toLowerCase();
  const items = index.items
    .filter(isComponent)
    .filter((i) => !q || i.name.includes(q) || (i.title ?? "").toLowerCase().includes(q));
  const ui = config?.mode === "source" ? config.paths?.ui : undefined;
  const installed = (title = "") => !!ui && !!title && exists(path.join(opts.cwd, ui, title));

  if (opts.json) {
    const rows = items.map((i) => ({
      name: i.name,
      title: i.title,
      installed: installed(i.title),
      dependencies: i.dependencies ?? [],
      registryDependencies: (i.registryDependencies ?? []).map(itemName),
    }));
    console.log(JSON.stringify(rows, null, 2));
    return rows;
  }
  if (!items.length) {
    console.log(`No components match "${opts.query}".`);
    return [];
  }
  const width = Math.max(...items.map((i) => i.name.length));
  for (const i of items) console.log(`${installed(i.title) ? pc.green("✓") : " "} ${i.name.padEnd(width)}  ${pc.dim(i.title ?? "")}`);
  console.log(pc.dim(`\n${items.length} component${items.length === 1 ? "" : "s"} · yugen add <name>`));
  return items;
}
