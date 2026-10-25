import {
  Accessibility20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from "@fluentui/react-icons";
import {
  Button,
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  type YugenTheme,
} from "@/components/ui";
import { BRANDS, THEMES, type Appearance } from "./appearance";
import type { Content } from "./content/types";

/** Quick theme and brand switch in the header (the same choices are in Settings). */
export function ThemeMenu({ appearance, onChange, t }: { appearance: Appearance; onChange: (patch: Partial<Appearance>) => void; t: Content }) {
  const icon =
    appearance.theme === "dark" ? <WeatherMoon20Regular /> : appearance.theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label={t.appearance.label} />
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-52">
        <MenuGroupHeader>{t.appearance.mode}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.theme} onValueChange={(v) => onChange({ theme: v as YugenTheme })}>
          {THEMES.map((theme) => (
            <MenuItemRadio key={theme} value={theme}>
              {t.appearance.themes[theme]}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
        <MenuDivider />
        <MenuGroupHeader>{t.appearance.brand}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.brand} onValueChange={(v) => onChange({ brand: v })}>
          {BRANDS.map((b) => (
            <MenuItemRadio key={b.value} value={b.value}>
              {b.label}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}
