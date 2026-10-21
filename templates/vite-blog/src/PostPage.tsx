import { ArrowLeft16Regular, ArrowRight16Regular, Link20Regular } from "@fluentui/react-icons";
import { Button, Divider, Persona, toast } from "yugen-ui";
import { slugify, type Post } from "./content";
import { headingsOf, Markdown } from "./Markdown";
import { PostMeta, TagLinks } from "./PostList";
import { POSTS } from "./posts";
import { Link } from "./router";
import { SITE } from "./site";

function TableOfContents({ post }: { post: Post }) {
  const headings = headingsOf(post.body);
  if (headings.length < 2) return null;
  return (
    <nav aria-label="Trong bài này" className="flex flex-col gap-S">
      <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">Trong bài này</p>
      <ul className="flex flex-col gap-XS border-s border-stroke-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                // Cuộn bằng JS để chạy được cả khi blog nằm trong khung preview (không đổi URL của trang chủ).
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`-ms-px block border-s border-transparent py-XXS text-caption1 text-foreground-2 hover:border-stroke-1 hover:text-foreground-1 ${h.level === 3 ? "ps-XL" : "ps-M"}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Neighbours({ post }: { post: Post }) {
  const i = POSTS.findIndex((p) => p.slug === post.slug);
  const newer = POSTS[i - 1];
  const older = POSTS[i + 1];
  if (!newer && !older) return null;
  const card = (p: Post, label: string, align: "start" | "end") => (
    <Link
      to={{ name: "post", slug: p.slug }}
      className={`flex flex-col gap-XXS rounded-xlarge border border-stroke-2 bg-background-1 p-L hover:bg-background-3 ${align === "end" ? "items-end text-end" : ""}`}
    >
      <span className="flex items-center gap-XS text-caption1 text-foreground-3">
        {align === "start" && <ArrowLeft16Regular className="rtl:-scale-x-100" />}
        {label}
        {align === "end" && <ArrowRight16Regular className="rtl:-scale-x-100" />}
      </span>
      <span className="text-body1 font-semibold text-foreground-1">{p.title}</span>
    </Link>
  );
  return (
    <nav aria-label="Bài khác" className="grid gap-M @xl:grid-cols-2">
      <div>{older && card(older, "Bài trước", "start")}</div>
      <div>{newer && card(newer, "Bài sau", "end")}</div>
    </nav>
  );
}

export function PostPage({ post, headingLevel = "h1" }: { post: Post; headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ intent: "success", title: "Đã sao chép liên kết" });
    } catch {
      toast({ intent: "error", title: "Không sao chép được", body: "Trình duyệt chặn quyền clipboard." });
    }
  }

  return (
    <div className="grid gap-XXL @5xl:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="flex min-w-0 flex-col gap-XL">
        <header className="flex flex-col gap-M">
          <TagLinks tags={post.tags.map((name) => ({ name, slug: slugify(name) }))} />
          <Heading className="font-display text-[clamp(28px,4vw,44px)] leading-tight font-semibold text-foreground-1">{post.title}</Heading>
          {post.description && <p className="text-subtitle2 font-normal text-foreground-2">{post.description}</p>}
          <div className="flex flex-wrap items-center justify-between gap-M">
            <Persona name={post.author ?? SITE.author} secondaryText={<PostMeta post={post} />} size="medium" avatar={{ color: "colorful" }} />
            <Button appearance="subtle" icon={<Link20Regular />} onClick={copyLink}>
              Sao chép liên kết
            </Button>
          </div>
        </header>
        <Divider />
        <Markdown>{post.body}</Markdown>
        <Divider />
        <Neighbours post={post} />
      </article>
      <div className="hidden @5xl:block">
        <div className="sticky top-20">
          <TableOfContents post={post} />
        </div>
      </div>
    </div>
  );
}
