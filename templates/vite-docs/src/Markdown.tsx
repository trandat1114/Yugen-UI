import type { ReactNode } from "react";
import { Info20Regular, Lightbulb20Regular, Warning20Regular } from "@fluentui/react-icons";
import {
  CodeBlock,
  CodeTabs,
  codeLanguageOf,
  PackageManagerTabs,
  parseMarkdown,
  type CodeTabsFile,
  type MdBlock,
  type MdInline,
} from "yugen-ui";
import { cn } from "yugen-ui";
import { slugify, type Heading } from "./docs";
import { useSite } from "./pages";
import { Link, parsePath } from "./router";

/**
 * Markdown → React with Yugen UI's safe parser (no dangerouslySetInnerHTML, javascript: links dropped). Added for docs:
 * heading ids (table of contents, search), an image alone on a line `![alt](/image.png)`, internal links `/section/page/`,
 * and three kinds of fenced code:
 *
 *   ```npm                     npm install @scope/pkg (-D) or npx <command> → npm / pnpm / yarn / bun tabs
 *   ```ts title=src/app.ts     a code block with a file name
 *   ```ts tab=TypeScript       code blocks with `tab=` next to each other → one block with a tab per language
 *
 * and callouts: a quote that starts with `[!NOTE]`, `[!TIP]` or `[!WARNING]`.
 */

// The parser only keeps absolute links: internal "/..." links go through this origin and come back as <Link>.
const INTERNAL = "https://internal.docs/";
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

/** `key=value` and `key="a value"` after the language of a fence: ```ts title=app.ts */
function fenceMeta(raw: string): Record<string, string> {
  const info = raw.split("\n", 1)[0].replace(/^\s*(`{3,}|~{3,})\s*\S*/, "");
  return Object.fromEntries([...info.matchAll(/([\w-]+)=(?:"([^"]*)"|(\S+))/g)].map((m) => [m[1], m[2] ?? m[3]]));
}

/** One `npm install` / `npx` line → props of PackageManagerTabs; anything else stays a plain code block. */
export function packageCommand(code: string): { packages: string | string[]; dev?: boolean; command: "install" | "dlx" } | null {
  const line = code.trim();
  if (line.includes("\n")) return null;
  const [tool, verb, ...args] = line.split(/\s+/);
  if (tool === "npx" && verb) return { packages: [verb, ...args].join(" "), command: "dlx" };
  if (tool !== "npm" || !["install", "i", "add"].includes(verb ?? "")) return null;
  const packages = args.filter((a) => !a.startsWith("-"));
  if (packages.length === 0) return null;
  return { packages, dev: args.some((a) => a === "-D" || a === "--save-dev"), command: "install" };
}

type Item = { type: "block"; block: MdBlock; id?: string } | { type: "tabs"; files: CodeTabsFile[] } | Extract<Segment, { type: "image" }>;

/** Blocks of every segment; headings take their ids from `headings` (same order), code with `tab=` is grouped. */
function items(markdown: string, headings: Heading[]): Item[] {
  let next = 0;
  const out: Item[] = [];
  for (const segment of segments(markdown)) {
    if (segment.type === "image") {
      out.push(segment);
      continue;
    }
    for (const block of parseMarkdown(segment.text).children) {
      const tab = block.type === "code" ? fenceMeta(block.raw).tab : undefined;
      if (block.type === "code" && tab) {
        const last = out.at(-1);
        const file = { name: tab, code: block.text, language: codeLanguageOf(block.lang) };
        if (last?.type === "tabs") last.files.push(file);
        else out.push({ type: "tabs", files: [file] });
        continue;
      }
      const id = block.type === "heading" ? (headings[next++]?.id ?? slugify(block.raw.replace(/^#+\s*/, ""))) : undefined;
      out.push({ type: "block", block, id });
    }
  }
  return out;
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
              <code key={i} className="rounded-small bg-background-4 px-1 font-mono text-[0.9em] text-foreground-1">
                {node.text}
              </code>
            );
          case "link": {
            const className = "text-link underline underline-offset-2 hover:text-link-hover";
            if (node.href.startsWith(INTERNAL)) {
              const [path, hash = ""] = node.href.slice(INTERNAL.length).split("#");
              return (
                <Link key={i} to={parsePath(`${import.meta.env.BASE_URL}${path}`, hash)} className={className} title={node.title}>
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
  2: "mt-6 scroll-mt-20 font-display text-title3 font-semibold text-foreground-1",
  3: "mt-3 scroll-mt-20 text-subtitle1 font-semibold text-foreground-1",
  4: "mt-2 scroll-mt-20 text-subtitle2 font-semibold text-foreground-1",
};

const CALLOUTS = {
  note: { icon: Info20Regular, className: "border-stroke-2 bg-background-3", iconClassName: "text-brand-foreground-1" },
  tip: { icon: Lightbulb20Regular, className: "border-success-border-1 bg-success-background-1", iconClassName: "text-success-foreground-1" },
  warning: { icon: Warning20Regular, className: "border-warning-border-1 bg-warning-background-1", iconClassName: "text-warning-foreground-1" },
};

/** `> [!NOTE]` (GitHub's syntax): the kind, and the quote without its marker. */
function callout(block: Extract<MdBlock, { type: "blockquote" }>) {
  const [first, ...rest] = block.children;
  const marker = first?.type === "paragraph" && first.children[0]?.type === "text" ? first.children[0].text.match(/^\[!(note|tip|warning)\]$/i) : null;
  if (!marker || first.type !== "paragraph") return null;
  const inlines = first.children.slice(first.children[1]?.type === "softBreak" ? 2 : 1);
  const children: MdBlock[] = inlines.length ? [{ ...first, children: inlines }, ...rest] : rest;
  return { kind: marker[1].toLowerCase() as keyof typeof CALLOUTS, children };
}

function Block({ block, id }: { block: MdBlock; id?: string }): ReactNode {
  const { t } = useSite();
  switch (block.type) {
    case "paragraph":
      return (
        <p>
          <Inlines nodes={block.children} />
        </p>
      );
    case "heading": {
      // The page title is the only h1: # in a page also becomes h2.
      const level = Math.min(6, Math.max(2, block.level));
      const Tag = `h${level}` as "h2";
      return (
        <Tag id={id} className={HEADING[Math.min(level, 4)]}>
          <Inlines nodes={block.children} />
        </Tag>
      );
    }
    case "code": {
      const command = block.lang === "npm" ? packageCommand(block.text) : null;
      if (command) return <PackageManagerTabs {...command} />;
      const meta = fenceMeta(block.raw);
      const language = codeLanguageOf(block.lang === "npm" ? "bash" : block.lang);
      // A header only for blocks with a file name; the others keep a floating copy button.
      return <CodeBlock code={block.text} language={language} title={meta.title} />;
    }
    case "blockquote": {
      const note = callout(block);
      if (note) {
        const { icon: Icon, className, iconClassName } = CALLOUTS[note.kind];
        return (
          <div role="note" className={cn("flex gap-3 rounded-large border px-4 py-3 text-body1 text-foreground-1", className)}>
            <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", iconClassName)} />
            <div className="flex min-w-0 flex-col gap-2">
              <p className="font-semibold">{t.markdown[note.kind]}</p>
              {note.children.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </div>
          </div>
        );
      }
      return (
        <blockquote className="flex flex-col gap-3 border-s-3 border-brand-stroke ps-4 text-foreground-2">
          {block.children.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </blockquote>
      );
    }
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

/** Text of a page: body2 for reading, even spacing between blocks. `headings` = headingsOf(markdown). */
export function Markdown({ children, headings }: { children: string; headings: Heading[] }) {
  return (
    <div className="flex flex-col gap-4 text-body2 text-foreground-2">
      {items(children, headings).map((item, i) => {
        if (item.type === "image") {
          return (
            <figure key={i} className="flex flex-col gap-2">
              <img src={resolveSrc(item.src)} alt={item.alt} title={item.title} loading="lazy" className="mx-auto max-h-80 w-auto rounded-xlarge border border-stroke-2 bg-background-1" />
              {item.title && <figcaption className="text-center text-caption1 text-foreground-3">{item.title}</figcaption>}
            </figure>
          );
        }
        if (item.type === "tabs") return <CodeTabs key={i} files={item.files} />;
        return <Block key={i} block={item.block} id={item.id} />;
      })}
    </div>
  );
}
