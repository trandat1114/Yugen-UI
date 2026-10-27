import * as React from "react";
import { YugenProvider, type YugenTheme } from "@/components/ui";
import defaultContent from "./content";
import type { Content } from "./content/types";
import { Layout } from "./Layout";
import { BrowserRouter, MemoryRouter, type Route } from "./router";

/** Same key as the no-flash script in index.html (it reads `theme`). */
const STORAGE_KEY = "yugen-docs-theme";

function initialTheme(): YugenTheme {
  // The script in index.html set data-theme before React ran: read it back so both agree.
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "dark" || theme === "high-contrast" ? theme : "light";
}

export interface AppProps {
  /** Embedded in another page (the docs preview): router in memory, nothing saved, no changes to <html> or the title. */
  embedded?: boolean;
  /** Site text and pages; defaults to the language picked in `content/index.ts`. */
  content?: Content;
  /** Theme to start with; defaults to what was saved. */
  defaultTheme?: YugenTheme;
  /** First page of the embedded preview. */
  initialRoute?: Route;
}

export default function App({ embedded = false, content = defaultContent, defaultTheme, initialRoute }: AppProps) {
  const [theme, setTheme] = React.useState(() => defaultTheme ?? initialTheme());

  React.useEffect(() => {
    if (embedded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme }));
    } catch {
      /* storage blocked */
    }
  }, [theme, embedded]);

  const layout = <Layout t={content} theme={theme} onThemeChange={setTheme} embedded={embedded} />;

  return (
    <YugenProvider
      applyToDocument={!embedded}
      theme={theme}
      brand="sakura"
      messages={content.messages}
      locale={content.locale}
      className={embedded ? "h-full" : undefined}
    >
      {embedded ? <MemoryRouter initial={initialRoute}>{layout}</MemoryRouter> : <BrowserRouter>{layout}</BrowserRouter>}
    </YugenProvider>
  );
}
