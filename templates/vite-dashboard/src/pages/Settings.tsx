import * as React from "react";
import { Button, Card, Radio, RadioGroup, Slider, Switch, toast, type YugenTheme } from "yugen-ui";
import { DEFAULT_MOCK_OPTIONS, type Scenario } from "../api";
import type { Rich } from "../content/types";
import { BRANDS, THEMES, useDashboard } from "../context";
import { CardTitle } from "../ui";

const SCENARIOS: Scenario[] = ["normal", "empty", "error"];

function Text({ parts }: { parts: Rich }) {
  return parts.map((part, i) =>
    typeof part === "string" ? (
      part
    ) : (
      <code key={i} className="rounded-small bg-background-4 px-1 font-mono text-[0.9em] text-foreground-1">
        {part.code}
      </code>
    ),
  );
}

function Section({ title, description, children }: { title: string; description: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card size="large" className="min-w-0 gap-4">
      <div>
        <CardTitle>{title}</CardTitle>
        <p className="mt-0.5 text-caption1 text-foreground-3">{description}</p>
      </div>
      {children}
    </Card>
  );
}

function Group({ label, children }: { label: string; children: (labelId: string) => React.ReactNode }) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-1">
      <p id={id} className="text-body1 font-semibold text-foreground-1">
        {label}
      </p>
      {children(id)}
    </div>
  );
}

function SwitchRow({ label, hint, checked, onCheckedChange }: { label: string; hint: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const hintId = React.useId();
  return (
    <div className="flex flex-col">
      <Switch label={label} checked={checked} onCheckedChange={onCheckedChange} aria-describedby={hintId} />
      <span id={hintId} className="ps-12 text-caption1 text-foreground-3">
        {hint}
      </span>
    </div>
  );
}

export default function Settings() {
  const { content: t, appearance, setAppearance, mock, setMock } = useDashboard();
  const s = t.settings;
  const [weekly, setWeekly] = React.useState(true);
  const [refundAlerts, setRefundAlerts] = React.useState(false);

  return (
    <div className="grid items-start gap-4 @4xl:grid-cols-2">
      <Section title={s.appearanceTitle} description={s.appearanceDescription}>
        <Group label={t.nav.mode}>
          {(id) => (
            <RadioGroup aria-labelledby={id} layout="horizontal" value={appearance.theme} onValueChange={(v) => setAppearance({ theme: v as YugenTheme })}>
              {THEMES.map((theme) => (
                <Radio key={theme} value={theme} label={t.themes[theme]} />
              ))}
            </RadioGroup>
          )}
        </Group>
        <Group label={t.nav.brand}>
          {(id) => (
            <RadioGroup aria-labelledby={id} layout="horizontal" value={appearance.brand} onValueChange={(v) => setAppearance({ brand: v })}>
              {BRANDS.map((b) => (
                <Radio key={b.value} value={b.value} label={b.label} />
              ))}
            </RadioGroup>
          )}
        </Group>
      </Section>

      <Section title={s.reportsTitle} description={s.reportsDescription}>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast({ intent: "success", title: s.saved, body: s.savedBody });
          }}
        >
          <SwitchRow label={s.weekly} hint={s.weeklyHint} checked={weekly} onCheckedChange={setWeekly} />
          <SwitchRow label={s.refundAlerts} hint={s.refundAlertsHint} checked={refundAlerts} onCheckedChange={setRefundAlerts} />
          <div>
            <Button type="submit" appearance="primary">
              {s.save}
            </Button>
          </div>
        </form>
      </Section>

      <Section title={s.mockTitle} description={<Text parts={s.mockDescription} />}>
        <Slider
          label={s.latency}
          showValue
          min={0}
          max={3000}
          step={100}
          value={[mock.latency]}
          onValueChange={([latency]) => setMock({ latency })}
        />
        <Group label={s.scenario}>
          {(id) => (
            <RadioGroup aria-labelledby={id} value={mock.scenario} onValueChange={(v) => setMock({ scenario: v as Scenario })}>
              {SCENARIOS.map((key) => (
                <Radio key={key} value={key} label={s.scenarios[key]} />
              ))}
            </RadioGroup>
          )}
        </Group>
        <div>
          <Button onClick={() => setMock(DEFAULT_MOCK_OPTIONS)}>{s.reset}</Button>
        </div>
      </Section>
    </div>
  );
}
