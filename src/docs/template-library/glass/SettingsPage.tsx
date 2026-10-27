import * as React from "react";
import { Link as TextLink, Radio, RadioGroup, type YugenTheme } from "@/components/ui";
import { cn } from "@/lib/cn";
import { BRANDS, THEMES, type Appearance } from "./appearance";
import { PAGE_INSET } from "./HomePage";
import type { PageProps } from "./Layout";
import { PHOTOS } from "./photos";

function Section({ title, heading, children }: { title: React.ReactNode; heading: "h2" | "h3"; children: React.ReactNode }) {
  const id = React.useId();
  const H = heading;
  return (
    <section aria-labelledby={id} className="rounded-3xlarge border border-stroke-2 bg-background-1 p-5 shadow-2">
      <H id={id} className="text-subtitle2 font-semibold">
        {title}
      </H>
      <div className="mt-3 flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Choice<V extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (value: V) => void;
}) {
  const labelId = React.useId();
  const hintId = React.useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-body1 font-semibold">
        {label}
      </span>
      <RadioGroup
        aria-labelledby={labelId}
        aria-describedby={hint ? hintId : undefined}
        layout="horizontal"
        value={value}
        onValueChange={(v) => onChange(v as V)}
      >
        {options.map((option) => (
          <Radio key={option.value} value={option.value} label={option.label} />
        ))}
      </RadioGroup>
      {hint && (
        <p id={hintId} className="text-caption1 text-foreground-3">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Appearance (saved), what glass does for accessibility, and the photo credits. */
export default function SettingsPage({ t, appearance, onAppearanceChange, embedded }: PageProps) {
  const H1 = embedded ? "h2" : "h1";
  const H2 = embedded ? "h3" : "h2";
  const set = <K extends keyof Appearance>(key: K) => (value: Appearance[K]) => onAppearanceChange({ [key]: value });

  return (
    <div className={cn("mx-auto flex max-w-3xl flex-col gap-4 pt-24 @3xl/app:pt-8", PAGE_INSET)}>
      <H1 className="font-display text-title2 font-semibold">{t.settings.title}</H1>

      <Section title={t.settings.appearance} heading={H2}>
        <Choice
          label={t.settings.theme}
          value={appearance.theme}
          options={THEMES.map((theme: YugenTheme) => ({ value: theme, label: t.settings.themes[theme] }))}
          onChange={set("theme")}
        />
        <Choice label={t.settings.brand} value={appearance.brand} options={BRANDS} onChange={set("brand")} />
        <Choice
          label={t.settings.material}
          hint={t.settings.materialHint}
          value={appearance.material}
          options={[
            { value: "glass", label: t.settings.materials.glass },
            { value: "solid", label: t.settings.materials.solid },
          ]}
          onChange={set("material")}
        />
        <Choice
          label={t.settings.overMedia}
          hint={t.settings.overMediaHint}
          value={appearance.overMedia}
          options={[
            { value: "clear", label: t.settings.overMediaOptions.clear },
            { value: "regular", label: t.settings.overMediaOptions.regular },
          ]}
          onChange={set("overMedia")}
        />
      </Section>

      <Section title={t.settings.accessibility} heading={H2}>
        <ul className="list-disc ps-5 text-body1 text-foreground-2">
          {t.settings.accessibilityItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={t.settings.credits} heading={H2}>
        <p className="text-body1 text-foreground-2">{t.settings.creditsLead}</p>
        <ul className="grid gap-1 text-body1 @xl/app:grid-cols-2">
          {Object.values(PHOTOS).map((photo) => (
            <li key={photo.source}>
              <TextLink href={photo.source} external>
                {t.settings.photoBy(photo.author)}
              </TextLink>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
