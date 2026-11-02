import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { parseInlineMarkdown, parseMarkdown, sanitizeHref } from "../AIKit/markdown";
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
