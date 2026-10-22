import { useState } from "react";
import { Badge, Card, ProgressBar, Slider } from "@/components/ui";

export const meta = { title: "Tiến độ dự án", description: "Slider điều khiển ProgressBar; màu success khi hoàn thành", order: 16 };

export default function ProjectProgressBlock() {
  const [value, setValue] = useState([64]);
  const done = value[0] === 100;

  return (
    <Card className="max-w-md gap-L rounded-xlarge p-XL">
      <div className="flex items-center justify-between gap-M">
        <p className="text-subtitle2 font-semibold text-foreground-1">Ra mắt website mới</p>
        <Badge appearance="tint" color={done ? "success" : "brand"}>
          {done ? "Hoàn thành" : "Đang làm"}
        </Badge>
      </div>
      <Slider label="Mức hoàn thành" showValue value={value} onValueChange={setValue} max={100} />
      <ProgressBar value={value[0] / 100} thickness="large" aria-label="Tiến độ dự án" color={done ? "success" : "brand"} />
      <p className="text-caption1 text-foreground-3">Kéo thanh trượt hoặc dùng phím mũi tên để cập nhật.</p>
    </Card>
  );
}
