import type { ReactNode } from "react";
import {
  CodeBlock,
  codeLanguageOf,
  markdownToPlainText,
  parseMarkdown,
  type MdBlock,
  type MdInline,
} from "@/components/ui";
import { slugify } from "./blog";
import { useBlog } from "./posts";
import { Link, parsePath } from "./router";

/**
 * Markdown → React bằng parser an toàn của Yugen UI (không dangerouslySetInnerHTML, link javascript: bị loại).
 * Thêm cho blog: heading có id (mục lục), ảnh đứng riêng một dòng `![mô tả](/anh.png)`, link nội bộ `/posts/...`.
 */

// Parser chỉ nhận link tuyệt đối — link nội bộ "/..." được đổi tạm sang domain này rồi trả lại thành <Link>.
const INTERNAL = "https://internal.blog/";
const IMAGE_LINE = /^!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)$/;

type Segment = { type: "markdown"; text: string } | { type: "image"; alt: string; src: string; title?: string };

function segments(markdown: string): Segment[] {
  const out: Segment[] = [];
  let buffer: string[] = [];
  let fence = false;
  const flush = () => {
    if (buffer.length) out.push({ type: "markdown", text: buffer.join("\n") });
    buffer = [];
  };
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const image = !fence && line.trim().match(IMAGE_LINE);
    if (image) {
      flush();
      out.push({ type: "image", alt: image[1], src: image[2], title: image[3] });
      continue;
    }
    buffer.push(fence ? line : line.replace(/\]\(\//g, `](${INTERNAL}`));
  }
  flush();
  return out;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

/** Tạo id duy nhất cho heading theo thứ tự xuất hiện — mục lục và nội dung dùng chung. */
function headingIds() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };
}

function parse(markdown: string) {
  const nextId = headingIds();
  const parts = segments(markdown).map((s) =>
    s.type === "markdown"
      ? { ...s, blocks: parseMarkdown(s.text).children.map((b) => ({ block: b, id: b.type === "heading" ? nextId(markdownToPlainText([b])) : "" })) }
      : s,
  );
  return parts;
}

/** Heading cấp 2–3 cho mục lục. */
export function headingsOf(markdown: string): Heading[] {
  return parse(markdown).flatMap((part) =>
    part.type === "markdown"
      ? part.blocks
          .filter(({ block }) => block.type === "heading" && block.level <= 3)
          .map(({ block, id }) => ({ id, text: markdownToPlainText([block]), level: (block as { level: number }).level }))
      : [],
  );
}

const resolveSrc = (src: string) => (src.startsWith("/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src);

function Inlines({ nodes }: { nodes: MdInline[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case "text":
            return node.text;
          case "strong":
            return (
              <strong key={i} className="font-semibold text-foreground-1">
                <Inlines nodes={node.children} />
              </strong>
            );
          case "emphasis":
            return (
              <em key={i}>
                <Inlines nodes={node.children} />
              </em>
            );
          case "delete":
            return (
              <del key={i}>
                <Inlines nodes={node.children} />
              </del>
            );
          case "inlineCode":
            return (
              <code key={i} className="rounded-small bg-background-4 px-1 font-mono text-[0.9em]">
                {node.text}
              </code>
            );
          case "link": {
            const className = "text-link underline underline-offset-2 hover:text-link-hover";
            if (node.href.startsWith(INTERNAL)) {
              return (
                <Link key={i} to={parsePath(`/${node.href.slice(INTERNAL.length)}`)} className={className} title={node.title}>
                  <Inlines nodes={node.children} />
                </Link>
              );
            }
            const external = node.href.startsWith("http");
            return (
              <a key={i} href={node.href} title={node.title} className={className} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
                <Inlines nodes={node.children} />
              </a>
            );
          }
          case "citation":
            return <sup key={i}>[{node.label}]</sup>;
          case "softBreak":
            return " ";
          case "hardBreak":
            return <br key={i} />;
        }
      })}
    </>
  );
}

const HEADING: Record<number, string> = {
  2: "mt-5 scroll-mt-20 font-display text-title3 font-semibold text-foreground-1",
  3: "mt-4 scroll-mt-20 text-subtitle1 font-semibold text-foreground-1",
  4: "mt-3 text-subtitle2 font-semibold text-foreground-1",
};

function Block({ block, id }: { block: MdBlock; id?: string }): ReactNode {
  const { t } = useBlog();
  switch (block.type) {
    case "paragraph":
      return (
        <p>
          <Inlines nodes={block.children} />
        </p>
      );
    case "heading": {
      // Tiêu đề bài là h1 duy nhất trên trang — # trong nội dung cũng thành h2.
      const level = Math.min(6, Math.max(2, block.level));
      const Tag = `h${level}` as "h2";
      return (
        <Tag id={id} className={HEADING[Math.min(level, 4)]}>
          <Inlines nodes={block.children} />
        </Tag>
      );
    }
    case "code":
      return <CodeBlock code={block.text} language={codeLanguageOf(block.lang)} title={block.lang || undefined} />;
    case "blockquote":
      return (
        <blockquote className="flex flex-col gap-3 border-s-3 border-brand-stroke ps-4 text-foreground-2 italic">
          {block.children.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </blockquote>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List start={block.ordered && block.start !== 1 ? block.start : undefined} className={`flex flex-col gap-1 ps-5 ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item, i) => (
            <li key={i} className={item.checked === null ? "ps-0.5" : "-ms-5 flex list-none gap-2"}>
              {item.checked !== null && <input type="checkbox" checked={item.checked} readOnly aria-label={item.checked ? t.markdown.done : t.markdown.todo} className="mt-1.5" />}
              <div className="flex min-w-0 flex-col gap-1">
                {item.children.map((b, j) =>
                  b.type === "paragraph" && block.tight ? <Inlines key={j} nodes={b.children} /> : <Block key={j} block={b} />,
                )}
              </div>
            </li>
          ))}
        </List>
      );
    }
    case "table":
      return (
        <div role="region" aria-label={t.markdown.table} tabIndex={0} className="overflow-x-auto rounded-large border border-stroke-2">
          <table className="w-full border-collapse text-start text-body1">
            <thead>
              <tr className="bg-background-3">
                {block.head.map((cell, i) => (
                  <th key={i} className="border-b border-stroke-1 px-3 py-2 text-start font-semibold text-foreground-1">
                    <Inlines nodes={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-stroke-2 last:border-b-0">
                  {row.map((cell, c) => (
                    <td key={c} className="px-3 py-2 align-top">
                      <Inlines nodes={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "thematicBreak":
      return <hr className="my-3 border-stroke-2" />;
  }
}

/** Nội dung bài viết — chữ body2 dễ đọc, khoảng cách đều giữa các khối. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="flex flex-col gap-4 text-body2 text-foreground-2">
      {parse(children).map((part, i) =>
        part.type === "image" ? (
          <figure key={i} className="flex flex-col gap-2">
            <img src={resolveSrc(part.src)} alt={part.alt} title={part.title} loading="lazy" className="mx-auto max-h-64 w-auto rounded-xlarge border border-stroke-2 bg-background-1 p-5" />
            {part.title && <figcaption className="text-center text-caption1 text-foreground-3">{part.title}</figcaption>}
          </figure>
        ) : (
          part.blocks.map(({ block, id }, j) => <Block key={`${i}-${j}`} block={block} id={id || undefined} />)
        ),
      )}
    </div>
  );
}
