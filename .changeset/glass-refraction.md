---
"yugen-ui": minor
---

New `GlassRefraction` (Yugen Labs): render it once at the app root and the edges of every `glass`, `glass-clear` and `glass-tinted` surface bend what is behind them, like the rim of a lens, while the middle stays frosted so text keeps its contrast. Each size and corner radius gets one SVG filter (a displacement map from Snell's law over a convex rim), applied through `backdrop-filter`; only Chromium browsers draw it, Safari and Firefox keep the regular glass. It turns off wherever the blur does (Reduce transparency, Increase contrast, forced colors, the high-contrast theme, glass inside glass) through the new `--glassLensFilter` token. Names may change before 1.0.
