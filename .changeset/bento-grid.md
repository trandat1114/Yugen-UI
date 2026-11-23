---
"yugen-ui": minor
---

New `BentoGrid` and `BentoGridItem` (#434, #435): a CSS grid of cards with `columns`, `colSpan` and `rowSpan` per breakpoint (`{ base: 1, lg: 2 }`) and nothing measured in JavaScript, so the reading order is the DOM order. Each item has `header`, `icon`, `title` (`titleAs` picks the heading level), `description`, children, `action` and `media` slots. With `href` the item is a link card: the title is the link and its click area covers the item, the description is read as the link's description, and `action` stays clickable outside the link. 11 kB gzip with the shared `cn`.
