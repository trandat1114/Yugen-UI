---
"yugen-ui": minor
---

More names from the pre-1.0 API review (#157), the rows planned for 0.16, shipped early: CarouselNavContainer `showAutoplayToggle` (Carousel's own `autoplay` is the autoplay state), TimelineItem `intent="error"` (like MessageBar, Toast and Field), Stat and StatTile `size="extra-large"`, Divider `orientation="horizontal" | "vertical"` and TeachingPopoverFooter `orientation`.

**Deprecated** (they keep working until 1.0 and print a one-time warning in development): CarouselNavContainer `autoplay`, TimelineItem `intent="danger"`, Stat `size="hero"`, Divider `vertical`, TeachingPopoverFooter `layout`, and three exports that leave the package in 1.0: `highlightRanges` (internal helper of `HighlightMatch`), `getOverflowGroups` (use `useIsOverflowGroupVisible(groupId)`) and the top-level `dispatchToast` (use `toast()` or `useToast().dispatchToast`, which do not warn).
