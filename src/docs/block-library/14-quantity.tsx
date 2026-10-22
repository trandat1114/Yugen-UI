import { useState } from "react";
import { Add20Regular, Delete20Regular, Subtract20Regular } from "@fluentui/react-icons";
import { Button, ButtonGroup, Card } from "@/components/ui";

export const meta = { title: "Chọn số lượng", description: "ButtonGroup tăng / giảm có nhãn, giới hạn min / max và aria-live", order: 14 };

const PRICE = 189_000;
const MAX = 10;

export default function QuantityBlock() {
  const [count, setCount] = useState(1);
  const total = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(PRICE * count);

  return (
    <Card className="max-w-md gap-L rounded-xlarge p-XL">
      <div className="flex items-start justify-between gap-M">
        <div className="min-w-0">
          <p className="text-subtitle2 font-semibold text-foreground-1">Ấm trà gốm Bát Tràng</p>
          <p className="text-caption1 text-foreground-3">Còn {MAX} sản phẩm</p>
        </div>
        <Button appearance="subtle" icon={<Delete20Regular />} aria-label="Xoá khỏi giỏ" onClick={() => setCount(0)} disabled={count === 0} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-M">
        <div className="flex items-center gap-M">
          <ButtonGroup>
            <Button icon={<Subtract20Regular />} aria-label="Giảm số lượng" onClick={() => setCount((c) => c - 1)} disabled={count === 0} />
            <Button icon={<Add20Regular />} aria-label="Tăng số lượng" onClick={() => setCount((c) => c + 1)} disabled={count === MAX} />
          </ButtonGroup>
          <p className="min-w-8 text-center font-display text-title3 font-semibold tabular-nums" aria-live="polite">
            <span className="sr-only">Số lượng: </span>
            {count}
          </p>
        </div>
        <p className="text-subtitle2 font-semibold tabular-nums text-foreground-1">{total}</p>
      </div>
    </Card>
  );
}
