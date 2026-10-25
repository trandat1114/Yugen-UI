import type { ChartMessages } from "./messages";

const LINE_KIND_EN = { line: "Line", area: "Area", stacked: "Stacked area", expand: "100% stacked area" };

const seriesEn = (series: string[]) => (series.length === 1 ? series[0] : `${series.length} series (${series.join(", ")})`);

export const chartMessagesEn: ChartMessages = {
  roleDescription: "chart",
  heatmapRoleDescription: "heat map",
  dataTable: "Data table",
  total: "Total",
  value: "Value",
  share: "Share",
  noData: "No data",
  time: "Time",
  category: "Category",
  group: "Group",
  name: "Name",
  other: "Other",
  trend: "Trend",
  increase: "Increase",
  decrease: "Decrease",
  noChange: "No change",
  brush: "Visible range",
  brushRoleDescription: "zoom window",
  brushViewing: "Showing",
  brushPoints: (shown, total) => `${shown}/${total} ${total === 1 ? "point" : "points"}`,
  brushReset: "Reset",
  lineSummary: ({ kind, points, from, to, series }) =>
    `${LINE_KIND_EN[kind]} chart: ${points} ${points === 1 ? "point" : "points"}${points ? ` from ${from} to ${to}` : ""}, ${seriesEn(series)}. Use the arrow keys to move between points.`,
  barSummary: ({ horizontal, stacked, categories, series }) =>
    `${horizontal ? (stacked ? "Stacked bar" : "Bar") : stacked ? "Stacked column" : "Column"} chart: ${categories} ${
      categories === 1 ? "category" : "categories"
    }, ${seriesEn(series)}. Use the arrow keys to move between values.`,
  donutSummary: ({ groups, total, largest }) =>
    `Donut chart: ${groups} ${groups === 1 ? "group" : "groups"}, total ${total}${
      largest ? `. Largest: ${largest.label} (${largest.share})` : ""
    }. Use the arrow keys to move between slices.`,
  scatterSummary: ({ points, x, y, size, groups, trends }) =>
    `Scatter chart: ${points} ${points === 1 ? "point" : "points"}, ${y} by ${x}${size !== undefined ? `, sized by ${size}` : ""}${
      groups ? `, ${groups.length} ${groups.length === 1 ? "group" : "groups"} (${groups.join(", ")})` : ""
    }. Use the arrow keys to move between points in order of ${x}.${
      trends.length
        ? ` Trend line: ${trends.map((t) => `${t.group !== undefined ? `${t.group} ` : ""}slope ${t.slope}, R² ${t.r2}`).join("; ")}.`
        : ""
    }`,
  heatmapSummary: ({ rows, columns, min, max, hasEmpty }) =>
    `Heat map: ${rows} ${rows === 1 ? "row" : "rows"} × ${columns} ${columns === 1 ? "column" : "columns"}${
      min !== undefined ? `, values from ${min} to ${max}` : ""
    }${hasEmpty ? ", some cells have no data" : ""}. Use the arrow keys to move between cells.`,
  sparklineSummary: ({ points, first, last, min, max }) =>
    `Trend over ${points} ${points === 1 ? "point" : "points"}: from ${first} to ${last}, low ${min}, high ${max}`,
};
