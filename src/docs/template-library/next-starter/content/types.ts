import type { YugenMessagesInput, YugenTheme } from "@/components/ui";

/** Every string in the app. One file per language; `content/index.ts` picks the one the app uses. */
export interface Content {
  lang: "en" | "vi";
  /** Built-in strings of Yugen components: messagesEn for English, empty = Vietnamese defaults. Only the client
   * provider reads it (functions can't cross from a Server Component to a Client Component). */
  messages?: YugenMessagesInput;
  locale: string;
  appName: string;
  description: string;
  nav: { label: string; home: string; settings: string; skip: string };
  home: {
    title: string;
    lead: string;
    settings: string;
    docs: string;
    serverTitle: string;
    /** "Rendered on the server at 09:41." */
    renderedAt: (time: string) => string;
    features: { title: string; body: string }[];
  };
  settings: {
    title: string;
    description: string;
    lead: string;
    theme: string;
    themes: Record<YugenTheme, string>;
    brand: string;
    saved: string;
    clientNote: string;
  };
  notFound: { title: string; body: string; action: string };
}
