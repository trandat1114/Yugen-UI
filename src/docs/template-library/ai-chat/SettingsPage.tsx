import * as React from "react";
import { ArrowDownload20Regular, Delete20Regular } from "@fluentui/react-icons";
import { Button, Radio, RadioGroup, Switch, toast, type YugenTheme } from "@/components/ui";
import { BRANDS, THEMES, type Appearance } from "./appearance";
import type { Conversation } from "./conversations";
import type { Content } from "./content/types";
import { ConfirmDialog } from "./Dialogs";

export interface SettingsPageProps {
  t: Content;
  embedded: boolean;
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
  conversations: Conversation[];
  onClear: () => void;
  failReplies: boolean;
  onFailRepliesChange: (value: boolean) => void;
}

function Section({
  title,
  description,
  heading: Heading,
  children,
}: {
  title: string;
  description: string;
  heading: "h2" | "h3";
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-xlarge border border-stroke-2 bg-background-1 p-4 @xl:p-5">
      <div className="flex flex-col gap-1">
        <Heading id={id} className="text-subtitle2 font-semibold">
          {title}
        </Heading>
        <p className="text-body1 text-foreground-3">{description}</p>
      </div>
      {children}
    </section>
  );
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SettingsPage({
  t,
  embedded,
  appearance,
  onAppearanceChange,
  conversations,
  onClear,
  failReplies,
  onFailRepliesChange,
}: SettingsPageProps) {
  const s = t.settings;
  const heading = embedded ? "h3" : "h2";
  const modeId = React.useId();
  const brandId = React.useId();
  const failHintId = React.useId();
  const [confirming, setConfirming] = React.useState(false);

  return (
    <div className="@container min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 py-6 @xl:px-6">
        <p className="text-body1 text-foreground-3">{s.description}</p>

        <Section title={s.appearance.title} description={s.appearance.description} heading={heading}>
          <div className="flex flex-col gap-1">
            <span id={modeId} className="text-body1 font-semibold">
              {t.appearance.mode}
            </span>
            <RadioGroup
              aria-labelledby={modeId}
              layout="horizontal"
              className="gap-x-4"
              value={appearance.theme}
              onValueChange={(v) => onAppearanceChange({ theme: v as YugenTheme })}
            >
              {THEMES.map((theme) => (
                <Radio key={theme} value={theme} label={t.appearance.themes[theme]} />
              ))}
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-1">
            <span id={brandId} className="text-body1 font-semibold">
              {t.appearance.brand}
            </span>
            <RadioGroup
              aria-labelledby={brandId}
              layout="horizontal"
              className="gap-x-4"
              value={appearance.brand}
              onValueChange={(v) => onAppearanceChange({ brand: v })}
            >
              {BRANDS.map((b) => (
                <Radio key={b.value} value={b.value} label={b.label} />
              ))}
            </RadioGroup>
          </div>
        </Section>

        <Section title={s.data.title} description={s.data.description(conversations.length)} heading={heading}>
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<ArrowDownload20Regular />}
              disabled={conversations.length === 0}
              onClick={() => download("conversations.json", JSON.stringify({ version: 1, conversations }, null, 2))}
            >
              {s.data.export}
            </Button>
            <Button icon={<Delete20Regular />} disabled={conversations.length === 0} onClick={() => setConfirming(true)}>
              {s.data.clear}
            </Button>
          </div>
        </Section>

        <Section title={s.backend.title} description={s.backend.description} heading={heading}>
          <div className="flex flex-col">
            <Switch label={s.backend.fail} checked={failReplies} onCheckedChange={onFailRepliesChange} aria-describedby={failHintId} />
            <p id={failHintId} className="text-caption1 text-foreground-3">
              {s.backend.failHint}
            </p>
          </div>
        </Section>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={s.data.clearTitle}
        body={s.data.clearBody}
        confirm={s.data.clearConfirm}
        cancel={s.data.cancel}
        onConfirm={() => {
          onClear();
          toast({ intent: "success", title: s.data.cleared });
        }}
      />
    </div>
  );
}
