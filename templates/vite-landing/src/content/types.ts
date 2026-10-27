import type { YugenMessagesInput, YugenTheme } from "yugen-ui";

export type FeatureIcon = "search" | "spaces" | "comments" | "templates" | "offline" | "history";

export interface Plan {
  id: string;
  name: string;
  description: string;
  /** Price per person per month in `currency`: billed monthly, and billed yearly. 0 = free. */
  price: { monthly: number; yearly: number };
  features: string[];
  cta: string;
  /** The plan most teams pick: highlighted, with a badge. */
  featured?: boolean;
}

/**
 * Every string on the page, and what the SEO plugin in vite.config.ts writes into <head> (title, description, the plans
 * as JSON-LD offers). One file per language; `content/index.ts` picks the one the app and the build use.
 */
export interface Content {
  lang: "en" | "vi";
  /** Built-in strings of Yugen components: messagesEn for English, empty = Vietnamese defaults. Kept in the language
   * file so `create --lang vi` (which deletes en.ts) drops the English set from the bundle. */
  messages?: YugenMessagesInput;
  /** Numbers and prices (also `locale` on YugenProvider) and `og:locale`. */
  locale: "en-US" | "vi-VN";
  /** ISO 4217 code of every price on the page and in the JSON-LD offers. */
  currency: string;
  product: {
    name: string;
    /** <title> and og:title. */
    title: string;
    /** <meta name="description">, og:description and the JSON-LD description. */
    description: string;
  };
  nav: { label: string; features: string; pricing: string; faq: string; signUp: string; footer: string };
  appearance: { label: string; themes: Record<YugenTheme, string> };
  hero: {
    badge: string;
    title: string;
    lead: string;
    primary: string;
    secondary: string;
    note: string;
    /** The product picture drawn in HTML next to the title. */
    shot: {
      label: string;
      spaces: string[];
      notes: string[];
      title: string;
      meta: string;
      body: string;
      tasks: string[];
      comment: { author: string; text: string };
    };
  };
  logos: { title: string };
  features: { title: string; lead: string; items: { icon: FeatureIcon; title: string; body: string }[] };
  pricing: {
    title: string;
    lead: string;
    period: { label: string; monthly: string; yearly: string; save: string };
    perPerson: string;
    billedMonthly: string;
    /** "$76.80 per person, billed yearly". */
    billedYearly: (total: string) => string;
    freeForever: string;
    featured: string;
    plans: Plan[];
  };
  testimonials: { title: string; items: { quote: string; name: string; role: string }[] };
  faq: { title: string; lead: string; contact: string; email: string; items: { question: string; answer: string }[] };
  signUp: {
    title: string;
    lead: string;
    points: string[];
    form: {
      label: string;
      name: string;
      email: string;
      emailHint: string;
      teamSize: string;
      teamSizePlaceholder: string;
      teamSizes: string[];
      consent: string;
      submit: string;
      submitting: string;
    };
    errors: { name: string; emailRequired: string; email: string; teamSize: string; consent: string };
    success: { title: string; body: (email: string) => string };
  };
  footer: { tagline: string; madeWith: string; sample: string };
}
