import { Add16Regular } from "@fluentui/react-icons";
import { Button, Card, ProgressBar } from "yugen-ui";

export const meta = { title: "Mục tiêu tiết kiệm", description: "Theo dõi tiến độ bằng ProgressBar", order: 7 };

const GOALS = [
  { name: "Quỹ hưu trí", saved: 420, target: 600, color: "brand" as const },
  { name: "Du lịch Kyoto mùa hoa", saved: 68, target: 85, color: "success" as const },
  { name: "Quỹ khẩn cấp", saved: 21, target: 100, color: "warning" as const },
];

export default function SavingsBlock() {
  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-subtitle1 font-semibold">Mục tiêu tiết kiệm</h3>
          <p className="mt-0.5 text-body1 text-foreground-3">Các mốc đang theo dõi năm 2026 (triệu ₫).</p>
        </div>
        <Button size="small" icon={<Add16Regular />}>
          Thêm
        </Button>
      </div>

      {GOALS.map((g) => {
        const pct = Math.round((g.saved / g.target) * 100);
        return (
          <div key={g.name} className="rounded-large bg-background-2 p-3">
            <div className="flex items-baseline justify-between">
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{g.name}</p>
              <p className="text-caption1 text-foreground-3">{pct}%</p>
            </div>
            <p className="mt-1 font-display text-title2 font-semibold tabular-nums">
              {g.saved}
              <span className="text-body1 font-normal text-foreground-3"> / {g.target} triệu</span>
            </p>
            <ProgressBar value={g.saved / g.target} thickness="large" color={g.color} className="mt-2" aria-label={g.name} />
          </div>
        );
      })}
    </Card>
  );
}
