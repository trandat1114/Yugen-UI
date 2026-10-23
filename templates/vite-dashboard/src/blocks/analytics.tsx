import { useState } from "react";
import { Cart20Regular, Money20Regular, People20Regular, Receipt20Regular } from "@fluentui/react-icons";
import { AreaChart, BarChart, Card, DonutChart, StatTile, ToggleGroup, ToggleGroupItem } from "yugen-ui";

export const meta = {
  title: "Bảng phân tích",
  description: "KPI, xu hướng, xếp hạng và tỉ trọng — một bộ lọc thời gian cho mọi thẻ",
  order: 11,
};

type Range = "7" | "30" | "90";

const END = new Date(2026, 9, 20);

/** Dữ liệu mẫu: lượt khách theo ngày, kết thúc ngày 20/10/2026. */
function visitorsFor(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(END);
    date.setDate(END.getDate() - (days - 1 - i));
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    return {
      date,
      newVisitors: Math.round(620 + 140 * Math.sin(i / 3) + i * 4 - (weekend ? 120 : 0)),
      returning: Math.round(980 + 90 * Math.cos(i / 4) + i * 6 - (weekend ? 160 : 0)),
    };
  });
}

const RANGES: Record<Range, { label: string; scale: number; delta: [number, number, number, number] }> = {
  "7": { label: "7 ngày", scale: 1, delta: [0.084, 0.052, -0.004, 0.031] },
  "30": { label: "30 ngày", scale: 4.3, delta: [0.126, 0.091, 0.012, 0.027] },
  "90": { label: "90 ngày", scale: 12.8, delta: [0.214, 0.162, 0.018, 0.044] },
};

const CATEGORIES = [
  { category: "Âm thanh", revenue: 186 },
  { category: "Bàn phím & chuột", revenue: 142 },
  { category: "Màn hình", revenue: 121 },
  { category: "Phụ kiện bàn làm việc", revenue: 74 },
  { category: "Cáp & sạc", revenue: 39 },
];

const DEVICES = [
  { label: "Di động", value: 5820 },
  { label: "Máy tính", value: 3410 },
  { label: "Máy tính bảng", value: 940 },
];

export default function AnalyticsBlock() {
  const [range, setRange] = useState<Range>("30");
  const r = RANGES[range];
  const visitors = visitorsFor(Number(range));
  const orders = visitors.map((d) => Math.round((d.newVisitors + d.returning) * 0.034));
  const trend = orders.slice(-12);
  const totalOrders = orders.reduce((a, b) => a + b, 0);
  const totalVisitors = visitors.reduce((a, d) => a + d.newVisitors + d.returning, 0);

  return (
    <div className="@container flex flex-col gap-3">
      {/* Bộ lọc: một hàng phía trên, tác động mọi thẻ bên dưới */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-subtitle1 font-semibold">Tổng quan bán hàng</h3>
          <p className="text-caption1 text-foreground-3">Cập nhật 20/10/2026</p>
        </div>
        <ToggleGroup
          type="single"
          size="small"
          value={range}
          onValueChange={(v) => v && setRange(v as Range)}
          aria-label="Khoảng thời gian"
        >
          {(Object.keys(RANGES) as Range[]).map((key) => (
            <ToggleGroupItem key={key} value={key}>
              {RANGES[key].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-3 @lg:grid-cols-2">
        <Card size="large">
          <StatTile
            icon={<Money20Regular />}
            label="Doanh thu"
            value={totalOrders * 1450000}
            valueFormat={{ style: "currency", currency: "VND", notation: "compact", maximumFractionDigits: 1 }}
            delta={r.delta[0]}
            deltaLabel={`so với ${r.label} trước`}
            trend={trend}
          />
        </Card>
        <Card size="large">
          <StatTile
            icon={<Cart20Regular />}
            label="Đơn hàng"
            value={totalOrders}
            delta={r.delta[1]}
            deltaLabel={`so với ${r.label} trước`}
            trend={trend}
          />
        </Card>
        <Card size="large">
          <StatTile
            icon={<People20Regular />}
            label="Tỉ lệ chuyển đổi"
            value={totalOrders / totalVisitors}
            valueFormat={{ style: "percent", maximumFractionDigits: 2 }}
            delta={r.delta[2]}
            deltaLabel={`so với ${r.label} trước`}
          />
        </Card>
        <Card size="large">
          <StatTile
            icon={<Receipt20Regular />}
            label="Giá trị đơn trung bình"
            value={1450000 * (1 + r.delta[3])}
            valueFormat={{ style: "currency", currency: "VND", maximumFractionDigits: 0 }}
            delta={r.delta[3]}
            deltaLabel={`so với ${r.label} trước`}
          />
        </Card>
      </div>

      <Card size="large">
        <AreaChart
          title="Lượt khách"
          description={`${r.label} gần nhất`}
          data={visitors}
          index="date"
          stacked
          series={[
            { key: "returning", label: "Khách quay lại" },
            { key: "newVisitors", label: "Khách mới" },
          ]}
          height={240}
        />
      </Card>

      <div className="grid gap-3 @2xl:grid-cols-2">
        <Card size="large">
          <BarChart
            title="Doanh thu theo danh mục"
            description="Triệu ₫"
            data={CATEGORIES.map((c) => ({ ...c, revenue: Math.round(c.revenue * r.scale) }))}
            index="category"
            series={[{ key: "revenue", label: "Doanh thu" }]}
            orientation="horizontal"
            showValues
          />
        </Card>
        <Card size="large">
          <DonutChart
            title="Thiết bị"
            description="Tỉ trọng phiên truy cập"
            data={DEVICES.map((d) => ({ ...d, value: Math.round(d.value * r.scale) }))}
            size={168}
          />
        </Card>
      </div>
    </div>
  );
}
