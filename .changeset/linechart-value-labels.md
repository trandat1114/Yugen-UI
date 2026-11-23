---
"yugen-ui": minor
---

LineChart and AreaChart get `valueLabels` and `renderMarker` (#430). `valueLabels` writes each value right above its point (with `valueFormat`, or a function `(value, index, series) => string`); when points are closer than 32 px it labels them at intervals and always keeps the last one. `renderMarker` draws your own dot at each point from `{ x, y, index, series, value }`, inside the series group so it takes the series color, and turns `markers` on. Both live in the static layer, so hovering does not redraw them.
