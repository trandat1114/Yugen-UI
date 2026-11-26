---
"yugen-ui": minor
---

PieChart / DonutChart and RadialChart gallery additions (#431, #432). PieChart and DonutChart take `labels` (`"value"`, `"percent"`, `"label"` or a function of `{ label, value, share, index }`), written outside each slice and skipped below 4%, and `activeIndex`, which emphasizes one slice while nothing is hovered and shows its value and name in the donut center. RadialChart takes `rounded` (round arc ends) and `layout="rings"`: one concentric ring per value on a shared scale (`maxValue` or the largest value), each with its own track and a label at its start.
