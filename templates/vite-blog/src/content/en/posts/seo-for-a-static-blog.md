---
title: "SEO for a static blog: what the template already does"
description: An HTML file for every post, canonical URLs, Open Graph, JSON-LD, sitemap.xml and RSS, generated on every build.
date: 2026-10-07
tags: [SEO, Vite]
---

A single-page React app usually ships one `index.html`, so search engines and social networks see the same title for
every URL. This template fixes that at build time.

## One HTML file per post

The `blogSeo` plugin in `vite.config.ts` runs after Vite finishes the build and writes:

- `posts/<slug>/index.html` with the `<title>`, `description`, `canonical`, Open Graph and `BlogPosting` JSON-LD of that post.
- `tags/<tag>/index.html` for every tag.
- `sitemap.xml`, `rss.xml`, `robots.txt` and `404.html`.

Since every URL is a real file, the blog runs on any static host without redirect rules.

## When the reader changes pages

Routing uses the History API (`/posts/<slug>/`, no `#`), so every post has its own address. When a reader opens another
post, `document.title` and the `description` tag are updated to match.

## Before you deploy

1. Set `url` in `src/site.ts` to your domain. The build reminds you if you forget.
2. Deploying to a subfolder (GitHub Pages)? Build with `BASE=/repo-name/ npm run build`.
3. Submit `https://your-domain/sitemap.xml` to Google Search Console.

> Tip: a `description` of 120 to 160 characters looks best in search results.
