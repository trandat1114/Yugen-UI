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
import ts from "typescript";

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

/** Tên export có giá trị (component, hàm, hằng) của `src/components/ui/index.ts` → thư mục chứa khai báo của nó. */
export function exportFolders(root) {
  const uiDir = path.join(root, "src", "components", "ui");
  const indexPath = path.join(uiDir, "index.ts");
  const config = ts.readConfigFile(path.join(root, "tsconfig.app.json"), ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const program = ts.createProgram([indexPath], { ...options, noEmit: true });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(indexPath);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error("css-sources: không đọc được src/components/ui/index.ts");
  const out = {};
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    // Kiểu (interface, type) không có CSS.
    if (!(symbol.flags & ts.SymbolFlags.Value)) continue;
    const declaration = symbol.declarations?.[0];
    if (!declaration) continue;
    const rel = path.relative(uiDir, declaration.getSourceFile().fileName).split(path.sep);
    if (rel.length > 1 && rel[0] !== "..") out[exported.name] = rel[0];
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
