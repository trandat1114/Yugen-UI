---
"yugen-ui": patch
---

Fix `readAppShellCookie` in React Server Components (#345): it lived in the same file as `AppShell`, behind `"use client"`, so calling it from a Next.js layout threw. It now has a module of its own without the directive; import it from `yugen-ui`. `rampToDesignTokens`, `rampToTokensStudio` and `BRAND_ALIAS_STEPS` can be called on the server too, like `cn` and the brand ramp helpers.
