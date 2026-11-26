---
"yugen-ui": minor
---

New Blog components (#444), not tied to a router or a Markdown engine: `BlogCard` (an `<article>` whose title is the link, with its click area covering the card and the excerpt as the link's description; a 16:9 lazily loaded cover, author, date in `<time>`, reading time and tags; `featured`, `layout="horizontal"`, `headingLevel`, `renderLink` for your router), `BlogList` (grid or list, the featured post first and two columns wide, placeholder cards while loading, an empty state and a Load more button), `BlogTagFilter` (toggle buttons with `aria-pressed` and an All button; the selection is controlled) and `filterPosts()` (accent-insensitive search in titles, excerpts and tags, tags matched with any / all). New `messages.blog` (English default, `blogMessagesVi`).
