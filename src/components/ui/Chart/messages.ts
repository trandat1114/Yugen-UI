/**
 * Chuỗi giao diện có sẵn của họ Chart (LineChart, AreaChart, BarChart, DonutChart, ScatterChart, Heatmap, Sparkline,
 * StatTile, ChartBrush, ChartContainer) — một namespace chung. Đổi qua `messages.chart` của YugenProvider.
 * Các hàm `…Summary` nhận giá trị đã định dạng sẵn (số, ngày theo `locale`).
 */
export interface ChartMessages {
  /** aria-roledescription của vùng vẽ. */
  roleDescription: string;
  heatmapRoleDescription: string;
  /** Nút bật chế độ bảng của ChartContainer. */
  dataTable: string;
  /** Dòng tổng (tooltip, bảng) và nhãn giữa vòng DonutChart. */
  total: string;
  value: string;
  share: string;
  noData: string;
  /** Tiêu đề cột đầu của bảng (khi không truyền `indexLabel`). */
  time: string;
  category: string;
  group: string;
  name: string;
  /** Nhóm gộp (DonutChart vượt `maxSlices`, ScatterChart nhóm thứ 9+). */
  other: string;
  /** Nút bật đường xu hướng của ScatterChart. */
  trend: string;
  /** @deprecated StatTile đọc `messages.stat` (Stat); ba chuỗi này không còn được dùng, sẽ bỏ ở 1.0. */
  increase: string;
  /** @deprecated Dùng `messages.stat.decrease`. */
  decrease: string;
  /** @deprecated Dùng `messages.stat.noChange`. */
  noChange: string;
  /** ChartBrush: tên cửa sổ thu phóng, dòng "Đang xem … · n/N mốc", nút đặt lại. */
  brush: string;
  brushRoleDescription: string;
  brushViewing: string;
  brushPoints: (shown: number, total: number) => string;
  brushReset: string;
  /** Mô tả truy cập tự sinh (khi không truyền `ariaLabel`). */
  lineSummary: (info: {
    kind: "line" | "area" | "stacked" | "expand";
    points: number;
    /** Mốc đầu / cuối (chỉ có khi points > 0). */
    from?: string;
    to?: string;
    series: string[];
  }) => string;
  barSummary: (info: { horizontal: boolean; stacked: boolean; categories: number; series: string[] }) => string;
  donutSummary: (info: { groups: number; total: string; largest?: { label: string; share: string } }) => string;
  scatterSummary: (info: {
    points: number;
    x: string;
    y: string;
    /** Tên đại lượng kích thước (biểu đồ bong bóng). */
    size?: string;
    /** Tên các nhóm (khi có nhiều nhóm). */
    groups?: string[];
    trends: { group?: string; slope: string; r2: string }[];
  }) => string;
  heatmapSummary: (info: { rows: number; columns: number; min?: string; max?: string; hasEmpty: boolean }) => string;
  sparklineSummary: (info: { points: number; first: string; last: string; min: string; max: string }) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    chart: ChartMessages;
  }
}

const LINE_KIND_VI = { line: "đường", area: "vùng", stacked: "vùng chồng", expand: "vùng chồng 100%" };
const LINE_KIND_EN = { line: "Line", area: "Area", stacked: "Stacked area", expand: "100% stacked area" };

const seriesVi = (series: string[]) => (series.length === 1 ? series[0] : `${series.length} chuỗi (${series.join(", ")})`);
const seriesEn = (series: string[]) => (series.length === 1 ? series[0] : `${series.length} series (${series.join(", ")})`);

export const chartMessages: ChartMessages = {
  roleDescription: "biểu đồ",
  heatmapRoleDescription: "bản đồ nhiệt",
  dataTable: "Bảng dữ liệu",
  total: "Tổng",
  value: "Giá trị",
  share: "Tỉ lệ",
  noData: "Không có dữ liệu",
  time: "Thời gian",
  category: "Danh mục",
  group: "Nhóm",
  name: "Tên",
  other: "Khác",
  trend: "Xu hướng",
  increase: "Tăng",
  decrease: "Giảm",
  noChange: "Không đổi",
  brush: "Vùng xem",
  brushRoleDescription: "cửa sổ thu phóng",
  brushViewing: "Đang xem",
  brushPoints: (shown, total) => `${shown}/${total} mốc`,
  brushReset: "Đặt lại",
  lineSummary: ({ kind, points, from, to, series }) =>
    `Biểu đồ ${LINE_KIND_VI[kind]}: ${points} điểm${points ? ` từ ${from} đến ${to}` : ""}, ${seriesVi(series)}. Dùng phím mũi tên để duyệt từng mốc.`,
  barSummary: ({ horizontal, stacked, categories, series }) =>
    `Biểu đồ ${horizontal ? "thanh" : "cột"}${stacked ? " chồng" : ""}: ${categories} danh mục, ${seriesVi(series)}. Dùng phím mũi tên để duyệt từng giá trị.`,
  donutSummary: ({ groups, total, largest }) =>
    `Biểu đồ donut: ${groups} nhóm, tổng ${total}${largest ? `. Lớn nhất: ${largest.label} (${largest.share})` : ""}. Dùng phím mũi tên để duyệt từng lát.`,
  scatterSummary: ({ points, x, y, size, groups, trends }) =>
    `Biểu đồ phân tán: ${points} điểm, ${x} theo ${y}${size !== undefined ? `, kích thước theo ${size}` : ""}${
      groups ? `, ${groups.length} nhóm (${groups.join(", ")})` : ""
    }. Dùng phím mũi tên để duyệt các điểm theo thứ tự ${x}.${
      trends.length
        ? ` Đường xu hướng: ${trends.map((t) => `${t.group !== undefined ? `${t.group} ` : ""}hệ số góc ${t.slope}, R² ${t.r2}`).join("; ")}.`
        : ""
    }`,
  heatmapSummary: ({ rows, columns, min, max, hasEmpty }) =>
    `Bản đồ nhiệt: ${rows} hàng × ${columns} cột${min !== undefined ? `, giá trị từ ${min} đến ${max}` : ""}${
      hasEmpty ? ", có ô không có dữ liệu" : ""
    }. Dùng phím mũi tên để duyệt từng ô.`,
  sparklineSummary: ({ points, first, last, min, max }) =>
    `Xu hướng ${points} điểm: từ ${first} đến ${last}, thấp nhất ${min}, cao nhất ${max}`,
};

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
