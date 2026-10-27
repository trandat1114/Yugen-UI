import * as React from "react";
import type { Content } from "./content/types";

/** Sections that in-page links point to. */
export type SectionId = "top" | "features" | "pricing" | "faq" | "signup";

interface LandingValue {
  t: Content;
  /** Embedded in another page (the docs preview): headings start at h2, nothing is saved. */
  embedded: boolean;
  /** Element id of a section: plain in the app (/#pricing), prefixed in the preview so it can't clash with the host. */
  sectionId: (section: SectionId) => string;
  /** Preview only: scrolls the preview's own frame to a section, so the host page's URL never changes. */
  scrollTo: (section: SectionId) => void;
}

export const LandingContext = React.createContext<LandingValue | null>(null);

export function useLanding() {
  const value = React.useContext(LandingContext);
  if (!value) throw new Error("useLanding must be used inside LandingPage");
  return value;
}

export interface SectionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: SectionId;
}

/** In-page link: a plain #anchor in the app; in the embedded preview it scrolls the preview instead. */
export const SectionLink = React.forwardRef<HTMLAnchorElement, SectionLinkProps>(({ to, onClick, ...props }, ref) => {
  const { embedded, sectionId, scrollTo } = useLanding();
  return (
    <a
      ref={ref}
      href={`#${sectionId(to)}`}
      onClick={(e) => {
        onClick?.(e);
        if (!embedded || e.defaultPrevented) return;
        e.preventDefault();
        scrollTo(to);
      }}
      {...props}
    />
  );
});
SectionLink.displayName = "SectionLink";
