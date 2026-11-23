---
"yugen-ui": minor
---

RadarChart, RadialChart and PieChart describe themselves in the app's language: new `messages.chart.radarSummary` and `radialSummary`, and `donutSummary` receives `pie` so a PieChart is no longer announced as a donut (#425). RadarChart fits narrow containers (`size` is now the largest side), keeps each series' color and the scale when another series is hidden from the legend, draws high-contrast textures for its fills (RadialChart too, whose patterns were missing), and on hover or focus only redraws the focus ring and the tooltip: the grid, series and axis labels are kept until the data, size or props change.
