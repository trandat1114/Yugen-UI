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
  { month: "May", online: 420000, store: 310000 },
  { month: "Jun", online: 465000, store: 298000 },
  { month: "Jul", online: 510000, store: 325000 },
  { month: "Aug", online: 488000, store: 340000 },
  { month: "Sep", online: 560000, store: 352000 },
  { month: "Oct", online: 615000, store: 360000 },
];

const topProducts = [
  { product: "Sora wireless headphones", sold: 1840 },
  { product: "Kohaku mechanical keyboard", sold: 1325 },
  { product: "Ergonomic mouse", sold: 1190 },
  { product: "27-inch 4K monitor", sold: 860 },
  { product: "Aluminum laptop stand", sold: 640 },
];

const quarterly = [
  { quarter: "Q1", hardware: 320, software: 210, services: 140 },
  { quarter: "Q2", hardware: 285, software: 245, services: 160 },
  { quarter: "Q3", hardware: 340, software: 270, services: 175 },
  { quarter: "Q4", hardware: 395, software: 310, services: 210 },
];

const profit = [
  { month: "May", profit: 120 },
  { month: "Jun", profit: -45 },
  { month: "Jul", profit: 80 },
  { month: "Aug", profit: -20 },
  { month: "Sep", profit: 150 },
  { month: "Oct", profit: 95 },
];

const channels = [
  { region: "North", web: 42, app: 35, store: 23 },
  { region: "Central", web: 30, app: 28, store: 42 },
  { region: "South", web: 46, app: 38, store: 16 },
];

const traffic = [
  { month: "Jan", search: 4200, social: 2100, direct: 1500 },
  { month: "Feb", search: 4350, social: 2600, direct: 1550 },
  { month: "Mar", search: 4800, social: 2450, direct: 1620 },
  { month: "Apr", search: 5100, social: 3100, direct: 1700 },
  { month: "May", search: 5050, social: 3600, direct: 1680 },
  { month: "Jun", search: 5600, social: 3900, direct: 1810 },
  { month: "Jul", search: 6100, social: 3700, direct: 1900 },
  { month: "Aug", search: 6400, social: 4200, direct: 1950 },
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
  { week: "Week 1", users: 8200 },
  { week: "Week 2", users: 8650 },
  { week: "Week 3", users: 9100 },
  { week: "Week 4", users: 8900 },
  { week: "Week 5", users: 9800 },
  { week: "Week 6", users: 10400 },
  { week: "Week 7", users: 11200 },
];

const storage = [
  { month: "May", photos: 18, videos: 22, docs: 6 },
  { month: "Jun", photos: 21, videos: 26, docs: 6 },
  { month: "Jul", photos: 24, videos: 31, docs: 7 },
  { month: "Aug", photos: 27, videos: 35, docs: 8 },
  { month: "Sep", photos: 30, videos: 38, docs: 8 },
  { month: "Oct", photos: 32, videos: 41, docs: 9 },
];

const productLines = [
  { month: "May", basic: 210, pro: 120, team: 90, enterprise: 60 },
  { month: "Jun", basic: 205, pro: 135, team: 95, enterprise: 62 },
  { month: "Jul", basic: 215, pro: 160, team: 92, enterprise: 66 },
  { month: "Aug", basic: 208, pro: 190, team: 98, enterprise: 65 },
  { month: "Sep", basic: 212, pro: 230, team: 101, enterprise: 70 },
  { month: "Oct", basic: 206, pro: 265, team: 104, enterprise: 72 },
];

const sources = [
  { label: "Search", value: 4200 },
  { label: "Social", value: 2800 },
  { label: "Referral", value: 1800 },
  { label: "Email", value: 1200 },
];

const provinces = [
  { label: "Tokyo", value: 3820 },
  { label: "Osaka", value: 3410 },
  { label: "Kyoto", value: 1240 },
  { label: "Yokohama", value: 980 },
  { label: "Nagoya", value: 760 },
  { label: "Sapporo", value: 420 },
  { label: "Fukuoka", value: 390 },
  { label: "Kobe", value: 310 },
  { label: "Nara", value: 260 },
];

const usage = [
  { label: "Videos", value: 41 },
  { label: "Photos", value: 32 },
  { label: "Documents", value: 9 },
  { label: "Apps", value: 6 },
];

const revenueTrend = [62, 68, 64, 71, 75, 73, 80, 84, 82, 90, 96, 104];
const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
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
  title="Revenue by channel"
  description="Last 6 months"
  data={revenue}
  index="month"
  series={[
    { key: "online", label: "Online" },
    { key: "store", label: "In store" },
  ]}
  valueFormat={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
  locale="en-US"
/>`,
      render: () => (
        <BarChart
          title="Revenue by channel"
          description="Last 6 months"
          data={revenue}
          index="month"
          series={[
            { key: "online", label: "Online" },
            { key: "store", label: "In store" },
          ]}
          valueFormat={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
          locale="en-US"
        />
      ),
    },
    examples: [
      {
        title: "Thanh ngang & nhãn giá trị",
        description: "Nhiều danh mục hoặc tên dài → thanh ngang. Một chuỗi nên không có legend; giá trị nằm ở đầu thanh.",
        code: `const topProducts = ${lit(topProducts)};

<BarChart
  title="Best sellers"
  data={topProducts}
  index="product"
  series={[{ key: "sold", label: "Units sold" }]}
  orientation="horizontal"
  showValues
  locale="en-US"
/>`,
        render: () => (
          <BarChart
            title="Best sellers"
            data={topProducts}
            index="product"
            series={[{ key: "sold", label: "Units sold" }]}
            orientation="horizontal"
            showValues
            locale="en-US"
          />
        ),
      },
      {
        title: "Cột chồng",
        description: "Phần–tổng theo danh mục; khe 2px giữa các đoạn, chỉ đoạn ngoài cùng bo góc. Tooltip liệt kê mọi đoạn và tổng.",
        code: `const quarterly = ${lit(quarterly)};

<BarChart
  title="Revenue by segment ($K)"
  data={quarterly}
  index="quarter"
  layout="stacked"
  series={[
    { key: "hardware", label: "Hardware" },
    { key: "software", label: "Software" },
    { key: "services", label: "Services" },
  ]}
  showValues
  locale="en-US"
/>`,
        render: () => (
          <BarChart
            title="Revenue by segment ($K)"
            data={quarterly}
            index="quarter"
            layout="stacked"
            series={[
              { key: "hardware", label: "Hardware" },
              { key: "software", label: "Software" },
              { key: "services", label: "Services" },
            ]}
            showValues
            locale="en-US"
          />
        ),
      },
      {
        title: "Giá trị âm (phân kỳ)",
        description: "Cột mọc hai phía đường gốc 0. diverging tô hai cực Sakura ↔ Ai; vị trí đã mã hoá dấu, màu chỉ nhấn thêm.",
        code: `const profit = ${lit(profit)};

<BarChart
  title="Net profit ($K)"
  data={profit}
  index="month"
  series={[{ key: "profit", label: "Profit" }]}
  diverging
  locale="en-US"
/>`,
        render: () => (
          <BarChart
            title="Net profit ($K)"
            data={profit}
            index="month"
            series={[{ key: "profit", label: "Profit" }]}
            diverging
            locale="en-US"
          />
        ),
      },
      {
        title: "Hoa văn (texture)",
        description: "Kênh dự phòng cho mù màu toàn phần, in ấn và forced-colors: hoa văn 45° / 135°. Tự bật ở theme Tương phản cao.",
        code: `const channels = ${lit(channels)};

<BarChart
  title="Sales channel mix (%)"
  data={channels}
  index="region"
  series={[
    { key: "web", label: "Website" },
    { key: "app", label: "App" },
    { key: "store", label: "In store" },
  ]}
  texture
  locale="en-US"
/>`,
        render: () => (
          <BarChart
            title="Sales channel mix (%)"
            data={channels}
            index="region"
            series={[
              { key: "web", label: "Website" },
              { key: "app", label: "App" },
              { key: "store", label: "In store" },
            ]}
            texture
            locale="en-US"
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
  title="Visits by source"
  description="January – August"
  data={traffic}
  index="month"
  series={[
    { key: "search", label: "Search" },
    { key: "social", label: "Social" },
    { key: "direct", label: "Direct" },
  ]}
  locale="en-US"
/>`,
      render: () => (
        <LineChart
          title="Visits by source"
          description="January – August"
          data={traffic}
          index="month"
          series={[
            { key: "search", label: "Search" },
            { key: "social", label: "Social" },
            { key: "direct", label: "Direct" },
          ]}
          locale="en-US"
        />
      ),
    },
    examples: [
      {
        title: "Trục thời gian & điểm đánh dấu",
        description: "index là Date → vị trí theo thời gian thực, nhãn trục định dạng bằng Intl (vi-VN). markers vẽ chấm ≥ 8px có viền bề mặt.",
        code: `const visits = ${lit(visits)};

<LineChart
  title="Daily visits"
  data={visits}
  index="date"
  series={[{ key: "visits", label: "Visits" }]}
  markers
  locale="en-US"
/>`,
        render: () => (
          <LineChart title="Daily visits" data={visits} index="date" series={[{ key: "visits", label: "Visits" }]} markers locale="en-US" />
        ),
      },
      {
        title: "AreaChart",
        description: "Một chuỗi: vùng phủ nhạt dưới đường, trục Y luôn từ 0. Giá trị cuối được ghi trực tiếp.",
        code: `const activeUsers = ${lit(activeUsers)};

<AreaChart
  title="Active users"
  data={activeUsers}
  index="week"
  series={[{ key: "users", label: "Users" }]}
  locale="en-US"
/>`,
        render: () => (
          <AreaChart title="Active users" data={activeUsers} index="week" series={[{ key: "users", label: "Users" }]} locale="en-US" />
        ),
      },
      {
        title: "Vùng chồng",
        description: "stacked cộng dồn các chuỗi — phần–tổng theo thời gian; tooltip có thêm dòng Tổng.",
        code: `const storage = ${lit(storage)};

<AreaChart
  title="Storage used (GB)"
  data={storage}
  index="month"
  stacked
  series={[
    { key: "videos", label: "Videos" },
    { key: "photos", label: "Photos" },
    { key: "docs", label: "Documents" },
  ]}
  locale="en-US"
/>`,
        render: () => (
          <AreaChart
            title="Storage used (GB)"
            data={storage}
            index="month"
            stacked
            series={[
              { key: "videos", label: "Videos" },
              { key: "photos", label: "Photos" },
              { key: "docs", label: "Documents" },
            ]}
            locale="en-US"
          />
        ),
      },
      {
        title: "Nhấn mạnh một chuỗi",
        description: "Khi câu chuyện là “gói Pro tăng mạnh”: highlight tô màu một chuỗi, phần còn lại về xám làm nền.",
        code: `const productLines = ${lit(productLines)};

<LineChart
  title="Subscriptions by plan"
  data={productLines}
  index="month"
  highlight="pro"
  series={[
    { key: "basic", label: "Basic" },
    { key: "pro", label: "Pro" },
    { key: "team", label: "Team" },
    { key: "enterprise", label: "Enterprise" },
  ]}
  locale="en-US"
/>`,
        render: () => (
          <LineChart
            title="Subscriptions by plan"
            data={productLines}
            index="month"
            highlight="pro"
            series={[
              { key: "basic", label: "Basic" },
              { key: "pro", label: "Pro" },
              { key: "team", label: "Team" },
              { key: "enterprise", label: "Enterprise" },
            ]}
            locale="en-US"
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

<DonutChart title="Customer sources" description="October" data={sources} locale="en-US" />`,
      render: () => <DonutChart title="Customer sources" description="October" data={sources} locale="en-US" />,
    },
    examples: [
      {
        title: "Gộp phần đuôi vào “Khác”",
        description: "9 nhóm → 5 nhóm lớn nhất + “Khác” màu xám trung tính. Bảng dữ liệu vẫn giữ con số gộp.",
        code: `const provinces = ${lit(provinces)};

<DonutChart title="Orders by city" data={provinces} valueFormat={{ maximumFractionDigits: 0 }} locale="en-US" />`,
        render: () => <DonutChart title="Orders by city" data={provinces} valueFormat={{ maximumFractionDigits: 0 }} locale="en-US" />,
      },
      {
        title: "Nhãn giữa tuỳ biến",
        description: "centerValue / centerLabel thay cho tổng mặc định; size và thickness đổi kích thước vòng.",
        code: `const usage = ${lit(usage)};

<DonutChart
  title="Storage"
  data={usage}
  valueFormat={{ style: "unit", unit: "gigabyte" }}
  centerValue="88 GB"
  centerLabel="used of 128 GB"
  size={168}
  thickness={18}
  locale="en-US"
/>`,
        render: () => (
          <DonutChart
            title="Storage"
            data={usage}
            valueFormat={{ style: "unit", unit: "gigabyte" }}
            centerValue="88 GB"
            centerLabel="used of 128 GB"
            size={168}
            thickness={18}
            locale="en-US"
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
      { name: "otherLabel", type: "string", defaultValue: `"Other"`, description: "Nhãn lát gộp." },
      { name: "centerValue / centerLabel", type: "ReactNode", defaultValue: `tổng / "Total"`, description: "Nội dung giữa vòng." },
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
  label="Monthly revenue"
  value={1284000}
  valueFormat={{ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }}
  delta={0.124}
  deltaLabel="vs last month"
  trend={revenueTrend}
  trendLabels={months}
  className="w-80"
  locale="en-US"
/>`,
      render: () => (
        <StatTile
          label="Monthly revenue"
          value={1284000}
          valueFormat={{ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }}
          delta={0.124}
          deltaLabel="vs last month"
          trend={revenueTrend}
          trendLabels={months}
          className="w-80"
          locale="en-US"
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
  Revenue <Sparkline data={revenueTrend} labels={months} width={96} height={24} /> grew steadily over 12 months.
</p>`,
        render: () => (
          <p className="text-body1 text-foreground-2">
            Revenue <Sparkline data={revenueTrend} labels={months} width={96} height={24} /> grew steadily over 12 months.
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
  label="Churn rate"
  value={0.031}
  valueFormat={{ style: "percent", maximumFractionDigits: 1 }}
  delta={-0.008}
  deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }}
  deltaLabel="vs last month"
  goodDirection="down"
  trend={churnTrend}
  className="w-72"
  locale="en-US"
/>`,
        render: () => (
          <StatTile
            label="Churn rate"
            value={0.031}
            valueFormat={{ style: "percent", maximumFractionDigits: 1 }}
            delta={-0.008}
            deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }}
            deltaLabel="vs last month"
            goodDirection="down"
            trend={churnTrend}
            className="w-72"
            locale="en-US"
          />
        ),
      },
      {
        title: "Con số hero",
        description: "size=\"extra-large\" (68px, cùng font sans) cho con số duy nhất mà màn hình dẫn dắt.",
        code: `<StatTile label="Active customers" value={128450} size="extra-large" delta={0.052} deltaLabel="vs last quarter" locale="en-US" />`,
        render: () => <StatTile label="Active customers" value={128450} size="extra-large" delta={0.052} deltaLabel="vs last quarter" locale="en-US" />,
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
      { name: "Sparkline.width / height", type: `number | "auto" / number`, defaultValue: "120 / 32", description: `"auto" = theo phần tử cha (đo bằng ResizeObserver); một số thì không đo gì.` },
      { name: "Sparkline.variant", type: `"line" | "area"`, defaultValue: `"line"`, description: "Đường hoặc đường + vùng nhạt." },
      { name: "Sparkline.color", type: `"neutral" | 1–8`, defaultValue: `"neutral"`, description: "Xám làm nền hoặc ô màu phân loại." },
      { name: "Sparkline.highlightLast / labels", type: "boolean / string[]", defaultValue: "true", description: "Chấm điểm cuối; nhãn cho tooltip." },
      { name: "StatTile.label / value", type: "ReactNode / number | string", description: "Giá trị số tự rút gọn từ 10.000." },
      { name: "StatTile.delta / deltaFormat / deltaLabel", type: "number / format / ReactNode", description: "Thay đổi có dấu (mặc định phần trăm)." },
      { name: "StatTile.goodDirection", type: `"up" | "down" | "neutral"`, defaultValue: `"up"`, description: "Chiều nào là tốt." },
      { name: "StatTile.trend / trendLabels", type: "(number | null)[] / string[]", description: "Sparkline bên cạnh giá trị." },
      { name: "StatTile.size", type: `"medium" | "large" | "extra-large"`, defaultValue: `"medium"`, description: "28 / 40 / 68px." },
    ],
  },
];

export const docs: ComponentDoc[] = LABS_CHARTS;
