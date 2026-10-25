import { useState } from "react";
import { Button, Card, Divider, Field, Radio, RadioGroup, Select, Switch, Textarea, toast } from "@/components/ui";
import type { PageProps } from "../pages";

function Preferences({ t }: PageProps) {
  const c = t.preferences;
  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">{c.description}</p>
      </div>

      <Field label={c.currencyLabel} hint={c.currencyHint}>
        <Select defaultValue={c.defaultCurrency}>
          {c.currencies.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <Divider />

      <ul className="flex flex-col gap-3">
        {c.settings.map((s) => (
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
        <Button appearance="primary" onClick={() => toast({ intent: "success", ...c.toast })}>
          {c.save}
        </Button>
      </div>
    </Card>
  );
}

function Feedback({ t }: PageProps) {
  const c = t.feedback;
  const [topic, setTopic] = useState("feature");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const tooShort = message.trim().length < 10;

  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">{c.description}</p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (tooShort) return;
          toast({ intent: "success", ...c.toast });
          setMessage("");
          setSubmitted(false);
        }}
      >
        <Field label={c.topic}>
          {(props) => (
            <RadioGroup {...props} value={topic} onValueChange={setTopic} layout="horizontal">
              <Radio value="feature" label={c.topics.feature} />
              <Radio value="bug" label={c.topics.bug} />
              <Radio value="other" label={c.topics.other} />
            </RadioGroup>
          )}
        </Field>

        <Field
          label={c.message}
          required
          validationState={submitted && tooShort ? "error" : "none"}
          validationMessage={submitted && tooShort ? c.tooShort : undefined}
          hint={`${message.length}/500`}
        >
          <Textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 500))} placeholder={c.placeholder} rows={4} />
        </Field>

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => setMessage("")}>
            {c.clear}
          </Button>
          <Button type="submit" appearance="primary">
            {c.submit}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function SettingsPage({ t }: PageProps) {
  return (
    <div className="grid items-start gap-4 @3xl:grid-cols-2">
      <Preferences t={t} />
      <Feedback t={t} />
    </div>
  );
}
