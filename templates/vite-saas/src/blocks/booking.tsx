import { useState } from "react";
import { Button, Calendar, Card, ToggleGroup, ToggleGroupItem } from "yugen-ui";

export const meta = { title: "Đặt lịch hẹn", description: "Calendar kết hợp ToggleGroup chọn khung giờ", order: 8 };

const SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];

export default function BookingBlock() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slot, setSlot] = useState("10:30");

  return (
    <Card size="large" className="gap-L rounded-xlarge p-XL">
      <div>
        <h3 className="text-subtitle1 font-semibold">Đặt lịch tư vấn</h3>
        <p className="mt-XXS text-body1 text-foreground-3">Chọn ngày và khung giờ phù hợp (30 phút).</p>
      </div>

      <div className="flex justify-center rounded-large border border-stroke-2 p-S">
        <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
      </div>

      <div>
        <p className="mb-S text-body1 font-semibold">Khung giờ</p>
        <ToggleGroup
          type="single"
          value={slot}
          onValueChange={(v) => v && setSlot(v)}
          aria-label="Khung giờ"
          className="grid grid-cols-3"
        >
          {SLOTS.map((s) => (
            <ToggleGroupItem key={s} value={s}>
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Button appearance="primary" disabled={!date} className="w-full">
        {date ? `Xác nhận ${slot} · ${date.toLocaleDateString("vi-VN")}` : "Chọn ngày"}
      </Button>
    </Card>
  );
}
