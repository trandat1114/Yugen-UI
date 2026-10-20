/** Yugen Labs · CodeBlock, CodeTabs, PackageManagerTabs — khối code có tô màu cú pháp tự viết (không Prism/Shiki). */
import * as React from "react";
import {
  Checkmark16Regular,
  ChevronDown16Regular,
  ChevronUp16Regular,
  Copy16Regular,
  Document16Regular,
  TextWrap16Regular,
  TextWrapOff16Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Tabs/Tabs";
import { useYugen } from "../YugenProvider/context";

/* ================================================================ Tokenizer */

export type CodeLanguage = "tsx" | "ts" | "jsx" | "js" | "css" | "html" | "bash" | "json" | "md" | "text";

export type CodeTokenType =
  | "plain"
  | "comment"
  | "keyword"
  | "string"
  | "number"
  | "tag"
  | "attr"
  | "property"
  | "type"
  | "function"
  | "variable"
  | "punct"
  | "heading"
  | "strong"
  | "emphasis"
  | "link";

export interface CodeToken {
  type: CodeTokenType;
  text: string;
}

interface Rule {
  /** Luôn có cờ `y` (sticky). */
  re: RegExp;
  type: CodeTokenType | null;
  when?: (code: string, index: number) => boolean;
  push?: string;
  pop?: number;
  swap?: string;
}

type Grammar = Record<string, Rule[]>;

function runGrammar(code: string, grammar: Grammar, start: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  const stack = [start];
  let plain = "";
  let i = 0;
  const flush = () => {
    if (plain) tokens.push({ type: "plain", text: plain });
    plain = "";
  };
  outer: while (i < code.length) {
    const rules = grammar[stack[stack.length - 1]];
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (!m || m[0].length === 0) continue;
      if (rule.when && !rule.when(code, i)) continue;
      if (rule.type && rule.type !== "plain") {
        flush();
        tokens.push({ type: rule.type, text: m[0] });
      } else plain += m[0];
      i += m[0].length;
      if (rule.pop) stack.splice(Math.max(1, stack.length - rule.pop));
      if (rule.swap) stack[stack.length - 1] = rule.swap;
      if (rule.push) stack.push(rule.push);
      continue outer;
    }
    plain += code[i];
    i += 1;
  }
  flush();
  return tokens;
}

/* ---------- JS / TS / JSX / TSX ---------- */

const JS_KEYWORDS =
  "import|from|export|default|as|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|implements|interface|type|enum|async|await|yield|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|this|super|null|undefined|true|false|readonly|public|private|protected|static|declare|namespace|keyof|satisfies|string|number|boolean|any|unknown|never|object|symbol|bigint";

const COMMENT_RULES: Rule[] = [
  { re: /\/\/[^\n]*/y, type: "comment" },
  { re: /\/\*[\s\S]*?(?:\*\/|$)/y, type: "comment" },
];

const STRING_RULES: Rule[] = [
  { re: /"(?:[^"\\\n]|\\.)*"?/y, type: "string" },
  { re: /'(?:[^'\\\n]|\\.)*'?/y, type: "string" },
];

/** `<` mở thẻ JSX chỉ khi đứng sau toán tử / dấu câu / từ khoá (không phải `a < b` hay generic `useState<T>`). */
function jsxCanStart(code: string, index: number) {
  let j = index - 1;
  while (j >= 0 && /\s/.test(code[j])) j--;
  if (j < 0) return true;
  if (!/[\w$)\]]/.test(code[j])) return true;
  const word = /([A-Za-z_$][\w$]*)$/.exec(code.slice(Math.max(0, j - 12), j + 1));
  return !!word && /^(?:return|yield|default|await|case|else|do)$/.test(word[1]);
}

const JS_RULES: Rule[] = [
  ...COMMENT_RULES,
  ...STRING_RULES,
  { re: /`(?:[^`\\]|\\[\s\S])*`?/y, type: "string" },
  { re: new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, "y"), type: "keyword" },
  { re: /\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?n?)\b/y, type: "number" },
  { re: /[A-Za-z_$][\w$]*(?=\s*\()/y, type: "function" },
  { re: /[A-Z][\w$]*/y, type: "type" },
  { re: /[A-Za-z_$][\w$]*/y, type: null },
  // Ngoặc nhọn tách riêng từng ký tự để chế độ biểu thức JSX đếm đúng cặp.
  { re: /[{}]/y, type: "punct" },
  { re: /[()[\];,.:?<>=+\-*/%!&|^~@]+/y, type: "punct" },
];

const JSX_OPEN_RULES: Rule[] = [
  { re: /<>/y, type: "tag", when: jsxCanStart, push: "children" },
  { re: /<[A-Za-z][\w.:-]*/y, type: "tag", when: jsxCanStart, push: "tag" },
];

const JS_GRAMMAR: Grammar = { js: JS_RULES };

const JSX_GRAMMAR: Grammar = {
  js: [...COMMENT_RULES, ...JSX_OPEN_RULES, ...JS_RULES],
  expr: [
    { re: /\{/y, type: "punct", push: "expr" },
    { re: /\}/y, type: "punct", pop: 1 },
    ...COMMENT_RULES,
    ...JSX_OPEN_RULES,
    ...JS_RULES,
  ],
  tag: [
    { re: /\s+/y, type: null },
    { re: /\/>/y, type: "tag", pop: 1 },
    { re: />/y, type: "tag", swap: "children" },
    { re: /\{/y, type: "punct", push: "expr" },
    ...STRING_RULES,
    { re: /[A-Za-z_][\w:.-]*/y, type: "attr" },
    { re: /=/y, type: "punct" },
  ],
  children: [
    { re: /<\/>/y, type: "tag", pop: 1 },
    { re: /<\/[A-Za-z][\w.:-]*/y, type: "tag", push: "close" },
    { re: /<>/y, type: "tag", push: "children" },
    { re: /<[A-Za-z][\w.:-]*/y, type: "tag", push: "tag" },
    { re: /\{/y, type: "punct", push: "expr" },
    { re: /[^<{]+/y, type: null },
  ],
  close: [
    { re: /\s+/y, type: null },
    { re: />/y, type: "tag", pop: 2 },
  ],
};

/* ---------- CSS ---------- */

const CSS_COMMON: Rule[] = [
  { re: /\/\*[\s\S]*?(?:\*\/|$)/y, type: "comment" },
  ...STRING_RULES,
  { re: /@[\w-]+/y, type: "keyword" },
];

const CSS_NUMBER: Rule = {
  re: /-?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?/y,
  type: "number",
  when: (c, i) => !/[\w-]/.test(c[i - 1] ?? ""),
};

const CSS_GRAMMAR: Grammar = {
  css: [
    ...CSS_COMMON,
    { re: /\{/y, type: "punct", push: "block" },
    { re: /\(/y, type: "punct", push: "paren" },
    { re: /[.#][\w-]+/y, type: "type" },
    { re: /::?[\w-]+/y, type: "keyword" },
    { re: /\[[^\]\n]*\]/y, type: "attr" },
    { re: /[A-Za-z][\w-]*/y, type: "tag" },
    { re: /[>+~*,&]/y, type: "punct" },
  ],
  /* (min-width: 640px), :not(.a), :is(...) */
  paren: [
    ...CSS_COMMON,
    { re: /\(/y, type: "punct", push: "paren" },
    { re: /\)/y, type: "punct", pop: 1 },
    { re: /[\w-]+(?=\s*:)/y, type: "property" },
    { re: /[.#][\w-]+/y, type: "type" },
    CSS_NUMBER,
    { re: /[\w-]+/y, type: null },
    { re: /[:,>+~*]/y, type: "punct" },
  ],
  block: [
    ...CSS_COMMON,
    { re: /\{/y, type: "punct", push: "block" },
    { re: /\}/y, type: "punct", pop: 1 },
    { re: /--[\w-]+/y, type: "variable" },
    { re: /-?[A-Za-z][\w-]*(?=\s*:(?![^;{}\n]*\{))/y, type: "property" },
    { re: /::?[\w-]+(?=[^;{}\n]*\{)/y, type: "keyword" },
    { re: /[.#][\w-]+(?=[^;{}\n]*\{)/y, type: "type" },
    { re: /#[\da-fA-F]{3,8}\b/y, type: "number" },
    CSS_NUMBER,
    { re: /!important\b/y, type: "keyword" },
    { re: /[\w-]+(?=\()/y, type: "function" },
    { re: /[\w-]+/y, type: null },
    { re: /[:;,()/*+>~&]/y, type: "punct" },
  ],
};

/* ---------- HTML ---------- */

const HTML_GRAMMAR: Grammar = {
  html: [
    { re: /<!--[\s\S]*?(?:-->|$)/y, type: "comment" },
    { re: /<!DOCTYPE[^>]*>/iy, type: "keyword" },
    { re: /<\/[\w-]+/y, type: "tag", push: "close" },
    { re: /<[\w-]+/y, type: "tag", push: "tag" },
    { re: /&[#\w]+;/y, type: "number" },
    { re: /[^<&]+/y, type: null },
  ],
  tag: [
    { re: /\s+/y, type: null },
    { re: /\/?>/y, type: "tag", pop: 1 },
    ...STRING_RULES,
    { re: /[^\s"'=<>/]+/y, type: "attr" },
    { re: /=/y, type: "punct" },
  ],
  close: [
    { re: /\s+/y, type: null },
    { re: />/y, type: "tag", pop: 1 },
  ],
};

/* ---------- Bash ---------- */

/** Từ đầu tiên của lệnh: đầu dòng, sau prompt `$`, sau `|`, `&&`, `||`, `;`, `(`, `sudo`. */
function bashCommandPosition(code: string, index: number) {
  const lineStart = code.lastIndexOf("\n", index - 1) + 1;
  const before = code.slice(lineStart, index).trimEnd();
  return before === "" || before === "$" || /(?:\|\||&&|[|;(]|\bsudo)$/.test(before);
}

const BASH_GRAMMAR: Grammar = {
  bash: [
    { re: /#[^\n]*/y, type: "comment", when: (c, i) => i === 0 || /\s/.test(c[i - 1]) },
    { re: /^\$(?= )/my, type: "punct" },
    { re: /"(?:[^"\\]|\\[\s\S])*"?/y, type: "string" },
    { re: /'[^']*'?/y, type: "string" },
    { re: /\$\{[^}\n]*\}|\$[\w@#?*!$-]+/y, type: "variable" },
    { re: /[A-Za-z_./~@][\w./~@:+-]*/y, type: "function", when: bashCommandPosition },
    { re: /--?[\w-]+(?:=[^\s]*)?/y, type: "attr", when: (c, i) => /\s/.test(c[i - 1] ?? " ") },
    { re: /\b\d+\b/y, type: "number" },
    { re: /[\w./~@:+-]+/y, type: null },
    { re: /[|&;<>()\\]+/y, type: "punct" },
  ],
};

/* ---------- JSON ---------- */

const JSON_GRAMMAR: Grammar = {
  json: [
    ...COMMENT_RULES,
    { re: /"(?:[^"\\\n]|\\.)*"(?=\s*:)/y, type: "property" },
    { re: /"(?:[^"\\\n]|\\.)*"?/y, type: "string" },
    { re: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y, type: "number" },
    { re: /\b(?:true|false|null)\b/y, type: "keyword" },
    { re: /[{}[\],:]/y, type: "punct" },
  ],
};

/* ---------- Markdown ---------- */

const MD_GRAMMAR: Grammar = {
  md: [
    { re: /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/my, type: "string" },
    { re: /^#{1,6}[ \t][^\n]*/my, type: "heading" },
    { re: /^>[^\n]*/my, type: "comment" },
    { re: /^(?:-{3,}|\*{3,}|_{3,})[ \t]*$/my, type: "punct" },
    { re: /^[ \t]*(?:[-*+]|\d+[.)])(?=[ \t])/my, type: "keyword" },
    { re: /`[^`\n]+`/y, type: "string" },
    { re: /\*\*[^*\n]+\*\*|__[^_\n]+__/y, type: "strong" },
    { re: /\*[^*\n]+\*/y, type: "emphasis" },
    { re: /_[^_\n]+_/y, type: "emphasis", when: (c, i) => !/\w/.test(c[i - 1] ?? "") },
    { re: /!?\[[^\]\n]*\]\([^)\n]*\)/y, type: "link" },
    { re: /<\/?[A-Za-z][^>\n]*>/y, type: "tag" },
    { re: /[^`*_[!<\n]+/y, type: null },
  ],
};

const GRAMMARS: Record<Exclude<CodeLanguage, "text">, { grammar: Grammar; start: string }> = {
  tsx: { grammar: JSX_GRAMMAR, start: "js" },
  jsx: { grammar: JSX_GRAMMAR, start: "js" },
  ts: { grammar: JS_GRAMMAR, start: "js" },
  js: { grammar: JS_GRAMMAR, start: "js" },
  css: { grammar: CSS_GRAMMAR, start: "css" },
  html: { grammar: HTML_GRAMMAR, start: "html" },
  bash: { grammar: BASH_GRAMMAR, start: "bash" },
  json: { grammar: JSON_GRAMMAR, start: "json" },
  md: { grammar: MD_GRAMMAR, start: "md" },
};

/** Tách code thành token theo ngôn ngữ (bộ tokenizer gọn, tự viết). */
export function tokenizeCode(code: string, language: CodeLanguage = "tsx"): CodeToken[] {
  if (language === "text") return [{ type: "plain", text: code }];
  const { grammar, start } = GRAMMARS[language];
  return runGrammar(code, grammar, start);
}

/** "2,4-6" → Set{2,4,5,6}. */
export function parseLineRanges(spec?: string | number[]): Set<number> {
  const set = new Set<number>();
  if (!spec) return set;
  if (Array.isArray(spec)) {
    spec.forEach((n) => set.add(n));
    return set;
  }
  for (const part of spec.split(",")) {
    const [a, b] = part.trim().split("-").map((x) => Number(x.trim()));
    if (!Number.isFinite(a) || part.trim() === "") continue;
    const end = Number.isFinite(b) ? b : a;
    for (let n = Math.min(a, end); n <= Math.max(a, end); n++) set.add(n);
  }
  return set;
}

function splitLines(tokens: CodeToken[]): CodeToken[][] {
  const lines: CodeToken[][] = [[]];
  for (const token of tokens) {
    token.text.split("\n").forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: token.type, text: part });
    });
  }
  return lines;
}

/* Màu token: chỉ alias/palette token, tự đổi theo theme. */
const TOKEN_CLASS: Record<CodeTokenType, string> = {
  plain: "",
  comment: "text-foreground-3 italic",
  keyword: "text-lavender-fg",
  string: "text-marigold-fg",
  number: "text-forest-fg",
  tag: "text-brand-foreground-1",
  attr: "text-teal-fg",
  property: "text-teal-fg",
  type: "text-teal-fg",
  function: "text-steel-fg",
  variable: "text-cranberry-fg",
  punct: "text-foreground-2",
  heading: "font-semibold text-brand-foreground-1",
  strong: "font-semibold",
  emphasis: "italic",
  link: "text-link underline",
};

export const CODE_LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  tsx: "TSX",
  ts: "TS",
  jsx: "JSX",
  js: "JS",
  css: "CSS",
  html: "HTML",
  bash: "Bash",
  json: "JSON",
  md: "Markdown",
  text: "Text",
};

/* ================================================================ Copy */

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Ngữ cảnh không an toàn / bị chặn quyền → dùng textarea tạm.
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

export interface CopyCodeButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  text: string;
  /** Hiện chữ "Sao chép" cạnh icon. Mặc định true. */
  showLabel?: boolean;
}

export const CopyCodeButton = React.forwardRef<HTMLButtonElement, CopyCodeButtonProps>(
  ({ text, showLabel = true, className, onClick, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<number | undefined>(undefined);
    React.useEffect(() => () => window.clearTimeout(timer.current), []);

    return (
      <>
        <Button
          ref={ref}
          size="small"
          appearance="subtle"
          icon={copied ? <Checkmark16Regular className="text-success-foreground-1" /> : <Copy16Regular />}
          aria-label={showLabel ? undefined : copied ? "Đã sao chép" : "Sao chép code"}
          onClick={async (e) => {
            onClick?.(e);
            await copyText(text);
            setCopied(true);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setCopied(false), 1600);
          }}
          className={cn(!showLabel && "min-w-0", className)}
          {...props}
        >
          {showLabel ? (copied ? "Đã chép" : "Sao chép") : undefined}
        </Button>
        <span role="status" className="sr-only">
          {copied ? "Đã sao chép vào bộ nhớ tạm" : ""}
        </span>
      </>
    );
  },
);
CopyCodeButton.displayName = "CopyCodeButton";

/* ================================================================ Theme */

/** appearance="dark" ép theme tối (trừ khi đang ở tương phản cao); "auto" theo theme hiện tại. */
function useCodeThemeProps(appearance: "auto" | "dark") {
  const { theme } = useYugen();
  return appearance === "dark" && theme !== "high-contrast" ? { "data-theme": "dark" as const } : {};
}

const SURFACE = "min-w-0 overflow-hidden rounded-xlarge border border-stroke-2 bg-background-2 text-start text-foreground-1";

/* ================================================================ CodeBlock */

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  code: string;
  language?: CodeLanguage;
  /** Tiêu đề phần đầu; bỏ trống thì dùng filename. */
  title?: React.ReactNode;
  filename?: string;
  showLineNumbers?: boolean;
  /** Dòng nhấn mạnh: "2,4-6" hoặc [2, 4, 5, 6]. */
  highlightLines?: string | number[];
  /** Dòng bắt đầu bằng + / - được tô xanh / đỏ; nút sao chép lấy phiên bản sau thay đổi. */
  diff?: boolean;
  /** Xuống dòng thay vì cuộn ngang (controlled). */
  wrap?: boolean;
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  /** Hiện nút bật/tắt xuống dòng ở phần đầu. Mặc định true khi có phần đầu. */
  showWrapToggle?: boolean;
  copyable?: boolean;
  /** Chiều cao tối đa khi thu gọn (số = px). Vượt quá → nút "Xem thêm / Thu gọn". */
  maxHeight?: number | string;
  /** auto: theo theme hiện tại · dark: luôn tối. */
  appearance?: "auto" | "dark";
  size?: "small" | "medium";
  /** Bỏ khung + phần đầu (dùng bên trong CodeTabs, Card…). */
  bare?: boolean;
}

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language = "tsx",
      title,
      filename,
      showLineNumbers = false,
      highlightLines,
      diff = false,
      wrap: wrapProp,
      defaultWrap = false,
      onWrapChange,
      showWrapToggle,
      copyable = true,
      maxHeight,
      appearance = "auto",
      size = "medium",
      bare = false,
      className,
      ...props
    },
    ref,
  ) => {
    const preId = React.useId();
    const themeProps = useCodeThemeProps(appearance);
    const [innerWrap, setInnerWrap] = React.useState(defaultWrap);
    const wrap = wrapProp ?? innerWrap;
    const setWrap = (next: boolean) => {
      if (wrapProp === undefined) setInnerWrap(next);
      onWrapChange?.(next);
    };
    const [expanded, setExpanded] = React.useState(false);
    const [overflowing, setOverflowing] = React.useState(false);
    const preRef = React.useRef<HTMLPreElement>(null);

    const { lines, marks, copySource } = React.useMemo(() => {
      const normalized = code.replace(/\r\n?/g, "\n").replace(/\n$/, "");
      const raw = normalized.split("\n");
      const diffMarks = diff ? raw.map((l) => (l.startsWith("+") ? "+" : l.startsWith("-") ? "-" : " ")) : null;
      const source = diff ? raw.map((l) => (/^[+\- ]/.test(l) ? l.slice(1) : l)).join("\n") : normalized;
      const copy = diff
        ? raw
            .filter((_, i) => diffMarks?.[i] !== "-")
            .map((l) => (/^[+ ]/.test(l) ? l.slice(1) : l))
            .join("\n")
        : normalized;
      return { lines: splitLines(tokenizeCode(source, language)), marks: diffMarks, copySource: copy };
    }, [code, diff, language]);

    const highlighted = React.useMemo(() => parseLineRanges(highlightLines), [highlightLines]);
    const collapsible = maxHeight !== undefined;
    const collapsed = collapsible && !expanded;

    // Đo xem nội dung có vượt maxHeight không (chỉ khi đang thu gọn).
    useIsomorphicLayoutEffect(() => {
      const pre = preRef.current;
      if (!pre || !collapsed) return;
      const measure = () => setOverflowing(pre.scrollHeight > pre.clientHeight + 1);
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(pre);
      return () => observer.disconnect();
    }, [collapsed, lines, wrap]);

    const hasHeader = !bare && (title != null || filename != null);
    const wrapToggle = showWrapToggle ?? hasHeader;

    const wrapButton = (
      <Button
        size="small"
        appearance="subtle"
        icon={wrap ? <TextWrapOff16Regular /> : <TextWrap16Regular />}
        aria-pressed={wrap}
        aria-label="Xuống dòng"
        title={wrap ? "Tắt xuống dòng" : "Bật xuống dòng"}
        onClick={() => setWrap(!wrap)}
      />
    );

    const body = (
      <div className="relative">
        <pre
          ref={preRef}
          id={preId}
          dir="ltr"
          tabIndex={0}
          className={cn(
            "m-0 py-M text-start font-mono text-foreground-1 focus-visible:-outline-offset-2",
            size === "small" ? "text-caption1" : "text-body1",
            wrap ? "whitespace-pre-wrap wrap-anywhere" : "overflow-x-auto whitespace-pre",
            collapsed && "overflow-y-hidden",
            collapsed && overflowing && "mask-b-from-60%",
          )}
          style={collapsed ? { maxHeight } : undefined}
        >
          <code className={cn("block", !wrap && "w-max min-w-full")}>
            {lines.map((line, i) => {
              const n = i + 1;
              const mark = marks?.[i] ?? " ";
              return (
                <span
                  key={i}
                  className={cn(
                    "flex min-h-lh border-s-2 border-transparent",
                    highlighted.has(n) && "border-brand-stroke bg-brand-background-2",
                    mark === "+" && "border-success-border-1 bg-success-background-1",
                    mark === "-" && "border-danger-border-1 bg-danger-background-1",
                  )}
                >
                  {showLineNumbers && (
                    <span aria-hidden className="w-12 shrink-0 pe-M text-end text-foreground-3 tabular-nums select-none">
                      {n}
                    </span>
                  )}
                  {marks && (
                    <span
                      aria-hidden
                      className={cn(
                        "w-6 shrink-0 text-center select-none",
                        mark === "+" ? "text-success-foreground-1" : mark === "-" ? "text-danger-foreground-1" : "text-foreground-3",
                      )}
                    >
                      {mark}
                    </span>
                  )}
                  <span className={cn("min-w-0 flex-1 pe-L", !showLineNumbers && !marks && "ps-L")}>
                    {mark !== " " && <span className="sr-only select-none">{mark === "+" ? "Thêm: " : "Xoá: "}</span>}
                    {line.map((token, k) =>
                      token.type === "plain" ? (
                        <React.Fragment key={k}>{token.text}</React.Fragment>
                      ) : (
                        <span key={k} className={TOKEN_CLASS[token.type]}>
                          {token.text}
                        </span>
                      ),
                    )}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>

        {copyable && !hasHeader && !bare && (
          <CopyCodeButton
            text={copySource}
            showLabel={false}
            className="absolute inset-e-S top-S bg-background-1 opacity-0 shadow-2 group-hover/code:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
          />
        )}
      </div>
    );

    const footer = collapsible && (overflowing || expanded) && (
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={preId}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-center gap-XS border-t border-stroke-2 py-XS text-caption1 font-semibold text-link transition-colors duration-faster hover:bg-subtle-hover hover:text-link-hover"
      >
        {expanded ? <ChevronUp16Regular aria-hidden /> : <ChevronDown16Regular aria-hidden />}
        {expanded ? "Thu gọn" : `Xem thêm (${lines.length} dòng)`}
      </button>
    );

    if (bare) {
      return (
        <div ref={ref} dir="ltr" {...themeProps} className={cn("group/code min-w-0 bg-background-2 text-start", className)} {...props}>
          {body}
          {footer}
        </div>
      );
    }

    return (
      <div ref={ref} dir="ltr" {...themeProps} className={cn("group/code", SURFACE, className)} {...props}>
        {hasHeader && (
          <div className="flex min-h-10 items-center gap-S border-b border-stroke-2 ps-M pe-XS">
            <Document16Regular aria-hidden className="shrink-0 text-foreground-3" />
            <span className="min-w-0 truncate text-caption1 font-semibold text-foreground-1">{title ?? filename}</span>
            <Badge appearance="tint" color="informative" size="small" shape="rounded">
              {CODE_LANGUAGE_LABEL[language]}
            </Badge>
            <div className="ms-auto flex shrink-0 items-center gap-XXS">
              {wrapToggle && wrapButton}
              {copyable && <CopyCodeButton text={copySource} />}
            </div>
          </div>
        )}
        {body}
        {footer}
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

/* ================================================================ CodeTabs */

export interface CodeTabsFile {
  name: string;
  code: string;
  language?: CodeLanguage;
  highlightLines?: string | number[];
}

export interface CodeTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  files: CodeTabsFile[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (name: string) => void;
  showLineNumbers?: boolean;
  wrap?: boolean;
  maxHeight?: number | string;
  appearance?: "auto" | "dark";
  size?: "small" | "medium";
}

function languageOf(name: string): CodeLanguage {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, CodeLanguage> = {
    tsx: "tsx",
    ts: "ts",
    jsx: "jsx",
    js: "js",
    mjs: "js",
    cjs: "js",
    css: "css",
    html: "html",
    sh: "bash",
    json: "json",
    md: "md",
    mdx: "md",
  };
  return (ext && map[ext]) || "text";
}

/** Nhiều tệp trong một khối: mỗi tab là một tệp. */
export const CodeTabs = React.forwardRef<HTMLDivElement, CodeTabsProps>(
  (
    { files, value, defaultValue, onValueChange, showLineNumbers, wrap, maxHeight, appearance = "auto", size, className, ...props },
    ref,
  ) => {
    const themeProps = useCodeThemeProps(appearance);
    const [inner, setInner] = React.useState(defaultValue ?? files[0]?.name ?? "");
    const active = value ?? inner;
    const activeFile = files.find((f) => f.name === active) ?? files[0];

    return (
      <Tabs
        dir="ltr"
        value={active}
        onValueChange={(v) => {
          if (value === undefined) setInner(v);
          onValueChange?.(v);
        }}
      >
        <div ref={ref} dir="ltr" {...themeProps} className={cn(SURFACE, className)} {...props}>
          <div className="flex min-h-10 items-center gap-S border-b border-stroke-2 pe-XS">
            <TabsList size="small" aria-label="Tệp" className="min-w-0 flex-wrap ps-XS">
              {files.map((f) => (
                <TabsTrigger key={f.name} value={f.name}>
                  {f.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {activeFile && (
              <div className="ms-auto flex shrink-0 items-center gap-XS">
                <Badge appearance="tint" color="informative" size="small" shape="rounded">
                  {CODE_LANGUAGE_LABEL[activeFile.language ?? languageOf(activeFile.name)]}
                </Badge>
                <CopyCodeButton text={activeFile.code} />
              </div>
            )}
          </div>
          {files.map((f) => (
            <TabsContent
              key={f.name}
              value={f.name}
              className="pt-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focus"
            >
              <CodeBlock
                bare
                code={f.code}
                language={f.language ?? languageOf(f.name)}
                highlightLines={f.highlightLines}
                showLineNumbers={showLineNumbers}
                wrap={wrap}
                maxHeight={maxHeight}
                size={size}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    );
  },
);
CodeTabs.displayName = "CodeTabs";

/* ================================================================ PackageManagerTabs */

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const PACKAGE_MANAGERS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];
const PM_STORAGE_KEY = "yugen-ui-package-manager";

function isPackageManager(v: unknown): v is PackageManager {
  return typeof v === "string" && (PACKAGE_MANAGERS as string[]).includes(v);
}

/* Store dùng chung giữa mọi PackageManagerTabs trên trang (+ đồng bộ giữa các tab trình duyệt qua sự kiện storage). */
let pmCurrent: PackageManager | null = null;
const pmListeners = new Set<() => void>();

function pmRead(): PackageManager {
  if (pmCurrent) return pmCurrent;
  try {
    const stored = window.localStorage.getItem(PM_STORAGE_KEY);
    if (isPackageManager(stored)) pmCurrent = stored;
  } catch {
    // localStorage bị chặn (chế độ riêng tư, iframe…) → dùng giá trị trong bộ nhớ.
  }
  return pmCurrent ?? "npm";
}

function pmWrite(pm: PackageManager) {
  pmCurrent = pm;
  try {
    window.localStorage.setItem(PM_STORAGE_KEY, pm);
  } catch {
    // Bỏ qua — vẫn đồng bộ trong trang qua listeners.
  }
  pmListeners.forEach((l) => l());
}

function pmSubscribe(listener: () => void) {
  pmListeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PM_STORAGE_KEY && isPackageManager(e.newValue)) {
      pmCurrent = e.newValue;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    pmListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Lệnh cài đặt / chạy gói theo trình quản lý. */
export function packageManagerCommand(
  pm: PackageManager,
  packages: string | string[],
  options: { dev?: boolean; command?: "install" | "dlx" } = {},
): string {
  const list = Array.isArray(packages) ? packages.join(" ") : packages;
  if (options.command === "dlx") {
    return { npm: `npx ${list}`, pnpm: `pnpm dlx ${list}`, yarn: `yarn dlx ${list}`, bun: `bunx ${list}` }[pm];
  }
  const base = { npm: "npm install", pnpm: "pnpm add", yarn: "yarn add", bun: "bun add" }[pm];
  const dev = options.dev ? (pm === "bun" ? " -d" : " -D") : "";
  return `${base}${dev} ${list}`;
}

export interface PackageManagerTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Gói cần cài (chuỗi hoặc mảng), hoặc lệnh khi command="dlx". */
  packages: string | string[];
  /** Cài làm devDependency (-D). */
  dev?: boolean;
  /** install (mặc định) hoặc dlx (npx / pnpm dlx / yarn dlx / bunx). */
  command?: "install" | "dlx";
  managers?: PackageManager[];
  appearance?: "auto" | "dark";
  size?: "small" | "medium";
}

/** Lệnh cài cho npm / pnpm / yarn / bun; nhớ lựa chọn (localStorage) và đồng bộ giữa mọi khối trên trang. */
export const PackageManagerTabs = React.forwardRef<HTMLDivElement, PackageManagerTabsProps>(
  ({ packages, dev, command = "install", managers = PACKAGE_MANAGERS, appearance = "auto", size, className, ...props }, ref) => {
    const themeProps = useCodeThemeProps(appearance);
    const stored = React.useSyncExternalStore(pmSubscribe, pmRead, () => "npm" as PackageManager);
    const active = managers.includes(stored) ? stored : managers[0];
    const commandText = packageManagerCommand(active, packages, { dev, command });

    return (
      <Tabs dir="ltr" value={active} onValueChange={(v) => isPackageManager(v) && pmWrite(v)}>
        <div ref={ref} dir="ltr" {...themeProps} className={cn(SURFACE, className)} {...props}>
          <div className="flex min-h-10 items-center gap-S border-b border-stroke-2 pe-XS">
            <TabsList size="small" aria-label="Trình quản lý gói" className="min-w-0 flex-wrap ps-XS">
              {managers.map((pm) => (
                <TabsTrigger key={pm} value={pm}>
                  {pm}
                </TabsTrigger>
              ))}
            </TabsList>
            <CopyCodeButton text={commandText} className="ms-auto shrink-0" />
          </div>
          {managers.map((pm) => (
            <TabsContent
              key={pm}
              value={pm}
              className="pt-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focus"
            >
              <CodeBlock bare language="bash" size={size} code={packageManagerCommand(pm, packages, { dev, command })} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    );
  },
);
PackageManagerTabs.displayName = "PackageManagerTabs";
