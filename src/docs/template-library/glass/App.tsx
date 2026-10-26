import * as React from "react";
import { YugenProvider } from "@/components/ui";
import { DEFAULT_APPEARANCE, type Appearance } from "./appearance";
import defaultContent from "./content";
import type { Content } from "./content/types";
import { Layout } from "./Layout";
import { BrowserRouter, MemoryRouter, type Route } from "./router";

/** Same key as the no-flash script in index.html (it reads `theme` and `brand`). */
const STORAGE_KEY = "yugen-glass-appearance";

function initialAppearance(): Appearance {
  // The script in index.html set data-theme / data-brand before React ran: read them back so both agree.
  const root = document.documentElement;
  let saved: Partial<Appearance> = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    /* storage blocked */
  }
  return {
    theme: (root.getAttribute("data-theme") as Appearance["theme"] | null) ?? DEFAULT_APPEARANCE.theme,
    brand: (root.getAttribute("data-brand") as Appearance["brand"] | null) ?? DEFAULT_APPEARANCE.brand,
    material: saved.material === "solid" ? "solid" : "glass",
    overMedia: saved.overMedia === "regular" ? "regular" : "clear",
  };
}

export interface AppProps {
  /** Embedded in another page (the docs preview): router in memory, nothing saved, no changes to <html> or the title. */
  embedded?: boolean;
  /** App text; defaults to the language picked in `content/index.ts`. */
  content?: Content;
  /** Appearance to start with; defaults to what was saved. */
  defaultAppearance?: Appearance;
  /** First page of the embedded preview. */
  initialRoute?: Route;
}

export default function App({ embedded = false, content = defaultContent, defaultAppearance, initialRoute }: AppProps) {
  const [appearance, setAppearance] = React.useState(() => defaultAppearance ?? initialAppearance());

  React.useEffect(() => {
    if (embedded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage blocked */
    }
  }, [appearance, embedded]);

  const layout = (
    <Layout
      t={content}
      appearance={appearance}
      onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))}
      embedded={embedded}
    />
  );

  return (
    <YugenProvider
      applyToDocument={!embedded}
      withToaster={!embedded}
      theme={appearance.theme}
      brand={appearance.brand}
      messages={content.messages}
      locale={content.locale}
      className={embedded ? "h-full" : undefined}
    >
      {embedded ? <MemoryRouter initial={initialRoute}>{layout}</MemoryRouter> : <BrowserRouter>{layout}</BrowserRouter>}
    </YugenProvider>
  );
}
