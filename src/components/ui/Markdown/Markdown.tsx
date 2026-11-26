/** Markdown — hiển thị Markdown tĩnh (bài viết, ghi chú phát hành, nội dung CMS) theo kiểu chữ của Prose. */
import * as React from "react";
import { CheckboxChecked16Regular, CheckboxUnchecked16Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { warnDev } from "@/lib/deprecate";
import { codeLanguageOf } from "../AIKit/codeLanguage";
import { parseInlineMarkdown, parseMarkdown, type MdAlign, type MdBlock, type MdInline } from "../AIKit/markdown";
import { CodeBlock } from "../CodeBlock/CodeBlock";
import { Prose, type ProseProps } from "../Prose/Prose";
import { useYugenMessages } from "../YugenProvider/context";
import { markdownMessagesEn, type MarkdownMessages } from "./messages";

export { markdownMessages, markdownMessagesVi, markdownMessagesEn, type MarkdownMessages } from "./messages";

export interface MarkdownLink {
  href: string;
  title?: string;
  /** Nhãn của link đã render. */
  children: React.ReactNode;
  /** Link http / https tới site khác. Mặc định mở tab mới. */
  external: boolean;
}

export interface MarkdownImage {
  /** URL đã làm sạch (http / https hoặc đường dẫn tương đối). */
  src: string;
  /** Chữ thay thế; chuỗi rỗng = ảnh trang trí. */
  alt: string;
  title?: string;
}

export interface MarkdownProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Nội dung Markdown. Không nhận HTML: thẻ HTML hiện như chữ. */
  children?: string;
  /**
   * Chỉ phần inline (đậm, nghiêng, gạch, code, link) trong một `<span>`, không đoạn văn: cho mục danh sách, ô bảng,
   * chú thích, mô tả một dòng.
   */
  inline?: boolean;
  /** Cỡ chữ của Prose. medium: body1 (14px) · large: body2 (16px) cho bài viết dài. */
  size?: ProseProps["size"];
  /** Cộng vào cấp heading. Mặc định 1: `#` → `h2`, vì trang thường đã có `h1`. */
  headingOffset?: number;
  /** Gắn `id` cho heading từ chữ của nó (cho mục lục, link `#id`). Truyền hàm để tự tạo id. */
  headingIds?: boolean | ((text: string) => string);
  /** Xuống dòng đơn thành `<br>`. Mặc định false (như CommonMark: xuống dòng đơn là khoảng trắng). */
  breaks?: boolean;
  /** Tự render mọi link, vd. giao link nội bộ cho router của app. */
  renderLink?: (link: MarkdownLink) => React.ReactNode;
  /**
   * `![alt](src)` thành `<img>` (tải lười, src http / https hoặc tương đối; `data:` và `javascript:` chỉ còn chữ alt).
   * false: ảnh hiện như link tới ảnh. Mặc định true.
   */
  images?: boolean;
  /** Tự render ảnh, vd. component ảnh của framework với kích thước biết trước (không xô lệch bố cục). */
  renderImage?: (image: MarkdownImage) => React.ReactNode;
}

/** id cho heading: bỏ dấu, chữ thường, khoảng trắng và dấu câu thành `-`. Giữ chữ không phải Latin. */
export function slugifyHeading(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

export interface MarkdownHeading {
  /** id gắn trên heading (đã khử trùng: `intro`, `intro-2`…). */
  id: string;
  /** Chữ của heading, không định dạng. */
  text: string;
  /** Cấp đã render (2 = `h2`), tức cấp Markdown cộng `headingOffset`. */
  level: number;
}

export interface MarkdownHeadingsOptions {
  /** Như `Markdown`: mặc định 1 (`#` → `h2`). */
  headingOffset?: number;
  /** Hàm tạo id, như `headingIds` của `Markdown`. Mặc định `slugifyHeading`. */
  slug?: (text: string) => string;
}

/**
 * id của mọi heading theo thứ tự trong nội dung (kể cả trong blockquote, danh sách). Tính trước khi render nên id không
 * phụ thuộc thứ tự React gọi component (StrictMode gọi hai lần) và trùng khớp với `markdownHeadings`.
 */
function collectHeadings(blocks: MdBlock[], slug: (text: string) => string, offset: number) {
  const out = new Map<MdBlock, MarkdownHeading>();
  const used = new Map<string, number>();
  const walk = (list: MdBlock[]) => {
    for (const block of list) {
      if (block.type === "heading") {
        const text = inlineText(block.children).trim();
        const base = slug(text);
        const n = (used.get(base) ?? 0) + 1;
        used.set(base, n);
        out.set(block, { id: n === 1 ? base : `${base}-${n}`, text, level: Math.min(6, Math.max(1, block.level + offset)) });
      } else if (block.type === "blockquote") walk(block.children);
      else if (block.type === "list") for (const item of block.items) walk(item.children);
    }
  };
  walk(blocks);
  return out;
}

/**
 * Các heading của một chuỗi Markdown, cùng id mà `<Markdown headingIds>` gắn: dựng mục lục (ArticleToc) ở server, trước
 * khi JavaScript chạy, mà không phải đọc DOM.
 */
export function markdownHeadings(markdown: string, { headingOffset = 1, slug = slugifyHeading }: MarkdownHeadingsOptions = {}): MarkdownHeading[] {
  return [...collectHeadings(parseMarkdown(markdown, { relativeLinks: true }).children, slug, headingOffset).values()];
}

interface RenderContext {
  msg: MarkdownMessages;
  breaks: boolean;
  headingOffset: number;
  renderLink?: (link: MarkdownLink) => React.ReactNode;
  renderImage?: (image: MarkdownImage) => React.ReactNode;
  /** id của từng heading (đã khử trùng), hoặc undefined khi tắt headingIds. */
  headings?: Map<MdBlock, MarkdownHeading>;
}

const ALIGN_CLASS: Record<Exclude<MdAlign, null>, string> = { start: "text-start", center: "text-center", end: "text-end" };

function inlineText(nodes: MdInline[]): string {
  return nodes
    .map((n) =>
      "children" in n
        ? inlineText(n.children)
        : n.type === "text" || n.type === "inlineCode"
          ? n.text
          : n.type === "citation"
            ? n.label
            : n.type === "image"
              ? n.alt
              : " ",
    )
    .join("");
}

// Kiểu chữ (link, code, đậm) đến từ yugen-prose của khung bọc, nên phần tử ở đây không cần class.
function renderInlines(nodes: MdInline[], ctx: RenderContext): React.ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return <React.Fragment key={i}>{node.text}</React.Fragment>;
      case "strong":
        return <strong key={i}>{renderInlines(node.children, ctx)}</strong>;
      case "emphasis":
        return <em key={i}>{renderInlines(node.children, ctx)}</em>;
      case "delete":
        return <del key={i}>{renderInlines(node.children, ctx)}</del>;
      case "inlineCode":
        return (
          <code key={i} dir="ltr">
            {node.text}
          </code>
        );
      case "link": {
        const external = /^https?:/i.test(node.href);
        const children = renderInlines(node.children, ctx);
        if (ctx.renderLink) return <React.Fragment key={i}>{ctx.renderLink({ href: node.href, title: node.title, children, external })}</React.Fragment>;
        return external ? (
          <a key={i} href={node.href} title={node.title} target="_blank" rel="noopener noreferrer">
            {children}
            <span className="sr-only"> {ctx.msg.newTab}</span>
          </a>
        ) : (
          <a key={i} href={node.href} title={node.title}>
            {children}
          </a>
        );
      }
      case "image": {
        const { src, alt, title } = node;
        if (!alt) warnDev("Markdown.image-alt", `Markdown: the image "${src}" has no alt text. Write ![description](url), or keep it empty only for decorative images.`);
        if (ctx.renderImage) return <React.Fragment key={i}>{ctx.renderImage({ src, alt, title })}</React.Fragment>;
        return <img key={i} src={src} alt={alt} title={title} loading="lazy" decoding="async" className="h-auto max-w-full" />;
      }
      // Không có nguồn để gắn: giữ nguyên chữ "[1]".
      case "citation":
        return <React.Fragment key={i}>{node.label}</React.Fragment>;
      case "softBreak":
        return ctx.breaks ? <br key={i} /> : <React.Fragment key={i}> </React.Fragment>;
      case "hardBreak":
        return <br key={i} />;
    }
  });
}

/** Memo: khi nội dung không đổi (cùng object khối, cùng ctx), khối không render lại — CodeBlock không tô màu lại. */
const Block = React.memo(function Block({ block, ctx }: { block: MdBlock; ctx: RenderContext }): React.ReactNode {
  switch (block.type) {
    case "paragraph":
      return <p>{renderInlines(block.children, ctx)}</p>;
    case "heading": {
      const Tag = `h${Math.min(6, Math.max(1, block.level + ctx.headingOffset))}` as "h2";
      return <Tag id={ctx.headings?.get(block)?.id}>{renderInlines(block.children, ctx)}</Tag>;
    }
    case "code":
      return <CodeBlock code={block.text} language={codeLanguageOf(block.lang)} />;
    case "blockquote":
      return (
        <blockquote>
          {block.children.map((child, i) => (
            <Block key={i} block={child} ctx={ctx} />
          ))}
        </blockquote>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List start={block.ordered && block.start !== 1 ? block.start : undefined}>
          {block.items.map((item, i) => {
            const content = item.children.map((child, j) =>
              child.type === "paragraph" && block.tight ? (
                <React.Fragment key={j}>{renderInlines(child.children, ctx)}</React.Fragment>
              ) : (
                <Block key={j} block={child} ctx={ctx} />
              ),
            );
            if (item.checked === null) return <li key={i}>{content}</li>;
            return (
              <li key={i} className="-ms-5 flex list-none items-start gap-1.5">
                <span className="mt-0.5 flex shrink-0 text-foreground-3">
                  {item.checked ? <CheckboxChecked16Regular aria-hidden className="text-brand-foreground-1" /> : <CheckboxUnchecked16Regular aria-hidden />}
                </span>
                <span className="sr-only">{item.checked ? ctx.msg.taskDone : ctx.msg.taskTodo} </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">{content}</div>
              </li>
            );
          })}
        </List>
      );
    }
    case "table":
      return (
        <div role="region" aria-label={ctx.msg.table} tabIndex={0} className="max-w-full overflow-x-auto rounded-large border border-stroke-2">
          <table>
            <thead>
              <tr className="bg-background-3">
                {block.head.map((cell, c) => (
                  <th key={c} scope="col" className={ALIGN_CLASS[block.align[c] ?? "start"]}>
                    {renderInlines(cell, ctx)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className={ALIGN_CLASS[block.align[c] ?? "start"]}>
                      {renderInlines(cell, ctx)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "thematicBreak":
      return <hr />;
  }
});

/**
 * Markdown tĩnh → React bằng bộ phân tích an toàn của Yugen UI (không HTML, không `dangerouslySetInnerHTML`; link
 * `javascript:`, `data:` hiện như chữ). Giữ link tương đối (`/path`, `#id`), link ngoài mở tab mới. Kiểu chữ theo Prose.
 * Cho nội dung đang về theo từng token (câu trả lời AI) dùng StreamingMarkdown.
 */
export function Markdown({
  children = "",
  inline = false,
  size = "medium",
  headingOffset = 1,
  headingIds = false,
  breaks = false,
  renderLink,
  images = true,
  renderImage,
  className,
  ref,
  ...props
}: MarkdownProps & { ref?: React.Ref<HTMLElement> }) {
  const msg = useYugenMessages("markdown", markdownMessagesEn);
  const parsed = React.useMemo(
    () =>
      inline
        ? parseInlineMarkdown(children, { relativeLinks: true, images })
        : parseMarkdown(children, { relativeLinks: true, images }).children,
    [children, inline, images],
  );

  // Heading trùng chữ nhận -2, -3… theo thứ tự trong nội dung.
  const slug = typeof headingIds === "function" ? headingIds : headingIds ? slugifyHeading : undefined;
  const headings = React.useMemo(
    () => (inline || !slug ? undefined : collectHeadings(parsed as MdBlock[], slug, headingOffset)),
    [parsed, slug, inline, headingOffset],
  );
  // ctx ổn định khi props không đổi, để Block (memo) bỏ qua các khối không đổi.
  const ctx = React.useMemo<RenderContext>(
    () => ({ msg, breaks, headingOffset, renderLink, renderImage, headings }),
    [msg, breaks, headingOffset, renderLink, renderImage, headings],
  );

  if (inline) {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={cn("yugen-prose", className)} {...props}>
        {renderInlines(parsed as MdInline[], ctx)}
      </span>
    );
  }
  return (
    <Prose ref={ref as React.Ref<HTMLDivElement>} size={size} className={className} {...props}>
      {(parsed as MdBlock[]).map((block, i) => (
        <Block key={i} block={block} ctx={ctx} />
      ))}
    </Prose>
  );
}
