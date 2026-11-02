---
"yugen-ui": minor
---

New `yugen-ui/theme-core.css` and `yugen-ui/sources/<Component>.css` (#169). `theme.css` makes Tailwind scan every component, so every app ships the CSS of all of them. `theme-core.css` is the same theme without that scan: add one `@import "yugen-ui/sources/<Folder>.css"` per component the app uses; each file also covers the components it uses inside (`SplitButton.css` includes Menu and Button). `yugen-ui/sources/index.json` maps every export to its file. On the templates this takes CSS from about 25 kB to 14–19 kB gzip. `theme.css` stays the zero-config default.
