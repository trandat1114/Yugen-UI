import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "react";
import { watchDeprecations } from "@/test/deprecation";
import { parseInlineMarkdown, parseMarkdown, sanitizeHref, sanitizeImageSrc } from "../AIKit/markdown";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { markdownMessagesEn } from "./messages";
import { Markdown, slugifyHeading } from "./Markdown";

describe("sanitizeHref relative", () => {
  it("keeps same-site paths only when asked", () => {
    for (const url of ["/components/button", "#install", "?tab=npm", "./guide", "../guide", "guide/install"]) {
      expect(sanitizeHref(url)).toBeNull();
      expect(sanitizeHref(url, { relative: true })).toBe(url);
    }
  });

  it("still rejects schemes and protocol-relative URLs", () => {
    for (const url of ["javascript:alert(1)", "JaVa\tScRiPt:alert(1)", "data:text/html,x", "//evil.com", "/\\evil.com", "\\\\evil.com", "vbscript:x"]) {
      expect(sanitizeHref(url, { relative: true })).toBeNull();
    }
  });

  it("is an option of the parser, off by default", () => {
    const link = (md: string, relativeLinks?: boolean) => parseMarkdown(md, { relativeLinks }).children[0];
    expect(link("[a](/x)")).toMatchObject({ children: [{ type: "text", text: "a" }] });
    expect(link("[a](/x)", true)).toMatchObject({ children: [{ type: "link", href: "/x" }] });
    expect(parseInlineMarkdown("[a](/x) `b`", { relativeLinks: true })).toMatchObject([{ type: "link", href: "/x" }, { type: "text" }, { type: "inlineCode", text: "b" }]);
    // The option does not leak into the next parse.
    expect(link("[a](/x)")).toMatchObject({ children: [{ type: "text", text: "a" }] });
  });
});

describe("Markdown", () => {
  it("renders blocks inside Prose", () => {
    const { container } = render(
      <Markdown data-testid="md">{"# Cài đặt\n\nChạy **npm** `install`.\n\n- một\n- hai\n\n```ts\nconst a = 1;\n```"}</Markdown>,
    );
    expect(screen.getByTestId("md")).toHaveClass("yugen-prose");
    expect(screen.getByRole("heading", { level: 2, name: "Cài đặt" })).toBeInTheDocument();
    expect(container.querySelector("strong")).toHaveTextContent("npm");
    expect(container.querySelector("p code")).toHaveTextContent("install");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.querySelector("pre")).toHaveTextContent("const a = 1;");
  });

  it("renders inline Markdown in a span, without paragraphs", () => {
    const { container } = render(<Markdown inline data-testid="md">{"Dùng `sonner.promise` cho **việc async**."}</Markdown>);
    const root = screen.getByTestId("md");
    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveClass("yugen-prose");
    expect(container.querySelector("p")).toBeNull();
    expect(root.querySelector("code")).toHaveTextContent("sonner.promise");
    expect(root).toHaveTextContent("Dùng sonner.promise cho việc async.");
  });

  it("keeps relative links and opens external ones in a new tab", () => {
    render(<Markdown inline>{"[Button](/components/button) · [GitHub](https://github.com) · [x](javascript:alert(1))"}</Markdown>);
    expect(screen.getByRole("link", { name: "Button" })).toHaveAttribute("href", "/components/button");
    expect(screen.getByRole("link", { name: "Button" })).not.toHaveAttribute("target");
    const external = screen.getByRole("link", { name: /GitHub/ });
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noopener noreferrer");
    expect(external).toHaveTextContent("(mở tab mới)");
    expect(screen.queryByRole("link", { name: "x" })).toBeNull();
  });

  it("hands links to renderLink", () => {
    render(
      <Markdown inline renderLink={({ href, children, external }) => <button data-href={href} data-external={external}>{children}</button>}>
        {"[Button](/components/button)"}
      </Markdown>,
    );
    const button = screen.getByRole("button", { name: "Button" });
    expect(button).toHaveAttribute("data-href", "/components/button");
    expect(button).toHaveAttribute("data-external", "false");
  });

  it("offsets headings and gives them unique ids", () => {
    render(<Markdown headingOffset={0} headingIds>{"# Cài đặt nhanh\n\n## Bước\n\n## Bước"}</Markdown>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("id", "cai-dat-nhanh");
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.id)).toEqual(["buoc", "buoc-2"]);
  });

  it("shows HTML as text", () => {
    const { container } = render(<Markdown>{'<img src=x onerror="alert(1)"> <b>đậm</b>'}</Markdown>);
    expect(container.querySelector("img, b")).toBeNull();
    expect(container).toHaveTextContent("<b>đậm</b>");
  });

  it("labels tables and task lists with messages", () => {
    render(
      <YugenProvider messages={{ markdown: markdownMessagesEn }}>
        <Markdown>{"- [x] Viết\n- [ ] Dịch\n\n| A | B |\n| - | -: |\n| 1 | 2 |"}</Markdown>
      </YugenProvider>,
    );
    expect(screen.getByRole("region", { name: "Table" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Done: Viết");
    expect(screen.getByRole("cell", { name: "2" })).toHaveClass("text-end");
  });

  it("slugifies Vietnamese and keeps non-Latin letters", () => {
    expect(slugifyHeading("Đổi màu — Theme Designer")).toBe("doi-mau-theme-designer");
    expect(slugifyHeading("インストール")).toBe("インストール");
    expect(slugifyHeading("!!!")).toBe("section");
  });
});

describe("Markdown images (#447)", () => {
  it("renders images lazily with their alt text, and only from safe URLs", () => {
    const { container } = render(
      <Markdown>{"![A calm lake](https://img.example/lake.png \"Lake\") ![](./deco.svg) ![x](javascript:alert(1)) ![pixel](data:image/png;base64,AAA)"}</Markdown>,
    );
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute("src", "https://img.example/lake.png");
    expect(imgs[0]).toHaveAttribute("alt", "A calm lake");
    expect(imgs[0]).toHaveAttribute("title", "Lake");
    expect(imgs[0]).toHaveAttribute("loading", "lazy");
    expect(imgs[0]).toHaveClass("max-w-full", "h-auto");
    expect(imgs[1]).toHaveAttribute("alt", "");
    // URL không an toàn: chỉ còn chữ alt, không có link hay ảnh.
    expect(container).toHaveTextContent("x pixel");
    expect(container.querySelector("a")).toBeNull();
  });

  it("warns once about an image without alt text", () => {
    const warnings = watchDeprecations();
    render(<Markdown>{"![](/a.png) ![](/b.png)"}</Markdown>);
    expect(warnings("Markdown.image-alt")).toBe(0);
    expect(vi.mocked(console.warn).mock.calls.filter(([m]) => String(m).includes("has no alt text"))).toHaveLength(1);
  });

  it("hands images to renderImage, or shows them as links with images={false}", () => {
    const { rerender } = render(<Markdown renderImage={({ src, alt }) => <span data-testid="img" data-src={src}>{alt}</span>}>{"![Logo](/logo.svg)"}</Markdown>);
    expect(screen.getByTestId("img")).toHaveAttribute("data-src", "/logo.svg");
    rerender(<Markdown images={false}>{"![Logo](/logo.svg)"}</Markdown>);
    expect(screen.getByRole("link", { name: "Logo" })).toHaveAttribute("href", "/logo.svg");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("keeps images off in the parser by default (AI answers)", () => {
    expect(parseInlineMarkdown("![a](https://x.dev/a.png)")[0]?.type).toBe("link");
    expect(parseInlineMarkdown("![a](https://x.dev/a.png)", { images: true })[0]).toEqual({ type: "image", src: "https://x.dev/a.png", alt: "a" });
    expect(sanitizeImageSrc("mailto:a@b.c")).toBeNull();
    expect(sanitizeImageSrc("/a.png")).toBeNull();
    expect(sanitizeImageSrc("/a.png", { relative: true })).toBe("/a.png");
  });
});

describe("Markdown safety and stability (#447)", () => {
  it("never renders HTML, scripts or dangerous URLs", () => {
    const evil = [
      "<script>alert(1)</script>",
      "<img src=x onerror=alert(1)>",
      "[click](javascript:alert(1))",
      "[click](JaVaScRiPt:alert(1))",
      `[click](java${String.fromCharCode(9)}script:alert(1))`,
      "[data](data:text/html,<b>x</b>)",
      "[vb](vbscript:msgbox(1))",
      "[proto](//evil.example)",
      "![img](javascript:alert(1))",
      "[[[[[[[[[[nested",
      "**unclosed _mixed `code",
    ].join(`

`);
    const { container } = render(<Markdown>{evil}</Markdown>);
    expect(container.querySelector("script, [onerror]")).toBeNull();
    for (const a of container.querySelectorAll("a")) expect(a.getAttribute("href")).toMatch(/^(https?:|\/|#|\.)/);
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(container).toHaveTextContent("<script>alert(1)</script>");
  });

  it("renders the same HTML on the server and hydrates without mismatches", () => {
    const md = `# Title

![Cover](/cover.png)

| a | b |
| - | - |
| 1 | 2 |

${"```"}ts
const a = 1;
${"```"}

## Title`;
    const html = renderToString(<Markdown headingIds>{md}</Markdown>);
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    act(() => {
      hydrateRoot(host, <Markdown headingIds>{md}</Markdown>);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(host.querySelectorAll("h2, h3")[1]?.id).toBe("title-2");
    host.remove();
  });

  it("does not render unchanged blocks again when the parent re-renders", () => {
    let renders = 0;
    const renderLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
      renders++;
      return <a href={href}>{children}</a>;
    };
    const md = `[a](/a)

[b](/b)`;
    const { rerender } = render(<Markdown renderLink={renderLink}>{md}</Markdown>);
    expect(renders).toBe(2);
    rerender(<Markdown renderLink={renderLink}>{md}</Markdown>);
    expect(renders).toBe(2);
  });

  it("parses a long article quickly (about 400 KB)", () => {
    const section = (i: number) =>
      `## Section ${i}

Some **bold**, _italic_ and \`code\` with a [link](/s/${i}).

- one
- two
  - nested

| a | b |
| - | - |
| ${i} | x |

\`\`\`ts
const n = ${i};
\`\`\`
`;
    const doc = Array.from({ length: 2000 }, (_, i) => section(i)).join(`
`);
    expect(doc.length).toBeGreaterThan(300_000);
    const start = performance.now();
    const root = parseMarkdown(doc, { relativeLinks: true, images: true });
    const ms = performance.now() - start;
    expect(root.children.filter((b) => b.type === "heading")).toHaveLength(2000);
    // Ngưỡng rộng cho máy CI chậm; thường khoảng 100–200 ms.
    expect(ms).toBeLessThan(3000);
  });
});

