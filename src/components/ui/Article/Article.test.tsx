import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Markdown, markdownHeadings } from "../Markdown/Markdown";
import { messagesEn } from "../messages-en";
import {
  Article,
  ArticleBody,
  ArticleHeader,
  ArticleMeta,
  ArticleToc,
  articleJsonLd,
  articleMessagesEn,
  articleMessagesVi,
  readingTime,
} from "./Article";

afterEach(() => vi.unstubAllGlobals());

const MD = `# Getting started

Intro text.

## Install

npm i

## Configure

### Theme

> ## Note

## Install
`;

describe("markdownHeadings", () => {
  it("lists every heading with the ids Markdown renders, duplicates numbered in order", () => {
    const headings = markdownHeadings(MD);
    expect(headings.map((h) => `${h.level}:${h.id}`)).toEqual([
      "2:getting-started",
      "3:install",
      "3:configure",
      "4:theme",
      "3:note",
      "3:install-2",
    ]);
    const { container } = render(<Markdown headingIds>{MD}</Markdown>);
    expect([...container.querySelectorAll("h2, h3, h4")].map((h) => h.id)).toEqual(headings.map((h) => h.id));
    expect(markdownHeadings(MD, { headingOffset: 0, slug: (t) => t.toUpperCase().replace(/\s/g, "_") })[0]).toEqual({
      id: "GETTING_STARTED",
      text: "Getting started",
      level: 1,
    });
    expect(markdownHeadings("Just text.")).toEqual([]);
  });
});

describe("Article", () => {
  it("uses article, header, h1 and time elements", () => {
    render(
      <Article>
        <ArticleHeader
          title="Designing calm interfaces"
          excerpt="Fewer borders, more rhythm."
          eyebrow="Design"
          cover={<img src="/cover.png" alt="" />}
          meta={<ArticleMeta author={{ name: "Lan", href: "/authors/lan" }} published="2026-11-02" updated="2026-11-20" readingTime={6.2} tags={["design", "ux"]} locale="en-US" />}
        />
        <ArticleBody>
          <p>Body</p>
        </ArticleBody>
      </Article>,
    );
    const article = screen.getByRole("article");
    const header = within(article).getByRole("banner", { hidden: true });
    expect(within(header).getByRole("heading", { level: 1, name: "Designing calm interfaces" })).toBeInTheDocument();
    const times = article.querySelectorAll("time");
    expect([...times].map((t) => t.getAttribute("dateTime"))).toEqual(["2026-11-02T00:00:00.000Z", "2026-11-20T00:00:00.000Z"]);
    expect(article).toHaveTextContent("Nov 2, 2026");
    expect(article).toHaveTextContent("Cập nhật");
    expect(article).toHaveTextContent("7 phút đọc");
    expect(within(article).getByRole("link", { name: "Lan" })).toHaveAttribute("rel", "author");
    expect(within(article).getByRole("list", { name: "Thẻ" })).toHaveTextContent("designux");
    expect(article.querySelector("img")?.parentElement).toHaveClass("aspect-video");
  });

  it("hides an update on the same day, and works with only some metadata", () => {
    const { container, rerender } = render(<ArticleMeta published="2026-11-02T08:00:00Z" updated="2026-11-02T18:00:00Z" />);
    expect(container.querySelectorAll("time")).toHaveLength(1);
    rerender(<ArticleMeta author={{ name: "Lan", avatar: <span data-testid="avatar" /> }} published="not a date" tags={[]} />);
    expect(container.querySelectorAll("time")).toHaveLength(0);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
    rerender(<ArticleMeta updated={Date.UTC(2026, 0, 5)} tags={["a"]} renderTag={(t) => <a href={`/tags/${t}`}>#{t}</a>} />);
    expect(screen.getByRole("link", { name: "#a" })).toHaveAttribute("href", "/tags/a");
    expect(container).toHaveTextContent("Cập nhật");
  });

  it("puts the table of contents beside the content, and body widths", () => {
    const { container, rerender } = render(
      <Article toc={<p>TOC</p>}>
        <ArticleBody width="wide">Body</ArticleBody>
      </Article>,
    );
    expect(container.querySelector("article")).toHaveClass("lg:grid-cols-[minmax(0,1fr)_14rem]");
    expect(container.querySelector("aside")).toHaveTextContent("TOC");
    expect(screen.getByText("Body")).toHaveClass("max-w-[90ch]");
    rerender(<ArticleHeader title="Section" titleAs="h2" />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});

describe("ArticleToc", () => {
  const items = markdownHeadings(MD);

  it("renders jump links before JavaScript runs, indented by level, up to maxLevel", () => {
    const html = renderToString(
      <YugenProvider messages={messagesEn}>
        <ArticleToc items={items} />
      </YugenProvider>,
    );
    expect(html).toContain('href="#getting-started"');
    expect(html).toContain('href="#install-2"');
    expect(html).not.toContain('href="#theme"');
    expect(html).toContain("On this page");
    render(<ArticleToc items={items} maxLevel={4} title="Contents" />);
    const nav = screen.getByRole("navigation", { name: "Contents" });
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(6);
    expect(links[3].parentElement?.style.paddingInlineStart).toBe("1.5rem");
  });

  it("renders nothing without headings", () => {
    const { container } = render(<ArticleToc items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("marks the section being read with aria-current, using one observer", () => {
    let callback: IntersectionObserverCallback = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const { unmount } = render(
      <>
        <Markdown headingIds>{MD}</Markdown>
        <ArticleToc items={items} offset={64} />
      </>,
    );
    expect(observe).toHaveBeenCalledTimes(5);
    const entry = (id: string, top: number) => ({ target: document.getElementById(id), boundingClientRect: { top } }) as unknown as IntersectionObserverEntry;
    act(() => callback([entry("getting-started", -400), entry("install", -100), entry("configure", 300)], {} as IntersectionObserver));
    expect(screen.getByRole("link", { name: "Install", current: "location" })).toHaveAttribute("href", "#install");
    act(() => callback([entry("install", 200)], {} as IntersectionObserver));
    expect(screen.getByRole("link", { name: "Getting started" })).toHaveAttribute("aria-current", "location");
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it("does not observe when tracking is off or headings are missing", () => {
    const observe = vi.fn();
    vi.stubGlobal("IntersectionObserver", class { observe = observe; disconnect() {} });
    render(<ArticleToc items={items} trackActive={false} />);
    render(<ArticleToc items={[{ id: "missing", text: "Missing", level: 2 }]} />);
    expect(observe).not.toHaveBeenCalled();
  });
});

describe("helpers", () => {
  it("estimates reading time without counting code", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("word ".repeat(440))).toBe(2);
    expect(readingTime("word ".repeat(100) + "```\n" + "code ".repeat(1000) + "\n```", 100)).toBe(1);
    expect(readingTime("đọc chậm ".repeat(150), 100)).toBe(3);
  });

  it("builds schema.org Article data without empty fields", () => {
    expect(
      articleJsonLd({ title: "T", author: "Lan", published: "2026-11-02", tags: ["a", "b"], url: "https://x.dev/t" }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "T",
      url: "https://x.dev/t",
      author: { "@type": "Person", name: "Lan" },
      datePublished: "2026-11-02T00:00:00.000Z",
      keywords: "a, b",
    });
    expect(articleJsonLd({ title: "T", author: { name: "Lan", url: "/lan" }, tags: [] }).author).toEqual({ "@type": "Person", name: "Lan", url: "/lan" });
  });

  it("has reading-time strings in both languages", () => {
    expect(articleMessagesEn.readingTime(3, "3")).toBe("3 min read");
    expect(articleMessagesVi.readingTime(3, "3")).toBe("3 phút đọc");
  });
});
