import { Food20Regular, Cart20Regular, VehicleCar20Regular, Wallet20Regular, Video20Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, List, ListItem } from "yugen-ui";

export const meta = { title: "Giao dịch gần đây", description: "Danh sách List với icon, mô tả và số tiền", order: 6 };

const ITEMS = [
  { id: "1", icon: Food20Regular, title: "Quán cà phê Hoa Anh Đào", meta: "Ăn uống · Hôm nay", amount: -65_000 },
  { id: "2", icon: Cart20Regular, title: "Siêu thị Xanh", meta: "Mua sắm · Hôm qua", amount: -482_000 },
  { id: "3", icon: Wallet20Regular, title: "Lương tháng 10", meta: "Thu nhập · 15/10", amount: 28_500_000 },
  { id: "4", icon: VehicleCar20Regular, title: "Đặt xe công nghệ", meta: "Di chuyển · 14/10", amount: -96_000 },
  { id: "5", icon: Video20Regular, title: "Gói xem phim", meta: "Giải trí · 12/10", amount: -260_000 },
];

const money = (n: number) => (n > 0 ? "+" : "−") + Math.abs(n).toLocaleString("vi-VN") + " ₫";

export default function TransactionsBlock() {
  return (
    <Card size="large" className="gap-M rounded-xlarge p-XL">
      <div className="flex items-start justify-between gap-M">
        <div>
          <h3 className="text-subtitle1 font-semibold">Giao dịch gần đây</h3>
          <p className="mt-XXS text-body1 text-foreground-3">5 giao dịch trong 7 ngày qua.</p>
        </div>
        <Button appearance="transparent" size="small">
          Xem tất cả
        </Button>
      </div>

      <List aria-label="Giao dịch gần đây">
        {ITEMS.map(({ id, icon: Icon, title, meta: sub, amount }) => (
          <ListItem
            key={id}
            value={id}
            media={
              <span className="inline-flex size-9 items-center justify-center rounded-circular bg-brand-background-2 text-brand-foreground-2">
                <Icon />
              </span>
            }
            title={title}
            description={sub}
            actions={
              amount > 0 ? (
                <Badge appearance="tint" color="success" size="large">
                  {money(amount)}
                </Badge>
              ) : (
                <span className="text-body1 font-semibold tabular-nums">{money(amount)}</span>
              )
            }
          />
        ))}
      </List>
    </Card>
  );
}
