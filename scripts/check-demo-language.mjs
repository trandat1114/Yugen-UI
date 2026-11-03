#!/usr/bin/env node
/**
 * Demo, code mẫu và block viết bằng tiếng Anh (#278): báo lỗi khi chữ cái tiếng Việt xuất hiện trong
 *   - code mẫu của src/docs/registry/*.tsx: chuỗi sau `code:` / `setup:` (template literal, mảng chuỗi, hằng `…_CODE`,
 *     hằng được chèn vào code qua `${…}` hoặc `declarationsOf(RAW, [...])`) và mọi khối `// #region` … `// #endregion`;
 *   - toàn bộ file src/docs/block-library/*.tsx (trang Blocks cho copy nguyên file).
 * Phần chữ của trang (title, description, dos, props…) không bị kiểm tra. Demo cố ý dùng tiếng Việt (bản địa hoá, nhập
 * liệu tiếng Việt) nằm trong ALLOW kèm lý do.
 *
 *   node scripts/check-demo-language.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { declarationsOf } from "../src/docs/setup.ts";

/** Chữ cái chỉ tiếng Việt dùng (ă â đ ê ô ơ ư, ĩ ũ và dải có dấu U+1EA0–U+1EF9). */
export const VIETNAMESE = /[ăâđêôơưĩũĂÂĐÊÔƠƯĨŨẠ-ỹ]/u;

/**
 * Dòng được phép có tiếng Việt: `file` (đường dẫn từ gốc repo), `match` (chuỗi dòng phải chứa, hoặc RegExp) và lý do.
 * Thêm mục mới chỉ khi demo nói về ngôn ngữ — bản địa hoá, nhập liệu tiếng Việt, tìm kiếm bỏ dấu. Ví dụ đó đặt
 * `lang: "vi"` (src/docs/types.ts) để vùng demo mang đúng ngôn ngữ.
 */
export const ALLOW = [
  {
    file: "src/docs/registry/forms.tsx",
    match: `options={["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"`,
    reason: "Combobox: lọc không phân biệt dấu (gõ “da nang” ra “Đà Nẵng”)",
  },
  {
    file: "src/docs/registry/forms.tsx",
    match: /^\{ name: "[^"]+", origin: "[^"]+" \},$/,
    reason: "SearchBox: tô sáng phần khớp khi gõ không dấu (“xoai” ra “Xoài”)",
  },
  {
    file: "src/docs/registry/phase3-inputs.tsx",
    match: `aria-label="Giờ (12 giờ, vi-VN)"`,
    reason: "TimePicker: nhãn buổi theo locale vi-VN, đặt cạnh en-US",
  },
];

/** Vị trí đóng của template literal mở ở `start` (bỏ qua `${…}` lồng nhau). */
function templateEnd(src, start) {
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (src[i] === "`") return i;
    else if (src[i] === "$" && src[i + 1] === "{") i = expressionEnd(src, i + 2);
  }
  return src.length;
}

/** Vị trí `}` đóng biểu thức bắt đầu ở `start`. */
function expressionEnd(src, start) {
  let depth = 1;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === "`") i = templateEnd(src, i);
    else if (c === '"' || c === "'") i = quoteEnd(src, i);
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i;
  }
  return src.length;
}

function quoteEnd(src, start) {
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (src[i] === src[start] || src[i] === "\n") return i;
  }
  return src.length;
}

/** Vị trí đóng của `[` / `(` mở ở `start`. */
function bracketEnd(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === "`") i = templateEnd(src, i);
    else if (c === '"' || c === "'") i = quoteEnd(src, i);
    else if (c === "[" || c === "(" || c === "{") depth++;
    else if ((c === "]" || c === ")" || c === "}") && --depth === 0) return i;
  }
  return src.length;
}

const lineAt = (src, index) => src.slice(0, index).split("\n").length;
const declared = (src, name) => new RegExp(`^(?:export\\s+)?(?:const|let|function)\\s+${name}\\b`, "m").exec(src);

/** Các đoạn code mẫu trong mã nguồn một file registry: `{ line, text }` (line = dòng đầu của đoạn, đếm từ 1). */
export function codeSegments(raw) {
  const src = raw.replace(/\r\n/g, "\n");
  const segments = [];
  const seen = new Set();
  const add = (from, to) => {
    if (seen.has(from)) return;
    seen.add(from);
    segments.push({ line: lineAt(src, from), text: src.slice(from, to) });
  };
  const addDeclaration = (name) => {
    const head = declared(src, name);
    if (head) add(head.index, head.index + declarationsOf(src.slice(head.index), [name]).length);
  };
  const addTemplate = (start) => {
    const end = templateEnd(src, start);
    add(start, end + 1);
    // Hằng của file được chèn vào code: `${lit(sources)}`.
    for (const m of src.slice(start, end).matchAll(/\$\{([^}]*)\}/g)) for (const [name] of m[1].matchAll(/[A-Za-z_]\w*/g)) addDeclaration(name);
  };

  for (const m of src.matchAll(/\b(?:code|setup)\s*:\s*/g)) {
    const at = m.index + m[0].length;
    const c = src[at];
    if (c === "`") addTemplate(at);
    else if (c === "[") add(at, bracketEnd(src, at) + 1);
    else if (c === '"' || c === "'") add(at, quoteEnd(src, at) + 1);
    else {
      const call = /^declarationsOf\(\s*\w+\s*,\s*\[([^\]]*)\]/.exec(src.slice(at));
      if (call) for (const [, name] of call[1].matchAll(/["'](\w+)["']/g)) addDeclaration(name);
      else {
        const id = /^([A-Z][A-Z0-9_]*)\b/.exec(src.slice(at));
        if (id) addDeclaration(id[1]);
      }
    }
  }
  for (const m of src.matchAll(/^const\s+[A-Z][A-Z0-9_]*_(?:CODE|SETUP)\s*=\s*`/gm)) addTemplate(m.index + m[0].length - 1);
  for (const m of src.matchAll(/^[ \t]*\/\/ #region .*$/gm)) {
    const end = src.indexOf("// #endregion", m.index);
    add(m.index, end < 0 ? src.length : end);
  }
  return segments;
}

/** Dòng có chữ tiếng Việt trong các đoạn: `{ line, text }` — `text` là cả dòng trong `source` (nếu có). */
export function vietnameseLines(segments, source) {
  const full = source?.replace(/\r\n/g, "\n").split("\n");
  const lines = new Map();
  for (const { line, text } of segments)
    text.split("\n").forEach((content, i) => {
      if (VIETNAMESE.test(content.normalize("NFC"))) lines.set(line + i, (full?.[line + i - 1] ?? content).trim());
    });
  return [...lines].sort(([a], [b]) => a - b).map(([line, text]) => ({ line, text }));
}

const matches = (match, line) => (typeof match === "string" ? line.includes(match) : match.test(line));
const allowed = (file, text, allow) => allow.some((a) => a.file === file && matches(a.match, text));

/** Lỗi cho cả repo: `file:dòng  nội dung`. */
export function demoLanguageErrors(root, allow = ALLOW) {
  const errors = [];
  const report = (file, hits) => {
    for (const { line, text } of hits) if (!allowed(file, text, allow)) errors.push(`${file}:${line}  ${text}`);
  };
  const list = (dir) =>
    fs
      .readdirSync(path.join(root, dir))
      .filter((f) => f.endsWith(".tsx"))
      .sort()
      .map((f) => `${dir}/${f}`);

  for (const file of list("src/docs/registry")) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    report(file, vietnameseLines(codeSegments(source), source));
  }
  for (const file of list("src/docs/block-library")) {
    const text = fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
    report(file, vietnameseLines([{ line: 1, text }]));
  }
  // Mục ALLOW không còn khớp dòng nào: xoá đi để danh sách không phình ra.
  for (const a of allow) {
    const file = path.join(root, a.file);
    const lines = fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/).map((l) => l.trim()) : [];
    if (!lines.some((line) => matches(a.match, line))) errors.push(`ALLOW thừa: ${a.file} › ${a.match}`);
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const errors = demoLanguageErrors(root);
  if (errors.length) {
    console.error("Demo / block còn chữ tiếng Việt (dịch sang tiếng Anh, hoặc thêm vào ALLOW kèm lý do nếu demo nói về ngôn ngữ):");
    for (const e of errors) console.error(`✗ ${e}`);
    process.exit(1);
  }
  console.log("check-demo-language: OK — code mẫu và block viết bằng tiếng Anh.");
}
