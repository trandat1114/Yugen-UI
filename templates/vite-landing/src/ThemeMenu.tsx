import type { ReactElement } from "react";
import { Menu, MenuItemRadio, MenuPopover, MenuRadioGroup, MenuTrigger, type YugenTheme } from "yugen-ui";
import type { Content } from "./content/types";

const THEMES: YugenTheme[] = ["light", "dark", "high-contrast"];

export interface ThemeMenuProps {
  t: Content;
  theme: YugenTheme;
  onChange: (theme: YugenTheme) => void;
  /** The button that opens the menu (LandingPage shows the same button while this file loads). */
  trigger: ReactElement;
}

/** Light, dark or high contrast; the choice is saved by App. Loaded on its own, after the first screen. */
export default function ThemeMenu({ t, theme, onChange, trigger }: ThemeMenuProps) {
  return (
    <Menu>
      <MenuTrigger asChild>{trigger}</MenuTrigger>
      <MenuPopover align="end" className="min-w-44">
        <MenuRadioGroup value={theme} onValueChange={(value) => onChange(value as YugenTheme)}>
          {THEMES.map((value) => (
            <MenuItemRadio key={value} value={value}>
              {t.appearance.themes[value]}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}
