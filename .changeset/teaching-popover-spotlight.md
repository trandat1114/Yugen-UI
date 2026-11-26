---
"yugen-ui": minor
---

TeachingPopover takes `focus="spotlight"` (#438): while it is open, the rest of the page is dimmed and the popover becomes modal, so the page behind it can't be clicked, tabbed to or read by a screen reader. The `TeachingPopoverTrigger` stays lit in a cutout that follows it when the page scrolls or resizes (one measure per frame); without a trigger the whole page is dimmed. Escape and the dismiss button close it and return focus to the trigger. `focus="none"` (default) keeps the current behavior. Tour draws its spotlight with the same overlay.
