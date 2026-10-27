import * as React from "react";
import { YugenProvider, type YugenBrand, type YugenTheme } from "@/components/ui";
import defaultContent from "./content";
import type { Content } from "./content/types";
import { LandingPage } from "./LandingPage";

/** Same key as the no-flash script in index.html (it reads `theme` and `brand`). */
const STORAGE_KEY = "yugen-landing-appearance";

export interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
}

function initialAppearance(): Appearance {
  // Prerendering at build time (vite.config.ts): no document, and the HTML must not depend on the theme.
  if (typeof document === "undefined") return { theme: "light", brand: "sakura" };
  // The script in index.html set data-theme / data-brand before React ran: read them back so both agree.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as YugenTheme | null) ?? "light",
    brand: (root.getAttribute("data-brand") as YugenBrand | null) ?? "sakura",
  };
}

export interface AppProps {
  /** Embedded in another page (the docs preview): scrolls in its own frame, nothing saved, no changes to <html>. */
  embedded?: boolean;
  /** Page text; defaults to the language picked in `content/index.ts`. */
  content?: Content;
  /** Appearance to start with; defaults to what was saved. */
  defaultAppearance?: Appearance;
}

export default function App({ embedded = false, content = defaultContent, defaultAppearance }: AppProps) {
  const [appearance, setAppearance] = React.useState(() => defaultAppearance ?? initialAppearance());

  React.useEffect(() => {
    if (embedded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage blocked */
    }
  }, [appearance, embedded]);

  return (
    <YugenProvider
      applyToDocument={!embedded}
      // The Toaster comes with the sign-up form (BelowTheFold), so its code stays out of the first load.
      theme={appearance.theme}
      brand={appearance.brand}
      messages={content.messages}
      locale={content.locale}
      className={embedded ? "h-full" : undefined}
    >
      <LandingPage
        t={content}
        theme={appearance.theme}
        onThemeChange={(theme) => setAppearance((a) => ({ ...a, theme }))}
        embedded={embedded}
      />
    </YugenProvider>
  );
}
