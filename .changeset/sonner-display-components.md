---
"yugen-ui": minor
---

New `Sonner`: notifications that stack in a corner, newest in front, and fan out into a list on hover or keyboard focus. Call `sonner("…")`, `sonner.success / info / warning / error / loading` from anywhere; `sonner.promise` turns a loading notification into success or error in place, and calling again with the same `id` updates it. Action and cancel buttons, `richColors`, `closeButton`, swipe to dismiss, F8 to reach the region. Built on Radix Toast, no new dependency. Strings in `messages.sonner`.

New display components (#174): `Timeline` / `TimelineItem` (detailed and compact), `DescriptionList` / `DescriptionItem` (columns that drop on narrow containers, inline layout, copy button; strings in `messages.descriptionList`), `Stat` (the stable version of `StatTile`, with a `chart` slot; strings in `messages.stat`) and `Prose` (typography for Markdown and CMS HTML through the new `yugen-prose` theme utility, zero-specificity selectors, opt out with `not-prose`). `StatTile` is now `Stat` plus a Sparkline and reads `messages.stat`; `messages.chart.increase / decrease / noChange` are deprecated. `CodeBlock`, `Table`, `Quote` and `Timeline` carry `not-prose`.
