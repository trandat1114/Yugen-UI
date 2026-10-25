import * as React from "react";
import { YugenProvider, type YugenBrand, type YugenTheme } from "yugen-ui";
import content from "./content";
import type { Appearance } from "./context";
import { Dashboard } from "./Dashboard";
import { BrowserRouter } from "./router";

/** Same key as the no-flash script in index.html. */
const STORAGE_KEY = "yugen-dashboard-appearance";

function initialAppearance(): Appearance {
  // The script in index.html set data-theme / data-brand before React started; read them back so both agree.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as YugenTheme | null) ?? "light",
    brand: (root.getAttribute("data-brand") as YugenBrand | null) ?? "sakura",
  };
}

export default function App() {
  const [appearance, setAppearance] = React.useState(initialAppearance);
  const onAppearanceChange = React.useCallback((patch: Partial<Appearance>) => setAppearance((a) => ({ ...a, ...patch })), []);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage blocked */
    }
  }, [appearance]);

  return (
    <YugenProvider
      applyToDocument
      withToaster
      theme={appearance.theme}
      brand={appearance.brand}
      // Built-in component strings (close buttons, chart summaries, pagination…) in the app's language.
      messages={content.messages}
      locale={content.lang === "en" ? "en-US" : "vi-VN"}
    >
      <BrowserRouter>
        <Dashboard content={content} appearance={appearance} onAppearanceChange={onAppearanceChange} />
      </BrowserRouter>
    </YugenProvider>
  );
}
