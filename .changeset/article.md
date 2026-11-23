---
"yugen-ui": minor
---

New Article components for long Markdown posts (#446): `Article` (an `<article>`, with an optional `toc` beside the content, sticky from `lg`), `ArticleHeader` (h1 title or `titleAs`, excerpt, eyebrow, a 16:9 cover that holds its space), `ArticleMeta` (author, published and updated dates in `<time>`, reading time, tags), `ArticleBody` (reading width; wide tables and code scroll inside it) and `ArticleToc` (jump links that work before JavaScript loads, the section being read marked with `aria-current` through one IntersectionObserver). Helpers: `readingTime()` and `articleJsonLd()` (schema.org data for your own script tag), plus `messages.article` (English default, `articleMessagesVi`). New `markdownHeadings(markdown)` returns the headings with the ids `<Markdown headingIds>` renders. Markdown now computes heading ids before rendering, so they no longer depend on render order (in StrictMode a duplicate could get the wrong `-2` suffix).
