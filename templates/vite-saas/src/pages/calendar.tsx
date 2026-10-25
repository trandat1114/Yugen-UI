import { useState } from "react";
import { Button, Calendar, Card, ToggleGroup, ToggleGroupItem } from "yugen-ui";
import type { PageProps } from "../pages";

export default function CalendarPage({ t }: PageProps) {
  const c = t.booking;
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slot, setSlot] = useState(c.slots[1]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card size="large" className="gap-4 rounded-xlarge p-5">
        <div>
          <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
          <p className="mt-0.5 text-body1 text-foreground-3">{c.description}</p>
        </div>

        <div className="flex justify-center rounded-large border border-stroke-2 p-2">
          <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
        </div>

        <div>
          <p className="mb-2 text-body1 font-semibold">{c.slotsLabel}</p>
          <ToggleGroup type="single" value={slot} onValueChange={(v) => v && setSlot(v)} aria-label={c.slotsLabel} className="grid grid-cols-3">
            {c.slots.map((s) => (
              <ToggleGroupItem key={s} value={s}>
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Button appearance="primary" disabled={!date} className="w-full">
          {date ? c.confirm(slot, date.toLocaleDateString(t.locale)) : c.pickDate}
        </Button>
      </Card>
    </div>
  );
}
