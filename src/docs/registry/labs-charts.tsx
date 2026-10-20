import { AreaChart, BarChart, DonutChart, LineChart, Sparkline, StatTile } from "@/components/ui/Chart/Chart";
import type { ComponentDoc } from "../types";

/* ------------------------------------------------------------------ Dữ liệu mẫu
   Code mẫu in lại đúng dữ liệu đang render bằng lit() — không thể lệch nhau. */

function lit(rows: Record<string, unknown>[]): string {
  const v = (x: unknown): string =>
    x instanceof Date ? `new Date(${x.getFullYear()}, ${x.getMonth()}, ${x.getDate()})` : typeof x === "string" ? JSON.stringify(x) : String(x);
  return `[\n${rows.map((r) => `  { ${Object.entries(r).map(([k, x]) => `${k}: ${v(x)}`).join(", ")} },`).join("\n")}\n]`;
}

const revenue = [
  { month: "T5", online: 420000000, store: 310000000 },
  { month: "T6", online: 465000000, store: 298000000 },
  { month: "T7", online: 510000000, store: 325000000 },
  { month: "T8", online: 488000000, store: 340000000 },
  { month: "T9", online: 560000000, store: 352000000 },
  { month: "T10", online: 615000000, store: 360000000 },
];

const topProducts = [
  { product: "Tai nghe không dây Sora", sold: 1840 },
  { product: "Bàn phím cơ Kohaku", sold: 1325 },
  { product: "Chuột công thái học", sold: 1190 },
  { product: "Màn hình 27 inch 4K", sold: 860 },
  { product: "Giá đỡ laptop nhôm", sold: 640 },
];

const quarterly = [
  { quarter: "Q1", hardware: 320, software: 210, services: 140 },
  { quarter: "Q2", hardware: 285, software: 245, services: 160 },
  { quarter: "Q3", hardware: 340, software: 270, services: 175 },
  { quarter: "Q4", hardware: 395, software: 310, services: 210 },
];

const profit = [
  { month: "T5", profit: 120 },
  { month: "T6", profit: -45 },
  { month: "T7", profit: 80 },
  { month: "T8", profit: -20 },
  { month: "T9", profit: 150 },
  { month: "T10", profit: 95 },
];

const channels = [
  { region: "Miền Bắc", web: 42, app: 35, store: 23 },
  { region: "Miền Trung", web: 30, app: 28, store: 42 },
  { region: "Miền Nam", web: 46, app: 38, store: 16 },
];

const traffic = [
  { month: "T1", search: 4200, social: 2100, direct: 1500 },
  { month: "T2", search: 4350, social: 2600, direct: 1550 },
  { month: "T3", search: 4800, social: 2450, direct: 1620 },
  { month: "T4", search: 5100, social: 3100, direct: 1700 },
  { month: "T5", search: 5050, social: 3600, direct: 1680 },
  { month: "T6", search: 5600, social: 3900, direct: 1810 },
  { month: "T7", search: 6100, social: 3700, direct: 1900 },
  { month: "T8", search: 6400, social: 4200, direct: 1950 },
];

const visits = [
  { date: new Date(2026, 9, 1), visits: 1240 },
  { date: new Date(2026, 9, 2), visits: 1310 },
  { date: new Date(2026, 9, 3), visits: 980 },
  { date: new Date(2026, 9, 4), visits: 920 },
  { date: new Date(2026, 9, 5), visits: 1405 },
  { date: new Date(2026, 9, 6), visits: 1520 },
  { date: new Date(2026, 9, 7), visits: 1490 },
  { date: new Date(2026, 9, 8), visits: 1610 },
  { date: new Date(2026, 9, 9), visits: 1580 },
  { date: new Date(2026, 9, 10), visits: 1150 },
  { date: new Date(2026, 9, 11), visits: 1090 },
  { date: new Date(2026, 9, 12), visits: 1720 },
  { date: new Date(2026, 9, 13), visits: 1810 },
  { date: new Date(2026, 9, 14), visits: 1765 },
];

const activeUsers = [
  { week: "Tuần 1", users: 8200 },
  { week: "Tuần 2", users: 8650 },
  { week: "Tuần 3", users: 9100 },
  { week: "Tuần 4", users: 8900 },
  { week: "Tuần 5", users: 9800 },
  { week: "Tuần 6", users: 10400 },
  { week: "Tuần 7", users: 11200 },
];

const storage = [
  { month: "T5", photos: 18, videos: 22, docs: 6 },
  { month: "T6", photos: 21, videos: 26, docs: 6 },
  { month: "T7", photos: 24, videos: 31, docs: 7 },
  { month: "T8", photos: 27, videos: 35, docs: 8 },
  { month: "T9", photos: 30, videos: 38, docs: 8 },
  { month: "T10", photos: 32, videos: 41, docs: 9 },
];

const productLines = [
  { month: "T5", basic: 210, pro: 120, team: 90, enterprise: 60 },
  { month: "T6", basic: 205, pro: 135, team: 95, enterprise: 62 },
  { month: "T7", basic: 215, pro: 160, team: 92, enterprise: 66 },
  { month: "T8", basic: 208, pro: 190, team: 98, enterprise: 65 },
  { month: "T9", basic: 212, pro: 230, team: 101, enterprise: 70 },
  { month: "T10", basic: 206, pro: 265, team: 104, enterprise: 72 },
];

const sources = [
  { label: "Tìm kiếm", value: 4200 },
  { label: "Mạng xã hội", value: 2800 },
  { label: "Giới thiệu", value: 1800 },
  { label: "Email", value: 1200 },
];

const provinces = [
  { label: "TP. Hồ Chí Minh", value: 3820 },
  { label: "Hà Nội", value: 3410 },
  { label: "Đà Nẵng", value: 1240 },
  { label: "Hải Phòng", value: 980 },
  { label: "Cần Thơ", value: 760 },
  { label: "Huế", value: 420 },
  { label: "Nha Trang", value: 390 },
  { label: "Đà Lạt", value: 310 },
  { label: "Vũng Tàu", value: 260 },
];

const usage = [
  { label: "Video", value: 41 },
  { label: "Ảnh", value: 32 },
  { label: "Tài liệu", value: 9 },
  { label: "Ứng dụng", value: 6 },
];

const revenueTrend = [62, 68, 64, 71, 75, 73, 80, 84, 82, 90, 96, 104];
const months = ["T11", "T12", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"];
const churnTrend = [0.041, 0.04, 0.039, 0.042, 0.038, 0.037, 0.036, 0.035, 0.036, 0.033, 0.032, 0.031];

/* ------------------------------------------------------------------ Docs */

const LABS_CHARTS: ComponentDoc[] = [
  {
    slug: "barchart",
    name: "BarChart",
    category: "Yugen Labs",
    lead: "BarChart so sánh độ lớn giữa các danh mục — cột dọc hoặc thanh ngang, nhóm hoặc chồng, có hỗ trợ giá trị âm.",
    description:
      "SVG viết tay theo phương pháp dataviz: cột mảnh ≤ 24px, đầu dữ liệu bo 4px và vuông ở đường gốc, khe bề mặt 2px giữa các cột/đoạn chồng, một trục Y, lưới mảnh lùi về sau. Rê chuột hoặc Tab vào biểu đồ rồi dùng phím mũi tên để xem tooltip; nút “Bảng dữ liệu” chuyển sang bảng tương đương cho trình đọc màn hình.",
    importCode: `import { BarChart } from "@/components/ui";`,
    hero: {
      title: "Doanh thu theo kênh",
      code: `const revenue = ${lit(revenue)};

<BarChart
  title="Doanh thu theo kênh"
  description="6 tháng gần nhất"
  data={revenue}
  index="month"
  series={[
    { key: "online", label: "Trực tuyến" },
    { key: "store", label: "Cửa hàng" },
  ]}
  valueFormat={{ style: "currency", currency: "VND", maximumFractionDigits: 0 }}
/>`,
      render: () => (
        <BarChart
          title="Doanh thu theo kênh"
          description="6 tháng gần nhất"
          data={revenue}
          index="month"
          series={[
            { key: "online", label: "Trực tuyến" },
            { key: "store", label: "Cửa hàng" },
          ]}
          valueFormat={{ style: "currency", currency: "VND", maximumFractionDigits: 0 }}
        />
      ),
    },
    examples: [
      {
        title: "Thanh ngang & nhãn giá trị",
        description: "Nhiều danh mục hoặc tên dài → thanh ngang. Một chuỗi nên không có legend; giá trị nằm ở đầu thanh.",
        code: `const topProducts = ${lit(topProducts)};

<BarChart
  title="Sản phẩm bán chạy"
  data={topProducts}
  index="product"
  series={[{ key: "sold", label: "Đã bán" }]}
  orientation="horizontal"
  showValues
/>`,
        render: () => (
          <BarChart
            title="Sản phẩm bán chạy"
            data={topProducts}
            index="product"
            series={[{ key: "sold", label: "Đã bán" }]}
            orientation="horizontal"
            showValues
          />
        ),
      },
      {
        title: "Cột chồng",
        description: "Phần–tổng theo danh mục; khe 2px giữa các đoạn, chỉ đoạn ngoài cùng bo góc. Tooltip liệt kê mọi đoạn và tổng.",
        code: `const quarterly = ${lit(quarterly)};

<BarChart
  title="Doanh thu theo mảng (triệu ₫)"
  data={quarterly}
  index="quarter"
  layout="stacked"
  series={[
    { key: "hardware", label: "Phần cứng" },
    { key: "software", label: "Phần mềm" },
    { key: "services", label: "Dịch vụ" },
  ]}
  showValues
/>`,
        render: () => (
          <BarChart
            title="Doanh thu theo mảng (triệu ₫)"
            data={quarterly}
            index="quarter"
            layout="stacked"
            series={[
              { key: "hardware", label: "Phần cứng" },
              { key: "software", label: "Phần mềm" },
              { key: "services", label: "Dịch vụ" },
            ]}
            showValues
          />
        ),
      },
      {
        title: "Giá trị âm (phân kỳ)",
        description: "Cột mọc hai phía đường gốc 0. diverging tô hai cực Sakura ↔ Ai; vị trí đã mã hoá dấu, màu chỉ nhấn thêm.",
        code: `const profit = ${lit(profit)};

<BarChart
  title="Lợi nhuận ròng (triệu ₫)"
  data={profit}
  index="month"
  series={[{ key: "profit", label: "Lợi nhuận" }]}
  diverging
/>`,
        render: () => (
          <BarChart
            title="Lợi nhuận ròng (triệu ₫)"
            data={profit}
            index="month"
            series={[{ key: "profit", label: "Lợi nhuận" }]}
            diverging
          />
        ),
      },
      {
        title: "Hoa văn (texture)",
        description: "Kênh dự phòng cho mù màu toàn phần, in ấn và forced-colors: hoa văn 45° / 135°. Tự bật ở theme Tương phản cao.",
        code: `const channels = ${lit(channels)};

<BarChart
  title="Tỉ trọng kênh bán (%)"
  data={channels}
  index="region"
  series={[
    { key: "web", label: "Website" },
    { key: "app", label: "Ứng dụng" },
    { key: "store", label: "Cửa hàng" },
  ]}
  texture
/>`,
        render: () => (
          <BarChart
            title="Tỉ trọng kênh bán (%)"
            data={channels}
            index="region"
            series={[
              { key: "web", label: "Website" },
              { key: "app", label: "Ứng dụng" },
              { key: "store", label: "Cửa hàng" },
            ]}
            texture
          />
        ),
      },
    ],
    dos: [
      "Dùng cột để so sánh độ lớn; chuyển sang thanh ngang khi nhiều danh mục hoặc tên dài.",
      "Một chuỗi = một màu (ô 1) cho mọi cột — tiêu đề đã gọi tên chuỗi nên không cần legend.",
      "Chỉ bật nhãn giá trị khi ít cột; phần còn lại để trục, tooltip và bảng dữ liệu đảm nhận.",
    ],
    donts: [
      "Không dùng hai trục Y — tách thành hai biểu đồ hoặc chỉ số hoá về cùng gốc (= 100).",
      "Không tô cột đậm dần theo giá trị cho danh mục không có thứ tự — độ dài cột đã nói điều đó.",
      "Không vẽ biểu đồ chỉ một cột — dùng StatTile.",
    ],
    props: [
      { name: "data", type: "ChartDatum[]", description: "Mảng dòng dữ liệu (object)." },
      { name: "index", type: "string", description: "Trường danh mục." },
      { name: "series", type: "{ key, label, color? }[]", description: "Chuỗi giá trị; color (1–8) ghim ô màu, mặc định theo thứ tự." },
      { name: "orientation", type: `"vertical" | "horizontal"`, defaultValue: `"vertical"`, description: "Cột dọc hoặc thanh ngang." },
      { name: "layout", type: `"grouped" | "stacked"`, defaultValue: `"grouped"`, description: "Cạnh nhau hoặc chồng." },
      { name: "valueFormat / axisFormat", type: "Intl.NumberFormatOptions | (v) => string", description: "Định dạng giá trị; trục tự rút gọn từ 1.000." },
      { name: "showValues", type: "boolean", defaultValue: "false", description: "Nhãn ở đầu cột — chỉ khi vừa chỗ." },
      { name: "diverging", type: "boolean", defaultValue: "false", description: "Một chuỗi: âm / dương theo cặp màu phân kỳ." },
      { name: "legend", type: "boolean", defaultValue: "≥ 2 chuỗi", description: "Legend bật/tắt chuỗi (màu không đổi khi lọc)." },
      { name: "barSize", type: "number", defaultValue: "24", description: "Độ dày tối đa của cột (px)." },
      { name: "title / description / toolbar", type: "ReactNode", description: "Khung ChartContainer." },
      { name: "height", type: "number", defaultValue: "280 (dọc) · tự tính (ngang)", description: "Chiều cao vùng vẽ, gồm dải nhãn trục." },
      { name: "locale", type: "string", defaultValue: `"vi-VN"`, description: "Locale cho Intl." },
      { name: "texture", type: "boolean", defaultValue: "tự động", description: "Hoa văn nhận diện — tự bật ở tương phản cao / forced-colors." },
      { name: "ariaLabel, indexLabel, hideTableToggle, defaultShowTable, animate", type: "…", description: "Mô tả truy cập, tiêu đề cột bảng, nút bảng, animation." },
    ],
  },

  {
    slug: "linechart",
    name: "LineChart",
    category: "Yugen Labs",
    lead: "LineChart và AreaChart thể hiện xu hướng theo thời gian hoặc theo chuỗi danh mục, nhiều chuỗi trên một trục.",
    description:
      "Đường 2px bo đầu, vùng phủ ~10% (AreaChart), crosshair bám theo mốc X gần nhất và một tooltip liệt kê mọi chuỗi. Trục X nhận chuỗi (cách đều) hoặc Date (theo thời gian thực). Với ≤ 4 chuỗi, tên chuỗi được ghi ở cuối đường — tự tắt khi các nhãn va nhau.",
    importCode: `import { LineChart, AreaChart } from "@/components/ui";`,
    hero: {
      title: "Lượt truy cập theo nguồn",
      code: `const traffic = ${lit(traffic)};

<LineChart
  title="Lượt truy cập theo nguồn"
  description="Tháng 1 – tháng 8"
  data={traffic}
  index="month"
  series={[
    { key: "search", label: "Tìm kiếm" },
    { key: "social", label: "Mạng xã hội" },
    { key: "direct", label: "Trực tiếp" },
  ]}
/>`,
      render: () => (
        <LineChart
          title="Lượt truy cập theo nguồn"
          description="Tháng 1 – tháng 8"
          data={traffic}
          index="month"
          series={[
            { key: "search", label: "Tìm kiếm" },
            { key: "social", label: "Mạng xã hội" },
            { key: "direct", label: "Trực tiếp" },
          ]}
        />
      ),
    },
    examples: [
      {
        title: "Trục thời gian & điểm đánh dấu",
        description: "index là Date → vị trí theo thời gian thực, nhãn trục định dạng bằng Intl (vi-VN). markers vẽ chấm ≥ 8px có viền bề mặt.",
        code: `const visits = ${lit(visits)};

<LineChart
  title="Lượt truy cập mỗi ngày"
  data={visits}
  index="date"
  series={[{ key: "visits", label: "Lượt truy cập" }]}
  markers
/>`,
        render: () => (
          <LineChart title="Lượt truy cập mỗi ngày" data={visits} index="date" series={[{ key: "visits", label: "Lượt truy cập" }]} markers />
        ),
      },
      {
        title: "AreaChart",
        description: "Một chuỗi: vùng phủ nhạt dưới đường, trục Y luôn từ 0. Giá trị cuối được ghi trực tiếp.",
        code: `const activeUsers = ${lit(activeUsers)};

<AreaChart
  title="Người dùng hoạt động"
  data={activeUsers}
  index="week"
  series={[{ key: "users", label: "Người dùng" }]}
/>`,
        render: () => (
          <AreaChart title="Người dùng hoạt động" data={activeUsers} index="week" series={[{ key: "users", label: "Người dùng" }]} />
        ),
      },
      {
        title: "Vùng chồng",
        description: "stacked cộng dồn các chuỗi — phần–tổng theo thời gian; tooltip có thêm dòng Tổng.",
        code: `const storage = ${lit(storage)};

<AreaChart
  title="Dung lượng đã dùng (GB)"
  data={storage}
  index="month"
  stacked
  series={[
    { key: "videos", label: "Video" },
    { key: "photos", label: "Ảnh" },
    { key: "docs", label: "Tài liệu" },
  ]}
/>`,
        render: () => (
          <AreaChart
            title="Dung lượng đã dùng (GB)"
            data={storage}
            index="month"
            stacked
            series={[
              { key: "videos", label: "Video" },
              { key: "photos", label: "Ảnh" },
              { key: "docs", label: "Tài liệu" },
            ]}
          />
        ),
      },
      {
        title: "Nhấn mạnh một chuỗi",
        description: "Khi câu chuyện là “gói Pro tăng mạnh”: highlight tô màu một chuỗi, phần còn lại về xám làm nền.",
        code: `const productLines = ${lit(productLines)};

<LineChart
  title="Thuê bao theo gói"
  data={productLines}
  index="month"
  highlight="pro"
  series={[
    { key: "basic", label: "Cơ bản" },
    { key: "pro", label: "Pro" },
    { key: "team", label: "Nhóm" },
    { key: "enterprise", label: "Doanh nghiệp" },
  ]}
/>`,
        render: () => (
          <LineChart
            title="Thuê bao theo gói"
            data={productLines}
            index="month"
            highlight="pro"
            series={[
              { key: "basic", label: "Cơ bản" },
              { key: "pro", label: "Pro" },
              { key: "team", label: "Nhóm" },
              { key: "enterprise", label: "Doanh nghiệp" },
            ]}
          />
        ),
      },
    ],
    dos: [
      "Dùng đường cho xu hướng; AreaChart khi chỉ một chuỗi hoặc khi cần phần–tổng theo thời gian (stacked).",
      "Ghi nhãn trực tiếp ở cuối đường khi ≤ 4 chuỗi; nhiều hơn thì dựa vào legend, tooltip hoặc chia small multiples.",
      "Khi câu chuyện là một chuỗi, dùng highlight thay vì tám màu ngang nhau.",
    ],
    donts: [
      "Không đặt hai đại lượng khác thang đo lên hai trục Y — tách biểu đồ hoặc chỉ số hoá (= 100 tại mốc đầu).",
      "Không chồng vùng phủ đậm che nhau — vùng chỉ là lớp nhạt ~10%, đường mới là mark chính.",
      "Không ghi số ở mọi điểm — chỉ điểm cuối hoặc điểm cực trị.",
    ],
    props: [
      { name: "data / index / series", type: "ChartDatum[] / string / ChartSeries[]", description: "Dữ liệu sắp xếp tăng dần theo X." },
      { name: "xType", type: `"category" | "time"`, defaultValue: "tự nhận", description: "Có Date → time (vị trí theo thời gian)." },
      { name: "xFormat / xTooltipFormat", type: "Intl.DateTimeFormatOptions | (v) => string", description: "Nhãn trục / tooltip & bảng." },
      { name: "valueFormat / axisFormat", type: "Intl.NumberFormatOptions | (v) => string", description: "Định dạng giá trị và trục." },
      { name: "markers", type: "boolean", defaultValue: "false", description: "Chấm tại mọi điểm." },
      { name: "curve", type: `"monotone" | "linear"`, defaultValue: `"monotone"`, description: "Nội suy không vượt đỉnh dữ liệu." },
      { name: "endLabels", type: "boolean", defaultValue: "≤ 4 chuỗi", description: "Nhãn cuối đường; tự tắt nếu va nhau." },
      { name: "highlight", type: "string", description: "Key chuỗi được nhấn mạnh (các chuỗi khác xám)." },
      { name: "includeZero", type: "boolean", defaultValue: "false (Line) · true (Area)", description: "Trục Y bắt đầu từ 0." },
      { name: "AreaChart.stacked", type: "boolean", defaultValue: "false", description: "Chỉ AreaChart: chồng vùng." },
      { name: "title, description, toolbar, height, locale, texture, legend…", type: "ChartFrameProps", description: "Như BarChart." },
    ],
  },

  {
    slug: "donutchart",
    name: "DonutChart",
    category: "Yugen Labs",
    lead: "DonutChart cho phần–tổng nhìn nhanh với tối đa 6 lát; phần đuôi tự gộp vào “Khác”, tổng hiển thị ở giữa vòng.",
    description:
      "Vòng mảnh, khe bề mặt 2px song song giữa các lát, bắt đầu ở 12 giờ theo chiều kim đồng hồ. Legend bên cạnh kèm tỉ lệ (theo hướng chữ của trang); hover hoặc phím mũi tên để xem giá trị. Khi cần so sánh các giá trị sát nhau, dùng BarChart.",
    importCode: `import { DonutChart } from "@/components/ui";`,
    hero: {
      title: "Nguồn khách hàng",
      code: `const sources = ${lit(sources)};

<DonutChart title="Nguồn khách hàng" description="Tháng 10" data={sources} />`,
      render: () => <DonutChart title="Nguồn khách hàng" description="Tháng 10" data={sources} />,
    },
    examples: [
      {
        title: "Gộp phần đuôi vào “Khác”",
        description: "9 nhóm → 5 nhóm lớn nhất + “Khác” màu xám trung tính. Bảng dữ liệu vẫn giữ con số gộp.",
        code: `const provinces = ${lit(provinces)};

<DonutChart title="Đơn hàng theo tỉnh" data={provinces} valueFormat={{ maximumFractionDigits: 0 }} />`,
        render: () => <DonutChart title="Đơn hàng theo tỉnh" data={provinces} valueFormat={{ maximumFractionDigits: 0 }} />,
      },
      {
        title: "Nhãn giữa tuỳ biến",
        description: "centerValue / centerLabel thay cho tổng mặc định; size và thickness đổi kích thước vòng.",
        code: `const usage = ${lit(usage)};

<DonutChart
  title="Bộ nhớ"
  data={usage}
  valueFormat={{ style: "unit", unit: "gigabyte" }}
  centerValue="88 GB"
  centerLabel="đã dùng / 128 GB"
  size={168}
  thickness={18}
/>`,
        render: () => (
          <DonutChart
            title="Bộ nhớ"
            data={usage}
            valueFormat={{ style: "unit", unit: "gigabyte" }}
            centerValue="88 GB"
            centerLabel="đã dùng / 128 GB"
            size={168}
            thickness={18}
          />
        ),
      },
    ],
    dos: [
      "Chỉ dùng cho phần–tổng nhìn nhanh, ≤ 6 lát; để màu đi theo thực thể (truyền color khi dữ liệu thay đổi).",
      "Đặt con số quan trọng nhất ở giữa vòng.",
    ],
    donts: [
      "Không dùng donut để so sánh các giá trị sát nhau — dùng BarChart hoặc ghi số.",
      "Không dùng donut 2 lát — dùng StatTile hoặc ProgressBar.",
      "Không tô “Khác” bằng màu phân loại — nó luôn là xám trung tính.",
    ],
    props: [
      { name: "data", type: "{ label, value, color? }[]", description: "Giá trị ≤ 0 bị bỏ qua." },
      { name: "maxSlices", type: "number", defaultValue: "6", description: "Tối đa số lát (gồm “Khác”), không vượt 6." },
      { name: "otherLabel", type: "string", defaultValue: `"Khác"`, description: "Nhãn lát gộp." },
      { name: "centerValue / centerLabel", type: "ReactNode", defaultValue: `tổng / "Tổng"`, description: "Nội dung giữa vòng." },
      { name: "size / thickness", type: "number", defaultValue: "200 / 12% size", description: "Đường kính và độ dày vòng (px)." },
      { name: "legend", type: "boolean", defaultValue: "true", description: "Legend kèm tỉ lệ bên cạnh." },
      { name: "valueFormat, locale, title, description, texture…", type: "…", description: "Như BarChart." },
    ],
  },

  {
    slug: "sparkline",
    name: "Sparkline & StatTile",
    category: "Yugen Labs",
    lead: "Đôi khi câu trả lời không phải biểu đồ: StatTile đưa con số lên trước, kèm delta và một sparkline xu hướng nhỏ.",
    description:
      "Sparkline là đường xu hướng inline không trục — xám làm nền, điểm hiện tại tô màu nhấn. StatTile: nhãn, giá trị (chữ sans semibold, số tỉ lệ — không tabular), delta có dấu với icon + chữ (màu success/danger theo goodDirection) và sparkline tuỳ chọn. Mỗi màn hình chỉ một con số hero.",
    importCode: `import { Sparkline, StatTile } from "@/components/ui";`,
    hero: {
      title: "StatTile",
      code: `const revenueTrend = ${JSON.stringify(revenueTrend)};
const months = ${JSON.stringify(months)};

<StatTile
  label="Doanh thu tháng"
  value={1284000000}
  valueFormat={{ style: "currency", currency: "VND", notation: "compact", maximumFractionDigits: 2 }}
  delta={0.124}
  deltaLabel="so với tháng trước"
  trend={revenueTrend}
  trendLabels={months}
  className="w-80"
/>`,
      render: () => (
        <StatTile
          label="Doanh thu tháng"
          value={1284000000}
          valueFormat={{ style: "currency", currency: "VND", notation: "compact", maximumFractionDigits: 2 }}
          delta={0.124}
          deltaLabel="so với tháng trước"
          trend={revenueTrend}
          trendLabels={months}
          className="w-80"
        />
      ),
    },
    examples: [
      {
        title: "Sparkline trong câu",
        description: "Inline, cao bằng dòng chữ; aria-label tự tóm tắt đầu, cuối, thấp nhất, cao nhất.",
        code: `const revenueTrend = ${JSON.stringify(revenueTrend)};
const months = ${JSON.stringify(months)};

<p className="text-body1 text-foreground-2">
  Doanh thu 12 tháng <Sparkline data={revenueTrend} labels={months} width={96} height={24} /> tăng đều.
</p>`,
        render: () => (
          <p className="text-body1 text-foreground-2">
            Doanh thu 12 tháng <Sparkline data={revenueTrend} labels={months} width={96} height={24} /> tăng đều.
          </p>
        ),
      },
      {
        title: "Biến thể",
        description: "variant area; color chọn ô màu phân loại thay cho xám làm nền.",
        code: `const revenueTrend = ${JSON.stringify(revenueTrend)};
const churnTrend = ${JSON.stringify(churnTrend)};

<Sparkline data={revenueTrend} variant="area" />
<Sparkline data={revenueTrend} color={2} />
<Sparkline data={churnTrend} variant="area" color={4} />`,
        render: () => (
          <>
            <Sparkline data={revenueTrend} variant="area" />
            <Sparkline data={revenueTrend} color={2} />
            <Sparkline data={churnTrend} variant="area" color={4} />
          </>
        ),
      },
      {
        title: "Giảm là tốt",
        description: "goodDirection=\"down\": tỉ lệ rời bỏ giảm → màu success, luôn kèm icon và chữ.",
        code: `const churnTrend = ${JSON.stringify(churnTrend)};

<StatTile
  label="Tỉ lệ rời bỏ"
  value={0.031}
  valueFormat={{ style: "percent", maximumFractionDigits: 1 }}
  delta={-0.008}
  deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }}
  deltaLabel="so với tháng trước"
  goodDirection="down"
  trend={churnTrend}
  className="w-72"
/>`,
        render: () => (
          <StatTile
            label="Tỉ lệ rời bỏ"
            value={0.031}
            valueFormat={{ style: "percent", maximumFractionDigits: 1 }}
            delta={-0.008}
            deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }}
            deltaLabel="so với tháng trước"
            goodDirection="down"
            trend={churnTrend}
            className="w-72"
          />
        ),
      },
      {
        title: "Con số hero",
        description: "size=\"hero\" (68px, cùng font sans) cho con số duy nhất mà màn hình dẫn dắt.",
        code: `<StatTile label="Khách hàng đang hoạt động" value={128450} size="hero" delta={0.052} deltaLabel="so với quý trước" />`,
        render: () => <StatTile label="Khách hàng đang hoạt động" value={128450} size="hero" delta={0.052} deltaLabel="so với quý trước" />,
      },
    ],
    dos: [
      "Dùng StatTile khi dữ liệu là một con số hiện tại (+ xu hướng) — thay cho biểu đồ một cột.",
      "Ghi rõ kỳ so sánh của delta (“so với tháng trước”) và chọn goodDirection đúng ý nghĩa.",
      "Giữ sparkline ~12 điểm, xám làm nền, chỉ điểm hiện tại tô màu nhấn.",
    ],
    donts: [
      "Không dùng màu làm tín hiệu duy nhất cho delta — luôn có icon và số có dấu.",
      "Không đặt nhiều con số hero trên cùng một màn hình.",
      "Không dùng tabular-nums cho con số lớn đứng riêng.",
    ],
    props: [
      { name: "Sparkline.data", type: "(number | null)[]", description: "null tạo khoảng trống." },
      { name: "Sparkline.width / height", type: `number | "auto" / number`, defaultValue: "120 / 32", description: `"auto" = theo phần tử cha.` },
      { name: "Sparkline.variant", type: `"line" | "area"`, defaultValue: `"line"`, description: "Đường hoặc đường + vùng nhạt." },
      { name: "Sparkline.color", type: `"neutral" | 1–8`, defaultValue: `"neutral"`, description: "Xám làm nền hoặc ô màu phân loại." },
      { name: "Sparkline.highlightLast / labels", type: "boolean / string[]", defaultValue: "true", description: "Chấm điểm cuối; nhãn cho tooltip." },
      { name: "StatTile.label / value", type: "ReactNode / number | string", description: "Giá trị số tự rút gọn từ 10.000." },
      { name: "StatTile.delta / deltaFormat / deltaLabel", type: "number / format / ReactNode", description: "Thay đổi có dấu (mặc định phần trăm)." },
      { name: "StatTile.goodDirection", type: `"up" | "down" | "neutral"`, defaultValue: `"up"`, description: "Chiều nào là tốt." },
      { name: "StatTile.trend / trendLabels", type: "(number | null)[] / string[]", description: "Sparkline bên cạnh giá trị." },
      { name: "StatTile.size", type: `"medium" | "large" | "hero"`, defaultValue: `"medium"`, description: "28 / 40 / 68px." },
    ],
  },
];

export const docs: ComponentDoc[] = LABS_CHARTS;
