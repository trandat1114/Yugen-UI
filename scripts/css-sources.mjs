/**
 * CSS theo component (#169). `theme.css` cho Tailwind quét mọi component của gói, nên app nào cũng mang CSS của mọi
 * component. `theme-core.css` bỏ dòng quét đó; app thêm `sources/<Thư mục>.css` cho từng component mình dùng.
 *
 *   sourceFiles(uiDir)    thư mục → các đường dẫn cần quét (tương đối với components/ui, đuôi .js như trong dist): cả thư
 *                         mục của chính nó, cộng từng file của component khác mà nó import (bắc cầu, theo file chứ không
 *                         theo thư mục: dùng `YugenProvider/context` không kéo theo Tooltip mà `YugenProvider.tsx` dùng).
 *   exportFolders(root)   tên export của gói → thư mục chứa nó (`NavItem` → `Nav`), cho CLI đọc import của app.
 *
 * build-css.mjs ghi dist/sources/*.css và dist/sources/index.json từ hai hàm này.
 */
import fs from "node:fs";
import path from "node:path";
import { parseSync } from "vite";

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
const SOURCE_FILE = /\.(?:ts|tsx)$/;
const TEST_FILE = /\.test\.(?:ts|tsx)$/;
const posix = (p) => p.split(path.sep).join("/");

/** Mọi thư mục trong components/ui (kể cả `_internal`, vốn chỉ là phụ thuộc). */
export function componentFolders(uiDir) {
  return fs
    .readdirSync(uiDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

/** File mã nguồn (không gồm test) của một thư mục, đường dẫn tuyệt đối. */
function filesOf(uiDir, folder) {
  const dir = path.join(uiDir, folder);
  return fs
    .readdirSync(dir)
    .filter((f) => SOURCE_FILE.test(f) && !TEST_FILE.test(f) && !f.endsWith(".d.ts"))
    .map((f) => path.join(dir, f));
}

/** Đường dẫn import → file .ts / .tsx trong components/ui, hoặc undefined (npm, src/lib…). */
function resolveImport(uiDir, from, spec) {
  let base;
  if (spec.startsWith("@/components/ui/")) base = path.join(uiDir, spec.slice("@/components/ui/".length));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return undefined;
  if (path.relative(uiDir, base).startsWith("..")) return undefined;
  for (const candidate of [`${base}.tsx`, `${base}.ts`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

/** File → các file trong components/ui mà nó import trực tiếp. */
function importsOf(uiDir, file) {
  const code = fs.readFileSync(file, "utf8");
  const out = new Set();
  for (const m of code.matchAll(IMPORT_RE)) {
    const target = resolveImport(uiDir, file, m[1] ?? m[2]);
    if (target) out.add(target);
  }
  return out;
}

/** Thư mục → các đường dẫn cần quét, đường dẫn đầu là chính thư mục đó. */
export function sourceFiles(uiDir) {
  const cache = new Map();
  const edges = (file) => {
    if (!cache.has(file)) cache.set(file, importsOf(uiDir, file));
    return cache.get(file);
  };
  const result = new Map();
  for (const folder of componentFolders(uiDir)) {
    const own = path.join(uiDir, folder);
    const seen = new Set();
    const stack = filesOf(uiDir, folder);
    while (stack.length) {
      const file = stack.pop();
      if (seen.has(file)) continue;
      seen.add(file);
      stack.push(...edges(file));
    }
    const others = [...seen]
      .filter((f) => path.dirname(f) !== own)
      .map((f) => posix(path.relative(uiDir, f)).replace(/\.tsx?$/, ".js"))
      .sort();
    result.set(folder, [folder, ...others]);
  }
  return result;
}

/**
 * Đọc tĩnh một module (parser Oxc đi kèm Vite): tên khai báo giá trị ở cấp file, import có tên, export (khai báo / `export { }`
 * / re-export / `export *`). Bỏ qua mọi thứ chỉ là type.
 */
function moduleInfo(cache, file) {
  if (cache.has(file)) return cache.get(file);
  const { program } = parseSync(file, fs.readFileSync(file, "utf8"), { lang: file.endsWith(".tsx") ? "tsx" : "ts" });
  const info = { values: new Set(), imports: new Map(), exports: new Map(), stars: [] };
  const nameOf = (node) => (node.type === "Identifier" ? node.name : String(node.value));
  const declared = (decl) => {
    if (decl?.type === "VariableDeclaration") return decl.declarations.flatMap((d) => (d.id.type === "Identifier" ? [d.id.name] : []));
    if (["FunctionDeclaration", "ClassDeclaration", "TSEnumDeclaration"].includes(decl?.type) && decl.id) return [decl.id.name];
    return [];
  };
  for (const stmt of program.body) {
    if (stmt.type === "ImportDeclaration") {
      if (stmt.importKind === "type") continue;
      for (const spec of stmt.specifiers ?? []) {
        if (spec.type !== "ImportSpecifier" || spec.importKind === "type") continue;
        info.imports.set(spec.local.name, { spec: stmt.source.value, name: nameOf(spec.imported) });
      }
    } else if (stmt.type === "ExportAllDeclaration") {
      if (stmt.exportKind !== "type" && !stmt.exported) info.stars.push(stmt.source.value);
    } else if (stmt.type === "ExportNamedDeclaration") {
      if (stmt.exportKind === "type") continue;
      for (const name of declared(stmt.declaration)) {
        info.values.add(name);
        info.exports.set(name, { local: name });
      }
      for (const spec of stmt.specifiers) {
        if (spec.exportKind === "type") continue;
        const target = stmt.source ? { spec: stmt.source.value, name: nameOf(spec.local) } : { local: nameOf(spec.local) };
        info.exports.set(nameOf(spec.exported), target);
      }
    } else {
      for (const name of declared(stmt)) info.values.add(name);
    }
  }
  cache.set(file, info);
  return info;
}

/** Tên export có giá trị (component, hàm, hằng) của `src/components/ui/index.ts` → thư mục chứa khai báo của nó. */
export function exportFolders(root) {
  const uiDir = path.join(root, "src", "components", "ui");
  const cache = new Map();
  const resolved = new Map();
  const resolveFile = (from, spec) => {
    const base = spec.startsWith("@/") ? path.join(root, "src", spec.slice(2)) : spec.startsWith(".") ? path.resolve(path.dirname(from), spec) : null;
    if (!base) return undefined;
    if (!resolved.has(base))
      resolved.set(base, [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")].find((f) => fs.existsSync(f)));
    return resolved.get(base);
  };
  const declarations = new Map();
  /** File khai báo giá trị mà `name` (export của `file`) trỏ tới; undefined nếu chỉ là type hoặc nằm ngoài src. */
  const declarationOf = (file, name, seen = new Set()) => {
    const key = `${file}#${name}`;
    if (declarations.has(key)) return declarations.get(key);
    if (seen.has(key)) return undefined;
    seen.add(key);
    const found = lookup(file, name, seen);
    declarations.set(key, found);
    return found;
  };
  const lookup = (file, name, seen) => {
    const info = moduleInfo(cache, file);
    const follow = (spec, imported) => {
      const target = resolveFile(file, spec);
      return target && declarationOf(target, imported, seen);
    };
    const entry = info.exports.get(name);
    if (entry?.local !== undefined) {
      if (info.values.has(entry.local)) return file;
      const imported = info.imports.get(entry.local);
      return imported && follow(imported.spec, imported.name);
    }
    if (entry) return follow(entry.spec, entry.name);
    for (const spec of info.stars) {
      const found = follow(spec, name);
      if (found) return found;
    }
    return undefined;
  };
  /** Mọi tên mà `file` export (kể cả qua `export *`). */
  const exportedNames = (file, seen = new Set()) => {
    if (seen.has(file)) return [];
    seen.add(file);
    const info = moduleInfo(cache, file);
    const stars = info.stars.flatMap((spec) => {
      const target = resolveFile(file, spec);
      return target ? exportedNames(target, seen) : [];
    });
    return [...info.exports.keys(), ...stars.filter((n) => n !== "default")];
  };

  const indexPath = path.join(uiDir, "index.ts");
  const out = {};
  for (const name of new Set(exportedNames(indexPath))) {
    const file = declarationOf(indexPath, name);
    if (!file) continue;
    const rel = path.relative(uiDir, file).split(path.sep);
    if (rel.length > 1 && rel[0] !== "..") out[name] = rel[0];
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
