/**
 * Phát hiện lệch giữa bảng props trong docs (`props: PropDoc[]` của src/docs/registry) và props TypeScript thật.
 *  - Lỗi (exit 1): tên được document nhưng không tồn tại trên component (prop đổi tên / bị xoá).
 *  - Cảnh báo (không fail): prop riêng (khai báo trong src/components/ui) chưa có trong bảng props.
 *
 *   vite-node scripts/check-props.ts
 */
import path from "node:path";
import ts from "typescript";
import { loadAllComponentDocs } from "../src/docs/registry";

const COMPONENTS = await loadAllComponentDocs();

/**
 * Ngoại lệ có chủ đích — mỗi mục phải có lý do.
 * Không có `names`/`main` = bỏ qua cả trang; `names` = chỉ bỏ qua các tên đó (viết đúng như trong bảng, kể cả tiền tố);
 * `main` = kiểm tên không tiền tố với export này thay vì tên đầu tiên trong importCode.
 */
const IGNORE: Record<string, { names?: string[]; main?: string; reason: string }> = {
  formvalidation: { reason: "trang công thức — bảng mô tả API react-hook-form / zod, không phải props của một component" },
  toast: { main: "toast", reason: "tên không tiền tố là tuỳ chọn của toast() / dispatchToast; props Toaster đã ghi tiền tố Toaster." },
};

/** Tên luôn hợp lệ trong bảng / không cần cảnh báo khi thiếu. */
const ALWAYS_OK = new Set(["className", "children", "ref", "key", "style"]);
const NO_WARN = new Set([...ALWAYS_OK, "asChild"]);

const root = path.resolve(import.meta.dirname, "..");
const norm = (p: string) => p.split(path.sep).join("/").toLowerCase();
const uiDir = norm(path.join(root, "src", "components", "ui")) + "/";

const config = ts.readConfigFile(path.join(root, "tsconfig.app.json"), ts.sys.readFile);
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const indexPath = path.join(root, "src", "components", "ui", "index.ts");
const program = ts.createProgram([indexPath], { ...options, noEmit: true });
const checker = program.getTypeChecker();
const indexSf = program.getSourceFile(indexPath);
const moduleSym = indexSf && checker.getSymbolAtLocation(indexSf);
if (!indexSf || !moduleSym) throw new Error("Không đọc được src/components/ui/index.ts");

const exportsMap = new Map<string, ts.Symbol>();
for (const s of checker.getExportsOfModule(moduleSym)) {
  exportsMap.set(s.name, s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s);
}

/** name → own? (khai báo trong src/components/ui) */
type Api = Map<string, boolean>;

function collect(t: ts.Type, out: Api, seen = new Set<ts.Type>()) {
  if (seen.has(t)) return;
  seen.add(t);
  if (t.isUnion()) return t.types.forEach((x) => collect(x, out, seen));
  if (t.flags & ts.TypeFlags.TypeParameter) {
    const c = checker.getBaseConstraintOfType(t);
    if (c) collect(c, out, seen);
    return;
  }
  if (!(t.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection))) return;
  for (const p of checker.getPropertiesOfType(t)) {
    const own = (p.declarations ?? []).some((d) => norm(d.getSourceFile().fileName).startsWith(uiDir));
    out.set(p.name, (out.get(p.name) ?? false) || own);
  }
}

const apiCache = new Map<string, { api: Api; params: Map<string, ts.Type> } | null>();
/** Props của component (tham số đầu của call signature) / tuỳ chọn + giá trị trả về của hàm / thuộc tính của type. */
function apiOf(name: string) {
  if (apiCache.has(name)) return apiCache.get(name)!;
  const sym = exportsMap.get(name);
  let result: { api: Api; params: Map<string, ts.Type> } | null = null;
  if (sym) {
    const api: Api = new Map();
    const params = new Map<string, ts.Type>();
    if (sym.flags & ts.SymbolFlags.Value) {
      const type = checker.getTypeOfSymbolAtLocation(sym, sym.valueDeclaration ?? indexSf!);
      const sigs = type.getCallSignatures();
      const isComponent = /^[A-Z]/.test(name);
      for (const sig of sigs) {
        const ps = sig.getParameters();
        (isComponent ? ps.slice(0, 1) : ps).forEach((p) => {
          const pt = checker.getTypeOfSymbolAtLocation(p, indexSf!);
          collect(pt, api);
          if (!isComponent) params.set(p.name, pt);
        });
        if (!isComponent) collect(sig.getReturnType(), api);
      }
      if (sigs.length === 0) collect(type, api);
      for (const p of params.keys()) if (!api.has(p)) api.set(p, false);
    } else if (sym.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
      collect(checker.getDeclaredTypeOfSymbol(sym), api);
    }
    result = { api, params };
  }
  apiCache.set(name, result);
  return result;
}

interface Problem {
  slug: string;
  entry: string;
  target: string;
  name: string;
}
const errors: Problem[] = [];
const documented = new Map<string, Set<string>>();
let pages = 0;
let checkedNames = 0;

const IDENT = /^(?:([A-Za-z_$*][\w$]*)\.)?([A-Za-z_$][\w$]*)$/;

/** Tiền tố PascalCase = component / type export; chữ thường = tham số của hàm chính (vd. options.delay); khác = không kiểm được. */
function resolvePrefix(main: string, pre: string): string | null {
  if (/^[A-Z]/.test(pre)) return pre;
  const pt = apiOf(main)!.params.get(pre);
  if (!pt) return null;
  const key = `${main}#${pre}`;
  if (!apiCache.has(key)) {
    const api: Api = new Map();
    collect(pt, api);
    apiCache.set(key, { api, params: new Map() });
  }
  return key;
}

for (const doc of COMPONENTS) {
  const rule = IGNORE[doc.slug];
  if (rule && !rule.names && !rule.main) continue;
  const imported = new Set(
    [...doc.importCode.matchAll(/import\s*\{([^}]*)\}/g)].flatMap((m) =>
      m[1].split(",").map((s) => s.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()!).filter(Boolean),
    ),
  );
  const main =
    rule?.main ??
    doc.importCode
      .match(/import\s*\{([^}]*)\}\s*from\s*["']@\/components\/ui["']/)?.[1]
      .split(",")
      .map((s) => s.trim())
      .find((s) => s && !s.startsWith("type "))
      ?.split(/\s+as\s+/)[0];
  if (!main || !apiOf(main)) {
    errors.push({ slug: doc.slug, entry: doc.importCode.split("\n")[0], target: main ?? "?", name: "(importCode)" });
    continue;
  }
  pages++;

  for (const prop of doc.props) {
    if (/[()]/.test(prop.name)) continue; // chữ ký hàm / mô tả — không kiểm được
    // Tiền tố áp dụng cho các tên sau nó trong cùng dòng; "A / B.x" = cả A.x và B.x. null = bỏ qua phần còn lại.
    let targets: string[] | null = [main];
    let pending: string[] = [];
    for (const token of prop.name.split(/\s*[/,]\s*/)) {
      const raw = token.trim().replace(/(?:…|\.\.\.)$/, "");
      // ...props, văn xuôi, aria-* / data-*
      if (!raw || /^(?:…|\.\.\.)/.test(raw) || /\s|-/.test(raw) || rule?.names?.includes(raw)) continue;
      const m = raw.match(IDENT);
      if (!m) continue;
      const [, pre, name] = m;
      if (pre === "*") {
        targets = null;
        continue;
      }
      if (pre !== undefined) {
        const resolved = resolvePrefix(main, pre);
        targets = resolved ? [...(/^[A-Z]/.test(pre) ? pending : []), resolved] : null;
        pending = [];
      } else if (/^[A-Z]/.test(name) && (exportsMap.has(name) || imported.has(name)) && !apiOf(main)!.api.has(name)) {
        pending.push(name); // sub-component / export được nhắc tên
        continue;
      }
      for (const target of targets ?? []) {
        const info = apiOf(target);
        checkedNames++;
        if (!info) {
          errors.push({ slug: doc.slug, entry: prop.name, target, name: "(không phải export của @/components/ui)" });
          continue;
        }
        if (!documented.has(target)) documented.set(target, new Set());
        documented.get(target)!.add(name);
        if (info.api.has(name) || ALWAYS_OK.has(name)) continue;
        // Tên trơn trỏ tới một export / tên được import (hàm tiện ích, hằng số) — không phải prop.
        if (pre === undefined && (exportsMap.has(name) || imported.has(name))) continue;
        errors.push({ slug: doc.slug, entry: prop.name, target, name });
      }
    }
  }
}

const warnings: string[] = [];
for (const [target, names] of documented) {
  if (target.includes("#")) continue;
  const api = apiOf(target)!.api;
  const missing = [...api].filter(([n, own]) => own && !names.has(n) && !NO_WARN.has(n) && !n.includes("-")).map(([n]) => n);
  if (missing.length) warnings.push(`⚠ ${target}: ${missing.join(", ")}`);
}

if (warnings.length) console.log(`Props riêng chưa có trong bảng docs (cảnh báo):\n${warnings.join("\n")}\n`);

if (errors.length) {
  const rows = errors.map((e) => [e.slug, e.target, e.name, e.entry]);
  const head = ["trang", "component", "tên không tồn tại", "dòng trong bảng props"];
  const w = head.map((h, i) => Math.min(48, Math.max(h.length, ...rows.map((r) => r[i].length))));
  const fmt = (r: string[]) => r.map((c, i) => c.slice(0, 48).padEnd(w[i])).join(" │ ");
  console.error(`✗ ${fmt(head)}\n  ${w.map((n) => "─".repeat(n)).join("─┼─")}\n${rows.map((r) => `  ${fmt(r)}`).join("\n")}`);
  console.error(`\ncheck-props: ${errors.length} tên trong bảng props không khớp API thật.`);
  process.exit(1);
}
console.log(
  `check-props: OK — ${checkedNames} tên props của ${pages} trang khớp API thật; ${warnings.length} component còn prop riêng chưa document; ${Object.keys(IGNORE).length} ngoại lệ.`,
);
