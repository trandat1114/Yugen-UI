---
"yugen-ui": minor
---

Every chart takes `tooltip` (#433), one config for LineChart, AreaChart, BarChart, DonutChart, PieChart, RadarChart, ScatterChart and Heatmap: `indicator` (`"line"` by default, `"dot"`, `"dashed"` or `"none"`), `label` (`false` hides the title, a function rewrites it), `value` (formats each row from the raw number), `icons` (an icon per series key instead of the color key), `render` (your own content from `{ title, index, rows }` with raw and formatted values) and `hidden` (no tooltip; keyboard focus and the data table stay). RadarChart also gets `gridFill` (shades every other ring) and `axisLabel` (rewrites the axis label text; the accessible name keeps every value).
