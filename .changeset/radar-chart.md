---
"yugen-ui": minor
---

New `RadarChart` in `yugen-ui/Chart` (#424): compares several series over the same set of axes, drawn in plain SVG with no chart runtime. `grid="polygon" | "circle" | "none"` with `levels` rings, `domain` to fix the scale, `dots`, `linesOnly`, `fill`, `legend` (click or keyboard to hide a series) and `size`. Like the other charts it takes `title`, `description`, `locale`, `valueFormat`, `texture` and the table toggle; each axis is a focusable point named with every series' value, and missing values read as "no data".
