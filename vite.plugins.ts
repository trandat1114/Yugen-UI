import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseSync, type ESTree, type Plugin, type ResolvedConfig, type ViteDevServer } from "vite";
import { FEEDS, localizeFeed, NEWS_DIR, readNews } from "./scripts/news.mjs";

/**
 * Đọc mã TS / TSX bằng parser Oxc (native, đi kèm Vite 8) — không chạy file, không cần TypeScript compiler API.
 * AST dạng ESTree; `start` / `end` tính theo UTF-16 nên dùng thẳng với `code.slice()`.
 */
function parseModule(fileName: string, code: string) {
  return parseSync(fileName, code, { lang: fileName.endsWith(".tsx") ? "tsx" : "ts" });
}

type Node = ESTree.Node;
type Expr = ESTree.Expression;

/** Khai báo biến ở cấp file, kèm cờ `export` (`const x = …` và `export const x = …`). */
function topLevelVariables(program: ESTree.Program): { decl: ESTree.VariableDeclarator; exported: boolean }[] {
  return program.body.flatMap((stmt) => {
    const exported = stmt.type === "ExportNamedDeclaration";
    const decl = exported ? stmt.declaration : stmt;
    return decl?.type === "VariableDeclaration" ? decl.declarations.map((d) => ({ decl: d, exported })) : [];
  });
}

/** Tên khoá của một thuộc tính object (`a: …`, `"a": …`); undefined nếu là khoá tính toán. */
function propertyKey(prop: ESTree.ObjectProperty): string | undefined {
  if (prop.computed) return undefined;
  if (prop.key.type === "Identifier") return prop.key.name;
  if (prop.key.type === "Literal" && typeof prop.key.value === "string") return prop.key.value;
  return undefined;
}

/** Bỏ lớp bọc không đổi giá trị: `( … )`, `as`, `satisfies`, `!`, `<T>…`. */
function unwrapExpression(node: Expr): Expr {
  while (
    node.type === "ParenthesizedExpression" ||
    node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "TSNonNullExpression" ||
    node.type === "TSTypeAssertion"
  )
    node = node.expression;
  return node;
}

/** Chuỗi literal (`"…"` hoặc template không có `${}`); undefined nếu không phải. */
function stringValue(node: Node): string | undefined {
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0]?.value.cooked ?? undefined;
  return undefined;
}

const VIRTUAL_ID = "virtual:yugen-type-exports";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

/**
 * `import typeNames from "virtual:yugen-type-exports"` → tên mọi type/interface mà các module component export.
 * Converter StackBlitz / check-examples dùng để sinh `import { type X } from "yugen-ui"` (type không có lúc runtime).
 */
export function yugenTypeExports(root: string): Plugin {
  const uiDir = path.join(root, "src", "components", "ui");
  const collect = () => {
    const names = new Set<string>();
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name)) {
          const code = fs.readFileSync(file, "utf8");
          for (const m of code.matchAll(/^export\s+(?:declare\s+)?(?:type|interface)\s+([A-Z]\w*)/gm)) names.add(m[1]);
          for (const m of code.matchAll(/^export\s+(type\s+)?\{([^}]*)\}/gm))
            for (const part of m[2].split(",")) {
              const t = part.trim();
              if (!t) continue;
              const isType = Boolean(m[1]) || t.startsWith("type ");
              const name = t.replace(/^type\s+/, "").split(/\s+as\s+/).pop()!.trim();
              if (isType && /^[A-Z]/.test(name)) names.add(name);
            }
        }
      }
    };
    walk(uiDir);
    return [...names].sort();
  };
  return {
    name: "yugen-type-exports",
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      this.addWatchFile(uiDir);
      return `export default ${JSON.stringify(collect())};`;
    },
  };
}

const UI_EXPORTS_ID = "virtual:yugen-ui-exports";
const UI_EXPORTS_RESOLVED = "\0" + UI_EXPORTS_ID;

/** Tên runtime (không phải type) mà một module export, kể cả `export * from "./x"` (đọc tiếp file đó). */
export function runtimeExports(file: string, seen = new Set<string>()): string[] {
  if (seen.has(file)) return [];
  seen.add(file);
  const { program } = parseModule(file, fs.readFileSync(file, "utf8"));
  const names: string[] = [];
  const nameOf = (node: ESTree.ModuleExportName) => (node.type === "Identifier" ? node.name : String(node.value));
  for (const statement of program.body) {
    if (statement.type === "ExportAllDeclaration") {
      if (statement.exportKind === "type" || statement.exported) continue;
      const base = path.resolve(path.dirname(file), statement.source.value);
      const target = [".tsx", ".ts", "/index.tsx", "/index.ts"].map((ext) => base + ext).find((f) => fs.existsSync(f));
      if (target) names.push(...runtimeExports(target, seen));
    } else if (statement.type === "ExportNamedDeclaration") {
      if (statement.exportKind === "type") continue;
      for (const spec of statement.specifiers) if (spec.exportKind !== "type") names.push(nameOf(spec.exported));
      const decl = statement.declaration;
      if (decl?.type === "VariableDeclaration") {
        for (const d of decl.declarations) if (d.id.type === "Identifier") names.push(d.id.name);
      } else if ((decl?.type === "FunctionDeclaration" || decl?.type === "ClassDeclaration" || decl?.type === "TSEnumDeclaration") && decl.id) {
        names.push(decl.id.name);
      }
    } else if (statement.type === "ExportDefaultDeclaration") {
      const decl = statement.declaration;
      if ((decl.type === "FunctionDeclaration" || decl.type === "ClassDeclaration") && decl.id) names.push(decl.id.name);
    }
  }
  return names;
}

/**
 * `import uiExports from "virtual:yugen-ui-exports"` → `{ barrel, folders }`: tên runtime mà `yugen-ui` (barrel
 * src/components/ui/index.ts) export, và thư mục component của từng tên. Docs dùng để suy ra lệnh cài / import StackBlitz mà
 * không phải nạp cả thư viện lúc chạy (trước đây là import.meta.glob eager mọi module component).
 */
export function yugenUiExports(root: string): Plugin {
  const uiDir = path.join(root, "src", "components", "ui");
  const collect = () => {
    const folders: Record<string, string> = {};
    // Giống thứ tự glob cũ: file sắp theo đường dẫn, tên gặp trước thắng.
    const files = fs
      .readdirSync(uiDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((d) =>
        fs
          .readdirSync(path.join(uiDir, d.name))
          .filter((f) => /\.tsx?$/.test(f) && !/\.(test|spec|stories)\.tsx?$/.test(f) && !f.endsWith(".d.ts"))
          .map((f) => `${d.name}/${f}`),
      )
      .sort();
    for (const rel of files) {
      for (const name of runtimeExports(path.join(uiDir, rel))) folders[name] ??= rel.split("/")[0];
    }
    return { barrel: [...new Set(runtimeExports(path.join(uiDir, "index.ts")))].sort(), folders };
  };
  return {
    name: "yugen-ui-exports",
    resolveId: (id) => (id === UI_EXPORTS_ID ? UI_EXPORTS_RESOLVED : undefined),
    load(id) {
      if (id !== UI_EXPORTS_RESOLVED) return undefined;
      this.addWatchFile(uiDir);
      return `export default ${JSON.stringify(collect())};`;
    },
  };
}

const DOCS_META_ID = "virtual:yugen-docs-meta";
const DOCS_META_RESOLVED = "\0" + DOCS_META_ID;
const META_KEYS = ["slug", "name", "category", "lead"] as const;

export interface DocMeta {
  slug: string;
  name: string;
  category: string;
  lead: string;
  /** Tên file trong src/docs/registry (vd. "core.tsx") — nạp lười theo file. */
  file: string;
  /** Có bản tiếng Anh trong src/docs/registry/en/<file>.ts. */
  translated?: true;
}

/** Slug có trong `export const en = { … }` của một file src/docs/registry/en/*.ts (đọc tĩnh, không chạy file). */
export function extractEnSlugs(fileName: string, code: string): string[] {
  const { program } = parseModule(fileName, code);
  const decl = topLevelVariables(program).find(({ decl: d }) => d.id.type === "Identifier" && d.id.name === "en" && d.init)?.decl;
  if (!decl?.init) return [];
  const init = unwrapExpression(decl.init);
  if (init.type !== "ObjectExpression") throw new Error(`[yugen-docs-meta] ${path.basename(fileName)} — export const en phải là object literal.`);
  return init.properties.flatMap((prop) => {
    if (prop.type !== "Property" || prop.shorthand || prop.method || prop.kind !== "init") return [];
    const key = propertyKey(prop);
    return key === undefined ? [] : [key];
  });
}

/**
 * Đọc metadata (slug / name / category / lead) của mọi `ComponentDoc` trong một file registry bằng parser Oxc, không chạy
 * file. Theo `export const docs` qua: mảng literal, định danh const cùng file, `Object.values(<object literal>)`, spread.
 * Thuộc tính meta bắt buộc là chuỗi literal — sai thì ném lỗi rõ ràng (build / dev dừng).
 */
export function extractDocsMeta(fileName: string, code: string): DocMeta[] {
  const { program } = parseModule(fileName, code);
  const base = path.basename(fileName);
  const where = (node: Node) => {
    const before = code.slice(0, node.start).split("\n");
    return `${base}:${before.length}:${before[before.length - 1].length + 1}`;
  };
  const fail = (node: Node, message: string): never => {
    throw new Error(`[yugen-docs-meta] ${where(node)} — ${message}`);
  };

  const consts = new Map<string, Expr>();
  let exported: Expr | undefined;
  for (const { decl, exported: isExport } of topLevelVariables(program)) {
    if (decl.id.type !== "Identifier" || !decl.init) continue;
    consts.set(decl.id.name, decl.init);
    if (isExport && decl.id.name === "docs") exported = decl.init;
  }
  if (!exported) return [];

  const resolve = (node: Expr, seen = new Set<string>()): Expr => {
    node = unwrapExpression(node);
    if (node.type === "Identifier") {
      const init = consts.get(node.name);
      if (!init || seen.has(node.name)) fail(node, `không tìm thấy const "${node.name}" ở cấp file để đọc metadata docs.`);
      return resolve(init!, new Set(seen).add(node.name));
    }
    return node;
  };

  /** Danh sách object literal ComponentDoc từ một biểu thức mảng docs. */
  const docsOf = (expr: Expr): ESTree.ObjectExpression[] => {
    const node = resolve(expr);
    if (node.type === "ArrayExpression")
      return node.elements.flatMap((el) => (!el ? [] : el.type === "SpreadElement" ? docsOf(el.argument) : [docOf(el)]));
    if (
      node.type === "CallExpression" &&
      node.callee.type === "MemberExpression" &&
      !node.callee.computed &&
      node.callee.object.type === "Identifier" &&
      node.callee.object.name === "Object" &&
      node.callee.property.type === "Identifier" &&
      node.callee.property.name === "values" &&
      node.arguments.length === 1 &&
      node.arguments[0].type !== "SpreadElement"
    )
      return valuesOf(node.arguments[0]);
    return fail(node, "export const docs phải là mảng literal, const cùng file hoặc Object.values(<object literal>).");
  };
  const valuesOf = (expr: Expr): ESTree.ObjectExpression[] => {
    const node = resolve(expr);
    if (node.type !== "ObjectExpression") return fail(node, "Object.values(...) phải nhận một object literal (Record<string, ComponentDoc>).");
    return node.properties.flatMap((p) => {
      if (p.type === "SpreadElement") return valuesOf(p.argument);
      if (p.kind === "init" && !p.method) return [docOf(p.value as Expr)];
      return fail(p, "thuộc tính không hỗ trợ trong record docs.");
    });
  };
  const docOf = (expr: Expr): ESTree.ObjectExpression => {
    const node = resolve(expr);
    return node.type === "ObjectExpression" ? node : fail(node, "mỗi ComponentDoc phải là object literal.");
  };

  return docsOf(exported).map((obj) => {
    const meta: Partial<DocMeta> = { file: base };
    for (const key of META_KEYS) {
      const prop = obj.properties.find(
        (p): p is ESTree.ObjectProperty => p.type === "Property" && !p.shorthand && p.kind === "init" && !p.method && propertyKey(p) === key,
      );
      if (!prop) fail(obj, `ComponentDoc thiếu thuộc tính "${key}" dạng \`${key}: "…"\`.`);
      const value = unwrapExpression(prop!.value as Expr);
      const text = stringValue(value);
      if (text === undefined) fail(value, `"${key}" phải là chuỗi literal để trích metadata lúc build (không dùng biến / biểu thức).`);
      meta[key] = text;
    }
    return meta as DocMeta;
  });
}

/**
 * `import meta from "virtual:yugen-docs-meta"` → `DocMeta[]` của mọi file src/docs/registry/*.tsx (đọc tĩnh lúc build).
 * Sidebar / trang chủ / command palette dùng meta ngay; demo + code mẫu nạp lười theo file (registry/index.ts).
 */
export function yugenDocsMeta(root: string): Plugin {
  const registryDir = path.join(root, "src", "docs", "registry");
  const enDir = path.join(registryDir, "en");
  const isRegistryFile = (file: string) => {
    const f = path.resolve(file);
    return (path.dirname(f) === registryDir && f.endsWith(".tsx")) || (path.dirname(f) === enDir && f.endsWith(".ts"));
  };
  const collect = () =>
    fs
      .readdirSync(registryDir)
      .filter((f) => f.endsWith(".tsx"))
      .sort()
      .flatMap((f) => {
        const file = path.join(registryDir, f);
        const enFile = path.join(enDir, f.replace(/\.tsx$/, ".ts"));
        const translated = new Set(fs.existsSync(enFile) ? extractEnSlugs(enFile, fs.readFileSync(enFile, "utf8")) : []);
        return extractDocsMeta(file, fs.readFileSync(file, "utf8")).map((meta) =>
          translated.has(meta.slug) ? { ...meta, translated: true as const } : meta,
        );
      });
  let server: ViteDevServer | undefined;
  const invalidate = () => {
    const mod = server?.moduleGraph.getModuleById(DOCS_META_RESOLVED);
    if (mod) server!.moduleGraph.invalidateModule(mod);
    return mod;
  };
  return {
    name: "yugen-docs-meta",
    configureServer(s) {
      server = s;
      const onChange = (file: string) => {
        if (isRegistryFile(file) && invalidate()) s.ws.send({ type: "full-reload" });
      };
      s.watcher.on("add", onChange);
      s.watcher.on("unlink", onChange);
    },
    resolveId: (id) => (id === DOCS_META_ID ? DOCS_META_RESOLVED : undefined),
    load(id) {
      if (id !== DOCS_META_RESOLVED) return undefined;
      for (const f of fs.readdirSync(registryDir)) if (f.endsWith(".tsx")) this.addWatchFile(path.join(registryDir, f));
      if (fs.existsSync(enDir)) for (const f of fs.readdirSync(enDir)) this.addWatchFile(path.join(enDir, f));
      return `export default ${JSON.stringify(collect())};`;
    },
    handleHotUpdate({ file, modules }) {
      if (!isRegistryFile(file)) return;
      const mod = invalidate();
      return mod ? [...modules, mod] : undefined;
    },
  };
}

const MESSAGES_INDEX_ID = "virtual:yugen-messages-index";
const MESSAGES_ID = "virtual:yugen-messages";

export interface MessageKeyDoc {
  key: string;
  /** Kiểu trong interface: `string` hoặc chữ ký hàm. */
  type: string;
  /** JSDoc của khoá (tiếng Việt), rỗng nếu không có. */
  doc: string;
  /** Mã nguồn giá trị mặc định (tiếng Việt) và bản tiếng Anh; chuỗi literal được trả về dạng JSON (có dấu nháy). */
  vi: string;
  en: string;
}

export interface MessagesNamespaceDoc {
  namespace: string;
  folder: string;
  keys: MessageKeyDoc[];
}

/**
 * Đọc tĩnh một `<Folder>/messages.ts`: namespace (khối `declare module`), interface của nó (khoá, kiểu, JSDoc) và hai object
 * `xMessages` / `xMessagesEn`. Không chạy file, nên mã nguồn hàm giữ nguyên như khi viết.
 */
export function extractMessages(file: string, folder: string): MessagesNamespaceDoc[] {
  const code = fs.readFileSync(file, "utf8");
  const { program, comments } = parseModule(file, code);
  const raw = (node: Node) => code.slice(node.start, node.end);
  const text = (node: Node) => raw(node).replace(/\s+/g, " ").trim();
  const keyText = (node: Node) => raw(node).replace(/^["']|["']$/g, "");
  const interfaces = new Map<string, ESTree.TSInterfaceDeclaration>();
  const objects = new Map<string, ESTree.ObjectExpression>();
  const namespaces: { namespace: string; iface: string }[] = [];

  for (const statement of program.body) {
    const decl = statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;
    if (decl?.type === "TSInterfaceDeclaration") interfaces.set(decl.id.name, decl);
    else if (decl?.type === "TSModuleDeclaration" && decl.body?.type === "TSModuleBlock") {
      for (const inner of decl.body.body) {
        if (inner.type !== "TSInterfaceDeclaration" || inner.id.name !== "YugenMessages") continue;
        for (const member of inner.body.body) {
          const type = member.type === "TSPropertySignature" ? member.typeAnnotation?.typeAnnotation : undefined;
          if (member.type === "TSPropertySignature" && type?.type === "TSTypeReference")
            namespaces.push({ namespace: raw(member.key), iface: raw(type.typeName) });
        }
      }
    } else if (decl?.type === "VariableDeclaration") {
      for (const d of decl.declarations) if (d.id.type === "Identifier" && d.init?.type === "ObjectExpression") objects.set(d.id.name, d.init);
    }
  }

  const values = (name: string) => {
    const out = new Map<string, string>();
    for (const p of objects.get(name)?.properties ?? []) {
      if (p.type !== "Property" || p.method || p.kind !== "init") continue;
      if (p.shorthand) {
        out.set(raw(p.key), raw(p.key));
        continue;
      }
      const literal = stringValue(p.value);
      out.set(keyText(p.key), literal !== undefined ? JSON.stringify(literal) : text(p.value));
    }
    return out;
  };

  /** Phần chú thích của các khối JSDoc liền ngay trước `node` (bỏ dấu `*` đầu dòng và các thẻ `@…`). */
  const jsDoc = (node: Node) => {
    const blocks: string[] = [];
    let end = node.start;
    for (let i = comments.length - 1; i >= 0; i--) {
      const c = comments[i];
      if (c.end > end) continue;
      if (c.type !== "Block" || !c.value.startsWith("*") || code.slice(c.end, end).trim() !== "") break;
      const lines = c.value.slice(1).split("\n").map((line) => line.replace(/^\s*\*?\s?/, ""));
      const tag = lines.findIndex((line) => line.trimStart().startsWith("@"));
      blocks.unshift((tag === -1 ? lines : lines.slice(0, tag)).join(" "));
      end = c.start;
    }
    return blocks.join(" ").replace(/\s+/g, " ").trim();
  };

  return namespaces.map(({ namespace, iface }) => {
    const vi = values(`${namespace}Messages`);
    const en = values(`${namespace}MessagesEn`);
    const keys: MessageKeyDoc[] = [];
    for (const member of interfaces.get(iface)?.body.body ?? []) {
      if (member.type !== "TSPropertySignature" || !member.typeAnnotation) continue;
      const key = keyText(member.key);
      keys.push({ key, type: text(member.typeAnnotation.typeAnnotation), doc: jsDoc(member), vi: vi.get(key) ?? "", en: en.get(key) ?? "" });
    }
    return { namespace, folder, keys };
  });
}

/**
 * Chuỗi giao diện có sẵn của component cho trang docs (#156):
 * - `virtual:yugen-messages-index` → `[{ namespace, folder }]` (nhỏ, trang component dùng để biết có mục Messages không);
 * - `virtual:yugen-messages` → `MessagesNamespaceDoc[]` đầy đủ (nạp lười cùng bảng Messages).
 */
export function yugenMessages(root: string): Plugin {
  const uiDir = path.join(root, "src", "components", "ui");
  const collect = () =>
    fs
      .readdirSync(uiDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(uiDir, d.name, "messages.ts")))
      .flatMap((d) => extractMessages(path.join(uiDir, d.name, "messages.ts"), d.name));
  return {
    name: "yugen-messages",
    resolveId: (id) => (id === MESSAGES_INDEX_ID || id === MESSAGES_ID ? "\0" + id : undefined),
    load(id) {
      if (id !== "\0" + MESSAGES_INDEX_ID && id !== "\0" + MESSAGES_ID) return undefined;
      this.addWatchFile(uiDir);
      const all = collect();
      const data = id === "\0" + MESSAGES_ID ? all : all.map(({ namespace, folder }) => ({ namespace, folder }));
      return `export default ${JSON.stringify(data)};`;
    },
  };
}

const NEWS_IDS: Record<string, "index" | "vi" | "en"> = {
  "virtual:yugen-news-index": "index",
  "virtual:yugen-news-vi": "vi",
  "virtual:yugen-news-en": "en",
};

/**
 * Tin của trang Có gì mới (#261), từ src/docs/news/<gói>/<version>.<vi|en>.md qua scripts/news.mjs:
 * - `virtual:yugen-news-index` → `{ NEWS, CLI_NEWS, CREATE_NEWS }` chỉ có version, ngày, `upcoming` và tiêu đề hai ngôn ngữ
 *   (chấm ở thanh trên, nút tin ở trang chủ, ROADMAP.md);
 * - `virtual:yugen-news-vi` / `virtual:yugen-news-en` → đầy đủ theo một ngôn ngữ, nạp cùng trang Có gì mới.
 * File sai định dạng hoặc lệch giữa hai ngôn ngữ làm build (và dev) báo lỗi kèm file:dòng.
 */
export function yugenNews(root: string): Plugin {
  const newsDir = path.join(root, NEWS_DIR);
  const isNewsFile = (file: string) => path.resolve(file).startsWith(newsDir + path.sep) && file.endsWith(".md");
  let server: ViteDevServer | undefined;
  const invalidate = () =>
    Object.keys(NEWS_IDS).flatMap((id) => {
      const mod = server?.moduleGraph.getModuleById("\0" + id);
      if (mod) server!.moduleGraph.invalidateModule(mod);
      return mod ? [mod] : [];
    });
  return {
    name: "yugen-news",
    configureServer(s) {
      server = s;
      const onChange = (file: string) => {
        if (isNewsFile(file) && invalidate().length) s.ws.send({ type: "full-reload" });
      };
      s.watcher.on("add", onChange);
      s.watcher.on("unlink", onChange);
    },
    resolveId: (id) => (id in NEWS_IDS ? "\0" + id : undefined),
    load(id) {
      const which = id.startsWith("\0") ? NEWS_IDS[id.slice(1)] : undefined;
      if (!which) return undefined;
      for (const dir of Object.values(FEEDS)) {
        const feedDir = path.join(newsDir, dir);
        if (fs.existsSync(feedDir)) for (const f of fs.readdirSync(feedDir)) this.addWatchFile(path.join(feedDir, f));
      }
      const { feeds, errors } = readNews(root);
      if (errors.length) this.error(`Tin trong ${NEWS_DIR}:\n${errors.join("\n")}`);
      const data = Object.fromEntries(
        Object.entries(feeds).map(([name, releases]) => [
          name,
          which === "index"
            ? releases.map(({ version, date, upcoming, vi, en }) => ({ version, ...(upcoming ? { upcoming: true } : {}), date, title: { vi: vi.title, en: en.title } }))
            : localizeFeed(releases, which),
        ]),
      );
      return `export default ${JSON.stringify(data)};`;
    },
    handleHotUpdate({ file, modules }) {
      if (!isNewsFile(file)) return;
      const mods = invalidate();
      return mods.length ? [...modules, ...mods] : undefined;
    },
  };
}

/**
 * Màn chờ của docs (#236), từ src/docs/boot/splash.{css,js,html}.
 * - Dev: `npm run dev` không có HTML prerender, trước khi React render chỉ là trang trắng — chèn cả ba vào index.html.
 *   Sửa các file đó thì trang tự tải lại.
 * - Build: trang prerender có nội dung ngay lần vẽ đầu nên không cần màn chờ. Chỉ thêm một script nhỏ: trang không có HTML
 *   prerender để hiện (404.html, hoặc data-pending vì khác ngôn ngữ / RTL) thì nạp assets/boot-<hash>.js (CSS + markup + script).
 */
export function yugenBootSplash(root: string): Plugin {
  const dir = path.join(root, "src", "docs", "boot");
  const read = (file: string) => fs.readFileSync(path.join(dir, file), "utf8");
  const isSplash = (file: string) => path.dirname(path.resolve(file)) === dir && /^splash\.(html|css|js)$/.test(path.basename(file));
  let config: ResolvedConfig;
  let fileName = "";
  return {
    name: "yugen-boot-splash",
    configResolved(resolved) {
      config = resolved;
    },
    configureServer(server) {
      server.watcher.on("change", (file) => {
        if (isSplash(file)) server.ws.send({ type: "full-reload" });
      });
    },
    buildStart() {
      if (config.command !== "build" || config.build.ssr) return;
      const source =
        "(function (YB_CSS, YB_MARKUP) {\n" +
        read("splash.js") +
        `})(${JSON.stringify(read("splash.css"))}, ${JSON.stringify(read("splash.html").trim())});\n`;
      fileName = `${config.build.assetsDir}/boot-${createHash("sha256").update(source).digest("hex").slice(0, 8)}.js`;
      this.emitFile({ type: "asset", fileName, source });
    },
    transformIndexHtml(html) {
      if (config.command === "serve") {
        return {
          html: html.replace('<div id="root"></div>', `<div id="root"></div>
${read("splash.html")}`),
          tags: [
            { tag: "style", children: read("splash.css"), injectTo: "head" },
            { tag: "script", children: read("splash.js"), injectTo: "head" },
          ],
        };
      }
      if (!fileName) return html;
      const loader = `(function () { var r = document.documentElement; if (r.hasAttribute("data-prerendered") && !r.hasAttribute("data-pending")) return; var s = document.createElement("script"); s.src = ${JSON.stringify(config.base + fileName)}; document.head.appendChild(s); })();`;
      return [{ tag: "script", children: loader, injectTo: "head" }];
    },
  };
}
