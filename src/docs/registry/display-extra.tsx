import { useState } from "react";
import {
  Box20Regular,
  Checkmark20Regular,
  Comment20Regular,
  DocumentArrowUp20Regular,
  People20Regular,
  VehicleTruckProfile20Regular,
} from "@fluentui/react-icons";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { BlogList, BlogTagFilter, filterPosts, type BlogPost } from "@/components/ui/Blog/Blog";
import { Button } from "@/components/ui/Button/Button";
import { Sparkline } from "@/components/ui/Chart/Chart";
import { DescriptionItem, DescriptionList } from "@/components/ui/DescriptionList/DescriptionList";
import { Article, ArticleBody, ArticleHeader, ArticleMeta, ArticleToc, readingTime } from "@/components/ui/Article/Article";
import { Markdown, markdownHeadings } from "@/components/ui/Markdown/Markdown";
import { Prose } from "@/components/ui/Prose/Prose";
import { SearchBox } from "@/components/ui/SearchBox/SearchBox";
import { Sonner, sonner, type SonnerPosition } from "@/components/ui/Sonner/Sonner";
import { Stat } from "@/components/ui/Stat/Stat";
import { Switch } from "@/components/ui/Switch/Switch";
import { Timeline, TimelineItem } from "@/components/ui/Timeline/Timeline";
import type { ComponentDoc } from "../types";
import { landscape, mountain, sunset } from "../sample-assets";

/* ------------------------------------------------------------------ demos */

/* ---------------------------------------------------------------- Blog */

const BLOG_CODE = `// mountain, sunset, landscape: any image URL (generated SVGs here).
const POSTS: BlogPost[] = [
  {
    id: "release-2-4",
    title: "Release 2.4: faster search and exports",
    href: "/blog/release-2-4",
    excerpt: "Search answers in under 50 ms, and every table can be exported to CSV.",
    cover: { src: sunset, alt: "Sunset over hills" },
    author: { name: "Linh Tran" },
    published: "2026-11-18",
    readingTime: 3,
    tags: ["release"],
  },
  {
    id: "spacing",
    title: "Calm interfaces with spacing, not borders",
    href: "/blog/spacing",
    excerpt: "How a spacing scale and clear headings replace most dividers.",
    cover: { src: mountain, alt: "Mountains under a pale sky" },
    author: { name: "Linh Tran" },
    published: "2026-11-02",
    readingTime: 6,
    tags: ["design"],
  },
  {
    id: "focus",
    title: "A focus ring that never disappears",
    href: "/blog/focus",
    excerpt: "Outline-only focus, forced colors and why border-radius stays put.",
    cover: { src: landscape, alt: "A lake below mountains" },
    author: { name: "Minh Pham" },
    published: "2026-10-21",
    readingTime: 4,
    tags: ["accessibility", "design"],
  },
  {
    id: "tokens",
    title: "Design tokens in a cascade layer",
    href: "/blog/tokens",
    excerpt: "Your own token values now win whatever the file order.",
    author: { name: "Minh Pham" },
    published: "2026-10-09",
    readingTime: 5,
    tags: ["engineering"],
  },
];

const TAGS = ["release", "design", "accessibility", "engineering"].map((tag) => ({
  tag,
  count: POSTS.filter((p) => p.tags?.includes(tag)).length,
}));

function BlogDemo() {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const filtering = query.trim() !== "" || tags.length > 0;
  const posts = filterPosts(POSTS, { query, tags });
  return (
    <div className="flex w-full flex-col gap-4">
      <SearchBox value={query} onValueChange={setQuery} placeholder="Search posts" aria-label="Search posts" className="max-w-sm" />
      <BlogTagFilter tags={TAGS} selected={tags} onSelectedChange={setTags} />
      <BlogList posts={posts} featuredId={filtering ? undefined : "release-2-4"} headingLevel="h2" locale="en-US" />
    </div>
  );
}`;

// mountain, sunset, landscape: any image URL (generated SVGs here).
const POSTS: BlogPost[] = [
  {
    id: "release-2-4",
    title: "Release 2.4: faster search and exports",
    href: "/blog/release-2-4",
    excerpt: "Search answers in under 50 ms, and every table can be exported to CSV.",
    cover: { src: sunset, alt: "Sunset over hills" },
    author: { name: "Linh Tran" },
    published: "2026-11-18",
    readingTime: 3,
    tags: ["release"],
  },
  {
    id: "spacing",
    title: "Calm interfaces with spacing, not borders",
    href: "/blog/spacing",
    excerpt: "How a spacing scale and clear headings replace most dividers.",
    cover: { src: mountain, alt: "Mountains under a pale sky" },
    author: { name: "Linh Tran" },
    published: "2026-11-02",
    readingTime: 6,
    tags: ["design"],
  },
  {
    id: "focus",
    title: "A focus ring that never disappears",
    href: "/blog/focus",
    excerpt: "Outline-only focus, forced colors and why border-radius stays put.",
    cover: { src: landscape, alt: "A lake below mountains" },
    author: { name: "Minh Pham" },
    published: "2026-10-21",
    readingTime: 4,
    tags: ["accessibility", "design"],
  },
  {
    id: "tokens",
    title: "Design tokens in a cascade layer",
    href: "/blog/tokens",
    excerpt: "Your own token values now win whatever the file order.",
    author: { name: "Minh Pham" },
    published: "2026-10-09",
    readingTime: 5,
    tags: ["engineering"],
  },
];

const TAGS = ["release", "design", "accessibility", "engineering"].map((tag) => ({
  tag,
  count: POSTS.filter((p) => p.tags?.includes(tag)).length,
}));

function BlogDemo() {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const filtering = query.trim() !== "" || tags.length > 0;
  const posts = filterPosts(POSTS, { query, tags });
  return (
    <div className="flex w-full flex-col gap-4">
      <SearchBox value={query} onValueChange={setQuery} placeholder="Search posts" aria-label="Search posts" className="max-w-sm" />
      <BlogTagFilter tags={TAGS} selected={tags} onSelectedChange={setTags} />
      <BlogList posts={posts} featuredId={filtering ? undefined : "release-2-4"} headingLevel="h2" locale="en-US" />
    </div>
  );
}


/* ---------------------------------------------------------------- Article */

const ARTICLE_CODE = `const POST = [
  "## Why rhythm beats borders",
  "",
  "Most screens use borders to separate things that spacing could separate on its own. Start with a **4 px grid** and let headings carry the structure.",
  "",
  "## Spacing scale",
  "",
  "| Token | Value | Use |",
  "| --- | ---: | --- |",
  "| spacing-2 | 8 px | inside controls |",
  "| spacing-4 | 16 px | between fields |",
  "| spacing-8 | 32 px | between sections |",
  "",
  "## A very long heading that has to wrap on small screens without overflowing the page",
  "",
  "Long headings wrap instead of pushing the layout sideways.",
  "",
  "## Applying it in code",
  "",
  "\`\`\`tsx",
  "<Stack gap=\\"4\\">",
  "  <Field label=\\"Name\\" />",
  "  <Field label=\\"Email\\" />",
  "</Stack>",
  "\`\`\`",
  "",
  "## Spacing scale",
  "",
  "A second section with the same title gets its own id in the table of contents.",
].join("\\n");

const HEADINGS = markdownHeadings(POST);

function ArticleDemo() {
  return (
    <Article toc={<ArticleToc items={HEADINGS} offset={64} />} className="w-full">
      <ArticleHeader
        eyebrow="Design notes"
        title="Calm interfaces with spacing, not borders"
        excerpt="How a spacing scale and clear headings replace most dividers."
        meta={
          <ArticleMeta
            author={{ name: "Linh Tran", avatar: <Avatar name="Linh Tran" size={24} /> }}
            published="2026-11-02"
            updated="2026-11-20"
            readingTime={readingTime(POST)}
            tags={["design", "spacing"]}
          />
        }
      />
      <ArticleBody className="mt-6">
        <Markdown headingIds size="large">{POST}</Markdown>
      </ArticleBody>
    </Article>
  );
}`;

const POST = [
  "## Why rhythm beats borders",
  "",
  "Most screens use borders to separate things that spacing could separate on its own. Start with a **4 px grid** and let headings carry the structure.",
  "",
  "## Spacing scale",
  "",
  "| Token | Value | Use |",
  "| --- | ---: | --- |",
  "| spacing-2 | 8 px | inside controls |",
  "| spacing-4 | 16 px | between fields |",
  "| spacing-8 | 32 px | between sections |",
  "",
  "## A very long heading that has to wrap on small screens without overflowing the page",
  "",
  "Long headings wrap instead of pushing the layout sideways.",
  "",
  "## Applying it in code",
  "",
  "```tsx",
  "<Stack gap=\"4\">",
  "  <Field label=\"Name\" />",
  "  <Field label=\"Email\" />",
  "</Stack>",
  "```",
  "",
  "## Spacing scale",
  "",
  "A second section with the same title gets its own id in the table of contents.",
].join("\n");

const HEADINGS = markdownHeadings(POST);

function ArticleDemo() {
  return (
    <Article toc={<ArticleToc items={HEADINGS} offset={64} />} className="w-full">
      <ArticleHeader
        eyebrow="Design notes"
        title="Calm interfaces with spacing, not borders"
        excerpt="How a spacing scale and clear headings replace most dividers."
        meta={
          <ArticleMeta
            author={{ name: "Linh Tran", avatar: <Avatar name="Linh Tran" size={24} /> }}
            published="2026-11-02"
            updated="2026-11-20"
            readingTime={readingTime(POST)}
            tags={["design", "spacing"]}
          />
        }
      />
      <ArticleBody className="mt-6">
        <Markdown headingIds size="large">{POST}</Markdown>
      </ArticleBody>
    </Article>
  );
}


function RouterLinkDemo() {
  const [path, setPath] = useState("/");
  return (
    <div className="flex flex-col gap-2">
      <Markdown
        renderLink={({ href, title, children, external }) =>
          external ? (
            <a href={href} title={title} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ) : (
            // In an app: call your router's navigate(href).
            <a
              href={href}
              title={title}
              onClick={(e) => {
                e.preventDefault();
                setPath(href);
              }}
            >
              {children}
            </a>
          )
        }
      >
        {"Read the [installation guide](/concepts/quick-start) or [Prose](/components/prose). Source code is on [GitHub](https://github.com)."}
      </Markdown>
      <p className="text-caption1 text-foreground-3">Path: {path}</p>
    </div>
  );
}

const API_NOTES = `## Getting started with the API

Every request needs an **API key** in the \`Authorization\` header. Create one under [Settings](#settings).

1. Create a read-only key.
2. Store the key in an environment variable.
3. Try \`GET /v1/orders\`.

| Plan     | Requests / min |
| -------- | -------------: |
| Free     |             60 |
| Pro      |          1,200 |
`;

function SonnerDemo() {
  return (
    <>
      <Sonner sonnerId="docs-sonner" />
      <Button
        appearance="primary"
        onClick={() =>
          sonner.success("Changes saved", {
            description: "“Q4 plan” was saved to the cloud.",
            action: { label: "Undo" },
            sonnerId: "docs-sonner",
          })
        }
      >
        Save document
      </Button>
    </>
  );
}

function SonnerTypesDemo() {
  const options = { sonnerId: "docs-sonner-types" };
  return (
    <>
      <Sonner sonnerId="docs-sonner-types" />
      <Button onClick={() => sonner("Moved 3 files to Projects", options)}>Default</Button>
      <Button onClick={() => sonner.success("Invitation sent", options)}>Success</Button>
      <Button onClick={() => sonner.info("An update is available", options)}>Info</Button>
      <Button onClick={() => sonner.warning("Storage is almost full", options)}>Warning</Button>
      <Button onClick={() => sonner.error("Couldn't upload the file", options)}>Error</Button>
      <Button onClick={() => sonner.loading("Syncing…", { ...options, duration: 3000 })}>Loading</Button>
    </>
  );
}

function wait(ms: number, fail = false) {
  return new Promise<number>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Connection lost")) : resolve(12)), ms));
}

function SonnerPromiseDemo() {
  const run = (fail: boolean) =>
    sonner.promise(wait(1500, fail), {
      loading: "Saving 12 items…",
      success: (count) => `Saved ${count} items`,
      error: (error) => `Couldn't save: ${(error as Error).message}`,
      sonnerId: "docs-sonner-promise",
    });
  return (
    <>
      <Sonner sonnerId="docs-sonner-promise" />
      <Button appearance="primary" onClick={() => run(false)}>
        Save
      </Button>
      <Button onClick={() => run(true)}>Save (fails)</Button>
    </>
  );
}

function SonnerStackDemo() {
  const [expand, setExpand] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <>
      <Sonner sonnerId="docs-sonner-stack" expand={expand} />
      <Button
        onClick={() => {
          setCount(count + 1);
          sonner(`Notification ${count + 1}`, { description: "Hover over the stack to see them all.", sonnerId: "docs-sonner-stack" });
        }}
      >
        Add notification
      </Button>
      <Switch label="Always expanded" checked={expand} onCheckedChange={setExpand} />
    </>
  );
}

const SONNER_POSITIONS: SonnerPosition[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"];

function SonnerPositionDemo() {
  const [position, setPosition] = useState<SonnerPosition>("top-end");
  return (
    <>
      <Sonner sonnerId="docs-sonner-position" position={position} richColors closeButton />
      {SONNER_POSITIONS.map((p) => (
        <Button
          key={p}
          size="small"
          onClick={() => {
            setPosition(p);
            sonner.warning("Position: " + p, {
              description: "Swipe toward the edge to dismiss.",
              cancel: { label: "Dismiss" },
              sonnerId: "docs-sonner-position",
            });
          }}
        >
          {p}
        </Button>
      ))}
    </>
  );
}

const POST_HTML = [
  "<p>Autumn in Kyoto starts in late October, when the maples at <em>Tōfuku-ji</em> turn red.</p>",
  "<h2>When to go</h2>",
  "<ul><li>Early morning, before 8 a.m., to beat the crowds.</li><li>On a weekday rather than a weekend.</li></ul>",
].join("");

const REVENUE = [42, 45, 44, 51, 49, 56, 61, 58, 66, 71, 69, 78];

/* ------------------------------------------------------------------ docs */

const DOCS: Record<string, ComponentDoc> = {
  /* ---------------------------------------------------------------- Sonner */
  sonner: {
    slug: "sonner",
    name: "Sonner",
    category: "Phản hồi",
    lead: "Sonner là thông báo ngắn xếp chồng ở góc màn hình: thông báo mới ở trước, thông báo cũ lùi ra sau, trỏ chuột vào thì xoè ra.",
    description:
      "Đặt `<Sonner />` một lần ở gốc ứng dụng, rồi gọi `sonner(\"…\")`, `sonner.success(…)` hoặc `sonner.promise(…)` ở bất kỳ đâu. Gọi lại với cùng `id` sẽ thay nội dung tại chỗ. Trỏ chuột hoặc focus vào vùng thông báo thì chồng xoè thành danh sách và tạm dừng đếm giờ; vuốt để đóng; F8 để focus vùng thông báo. Toast vẫn dùng cho một danh sách thông báo cố định theo Fluent.",
    importCode: `import { Sonner, sonner } from "@/components/ui";`,
    hero: {
      title: "Sonner",
      code: `function SonnerDemo() {
  return (
    <>
      <Sonner sonnerId="docs-sonner" />
      <Button
        appearance="primary"
        onClick={() =>
          sonner.success("Changes saved", {
            description: "“Q4 plan” was saved to the cloud.",
            action: { label: "Undo" },
            sonnerId: "docs-sonner",
          })
        }
      >
        Save document
      </Button>
    </>
  );
}`,
      render: () => <SonnerDemo />,
    },
    examples: [
      {
        title: "Loại",
        description: "Mặc định không có icon; success, info, warning, error dùng icon của MessageBar; loading không tự đóng.",
        code: `function SonnerTypesDemo() {
  const options = { sonnerId: "docs-sonner-types" };
  return (
    <>
      <Sonner sonnerId="docs-sonner-types" />
      <Button onClick={() => sonner("Moved 3 files to Projects", options)}>Default</Button>
      <Button onClick={() => sonner.success("Invitation sent", options)}>Success</Button>
      <Button onClick={() => sonner.info("An update is available", options)}>Info</Button>
      <Button onClick={() => sonner.warning("Storage is almost full", options)}>Warning</Button>
      <Button onClick={() => sonner.error("Couldn't upload the file", options)}>Error</Button>
      <Button onClick={() => sonner.loading("Syncing…", { ...options, duration: 3000 })}>Loading</Button>
    </>
  );
}`,
        render: () => <SonnerTypesDemo />,
      },
      {
        title: "Theo một promise",
        description: "sonner.promise hiện loading, rồi đổi tại chỗ thành success hoặc error. success / error nhận hàm để dùng kết quả.",
        code: `function wait(ms: number, fail = false) {
  return new Promise<number>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Connection lost")) : resolve(12)), ms));
}

function SonnerPromiseDemo() {
  const run = (fail: boolean) =>
    sonner.promise(wait(1500, fail), {
      loading: "Saving 12 items…",
      success: (count) => \`Saved \${count} items\`,
      error: (error) => \`Couldn't save: \${(error as Error).message}\`,
      sonnerId: "docs-sonner-promise",
    });
  return (
    <>
      <Sonner sonnerId="docs-sonner-promise" />
      <Button appearance="primary" onClick={() => run(false)}>
        Save
      </Button>
      <Button onClick={() => run(true)}>Save (fails)</Button>
    </>
  );
}`,
        render: () => <SonnerPromiseDemo />,
      },
      {
        title: "Xếp chồng & xoè",
        description: "Tối đa visibleToasts (3) thông báo nhìn thấy; thông báo cũ hơn chờ phía sau. expand giữ chồng luôn xoè.",
        code: `function SonnerStackDemo() {
  const [expand, setExpand] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <>
      <Sonner sonnerId="docs-sonner-stack" expand={expand} />
      <Button
        onClick={() => {
          setCount(count + 1);
          sonner(\`Notification \${count + 1}\`, { description: "Hover over the stack to see them all.", sonnerId: "docs-sonner-stack" });
        }}
      >
        Add notification
      </Button>
      <Switch label="Always expanded" checked={expand} onCheckedChange={setExpand} />
    </>
  );
}`,
        render: () => <SonnerStackDemo />,
      },
      {
        title: "Vị trí, richColors & nút đóng",
        description: "richColors tô nền và viền theo loại; closeButton thêm nút X; cancel là nút phụ đóng thông báo.",
        code: `const SONNER_POSITIONS: SonnerPosition[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"];

function SonnerPositionDemo() {
  const [position, setPosition] = useState<SonnerPosition>("top-end");
  return (
    <>
      <Sonner sonnerId="docs-sonner-position" position={position} richColors closeButton />
      {SONNER_POSITIONS.map((p) => (
        <Button
          key={p}
          size="small"
          onClick={() => {
            setPosition(p);
            sonner.warning("Position: " + p, {
              description: "Swipe toward the edge to dismiss.",
              cancel: { label: "Dismiss" },
              sonnerId: "docs-sonner-position",
            });
          }}
        >
          {p}
        </Button>
      ))}
    </>
  );
}`,
        render: () => <SonnerPositionDemo />,
      },
    ],
    dos: [
      "Dùng cho phản hồi ngắn sau thao tác: đã lưu, đã gửi, đã xoá kèm Hoàn tác.",
      "Dùng sonner.promise cho thao tác chạy nền để người dùng thấy kết quả mà không phải chờ.",
      "Đặt altText cho action khi label không phải chuỗi.",
    ],
    donts: [
      "Không đặt thông tin quan trọng duy nhất trong thông báo, nó sẽ biến mất.",
      "Không đặt cả Toaster và Sonner cùng vị trí trong một app.",
      "Không đặt form hay nhiều hơn hai nút trong một thông báo.",
    ],
    props: [
      { name: "position", type: `"top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"`, defaultValue: `"bottom-end"`, description: "Vị trí vùng thông báo; start / end đổi theo chiều đọc." },
      { name: "expand", type: "boolean", defaultValue: "false", description: "Luôn xoè thành danh sách." },
      { name: "visibleToasts", type: "number", defaultValue: "3", description: "Số thông báo nhìn thấy cùng lúc." },
      { name: "richColors", type: "boolean", defaultValue: "false", description: "Nền và viền theo loại, như MessageBar." },
      { name: "closeButton", type: "boolean", defaultValue: "false", description: "Nút đóng (X) trên mọi thông báo; từng thông báo có thể ghi đè." },
      { name: "duration", type: "number", defaultValue: "4000", description: "Thời gian tự đóng mặc định (ms)." },
      { name: "gap", type: "number", defaultValue: "12", description: "Khoảng cách khi xoè và phần ló ra khi xếp chồng (px)." },
      { name: "sonnerId", type: "string", description: "Khi có nhiều Sonner: thông báo truyền cùng sonnerId mới hiện ở đây." },
      { name: "sonner(title, options?)", type: "string", description: "Hiện thông báo, trả về id. Có thêm .success, .info, .warning, .error, .loading." },
      { name: "sonner.promise(promise, data)", type: "string", description: "data: { loading, success, error } cùng các tuỳ chọn khác; success / error nhận giá trị hoặc hàm." },
      { name: "sonner.dismiss(id?)", type: "void", description: "Đóng một thông báo, hoặc tất cả khi bỏ trống id." },
      { name: "SonnerOptions.description", type: "ReactNode", description: "Dòng mô tả dưới tiêu đề." },
      { name: "SonnerOptions.action", type: "{ label; altText?; onClick? }", description: "Nút chính; gọi event.preventDefault() trong onClick để giữ thông báo mở." },
      { name: "SonnerOptions.cancel", type: "{ label; altText?; onClick? }", description: "Nút phụ, đóng thông báo." },
      { name: "SonnerOptions.id", type: "string", description: "Gọi lại với id của thông báo đang mở để thay nội dung tại chỗ." },
      { name: "SonnerOptions.icon", type: "ReactNode", description: "Thay icon theo loại; null = không icon." },
      { name: "SonnerOptions.duration", type: "number", description: "Ghi đè thời gian tự đóng; Infinity = không tự đóng." },
      { name: "SonnerOptions.onDismiss", type: "(id: string) => void", description: "Người dùng đóng (nút, vuốt, Esc) hoặc gọi sonner.dismiss." },
      { name: "SonnerOptions.onAutoClose", type: "(id: string) => void", description: "Hết thời gian tự đóng." },
    ],
  },

  /* ---------------------------------------------------------------- Timeline */
  timeline: {
    slug: "timeline",
    name: "Timeline",
    category: "Hiển thị dữ liệu",
    lead: "Timeline liệt kê các sự kiện theo thời gian và có thể theo dõi tiến độ cuộn để làm nổi bật trạng thái hiện tại của roadmap, lịch sử phát hành hoặc yêu cầu.",
    description:
      "Timeline là một `<ol>`; mỗi TimelineItem có tiêu đề, thời gian, icon (hoặc Avatar) và nội dung thêm tuỳ chọn. Truyền `dateTime` để thời gian thành thẻ `<time>` máy đọc được. `progress` bật một rail theo scroll với một listener cuộn dùng requestAnimationFrame, tự suy ra item upcoming/current/complete và cung cấp progressbar cho trình đọc màn hình. `dateLayout=\"sticky\"` đặt ngày ở cột riêng trên màn hình rộng và đưa ngày lên trên nội dung ở màn hình hẹp. variant compact dùng chấm nhỏ và một dòng cho mỗi sự kiện, hợp với nhật ký dài. Icon chỉ để trang trí, nên tiêu đề phải tự nói đủ sự kiện.",
    importCode: `import { Timeline, TimelineItem } from "@/components/ui";`,
    hero: {
      title: "Timeline",
      code: `<Timeline aria-label="Order history" className="w-full max-w-md">
  <TimelineItem icon={<VehicleTruckProfile20Regular />} intent="brand" title="Out for delivery" time="Today, 8:30 AM" dateTime="2026-10-28T08:30">
    Express Post · tracking no. EP-5520417
  </TimelineItem>
  <TimelineItem icon={<Box20Regular />} title="Packed" time="Yesterday, 4:05 PM" dateTime="2026-10-27T16:05" />
  <TimelineItem icon={<Checkmark20Regular />} intent="success" title="Paid" time="Yesterday, 9:12 AM" dateTime="2026-10-27T09:12" />
  <TimelineItem icon={<Avatar name="Maria Garcia" size={32} />} title={<><strong className="font-semibold">Maria Garcia</strong> placed order #2041</>} time="Yesterday, 9:10 AM" dateTime="2026-10-27T09:10" />
</Timeline>`,
      render: () => (
        <Timeline aria-label="Order history" className="w-full max-w-md">
          <TimelineItem icon={<VehicleTruckProfile20Regular />} intent="brand" title="Out for delivery" time="Today, 8:30 AM" dateTime="2026-10-28T08:30">
            Express Post · tracking no. EP-5520417
          </TimelineItem>
          <TimelineItem icon={<Box20Regular />} title="Packed" time="Yesterday, 4:05 PM" dateTime="2026-10-27T16:05" />
          <TimelineItem icon={<Checkmark20Regular />} intent="success" title="Paid" time="Yesterday, 9:12 AM" dateTime="2026-10-27T09:12" />
          <TimelineItem
            icon={<Avatar name="Maria Garcia" size={32} />}
            title={
              <>
                <strong className="font-semibold">Maria Garcia</strong> placed order #2041
              </>
            }
            time="Yesterday, 9:10 AM"
            dateTime="2026-10-27T09:10"
          />
        </Timeline>
      ),
    },
    examples: [
      {
        title: "Compact",
        description: "Chấm nhỏ, tiêu đề và thời gian trên một dòng; nội dung thêm dùng chữ caption.",
        code: `<Timeline variant="compact" aria-label="Recent activity" className="w-full max-w-md">
  <TimelineItem title="Sam changed the status to Done" time="10 min ago" intent="success" />
  <TimelineItem title="Priya commented" time="1 hour ago" icon={<Comment20Regular />}>
    “I've updated the Q3 numbers. Could everyone take a look?”
  </TimelineItem>
  <TimelineItem title="Priya uploaded q3-report.pdf" time="1 hour ago" icon={<DocumentArrowUp20Regular />} />
  <TimelineItem title="Maria added 2 members" time="Yesterday" icon={<People20Regular />} />
</Timeline>`,
        render: () => (
          <Timeline variant="compact" aria-label="Recent activity" className="w-full max-w-md">
            <TimelineItem title="Sam changed the status to Done" time="10 min ago" intent="success" />
            <TimelineItem title="Priya commented" time="1 hour ago" icon={<Comment20Regular />}>
              “I've updated the Q3 numbers. Could everyone take a look?”
            </TimelineItem>
            <TimelineItem title="Priya uploaded q3-report.pdf" time="1 hour ago" icon={<DocumentArrowUp20Regular />} />
            <TimelineItem title="Maria added 2 members" time="Yesterday" icon={<People20Regular />} />
          </Timeline>
        ),
      },
      {
        title: "Intent không icon",
        description: "Không có icon thì là chấm tròn theo intent: neutral, brand, success, warning, error.",
        code: `<Timeline aria-label="Deployment history" className="w-full max-w-md">
  <TimelineItem intent="error" title="Deploy of v2.4.1 failed" time="14:02">
    Health check failed after 3 attempts; rolled back to v2.4.0.
  </TimelineItem>
  <TimelineItem intent="warning" title="Response time up 30%" time="13:48" />
  <TimelineItem intent="success" title="Deployed v2.4.0" time="Yesterday" />
  <TimelineItem title="Created staging environment" time="Oct 20" />
</Timeline>`,
        render: () => (
          <Timeline aria-label="Deployment history" className="w-full max-w-md">
            <TimelineItem intent="error" title="Deploy of v2.4.1 failed" time="14:02">
              Health check failed after 3 attempts; rolled back to v2.4.0.
            </TimelineItem>
            <TimelineItem intent="warning" title="Response time up 30%" time="13:48" />
            <TimelineItem intent="success" title="Deployed v2.4.0" time="Yesterday" />
            <TimelineItem title="Created staging environment" time="Oct 20" />
          </Timeline>
        ),
      },
      {
        title: "Scroll progress & trạng thái hiện tại",
        description: "Rail tiến độ chạy theo scroll; item tự chuyển upcoming → current → complete. Ngày sticky đổi thành bố cục trên/dưới ở màn hình hẹp.",
        code: `<Timeline progress scrollOffset={0.65} dateLayout="sticky" aria-label="Release roadmap" className="w-full max-w-2xl">
  <TimelineItem title="Research" time="Jan 2026" dateTime="2026-01-15" />
  <TimelineItem title="Beta" time="Mar 2026" dateTime="2026-03-20" />
  <TimelineItem title="General availability" time="Jun 2026" dateTime="2026-06-01" />
</Timeline>`,
        render: () => (
          <Timeline progress scrollOffset={0.65} dateLayout="sticky" aria-label="Release roadmap" className="w-full max-w-2xl">
            <TimelineItem title="Research" time="Jan 2026" dateTime="2026-01-15" />
            <TimelineItem title="Beta" time="Mar 2026" dateTime="2026-03-20" />
            <TimelineItem title="General availability" time="Jun 2026" dateTime="2026-06-01" />
          </Timeline>
        ),
      },
    ],
    dos: [
      "Xếp sự kiện mới nhất lên đầu, trừ khi người dùng đang theo dõi một quy trình từ đầu đến cuối.",
      "Viết tiêu đề đủ ý (ai, làm gì) vì icon không được đọc cho trình đọc màn hình.",
      "Truyền dateTime khi thời gian hiển thị là tương đối (“2 giờ trước”).",
      "Dùng progress cho roadmap, changelog hoặc lịch sử dài; giữ scrollOffset ổn định để trạng thái hiện tại dễ đoán.",
    ],
    donts: [
      "Không dùng Timeline cho các bước chưa xảy ra mà người dùng phải đi qua — dùng Stepper.",
      "Không dùng intent chỉ để trang trí; giữ màu cho trạng thái thật sự khác.",
      "Không bật progress cho danh sách rất ngắn hoặc gắn thêm scroll listener riêng cho từng item.",
    ],
    props: [
      { name: "variant", type: `"detailed" | "compact"`, defaultValue: `"detailed"`, description: "detailed: ô icon 32px, nội dung bên dưới · compact: chấm nhỏ, một dòng." },
      { name: "progress", type: "boolean", defaultValue: "false", description: "Bật rail tiến độ theo scroll và tự suy ra trạng thái upcoming/current/complete." },
      { name: "scrollOffset", type: "number", defaultValue: "0.65", description: "Vị trí đường đánh dấu trong viewport; được giới hạn trong 0.1–0.9." },
      { name: "activeIndex", type: "number", description: "Chỉ số item hiện tại do ứng dụng điều khiển; hữu ích khi tiến độ đến từ nguồn khác." },
      { name: "progressLabel", type: "string", defaultValue: "messages.timeline.progressLabel", description: "Tên của progressbar ẩn cho trình đọc màn hình. Mặc định theo ngôn ngữ của app (\"Timeline progress\", \"Tiến độ dòng thời gian\")." },
      { name: "dateLayout", type: `"inline" | "sticky"`, defaultValue: `"inline"`, description: "sticky dùng cột ngày riêng trên màn hình rộng và xếp ngày lên trên ở màn hình hẹp." },
      { name: "TimelineItem.title", type: "ReactNode", description: "Sự kiện: ai làm gì." },
      { name: "TimelineItem.time", type: "ReactNode", description: "Thời gian hiển thị." },
      { name: "TimelineItem.dateTime", type: "string", description: "Thời điểm ISO 8601 → thẻ <time dateTime>." },
      { name: "TimelineItem.icon", type: "ReactNode", description: "Icon hoặc Avatar; bỏ trống = chấm tròn." },
      { name: "TimelineItem.intent", type: `"neutral" | "brand" | "success" | "warning" | "error"`, defaultValue: `"neutral"`, description: "Màu ô icon / chấm. Giá trị cũ \"danger\" đã lỗi thời (bỏ ở 1.0)." },
      { name: "TimelineItem.status", type: `"upcoming" | "current" | "complete"`, description: "Ghi đè trạng thái tự suy ra khi cần điều khiển thủ công." },
      { name: "TimelineItem.children", type: "ReactNode", description: "Nội dung thêm: bình luận, tệp, thẻ." },
    ],
  },

  /* ---------------------------------------------------------------- DescriptionList */
  descriptionlist: {
    slug: "descriptionlist",
    name: "DescriptionList",
    category: "Hiển thị dữ liệu",
    lead: "DescriptionList hiển thị các cặp nhãn / giá trị: chi tiết đơn hàng, hồ sơ, tóm tắt cài đặt.",
    description:
      "DescriptionList là một `<dl>`; mỗi DescriptionItem gồm `<dt>` và `<dd>`. columns là số cột tối đa: khung hẹp tự bớt cột mà không cần breakpoint. layout inline đặt nhãn và giá trị cùng hàng; valueAlign end đẩy giá trị về cuối hàng cho bảng tổng tiền. copyable thêm nút sao chép giá trị, trình đọc màn hình đọc kèm nhãn của mục.",
    importCode: `import { DescriptionList, DescriptionItem } from "@/components/ui";`,
    hero: {
      title: "DescriptionList",
      code: `<DescriptionList columns={2} className="w-full max-w-xl">
  <DescriptionItem label="Order ID" copyable>
    ORD-2041
  </DescriptionItem>
  <DescriptionItem label="Order date">Oct 27, 2026, 9:10 AM</DescriptionItem>
  <DescriptionItem label="Customer">Maria Garcia</DescriptionItem>
  <DescriptionItem label="Email" copyable="maria.garcia@example.com">
    <a className="text-link hover:underline" href="mailto:maria.garcia@example.com">maria.garcia@example.com</a>
  </DescriptionItem>
  <DescriptionItem label="Shipping address" fullWidth>
    400 Market Street, Suite 12, San Francisco, CA 94105
  </DescriptionItem>
</DescriptionList>`,
      render: () => (
        <DescriptionList columns={2} className="w-full max-w-xl">
          <DescriptionItem label="Order ID" copyable>
            ORD-2041
          </DescriptionItem>
          <DescriptionItem label="Order date">Oct 27, 2026, 9:10 AM</DescriptionItem>
          <DescriptionItem label="Customer">Maria Garcia</DescriptionItem>
          <DescriptionItem label="Email" copyable="maria.garcia@example.com">
            <a className="text-link hover:underline" href="mailto:maria.garcia@example.com">
              maria.garcia@example.com
            </a>
          </DescriptionItem>
          <DescriptionItem label="Shipping address" fullWidth>
            400 Market Street, Suite 12, San Francisco, CA 94105
          </DescriptionItem>
        </DescriptionList>
      ),
    },
    examples: [
      {
        title: "Inline & divided",
        description: "Nhãn và giá trị cùng hàng, có đường kẻ giữa các mục — hợp với trang hồ sơ, cài đặt.",
        code: `<DescriptionList layout="inline" divided className="w-full max-w-lg">
  <DescriptionItem label="Name">Sam Lee</DescriptionItem>
  <DescriptionItem label="Role">Admin</DescriptionItem>
  <DescriptionItem label="Time zone">(UTC+09:00) Osaka, Sapporo, Tokyo</DescriptionItem>
  <DescriptionItem label="API key" copyable>
    <span className="font-mono">yg_live_51Hc…9QeD</span>
  </DescriptionItem>
</DescriptionList>`,
        render: () => (
          <DescriptionList layout="inline" divided className="w-full max-w-lg">
            <DescriptionItem label="Name">Sam Lee</DescriptionItem>
            <DescriptionItem label="Role">Admin</DescriptionItem>
            <DescriptionItem label="Time zone">(UTC+09:00) Osaka, Sapporo, Tokyo</DescriptionItem>
            <DescriptionItem label="API key" copyable>
              <span className="font-mono">yg_live_51Hc…9QeD</span>
            </DescriptionItem>
          </DescriptionList>
        ),
      },
      {
        title: "Tổng tiền",
        description: "valueAlign end đẩy giá trị về cuối hàng; mục cuối đậm hơn bằng className.",
        code: `<DescriptionList layout="inline" valueAlign="end" className="w-full max-w-xs tabular-nums">
  <DescriptionItem label="Subtotal">$1,240.00</DescriptionItem>
  <DescriptionItem label="Shipping">Free</DescriptionItem>
  <DescriptionItem label="Discount">−$124.00</DescriptionItem>
  <DescriptionItem label="Total" className="border-t border-stroke-2 pt-2 font-semibold [&_dt]:text-foreground-1">
    $1,116.00
  </DescriptionItem>
</DescriptionList>`,
        render: () => (
          <DescriptionList layout="inline" valueAlign="end" className="w-full max-w-xs tabular-nums">
            <DescriptionItem label="Subtotal">$1,240.00</DescriptionItem>
            <DescriptionItem label="Shipping">Free</DescriptionItem>
            <DescriptionItem label="Discount">−$124.00</DescriptionItem>
            <DescriptionItem label="Total" className="border-t border-stroke-2 pt-2 font-semibold [&_dt]:text-foreground-1">
              $1,116.00
            </DescriptionItem>
          </DescriptionList>
        ),
      },
    ],
    dos: [
      "Viết nhãn ngắn, viết hoa chữ đầu câu, không dấu hai chấm.",
      "Bật copyable cho giá trị người dùng hay chép: mã đơn, email, mã API.",
      "Dùng fullWidth cho giá trị dài (địa chỉ, ghi chú) khi có nhiều cột.",
    ],
    donts: [
      "Không dùng DescriptionList cho dữ liệu nhiều hàng cùng cột — dùng Table.",
      "Không để giá trị trống; ghi “Chưa có” hoặc một dấu gạch có giải thích.",
    ],
    props: [
      { name: "columns", type: "1 | 2 | 3 | 4", defaultValue: "1", description: "Số cột tối đa; khung hẹp tự bớt cột." },
      { name: "layout", type: `"stacked" | "inline"`, defaultValue: `"stacked"`, description: "Nhãn trên giá trị, hoặc cùng hàng." },
      { name: "divided", type: "boolean", defaultValue: "false", description: "Đường kẻ trên mỗi mục." },
      { name: "valueAlign", type: `"start" | "end"`, defaultValue: `"start"`, description: "end: giá trị ở cuối hàng (layout inline)." },
      { name: "DescriptionItem.label", type: "ReactNode", description: "Nhãn (<dt>)." },
      { name: "DescriptionItem.children", type: "ReactNode", description: "Giá trị (<dd>)." },
      { name: "DescriptionItem.copyable", type: "boolean | string", description: "Nút sao chép: true chép chữ đang hiển thị, chuỗi = chép đúng chuỗi đó." },
      { name: "DescriptionItem.fullWidth", type: "boolean", description: "Chiếm cả hàng khi có nhiều cột." },
    ],
  },

  /* ---------------------------------------------------------------- Stat */
  stat: {
    slug: "stat",
    name: "Stat",
    category: "Hiển thị dữ liệu",
    lead: "Stat hiển thị một con số chính kèm mức thay đổi và biểu đồ nhỏ tuỳ chọn.",
    description:
      "Số được định dạng theo locale của YugenProvider và tự rút gọn từ 10.000 (12,9 N). delta là mức thay đổi có dấu, mặc định hiển thị phần trăm; goodDirection quyết định tăng là tốt (xanh) hay xấu (đỏ), và chiều thay đổi luôn có chữ ẩn cho trình đọc màn hình. chart nhận một biểu đồ nhỏ, thường là Sparkline. StatTile trong Yugen Labs giờ là Stat kèm Sparkline vẽ từ trend.",
    importCode: `import { Stat } from "@/components/ui";`,
    hero: {
      title: "Stat",
      code: `<div className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-6">
  <Stat label="Revenue" value={128_400} valueFormat={{ notation: "compact", style: "currency", currency: "USD" }} delta={0.124} deltaLabel="vs. last month" />
  <Stat label="Orders" value={1_284} delta={0.031} deltaLabel="vs. last month" />
  <Stat label="Return rate" value="2.1%" delta={-0.004} deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }} goodDirection="down" deltaLabel="vs. last month" />
</div>`,
      render: () => (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-6">
          <Stat
            label="Revenue"
            value={128_400}
            valueFormat={{ notation: "compact", style: "currency", currency: "USD" }}
            delta={0.124}
            deltaLabel="vs. last month"
          />
          <Stat label="Orders" value={1_284} delta={0.031} deltaLabel="vs. last month" />
          <Stat
            label="Return rate"
            value="2.1%"
            delta={-0.004}
            deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }}
            goodDirection="down"
            deltaLabel="vs. last month"
          />
        </div>
      ),
    },
    examples: [
      {
        title: "Biểu đồ nhỏ & icon",
        description: "chart đặt biểu đồ cạnh con số; icon đứng trước nhãn.",
        code: `const REVENUE = [42, 45, 44, 51, 49, 56, 61, 58, 66, 71, 69, 78];

<Stat
  className="w-full max-w-sm"
  icon={<People20Regular />}
  label="Active users"
  value={78_200}
  delta={0.13}
  deltaLabel="vs. last month"
  chart={<Sparkline data={REVENUE} width={120} height={40} />}
/>`,
        render: () => (
          <Stat
            className="w-full max-w-sm"
            icon={<People20Regular />}
            label="Active users"
            value={78_200}
            delta={0.13}
            deltaLabel="vs. last month"
            chart={<Sparkline data={REVENUE} width={120} height={40} />}
          />
        ),
      },
      {
        title: "Kích thước",
        description: "medium 28px, large 40px, extra-large 68px — mỗi màn hình tối đa một con số cỡ extra-large.",
        code: `<div className="flex flex-wrap items-end gap-10">
  <Stat size="medium" label="Medium" value={4_210} />
  <Stat size="large" label="Large" value={4_210} />
  <Stat size="extra-large" label="Extra large" value={4_210} />
</div>`,
        render: () => (
          <div className="flex flex-wrap items-end gap-10">
            <Stat size="medium" label="Medium" value={4_210} />
            <Stat size="large" label="Large" value={4_210} />
            <Stat size="extra-large" label="Extra large" value={4_210} />
          </div>
        ),
      },
    ],
    dos: [
      "Ghi rõ mốc so sánh trong deltaLabel (“so với tháng trước”).",
      "Đặt goodDirection=\"down\" cho chỉ số càng thấp càng tốt: tỉ lệ lỗi, thời gian chờ, chi phí.",
      "Dùng valueFormat với style currency / unit để có đơn vị đúng locale.",
    ],
    donts: [
      "Không đặt quá 4–5 Stat trên một hàng; người đọc sẽ không biết nhìn vào đâu.",
      "Không dùng màu delta khi thay đổi không có tốt / xấu — đặt goodDirection=\"neutral\".",
    ],
    props: [
      { name: "label", type: "ReactNode", description: "Nhãn viết hoa chữ đầu câu, không dấu hai chấm." },
      { name: "value", type: "number | string", description: "Số được định dạng theo locale; chuỗi giữ nguyên." },
      { name: "valueFormat", type: "Intl.NumberFormatOptions | (value) => string", defaultValue: "rút gọn từ 10.000", description: "Định dạng con số." },
      { name: "delta", type: "number", description: "Mức thay đổi có dấu (0.124 = +12,4%)." },
      { name: "deltaFormat", type: "Intl.NumberFormatOptions | (value) => string", defaultValue: "phần trăm", description: "Định dạng delta." },
      { name: "deltaLabel", type: "ReactNode", description: "Mốc so sánh." },
      { name: "goodDirection", type: `"up" | "down" | "neutral"`, defaultValue: `"up"`, description: "Chiều tốt: quyết định màu success / danger." },
      { name: "size", type: `"medium" | "large" | "extra-large"`, defaultValue: `"medium"`, description: "Cỡ con số 28 / 40 / 68px. Giá trị cũ \"hero\" đã lỗi thời (bỏ ở 1.0)." },
      { name: "icon", type: "ReactNode", description: "Icon trước nhãn." },
      { name: "chart", type: "ReactNode", description: "Biểu đồ nhỏ cạnh con số, thường là Sparkline." },
      { name: "locale", type: "string", description: "Locale cho Intl.NumberFormat; mặc định theo YugenProvider." },
    ],
  },

  /* ---------------------------------------------------------------- Prose */
  prose: {
    slug: "prose",
    name: "Prose",
    category: "Hiển thị dữ liệu",
    lead: "Prose định dạng nội dung dài từ Markdown hoặc CMS: tiêu đề, đoạn văn, danh sách, bảng, code, trích dẫn và ảnh theo thang chữ Yugen.",
    description:
      "Bọc nội dung trong `<Prose>` (hoặc thêm class `yugen-prose` của theme). Font và nhịp chữ đọc từ biến `--prose-font-body`, `--prose-font-heading`, `--prose-font-mono`, `--prose-size`, `--prose-leading`, `--prose-flow`; preset có sẵn `yugen-prose-docs`, `yugen-prose-article`, `yugen-prose-chat`, `yugen-prose-compact`, hoặc tạo preset riêng ở trang Typeset (/typeset). các thẻ HTML bên trong được định dạng mà không cần class. Selector có độ ưu tiên 0, nên class đặt trên từng thẻ luôn thắng; thêm class `not-prose` cho phần nào cần thoát hẳn. CodeBlock, Table, Quote và Timeline đã có sẵn `not-prose`. size large (16px) cho bài viết dài, medium (14px) cho docs và ghi chú. Prose không làm sạch HTML: nội dung từ người dùng phải được sanitize trước.",
    importCode: `import { Prose } from "@/components/ui";`,
    hero: {
      title: "Prose",
      code: `<Prose className="w-full max-w-prose">
  <h2>Getting started with the API</h2>
  <p>
    Every request needs an <strong>API key</strong> in the <code>Authorization</code> header. Create one under <a href="#">Settings › Developer</a>.
  </p>
  <ol>
    <li>Create a read-only key.</li>
    <li>Store the key in an environment variable, not in source code.</li>
    <li>Try the <code>/v1/orders</code> endpoint.</li>
  </ol>
  <blockquote>
    <p>Revoke a leaked key right away. A new key works within a few seconds.</p>
  </blockquote>
  <h3>Rate limits</h3>
  <table>
    <thead>
      <tr><th>Plan</th><th>Requests / min</th></tr>
    </thead>
    <tbody>
      <tr><td>Free</td><td>60</td></tr>
      <tr><td>Pro</td><td>1,200</td></tr>
    </tbody>
  </table>
</Prose>`,
      render: () => (
        <Prose className="w-full max-w-prose">
          <h2>Getting started with the API</h2>
          <p>
            Every request needs an <strong>API key</strong> in the <code>Authorization</code> header. Create one under{" "}
            <a href="#">Settings › Developer</a>.
          </p>
          <ol>
            <li>Create a read-only key.</li>
            <li>Store the key in an environment variable, not in source code.</li>
            <li>
              Try the <code>/v1/orders</code> endpoint.
            </li>
          </ol>
          <blockquote>
            <p>Revoke a leaked key right away. A new key works within a few seconds.</p>
          </blockquote>
          <h3>Rate limits</h3>
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Requests / min</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Free</td>
                <td>60</td>
              </tr>
              <tr>
                <td>Pro</td>
                <td>1,200</td>
              </tr>
            </tbody>
          </table>
        </Prose>
      ),
    },
    examples: [
      {
        title: "Bài viết & HTML từ CMS",
        description: "asChild render vào <article>; nội dung HTML đã sanitize có thể đưa vào bằng dangerouslySetInnerHTML.",
        code: `const POST_HTML = [
  "<p>Autumn in Kyoto starts in late October, when the maples at <em>Tōfuku-ji</em> turn red.</p>",
  "<h2>When to go</h2>",
  "<ul><li>Early morning, before 8 a.m., to beat the crowds.</li><li>On a weekday rather than a weekend.</li></ul>",
].join("");

function ArticleDemo() {
  return (
    <Prose asChild size="large" className="w-full max-w-prose">
      <article dangerouslySetInnerHTML={{ __html: POST_HTML }} />
    </Prose>
  );
}`,
        render: () => (
          <Prose asChild size="large" className="w-full max-w-prose">
            <article
              dangerouslySetInnerHTML={{
                __html: POST_HTML,
              }}
            />
          </Prose>
        ),
      },
      {
        title: "Thoát bằng not-prose",
        description: "Phần tử có class not-prose (và mọi thứ bên trong) giữ nguyên kiểu gốc.",
        code: `<Prose className="w-full max-w-prose">
  <p>The list below is a menu, not part of the article:</p>
  <ul className="not-prose flex flex-wrap gap-2">
    <li><Button size="small">Copy link</Button></li>
    <li><Button size="small">Share</Button></li>
  </ul>
</Prose>`,
        render: () => (
          <Prose className="w-full max-w-prose">
            <p>The list below is a menu, not part of the article:</p>
            <ul className="not-prose flex flex-wrap gap-2">
              <li>
                <Button size="small">Copy link</Button>
              </li>
              <li>
                <Button size="small">Share</Button>
              </li>
            </ul>
          </Prose>
        ),
      },
    ],
    dos: [
      "Giới hạn độ rộng dòng (max-w-prose, khoảng 65 ký tự) cho nội dung dài.",
      "Sanitize HTML từ CMS hoặc người dùng trước khi render.",
      "Dùng not-prose cho phần giao diện nằm giữa nội dung (nút, menu, form).",
    ],
    donts: [
      "Không bọc cả trang ứng dụng trong Prose; chỉ bọc phần nội dung.",
      "Không dùng Prose để định dạng một đoạn chữ ngắn — dùng Text.",
    ],
    props: [
      { name: "size", type: `"medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ chữ nền: body1 (14px) hoặc body2 (16px)." },
      { name: "asChild", type: "boolean", defaultValue: "false", description: "Render vào phần tử con duy nhất (vd. <article>)." },
    ],
  },

  /* ---------------------------------------------------------------- Markdown */
  markdown: {
    slug: "markdown",
    name: "Markdown",
    category: "Hiển thị dữ liệu",
    lead: "Markdown hiển thị nội dung viết bằng Markdown (bài viết, ghi chú phát hành, mô tả từ CMS) theo kiểu chữ của Prose, an toàn với nội dung không tin cậy.",
    description:
      "Truyền chuỗi Markdown làm children. Hỗ trợ CommonMark và phần GFM hay dùng: heading, đoạn văn, danh sách, danh sách việc, trích dẫn, bảng, code fence (tô màu bằng CodeBlock), đậm, nghiêng, gạch, code, link và ảnh. Không hỗ trợ: HTML (hiện như chữ), link tham chiếu `[x][id]`, chú thích cuối trang và code thụt lề. Link `javascript:`, `data:` chỉ còn nhãn; ảnh chỉ nhận http, https hoặc đường dẫn tương đối, nạp lười (loading=\"lazy\") và cần alt (thiếu thì cảnh báo khi phát triển). Link tương đối (`/path`, `#id`) được giữ; link ngoài mở tab mới. `inline` cho đoạn một dòng: chỉ phần inline, trong một `<span>`. `renderLink` giao link cho router của app, `renderImage` giao ảnh cho component ảnh của framework. Các khối được memo: render lại với cùng nội dung không tô màu code lại. Nội dung đang về theo từng token (câu trả lời AI) dùng StreamingMarkdown.",
    importCode: `import { Markdown } from "@/components/ui";`,
    hero: {
      title: "Markdown",
      code: `const NOTES = \`## Getting started with the API

Every request needs an **API key** in the \\\`Authorization\\\` header. Create one under [Settings](#settings).

1. Create a read-only key.
2. Store the key in an environment variable.
3. Try \\\`GET /v1/orders\\\`.

| Plan     | Requests / min |
| -------- | -------------: |
| Free     |             60 |
| Pro      |          1,200 |
\`;

<Markdown className="w-full max-w-prose">{NOTES}</Markdown>`,
      render: () => <Markdown className="w-full max-w-prose">{API_NOTES}</Markdown>,
    },
    examples: [
      {
        title: "Inline",
        description: "inline render phần inline trong một <span>, không bọc <p>: hợp với mục danh sách, ô bảng, mô tả một dòng.",
        code: `<ul className="flex flex-col gap-2 text-body1">
  <li><Markdown inline>{"Call \`sonner.promise\` to turn **loading** into the result."}</Markdown></li>
  <li><Markdown inline>{"HTML from a CMS? See [Prose](#prose)."}</Markdown></li>
</ul>`,
        render: () => (
          <ul className="flex flex-col gap-2 text-body1">
            <li>
              <Markdown inline>{"Call `sonner.promise` to turn **loading** into the result."}</Markdown>
            </li>
            <li>
              <Markdown inline>{"HTML from a CMS? See [Prose](#prose)."}</Markdown>
            </li>
          </ul>
        ),
      },
      {
        title: "Link qua router",
        description:
          "renderLink nhận href, title, nhãn và external; link nội bộ đi qua router của app (router.navigate, <Link to> của router) thay vì tải lại trang. Ví dụ thay router bằng state.",
        code: `function RouterLinkDemo() {
  const [path, setPath] = useState("/");
  return (
    <div className="flex flex-col gap-2">
      <Markdown
        renderLink={({ href, title, children, external }) =>
          external ? (
            <a href={href} title={title} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ) : (
            // In an app: call your router's navigate(href).
            <a href={href} title={title} onClick={(e) => { e.preventDefault(); setPath(href); }}>
              {children}
            </a>
          )
        }
      >
        {"Read the [installation guide](/concepts/quick-start) or [Prose](/components/prose). Source code is on [GitHub](https://github.com)."}
      </Markdown>
      <p className="text-caption1 text-foreground-3">Path: {path}</p>
    </div>
  );
}`,
        render: () => <RouterLinkDemo />,
      },
      {
        title: "Ảnh qua renderImage",
        description: "renderImage nhận src, alt, title đã làm sạch; truyền width / height để ảnh giữ chỗ trước khi tải xong.",
        code: `<Markdown
  className="w-full max-w-md"
  renderImage={({ src, alt }) => <img src={src === "/lake.png" ? sunset : src} alt={alt} width={640} height={400} className="h-auto w-full rounded-large" />}
>
  {"A quiet morning by the lake.\\n\\n![A lake at sunrise with hills behind it](/lake.png)"}
</Markdown>`,
        render: () => (
          <Markdown
            className="w-full max-w-md"
            renderImage={({ src, alt }) => <img src={src === "/lake.png" ? sunset : src} alt={alt} width={640} height={400} className="h-auto w-full rounded-large" />}
          >
            {"A quiet morning by the lake.\n\n![A lake at sunrise with hills behind it](/lake.png)"}
          </Markdown>
        ),
      },
      {
        title: "Nội dung không tin cậy",
        description: "HTML hiện như chữ, link javascript: chỉ còn nhãn; không cần sanitize trước.",
        code: `<Markdown>{'<img src=x onerror="alert(1)"> and [click here](javascript:alert(1))'}</Markdown>`,
        render: () => <Markdown>{'<img src=x onerror="alert(1)"> and [click here](javascript:alert(1))'}</Markdown>,
      },
    ],
    dos: [
      "Dùng Markdown cho nội dung viết sẵn hoặc từ CMS; dùng StreamingMarkdown cho chữ đang về theo từng token.",
      "Dùng inline cho đoạn một dòng nằm trong bố cục khác (mục danh sách, ô bảng).",
      "Bật headingIds khi trang có mục lục hoặc link tới từng heading.",
    ],
    donts: [
      "Không dùng Markdown để hiện HTML từ CMS: HTML hiện như chữ. Dùng Prose với HTML đã sanitize.",
      "Không đặt Markdown trong Prose: Markdown đã bọc Prose.",
    ],
    props: [
      { name: "children", type: "string", description: "Nội dung Markdown. Không nhận HTML." },
      { name: "inline", type: "boolean", defaultValue: "false", description: "Chỉ phần inline (đậm, nghiêng, gạch, code, link) trong một <span>, không đoạn văn." },
      { name: "size", type: `"medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ chữ của Prose: body1 (14px) hoặc body2 (16px)." },
      { name: "headingOffset", type: "number", defaultValue: "1", description: "Cộng vào cấp heading: mặc định # → h2." },
      { name: "headingIds", type: "boolean | ((text: string) => string)", defaultValue: "false", description: "Gắn id cho heading từ chữ của nó (bỏ dấu, khử trùng bằng -2, -3); truyền hàm để tự tạo id." },
      { name: "breaks", type: "boolean", defaultValue: "false", description: "Xuống dòng đơn thành <br>." },
      { name: "renderLink", type: "(link: MarkdownLink) => ReactNode", description: "Tự render mọi link; MarkdownLink gồm href, title, children, external." },
      { name: "images", type: "boolean", defaultValue: "true", description: "![alt](src) thành ảnh nạp lười; false: hiện như link tới ảnh." },
      { name: "renderImage", type: "(image: MarkdownImage) => ReactNode", description: "Tự render ảnh; MarkdownImage gồm src, alt, title." },
    ],
  },
  /* ---------------------------------------------------------------- Article */
  article: {
    slug: "article",
    name: "Article",
    category: "Hiển thị dữ liệu",
    lead: "Article, ArticleHeader, ArticleMeta, ArticleBody và ArticleToc dựng một bài viết dài từ Markdown: tiêu đề, tác giả và ngày, độ rộng đọc và mục lục.",
    description:
      "Mỗi phần là một component riêng để ghép theo trang của bạn. Article là thẻ <article>; truyền toc để mục lục nằm bên phải và dính khi cuộn từ màn hình lg (màn hình hẹp: trước nội dung). ArticleHeader là <header> với tiêu đề h1 (titleAs đổi cấp), tóm tắt, dòng chuyên mục và ảnh bìa trong khung 16:9 giữ chỗ sẵn. ArticleMeta hiện tác giả, ngày đăng và ngày cập nhật bằng <time>, thời gian đọc và thẻ. ArticleBody giới hạn độ rộng đọc; bảng và code rộng cuộn trong khung của chúng. ArticleToc nhận danh sách heading từ markdownHeadings(), cùng id mà <Markdown headingIds> gắn (heading trùng tên thành -2, -3), nên link chạy được cả trước khi JavaScript tải; một IntersectionObserver đánh dấu mục đang đọc bằng aria-current. readingTime() ước lượng số phút đọc, articleJsonLd() dựng dữ liệu schema.org cho thẻ script của app.",
    importCode: `import { Article, ArticleHeader, ArticleMeta, ArticleBody, ArticleToc, Markdown, markdownHeadings } from "@/components/ui";`,
    hero: { title: "Bài viết Markdown có mục lục", code: ARTICLE_CODE, render: () => <ArticleDemo /> },
    examples: [
      {
        title: "Không có mục lục",
        description: "Bỏ toc khi bài ngắn; ArticleToc không render gì nếu không có heading.",
        code: `<Article className="w-full max-w-xl">
  <ArticleHeader title="Release 2.4" titleAs="h2" meta={<ArticleMeta published="2026-11-18" readingTime={2} />} />
  <ArticleBody className="mt-4">
    <Markdown>{"Faster search and a new export button."}</Markdown>
  </ArticleBody>
</Article>`,
        render: () => (
          <Article className="w-full max-w-xl">
            <ArticleHeader title="Release 2.4" titleAs="h2" meta={<ArticleMeta published="2026-11-18" readingTime={2} />} />
            <ArticleBody className="mt-4">
              <Markdown>{"Faster search and a new export button."}</Markdown>
            </ArticleBody>
          </Article>
        ),
      },
    ],
    dos: [
      "Dùng cùng một chuỗi Markdown cho markdownHeadings() và <Markdown headingIds> để id khớp nhau.",
      "Đặt offset của ArticleToc bằng chiều cao header dính của trang.",
      "Để app tự render JSON-LD (articleJsonLd) và thẻ meta trong <head>.",
    ],
    donts: [
      "Không bỏ qua cấp heading (h2 rồi h4) chỉ để lấy cỡ chữ.",
      "Không đưa bảng hoặc code rộng ra ngoài ArticleBody: trang sẽ tràn ngang trên điện thoại.",
      "Không dùng ảnh bìa để thay tiêu đề — tiêu đề luôn là chữ.",
    ],
    props: [
      { name: "Article.toc", type: "ReactNode", description: "Mục lục bên cạnh (dính từ lg)." },
      { name: "ArticleHeader.title / titleAs", type: `ReactNode / "h1" | "h2" | "h3"`, defaultValue: `— / "h1"`, description: "Tiêu đề và cấp heading." },
      { name: "ArticleHeader.excerpt / eyebrow / meta / cover", type: "ReactNode", description: "Tóm tắt, dòng chuyên mục, ArticleMeta, ảnh bìa 16:9." },
      { name: "ArticleMeta.author", type: "{ name, avatar?, href? }", description: "Tác giả; href thành link rel=\"author\"." },
      { name: "ArticleMeta.published / updated", type: "Date | number | string", description: "Ngày đăng / cập nhật (ngày cập nhật ẩn nếu trùng ngày đăng)." },
      { name: "ArticleMeta.readingTime / tags / renderTag / locale", type: "number / string[] / (tag) => ReactNode / string", description: "Phút đọc, thẻ, cách hiện thẻ, locale định dạng ngày." },
      { name: "ArticleBody.width", type: `"reading" | "wide" | "full"`, defaultValue: `"reading"`, description: "Khoảng 70 ký tự, 90 ký tự hoặc theo khung." },
      { name: "ArticleToc.items", type: "{ id, text, level }[]", description: "Heading, thường từ markdownHeadings()." },
      { name: "ArticleToc.maxLevel / title / trackActive / offset", type: "number / ReactNode / boolean / number", defaultValue: "3 / — / true / 0", description: "Cấp sâu nhất, tiêu đề, theo dõi mục đang đọc, chiều cao header dính (px)." },
      { name: "markdownHeadings(markdown, options)", type: "MarkdownHeading[]", description: "Heading cùng id mà Markdown gắn; options: headingOffset, slug." },
      { name: "readingTime(text, wpm) / articleJsonLd(input)", type: "number / object", description: "Phút đọc (mặc định 220 từ / phút, bỏ code) và dữ liệu schema.org Article." },
    ],
  },
  /* ---------------------------------------------------------------- Blog */
  blog: {
    slug: "blog",
    name: "Blog",
    category: "Hiển thị dữ liệu",
    lead: "BlogCard, BlogList và BlogTagFilter dựng trang danh sách bài viết: card dạng link với ảnh bìa, tác giả và ngày, lưới có bài nổi bật, lọc theo thẻ và tìm kiếm.",
    description:
      "Không gắn với router hay bộ xử lý Markdown nào: mỗi bài là một object (id, title, href, excerpt, cover, author, published, readingTime, tags), lấy từ front matter của file Markdown hay từ CMS đều được. BlogCard là thẻ <article>; tiêu đề là link và vùng bấm phủ cả card, tóm tắt là mô tả của link, nên trình đọc màn hình chỉ đọc tên bài thay vì cả card. Ảnh bìa nằm trong khung 16:9 giữ chỗ sẵn và nạp lười; ngày ở thẻ <time>. BlogList xếp lưới (hoặc danh sách card ngang), đưa bài nổi bật lên đầu và rộng hai cột, hiện card giữ chỗ khi đang tải, trạng thái trống khi lọc không ra gì, và nút Xem thêm. BlogTagFilter là nhóm nút bật-tắt (aria-pressed) với nút Tất cả; filterPosts() tìm theo tiêu đề, tóm tắt và thẻ, không phân biệt dấu. Trạng thái lọc và URL là của app. Trang của từng bài: ghép Article với Markdown (xem trang Article).",
    importCode: `import { BlogCard, BlogList, BlogTagFilter, filterPosts, type BlogPost } from "@/components/ui";`,
    hero: { title: "Trang blog có lọc và tìm kiếm", code: BLOG_CODE, render: () => <BlogDemo /> },
    examples: [
      {
        title: "Đang tải",
        description: "Card giữ chỗ cùng kích thước card thật, nên trang không xô lệch khi bài tải xong.",
        code: `<BlogList posts={[]} loading loadingCount={3} />`,
        render: () => <BlogList posts={[]} loading loadingCount={3} />,
      },
      {
        title: "Không có bài phù hợp",
        description: "empty thay câu mặc định khi lọc không ra bài nào.",
        code: `<BlogList posts={[]} empty="No posts with this tag yet." />`,
        render: () => <BlogList posts={[]} empty="No posts with this tag yet." />,
      },
    ],
    dos: [
      "Đặt headingLevel theo cấu trúc trang (h2 khi tiêu đề trang là h1).",
      "Giữ thẻ và từ khoá tìm kiếm trong URL để người dùng chia sẻ được kết quả lọc.",
      "Viết alt cho ảnh bìa, hoặc alt rỗng khi ảnh chỉ để trang trí.",
    ],
    donts: [
      "Không đặt nút hay link khác vào trong card: card đã là một link.",
      "Không cắt tiêu đề bằng dấu …; chỉ tóm tắt được rút gọn (3 dòng).",
      "Không dùng màu làm cách duy nhất để báo thẻ đang lọc: nút có aria-pressed và đổi nền.",
    ],
    props: [
      { name: "BlogCard.post", type: "BlogPost", description: "id, title, href, excerpt, cover, author, published, readingTime, tags." },
      { name: "BlogCard.headingLevel / layout / featured", type: `"h2" | "h3" | "h4" / "vertical" | "horizontal" / boolean`, defaultValue: `"h3" / "vertical" / false`, description: "Cấp heading, bố cục, bài nổi bật." },
      { name: "BlogCard.renderLink", type: "({ href, children, className }) => ReactNode", description: "Link của router; giữ className để vùng bấm phủ cả card." },
      { name: "BlogList.posts / layout", type: `BlogPost[] / "grid" | "list"`, defaultValue: `— / "grid"`, description: "Các bài và cách xếp." },
      { name: "BlogList.loading / loadingCount / empty", type: "boolean / number / ReactNode", defaultValue: "false / 3 / —", description: "Đang tải (card giữ chỗ), trạng thái trống." },
      { name: "BlogList.hasMore / onLoadMore / loadingMore", type: "boolean / () => void / boolean", description: "Nút Xem thêm." },
      { name: "BlogList.featuredId / renderCard", type: "string / (post) => ReactNode", description: "Bài nổi bật đưa lên đầu, thay card." },
      { name: "BlogTagFilter.tags / selected / onSelectedChange / single", type: "(string | { tag, count })[] / string[] / (tags) => void / boolean", description: "Thẻ, thẻ đang chọn (controlled), chỉ chọn một." },
      { name: "filterPosts(posts, { query, tags, match })", type: "BlogPost[]", description: "Lọc không dấu theo tiêu đề, tóm tắt, thẻ; match any / all." },
    ],
  },
};

export const docs: ComponentDoc[] = Object.values(DOCS);
