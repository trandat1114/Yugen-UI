---
"yugen-ui": patch
---

Fix StreamingMarkdown losing a character for good: a paragraph with an unclosed `` ` ``, `**` or `[` (a literal backtick, say) was kept as it looked while it was the last, still-arriving block, with that character hidden, once the next block streamed in. Found by the new property-based tests of `parseMarkdown`.
