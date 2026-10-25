# Sakura Notes

A Markdown blog built with [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) on Vite, React and Tailwind CSS
v4. No CMS or Markdown library: add a `.md` file and the post is live.

```bash
npx create-yugen-ui@latest my-app --template blog
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-blog

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- Posts are `src/content/<lang>/posts/*.md` files with frontmatter (`title`, `description`, `date`, `tags`,
  `draft`).
- Markdown goes through Yugen UI's safe parser: highlighted code with a copy button, tables, quotes, task lists, images and
  internal links.
- The home page has search and tag filters; a post page has a table of contents, reading time, previous / next post and a
  copy link button.
- Real paths (`/posts/<slug>/`) with the History API, no router library.
- **SEO at build time** (the `blogSeo` plugin in `vite.config.ts`): an HTML file per post and tag with `<title>`,
  `description`, canonical, Open Graph and `BlogPosting` JSON-LD, plus `sitemap.xml`, `rss.xml`, `robots.txt` and
  `404.html`.
- Light, dark and high-contrast themes, saved in `localStorage` with no flash on reload.
- English text and sample posts. For Vietnamese, create the app with
  `npx create-yugen-ui@latest my-app --template blog --lang vi`.

## Structure

```
src/
  site.ts                 # your domain (SITE.url)
  content/<lang>.ts       # blog name, description, author and interface text
  content/<lang>/posts/   # posts: the file name is the URL
  content/index.ts        # the language in use (the app and the SEO plugin read it)
  blog.ts                 # frontmatter, reading time, page titles (shared with the SEO plugin)
  posts.ts                # loads the posts of the language in use
  Markdown.tsx            # Markdown to components, headings with ids for the table of contents
  BlogLayout.tsx          # top bar, content by route, footer
  PostList.tsx · PostPage.tsx · router.tsx
vite.config.ts            # blogSeo plugin: static HTML for every page, sitemap, RSS
```

## Deploy

1. Set `url` in `src/site.ts` to your domain (the build warns while it is still `example.com`).
2. Run `npm run build` and upload `dist/` to any static host. For a subfolder (GitHub Pages):
   `BASE=/repo-name/ npm run build`.
3. Submit `sitemap.xml` to Google Search Console.

Files in `src/` are generated from `src/docs/template-library/blog` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
