import type { YugenMessagesInput, YugenTheme } from "yugen-ui";
import type { Category } from "../trips";

/** Text of one trip; the rest (photos, dates, pin) is in `trips.ts`. */
export interface TripText {
  title: string;
  place: string;
  summary: string;
  /** Paragraphs of the story on the trip page. */
  story: string[];
  highlights: string[];
}

/** Every string in the app. One file per language; `content/index.ts` picks the one the app uses. */
export interface Content {
  lang: "en" | "vi";
  /** Built-in strings of Yugen components: messagesEn for English, empty = Vietnamese defaults. Kept in the language
   * file so `create --lang vi` (which deletes en.ts) drops the English set from the bundle. */
  messages?: YugenMessagesInput;
  /** Locale for dates and numbers. */
  locale: string;
  appName: string;
  /** Document title of a page: "Explore · Sakura Journeys". */
  pageTitle: (page: string) => string;
  nav: { label: string; home: string; explore: string; settings: string; search: string };
  search: { title: string; placeholder: string; trips: string; empty: string };
  home: {
    title: string;
    lead: string;
    cta: string;
    tripsTitle: string;
    /** "6 trips · 287 km". */
    tripsSummary: (trips: number, km: string) => string;
    days: (days: number) => string;
  };
  trip: {
    back: string;
    actions: string;
    share: string;
    favorite: string;
    more: string;
    copyLink: string;
    linkCopied: string;
    openOnMap: string;
    details: string;
    when: string;
    distance: string;
    highlights: string;
    gallery: string;
    photo: (index: number, total: number) => string;
  };
  explore: {
    title: string;
    lead: string;
    picture: string;
    controls: string;
    search: string;
    filters: string;
    categories: Record<"all" | Category, string>;
    zoomIn: string;
    zoomOut: string;
    openTrip: string;
    noMatch: string;
  };
  settings: {
    title: string;
    appearance: string;
    theme: string;
    themes: Record<YugenTheme, string>;
    brand: string;
    material: string;
    materials: { glass: string; solid: string };
    materialHint: string;
    overMedia: string;
    overMediaOptions: { clear: string; regular: string };
    overMediaHint: string;
    accessibility: string;
    accessibilityItems: string[];
    credits: string;
    creditsLead: string;
    photoBy: (author: string) => string;
  };
  notFound: { title: string; body: string; action: string };
  categories: Record<Category, string>;
  trips: Record<string, TripText>;
}
