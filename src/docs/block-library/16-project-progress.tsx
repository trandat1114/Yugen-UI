import { useState } from "react";
import { Badge, Card, ProgressBar, Slider } from "@/components/ui";

export const meta = { title: "Project progress", description: "A Slider drives a ProgressBar that turns success when complete", order: 16 };

export default function ProjectProgressBlock() {
  const [value, setValue] = useState([64]);
  const done = value[0] === 100;

  return (
    <Card className="max-w-md gap-4 rounded-xlarge p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-subtitle2 font-semibold text-foreground-1">New website launch</p>
        <Badge appearance="tint" color={done ? "success" : "brand"}>
          {done ? "Done" : "In progress"}
        </Badge>
      </div>
      <Slider label="Completion" showValue value={value} onValueChange={setValue} max={100} />
      <ProgressBar value={value[0] / 100} thickness="large" aria-label="Project progress" color={done ? "success" : "brand"} />
      <p className="text-caption1 text-foreground-3">Drag the slider or use the arrow keys to update it.</p>
    </Card>
  );
}
