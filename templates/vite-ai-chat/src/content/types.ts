import type { CitationSource, YugenTheme } from "yugen-ui";

/** A canned answer of the local mock (`createMockBackend` in `api.ts`). */
export interface MockReply {
  /** Lower-case words: the first reply with a word that appears in the question answers it. */
  match: string[];
  reasoning: string;
  /** Titles of the steps shown in the Trace. */
  steps: string[];
  /** Markdown. `[1]`, `[2]` point at `sources`. */
  answer: string;
  sources?: CitationSource[];
}

export interface MockContent {
  replies: MockReply[];
  /** Answer for questions no reply matches. `quote` is the question as a Markdown quote. */
  fallback: { reasoning: string; steps: string[]; answer: (quote: string) => string };
  /** Step added for each attached file. */
  readFile: (name: string) => string;
  /** Added to the answer when the question has attachments. */
  attachmentNote: (names: string) => string;
  /** Error thrown when "Fail replies" is on in Settings. */
  error: string;
}

/** A conversation saved on first run so the list is not empty. `reply` is an index into `mock.replies`. */
export interface SeedConversation {
  title: string;
  prompt: string;
  reply: number;
  /** How long ago it was updated, in hours. */
  hoursAgo: number;
}

/** Every string in the app. One file per language; `content/index.ts` picks the one the app uses. */
export interface Content {
  lang: "en" | "vi";
  /** Intl locale for dates, times and numbers. */
  locale: "en-US" | "vi-VN";
  appName: string;
  assistantName: string;
  you: string;
  nav: {
    open: string;
    label: string;
    newChat: string;
    settings: string;
    empty: string;
    groups: { today: string; week: string; older: string };
    /** Name of the options button on a conversation row. */
    options: (title: string) => string;
    replying: string;
  };
  appearance: { label: string; mode: string; brand: string; themes: Record<YugenTheme, string> };
  chat: {
    newTitle: string;
    log: string;
    greeting: string;
    intro: string;
    suggestionsLabel: string;
    suggestions: { title: string; prompt: string }[];
    placeholder: string;
    escToStop: string;
    disclaimer: string;
    stopped: string;
    errorTitle: string;
    retry: string;
    copy: string;
    copied: string;
    copyFailed: string;
    regenerate: string;
    actions: string;
    working: string;
    ranSteps: (count: number) => string;
    steps: string;
    attachments: string;
    options: string;
    rename: string;
    delete: string;
  };
  rename: { title: string; label: string; save: string; cancel: string };
  remove: { title: string; body: (title: string) => string; confirm: string; cancel: string; done: string };
  notFound: { title: string; body: string; chatTitle: string; chatBody: string; action: string };
  settings: {
    title: string;
    description: string;
    appearance: { title: string; description: string };
    data: {
      title: string;
      description: (count: number) => string;
      export: string;
      clear: string;
      clearTitle: string;
      clearBody: string;
      clearConfirm: string;
      cancel: string;
      cleared: string;
    };
    backend: { title: string; description: string; fail: string; failHint: string };
  };
  mock: MockContent;
  seed: SeedConversation[];
}
