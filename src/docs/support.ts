/**
 * Support page (#183). The page goes live when `links` has at least one entry: /support and /vi/support are routed,
 * prerendered and in the sitemap, and the footer links to them. While `links` is empty, /support is a 404 and nothing
 * links to it. Fill in only real accounts (no guessed URLs); also add `.github/FUNDING.yml` for the repository's
 * Sponsor button.
 *
 *   links: [{ label: "GitHub Sponsors", href: "https://github.com/sponsors/<user>" }]
 */
export interface SupportLink {
  /** Platform name, shown as is in both languages (Buy Me a Coffee, Ko-fi, GitHub Sponsors…). */
  label: string;
  /** https URL of the payment site. The docs never host a payment form. */
  href: string;
  /** One short line under the label, e.g. "Monthly or one-time". */
  note?: { en: string; vi: string };
}

export interface Supporter {
  name: string;
  href?: string;
}

export const SUPPORT: {
  links: SupportLink[];
  /** The maintainer's own words. Falls back to a neutral line when null. */
  message: { en: string; vi: string } | null;
  supporters: Supporter[];
} = {
  links: [],
  message: null,
  supporters: [],
};

export const supportEnabled = (support = SUPPORT) => support.links.some((l) => /^https:\/\//.test(l.href));
