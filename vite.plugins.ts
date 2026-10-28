import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

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
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, false);
  const names: string[] = [];
  const isExported = (node: ts.Node) =>
    ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly) continue;
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) if (!element.isTypeOnly) names.push(element.name.text);
      } else if (!statement.exportClause && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
        const base = path.resolve(path.dirname(file), statement.moduleSpecifier.text);
        const target = [".tsx", ".ts", "/index.tsx", "/index.ts"].map((ext) => base + ext).find((f) => fs.existsSync(f));
        if (target) names.push(...runtimeExports(target, seen));
      }
    } else if (isExported(statement)) {
      if (ts.isVariableStatement(statement)) {
        for (const d of statement.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
      } else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isEnumDeclaration(statement)) && statement.name) {
        names.push(statement.name.text);
      }
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
  const source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const stmt of source.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== "en" || !decl.initializer) continue;
      let init = decl.initializer;
      while (ts.isAsExpression(init) || ts.isSatisfiesExpression(init) || ts.isParenthesizedExpression(init)) init = init.expression;
      if (!ts.isObjectLiteralExpression(init)) throw new Error(`[yugen-docs-meta] ${path.basename(fileName)} — export const en phải là object literal.`);
      return init.properties.flatMap((prop) =>
        ts.isPropertyAssignment(prop) && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) ? [prop.name.text] : [],
      );
    }
  }
  return [];
}

/**
 * Đọc metadata (slug / name / category / lead) của mọi `ComponentDoc` trong một file registry bằng TypeScript compiler API,
 * không chạy file. Theo `export const docs` qua: mảng literal, định danh const cùng file, `Object.values(<object literal>)`, spread.
 * Thuộc tính meta bắt buộc là chuỗi literal — sai thì ném lỗi rõ ràng (build / dev dừng).
 */
export function extractDocsMeta(fileName: string, code: string): DocMeta[] {
  const source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const base = path.basename(fileName);
  const where = (node: ts.Node) => {
    const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
    return `${base}:${line + 1}:${character + 1}`;
  };
  const fail = (node: ts.Node, message: string): never => {
    throw new Error(`[yugen-docs-meta] ${where(node)} — ${message}`);
  };

  const consts = new Map<string, ts.Expression>();
  let exported: ts.Expression | undefined;
  for (const stmt of source.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    const isExport = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      consts.set(decl.name.text, decl.initializer);
      if (isExport && decl.name.text === "docs") exported = decl.initializer;
    }
  }
  if (!exported) return [];

  const unwrap = (node: ts.Expression): ts.Expression => {
    while (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isNonNullExpression(node) ||
      ts.isTypeAssertionExpression(node)
    )
      node = node.expression;
    return node;
  };
  const resolve = (node: ts.Expression, seen = new Set<string>()): ts.Expression => {
    node = unwrap(node);
    if (ts.isIdentifier(node)) {
      const init = consts.get(node.text);
      if (!init || seen.has(node.text)) fail(node, `không tìm thấy const "${node.text}" ở cấp file để đọc metadata docs.`);
      return resolve(init!, new Set(seen).add(node.text));
    }
    return node;
  };

  /** Danh sách object literal ComponentDoc từ một biểu thức mảng docs. */
  const docsOf = (expr: ts.Expression): ts.ObjectLiteralExpression[] => {
    const node = resolve(expr);
    if (ts.isArrayLiteralExpression(node))
      return node.elements.flatMap((el) => (ts.isSpreadElement(el) ? docsOf(el.expression) : [docOf(el)]));
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "Object" &&
      node.expression.name.text === "values" &&
      node.arguments.length === 1
    )
      return valuesOf(node.arguments[0]);
    return fail(node, "export const docs phải là mảng literal, const cùng file hoặc Object.values(<object literal>).");
  };
  const valuesOf = (expr: ts.Expression): ts.ObjectLiteralExpression[] => {
    const node = resolve(expr);
    if (!ts.isObjectLiteralExpression(node)) return fail(node, "Object.values(...) phải nhận một object literal (Record<string, ComponentDoc>).");
    return node.properties.flatMap((p) => {
      if (ts.isPropertyAssignment(p)) return [docOf(p.initializer)];
      if (ts.isShorthandPropertyAssignment(p)) return [docOf(p.name)];
      if (ts.isSpreadAssignment(p)) return valuesOf(p.expression);
      return fail(p, "thuộc tính không hỗ trợ trong record docs.");
    });
  };
  const docOf = (expr: ts.Expression): ts.ObjectLiteralExpression => {
    const node = resolve(expr);
    return ts.isObjectLiteralExpression(node) ? node : fail(node, "mỗi ComponentDoc phải là object literal.");
  };

  return docsOf(exported).map((obj) => {
    const meta: Partial<DocMeta> = { file: base };
    for (const key of META_KEYS) {
      const prop = obj.properties.find(
        (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === key,
      );
      if (!prop) fail(obj, `ComponentDoc thiếu thuộc tính "${key}" dạng \`${key}: "…"\`.`);
      const value = unwrap(prop!.initializer);
      if (!ts.isStringLiteral(value) && !ts.isNoSubstitutionTemplateLiteral(value))
        fail(value, `"${key}" phải là chuỗi literal để trích metadata lúc build (không dùng biến / biểu thức).`);
      meta[key] = (value as ts.StringLiteral).text;
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
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const text = (node: ts.Node) => node.getText(source).replace(/\s+/g, " ").trim();
  const interfaces = new Map<string, ts.InterfaceDeclaration>();
  const objects = new Map<string, ts.ObjectLiteralExpression>();
  const namespaces: { namespace: string; iface: string }[] = [];

  for (const statement of source.statements) {
    if (ts.isInterfaceDeclaration(statement)) interfaces.set(statement.name.text, statement);
    else if (ts.isModuleDeclaration(statement) && statement.body && ts.isModuleBlock(statement.body)) {
      for (const inner of statement.body.statements) {
        if (!ts.isInterfaceDeclaration(inner) || inner.name.text !== "YugenMessages") continue;
        for (const member of inner.members) {
          if (ts.isPropertySignature(member) && member.type && ts.isTypeReferenceNode(member.type))
            namespaces.push({ namespace: member.name.getText(source), iface: member.type.typeName.getText(source) });
        }
      }
    } else if (ts.isVariableStatement(statement)) {
      for (const d of statement.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.initializer && ts.isObjectLiteralExpression(d.initializer)) objects.set(d.name.text, d.initializer);
      }
    }
  }

  const values = (name: string) => {
    const out = new Map<string, string>();
    for (const p of objects.get(name)?.properties ?? []) {
      if (ts.isPropertyAssignment(p)) {
        const v = p.initializer;
        out.set(p.name.getText(source).replace(/^["']|["']$/g, ""), ts.isStringLiteralLike(v) ? JSON.stringify(v.text) : text(v));
      } else if (ts.isShorthandPropertyAssignment(p)) out.set(p.name.text, p.name.text);
    }
    return out;
  };

  return namespaces.map(({ namespace, iface }) => {
    const vi = values(`${namespace}Messages`);
    const en = values(`${namespace}MessagesEn`);
    const keys: MessageKeyDoc[] = [];
    for (const member of interfaces.get(iface)?.members ?? []) {
      if (!ts.isPropertySignature(member) || !member.type) continue;
      const key = member.name.getText(source).replace(/^["']|["']$/g, "");
      const doc = ts
        .getJSDocCommentsAndTags(member)
        .map((d) => (typeof d.comment === "string" ? d.comment : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      keys.push({ key, type: text(member.type), doc, vi: vi.get(key) ?? "", en: en.get(key) ?? "" });
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
