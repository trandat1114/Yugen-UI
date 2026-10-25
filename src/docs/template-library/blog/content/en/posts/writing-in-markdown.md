---
title: Writing in Markdown
description: All the syntax the blog supports in one post, from headings and lists to highlighted code, quotes, tables, images and links.
date: 2026-10-14
tags: [Markdown, Guides]
---

Markdown is parsed by Yugen UI's safe parser: raw HTML is not inserted and `javascript:` links are removed. This post lists
everything you can use.

## Text and links

**Bold**, *italic*, ~~strikethrough~~ and `inline code`. External links like [Tailwind CSS](https://tailwindcss.com) open
in a new tab; internal links like [the welcome post](/posts/welcome/) switch pages right away, without a reload.

## Lists

- Bullet points
- They can nest
  - like this
- And numbered:

1. Step one
2. Step two

A task list:

- [x] Install the template
- [ ] Write the first post

## Code

Code blocks are highlighted by language and have a copy button:

```tsx
import { Button } from "yugen-ui";

export function Subscribe() {
  return <Button appearance="primary">Subscribe</Button>;
}
```

```bash
npm run build
```

## Quotes

> Design is not just what it looks like and feels like. Design is how it works.

## Tables

| Syntax | Result |
| :--- | :--- |
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `~~strike~~` | ~~strike~~ |

## Images

An image goes on a line of its own. A path that starts with `/` points into the `public/` folder, and the text in quotes is
the caption:

![The Yugen UI cherry blossom icon](/favicon.svg "The image in public/favicon.svg")

---

Every `##` and `###` heading shows up in the table of contents on the right.
