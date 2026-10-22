import fs from "node:fs";
import path from "node:path";
import { CliError } from "./errors.js";

/** Định dạng do scripts/build-registry.mjs sinh (https://ui.shadcn.com/schema/registry-item.json). */
export interface RegistryFile {
  path: string;
  type: string;
  target?: string;
  content?: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
  docs?: string;
}

export interface RegistryIndex {
  name: string;
  homepage?: string;
  items: RegistryItem[];
}

export const isUrl = (s: string) => /^https?:\/\//i.test(s);

/** URL giữ nguyên (bỏ "/" cuối); đường dẫn thư mục tính từ `cwd`. */
export const resolveRegistry = (value: string, cwd: string) => (isUrl(value) ? value.replace(/\/+$/, "") : path.resolve(cwd, value));

/** Tên item từ registryDependencies: "https://…/r/button.json" → "button". */
export const itemName = (dep: string) => dep.replace(/\.json$/, "").split("/").pop() ?? dep;

/** "@radix-ui/react-slot@^1.1.1" → "@radix-ui/react-slot". */
export function depName(spec: string) {
  const at = spec.lastIndexOf("@");
  return at > 0 ? spec.slice(0, at) : spec;
}

/** Đọc registry qua HTTP (site docs) hoặc từ thư mục local (public/r sau `npm run registry`). */
export class Registry {
  private cache = new Map<string, Promise<unknown>>();

  constructor(readonly base: string) {}

  index() {
    return this.load<RegistryIndex>("registry");
  }

  item(name: string) {
    return this.load<RegistryItem>(name);
  }

  private load<T>(name: string): Promise<T> {
    let pending = this.cache.get(name);
    if (!pending) {
      pending = this.read(name);
      this.cache.set(name, pending);
    }
    return pending as Promise<T>;
  }

  private async read(name: string): Promise<unknown> {
    if (!isUrl(this.base)) {
      const file = path.join(this.base, `${name}.json`);
      if (!fs.existsSync(file)) throw new CliError(`Registry item "${name}" not found in ${this.base}`);
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
    const url = `${this.base}/${name}.json`;
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      throw new CliError(`Cannot reach the registry (${url}).`, "Check your connection or pass --registry <url|dir>.");
    }
    if (res.status === 404) throw new CliError(`Registry item "${name}" not found (${url}).`);
    if (!res.ok) throw new CliError(`Registry request failed: ${res.status} ${res.statusText} (${url}).`);
    return res.json();
  }
}

/** Item yêu cầu + mọi registryDependencies (BFS, tải song song từng tầng), mỗi item một lần. */
export async function resolveTree(registry: Registry, names: string[]): Promise<RegistryItem[]> {
  const seen = new Set<string>();
  const out: RegistryItem[] = [];
  let frontier = [...new Set(names)];
  while (frontier.length) {
    frontier.forEach((n) => seen.add(n));
    const items = await Promise.all(frontier.map((n) => registry.item(n)));
    out.push(...items);
    frontier = [...new Set(items.flatMap((i) => (i.registryDependencies ?? []).map(itemName)))].filter((n) => !seen.has(n));
  }
  return out;
}

/** npm dependencies của các item, mỗi gói một lần. */
export function npmDependencies(items: RegistryItem[]): string[] {
  const byName = new Map<string, string>();
  for (const spec of items.flatMap((i) => i.dependencies ?? [])) if (!byName.has(depName(spec))) byName.set(depName(spec), spec);
  return [...byName.values()].sort();
}

/** Component người dùng thấy trong `yugen list` / chọn trong `yugen add`. */
export const isComponent = (i: RegistryItem) => i.type === "registry:ui" && !i.name.startsWith("_");

const addable = (i: RegistryItem) => i.type === "registry:ui" || i.type === "registry:lib" || i.name === "all";
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** "data-grid", "DataGrid", "datagrid" → item data-grid. */
export function findItem(index: RegistryIndex, input: string): RegistryItem | null {
  const n = norm(input);
  return index.items.filter(addable).find((i) => norm(i.name) === n || norm(i.title ?? "") === n) ?? null;
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** Tối đa 3 tên gần giống `input` (gõ sai, thiếu chữ). */
export function suggest(index: RegistryIndex, input: string): string[] {
  const n = norm(input);
  return index.items
    .filter(isComponent)
    .map((i) => ({ name: i.name, d: norm(i.name).includes(n) ? 0 : distance(n, norm(i.name)) }))
    .filter((x) => x.d <= Math.max(2, Math.floor(n.length / 3)))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((x) => x.name);
}
