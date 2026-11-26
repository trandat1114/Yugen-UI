import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { BlogCard, BlogList, BlogTagFilter, blogMessagesEn, blogMessagesVi, filterPosts, foldText, type BlogPost } from "./Blog";

const posts: BlogPost[] = [
  {
    id: "spacing",
    title: "Thiết kế với khoảng cách",
    href: "/blog/spacing",
    excerpt: "Fewer borders, more rhythm.",
    cover: { src: "/covers/spacing.png", alt: "Cards on a grid" },
    author: { name: "Linh" },
    published: "2026-11-02",
    readingTime: 4.2,
    tags: ["design", "layout"],
  },
  { id: "tokens", title: "Design tokens in practice", href: "/blog/tokens", excerpt: "From Figma to CSS.", tags: ["design", "css"] },
  { id: "a11y", title: "Focus that never disappears", href: "/blog/focus", tags: ["accessibility"] },
];

describe("filterPosts", () => {
  it("matches every word in title, excerpt and tags, ignoring accents and case", () => {
    expect(filterPosts(posts, { query: "thiet ke" }).map((p) => p.id)).toEqual(["spacing"]);
    expect(filterPosts(posts, { query: "CSS figma" }).map((p) => p.id)).toEqual(["tokens"]);
    expect(filterPosts(posts, { query: "  " })).toHaveLength(3);
    expect(filterPosts(posts, { query: "nothing here" })).toEqual([]);
  });

  it("filters by any or all tags", () => {
    expect(filterPosts(posts, { tags: ["css", "accessibility"] }).map((p) => p.id)).toEqual(["tokens", "a11y"]);
    expect(filterPosts(posts, { tags: ["design", "css"], match: "all" }).map((p) => p.id)).toEqual(["tokens"]);
    expect(filterPosts(posts, { tags: ["design"], query: "rhythm" }).map((p) => p.id)).toEqual(["spacing"]);
  });

  it("folds Vietnamese letters", () => {
    expect(foldText("Đường Đi")).toBe("duong di");
  });
});

describe("BlogCard", () => {
  it("is an article whose title is the link, described by the excerpt", () => {
    render(<BlogCard post={posts[0]} locale="en-US" />);
    const article = screen.getByRole("article");
    const link = within(article).getByRole("link", { name: "Thiết kế với khoảng cách" });
    expect(link).toHaveAttribute("href", "/blog/spacing");
    expect(link).toHaveAccessibleDescription("Fewer borders, more rhythm.");
    expect(within(article).getByRole("heading", { level: 3 })).toContainElement(link);
    expect(article.querySelector("time")).toHaveAttribute("dateTime", "2026-11-02T00:00:00.000Z");
    expect(article).toHaveTextContent("Nov 2, 2026");
    expect(article).toHaveTextContent("5 phút đọc");
    const img = within(article).getByRole("img", { name: "Cards on a grid" });
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img.parentElement).toHaveClass("aspect-video");
    expect(within(article).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["design", "layout"]);
  });

  it("supports a custom cover, router links, heading level, featured and horizontal layouts", () => {
    render(
      <BlogCard
        post={{ ...posts[1], cover: <span data-testid="cover" /> }}
        headingLevel="h2"
        featured
        layout="horizontal"
        renderLink={({ href, children, className }) => (
          <a href={`#${href}`} className={className}>
            {children}
          </a>
        )}
      />,
    );
    expect(screen.getByTestId("cover")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "#/blog/tokens");
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-title2");
    expect(screen.getByRole("article")).toHaveAttribute("data-featured", "true");
    expect(screen.getByRole("article")).toHaveClass("sm:flex-row");
    expect(screen.getByText("Nổi bật")).toBeInTheDocument();
  });

  it("renders minimal posts and ignores invalid dates", () => {
    const { container } = render(<BlogCard post={{ id: "x", title: "Short", href: "/x", published: "not a date", cover: null }} />);
    expect(container.querySelector("time")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("BlogList", () => {
  it("lists posts in a grid with the featured one first and wide", () => {
    render(<BlogList posts={posts} featuredId="a11y" />);
    const items = screen.getAllByRole("article");
    expect(items[0]).toHaveTextContent("Focus that never disappears");
    expect(items[0].parentElement).toHaveClass("sm:col-span-2");
    expect(items[1].parentElement).not.toHaveClass("sm:col-span-2");
  });

  it("shows placeholders while loading, then an empty state", () => {
    const { rerender, container } = render(<BlogList posts={[]} loading loadingCount={2} />);
    expect(container.querySelector("section")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("list", { name: "Đang tải bài viết…" }).children).toHaveLength(2);
    rerender(<BlogList posts={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Không có bài viết nào phù hợp.");
    rerender(<BlogList posts={[]} empty="Try another tag." />);
    expect(screen.getByRole("status")).toHaveTextContent("Try another tag.");
  });

  it("loads more on demand and renders a list layout or custom cards", () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(<BlogList posts={posts} layout="list" hasMore onLoadMore={onLoadMore} />);
    expect(screen.getAllByRole("article")[0]).toHaveClass("sm:flex-row");
    fireEvent.click(screen.getByRole("button", { name: "Xem thêm bài" }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<BlogList posts={posts} renderCard={(p) => <span data-testid="card">{p.id}</span>} featuredId="missing" />);
    expect(screen.getAllByTestId("card").map((c) => c.textContent)).toEqual(["spacing", "tokens", "a11y"]);
  });

  it("renders on the server", () => {
    const html = renderToString(<BlogList posts={posts} />);
    expect(html).toContain('href="/blog/spacing"');
    expect(html).toContain("<time");
  });
});

describe("BlogTagFilter", () => {
  it("toggles tags with aria-pressed and clears them with All", () => {
    const onSelectedChange = vi.fn();
    const { rerender } = render(<BlogTagFilter tags={["design", { tag: "css", count: 4 }]} selected={[]} onSelectedChange={onSelectedChange} />);
    const group = screen.getByRole("group", { name: "Lọc theo thẻ" });
    expect(within(group).getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(group).getByRole("button", { name: "css 4" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(["css"]);
    rerender(<BlogTagFilter tags={["design", "css"]} selected={["css"]} onSelectedChange={onSelectedChange} />);
    expect(screen.getByRole("button", { name: "css" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "design" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(["css", "design"]);
    fireEvent.click(screen.getByRole("button", { name: "css" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith([]);
    fireEvent.click(screen.getByRole("button", { name: "Tất cả" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith([]);
    rerender(<BlogTagFilter tags={["design", "css"]} selected={["css"]} single onSelectedChange={onSelectedChange} />);
    fireEvent.click(screen.getByRole("button", { name: "design" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(["design"]);
  });

  it("has strings in both languages", () => {
    expect(blogMessagesEn.readingTime(3, "3")).toBe("3 min read");
    expect(blogMessagesVi.readingTime(3, "3")).toBe("3 phút đọc");
  });
});
