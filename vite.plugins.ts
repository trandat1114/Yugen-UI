import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { build, parseSync, type Plugin, type ResolvedConfig, type ViteDevServer } from "vite";
import { FEEDS, localizeFeed, NEWS_DIR, readNews } from "./scripts/news.mjs";

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

/* ---------- Demo tiếng Việt cho trang /vi/ (#300) ---------- */

/**
 * Loại chuỗi trong mã demo mà từ điển thay được: chữ JSX (khoá đã gộp khoảng trắng như React), chuỗi literal, template literal
 * (khoá là phần thô giữa hai dấu `, giữ nguyên `${…}`) và chú thích một dòng.
 */
export type DemoTextKind = "jsx" | "string" | "template" | "comment";

export interface DemoText {
  kind: DemoTextKind;
  /** Khoá tra từ điển. */
  text: string;
  /** Đoạn mã nguồn được thay: [start, end). */
  start: number;
  end: number;
  /** Nằm trong code mẫu (template literal của `code` / `setup` / hằng `…_CODE`), không phải mã chạy. */
  inCode: boolean;
  /** Attribute JSX / thuộc tính object chứa chuỗi; "children" với chữ JSX; "" nếu không có. */
  context: string;
  /** Mã thay vào cho bản dịch `value` (đã escape theo vị trí); ném lỗi nếu bản dịch không đặt được vào vị trí đó. */
  replace: (value: string) => string;
}

/** Phần chữ của trang (ComponentDoc / Example) — dịch qua en/<file>.ts và bản gốc tiếng Việt, không qua từ điển demo. */
const DOC_PAGE_KEYS = new Set(["slug", "name", "category", "lead", "description", "importCode", "dos", "donts", "props"]);
const EXAMPLE_PAGE_KEYS = new Set(["title", "description", "lang", "wide"]);
/** Template literal là code mẫu: giá trị `code` / `setup`, hằng `…_CODE` / `…_SETUP`. Nội dung được phân tích như TSX. */
const CODE_KEYS = new Set(["code", "setup"]);
const CODE_CONST_RE = /_(?:CODE|SETUP)$/;
/** Tham số là tên vùng `#region` / tên khai báo trong mã nguồn file (registry), không phải chữ. */
const SOURCE_CALLS = new Set(["source", "declarationsOf"]);
/** Nút bọc giữa một chuỗi và attribute / thuộc tính chứa nó. */
const WRAPPERS = new Set(["ParenthesizedExpression", "ConditionalExpression", "LogicalExpression", "BinaryExpression", "ArrayExpression", "TSAsExpression", "TSSatisfiesExpression"]);

/** Nút AST ESTree / TS-ESTree của Oxc (`parseSync` của Vite): `start` / `end` là vị trí UTF-16 trong mã nguồn. */
type AstNode = { type: string; start: number; end: number; [key: string]: unknown };
const isAstNode = (v: unknown): v is AstNode => typeof v === "object" && v !== null && typeof (v as AstNode).type === "string";
const childrenOf = (node: AstNode): AstNode[] =>
  Object.values(node).flatMap((v) => (Array.isArray(v) ? v.filter(isAstNode) : isAstNode(v) ? [v] : []));

const propNameOf = (p: AstNode): string | undefined => {
  if (p.type !== "Property" || p.computed) return undefined;
  const key = p.key as AstNode & { name?: string; value?: unknown };
  return key.type === "Identifier" ? key.name : key.type === "Literal" && typeof key.value === "string" ? key.value : undefined;
};
const jsxNameOf = (name: AstNode): string =>
  name.type === "JSXNamespacedName" ? `${jsxNameOf(name.namespace as AstNode)}:${jsxNameOf(name.name as AstNode)}` : String(name.name);

/** Giá trị của phần thô trong template literal (escape đã giải, CRLF → LF) + vị trí thô của từng ký tự; `map[text.length]` = cuối. */
function cookTemplate(raw: string): { text: string; map: number[] } {
  let text = "";
  const map: number[] = [];
  const push = (s: string, at: number) => {
    for (let k = 0; k < s.length; k++) map.push(at);
    text += s;
  };
  const SIMPLE: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", 0: "\0" };
  for (let i = 0; i < raw.length; ) {
    const c = raw[i];
    if (c === "\r") {
      push("\n", i);
      i += raw[i + 1] === "\n" ? 2 : 1;
    } else if (c !== "\\") {
      push(c, i);
      i++;
    } else {
      const n = raw[i + 1];
      if (n === "\r") i += raw[i + 2] === "\n" ? 3 : 2;
      else if (n === "\n" || n === " " || n === " ") i += 2;
      else if (n === "x") {
        push(String.fromCharCode(parseInt(raw.slice(i + 2, i + 4), 16)), i);
        i += 4;
      } else if (n === "u" && raw[i + 2] === "{") {
        const close = raw.indexOf("}", i);
        push(String.fromCodePoint(parseInt(raw.slice(i + 3, close), 16)), i);
        i = close + 1;
      } else if (n === "u") {
        push(String.fromCharCode(parseInt(raw.slice(i + 2, i + 6), 16)), i);
        i += 6;
      } else {
        push(SIMPLE[n] ?? n, i);
        i += 2;
      }
    }
  }
  map.push(raw.length);
  return { text, map };
}

const escapeTemplate = (s: string) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

/** Biến dùng trong các `${…}` của một template (bỏ chuỗi và tên thuộc tính sau dấu chấm). */
const templateIdentifiers = (s: string) =>
  new Set(
    [...s.matchAll(/\$\{((?:[^{}]|\{[^{}]*\})*)\}/g)]
      .map((m) => m[1].replace(/"[^"]*"|'[^']*'/g, '""'))
      .join(" ")
      .match(/(?<![.\w$])[A-Za-z_$][\w$]*/g) ?? [],
  );

/**
 * Bản dịch của template literal có `${…}`: được viết lại biểu thức (định dạng ngày giờ / số kiểu Việt) nhưng chỉ dùng các biến
 * mà bản tiếng Anh dùng — biến lạ (đổi tên sau khi dịch) sẽ lỗi lúc chạy. Trả về lỗi, hoặc undefined nếu hợp lệ.
 */
export function templateTranslationError(en: string, vi: string): string | undefined {
  if (/(^|[^\\])`/.test(vi)) return `bản dịch template không được chứa dấu \`: ${vi}`;
  const known = templateIdentifiers(en);
  const extra = [...templateIdentifiers(vi)].filter((name) => !known.has(name) && !/^(true|false|null|undefined|new|typeof|Math|Number|String|Date|Intl)$/.test(name));
  return extra.length ? `bản dịch template dùng biến không có trong bản tiếng Anh (${extra.join(", ")}): ${vi}` : undefined;
}

type Parsed = { program: AstNode; comments: { type: string; start: number; end: number }[]; shift: number };

/** Phân tích TSX bằng Oxc; lỗi cú pháp → undefined. `wrap`: bọc trong `<>…</>` (code mẫu là nhiều phần tử JSX liền nhau). */
function parseTsx(code: string, offset: number, wrap: boolean): Parsed | undefined {
  const pre = wrap ? "<>\n" : "";
  const result = parseSync("demo.tsx", wrap ? `${pre}${code}\n</>` : code, { lang: "tsx" });
  if (result.errors.length) return undefined;
  return { program: result.program as unknown as AstNode, comments: result.comments, shift: offset - pre.length };
}

/**
 * Code mẫu thường không phải một module hoàn chỉnh: vài phần tử JSX liền nhau, hay khai báo rồi JSX. Thử nguyên khối, bọc
 * `<>…</>`, rồi tách theo dòng trống và ghép dần các đoạn liền nhau tới khi phân tích được. Đoạn không phải TSX (CSS, lệnh
 * shell…) vào `unparsed`.
 */
function parseCode(code: string, unparsed: string[]): Parsed[] {
  const whole = parseTsx(code, 0, false) ?? parseTsx(code, 0, true);
  if (whole) return [whole];
  const bounds = [0, ...[...code.matchAll(/\n[ \t]*\r?\n/g)].map((m) => m.index + m[0].length), code.length];
  const out: Parsed[] = [];
  for (let i = 0; i < bounds.length - 1; ) {
    let j = i + 1;
    let parsed: Parsed | undefined;
    for (; j < bounds.length && !parsed; j++) {
      const part = code.slice(bounds[i], bounds[j]);
      parsed = parseTsx(part, bounds[i], false) ?? parseTsx(part, bounds[i], true);
      if (parsed) break;
    }
    if (parsed) {
      out.push(parsed);
      i = j;
    } else {
      if (code.slice(bounds[i], bounds[i + 1]).trim()) unparsed.push(code.slice(bounds[i], bounds[i + 1]).trim());
      i++;
    }
  }
  return out;
}

function scanDemo(
  code: string,
  inCode: boolean,
): { texts: DemoText[]; rawImports: { start: number; end: number; value: string }[]; unparsed: string[] } {
  const texts: DemoText[] = [];
  const rawImports: { start: number; end: number; value: string }[] = [];
  const unparsed: string[] = [];
  let segments: Parsed[];
  if (inCode) segments = parseCode(code, unparsed);
  else {
    const result = parseSync("demo.tsx", code, { lang: "tsx" });
    if (result.errors.length) throw new Error(`không phân tích được mã nguồn: ${result.errors[0].message}`);
    segments = [{ program: result.program as unknown as AstNode, comments: result.comments, shift: 0 }];
  }

  for (const { program, comments, shift } of segments) {
    const parents = new Map<AstNode, AstNode>();
    const skipped: [number, number][] = [];
    const add = (t: Omit<DemoText, "inCode">) => texts.push({ ...t, inCode });
    const skip = (node: AstNode) => void skipped.push([node.start + shift, node.end + shift]);

    /** Attribute / thuộc tính bao quanh một chuỗi (qua ngoặc, `? :`, `??`, mảng, `{…}` của attribute JSX). */
    const contextOf = (node: AstNode): string => {
      let child = node;
      let p = parents.get(node);
      while (p && (WRAPPERS.has(p.type) || (p.type === "JSXExpressionContainer" && parents.get(p)?.type === "JSXAttribute"))) {
        child = p;
        p = parents.get(p);
      }
      if (!p) return "";
      if (p.type === "JSXAttribute") return jsxNameOf(p.name as AstNode);
      if (p.type === "Property" && p.value === child) return propNameOf(p) ?? "";
      if (p.type === "JSXExpressionContainer") return "children";
      return "";
    };

    const addString = (node: AstNode & { value: string }) => {
      const start = node.start + shift;
      const quote = code[start];
      const attr = parents.get(node)?.type === "JSXAttribute";
      add({
        kind: "string",
        text: node.value,
        start,
        end: node.end + shift,
        context: contextOf(node),
        replace: (v) => {
          if (attr) {
            // Chuỗi trong attribute JSX không có escape: đổi dấu nháy nếu bản dịch chứa dấu nháy đang dùng.
            const other = quote === '"' ? "'" : '"';
            const q = !v.includes(quote) ? quote : !v.includes(other) ? other : "";
            if (!q) throw new Error(`attribute JSX không chứa được cả hai loại dấu nháy: ${v}`);
            return q + v + q;
          }
          return quote + v.replace(/\\/g, "\\\\").replaceAll(quote, "\\" + quote).replace(/\n/g, "\\n").replace(/\r/g, "\\r") + quote;
        },
      });
    };

    const addJsx = (node: AstNode) => {
      const raw = code.slice(node.start + shift, node.end + shift);
      const text = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ");
      if (!text) return;
      add({
        kind: "jsx",
        text,
        start: node.start + shift + (raw.length - raw.trimStart().length),
        end: node.end + shift - (raw.length - raw.trimEnd().length),
        context: "children",
        replace: (v) => {
          if (/[{}<>\r\n]/.test(v)) throw new Error(`chữ JSX không được chứa { } < > hay xuống dòng: ${v}`);
          return v;
        },
      });
    };

    /** Phần thô giữa các `${…}` của một template literal: [đầu, cuối) trong `code`. */
    const quasiSpans = (node: AstNode) =>
      (node.quasis as (AstNode & { tail: boolean })[]).map((q) => [q.start + shift + 1, q.end + shift - (q.tail ? 1 : 2)] as const);

    const addTemplate = (node: AstNode) => {
      const start = node.start + shift;
      const end = node.end + shift;
      if ((node.expressions as AstNode[]).length === 0) {
        const [[from, to]] = quasiSpans(node);
        add({ kind: "template", text: cookTemplate(code.slice(from, to)).text, start, end, context: contextOf(node), replace: (v) => "`" + escapeTemplate(v) + "`" });
        return;
      }
      const text = code.slice(start + 1, end - 1);
      add({
        kind: "template",
        text,
        start,
        end,
        context: contextOf(node),
        replace: (v) => {
          const error = templateTranslationError(text, v);
          if (error) throw new Error(error);
          return "`" + v + "`";
        },
      });
    };

    /** Template literal là code mẫu: phân tích nội dung như TSX (`${…}` thay bằng định danh giữ chỗ) rồi đổi vị trí về file. */
    const addCode = (node: AstNode) => {
      let text = "";
      const pieces: { from: number; to: number; at: number; map: number[] }[] = [];
      quasiSpans(node).forEach(([from, to], i) => {
        const cooked = cookTemplate(code.slice(from, to));
        if (i > 0) text += `__${i}__`;
        pieces.push({ from: text.length, to: text.length + cooked.text.length, at: from, map: cooked.map });
        text += cooked.text;
      });
      const inner = scanDemo(text, true);
      unparsed.push(...inner.unparsed);
      for (const t of inner.texts) {
        const piece = pieces.find((p) => t.start >= p.from && t.end <= p.to);
        if (!piece) continue;
        texts.push({
          ...t,
          start: piece.at + piece.map[t.start - piece.from],
          end: piece.at + piece.map[t.end - piece.from],
          replace: (v) => escapeTemplate(t.replace(v)),
        });
      }
    };

    /** Giá trị của `code` / `setup` / hằng `…_CODE`: template literal là code mẫu, phần khác duyệt như thường. */
    const visitCode = (node: AstNode, parent: AstNode): void => {
      parents.set(node, parent);
      if (node.type === "TemplateLiteral") {
        addCode(node);
        for (const expr of node.expressions as AstNode[]) visit(expr, node);
      } else if (WRAPPERS.has(node.type) && node.type !== "ArrayExpression") {
        for (const child of childrenOf(node)) visitCode(child, node);
      } else visit(node, parent);
    };

    const visit = (node: AstNode, parent?: AstNode): void => {
      if (parent) parents.set(node, parent);
      switch (node.type) {
        case "ImportDeclaration": {
          const source = node.source as AstNode & { value: string };
          if (/^\.\/[^/]+\.tsx\?raw$/.test(source.value)) rawImports.push({ start: source.start + shift, end: source.end + shift, value: source.value });
          return skip(node);
        }
        case "ExportAllDeclaration":
        case "ImportExpression":
          return skip(node);
        case "ExportNamedDeclaration": {
          if (node.source) return skip(node);
          // Block: `export const meta` là tên / mô tả trên trang (META_VI ở BlocksPage), không phải nội dung block.
          const decl = node.declaration as AstNode | null;
          const declarators = decl?.type === "VariableDeclaration" ? (decl.declarations as AstNode[]) : [];
          if (parent?.type === "Program" && declarators.some((d) => (d.id as AstNode & { name?: string }).name === "meta")) return skip(node);
          break;
        }
        case "CallExpression": {
          const callee = node.callee as AstNode & { name?: string };
          if (callee.type === "Identifier" && SOURCE_CALLS.has(callee.name!)) return skip(node);
          break;
        }
        case "ObjectExpression": {
          const props = node.properties as AstNode[];
          const names = new Set(props.map(propNameOf));
          const skipKeys =
            names.has("slug") && names.has("examples") ? DOC_PAGE_KEYS : names.has("render") && names.has("code") && names.has("title") ? EXAMPLE_PAGE_KEYS : undefined;
          for (const p of props) {
            parents.set(p, node);
            const name = propNameOf(p);
            if (name && skipKeys?.has(name)) skip(p);
            else if (name && CODE_KEYS.has(name)) visitCode(p.value as AstNode, p);
            else visit(p, node);
          }
          return;
        }
        case "VariableDeclarator": {
          const id = node.id as AstNode & { name?: string };
          if (id.type === "Identifier" && CODE_CONST_RE.test(id.name!) && node.init) return visitCode(node.init as AstNode, node);
          break;
        }
        case "JSXText":
          return addJsx(node);
        case "Literal":
          if (typeof node.value === "string") addString(node as AstNode & { value: string });
          return;
        case "TemplateLiteral":
          addTemplate(node);
          for (const expr of node.expressions as AstNode[]) visit(expr, node);
          return;
      }
      for (const child of childrenOf(node)) visit(child, node);
    };
    visit(program);

    // Chú thích một dòng (code mẫu hiện cả chú thích), trừ phần đã bỏ qua (import, chữ trang…).
    for (const c of comments) {
      const from = c.start + shift;
      const raw = code.slice(from, c.end + shift);
      if (raw.includes("\n") || skipped.some(([a, b]) => from >= a && from < b)) continue;
      const block = c.type === "Block";
      const open = block && raw.startsWith("/**") ? 3 : 2;
      const inner = raw.slice(open, raw.length - (block ? 2 : 0));
      const text = inner.trim();
      if (!text) continue;
      const start = from + open + inner.indexOf(text);
      add({
        kind: "comment",
        text,
        start,
        end: start + text.length,
        context: "",
        replace: (v) => {
          if (/[\r\n]|\*\//.test(v)) throw new Error(`chú thích không được xuống dòng / chứa "*/": ${v}`);
          return v;
        },
      });
    }
  }
  return { texts: texts.sort((a, b) => a.start - b.start), rawImports, unparsed };
}

/** Mọi chuỗi demo của một file registry / block theo thứ tự trong mã nguồn — khoá từ điển `vi/<file>.json` lấy từ đây. */
export const collectDemoTexts = (code: string): DemoText[] => scanDemo(code, false).texts;

/** Đoạn code mẫu không phân tích được như TSX (CSS, lệnh shell…) — chữ trong đó không được dịch. */
export const unparsedDemoCode = (code: string): string[] => scanDemo(code, false).unparsed;

/** Từ điển demo của một file: `<thư mục>/vi/<tên>.json` (tiếng Anh → tiếng Việt). */
export const demoDictionaryOf = (file: string) => path.join(path.dirname(file), "vi", path.basename(file).replace(/\.tsx$/, ".json"));

/**
 * Bản tiếng Việt của mã nguồn một file demo: thay chuỗi khớp nguyên văn một khoá trong `dict`, đổi `import RAW from "./x.tsx?raw"`
 * thành `?lang=vi&raw` (code mẫu cắt từ mã nguồn đã dịch). Không đổi gì khác. `used`: các khoá đã dùng.
 */
export function localizeDemo(code: string, dict: Record<string, string>): { code: string; used: Set<string> } {
  const { texts, rawImports } = scanDemo(code, false);
  const edits = texts
    .filter((t) => Object.hasOwn(dict, t.text))
    .map((t) => ({ start: t.start, end: t.end, key: t.text as string | undefined, text: t.replace(dict[t.text]) }));
  for (const spec of rawImports)
    edits.push({ start: spec.start, end: spec.end, key: undefined, text: JSON.stringify(spec.value.replace(/\?raw$/, "?lang=vi&raw")) });
  edits.sort((a, b) => a.start - b.start || b.end - a.end);
  const used = new Set<string>();
  let out = "";
  let last = 0;
  for (const e of edits) {
    // Chuỗi nằm trong một template đã dịch nguyên câu (vd. biểu thức trong `${…}`): bản dịch template đã gồm phần đó.
    if (e.start < last) continue;
    out += code.slice(last, e.start) + e.text;
    last = e.end;
    if (e.key !== undefined) used.add(e.key);
  }
  return { code: out + code.slice(last), used };
}

/** Biến môi trường của lượt build thử (yugenDemoLang): module `?lang=vi` chỉ là module rỗng. */
const DEMO_LANG_PREPASS = "YUGEN_DEMO_LANG_PREPASS";
/** Query của bản sao module dành riêng cho chunk tiếng Việt: `?yugen-vi=<file demo>`. */
const DEMO_COPY = "yugen-vi";
const MODULE_TYPES: Record<string, "js" | "jsx" | "ts" | "tsx" | "json"> = { ".tsx": "tsx", ".ts": "ts", ".mts": "ts", ".jsx": "jsx", ".json": "json" };

/**
 * `import("./x.tsx?lang=vi")` (src/docs/registry/*.tsx, src/docs/block-library/*.tsx) → module của chính file đó với chữ demo
 * tiếng Việt theo từ điển `vi/<file>.json` (localizeDemo); `?lang=vi&raw` → mã nguồn đã dịch dạng chuỗi (tab Code của Blocks,
 * code mẫu cắt từ mã nguồn của registry). Trang tiếng Anh vẫn nạp file gốc.
 *
 * Build client: module chỉ một file demo dùng (component riêng của Labs, zod…) nằm luôn trong chunk của file đó. Bản `?lang=vi`
 * cũng import chúng thì Rolldown tách chúng ra chunk chung → trang tiếng Anh thêm request. Nên trước khi build, plugin chạy một
 * lượt build thử không có bản tiếng Việt (module rỗng) để biết chunk của mỗi file demo gồm những module nào; bản `?lang=vi`
 * import các module đó qua bản sao riêng (`?yugen-vi=…`). Chunk tiếng Anh giữ nguyên như khi chưa có bản tiếng Việt, chunk
 * tiếng Việt có cùng nội dung và cùng các chunk chung.
 */
export function yugenDemoLang(root: string): Plugin {
  const dirs = [path.join(root, "src", "docs", "registry"), path.join(root, "src", "docs", "block-library")];
  const prepass = process.env[DEMO_LANG_PREPASS] === "1";
  const cleanId = (id: string) => id.split("?")[0].replace(/\\/g, "/");
  const isDemoFile = (file: string) => file.endsWith(".tsx") && dirs.includes(path.dirname(path.resolve(file)));
  let config: ResolvedConfig;
  /** File demo → id các module trong chunk chứa nó (lượt build thử). */
  let chunkModules: Map<string, Set<string>> | undefined;

  /**
   * Barrel chỉ gồm `export … from` (@/components/ui, Chart/Chart.tsx): sao chép không đổi gì, và phải sao chép để import qua
   * barrel tới được bản sao của module bên trong (không thì module đó thành dùng chung giữa hai chunk).
   */
  const barrels = new Map<string, boolean>();
  const isBarrel = (file: string) => {
    let pure = barrels.get(file);
    if (pure === undefined) {
      const { program, errors } = parseSync(file, fs.readFileSync(file, "utf8"), { lang: /\.tsx$/.test(file) ? "tsx" : /\.m?ts$/.test(file) ? "ts" : "js" });
      const body = program.body as unknown as { type: string; declaration?: { type: string } | null }[];
      pure =
        !errors.length &&
        body.length > 0 &&
        body.every(
          (s) =>
            s.type === "ImportDeclaration" ||
            s.type === "ExportAllDeclaration" ||
            (s.type === "ExportNamedDeclaration" && (!s.declaration || /^TS(TypeAlias|Interface)Declaration$/.test(s.declaration.type))),
        );
      barrels.set(file, pure);
    }
    return pure;
  };

  /** File demo mà một module thuộc về: bản `?lang=vi`, hoặc bản sao `?yugen-vi=<file>`. */
  const scopeOf = (id: string) => {
    const params = new URLSearchParams(id.split("?")[1] ?? "");
    if (params.has(DEMO_COPY)) return params.get(DEMO_COPY)!;
    return params.get("lang") === "vi" && isDemoFile(id.split("?")[0]) ? cleanId(id) : undefined;
  };

  return {
    name: "yugen-demo-lang",
    enforce: "pre",
    configResolved(resolved) {
      config = resolved;
    },
    async buildStart() {
      if (prepass || config.command !== "build" || config.build.ssr) return;
      process.env[DEMO_LANG_PREPASS] = "1";
      try {
        const result = await build({ configFile: config.configFile, root: config.root, mode: config.mode, logLevel: "silent", build: { write: false } });
        chunkModules = new Map();
        for (const output of (Array.isArray(result) ? result : [result]) as { output?: { type: string; moduleIds?: string[] }[] }[])
          for (const chunk of output.output ?? []) {
            if (chunk.type !== "chunk" || !chunk.moduleIds) continue;
            const ids = new Set(chunk.moduleIds);
            for (const id of ids) if (!id.includes("?") && isDemoFile(id)) chunkModules.set(cleanId(id), ids);
          }
      } finally {
        delete process.env[DEMO_LANG_PREPASS];
      }
    },
    async resolveId(source, importer, options) {
      const scope = chunkModules && importer ? scopeOf(importer) : undefined;
      const own = scope && chunkModules!.get(scope);
      if (!own) return undefined;
      const resolved = await this.resolve(source, importer!.split("?")[0], { ...options, skipSelf: true });
      if (!resolved || resolved.external || resolved.id.startsWith("\0") || !fs.existsSync(cleanId(resolved.id))) return resolved;
      if (!own.has(resolved.id) && (resolved.id.includes("?") || !/\.[mc]?[jt]sx?$/.test(resolved.id) || !isBarrel(resolved.id))) return resolved;
      return { ...resolved, id: `${resolved.id}${resolved.id.includes("?") ? "&" : "?"}${DEMO_COPY}=${encodeURIComponent(scope)}` };
    },
    load(id) {
      const [file, query = ""] = id.split("?");
      const params = new URLSearchParams(query);
      if (params.has(DEMO_COPY)) {
        const code = fs.readFileSync(file, "utf8");
        if (params.has("raw")) return { code: `export default ${JSON.stringify(code)};`, moduleType: "js" };
        return { code, moduleType: MODULE_TYPES[path.extname(file)] ?? "js" };
      }
      if (params.get("lang") !== "vi" || !isDemoFile(file)) return undefined;
      if (prepass) {
        if (params.has("raw")) return { code: `export default "";`, moduleType: "js" };
        return { code: `export const docs = [], meta = undefined;\nexport default function Empty() { return null; }\n`, moduleType: "js" };
      }
      const abs = path.resolve(file);
      const dictFile = demoDictionaryOf(abs);
      this.addWatchFile(abs);
      this.addWatchFile(dictFile);
      const dict = fs.existsSync(dictFile) ? (JSON.parse(fs.readFileSync(dictFile, "utf8")) as Record<string, string>) : {};
      let code: string;
      try {
        code = localizeDemo(fs.readFileSync(abs, "utf8"), dict).code;
      } catch (error) {
        throw new Error(`[yugen-demo-lang] ${path.relative(root, dictFile)}: ${(error as Error).message}`);
      }
      if (params.has("raw")) return { code: `export default ${JSON.stringify(code)};`, moduleType: "js" };
      return { code, moduleType: "tsx" };
    },
  };
}
