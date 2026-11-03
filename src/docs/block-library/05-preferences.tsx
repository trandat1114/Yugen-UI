import { Button, Card, Divider, Field, Select, Switch, toast } from "@/components/ui";

export const meta = { title: "Preferences", description: "Account settings with Select, Switch and Toast", order: 5 };

const SETTINGS = [
  { id: "public", label: "Public stats", hint: "Let others see your total plays.", on: true },
  { id: "email", label: "Email notifications", hint: "Monthly reports and billing updates.", on: true },
  { id: "beta", label: "Beta features", hint: "Try features that are still in development.", on: false },
];

export default function PreferencesBlock() {
  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">Preferences</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">Manage your account and notification settings.</p>
      </div>

      <Field label="Default currency" hint="Used for new reports and invoices.">
        <Select defaultValue="usd">
          <option value="usd">USD — US dollar</option>
          <option value="eur">EUR — Euro</option>
          <option value="jpy">JPY — Japanese yen</option>
        </Select>
      </Field>

      <Divider />

      <ul className="flex flex-col gap-3">
        {SETTINGS.map((s) => (
          <li key={s.id} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-body1 font-semibold">{s.label}</p>
              <p className="text-caption1 text-foreground-3">{s.hint}</p>
            </div>
            <Switch aria-label={s.label} defaultChecked={s.on} />
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <Button
          appearance="primary"
          onClick={() => toast({ intent: "success", title: "Preferences saved", body: "Your changes apply right away." })}
        >
          Save changes
        </Button>
      </div>
    </Card>
  );
}
