"use client";

import * as React from "react";
import { Radio, RadioGroup, toast, type YugenBrand, type YugenTheme } from "yugen-ui";
import { BRANDS, THEMES } from "../appearance";
import { useAppearance } from "../app/providers";
import content from "../content";

const t = content.settings;

/** Client Component: state and event handlers. Changes apply at once and are saved in cookies for the server. */
export function AppearanceForm() {
  const { appearance, setAppearance } = useAppearance();
  const themeLabel = React.useId();
  const brandLabel = React.useId();
  const saved = () => toast({ intent: "success", title: t.saved });

  return (
    <div className="flex flex-col gap-5 rounded-xlarge border border-stroke-2 bg-background-1 p-5">
      <div className="flex flex-col gap-1.5">
        <span id={themeLabel} className="text-body1 font-semibold">
          {t.theme}
        </span>
        <RadioGroup
          aria-labelledby={themeLabel}
          layout="horizontal"
          value={appearance.theme}
          onValueChange={(value) => {
            setAppearance({ theme: value as YugenTheme });
            saved();
          }}
        >
          {THEMES.map((theme) => (
            <Radio key={theme} value={theme} label={t.themes[theme]} />
          ))}
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-1.5">
        <span id={brandLabel} className="text-body1 font-semibold">
          {t.brand}
        </span>
        <RadioGroup
          aria-labelledby={brandLabel}
          layout="horizontal"
          value={appearance.brand}
          onValueChange={(value) => {
            setAppearance({ brand: value as YugenBrand });
            saved();
          }}
        >
          {BRANDS.map((brand) => (
            <Radio key={brand.value} value={brand.value} label={brand.label} />
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
