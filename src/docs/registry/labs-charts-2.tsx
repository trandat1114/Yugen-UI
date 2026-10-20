import { useState } from "react";
import { AreaChart, Heatmap, LineChart, ScatterChart } from "@/components/ui/Chart/Chart";
import { ToggleButton } from "@/components/ui/ToggleButton/ToggleButton";
import type { ComponentDoc } from "../types";
import RAW from "./labs-charts-2.tsx?raw";

/*
 * `code` của mỗi ví dụ được cắt từ chính file này (giữa `// #region <tên>` và `// #endregion`), nên luôn trùng từng
 * ký tự với dữ liệu + JSX mà `render` hiển thị.
 */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");

function source(...names: string[]) {
  return names
    .map((name) => {
      const start = LINES.findIndex((line) => line.trim() === `// #region ${name}`);
      const end = LINES.findIndex((line, i) => i > start && line.trim() === "// #endregion");
      if (start < 0 || end < 0) return `// Không tìm thấy mã nguồn "${name}"`;
      const block = LINES.slice(start + 1, end);
      const indent = Math.min(...block.filter((line) => line.trim()).map((line) => line.length - line.trimStart().length));
      return block
        .map((line) => line.slice(indent))
        .join("\n")
        .trim();
    })
    .join("\n\n");
}

/* ================================================================== Dữ liệu mẫu */

// #region products
const products = [
  { name: "Tai nghe Kaze", group: "Âm thanh", price: 0.45, rating: 3.8 },
  { name: "Tai nghe Kaze Pro", group: "Âm thanh", price: 1.29, rating: 4.4 },
  { name: "Loa Oto Mini", group: "Âm thanh", price: 0.69, rating: 4.1 },
  { name: "Loa Oto Max", group: "Âm thanh", price: 2.45, rating: 4.6 },
  { name: "Tai nghe Hibiki", group: "Âm thanh", price: 1.89, rating: 4.0 },
  { name: "Màn hình Sora 24", group: "Màn hình", price: 2.89, rating: 4.2 },
  { name: "Màn hình Sora 27", group: "Màn hình", price: 4.19, rating: 4.5 },
  { name: "Màn hình Sora 32", group: "Màn hình", price: 6.49, rating: 4.3 },
  { name: "Màn hình Kumo 24", group: "Màn hình", price: 2.19, rating: 3.6 },
  { name: "Bàn phím Ame", group: "Bàn phím", price: 0.59, rating: 3.9 },
  { name: "Bàn phím Ame TKL", group: "Bàn phím", price: 0.99, rating: 4.3 },
  { name: "Bàn phím Yuki", group: "Bàn phím", price: 1.59, rating: 4.7 },
  { name: "Bàn phím Yuki Lite", group: "Bàn phím", price: 1.19, rating: 4.4 },
  { name: "Bàn phím Hana", group: "Bàn phím", price: 0.35, rating: 3.4 },
];
// #endregion

// #region stores
const stores = [
  { store: "Quận 1", area: 120, revenue: 980, staff: 14 },
  { store: "Quận 3", area: 85, revenue: 640, staff: 9 },
  { store: "Thủ Đức", area: 210, revenue: 1120, staff: 18 },
  { store: "Bình Thạnh", area: 95, revenue: 560, staff: 8 },
  { store: "Hoàn Kiếm", area: 70, revenue: 720, staff: 10 },
  { store: "Cầu Giấy", area: 160, revenue: 890, staff: 12 },
  { store: "Hải Châu", area: 130, revenue: 610, staff: 7 },
  { store: "Ninh Kiều", area: 180, revenue: 520, staff: 6 },
];
// #endregion

// #region study
const study = Array.from({ length: 24 }, (_, i) => ({
  hours: 2 + i * 0.75,
  score: Math.round((4.2 + i * 0.2 + Math.sin(i * 1.7) * 0.8) * 10) / 10,
}));
// #endregion

// #region latency
const latency = Array.from({ length: 40 }, (_, i) => ({
  at: new Date(2026, 9, 1 + Math.floor(i / 2)),
  server: i % 2 ? "Hà Nội" : "TP.HCM",
  ms: Math.round(120 + (i % 2 ? 45 : 0) + Math.sin(i * 1.3) * 35 + i),
}));
// #endregion

// #region visitsByHour
const visitsByHour = [
  { day: "Thứ Hai", h0: 12, h3: 4, h6: 38, h9: 96, h12: 84, h15: 102, h18: 75, h21: 41 },
  { day: "Thứ Ba", h0: 10, h3: 5, h6: 41, h9: 104, h12: 88, h15: 110, h18: 79, h21: 44 },
  { day: "Thứ Tư", h0: 11, h3: 3, h6: 36, h9: 99, h12: 91, h15: 107, h18: 72, h21: 39 },
  { day: "Thứ Năm", h0: 14, h3: 6, h6: 40, h9: 101, h12: 86, h15: 98, h18: 70, h21: 47 },
  { day: "Thứ Sáu", h0: 16, h3: 7, h6: 33, h9: 88, h12: 79, h15: 84, h18: 66, h21: 58 },
  { day: "Thứ Bảy", h0: 28, h3: 12, h6: 15, h9: 42, h12: 61, h15: 66, h18: 70, h21: 74 },
  { day: "Chủ nhật", h0: 31, h3: 14, h6: 12, h9: 35, h12: 57, h15: 62, h18: 68, h21: 63 },
];
const hours = [0, 3, 6, 9, 12, 15, 18, 21].map((h) => ({ key: `h${h}`, label: `${h}h` }));
// #endregion

// #region growth
const growth = [
  { region: "Miền Bắc", q1: -12, q2: 4, q3: 18, q4: 25 },
  { region: "Miền Trung", q1: -24, q2: -8, q3: 2, q4: 9 },
  { region: "Miền Nam", q1: 6, q2: 14, q3: 21, q4: 30 },
  { region: "Tây Nguyên", q1: -30, q2: -18, q3: -5, q4: 3 },
];
// #endregion

// #region cohorts
const cohorts = [
  { cohort: "Tháng 5", m0: 1, m1: 0.46, m2: 0.38, m3: 0.33, m4: 0.3, m5: 0.28 },
  { cohort: "Tháng 6", m0: 1, m1: 0.51, m2: 0.41, m3: 0.36, m4: 0.32, m5: null },
  { cohort: "Tháng 7", m0: 1, m1: 0.49, m2: 0.4, m3: 0.35, m4: null, m5: null },
  { cohort: "Tháng 8", m0: 1, m1: 0.55, m2: 0.44, m3: null, m4: null, m5: null },
  { cohort: "Tháng 9", m0: 1, m1: 0.58, m2: null, m3: null, m4: null, m5: null },
  { cohort: "Tháng 10", m0: 1, m1: null, m2: null, m3: null, m4: null, m5: null },
];
const months = Array.from({ length: 6 }, (_, i) => ({ key: `m${i}`, label: `+${i} tháng` }));
// #endregion

// #region daily
const daily = Array.from({ length: 90 }, (_, i) => ({
  date: new Date(2026, 6, 1 + i),
  web: Math.round(1200 + i * 9 + Math.sin(i / 3) * 180),
  app: Math.round(800 + i * 14 + Math.cos(i / 4) * 140),
}));
// #endregion

// #region usage
const usage = Array.from({ length: 24 }, (_, i) => ({
  month: new Date(2025, i, 1),
  videos: 120 + i * 9,
  photos: 80 + i * 5 + (i % 3) * 6,
  docs: 30 + i * 2,
}));
// #endregion

// #region ControlledZoom
function ControlledZoom() {
  const last = daily.length - 1;
  const [domain, setDomain] = useState<[number, number]>([last - 6, last]);
  const presets = [
    { label: "7 ngày", days: 7 },
    { label: "30 ngày", days: 30 },
    { label: "Tất cả", days: daily.length },
  ];
  return (
    <div className="flex flex-col gap-M">
      <div className="flex flex-wrap gap-XS">
        {presets.map((p) => (
          <ToggleButton
            key={p.label}
            size="small"
            checked={domain[1] === last && domain[1] - domain[0] + 1 === p.days}
            onCheckedChange={() => setDomain([last - p.days + 1, last])}
          >
            {p.label}
          </ToggleButton>
        ))}
      </div>
      <LineChart
        title="Lượt truy cập web"
        data={daily}
        index="date"
        series={[{ key: "web", label: "Web" }]}
        brush
        domain={domain}
        onDomainChange={setDomain}
      />
    </div>
  );
}
// #endregion

const frameProps = {
  name: "title, description, toolbar, locale, ariaLabel, indexLabel…",
  type: "ChartFrameProps",
  description: "Như BarChart: khung, nút “Bảng dữ liệu”, texture, animate (tắt khi giảm chuyển động).",
};

export const docs: ComponentDoc[] = [
  {
    slug: "scatterchart",
    name: "ScatterChart",
    category: "Yugen Labs",
    lead: "ScatterChart cho thấy quan hệ giữa hai đại lượng số — tương quan, cụm và điểm ngoại lai — kèm bong bóng và đường xu hướng khi cần.",
    description:
      "Marker ≥ 8px có viền bề mặt 2px để các điểm chồng vẫn tách nhau. Tooltip bám theo điểm gần con trỏ nhất (tra kiểu Voronoi) nên không cần ngắm trúng chấm nhỏ. Bàn phím: Tab vào biểu đồ rồi dùng mũi tên duyệt các điểm theo thứ tự X. size biến điểm thành bong bóng với diện tích (không phải bán kính) tỉ lệ với giá trị; nút “Xu hướng” vẽ đường bình phương tối thiểu cho từng nhóm và ghi hệ số góc, R² vào mô tả truy cập.",
    importCode: `import { ScatterChart } from "@/components/ui";`,
    hero: {
      title: "Giá và điểm đánh giá",
      description: "Ba nhóm sản phẩm — màu theo thứ tự cố định, legend bật/tắt từng nhóm, nút Xu hướng trên thanh công cụ.",
      code: source("products", "scatterHero"),
      render: () => (
        // #region scatterHero
        <ScatterChart
          title="Giá và điểm đánh giá"
          description="14 sản phẩm, 3 nhóm"
          data={products}
          x="price"
          y="rating"
          group="group"
          label="name"
          xLabel="Giá (triệu ₫)"
          yLabel="Điểm đánh giá"
          valueFormat={{ maximumFractionDigits: 1 }}
        />
        // #endregion
      ),
    },
    examples: [
      {
        title: "Bong bóng",
        description: "size thêm chiều thứ ba: bán kính theo căn bậc hai nên diện tích tỉ lệ với giá trị; bong bóng lớn vẽ trước, nhỏ nằm trên.",
        code: source("stores", "bubble"),
        render: () => (
          // #region bubble
          <ScatterChart
            title="Cửa hàng: diện tích, doanh thu và nhân sự"
            data={stores}
            x="area"
            y="revenue"
            size="staff"
            label="store"
            xLabel="Diện tích (m²)"
            yLabel="Doanh thu (triệu ₫)"
            sizeLabel="Nhân viên"
            includeZero
          />
          // #endregion
        ),
      },
      {
        title: "Đường xu hướng",
        description: "defaultTrendLine bật sẵn hồi quy tuyến tính (nét đứt). Hệ số góc và R² được đọc trong mô tả cho trình đọc màn hình.",
        code: source("study", "trend"),
        render: () => (
          // #region trend
          <ScatterChart
            title="Giờ tự học và điểm thi"
            data={study}
            x="hours"
            y="score"
            xLabel="Giờ tự học / tuần"
            yLabel="Điểm"
            valueFormat={{ maximumFractionDigits: 1 }}
            defaultTrendLine
          />
          // #endregion
        ),
      },
      {
        title: "Trục thời gian",
        description: "x là Date → trục thời gian. series cố định thứ tự và màu của nhóm thay vì theo thứ tự xuất hiện.",
        code: source("latency", "timeScatter"),
        render: () => (
          // #region timeScatter
          <ScatterChart
            title="Thời gian phản hồi"
            data={latency}
            x="at"
            y="ms"
            group="server"
            series={[
              { key: "Hà Nội", label: "Hà Nội" },
              { key: "TP.HCM", label: "TP.HCM" },
            ]}
            xLabel="Ngày"
            yLabel="Phản hồi (ms)"
            xFormat={{ day: "numeric", month: "numeric" }}
          />
          // #endregion
        ),
      },
    ],
    dos: [
      "Dùng scatter khi câu hỏi là “hai đại lượng có liên quan không?” — không dùng cho xu hướng theo thời gian của một chuỗi (đó là LineChart).",
      "Giữ ≤ 3 nhóm: dạng “mọi cặp” chỉ 3 màu đầu đủ khác biệt cho người mù màu; nhiều hơn thì marker tự đổi hình hoặc tách small multiples.",
      "Gắn label để tooltip và bảng gọi tên từng điểm; đặt xLabel / yLabel có đơn vị.",
      "Bật đường xu hướng khi muốn nói về chiều hướng, kèm R² để người đọc biết mức tin cậy.",
    ],
    donts: [
      "Không mã hoá đại lượng bằng bán kính — bong bóng luôn theo diện tích, và đừng dùng size cho dữ liệu âm.",
      "Không vẽ hàng nghìn điểm nguyên bản — lấy mẫu hoặc gộp ô (heatmap) trước.",
      "Không thêm trục Y thứ hai cho nhóm khác thang đo.",
    ],
    props: [
      { name: "data / x / y", type: "ChartDatum[] / string / string", description: "Trường X (số hoặc Date) và Y (số)." },
      { name: "size", type: "string", description: "Trường kích thước → bong bóng (diện tích ∝ giá trị)." },
      { name: "maxRadius", type: "number", defaultValue: "24", description: "Bán kính bong bóng lớn nhất (px); nhỏ nhất 5px (chấm ≥ 8px + viền 2px)." },
      { name: "group / series", type: "string / ChartSeries[]", description: "Trường nhóm và thứ tự / nhãn / màu nhóm. Nhóm thứ 9+ gộp vào “Khác”." },
      { name: "label", type: "string", description: "Trường tên điểm (tiêu đề tooltip, cột đầu bảng)." },
      { name: "xLabel / yLabel / sizeLabel", type: "string", description: "Tên đại lượng trong tooltip, bảng và mô tả." },
      { name: "xType", type: `"number" | "time"`, defaultValue: "tự nhận", description: "Có Date → time." },
      { name: "xFormat", type: "Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | (v) => string", description: "Định dạng X." },
      { name: "valueFormat / axisFormat / sizeFormat", type: "ChartNumberFormat", description: "Định dạng Y, trục Y, kích thước." },
      { name: "includeZero", type: "boolean", defaultValue: "false", description: "Trục Y bắt đầu từ 0." },
      { name: "shapes", type: "boolean", defaultValue: "texture hoặc > 3 nhóm", description: "Phân biệt nhóm thêm bằng hình marker." },
      { name: "trendLine / defaultTrendLine / onTrendLineChange", type: "boolean / boolean / (on) => void", description: "Đường xu hướng bình phương tối thiểu." },
      { name: "hideTrendToggle", type: "boolean", defaultValue: "false", description: "Ẩn nút “Xu hướng”." },
      { name: "legend", type: "boolean", defaultValue: "≥ 2 nhóm", description: "Legend bật/tắt nhóm." },
      frameProps,
    ],
  },

  {
    slug: "heatmap",
    name: "Heatmap",
    category: "Yugen Labs",
    lead: "Heatmap tô một ma trận hàng × cột theo độ lớn — tìm mẫu theo giờ/ngày, so sánh nhóm, bảng giữ chân người dùng.",
    description:
      "Mặc định dùng dải tuần tự một sắc (nhạt = nhỏ, đậm = lớn); diverging chuyển sang hai cực quanh midpoint với điểm giữa xám trung tính. Ô cách nhau 2px, nhãn hàng / cột tự cắt cho vừa (đủ chữ trong tooltip và bảng). Ô trống là hoa văn gạch chéo trung tính và được đọc là “Không có dữ liệu”. Legend là dải màu chuyển với nhãn min / max. Bàn phím: Tab vào ma trận, mũi tên đi giữa các ô, Home/End về đầu/cuối hàng.",
    importCode: `import { Heatmap } from "@/components/ui";`,
    hero: {
      title: "Lượt truy cập theo giờ",
      code: source("visitsByHour", "heatmapHero"),
      render: () => (
        // #region heatmapHero
        <Heatmap
          title="Lượt truy cập theo giờ"
          description="Trung bình 4 tuần gần nhất (nghìn lượt)"
          data={visitsByHour}
          index="day"
          columns={hours}
          indexLabel="Ngày"
        />
        // #endregion
      ),
    },
    examples: [
      {
        title: "Phân kỳ",
        description: "Dữ liệu có dấu (tăng / giảm): diverging + domain đối xứng để hai cực cùng độ đậm; 0 là xám.",
        code: source("growth", "diverging"),
        render: () => (
          // #region diverging
          <Heatmap
            title="Tăng trưởng so với cùng kỳ"
            data={growth}
            index="region"
            columns={[
              { key: "q1", label: "Quý 1" },
              { key: "q2", label: "Quý 2" },
              { key: "q3", label: "Quý 3" },
              { key: "q4", label: "Quý 4" },
            ]}
            diverging
            domain={[-30, 30]}
            valueFormat={(v) => `${v > 0 ? "+" : ""}${v}%`}
            indexLabel="Vùng"
          />
          // #endregion
        ),
      },
      {
        title: "Ô trống (bảng cohort)",
        description: "null là “chưa có dữ liệu” — vẽ bằng hoa văn trung tính, không phải màu nhạt nhất của thang (sẽ bị đọc thành “gần 0”).",
        code: source("cohorts", "cohort"),
        render: () => (
          // #region cohort
          <Heatmap
            title="Tỉ lệ giữ chân theo nhóm đăng ký"
            data={cohorts}
            index="cohort"
            columns={months}
            domain={[0, 1]}
            valueFormat={{ style: "percent" }}
            rowHeight={28}
            indexLabel="Nhóm"
          />
          // #endregion
        ),
      },
    ],
    dos: [
      "Dùng thang tuần tự cho độ lớn không dấu; thang phân kỳ chỉ khi có mốc giữa có nghĩa (0, mục tiêu, trung bình).",
      "Cố định domain khi so sánh nhiều heatmap với nhau, để cùng màu = cùng giá trị.",
      "Sắp hàng / cột theo thứ tự tự nhiên (ngày trong tuần, giờ) hoặc theo giá trị để mẫu hiện ra.",
    ],
    donts: [
      "Không dùng màu phân loại cho ô — heatmap mã hoá độ lớn, không phải danh tính.",
      "Không để ô trống trùng màu nhạt nhất — thiếu dữ liệu khác với giá trị nhỏ.",
      "Không nhồi nhãn số vào ô nhỏ; giá trị chính xác nằm trong tooltip và bảng.",
    ],
    props: [
      { name: "data / index", type: "ChartDatum[] / string", description: "Mỗi phần tử là một hàng; index là trường nhãn hàng." },
      { name: "columns", type: "{ key: string; label: string }[]", description: "Các cột; null/thiếu = ô trống." },
      { name: "domain", type: "[number, number]", defaultValue: "theo dữ liệu", description: "Miền màu; giá trị ngoài miền bị kẹp." },
      { name: "diverging / midpoint", type: "boolean / number", defaultValue: "false / 0", description: "Thang phân kỳ quanh midpoint." },
      { name: "valueFormat", type: "ChartNumberFormat", description: "Định dạng giá trị (legend, tooltip, bảng)." },
      { name: "rowHeight", type: "number", defaultValue: "32", description: "Chiều cao mỗi hàng (px); chiều cao tổng tự tính." },
      { name: "legend", type: "boolean", defaultValue: "true", description: "Dải màu với nhãn min / max (và điểm giữa)." },
      frameProps,
    ],
  },

  {
    slug: "chartzoom",
    name: "Zoom & brush",
    category: "Yugen Labs",
    lead: "brush thêm dải tổng quan dưới LineChart / AreaChart để phóng to một giai đoạn mà không mất bối cảnh toàn chuỗi.",
    description:
      "Dải tổng quan vẽ toàn bộ dữ liệu bằng nét mảnh; cửa sổ sáng là vùng đang xem, phần ngoài được làm mờ. Kéo cửa sổ để dời, kéo tay nắm hai mép để đổi kích thước, bấm ra ngoài để nhảy tới. Cửa sổ là một slider: ←/→ dời một mốc, Shift+←/→ thu/giãn, PageUp/PageDown dời một cửa sổ, Home/End về hai đầu. Dải luôn LTR như vùng vẽ nên ở trang RTL phím mũi tên vẫn đi đúng chiều trên màn hình. Miền là cặp chỉ số [đầu, cuối] — domain / defaultDomain / onDomainChange; nút “Đặt lại” về toàn bộ. Trang này cũng có vùng chồng 100% (stackOffset=\"expand\").",
    importCode: `import { LineChart, AreaChart } from "@/components/ui";`,
    hero: {
      title: "Lượt truy cập 90 ngày",
      code: source("daily", "zoomHero"),
      render: () => (
        // #region zoomHero
        <LineChart
          title="Lượt truy cập mỗi ngày"
          description="Kéo cửa sổ dưới biểu đồ để xem một giai đoạn"
          data={daily}
          index="date"
          series={[
            { key: "web", label: "Web" },
            { key: "app", label: "Ứng dụng" },
          ]}
          brush
          defaultDomain={[60, 89]}
        />
        // #endregion
      ),
    },
    examples: [
      {
        title: "Vùng chồng + brush",
        description: "AreaChart stacked: tooltip liệt kê từng chuỗi và dòng Tổng; dải tổng quan vẽ đỉnh của từng lớp.",
        code: source("usage", "stackedBrush"),
        render: () => (
          // #region stackedBrush
          <AreaChart
            title="Dung lượng đã dùng (GB)"
            data={usage}
            index="month"
            xFormat={{ month: "numeric", year: "2-digit" }}
            xTooltipFormat={{ month: "long", year: "numeric" }}
            stacked
            brush
            series={[
              { key: "videos", label: "Video" },
              { key: "photos", label: "Ảnh" },
              { key: "docs", label: "Tài liệu" },
            ]}
          />
          // #endregion
        ),
      },
      {
        title: "Vùng chồng 100%",
        description: "stackOffset=\"expand\" chuẩn hoá mỗi mốc về 100% — cho câu hỏi “cơ cấu thay đổi ra sao”, trục Y là tỉ lệ; tooltip ghi giá trị kèm phần trăm và Tổng.",
        code: source("usage", "expand"),
        render: () => (
          // #region expand
          <AreaChart
            title="Cơ cấu dung lượng"
            data={usage}
            index="month"
            xFormat={{ month: "numeric", year: "2-digit" }}
            xTooltipFormat={{ month: "long", year: "numeric" }}
            stacked
            stackOffset="expand"
            series={[
              { key: "videos", label: "Video" },
              { key: "photos", label: "Ảnh" },
              { key: "docs", label: "Tài liệu" },
            ]}
          />
          // #endregion
        ),
      },
      {
        title: "Điều khiển miền",
        description: "domain + onDomainChange: nút đặt sẵn 7 / 30 ngày đồng bộ với cửa sổ kéo tay.",
        code: source("daily", "ControlledZoom"),
        render: () => <ControlledZoom />,
      },
    ],
    dos: [
      "Bật brush khi chuỗi dài (vài chục mốc trở lên) và người đọc cần soi một giai đoạn.",
      "Chọn defaultDomain là giai đoạn gần nhất — người đọc thường hỏi về “bây giờ” trước.",
      "Dùng vùng chồng 100% cho câu hỏi về cơ cấu; giữ vùng chồng thường khi tổng cũng quan trọng.",
    ],
    donts: [
      "Không dùng brush để giấu dữ liệu — bảng dữ liệu luôn chứa toàn bộ mốc.",
      "Không chồng 100% khi các chuỗi có giá trị âm.",
      "Không zoom theo trục Y riêng cho từng chuỗi — vẫn một trục Y.",
    ],
    props: [
      { name: "brush", type: "boolean", defaultValue: "false", description: "Dải tổng quan + cửa sổ kéo dưới vùng vẽ (LineChart, AreaChart)." },
      { name: "domain / defaultDomain", type: "[number, number]", description: "Miền chỉ số đang xem (gồm hai đầu)." },
      { name: "onDomainChange", type: "(domain: [number, number]) => void", description: "Gọi khi kéo, dùng phím hoặc bấm “Đặt lại”." },
      { name: "AreaChart.stacked", type: "boolean", defaultValue: "false", description: "Chỉ AreaChart: chồng vùng; tooltip có dòng Tổng." },
      { name: "AreaChart.stackOffset", type: `"none" | "expand"`, defaultValue: `"none"`, description: "Chỉ AreaChart khi stacked: expand = 100%." },
      { name: "…", type: "LineChartProps", description: "Mọi prop khác như trang LineChart." },
    ],
  },
];
