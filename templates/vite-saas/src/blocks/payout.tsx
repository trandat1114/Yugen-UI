import { useState } from "react";
import { Button, Card, Input, MessageBar, Slider } from "yugen-ui";

export const meta = { title: "Ngưỡng thanh toán", description: "Cấu hình số tiền tối thiểu với Slider và ghi chú", order: 3 };

const format = (n: number) => n.toLocaleString("vi-VN") + " ₫";

export default function PayoutBlock() {
  const [amount, setAmount] = useState([2_500_000]);

  return (
    <Card size="large" className="gap-L rounded-xlarge p-XL">
      <div>
        <h3 className="text-subtitle1 font-semibold">Ngưỡng thanh toán</h3>
        <p className="mt-XXS text-body1 text-foreground-3">Số dư tối thiểu trước khi hệ thống chuyển tiền.</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-body1">Số tiền tối thiểu</span>
          <span className="font-display text-title3 font-semibold tabular-nums">{format(amount[0])}</span>
        </div>
        <Slider
          aria-label="Số tiền tối thiểu"
          value={amount}
          onValueChange={setAmount}
          min={500_000}
          max={10_000_000}
          step={500_000}
        />
        <div className="flex justify-between text-caption1 text-foreground-3">
          <span>{format(500_000)}</span>
          <span>{format(10_000_000)}</span>
        </div>
      </div>

      <Input label="Ghi chú" placeholder="Thêm ghi chú cho cấu hình này…" />

      <MessageBar intent="info">Số dư vượt ngưỡng sẽ được chuyển vào ngày 15 hằng tháng.</MessageBar>

      <div className="flex justify-end gap-S">
        <Button>Huỷ</Button>
        <Button appearance="primary">Lưu cấu hình</Button>
      </div>
    </Card>
  );
}
