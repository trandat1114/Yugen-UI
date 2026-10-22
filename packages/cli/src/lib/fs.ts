import fs from "node:fs";
import path from "node:path";

export const exists = (file: string) => fs.existsSync(file);
export const readText = (file: string) => fs.readFileSync(file, "utf8");
export const toPosix = (p: string) => p.split(path.sep).join("/");
/** So nội dung bỏ qua khác biệt CRLF / LF (git autocrlf trên Windows). */
export const sameText = (a: string, b: string) => a.replace(/\r\n/g, "\n") === b.replace(/\r\n/g, "\n");

export function writeText(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export const writeJson = (file: string, data: unknown) => writeText(file, JSON.stringify(data, null, 2) + "\n");

/** JSON có chú thích và dấu phẩy thừa (tsconfig.json, jsconfig.json). */
export function parseJsonc<T = unknown>(text: string): T {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      out += c;
      if (c === "\\") out += text[++i] ?? "";
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (c === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i + 2);
      if (i === -1) break;
      i++;
    } else out += c;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1")) as T;
}

/** Thư mục rỗng (hoặc chưa có, hoặc chỉ có .git). */
export function isEmptyDir(dir: string) {
  return !exists(dir) || fs.readdirSync(dir).every((f) => f === ".git");
}

/** Chép thư mục; `rename` đổi tên từng file (vd. _gitignore → .gitignore). */
export function copyDir(from: string, to: string, rename: (name: string) => string = (n) => n) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    if (entry.isDirectory()) copyDir(src, path.join(to, entry.name), rename);
    else fs.copyFileSync(src, path.join(to, rename(entry.name)));
  }
}

const SKIP = new Set(["node_modules", ".git", "dist", "build", ".next", ".output", ".vercel", "coverage"]);

/** Liệt kê file khớp `pattern` trong `dir` (bỏ node_modules, dist…), sâu tối đa `maxDepth`. */
export function walk(dir: string, pattern: RegExp, maxDepth = 6): string[] {
  const out: string[] = [];
  const visit = (d: string, depth: number) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!SKIP.has(e.name) && depth < maxDepth) visit(path.join(d, e.name), depth + 1);
      } else if (pattern.test(e.name)) out.push(path.join(d, e.name));
    }
  };
  visit(dir, 0);
  return out.sort();
}
