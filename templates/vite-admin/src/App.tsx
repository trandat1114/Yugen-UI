import * as React from "react";
import { YugenProvider } from "yugen-ui";
import { createMockApi, DEFAULT_MOCK_OPTIONS, DEMO_ACCOUNT, type MockOptions } from "./api";
import { DEFAULT_APPEARANCE, type Appearance } from "./appearance";
import { AuthProvider } from "./auth";
import defaultContent from "./content";
import type { Content } from "./content/types";
import { AdminContext, createFormat, type AdminValue } from "./context";
import { Layout } from "./Layout";
import { BrowserRouter, MemoryRouter, type Route } from "./router";

/** Same key as the no-flash script in index.html (it reads `theme` and `brand`). */
const STORAGE_KEY = "yugen-admin-appearance";

function initialAppearance(): Appearance {
  // The script in index.html set data-theme / data-brand before React ran: read them back so both agree.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as Appearance["theme"] | null) ?? DEFAULT_APPEARANCE.theme,
    brand: (root.getAttribute("data-brand") as Appearance["brand"] | null) ?? DEFAULT_APPEARANCE.brand,
  };
}

export interface AppProps {
  /** Embedded in another page (the docs preview): router and session in memory, nothing saved, no changes to <html>. */
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
  const [mock, setMock] = React.useState<MockOptions>(DEFAULT_MOCK_OPTIONS);

  // The API reads the mock options on every request, so Settings applies without losing the data.
  const options = React.useRef(mock);
  React.useEffect(() => {
    options.current = mock;
  }, [mock]);
  const api = React.useMemo(
    () => createMockApi({ labels: content.mock, locale: content.locale, options: () => options.current }),
    [content],
  );

  React.useEffect(() => {
    if (embedded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage blocked */
    }
  }, [appearance, embedded]);

  const value = React.useMemo<AdminValue>(
    () => ({
      t: content,
      api,
      format: createFormat(content.locale, content.currency),
      mock,
      setMock: (patch) => setMock((m) => ({ ...m, ...patch })),
      appearance,
      setAppearance: (patch) => setAppearance((a) => ({ ...a, ...patch })),
      embedded,
    }),
    [content, api, mock, appearance, embedded],
  );
  const demo = React.useMemo(() => ({ name: content.mock.adminName, email: DEMO_ACCOUNT.email }), [content]);

  const app = (
    <AdminContext.Provider value={value}>
      <AuthProvider api={api} demo={demo} embedded={embedded}>
        <Layout />
      </AuthProvider>
    </AdminContext.Provider>
  );

  return (
    <YugenProvider
      applyToDocument={!embedded}
      withToaster={!embedded}
      theme={appearance.theme}
      brand={appearance.brand}
      // Built-in component strings (pagination, dialogs, DataGrid…) in the app's language.
      messages={content.messages}
      locale={content.locale}
      className={embedded ? "h-full" : undefined}
    >
      {embedded ? <MemoryRouter initial={initialRoute}>{app}</MemoryRouter> : <BrowserRouter>{app}</BrowserRouter>}
    </YugenProvider>
  );
}
