import { useState } from "react";
import { Button, Calendar, Card, ToggleGroup, ToggleGroupItem } from "@/components/ui";

export const meta = { title: "Book an appointment", description: "Calendar with a ToggleGroup for time slots", order: 8 };

const SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];

export default function BookingBlock() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slot, setSlot] = useState("10:30");

  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">Book a consultation</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">Pick a day and a time that works for you (30 minutes).</p>
      </div>

      <div className="flex justify-center rounded-large border border-stroke-2 p-2">
        <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
      </div>

      <div>
        <p className="mb-2 text-body1 font-semibold">Time</p>
        <ToggleGroup
          type="single"
          value={slot}
          onValueChange={(v) => v && setSlot(v)}
          aria-label="Time"
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
        {date ? `Confirm ${slot} · ${date.toLocaleDateString("en-US", { dateStyle: "medium" })}` : "Pick a day"}
      </Button>
    </Card>
  );
}
