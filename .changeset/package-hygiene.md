---
"yugen-ui": patch
---

Fix three details of the published package (#382). Deprecation warnings are in English and link to https://trandat1114.github.io/Yugen-UI/concepts/versioning instead of the old `#/` URL. The `AppShell` cookie gets `secure` on https pages; a `persistKey` with characters other than letters, digits, `_` and `-` is not saved, with a warning in development. The published JS has no comments (the JSDoc stays in the `.d.ts` files): the 224 JS files go from 1238 to 1132 kB, 422 to 357 kB gzipped one by one. Bundled sizes do not change.
