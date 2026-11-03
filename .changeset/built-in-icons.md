---
"yugen-ui": minor
---

**Breaking:** `yugen-ui` no longer depends on `@fluentui/react-icons` (about 180 MB installed, plus the Griffel CSS-in-JS runtime). The 159 icons used inside components now ship with the library as small inline SVG components generated from Fluent System Icons, with the same paths, sizes and accessibility attributes, so components look the same. Apps that import icons from `@fluentui/react-icons` themselves and relied on it being installed with `yugen-ui` must add it to their own dependencies (`npm i @fluentui/react-icons`); the templates already do. Icon slots size any SVG with CSS, so other icon sets such as `lucide-react` work in them too (#320).
