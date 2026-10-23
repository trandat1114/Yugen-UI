import { ArrowTrendingDown16Regular, ArrowTrending16Regular } from "@fluentui/react-icons";
import { Badge, Card } from "@/components/ui";

export const meta = { title: "Thống kê", description: "Thẻ KPI kèm xu hướng và biểu đồ cột mini", order: 2 };

const STATS = [
  { label: "Doanh thu", value: "1,28 tỷ ₫", delta: "+12,4%", up: true, bars: [40, 55, 48, 62, 70, 66, 82] },
  { label: "Khách hàng mới", value: "2.341", delta: "+5,2%", up: true, bars: [30, 42, 38, 45, 52, 58, 61] },
  { label: "Tỉ lệ rời bỏ", value: "3,1%", delta: "−0,8%", up: false, bars: [60, 52, 55, 48, 44, 40, 36] },
];

export default function StatsBlock() {
  return (
    <div className="grid gap-3">
      {STATS.map((s) => (
        <Card key={s.label} className="flex-row items-end justify-between gap-4 rounded-xlarge p-4">
          <div className="min-w-0">
            <p className="text-caption1 text-foreground-3">{s.label}</p>
            <p className="mt-0.5 font-display text-title2 font-semibold tabular-nums">{s.value}</p>
            <Badge
              appearance="tint"
              color={s.up ? "success" : "danger"}
              icon={s.up ? <ArrowTrending16Regular className="rtl:-scale-x-100" /> : <ArrowTrendingDown16Regular className="rtl:-scale-x-100" />}
              className="mt-2"
            >
              {s.delta} so với tháng trước
            </Badge>
          </div>
          <div className="flex h-16 shrink-0 items-end gap-0.5" aria-hidden>
            {s.bars.map((h, i) => (
              <span
                key={i}
                className={i === s.bars.length - 1 ? "w-2 rounded-small bg-brand-background" : "w-2 rounded-small bg-brand-background-2-hover"}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
