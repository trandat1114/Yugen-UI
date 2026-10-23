/** Yugen Labs · StreamingMarkdown — hiển thị Markdown đang về theo từng token: an toàn, không nháy, ghi nhớ theo khối. */
import * as React from "react";
import { CheckboxChecked16Regular, CheckboxUnchecked16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useAnnounce } from "../AriaLive/AriaLive";
import { CodeBlock, CopyCodeButton, type CodeLanguage } from "../CodeBlock/CodeBlock";
import { useYugenMessages } from "../YugenProvider/context";
import { Citation, type CitationSource } from "./Citation";
import {
  markdownToPlainText,
  parseMarkdownIncremental,
  type MarkdownParseState,
  type MdAlign,
  type MdBlock,
  type MdInline,
} from "./markdown";
import { streamingMarkdownMessages, type StreamingMarkdownMessages } from "./messages";

export { streamingMarkdownMessages, streamingMarkdownMessagesEn, type StreamingMarkdownMessages } from "./messages";

const LANGUAGE_ALIAS: Record<string, CodeLanguage> = {
  tsx: "tsx",
  ts: "ts",
  typescript: "ts",
  jsx: "jsx",
  js: "js",
  javascript: "js",
  mjs: "js",
  cjs: "js",
  css: "css",
  scss: "css",
  less: "css",
  html: "html",
  xml: "html",
  svg: "html",
  vue: "html",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  powershell: "bash",
  ps1: "bash",
  json: "json",
  jsonc: "json",
  json5: "json",
  md: "md",
  markdown: "md",
};

/** Ngôn ngữ của fence → bộ tô màu của CodeBlock ("text" nếu chưa hỗ trợ). */
export function codeLanguageOf(lang: string): CodeLanguage {
  return LANGUAGE_ALIAS[lang.toLowerCase()] ?? "text";
}

type Size = "small" | "medium";

interface RenderContext {
  size: Size;
  headingOffset: number;
  breaks: boolean;
  streaming: boolean;
  citations?: CitationSource[];
  msg: StreamingMarkdownMessages;
}

const HEADING_CLASS: Record<Size, Record<number, string>> = {
  medium: {
    1: "font-display text-subtitle1 font-semibold",
    2: "text-subtitle2 font-semibold",
    3: "text-body1 font-semibold",
    4: "text-body1 font-semibold text-foreground-2",
  },
  small: {
    1: "text-body1 font-semibold",
    2: "text-body1 font-semibold",
    3: "text-caption1 font-semibold",
    4: "text-caption1 font-semibold text-foreground-2",
  },
};

const ALIGN_CLASS: Record<Exclude<MdAlign, null>, string> = { start: "text-start", center: "text-center", end: "text-end" };
const LIST_STYLE = ["list-disc", "list-[circle]", "list-[square]"];

/** Con trỏ "còn tiếp" ở cuối nội dung đang stream; đứng yên khi giảm chuyển động. */
function Caret() {
  return (
    <span
      aria-hidden
      data-streaming-caret=""
      className="ms-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse rounded-circular bg-foreground-2 motion-reduce:animate-none"
    />
  );
}

/* ================================================================ Inline */

function renderInlines(nodes: MdInline[], ctx: RenderContext): React.ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return <React.Fragment key={i}>{node.text}</React.Fragment>;
      case "strong":
        return (
          <strong key={i} className="font-semibold">
            {renderInlines(node.children, ctx)}
          </strong>
        );
      case "emphasis":
        return (
          <em key={i} className="italic">
            {renderInlines(node.children, ctx)}
          </em>
        );
      case "delete":
        return (
          <del key={i} className="text-foreground-3 line-through">
            {renderInlines(node.children, ctx)}
          </del>
        );
      case "inlineCode":
        return (
          <code key={i} dir="ltr" className="rounded-small bg-background-4 px-1 font-mono wrap-anywhere">
            {node.text}
          </code>
        );
      case "link": {
        const external = !node.href.toLowerCase().startsWith("mailto:");
        return (
          <a
            key={i}
            href={node.href}
            title={node.title}
            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            className="rounded-small text-link underline wrap-anywhere hover:text-link-hover"
          >
            {renderInlines(node.children, ctx)}
            {external && <span className="sr-only"> {ctx.msg.newTab}</span>}
          </a>
        );
      }
      case "citation": {
        const source = ctx.citations?.[node.index - 1];
        return source ? <Citation key={i} index={node.index} source={source} /> : <React.Fragment key={i}>{node.label}</React.Fragment>;
      }
      case "softBreak":
        return ctx.breaks ? <br key={i} /> : <React.Fragment key={i}> </React.Fragment>;
      case "hardBreak":
        return <br key={i} />;
    }
  });
}

/* ================================================================ Block */

interface BlockProps {
  block: MdBlock;
  ctx: RenderContext;
  /** Khối cuối khi đang stream: nhận con trỏ. */
  caret: boolean;
  depth?: number;
  /** Đoạn văn trong danh sách gọn (tight) render không bọc <p>. */
  bare?: boolean;
}

function CodeFence({ block, ctx }: { block: Extract<MdBlock, { type: "code" }>; ctx: RenderContext }) {
  const language = codeLanguageOf(block.lang);
  const pending = ctx.streaming && !block.closed;
  // Khối code đang stream: CodeBlock tô màu lại toàn bộ code mỗi chunk. Hoãn phần đó (ưu tiên thấp) để chữ stream không bị
  // chậm; React bỏ qua các bản trung gian khi máy bận.
  const deferred = React.useDeferredValue(block.text);
  const code = pending ? deferred : block.text;
  return (
    <div dir="ltr" className="min-w-0 overflow-hidden rounded-xlarge border border-stroke-2 bg-background-2 text-start">
      <div className="flex min-h-8 items-center gap-2 border-b border-stroke-2 ps-3 pe-1">
        <span className="min-w-0 flex-1 truncate font-mono text-caption1 text-foreground-3">{block.lang || "code"}</span>
        {!pending && <CopyCodeButton text={block.text} />}
      </div>
      <CodeBlock bare code={code} language={language} size={ctx.size === "small" ? "small" : "medium"} aria-busy={pending || undefined} />
    </div>
  );
}

function BlockView({ block, ctx, caret, depth = 0, bare = false }: BlockProps) {
  const tailCaret = caret ? <Caret /> : null;
  switch (block.type) {
    case "paragraph":
      return bare ? (
        <>
          {renderInlines(block.children, ctx)}
          {tailCaret}
        </>
      ) : (
        <p>
          {renderInlines(block.children, ctx)}
          {tailCaret}
        </p>
      );
    case "heading": {
      const tag = `h${Math.min(6, Math.max(2, block.level + ctx.headingOffset))}` as "h2";
      const Tag = tag;
      return (
        <Tag className={cn("text-foreground-1 not-first:pt-1", HEADING_CLASS[ctx.size][Math.min(block.level, 4)])}>
          {renderInlines(block.children, ctx)}
          {tailCaret}
        </Tag>
      );
    }
    case "code":
      return <CodeFence block={block} ctx={ctx} />;
    case "thematicBreak":
      return <hr className="border-stroke-2" />;
    case "blockquote":
      return (
        <blockquote className="flex flex-col gap-2 border-s-3 border-stroke-1 ps-3 text-foreground-2">
          {block.children.map((child, i) => (
            <BlockView key={i} block={child} ctx={ctx} caret={caret && i === block.children.length - 1} depth={depth} />
          ))}
        </blockquote>
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          start={block.ordered && block.start !== 1 ? block.start : undefined}
          className={cn(
            "flex flex-col ps-5 marker:text-foreground-3",
            block.tight ? "gap-1" : "gap-2",
            block.ordered ? "list-decimal" : LIST_STYLE[Math.min(depth, LIST_STYLE.length - 1)],
          )}
        >
          {block.items.map((item, i) => {
            const lastItem = i === block.items.length - 1;
            const content = item.children.map((child, k) => (
              <BlockView
                key={k}
                block={child}
                ctx={ctx}
                caret={caret && lastItem && k === item.children.length - 1}
                depth={depth + 1}
                bare={block.tight && child.type === "paragraph"}
              />
            ));
            if (item.checked !== null) {
              return (
                <li key={i} className="-ms-5 flex list-none items-start gap-1">
                  <span className="mt-0.5 flex shrink-0 text-foreground-3">
                    {item.checked ? <CheckboxChecked16Regular aria-hidden className="text-brand-foreground-1" /> : <CheckboxUnchecked16Regular aria-hidden />}
                  </span>
                  <span className="sr-only">{item.checked ? ctx.msg.taskDone : ctx.msg.taskTodo} </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">{content}</div>
                </li>
              );
            }
            return (
              <li key={i} className={cn("ps-0.5 [&>ol]:mt-1 [&>ul]:mt-1", !block.tight && "space-y-2")}>
                {content}
              </li>
            );
          })}
        </ListTag>
      );
    }
    case "table": {
      const lastRow = block.rows.length - 1;
      return (
        <div role="region" aria-label={ctx.msg.table} tabIndex={0} className="max-w-full overflow-x-auto rounded-medium border border-stroke-2">
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="bg-background-3">
                {block.head.map((cell, c) => (
                  <th
                    key={c}
                    scope="col"
                    className={cn("border-b border-stroke-1 px-3 py-2 align-bottom font-semibold text-foreground-1", ALIGN_CLASS[block.align[c] ?? "start"])}
                  >
                    {renderInlines(cell, ctx)}
                    {caret && lastRow < 0 && c === block.head.length - 1 && <Caret />}
                  </th>
                ))}
              </tr>
            </thead>
            {block.rows.length > 0 && (
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b border-stroke-2 last:border-b-0">
                    {row.map((cell, c) => (
                      <td key={c} className={cn("px-3 py-2 align-top", ALIGN_CLASS[block.align[c] ?? "start"])}>
                        {renderInlines(cell, ctx)}
                        {caret && r === lastRow && c === row.length - 1 && <Caret />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      );
    }
  }
}

/** Khối không đổi (cùng object hoặc cùng mã nguồn) không render lại khi token mới về. */
const MemoBlock = React.memo(
  BlockView,
  (a, b) => a.ctx === b.ctx && a.caret === b.caret && (a.block === b.block || (a.block.raw === b.block.raw && a.block.type === b.block.type)),
);

/* ================================================================ StreamingMarkdown */

export interface StreamingMarkdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Nội dung Markdown (có thể đang dài thêm theo từng token). */
  children?: string;
  /** Đang nhận nội dung: chịu được cú pháp dở dang, hiện con trỏ, `aria-busy`. */
  streaming?: boolean;
  /** Cộng vào cấp heading: mặc định 2 (`#` → h3). Không bao giờ sinh h1. */
  headingOffset?: number;
  /** Nguồn cho chú thích `[1]`, `[^2]` — chip Citation có thẻ xem nhanh. */
  citations?: CitationSource[];
  /** Xuống dòng đơn thành `<br>` (như đa số ứng dụng chat). Mặc định true. */
  breaks?: boolean;
  /** Hiện con trỏ khi streaming. Mặc định true — tắt khi khung bọc (MessageBubble streaming) đã có con trỏ riêng. */
  caret?: boolean;
  /** small: chữ caption1 (khối suy luận, chú thích) · medium: body1. */
  size?: Size;
  /** Đọc toàn bộ câu trả lời (văn bản thuần) qua live region khi streaming kết thúc. Mặc định false (MessageScroller đã tự đọc). */
  announceWhenDone?: boolean;
}

function citationKey(list?: CitationSource[]) {
  return list ? list.map((s) => `${s.title}|${s.url ?? ""}|${s.snippet ?? ""}`).join("\n") : "";
}

export const StreamingMarkdown = React.forwardRef<HTMLDivElement, StreamingMarkdownProps>(
  (
    {
      children = "",
      streaming = false,
      headingOffset = 2,
      citations,
      breaks = true,
      caret = true,
      size = "medium",
      announceWhenDone = false,
      className,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("streamingMarkdown", streamingMarkdownMessages);
    const stateRef = React.useRef<MarkdownParseState | null>(null);
    const parsed = parseMarkdownIncremental(children, streaming, stateRef.current);
    stateRef.current = parsed;
    const blocks = parsed.blocks;

    // Mảng citations truyền inline mỗi lần render vẫn giữ ctx ổn định nếu nội dung không đổi.
    const key = citationKey(citations);
    const citationsRef = React.useRef(citations);
    if (citationKey(citationsRef.current) !== key) citationsRef.current = citations;
    const stableCitations = citationsRef.current;

    const ctx = React.useMemo<RenderContext>(
      () => ({ size, headingOffset, breaks, streaming, citations: stableCitations, msg }),
      [size, headingOffset, breaks, streaming, stableCitations, msg],
    );

    const { announce } = useAnnounce();
    const wasStreaming = React.useRef(streaming);
    React.useEffect(() => {
      if (wasStreaming.current && !streaming && announceWhenDone) {
        const text = markdownToPlainText(blocks);
        if (text) announce(text);
      }
      wasStreaming.current = streaming;
    }, [streaming, announceWhenDone, announce, blocks]);

    const showCaret = streaming && caret;
    const last = blocks[blocks.length - 1];
    const caretInside = showCaret && !!last && last.type !== "code" && last.type !== "thematicBreak";

    return (
      <div
        ref={ref}
        aria-busy={streaming || undefined}
        data-streaming={streaming || undefined}
        className={cn(
          "flex min-w-0 flex-col text-foreground-1 wrap-break-word whitespace-normal",
          size === "small" ? "gap-2 text-caption1" : "gap-3 text-body1",
          className,
        )}
        {...props}
      >
        {blocks.map((block, i) => (
          <MemoBlock key={i} block={block} ctx={ctx} caret={caretInside && i === blocks.length - 1} />
        ))}
        {showCaret && !caretInside && last?.type !== "code" && (
          <span>
            <Caret />
          </span>
        )}
      </div>
    );
  },
);
StreamingMarkdown.displayName = "StreamingMarkdown";
