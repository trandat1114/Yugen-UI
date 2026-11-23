---
"yugen-ui": minor
---

TeachingPopover takes `focus="spotlight"` (#438): while it is open, a scrim dims the rest of the page and the popover becomes modal, so the page behind it can't be clicked or tabbed to; Escape and the dismiss button close it and return focus to the trigger. `focus="none"` (default) keeps the current behavior.
