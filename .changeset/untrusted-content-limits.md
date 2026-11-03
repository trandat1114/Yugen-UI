---
"yugen-ui": patch
---

Untrusted content can no longer stall or crash the page (#165). Markdown and StreamingMarkdown cap nesting (32 block levels, 16 inline levels) and stop scanning unclosed brackets and emphasis markers early: deeply nested quotes or emphasis used to overflow the stack, and 200 kB of `[` took 84 s to parse; every adversarial case now parses in milliseconds. CodeBlock's Bash and Markdown highlighting stay linear on very long lines (up to 26 s before).
