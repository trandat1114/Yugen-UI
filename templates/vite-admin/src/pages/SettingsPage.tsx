import * as React from "react";
import { SignOut20Regular } from "@fluentui/react-icons";
import { Button, Link as TextLink, Persona, Radio, RadioGroup, Slider, Switch, type YugenTheme } from "yugen-ui";
import { DEFAULT_MOCK_OPTIONS, RANDOM_ERROR_RATE } from "../api";
import { BRANDS, THEMES } from "../appearance";
import { useAuth } from "../auth";
import { useAdmin } from "../context";
import { Link, useRouter } from "../router";
import { PageHeader, Section } from "../ui";

function Choice<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (value: V) => void;
}) {
  const labelId = React.useId();
  return (
    <div className="flex flex-col gap-1">
      <span id={labelId} className="text-body1 font-semibold">
        {label}
      </span>
      <RadioGroup aria-labelledby={labelId} layout="horizontal" value={value} onValueChange={(v) => onChange(v as V)}>
        {options.map((option) => (
          <Radio key={option.value} value={option.value} label={option.label} />
        ))}
      </RadioGroup>
    </div>
  );
}

/** Appearance (saved), the mock API's latency and random errors, and the session. */
export default function SettingsPage() {
  const { t, appearance, setAppearance, mock, setMock } = useAdmin();
  const { session, signOut } = useAuth();
  const { navigate } = useRouter();
  const s = t.settings;
  const errorsHintId = React.useId();

  return (
    <>
      <PageHeader title={s.title} description={s.description} />
      <div className="grid items-start gap-4 @5xl/app:grid-cols-2">
        <Section title={s.appearance}>
          <Choice
            label={s.theme}
            value={appearance.theme}
            options={THEMES.map((theme: YugenTheme) => ({ value: theme, label: s.themes[theme] }))}
            onChange={(theme) => setAppearance({ theme })}
          />
          <Choice label={s.brand} value={appearance.brand} options={BRANDS} onChange={(brand) => setAppearance({ brand })} />
        </Section>

        <Section title={s.mockTitle} description={s.mockDescription}>
          <Slider
            label={s.latency}
            showValue
            min={0}
            max={3000}
            step={100}
            value={[mock.latency]}
            onValueChange={([latency]) => setMock({ latency })}
          />
          <div className="flex flex-col">
            <Switch
              label={s.randomErrors}
              checked={mock.errorRate > 0}
              onCheckedChange={(on) => setMock({ errorRate: on ? RANDOM_ERROR_RATE : 0 })}
              aria-describedby={errorsHintId}
            />
            <span id={errorsHintId} className="ps-12 text-caption1 text-foreground-3">
              {s.randomErrorsHint(Math.round(RANDOM_ERROR_RATE * 100))}
            </span>
          </div>
          <div>
            <Button onClick={() => setMock(DEFAULT_MOCK_OPTIONS)}>{s.reset}</Button>
          </div>
        </Section>

        <Section title={s.account} description={s.accountDescription}>
          {session && <Persona name={session.name} secondaryText={session.email} size="large" avatar={{ color: "brand" }} />}
          <div>
            <Button
              icon={<SignOut20Regular />}
              onClick={() => {
                signOut();
                navigate({ name: "signIn" });
              }}
            >
              {t.nav.signOut}
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-body1 text-foreground-2">{s.screens}</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-body1">
              <li>
                <TextLink asChild>
                  <Link to={{ name: "signIn" }}>{t.signIn.title}</Link>
                </TextLink>
              </li>
              <li>
                <TextLink asChild>
                  <Link to={{ name: "forgotPassword" }}>{t.forgot.title}</Link>
                </TextLink>
              </li>
              <li>
                <TextLink asChild>
                  <Link to={{ name: "verify" }}>{t.verify.title}</Link>
                </TextLink>
              </li>
            </ul>
          </div>
        </Section>
      </div>
    </>
  );
}
