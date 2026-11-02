---
"yugen-ui": minor
---

New `Markdown` (#263): renders static Markdown (articles, release notes, CMS fields) with `Prose` typography, through the same safe parser as `StreamingMarkdown` (no HTML, `javascript:` and `data:` links keep only their label). Code fences use `CodeBlock`, tables scroll inside a labelled region, task lists read "Done" / "Not done". `inline` renders inline Markdown only, in a `<span>`, for list items and table cells. Relative links (`/path`, `#id`) are kept and external links open in a new tab; `renderLink` hands every link to the app's router. `headingOffset` (default 1, so `#` is `h2`), `headingIds` (ids from the heading text, `slugifyHeading`), `breaks`, `size`. Strings in `messages.markdown`. `parseMarkdown` gains a `relativeLinks` option (off by default, so `StreamingMarkdown` still keeps absolute links only), `parseInlineMarkdown` parses one line, and `sanitizeHref` takes `{ relative: true }`.
