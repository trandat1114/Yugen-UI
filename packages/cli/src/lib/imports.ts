/**
 * Import trong mã JS / TS / JSX / MDX, đọc bằng một lexer nhỏ viết riêng cho CLI (không thêm gói npm nào). Lexer bỏ qua
 * chú thích, chuỗi, template literal, regex và chữ trong JSX, nên `import { Dialog } from "yugen-ui"` viết trong một chuỗi
 * hay một khối mã ví dụ không được tính. Chỉ cần nhận ra câu lệnh import / export, không cần hiểu cả cú pháp.
 *
 * Chỗ mơ hồ của một lexer: `/` (chia hay regex) và `<` (so sánh, generic hay JSX) quyết định theo token đứng trước, như
 * Babel / esbuild. `<` mở JSX mà không đóng được (vd. `type F = <T>(x: T) => T` trong .tsx) thì quay lại đọc như mã thường.
 * src/test/cli-css.test.ts ở gốc repo so kết quả với parser Oxc (Vite) trên mọi file .ts / .tsx của repo.
 */

export interface ModuleImport {
  /** Đường dẫn module: "yugen-ui", "yugen-ui/Button", "./App"… */
  from: string;
  /** Tên export của module được import (vế trái của `as`): "Button", "default". Rỗng với `import "x"`. */
  names: string[];
  /**
   * Mọi export đều có thể được dùng: `import * as X`, `export * from`, `import("x")`, `require("x")`, `import X = require("x")`.
   * Khi đó `names` rỗng và `kind` cho biết cú pháp.
   */
  all: boolean;
  kind: "named" | "namespace" | "star" | "dynamic" | "require" | "side-effect";
}

type Kind = "name" | "str" | "punct" | "value";
interface Token {
  k: Kind;
  v: string;
}

// Từ khoá đứng ngay trước một biểu thức: sau chúng `/` mở regex và `<` mở JSX.
const BEFORE_EXPR = new Set(["return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await", "default"]);
// Dấu kết thúc một toán hạng: sau chúng `/` là phép chia, `<` là so sánh.
const AFTER_OPERAND = new Set([")", "]", "}", "++", "--"]);
const PUNCTS = [">>>=", "...", "===", "!==", "**=", "<<=", ">>=", ">>>", "&&=", "||=", "??=", "=>", "==", "!=", "<=", ">=", "&&", "||", "??", "?.", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "**", "<<", ">>"];

const isSpace = (c: number) => c === 32 || c === 9 || c === 10 || c === 13 || c === 0xa0 || c === 0xfeff || c === 0x2028 || c === 0x2029 || c === 11 || c === 12;
const isDigit = (c: number) => c >= 48 && c <= 57;
const isIdStart = (c: number) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 36 || c === 95 || c > 127;
const isIdPart = (c: number) => isIdStart(c) || isDigit(c);

class Lexer {
  pos = 0;
  readonly tokens: Token[] = [];
  readonly src: string;
  readonly jsx: boolean;

  constructor(src: string, jsx: boolean) {
    this.src = src;
    this.jsx = jsx;
    if (src.startsWith("#!")) this.skipLine();
  }

  private at(i = this.pos) {
    return this.src.charCodeAt(i);
  }

  private skipLine() {
    const end = this.src.indexOf("\n", this.pos);
    this.pos = end === -1 ? this.src.length : end;
  }

  /** Bỏ khoảng trắng và chú thích; true nếu đã bỏ được gì đó. */
  private skipTrivia() {
    const start = this.pos;
    for (;;) {
      const c = this.at();
      if (isSpace(c)) this.pos++;
      else if (c === 47 && this.at(this.pos + 1) === 47) this.skipLine();
      else if (c === 47 && this.at(this.pos + 1) === 42) {
        const end = this.src.indexOf("*/", this.pos + 2);
        this.pos = end === -1 ? this.src.length : end + 2;
      } else return this.pos > start;
    }
  }

  /**
   * Mã JS cho tới hết file, hoặc (`nested`) tới dấu `}` không khớp: phần `${…}` của template literal, `{…}` trong JSX.
   * `prev` là token đáng kể đứng trước trong cùng ngữ cảnh, để phân biệt `/` và `<`.
   */
  code(nested: boolean) {
    const s = this.src;
    let depth = 0;
    let prev: Token | undefined;
    const push = (k: Kind, v: string) => {
      prev = { k, v };
      this.tokens.push(prev);
    };
    const exprAllowed = () =>
      !prev || (prev.k === "name" ? BEFORE_EXPR.has(prev.v) : prev.k === "punct" && !AFTER_OPERAND.has(prev.v));

    while (this.pos < s.length) {
      if (this.skipTrivia()) continue;
      const c = this.at();
      if (c === 34 || c === 39) push("str", this.string(c));
      else if (c === 96) {
        const raw = this.template();
        push(raw === null ? "value" : "str", raw ?? "");
      } else if (isIdStart(c) || c === 35 /* # */) {
        const start = this.pos++;
        while (this.pos < s.length && isIdPart(this.at())) this.pos++;
        push("name", s.slice(start, this.pos));
      } else if (isDigit(c) || (c === 46 && isDigit(this.at(this.pos + 1)))) {
        const start = this.pos++;
        while (this.pos < s.length && (isIdPart(this.at()) || this.at() === 46)) this.pos++;
        push("value", s.slice(start, this.pos));
      } else if (c === 47 && exprAllowed() && this.regex()) push("value", "/regex/");
      else if (c === 60 && this.jsx && exprAllowed() && this.jsxStart()) {
        const save = { pos: this.pos, tokens: this.tokens.length };
        if (this.element()) push("value", "<jsx>");
        else {
          this.pos = save.pos + 1;
          this.tokens.length = save.tokens;
          push("punct", "<");
        }
      } else if (c === 123) {
        this.pos++;
        depth++;
        push("punct", "{");
      } else if (c === 125) {
        this.pos++;
        if (nested && depth === 0) return;
        if (depth > 0) depth--;
        push("punct", "}");
      } else {
        const op = PUNCTS.find((p) => s.startsWith(p, this.pos)) ?? s[this.pos];
        this.pos += op.length;
        push("punct", op);
      }
    }
  }

  /** Chuỗi '…' / "…"; dừng ở cuối dòng nếu thiếu dấu đóng. Trả về nội dung thô (không giải escape). */
  private string(quote: number) {
    const start = ++this.pos;
    while (this.pos < this.src.length) {
      const c = this.at();
      if (c === 92) this.pos += 2;
      else if (c === quote) return this.src.slice(start, this.pos++);
      else if (c === 10) break;
      else this.pos++;
    }
    return this.src.slice(start, this.pos);
  }

  /** Template literal; phần `${…}` đọc như mã. Trả về nội dung khi không có `${}`, ngược lại null. */
  private template(): string | null {
    const start = ++this.pos;
    let plain = true;
    while (this.pos < this.src.length) {
      const c = this.at();
      if (c === 92) this.pos += 2;
      else if (c === 96) {
        const raw = this.src.slice(start, this.pos++);
        return plain ? raw : null;
      } else if (c === 36 && this.at(this.pos + 1) === 123) {
        plain = false;
        this.pos += 2;
        this.code(true);
      } else this.pos++;
    }
    return null;
  }

  /** Regex literal (đang ở `/`); false nếu tới cuối dòng mà chưa đóng (khi đó `/` là phép chia). */
  private regex() {
    let i = this.pos + 1;
    let inClass = false;
    for (;;) {
      const c = this.at(i);
      if (Number.isNaN(c) || c === 10 || c === 13) return false;
      if (c === 92) i += 2;
      else {
        if (c === 91) inClass = true;
        else if (c === 93) inClass = false;
        else if (c === 47 && !inClass) break;
        i++;
      }
    }
    i++;
    while (isIdPart(this.at(i))) i++;
    this.pos = i;
    return true;
  }

  /** `<` (ở vị trí biểu thức) mở JSX? `<T,>` / `<T extends …>` / `<const T>` là tham số generic của arrow function. */
  private jsxStart() {
    const s = this.src;
    let i = this.pos + 1;
    if (s[i] === ">") return true;
    if (!isIdStart(this.at(i))) return false;
    const start = i;
    while (isIdPart(this.at(i))) i++;
    const word = s.slice(start, i);
    while (isSpace(this.at(i))) i++;
    if (word === "const" && isIdStart(this.at(i))) return false;
    if (s[i] === ",") return false;
    if (s.startsWith("extends", i) && isSpace(this.at(i + 7))) {
      let j = i + 7;
      while (isSpace(this.at(j))) j++;
      return s[j] === "=" || s[j] === ">" || s[j] === "/";
    }
    return true;
  }

  /** Tên thẻ / thuộc tính JSX: `div`, `Menu.Item`, `aria-label`, `xlink:href`. */
  private jsxName() {
    const start = this.pos;
    if (!isIdStart(this.at())) return "";
    while (this.pos < this.src.length) {
      const c = this.at();
      if (isIdPart(c) || c === 45 || c === 46 || c === 58) this.pos++;
      else break;
    }
    return this.src.slice(start, this.pos);
  }

  /** `<Select<Option> …>`: bỏ qua đối số kiểu của thẻ. */
  private typeArgs() {
    let depth = 0;
    while (this.pos < this.src.length) {
      const c = this.at();
      if (c === 61 && this.at(this.pos + 1) === 62) this.pos += 2;
      else if (c === 34 || c === 39) this.string(c);
      else {
        this.pos++;
        if (c === 60) depth++;
        else if (c === 62 && --depth === 0) return true;
      }
    }
    return false;
  }

  /** Một phần tử JSX (đang ở `<`) gồm cả con; false nếu không đọc được như JSX (gọi bên ngoài sẽ quay lui). */
  private element(): boolean {
    const s = this.src;
    this.pos++;
    this.skipTrivia();
    let name = "";
    if (s[this.pos] === ">") this.pos++;
    else {
      name = this.jsxName();
      if (!name) return false;
      this.skipTrivia();
      if (s[this.pos] === "<" && !this.typeArgs()) return false;
      for (;;) {
        this.skipTrivia();
        const c = s[this.pos];
        if (c === undefined) return false;
        if (c === "/") {
          if (s[this.pos + 1] !== ">") return false;
          this.pos += 2;
          return true;
        }
        if (c === ">") {
          this.pos++;
          break;
        }
        if (c === "{") {
          this.pos++;
          this.code(true);
          continue;
        }
        if (!this.jsxName()) return false;
        this.skipTrivia();
        if (s[this.pos] !== "=") continue;
        this.pos++;
        this.skipTrivia();
        const v = s[this.pos];
        if (v === '"' || v === "'") {
          const end = s.indexOf(v, this.pos + 1);
          if (end === -1) return false;
          this.pos = end + 1;
        } else if (v === "{") {
          this.pos++;
          this.code(true);
        } else if (v === "<") {
          if (!this.element()) return false;
        } else return false;
      }
    }
    // Con: chữ (kể cả ' " // /* `), {biểu thức}, phần tử con, rồi thẻ đóng cùng tên.
    for (;;) {
      const c = s[this.pos];
      if (c === undefined) return false;
      if (c === "{") {
        this.pos++;
        this.code(true);
      } else if (c === "<") {
        let i = this.pos + 1;
        while (isSpace(this.at(i))) i++;
        if (s[i] !== "/") {
          if (!this.element()) return false;
          continue;
        }
        this.pos = i + 1;
        this.skipTrivia();
        const close = s[this.pos] === ">" ? "" : this.jsxName();
        this.skipTrivia();
        if (close !== name || s[this.pos] !== ">") return false;
        this.pos++;
        return true;
      } else this.pos++;
    }
  }
}

/** Đuôi file đọc được: mã JS / TS (JSX tuỳ đuôi) và MDX (chỉ các khối import / export). */
export const CODE_FILE = /\.(?:[cm]?[jt]sx?|mdx)$/;

/**
 * MDX: khối ESM là đoạn (ngăn bởi dòng trống) bắt đầu bằng `import` / `export` ở đầu dòng; phần còn lại là Markdown.
 * Khối mã ``` / ~~~ là Markdown kể cả khi có dòng trống bên trong (`"use client";`, dòng trống, rồi `import …`).
 */
function mdxEsm(text: string) {
  const out: string[] = [];
  let fence = ""; // dấu mở của khối mã đang mở
  let esm = false;
  let markdown = false; // đang trong một đoạn Markdown (chưa gặp dòng trống)
  for (const line of text.split(/\r?\n/)) {
    if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/)?.[1];
      if (close && close[0] === fence[0] && close.length >= fence.length) fence = "";
      out.push("");
    } else if (!line.trim()) {
      esm = markdown = false;
      out.push("");
    } else if (esm || (!markdown && /^(?:import|export)\b/.test(line))) {
      esm = true;
      out.push(line);
    } else {
      const open = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      // ```` ```js ```` mở khối mã; `` ``` a ` `` (có backtick sau dấu mở) là code inline.
      if (open && !(open[1][0] === "`" && open[2].includes("`"))) fence = open[1];
      else markdown = true;
      out.push("");
    }
  }
  return out.join("\n");
}

/** Specifier trong `{ … }` của import / export: `[type] name [as alias]`, phân tách bằng dấu phẩy. */
function specifiers(tokens: Token[], i: number): { names: string[]; end: number } | null {
  const names: string[] = [];
  let j = i + 1;
  while (j < tokens.length) {
    const t = tokens[j];
    if (t.k === "punct" && t.v === "}") return { names, end: j + 1 };
    if (t.k === "punct" && t.v === ",") {
      j++;
      continue;
    }
    if (t.k !== "name" && t.k !== "str") return null;
    // `type X` / `type X as Y`: chỉ là kiểu. `type`, `type as X`, `type as as X` là binding tên "type".
    const next = tokens[j + 1];
    const typeOnly =
      t.k === "name" &&
      t.v === "type" &&
      (next?.k === "str" || (next?.k === "name" && (next.v !== "as" || (tokens[j + 2]?.k === "name" && tokens[j + 2].v === "as"))));
    if (typeOnly) j++;
    const name = tokens[j].v;
    j++;
    if (tokens[j]?.k === "name" && tokens[j].v === "as") j += 2;
    if (!typeOnly) names.push(name);
  }
  return null;
}

/** `from "x"` ở vị trí `i`; trả về specifier hoặc null. */
const fromAt = (tokens: Token[], i: number) =>
  tokens[i]?.k === "name" && tokens[i].v === "from" && tokens[i + 1]?.k === "str" ? tokens[i + 1].v : null;

/** Import (giá trị, không gồm `import type`) trong một file. `file` chỉ dùng để chọn cú pháp theo đuôi. */
export function findImports(code: string, file = "file.tsx"): ModuleImport[] {
  const ext = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
  const source = ext === "mdx" ? mdxEsm(code) : code;
  // JSX chỉ không có trong .ts / .mts / .cts (ở đó `<T>x` là ép kiểu); .js cũng có thể chứa JSX.
  const lexer = new Lexer(source, !/^[cm]?ts$/.test(ext));
  lexer.code(false);
  const tokens = lexer.tokens;
  const out: ModuleImport[] = [];
  const is = (i: number, k: Kind, v?: string) => tokens[i]?.k === k && (v === undefined || tokens[i].v === v);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.k !== "name" || is(i - 1, "punct", ".") || is(i - 1, "punct", "?.")) continue;

    if (t.v === "require" && is(i + 1, "punct", "(") && is(i + 2, "str") && is(i + 3, "punct", ")")) {
      out.push({ from: tokens[i + 2].v, names: [], all: true, kind: "require" });
      continue;
    }

    if (t.v === "import") {
      if (is(i + 1, "punct", "(")) {
        // Kiểu, không phải giá trị: `typeof import("x")`, `import("x").ButtonProps` (Promise chỉ có then / catch / finally).
        const typeQuery =
          is(i - 1, "name", "typeof") ||
          (is(i + 3, "punct", ")") && is(i + 4, "punct", ".") && is(i + 5, "name") && !["then", "catch", "finally"].includes(tokens[i + 5].v));
        if (is(i + 2, "str") && (is(i + 3, "punct", ")") || is(i + 3, "punct", ",")) && !typeQuery)
          out.push({ from: tokens[i + 2].v, names: [], all: true, kind: "dynamic" });
        continue;
      }
      if (is(i + 1, "str")) {
        out.push({ from: tokens[i + 1].v, names: [], all: false, kind: "side-effect" });
        continue;
      }
      let j = i + 1;
      // import [type] X = require("x"): bỏ qua cả lời gọi require để nhánh `require(` bên dưới không đếm lại.
      const eq = is(j, "name", "type") && is(j + 1, "name") && is(j + 2, "punct", "=") ? j + 1 : j;
      if (is(eq, "name") && is(eq + 1, "punct", "=")) {
        if (is(eq + 2, "name", "require") && is(eq + 3, "punct", "(") && is(eq + 4, "str")) {
          if (eq === j) out.push({ from: tokens[eq + 4].v, names: [], all: true, kind: "require" });
          i = eq + 4;
        }
        continue;
      }
      // `import type …` chỉ là kiểu, trừ `import type from "x"` / `import type, { … }` (binding mặc định tên "type").
      if (is(j, "name", "type") && !fromAt(tokens, j + 1) && !is(j + 1, "punct", ",")) continue;
      const names: string[] = [];
      let kind: ModuleImport["kind"] = "named";
      if (is(j, "name") && tokens[j].v !== "from") {
        names.push("default");
        j++;
        if (is(j, "punct", ",")) j++;
      } else if (is(j, "name", "from") && fromAt(tokens, j + 1)) {
        // `import from from "x"`: binding mặc định tên "from".
        names.push("default");
        j++;
      }
      if (is(j, "punct", "*") && is(j + 1, "name", "as") && is(j + 2, "name")) {
        kind = "namespace";
        j += 3;
      } else if (is(j, "punct", "{")) {
        const list = specifiers(tokens, j);
        if (!list) continue;
        names.push(...list.names);
        j = list.end;
      }
      const from = fromAt(tokens, j);
      if (from === null) continue;
      out.push(kind === "namespace" ? { from, names: [], all: true, kind } : { from, names, all: false, kind });
      i = j + 1;
      continue;
    }

    if (t.v === "export") {
      const j = i + 1;
      if (is(j, "punct", "*")) {
        // export * from "x" / export * as ns from "x"
        const k = is(j + 1, "name", "as") ? j + 3 : j + 1;
        const from = fromAt(tokens, k);
        if (from !== null) out.push({ from, names: [], all: true, kind: "star" });
      } else if (is(j, "punct", "{")) {
        // export { a, b as c } from "x" (không có `from` là export tên cục bộ, bỏ qua)
        const list = specifiers(tokens, j);
        const from = list ? fromAt(tokens, list.end) : null;
        if (list && from !== null) out.push({ from, names: list.names, all: false, kind: "named" });
      }
    }
  }
  return out;
}
