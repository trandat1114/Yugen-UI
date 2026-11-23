---
"yugen-ui": minor
---

Chart gallery additions (#428, #429, #430). BarChart: `colorBy="category"` gives a single series one color per category (the legend lists the categories), `activeIndex` emphasizes one category while nothing is hovered, and `showValues` accepts a function `(value, index, series)` for custom labels (`series` is `"__total"` on stacked totals). AreaChart: `gradient` fades the fill toward the axis. `ChartSeries` takes `icon`, shown instead of the color key in the legend and the tooltip of LineChart, AreaChart, BarChart and RadarChart. New `ChartSeriesIcon` for custom legends.
