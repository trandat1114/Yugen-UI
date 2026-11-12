---
"yugen-ui": minor
---

New `yugen-ui/components.css` to embed Yugen in a page whose CSS you don't own (a CMS, a widget, a micro-frontend) (#354): the same precompiled CSS as `styles.css`, without a global reset and without styles for `html`, `body` or `::selection`. Tailwind's reset applies only inside `YugenProvider` (`:where([data-theme])`, zero specificity), and the provider sets Yugen's font. The focus ring is now an outline only, in every stylesheet: the base `:focus-visible` rule no longer sets `border-radius`, so focusing an element never changes its shape.
