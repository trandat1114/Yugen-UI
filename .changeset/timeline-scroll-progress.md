---
"yugen-ui": minor
---

Timeline can follow the page scroll (#439): with `progress`, a rail fills up as the reader scrolls and each `TimelineItem` gets `data-timeline-status="complete" | "current" | "upcoming"`, with `aria-current="step"` on the current one and a hidden progressbar named by `progressLabel` (new `messages.timeline`, English default, `timelineMessagesVi`). One passive scroll listener measures once per animation frame, never per item. `scrollOffset` sets the marker line (0.65 of the viewport by default), `activeIndex` and `TimelineItem` `status` set the state yourself, and with reduced motion the rail shows complete. `dateLayout="sticky"` puts the time in its own sticky column on wide screens and above the content on narrow ones. Without `progress` the Timeline renders as before, with no listeners.
