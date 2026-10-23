import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/labs-charts.tsx.
export const en: Record<string, ComponentDocEn> = {
  barchart: {
    description:
      "Hand-written SVG following the dataviz method: bars ≤ 24px thick, a 4px radius at the data end and square at the baseline, a 2px surface gap between bars / stacked segments, a single Y axis and a thin grid kept in the background. Hover the chart, or Tab into it and use the arrow keys, to see the tooltip; the “Bảng dữ liệu” (Data table) button switches to an equivalent table for screen readers.",
    examples: [
      {
        title: "Horizontal bars & value labels",
        description: "Many categories or long names → horizontal bars. A single series doesn't need a legend; the value sits at the end of the bar.",
      },
      {
        title: "Stacked columns",
        description: "Part-to-whole by category; 2px gaps between segments, and only the outermost segment has rounded corners. The tooltip lists every segment and the total.",
      },
      {
        title: "Negative values (diverging)",
        description: "Columns grow on both sides of the 0 baseline. diverging colors the two poles Sakura ↔ Ai; position already encodes the sign, color only adds emphasis.",
      },
      {
        title: "Texture",
        description:
          "A fallback channel for full color blindness, print and forced-colors: 45° / 135° patterns. Turns on automatically in the high-contrast theme.",
      },
    ],
    dos: [
      "Use columns to compare magnitudes; switch to horizontal bars when there are many categories or long names.",
      "One series = one color (slot 1) for every bar. The title already names the series, so no legend is needed.",
      "Turn on value labels only when there are few bars; otherwise leave it to the axis, the tooltip and the data table.",
    ],
    donts: [
      "Don't use two Y axes. Split into two charts or index both to the same base (= 100).",
      "Don't shade bars darker by value for categories with no order. The bar length already shows that.",
      "Don't chart a single bar. Use StatTile.",
    ],
    props: {
      data: "Array of data rows (objects).",
      index: "Category field.",
      series: "Value series; color (1–8) pins a color slot, otherwise slots follow the order.",
      orientation: "Vertical columns or horizontal bars.",
      layout: "Side by side or stacked.",
      "valueFormat / axisFormat": "Value format; the axis abbreviates automatically from 1,000.",
      showValues: "Labels at the end of each bar, only when they fit.",
      diverging: "Single series: negative / positive in a diverging color pair.",
      legend: "Legend that toggles series (colors stay the same when filtering).",
      barSize: "Maximum bar thickness (px).",
      "title / description / toolbar": "ChartContainer frame.",
      height: "Height of the plot area, axis labels included.",
      locale: "Locale for Intl.",
      texture: "Identifying patterns; turn on automatically in high contrast / forced-colors.",
      "ariaLabel, indexLabel, hideTableToggle, defaultShowTable, animate": "Accessible description, table column heading, table button, animation.",
    },
    defaults: { legend: "≥ 2 series", height: "280 (vertical) · auto (horizontal)", texture: "auto" },
  },

  linechart: {
    description:
      "2px lines with rounded caps, a ~10% fill (AreaChart), a crosshair that snaps to the nearest X point and one tooltip listing every series. The X axis takes strings (evenly spaced) or Dates (on a real time scale). With ≤ 4 series, series names are written at the end of each line; they turn off when the labels collide.",
    examples: [
      {
        title: "Time axis & markers",
        description:
          "index is a Date → positions follow real time, and axis labels are formatted with Intl (vi-VN). markers draws dots ≥ 8px with a surface-colored ring.",
      },
      { title: "AreaChart", description: "Single series: a light fill under the line, and the Y axis always starts at 0. The last value is labeled directly." },
      { title: "Stacked areas", description: "stacked adds the series together for part-to-whole over time; the tooltip gets an extra total row." },
      {
        title: "Highlighting one series",
        description: "When the story is “the Pro plan is growing fast”: highlight colors one series and turns the others gray as background.",
      },
    ],
    dos: [
      "Use lines for trends; AreaChart for a single series or for part-to-whole over time (stacked).",
      "Label lines directly at their end when there are ≤ 4 series; with more, rely on the legend, the tooltip or small multiples.",
      "When the story is about one series, use highlight instead of eight equally weighted colors.",
    ],
    donts: [
      "Don't put two measures with different scales on two Y axes. Split the chart or index them (= 100 at the first point).",
      "Don't stack heavy fills that cover each other. The fill is only a light ~10% layer; the line is the main mark.",
      "Don't label every point. Label only the last point or the extremes.",
    ],
    props: {
      "data / index / series": "Data sorted by X in ascending order.",
      xType: "A Date → time (positions on a time scale).",
      "xFormat / xTooltipFormat": "Axis labels / tooltip & table labels.",
      "valueFormat / axisFormat": "Value and axis format.",
      markers: "Dots at every point.",
      curve: "Interpolation that doesn't overshoot the data peaks.",
      endLabels: "Labels at the end of each line; turn off if they collide.",
      highlight: "Key of the highlighted series (the other series turn gray).",
      includeZero: "Y axis starts at 0.",
      "AreaChart.stacked": "AreaChart only: stacks the areas.",
      "title, description, toolbar, height, locale, texture, legend…": "Same as BarChart.",
    },
    defaults: { xType: "auto", endLabels: "≤ 4 series" },
  },

  donutchart: {
    description:
      "A thin ring with parallel 2px surface gaps between slices, starting at 12 o'clock and going clockwise. The legend sits beside it with percentages (following the page's text direction); hover or use the arrow keys to see values. To compare values that are close together, use BarChart.",
    examples: [
      {
        title: "Grouping the tail into “Other”",
        description: "9 groups → the 5 largest + “Khác” (Other) in neutral gray. The data table shows the grouped figure too.",
      },
      {
        title: "Custom center label",
        description: "centerValue / centerLabel replace the default total; size and thickness change the size of the ring.",
      },
    ],
    dos: [
      "Use it only for a quick part-to-whole view with ≤ 6 slices; keep colors tied to entities (pass color when the data changes).",
      "Put the most important number in the middle of the ring.",
    ],
    donts: [
      "Don't use a donut to compare values that are close together. Use BarChart or show the numbers.",
      "Don't use a 2-slice donut. Use StatTile or ProgressBar.",
      "Don't give “Other” a categorical color. It is always neutral gray.",
    ],
    props: {
      data: "Values ≤ 0 are skipped.",
      maxSlices: "Maximum number of slices (“Other” included), never more than 6.",
      otherLabel: "Label of the grouped slice.",
      "centerValue / centerLabel": "Content in the middle of the ring.",
      "size / thickness": "Ring diameter and thickness (px).",
      legend: "Legend with percentages beside the ring.",
      "valueFormat, locale, title, description, texture…": "Same as BarChart.",
    },
    defaults: { otherLabel: "“Khác” (Other)", "centerValue / centerLabel": "total / “Tổng” (Total)" },
  },

  sparkline: {
    description:
      "Sparkline is an inline trend line without axes: gray as background, with the current point in an accent color. StatTile has a label, a value (sans semibold, proportional figures, not tabular), a signed delta with an icon and text (success/danger color based on goodDirection) and an optional sparkline. Use only one hero number per screen.",
    examples: [
      {
        title: "Sparkline in a sentence",
        description: "Inline, as tall as the line of text; the aria-label summarizes the first, last, lowest and highest values automatically.",
      },
      { title: "Variants", description: "variant area; color picks a categorical color slot instead of the background gray." },
      { title: "Down is good", description: "goodDirection=\"down\": a falling churn rate → success color, always with an icon and text." },
      { title: "Hero number", description: "size=\"hero\" (68px, same sans font) for the one number the screen leads with." },
    ],
    dos: [
      "Use StatTile when the data is a single current number (+ a trend), instead of a single-bar chart.",
      "State the comparison period of the delta (“vs. last month”) and set goodDirection to match its meaning.",
      "Keep sparklines to ~12 points, gray as background, with only the current point in an accent color.",
    ],
    donts: [
      "Don't use color as the only signal for the delta. Always include an icon and a signed number.",
      "Don't put several hero numbers on one screen.",
      "Don't use tabular-nums for a large standalone number.",
    ],
    props: {
      "Sparkline.data": "null creates a gap.",
      "Sparkline.width / height": "\"auto\" = follows the parent element.",
      "Sparkline.variant": "Line, or line + light fill.",
      "Sparkline.color": "Background gray or a categorical color slot.",
      "Sparkline.highlightLast / labels": "Dot on the last point; labels for the tooltip.",
      "StatTile.label / value": "Numeric values abbreviate automatically from 10,000.",
      "StatTile.delta / deltaFormat / deltaLabel": "Signed change (percent by default).",
      "StatTile.goodDirection": "Which direction is good.",
      "StatTile.trend / trendLabels": "Sparkline next to the value.",
      "StatTile.size": "28 / 40 / 68px.",
    },
  },
};
