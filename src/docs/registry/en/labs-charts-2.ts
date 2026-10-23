import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/labs-charts-2.tsx.
export const en: Record<string, ComponentDocEn> = {
  scatterchart: {
    description:
      "Markers are ≥ 8px with a 2px surface-colored ring, so overlapping points stay distinct. The tooltip follows the point nearest the pointer (Voronoi-style lookup), so there's no need to hit a small dot. Keyboard: Tab into the chart, then use the arrows to step through the points in X order. size turns points into bubbles whose area (not radius) is proportional to the value; the “Xu hướng” (Trend) button draws a least-squares line for each group and adds the slope and R² to the accessible description.",
    examples: [
      {
        title: "Bubbles",
        description:
          "size adds a third dimension: the radius follows the square root, so the area is proportional to the value. Large bubbles are drawn first and small ones sit on top.",
      },
      {
        title: "Trend line",
        description: "defaultTrendLine turns on the linear regression (dashed line) from the start. The slope and R² are read out in the description for screen readers.",
      },
      {
        title: "Time axis",
        description: "x is a Date → time axis. series fixes the order and color of the groups instead of following the order they appear in.",
      },
    ],
    dos: [
      "Use scatter when the question is “are these two measures related?”. Don't use it for one series over time (that's LineChart).",
      "Keep to ≤ 3 groups: in the all-pairs check, only the first 3 colors stay distinct for color-blind readers. With more, markers change shape automatically, or split into small multiples.",
      "Set label so the tooltip and table name each point; give xLabel / yLabel their units.",
      "Turn on the trend line when the point is the direction, with R² so readers know how reliable it is.",
    ],
    donts: [
      "Don't encode a measure with radius. Bubbles always scale by area, and size doesn't suit negative data.",
      "Don't plot thousands of raw points. Sample them or bin them into cells (heatmap) first.",
      "Don't add a second Y axis for a group with a different scale.",
    ],
    props: {
      "data / x / y": "X field (number or Date) and Y field (number).",
      size: "Size field → bubbles (area ∝ value).",
      maxRadius: "Radius of the largest bubble (px); the smallest is 5px (≥ 8px dot + 2px ring).",
      "group / series": "Group field, and the order / labels / colors of the groups. The 9th group and beyond are merged into “Khác” (Other).",
      label: "Point name field (tooltip title, first table column).",
      "xLabel / yLabel / sizeLabel": "Measure names in the tooltip, table and description.",
      xType: "A Date → time.",
      xFormat: "X format.",
      "valueFormat / axisFormat / sizeFormat": "Format of Y, the Y axis and size.",
      includeZero: "Y axis starts at 0.",
      shapes: "Also tells groups apart by marker shape.",
      "trendLine / defaultTrendLine / onTrendLineChange": "Least-squares trend line.",
      hideTrendToggle: "Hides the “Xu hướng” (Trend) button.",
      legend: "Legend that toggles groups.",
      "title, description, toolbar, locale, ariaLabel, indexLabel…":
        "Same as BarChart: frame, “Bảng dữ liệu” (Data table) button, texture, animate (off under reduced motion).",
    },
    defaults: { xType: "auto", shapes: "texture or > 3 groups", legend: "≥ 2 groups" },
  },

  heatmap: {
    description:
      "By default it uses a single-hue sequential scale (light = small, dark = large); diverging switches to two poles around midpoint, with neutral gray at the middle. Cells are 2px apart, and row / column labels are truncated to fit (the full text is in the tooltip and table). Empty cells get a neutral hatch pattern and are read as “Không có dữ liệu” (No data). The legend is a color gradient with min / max labels. Keyboard: Tab into the matrix, arrows move between cells, Home/End go to the start/end of the row.",
    examples: [
      {
        title: "Diverging",
        description: "Signed data (up / down): diverging + a symmetric domain so both poles are equally dark; 0 is gray.",
      },
      {
        title: "Empty cells (cohort table)",
        description:
          "null means “no data yet”. It is drawn with a neutral pattern, not the lightest color of the scale, which would read as “close to 0”.",
      },
    ],
    dos: [
      "Use a sequential scale for unsigned magnitudes; use a diverging scale only when the midpoint means something (0, a target, an average).",
      "Fix the domain when comparing several heatmaps, so the same color means the same value.",
      "Order rows / columns naturally (days of the week, hours) or by value so patterns show up.",
    ],
    donts: [
      "Don't use categorical colors for cells. A heatmap encodes magnitude, not identity.",
      "Don't give empty cells the lightest color. Missing data isn't the same as a small value.",
      "Don't cram number labels into small cells; the exact values are in the tooltip and table.",
    ],
    props: {
      "data / index": "Each item is a row; index is the row label field.",
      columns: "Columns; null/missing = empty cell.",
      domain: "Color domain; values outside it are clamped.",
      "diverging / midpoint": "Diverging scale around midpoint.",
      valueFormat: "Value format (legend, tooltip, table).",
      rowHeight: "Height of each row (px); the total height is computed.",
      legend: "Color gradient with min / max labels (and the midpoint).",
      "title, description, toolbar, locale, ariaLabel, indexLabel…":
        "Same as BarChart: frame, “Bảng dữ liệu” (Data table) button, texture, animate (off under reduced motion).",
    },
    defaults: { domain: "from the data" },
  },

  chartzoom: {
    description:
      "The overview strip draws all the data with thin lines; the bright window is the visible range and the rest is dimmed. Drag the window to move it, drag the handles at either edge to resize it, or click outside it to jump there. The window is a slider: ←/→ move by one point, Shift+←/→ shrink/grow, PageUp/PageDown move by one window, Home/End go to either end. The strip is always LTR like the plot area, so on RTL pages the arrow keys still move in the on-screen direction. The range is a pair of indexes [start, end]: domain / defaultDomain / onDomainChange; the “Đặt lại” (Reset) button returns to the full range. This page also covers 100% stacked areas (stackOffset=\"expand\").",
    examples: [
      {
        title: "Stacked areas + brush",
        description: "AreaChart stacked: the tooltip lists each series and a total row; the overview strip draws the top of each layer.",
      },
      {
        title: "100% stacked areas",
        description:
          "stackOffset=\"expand\" normalizes each point to 100%, for the question “how does the mix change?”. The Y axis is a share; the tooltip shows each value with its percentage and the total.",
      },
      { title: "Controlled range", description: "domain + onDomainChange: preset 7 / 30-day buttons stay in sync with the dragged window." },
    ],
    dos: [
      "Turn on brush for long series (a few dozen points or more) when readers need to look closely at one period.",
      "Set defaultDomain to the most recent period. Readers usually ask about “now” first.",
      "Use 100% stacked areas for questions about the mix; keep regular stacked areas when the total matters too.",
    ],
    donts: [
      "Don't use brush to hide data. The data table always contains every point.",
      "Don't stack to 100% when series have negative values.",
      "Don't zoom a separate Y axis for each series. There is still one Y axis.",
    ],
    props: {
      brush: "Overview strip + draggable window under the plot area (LineChart, AreaChart).",
      "domain / defaultDomain": "Visible index range (both ends included).",
      onDomainChange: "Called on drag, on key presses or when “Đặt lại” (Reset) is clicked.",
      "AreaChart.stacked": "AreaChart only: stacks the areas; the tooltip gets a total row.",
      "AreaChart.stackOffset": "AreaChart only, when stacked: expand = 100%.",
      "…": "Every other prop is the same as on the LineChart page.",
    },
  },
};
