"use client";

import * as React from "react";
import { YugenProvider, type YugenBrand, type YugenTheme } from "@/components/ui";
import { BRAND_COOKIE, saveCookie, THEME_COOKIE } from "../appearance";
import content from "../content";

interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
}

const AppearanceContext = React.createContext<{ appearance: Appearance; setAppearance: (patch: Partial<Appearance>) => void } | null>(
  null,
);

/** Theme and brand for Client Components (src/components/AppearanceForm.tsx). */
export function useAppearance() {
  const value = React.useContext(AppearanceContext);
  if (!value) throw new Error("useAppearance must be used inside <Providers>");
  return value;
}

/**
 * The only "use client" file at the root: YugenProvider needs state and effects. The server passes the saved theme
 * (from the cookie); without one, it reads what the first-visit script in <head> picked from the OS setting.
 */
export function Providers({ theme, brand, children }: { theme?: YugenTheme; brand: YugenBrand; children: React.ReactNode }) {
  const [appearance, setState] = React.useState<Appearance>(() => ({
    theme: theme ?? (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    brand,
  }));

  const setAppearance = React.useCallback((patch: Partial<Appearance>) => {
    setState((current) => ({ ...current, ...patch }));
    if (patch.theme) saveCookie(THEME_COOKIE, patch.theme);
    if (patch.brand) saveCookie(BRAND_COOKIE, patch.brand);
  }, []);

  const value = React.useMemo(() => ({ appearance, setAppearance }), [appearance, setAppearance]);

  return (
    <AppearanceContext.Provider value={value}>
      <YugenProvider
        applyToDocument
        withToaster
        theme={appearance.theme}
        brand={appearance.brand}
        messages={content.messages}
        locale={content.locale}
      >
        {children}
      </YugenProvider>
    </AppearanceContext.Provider>
  );
}
