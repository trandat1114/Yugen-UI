import * as React from "react";
import { ArrowLeft20Regular, Heart20Regular, Map20Regular, Share20Regular } from "@fluentui/react-icons";
import {
  Button,
  Link as TextLink,
  Radio,
  RadioGroup,
  Tabs,
  TabsList,
  TabsTrigger,
  Toolbar,
  ToolbarButton,
  type YugenTheme,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { BRANDS, THEMES, type Appearance } from "./appearance";
import { PAGE_INSET } from "./HomePage";
import type { PageProps } from "./Layout";
import { PHOTOS, type PhotoKey } from "./photos";
import { PhotoImage } from "./Photo";

/** Photos behind the preview, with the trip they come from: bright, dense blossoms, night. Glass stays legible over all three. */
const PREVIEW_PHOTOS = {
  day: { photo: "hirosakiBridge", trip: "hirosaki" },
  petals: { photo: "gionWeeping", trip: "kyoto" },
  night: { photo: "kiyomizuNight", trip: "kyoto" },
} satisfies Record<string, { photo: PhotoKey; trip: string }>;
type PreviewPhoto = keyof typeof PREVIEW_PHOTOS;

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

/**
 * What the Appearance options do to controls over a photo: the same bars, tabs and buttons as the trip and Explore
 * pages. The controls are a picture of the result (inert), not something to use.
 */
function Preview({ t, appearance, photo }: { t: PageProps["t"]; appearance: Appearance; photo: PreviewPhoto }) {
  const clear = appearance.overMedia === "clear";
  const media = clear ? "glass-clear" : "glass";
  const inert = React.useCallback((node: HTMLDivElement | null) => node?.setAttribute("inert", ""), []);
  return (
    <figure aria-label={t.settings.preview} className="relative isolate h-64 overflow-hidden rounded-3xlarge @xl/app:h-80">
      <PhotoImage photo={PHOTOS[PREVIEW_PHOTOS[photo].photo]} alt="" sizes="(min-width: 768px) 720px, 100vw" className="absolute inset-0 -z-10 size-full" />
      {clear && <div aria-hidden className="glass-scrim absolute inset-0 -z-10" />}
      <div ref={inert} className="flex h-full flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <Toolbar material={media} aria-label={t.trip.actions}>
            <ToolbarButton icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />} aria-label={t.trip.back} />
            <span className="px-2 text-body1 font-semibold whitespace-nowrap">{t.trips[PREVIEW_PHOTOS[photo].trip].title}</span>
          </Toolbar>
          <Toolbar material={media} aria-label={t.trip.actions} className="max-[22rem]:hidden">
            <ToolbarButton icon={<Share20Regular />} aria-label={t.trip.share} />
            <ToolbarButton icon={<Heart20Regular />} aria-label={t.trip.favorite} />
          </Toolbar>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Tabs defaultValue="sakura">
            <TabsList material={media} size="small" aria-label={t.explore.filters}>
              {(["all", "sakura", "coast"] as const).map((value) => (
                <TabsTrigger key={value} value={value}>
                  {t.explore.categories[value]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button appearance="glass-prominent" shape="circular" icon={<Map20Regular />}>
            {t.explore.openTrip}
          </Button>
        </div>
      </div>
    </figure>
  );
}

/** Appearance (saved) with a preview over a photo, what glass does for accessibility, and the photo credits. */
export default function SettingsPage({ t, appearance, onAppearanceChange, embedded }: PageProps) {
  const H1 = embedded ? "h2" : "h1";
  const H2 = embedded ? "h3" : "h2";
  const set = <K extends keyof Appearance>(key: K) => (value: Appearance[K]) => onAppearanceChange({ [key]: value });
  const [previewPhoto, setPreviewPhoto] = React.useState<PreviewPhoto>("day");

  return (
    <div className={cn("mx-auto flex max-w-3xl flex-col gap-4 pt-24 @3xl/app:pt-8", PAGE_INSET)}>
      <H1 className="font-display text-title2 font-semibold">{t.settings.title}</H1>

      <Section title={t.settings.appearance} heading={H2}>
        <div className="flex flex-col gap-2">
          <p className="text-body1 text-foreground-2">{t.settings.previewHint}</p>
          <Preview t={t} appearance={appearance} photo={previewPhoto} />
          <Choice
            label={t.settings.previewPhoto}
            value={previewPhoto}
            options={(Object.keys(PREVIEW_PHOTOS) as PreviewPhoto[]).map((value) => ({ value, label: t.settings.previewPhotos[value] }))}
            onChange={setPreviewPhoto}
          />
        </div>
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
                {t.settings.photoBy(photo.author, photo.license)}
              </TextLink>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
