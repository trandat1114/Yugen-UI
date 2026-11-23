---
"yugen-ui": minor
---

New `Transcript` (Yugen Labs, #442): the turns of a voice conversation, each with `speaker`, `text`, `role`, `timestamp` (formatted for the `locale`) or `time`, `avatar` and `status` (`complete`, `streaming`, `error` with a reason). The current turn (the streaming one, or `activeId`) gets an accent border, a "Speaking" label and `aria-current`. The list is not a live region: with `announce`, each turn is read once when it completes, never the history. Turns are memoized, so a new token re-renders only its turn (`renderText` too). In a scroll box, `autoScroll` keeps the view at the end while the reader is there. New `messages.transcript` (English default, `transcriptMessagesVi`).
