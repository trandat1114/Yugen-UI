---
"yugen-ui": minor
---

Markdown renders images (#447): `![alt](src)` becomes a lazily loaded `<img>` that never overflows its column, with `src` limited to http, https and relative URLs (`data:`, `javascript:` and the like keep only the alt text), and a development warning when an image has no alt text. `renderImage` hands images to a framework image component (with width and height so they hold their space), and `images={false}` shows them as links, as before. Blocks are memoized, so rendering again with the same content doesn't render or highlight code blocks again. The parser gains `images` (off by default, so StreamingMarkdown keeps showing images from a model as links) and `sanitizeImageSrc()`. **Behavior change:** an image in Markdown used to render as a link to the image.
