---
"yugen-ui": patch
---

`cn()` uses tailwind-merge 3, the release built for Tailwind CSS v4. Classes with the v4 trailing important modifier now merge (`cn("size-4!", "size-5!")` gives `size-5!`; tailwind-merge 2 kept both). tailwind-merge adds about 2 kB gzipped to `cn`. If your app calls tailwind-merge 2 directly, it keeps working: npm installs each version separately.
