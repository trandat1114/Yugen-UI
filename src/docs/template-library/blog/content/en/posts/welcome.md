---
title: Welcome to Sakura Notes
description: This blog is a starter template. Write posts in Markdown, build the interface with Yugen UI, and get SEO out of the box.
date: 2026-10-21
tags: [Yugen UI, Guides]
---

Hi! This is the first post on the blog. Everything around it, from the top bar and the post list to the tags and the
table of contents on the right, is made of **Yugen UI** components. The post itself is a plain Markdown file.

## Write a new post

Create a file in `src/content/en/posts/`, for example `src/content/en/posts/my-first-post.md`. The file name is the URL:
this post will live at `/posts/my-first-post/`.

```md
---
title: My first post
description: A one-sentence summary, shown in the post list and in search results.
date: 2026-10-22
tags: [React, Notes]
---

The post body, written in **Markdown**.
```

Save the file and the post shows up right away under `npm run dev`. Not ready to publish? Add `draft: true` and the post
only appears in dev mode.

## Project structure

| File | Purpose |
| --- | --- |
| `src/content/en.ts` | Blog name, description, author, interface text |
| `src/site.ts` | Domain |
| `src/content/en/posts/*.md` | Posts |
| `src/Markdown.tsx` | Turns Markdown into components |
| `vite.config.ts` | Plugin that writes static HTML, the sitemap and RSS at build time |

## Next steps

1. Change the blog name and description in `src/content/en.ts`, and `url` in `src/site.ts`.
2. Delete the sample posts and write your own.
3. Run `npm run build` and upload the `dist/` folder to any static host.

The supported syntax is listed in [Writing in Markdown](/posts/writing-in-markdown/).
