import * as React from "react";
import { messagesEn, YugenProvider } from "yugen-ui";
import { createMockBackend, sendMessage, type SendMessage } from "./api";
import type { Appearance } from "./appearance";
import { ChatLayout } from "./ChatLayout";
import defaultContent from "./content";
import type { Content } from "./content/types";
import { BrowserRouter, MemoryRouter } from "./router";

/** Same key as the no-flash script in index.html. */
const STORAGE_KEY = "yugen-ai-chat-appearance";

function initialAppearance(): Appearance {
  // The script in index.html set data-theme / data-brand before React ran: read them back so both agree.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as Appearance["theme"] | null) ?? "light",
    brand: (root.getAttribute("data-brand") as Appearance["brand"] | null) ?? "sakura",
  };
}

export interface AppProps {
  /**
   * Embedded in another page (the docs preview): router in memory, conversations kept in memory only, no changes to
   * <html> or the document title, fills its parent.
   */
  embedded?: boolean;
  /** App text; defaults to the language picked in `content/index.ts`. */
  content?: Content;
  /** Theme and brand to start with; defaults to what index.html applied. */
  defaultAppearance?: Appearance;
  /** The backend; defaults to `sendMessage` in `api.ts`. */
  send?: SendMessage;
}

export default function App({ embedded = false, content = defaultContent, defaultAppearance, send = sendMessage }: AppProps) {
  const [appearance, setAppearance] = React.useState(() => defaultAppearance ?? initialAppearance());
  // Settings > Backend > "Fail replies": swaps in a mock that throws, to check the error state.
  const [failReplies, setFailReplies] = React.useState(false);
  const backend = React.useMemo(() => (failReplies ? createMockBackend(content.mock, { fail: true }) : send), [failReplies, send, content.mock]);

  React.useEffect(() => {
    if (embedded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage blocked */
    }
  }, [appearance, embedded]);

  const Router = embedded ? MemoryRouter : BrowserRouter;

  return (
    <YugenProvider
      applyToDocument={!embedded}
      withToaster={!embedded}
      theme={appearance.theme}
      brand={appearance.brand}
      messages={content.lang === "en" ? messagesEn : undefined}
      locale={content.locale}
      className={embedded ? "h-full" : undefined}
    >
      <Router>
        <ChatLayout
          embedded={embedded}
          content={content}
          send={backend}
          appearance={appearance}
          onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))}
          failReplies={failReplies}
          onFailRepliesChange={setFailReplies}
        />
      </Router>
    </YugenProvider>
  );
}
