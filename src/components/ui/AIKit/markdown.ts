/**
 * Yugen Labs · parseMarkdown — bộ phân tích Markdown (CommonMark + GFM rút gọn) thành AST thuần.
 * Không sinh HTML, không dùng `dangerouslySetInnerHTML`: renderer tự dựng React element từ AST.
 * `streaming: true` chịu được chữ đang về dở (fence chưa đóng, `**` chưa đóng, link đang gõ…) mà không nháy.
 */

export type MdAlign = "start" | "center" | "end" | null;

export type MdInline =
  | { type: "text"; text: string }
  | { type: "strong"; children: MdInline[] }
  | { type: "emphasis"; children: MdInline[] }
  | { type: "delete"; children: MdInline[] }
  | { type: "inlineCode"; text: string }
  | { type: "link"; href: string; title?: string; children: MdInline[] }
  | { type: "citation"; index: number; label: string }
  | { type: "softBreak" }
  | { type: "hardBreak" };

export interface MdListItem {
  /** null: mục thường · true / false: mục việc cần làm (`- [x]`). */
  checked: boolean | null;
  children: MdBlock[];
}

export type MdBlock =
  | { type: "paragraph"; raw: string; children: MdInline[] }
  | { type: "heading"; raw: string; level: 1 | 2 | 3 | 4 | 5 | 6; children: MdInline[] }
  | { type: "code"; raw: string; lang: string; text: string; closed: boolean }
  | { type: "list"; raw: string; ordered: boolean; start: number; tight: boolean; items: MdListItem[] }
  | { type: "blockquote"; raw: string; children: MdBlock[] }
  | { type: "table"; raw: string; align: MdAlign[]; head: MdInline[][]; rows: MdInline[][][] }
  | { type: "thematicBreak"; raw: string };

export interface MdRoot {
  type: "root";
  children: MdBlock[];
}

export interface ParseMarkdownOptions {
  /** Chữ còn đang về: khối cuối được phép dở dang (fence, nhấn mạnh, link chưa đóng không hiện ký hiệu thô). */
  streaming?: boolean;
}

/* ================================================================ URL an toàn */

/**
 * Chỉ cho phép link tuyệt đối http / https / mailto. Trả về URL đã làm sạch, hoặc null
 * (javascript:, data:, vbscript:, đường dẫn tương đối, protocol-relative… đều bị loại).
 */
export function sanitizeHref(url: string | undefined | null): string | null {
  if (!url) return null;
  // Trình duyệt bỏ qua ký tự điều khiển / khoảng trắng trong scheme ("java\tscript:") → loại trước khi kiểm tra.
  // eslint-disable-next-line no-control-regex
  const cleaned = url.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "");
  if (/^https?:\/\/[^/]/i.test(cleaned)) return cleaned;
  if (/^mailto:[^\s]+$/i.test(cleaned)) return cleaned;
  return null;
}

/* ================================================================ Inline */

const ASCII_PUNCT = /[!-/:-@[-`{-~]/;
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]+);/gi, (m, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[body.toLowerCase()] ?? m;
  });
}

function pushText(out: MdInline[], text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.type === "text") last.text += text;
  else out.push({ type: "text", text });
}

/** Vị trí ngay sau code span bắt đầu ở `i` (hoặc sau dãy backtick nếu không có cặp đóng). */
function skipCodeSpan(src: string, i: number): number {
  let n = 0;
  while (src[i + n] === "`") n++;
  let k = i + n;
  while (k < src.length) {
    const idx = src.indexOf("`", k);
    if (idx === -1) break;
    let m = 0;
    while (src[idx + m] === "`") m++;
    if (m === n) return idx + n;
    k = idx + m;
  }
  return i + n;
}

const WORD = /[\p{L}\p{N}]/u;
const SPACE = /\s/;

function canOpen(src: string, k: number, m: number, ch: string) {
  const next = src[k + m];
  if (next === undefined || SPACE.test(next)) return false;
  return ch !== "_" || k === 0 || !WORD.test(src[k - 1]);
}

function canClose(src: string, k: number, m: number, ch: string) {
  const prev = src[k - 1];
  if (prev === undefined || SPACE.test(prev)) return false;
  const next = src[k + m];
  return ch !== "_" || next === undefined || !WORD.test(next);
}

type CloserMemo = Map<string, number>;

/** Tìm dãy đóng cho dấu nhấn mạnh dài `n` — bỏ qua code span, escape và cặp lồng bên trong. */
function findCloser(src: string, from: number, ch: string, n: number, memo: CloserMemo): number {
  const key = `${ch}${n}@${from}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;
  let k = from;
  let result = -1;
  while (k < src.length) {
    const c = src[k];
    if (c === "\\") {
      k += 2;
      continue;
    }
    if (c === "`") {
      k = skipCodeSpan(src, k);
      continue;
    }
    if (c !== ch) {
      k++;
      continue;
    }
    let m = 0;
    while (src[k + m] === ch) m++;
    if (canClose(src, k, m, ch) && m >= n) {
      result = k;
      break;
    }
    if (m <= 3 && canOpen(src, k, m, ch)) {
      const nested = findCloser(src, k + m, ch, m, memo);
      if (nested !== -1) {
        k = nested + m;
        continue;
      }
    }
    k += m;
  }
  memo.set(key, result);
  return result;
}

function wrapEmphasis(ch: string, n: number, children: MdInline[]): MdInline {
  if (ch === "~") return { type: "delete", children };
  if (n === 3) return { type: "strong", children: [{ type: "emphasis", children }] };
  return n === 2 ? { type: "strong", children } : { type: "emphasis", children };
}

/** Đích của link: `(url "tiêu đề")` bắt đầu sau dấu "(" ở vị trí `i`. */
function parseDestination(src: string, i: number): { href: string; title?: string; end: number } | null {
  let k = i;
  while (src[k] === " ") k++;
  let href = "";
  if (src[k] === "<") {
    const close = src.indexOf(">", k);
    if (close === -1) return null;
    href = src.slice(k + 1, close);
    k = close + 1;
  } else {
    let depth = 0;
    const start = k;
    while (k < src.length) {
      const c = src[k];
      if (c === "\\") {
        k += 2;
        continue;
      }
      if (SPACE.test(c)) break;
      if (c === "(") depth++;
      else if (c === ")") {
        if (depth === 0) break;
        depth--;
      }
      k++;
    }
    href = src.slice(start, k);
  }
  while (src[k] === " " || src[k] === "\n") k++;
  let title: string | undefined;
  const q = src[k];
  if (q === '"' || q === "'" || q === "(") {
    const closeChar = q === "(" ? ")" : q;
    const close = src.indexOf(closeChar, k + 1);
    if (close === -1) return null;
    title = src.slice(k + 1, close);
    k = close + 1;
    while (src[k] === " ") k++;
  }
  if (src[k] !== ")") return null;
  return { href, title, end: k + 1 };
}

const URL_START = /^(?:https?:\/\/|www\.)[^\s<]+/i;

function trimUrl(url: string) {
  let out = url.replace(/[.,:;!?"'*_~]+$/, "");
  // Ngoặc đóng cuối chỉ thuộc URL khi cân bằng với ngoặc mở bên trong.
  while (out.endsWith(")") && (out.match(/\(/g)?.length ?? 0) < (out.match(/\)/g)?.length ?? 0)) {
    out = out.slice(0, -1).replace(/[.,:;!?"'*_~]+$/, "");
  }
  return out;
}

/** Tách nội dung inline. `open`: đoạn này chạm tới cuối văn bản đang stream. */
export function parseInlines(src: string, open = false): MdInline[] {
  const out: MdInline[] = [];
  const memo: CloserMemo = new Map();
  let buf = "";
  const flush = () => {
    if (buf) pushText(out, decodeEntities(buf));
    buf = "";
  };
  const push = (nodes: MdInline[]) => {
    flush();
    nodes.forEach((node) => (node.type === "text" ? pushText(out, node.text) : out.push(node)));
  };

  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    if (ch === "\\") {
      const next = src[i + 1];
      if (next === "\n") {
        push([{ type: "hardBreak" }]);
        i += 2;
        continue;
      }
      if (next !== undefined && ASCII_PUNCT.test(next)) {
        flush();
        pushText(out, next);
        i += 2;
        continue;
      }
      buf += ch;
      i++;
      continue;
    }

    if (ch === "\n") {
      const hard = / {2,}$/.test(buf);
      buf = buf.replace(/ +$/, "");
      push([{ type: hard ? "hardBreak" : "softBreak" }]);
      i++;
      while (src[i] === " " || src[i] === "\t") i++;
      continue;
    }

    if (ch === "`") {
      let n = 0;
      while (src[i + n] === "`") n++;
      const end = skipCodeSpan(src, i);
      if (end > i + n) {
        let text = src.slice(i + n, end - n).replace(/\n/g, " ");
        if (text.length > 2 && text.startsWith(" ") && text.endsWith(" ") && text.trim()) text = text.slice(1, -1);
        push([{ type: "inlineCode", text }]);
        i = end;
        continue;
      }
      if (open) {
        const text = src.slice(i + n).replace(/\n/g, " ");
        if (text) push([{ type: "inlineCode", text }]);
        else flush();
        i = src.length;
        continue;
      }
      buf += src.slice(i, i + n);
      i += n;
      continue;
    }

    if (ch === "*" || ch === "_" || ch === "~") {
      let n = 0;
      while (src[i + n] === ch) n++;
      const valid = ch === "~" ? n === 2 : n <= 3;
      if (valid && canOpen(src, i, n, ch)) {
        const closer = findCloser(src, i + n, ch, n, memo);
        if (closer !== -1) {
          push([wrapEmphasis(ch, n, parseInlines(src.slice(i + n, closer), false))]);
          i = closer + n;
          continue;
        }
        if (open) {
          const inner = parseInlines(src.slice(i + n), true);
          if (inner.length) push([wrapEmphasis(ch, n, inner)]);
          else flush();
          i = src.length;
          continue;
        }
      } else if (open && i + n === src.length) {
        // Dấu nhấn mạnh vừa gõ ở cuối luồng: ẩn tới khi có chữ theo sau.
        flush();
        i = src.length;
        continue;
      }
      buf += src.slice(i, i + n);
      i += n;
      continue;
    }

    if (ch === "<") {
      const auto = /^<((?:https?|mailto):[^\s<>]+)>/i.exec(src.slice(i)) ?? /^<([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)>/.exec(src.slice(i));
      if (auto) {
        const raw = auto[1].includes(":") ? auto[1] : `mailto:${auto[1]}`;
        const href = sanitizeHref(raw);
        push(href ? [{ type: "link", href, children: [{ type: "text", text: auto[1] }] }] : [{ type: "text", text: auto[1] }]);
        i += auto[0].length;
        continue;
      }
      const br = /^<br\s*\/?>/i.exec(src.slice(i));
      if (br) {
        push([{ type: "hardBreak" }]);
        i += br[0].length;
        continue;
      }
    }

    if ((ch === "h" || ch === "H" || ch === "w" || ch === "W") && (i === 0 || /[\s(*_~]/.test(src[i - 1]))) {
      const m = URL_START.exec(src.slice(i));
      if (m) {
        const url = trimUrl(m[0]);
        const href = sanitizeHref(/^www\./i.test(url) ? `https://${url}` : url);
        if (href && url.length > 4) {
          push([{ type: "link", href, children: [{ type: "text", text: url }] }]);
          i += url.length;
          continue;
        }
      }
    }

    if (ch === "[" || (ch === "!" && src[i + 1] === "[")) {
      const start = ch === "!" ? i + 1 : i;
      const result = parseBracket(src, start, open);
      if (result) {
        push(result.nodes);
        i = result.end;
        continue;
      }
      buf += src.slice(i, start + 1);
      i = start + 1;
      continue;
    }

    buf += ch;
    i++;
  }
  flush();
  return out;
}

function parseBracket(src: string, i: number, open: boolean): { nodes: MdInline[]; end: number } | null {
  let depth = 0;
  let k = i;
  for (; k < src.length; k++) {
    const c = src[k];
    if (c === "\\") {
      k++;
      continue;
    }
    if (c === "`") {
      k = skipCodeSpan(src, k) - 1;
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]" && --depth === 0) break;
  }
  if (k >= src.length) {
    // Chú thích nguồn đang gõ dở ở cuối luồng ("[1", "[^"): ẩn.
    if (open && /^\[\^?\d{0,3}$/.test(src.slice(i))) return { nodes: [], end: src.length };
    return null;
  }
  const label = src.slice(i + 1, k);
  if (src[k + 1] === "(") {
    const dest = parseDestination(src, k + 2);
    const children = parseInlines(label, false);
    if (dest) {
      const href = sanitizeHref(dest.href);
      return {
        nodes: href ? [{ type: "link", href, ...(dest.title ? { title: dest.title } : {}), children }] : children,
        end: dest.end,
      };
    }
    // Link đang gõ dở URL: chỉ hiện nhãn.
    if (open && !src.slice(k + 2).includes(")")) return { nodes: children, end: src.length };
    return null;
  }
  const citation = /^\^?(\d{1,3})$/.exec(label);
  if (citation) return { nodes: [{ type: "citation", index: Number(citation[1]), label: `[${label}]` }], end: k + 1 };
  return null;
}

/* ================================================================ Block */

const FENCE_OPEN = /^( {0,3})(`{3,}|~{3,})[ \t]*([^\s`]*)[^`]*$/;
const ATX = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const HR = /^ {0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const QUOTE = /^ {0,3}> ?/;
const LIST_ITEM = /^( {0,3})(?:([-+*])|(\d{1,9})([.)]))(?=[ \t]|$)([ \t]*)(.*)$/;
const SETEXT = /^ {0,3}(=+|-+)[ \t]*$/;
const DELIM_CELL = /^:?-+:?$/;
const DELIM_CELL_PARTIAL = /^:?-*:?$/;

interface ListMarker {
  indent: number;
  bullet?: string;
  ordered: boolean;
  start: number;
  delim: string;
  contentIndent: number;
  content: string;
}

function matchListItem(line: string): ListMarker | null {
  const m = LIST_ITEM.exec(line);
  if (!m) return null;
  const indent = m[1].length;
  const markerLen = m[2] ? 1 : m[3].length + 1;
  const spaces = m[5].length;
  let content = m[6];
  let contentIndent = indent + markerLen + spaces;
  if (content === "") contentIndent = indent + markerLen + 1;
  else if (spaces > 4) {
    contentIndent = indent + markerLen + 1;
    content = " ".repeat(spaces - 1) + content;
  }
  return {
    indent,
    bullet: m[2],
    ordered: !m[2],
    start: m[3] ? Number(m[3]) : 1,
    delim: m[4] ?? "",
    contentIndent,
    content,
  };
}

const isBlank = (line: string) => line.trim() === "";
const indentOf = (line: string) => line.length - line.trimStart().length;

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = "";
  for (let k = 0; k < s.length; k++) {
    if (s[k] === "\\" && s[k + 1] === "|") {
      cur += "|";
      k++;
    } else if (s[k] === "|") {
      cells.push(cur.trim());
      cur = "";
    } else cur += s[k];
  }
  cells.push(cur.trim());
  return cells;
}

function delimiterAlign(line: string, partial: boolean): MdAlign[] | null {
  if (!line.includes("-") && !(partial && line.includes("|"))) return null;
  if (!/^[\s|:-]+$/.test(line)) return null;
  const cells = splitRow(line);
  const ok = cells.every((c, idx) => DELIM_CELL.test(c) || (partial && idx === cells.length - 1 && DELIM_CELL_PARTIAL.test(c)));
  if (!ok) return null;
  return cells.map((c) => (c.startsWith(":") && c.endsWith(":") && c.length > 1 ? "center" : c.endsWith(":") ? "end" : c.startsWith(":") ? "start" : null));
}

function isTableStart(lines: string[], i: number, open: boolean) {
  const head = lines[i];
  const next = lines[i + 1];
  if (!head.includes("|")) return false;
  if (next === undefined) return open && /^\s*\|/.test(head);
  const partial = open && i + 1 === lines.length - 1;
  const align = delimiterAlign(next, partial);
  const cells = splitRow(head).length;
  return align !== null && (align.length === cells || (partial && align.length <= cells)) && (/^\s*\|/.test(head) || cells > 1);
}

function startsBlock(line: string) {
  if (FENCE_OPEN.test(line) || ATX.test(line) || HR.test(line) || QUOTE.test(line)) return true;
  return matchListItem(line) !== null;
}

/** Dòng có cắt ngang đoạn văn được không (danh sách có số chỉ khi bắt đầu từ 1, mục rỗng thì không). */
function interruptsParagraph(line: string) {
  if (FENCE_OPEN.test(line) || ATX.test(line) || HR.test(line) || QUOTE.test(line)) return true;
  const item = matchListItem(line);
  return !!item && item.content.trim() !== "" && (!item.ordered || item.start === 1);
}

interface Parsed {
  blocks: MdBlock[];
  /** Dòng bắt đầu của từng khối (để phân tích tăng dần khi stream). */
  starts: number[];
}

/** `open`: dòng cuối của `lines` là cuối văn bản đang stream. */
function parseBlocks(lines: string[], from: number, open: boolean): Parsed {
  const blocks: MdBlock[] = [];
  const starts: number[] = [];
  const n = lines.length;
  let i = from;

  while (i < n) {
    const line = lines[i];
    if (isBlank(line)) {
      i++;
      continue;
    }
    const start = i;
    const add = (block: MdBlock, next: number) => {
      blocks.push(block);
      starts.push(start);
      i = next;
    };

    // Dấu fence đang gõ dở ở dòng cuối ("`", "``"): chưa hiện gì.
    if (open && i === n - 1 && /^ {0,3}(`{1,2}|~{1,2})$/.test(line)) break;

    const fence = FENCE_OPEN.exec(line);
    if (fence) {
      const indent = fence[1].length;
      const marker = fence[2];
      const body: string[] = [];
      let j = i + 1;
      let closed = false;
      const closeRe = new RegExp(`^ {0,3}${marker[0] === "`" ? "`" : "~"}{${marker.length},}[ \\t]*$`);
      while (j < n) {
        if (closeRe.test(lines[j])) {
          closed = true;
          j++;
          break;
        }
        body.push(lines[j].replace(new RegExp(`^ {0,${indent}}`), ""));
        j++;
      }
      // Dấu đóng đang gõ dở ở cuối luồng không thuộc nội dung code.
      if (!closed && open && body.length && new RegExp(`^ {0,3}\\${marker[0]}{1,${marker.length}}$`).test(body[body.length - 1])) body.pop();
      add({ type: "code", raw: lines.slice(i, j).join("\n"), lang: fence[3] ?? "", text: body.join("\n"), closed }, j);
      continue;
    }

    const atx = ATX.exec(line);
    if (atx) {
      const text = (atx[2] ?? "").replace(/^#+$/, "");
      add({ type: "heading", raw: line, level: atx[1].length as 1, children: parseInlines(text, open && i === n - 1) }, i + 1);
      continue;
    }

    if (HR.test(line)) {
      add({ type: "thematicBreak", raw: line }, i + 1);
      continue;
    }

    if (QUOTE.test(line)) {
      const inner: string[] = [];
      let j = i;
      while (j < n) {
        const l = lines[j];
        if (QUOTE.test(l)) inner.push(l.replace(QUOTE, ""));
        else if (!isBlank(l) && inner.length && !isBlank(inner[inner.length - 1]) && !startsBlock(l)) inner.push(l);
        else break;
        j++;
      }
      add(
        { type: "blockquote", raw: lines.slice(i, j).join("\n"), children: parseBlocks(inner, 0, open && j === n).blocks },
        j,
      );
      continue;
    }

    const first = matchListItem(line);
    if (first) {
      const items: MdListItem[] = [];
      let tight = true;
      let j = i;
      let marker: ListMarker | null = first;
      while (marker) {
        const itemLines = [marker.content];
        j++;
        let lastBlank = false;
        let blankInside = false;
        while (j < n) {
          const l = lines[j];
          if (isBlank(l)) {
            itemLines.push("");
            lastBlank = true;
            j++;
            continue;
          }
          const ind = indentOf(l);
          // Thụt đủ sâu, hoặc danh sách con thụt ít hơn chuẩn (thói quen phổ biến của LLM: 2 dấu cách dưới "1.").
          const nestedList = ind > marker.indent && ind >= 2 && matchListItem(l.trimStart()) !== null;
          if (ind >= marker.contentIndent || nestedList) {
            itemLines.push(l.slice(Math.min(ind, marker.contentIndent)));
            if (lastBlank) blankInside = true;
            lastBlank = false;
            j++;
            continue;
          }
          if (lastBlank || startsBlock(l)) break;
          itemLines.push(l); // dòng nối lười của đoạn văn
          j++;
        }
        let trailingBlank = false;
        while (itemLines.length > 1 && itemLines[itemLines.length - 1] === "") {
          itemLines.pop();
          trailingBlank = true;
        }
        const task = /^\[([ xX])\](?:[ \t]+|$)/.exec(itemLines[0]);
        if (task) itemLines[0] = itemLines[0].slice(task[0].length);
        const itemOpen = open && j === n;
        items.push({ checked: task ? task[1] !== " " : null, children: parseBlocks(itemLines, 0, itemOpen).blocks });
        if (blankInside) tight = false;

        const next = j < n ? matchListItem(lines[j]) : null;
        const sameList =
          next !== null &&
          !HR.test(lines[j]) &&
          next.ordered === first.ordered &&
          (first.ordered ? next.delim === first.delim : next.bullet === first.bullet);
        if (sameList && trailingBlank) tight = false;
        marker = sameList ? next : null;
        if (!sameList && trailingBlank) {
          // Lùi lại dòng trống cuối để không nuốt khoảng cách giữa khối.
          while (j > i && isBlank(lines[j - 1])) j--;
        }
      }
      add(
        { type: "list", raw: lines.slice(i, j).join("\n"), ordered: first.ordered, start: first.start, tight, items },
        j,
      );
      continue;
    }

    if (isTableStart(lines, i, open)) {
      const head = splitRow(line).map((c) => parseInlines(c, false));
      const delim = lines[i + 1];
      const align = delim !== undefined ? delimiterAlign(delim, open && i + 1 === n - 1) ?? [] : [];
      let j = delim !== undefined ? i + 2 : i + 1;
      const rows: MdInline[][][] = [];
      while (j < n && !isBlank(lines[j]) && !startsBlock(lines[j])) {
        const cells = splitRow(lines[j]);
        const rowOpen = open && j === n - 1;
        rows.push(head.map((_, c) => parseInlines(cells[c] ?? "", rowOpen && c === cells.length - 1)));
        j++;
      }
      add(
        { type: "table", raw: lines.slice(i, j).join("\n"), align: head.map((_, c) => align[c] ?? null), head, rows },
        j,
      );
      continue;
    }

    // Đoạn văn (+ heading setext).
    const para = [line.trim()];
    let j = i + 1;
    let level: 1 | 2 | null = null;
    while (j < n) {
      const l = lines[j];
      if (isBlank(l)) break;
      const setext = SETEXT.exec(l);
      // Dòng gạch cuối luồng có thể là đầu danh sách đang gõ — chưa coi là setext.
      if (setext && !(open && j === n - 1)) {
        level = setext[1][0] === "=" ? 1 : 2;
        j++;
        break;
      }
      if (interruptsParagraph(l) || isTableStart(lines, j, open)) break;
      if (open && j === n - 1 && /^ {0,3}(`{1,2}|~{1,2})$/.test(l)) break;
      para.push(l.trim());
      j++;
    }
    const raw = lines.slice(i, j).join("\n");
    const inlineOpen = open && j >= n;
    const children = parseInlines(para.join("\n"), inlineOpen);
    if (level) add({ type: "heading", raw, level, children }, j);
    else add({ type: "paragraph", raw, children }, j);
  }

  return { blocks, starts };
}

function toLines(text: string) {
  return text.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/^\t+/, (m) => "    ".repeat(m.length)));
}

/** Phân tích Markdown thành AST. Hàm thuần — dùng được ở server, worker hoặc test. */
export function parseMarkdown(text: string, { streaming = false }: ParseMarkdownOptions = {}): MdRoot {
  return { type: "root", children: parseBlocks(toLines(text), 0, streaming).blocks };
}

/* ================================================================ Phân tích tăng dần */

export interface MarkdownParseState {
  text: string;
  streaming: boolean;
  blocks: MdBlock[];
  starts: number[];
}

/**
 * Phân tích lại chỉ phần đuôi khi văn bản chỉ được nối thêm: các khối trước hai khối cuối đã ổn định,
 * giữ nguyên tham chiếu object (để React.memo bỏ qua render lại).
 */
export function parseMarkdownIncremental(text: string, streaming: boolean, prev: MarkdownParseState | null): MarkdownParseState {
  if (prev && prev.text === text && prev.streaming === streaming) return prev;
  const lines = toLines(text);
  if (streaming && prev && prev.streaming && text.startsWith(prev.text) && prev.blocks.length > 2) {
    const keep = prev.blocks.length - 2;
    const tail = parseBlocks(lines, prev.starts[keep], true);
    return {
      text,
      streaming,
      blocks: prev.blocks.slice(0, keep).concat(tail.blocks),
      starts: prev.starts.slice(0, keep).concat(tail.starts),
    };
  }
  const full = parseBlocks(lines, 0, streaming);
  // Khối không đổi so với lần trước (cùng raw) giữ tham chiếu cũ.
  const blocks = full.blocks.map((b, k) => {
    const old = prev?.blocks[k];
    return old && old.raw === b.raw && old.type === b.type && k < full.blocks.length - 1 ? old : b;
  });
  return { text, streaming, blocks, starts: full.starts };
}

/* ================================================================ Văn bản thuần */

function inlineText(nodes: MdInline[]): string {
  return nodes
    .map((n) => {
      switch (n.type) {
        case "text":
        case "inlineCode":
          return n.text;
        case "citation":
          return n.label;
        case "softBreak":
        case "hardBreak":
          return " ";
        default:
          return inlineText(n.children);
      }
    })
    .join("");
}

function blockText(block: MdBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
      return inlineText(block.children);
    case "code":
      return block.text;
    case "list":
      return block.items.map((it) => it.children.map(blockText).join(" ")).join(". ");
    case "blockquote":
      return block.children.map(blockText).join(" ");
    case "table":
      return [block.head, ...block.rows].map((row) => row.map(inlineText).join(", ")).join(". ");
    default:
      return "";
  }
}

/** Văn bản thuần (bỏ ký hiệu Markdown) — để đọc qua live region hoặc làm preview. */
export function markdownToPlainText(input: string | MdRoot | MdBlock[]): string {
  const blocks = typeof input === "string" ? parseMarkdown(input).children : Array.isArray(input) ? input : input.children;
  return blocks
    .map(blockText)
    .filter(Boolean)
    .join("\n")
    .trim();
}
