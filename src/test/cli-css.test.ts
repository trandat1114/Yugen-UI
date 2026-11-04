// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { parseSync } from "vite";
import { describe, expect, it } from "vitest";
import { findImports } from "../../packages/cli/src/lib/imports";

/**
 * `yugen css` (packages/cli) đọc import của app bằng một lexer riêng, không dùng parser. Test này so lexer với parser Oxc
 * (đi kèm Vite) trên mọi file mã của repo: cùng các import / export … from / import() / require() giá trị, không gồm kiểu.
 */
const root = path.resolve(import.meta.dirname, "../..");
const SKIP = new Set(["node_modules", "dist", "dist-docs", "dist-ssr", ".git", ".claude", "test-results", "playwright-report", "coverage"]);
const CODE = /\.(?:[cm]?[jt]sx?)$/;

function files(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) files(path.join(dir, entry.name), out);
    } else if (CODE.test(entry.name) && !entry.name.endsWith(".d.ts")) out.push(path.join(dir, entry.name));
  }
  return out;
}

type Node = { type?: string; [key: string]: unknown };
const nameOf = (n: Node) => (n.type === "Identifier" ? (n.name as string) : String(n.value));
const stringOf = (n: Node | undefined) =>
  n?.type === "Literal" && typeof n.value === "string"
    ? n.value
    : n?.type === "TemplateLiteral" && (n.expressions as Node[]).length === 0
      ? ((n.quasis as Node[])[0].value as { raw: string }).raw
      : null;

function parse(file: string, code: string) {
  const ext = path.extname(file).slice(1);
  const lang = ext === "tsx" ? "tsx" : /^[cm]?ts$/.test(ext) ? "ts" : "jsx";
  const { program, errors } = parseSync(file, code, { lang, sourceType: "module" });
  return errors.length ? null : program;
}

/**
 * Chèn `import "__marker_N__";` sau mỗi câu lệnh cấp file. Import của repo đều nằm đầu file, trước JSX; marker buộc lexer
 * phải đọc đúng hết từng câu lệnh (JSX, template, regex…) mới thấy được import phía sau.
 */
function withMarkers(file: string, code: string) {
  const program = parse(file, code);
  if (!program) return null;
  let out = code;
  const body = program.body as unknown as { end: number }[];
  for (let k = body.length - 1; k >= 0; k--) out = `${out.slice(0, body[k].end)}\nimport "__marker_${k}__";\n${out.slice(body[k].end)}`;
  return out;
}

/** Cùng định dạng với findImports, đọc từ AST của Oxc. */
function expected(file: string, code: string) {
  const program = parse(file, code);
  if (!program) return null;
  const out: string[] = [];
  const add = (kind: string, from: string, names: string[] = []) => out.push(`${kind} ${from} ${[...names].sort().join(",")}`);
  for (const stmt of program.body as unknown as Node[]) {
    const source = (stmt.source as Node | null | undefined)?.value as string | undefined;
    if (stmt.type === "ImportDeclaration" && stmt.importKind !== "type") {
      const specs = stmt.specifiers as Node[];
      if (specs.some((s) => s.type === "ImportNamespaceSpecifier")) add("all", source!);
      else
        add(
          "named",
          source!,
          specs.flatMap((s) =>
            s.type === "ImportDefaultSpecifier" ? ["default"] : s.importKind === "type" ? [] : [nameOf(s.imported as Node)],
          ),
        );
    } else if (stmt.type === "ExportAllDeclaration" && stmt.exportKind !== "type") add("all", source!);
    else if (stmt.type === "ExportNamedDeclaration" && source && stmt.exportKind !== "type")
      add("named", source, (stmt.specifiers as Node[]).filter((s) => s.exportKind !== "type").map((s) => nameOf(s.local as Node)));
    else if (stmt.type === "TSImportEqualsDeclaration" && stmt.importKind !== "type") {
      const ref = stmt.moduleReference as Node;
      if (ref.type === "TSExternalModuleReference") add("all", (ref.expression as Node).value as string);
    }
  }
  // import("x") và require("x") ở bất kỳ đâu.
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    const n = node as Node;
    if (n.type === "ImportExpression") {
      const from = stringOf(n.source as Node);
      if (from !== null) add("all", from);
    } else if (n.type === "CallExpression") {
      const callee = n.callee as Node;
      const args = n.arguments as Node[];
      const from = stringOf(args[0]);
      if (callee.type === "Identifier" && callee.name === "require" && args.length === 1 && from !== null) add("all", from);
    }
    for (const [key, value] of Object.entries(n)) if (key !== "parent") visit(value);
  };
  visit(program);
  return out.sort();
}

const actual = (file: string, code: string) =>
  findImports(code, file)
    .map((i) => `${i.all ? "all" : "named"} ${i.from} ${[...i.names].sort().join(",")}`)
    .sort();

describe("lexer import của CLI so với parser Oxc", () => {
  it("cùng kết quả trên mọi file .ts / .tsx / .js của repo", { timeout: 120_000 }, () => {
    const all = ["src", "templates", "e2e", "scripts", "packages"].flatMap((d) => files(path.join(root, d)));
    expect(all.length).toBeGreaterThan(1000);
    const diffs: string[] = [];
    let compared = 0;
    for (const file of all) {
      const code = withMarkers(file, fs.readFileSync(file, "utf8"));
      const want = code && expected(file, code);
      if (!code || !want) continue;
      compared++;
      const got = actual(file, code);
      if (JSON.stringify(got) !== JSON.stringify(want))
        diffs.push(`${path.relative(root, file)}\n  lexer:  ${got.join(" | ")}\n  parser: ${want.join(" | ")}`);
    }
    expect(compared).toBeGreaterThan(1000);
    expect(diffs.slice(0, 10).join("\n")).toBe("");
  });
});

describe("yugen css --precompile", () => {
  it("keeps the same always-on utilities as dist/styles.css (@source inline in scripts/build-css.mjs)", () => {
    const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
    const library = read("scripts/build-css.mjs").match(/@source inline\("([^"]+)"\)/)?.[1];
    const cli = read("packages/cli/src/lib/leanCss.ts").match(/STYLES_INLINE = "([^"]+)"/)?.[1];
    expect(library).toBeTruthy();
    expect(cli).toBe(library);
  });
});
