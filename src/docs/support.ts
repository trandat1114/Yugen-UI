/**
 * Support page (#183). The page goes live when a real payment link or VietQR is configured: /support and /vi/support
 * are routed, prerendered and in the sitemap, and the footer links to them. While both are empty, /support is a 404
 * and nothing links to it. The page may also send a post-donation acknowledgement to the private supporter API;
 * that form records no payment credentials and does not process a payment. Fill in only real accounts (no guessed URLs);
 * also add `.github/FUNDING.yml` for the repository's Sponsor button.
 *
 *   links: [{ label: "GitHub Sponsors", href: "https://github.com/sponsors/<user>" }]
 */
export interface SupportLink {
  /** Platform name, shown as is in both languages (Buy Me a Coffee, Ko-fi, GitHub Sponsors…). */
  label: string;
  /** https URL of the payment site. The docs never host a payment form; the acknowledgement form is separate. */
  href: string;
  /** One short line under the label, e.g. "Monthly or one-time". */
  note?: { en: string; vi: string };
}

export interface Supporter {
  name: string;
  href?: string;
}

export interface SupportQr {
  /** Path relative to the public directory, without the deployment base path. */
  src: string;
  alt: { en: string; vi: string };
  message?: { en: string; vi: string };
}

export const SUPPORT: {
  links: SupportLink[];
  qr?: SupportQr;
  /** The maintainer's own words. Falls back to a neutral line when null. */
  message: { en: string; vi: string } | null;
  /** Availability note shown as a warning when a payment route is limited. */
  notice?: { en: string; vi: string } | null;
  supporters: Supporter[];
} = {
  links: [],
  qr: {
    src: "support/vietqr.png",
    alt: {
      en: "VietQR code for supporting Yugen UI",
      vi: "Mã VietQR để ủng hộ Yugen UI",
    },
  },
  message: {
    en: "If Yugen UI makes your work a little easier, a coffee is a kind way to say thanks.",
    vi: "Nếu Yugen UI giúp bạn làm việc nhẹ hơn, một ly cà phê là lời cảm ơn chân thành.",
  },
  notice: {
    en: "Note: Yugen UI currently accepts VND through VietQR only; international giving is not open yet.",
    vi: "Lưu ý: hiện Yugen UI chỉ nhận VND qua VietQR; kênh quốc tế chưa mở.",
  },
  supporters: [],
};

export const supportEnabled = (support = SUPPORT) =>
  support.links.some((l) => /^https:\/\//.test(l.href)) || Boolean(support.qr?.src);
