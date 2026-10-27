import Link from "next/link";
import content from "../content";
import { NavLinks } from "./NavLinks";

/** Server Component: static markup, plus one small Client Component for the current-page state. */
export function SiteHeader() {
  return (
    <header className="border-b border-stroke-2 bg-background-1">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:inset-s-4 focus:top-2 focus:z-50">
        {content.nav.skip}
      </a>
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-subtitle2 font-semibold">
          <span aria-hidden className="flex size-8 items-center justify-center rounded-medium bg-brand-background text-foreground-on-brand">
            Y
          </span>
          {content.appName}
        </Link>
        <NavLinks
          label={content.nav.label}
          links={[
            { href: "/", label: content.nav.home },
            { href: "/settings", label: content.nav.settings },
          ]}
        />
      </div>
    </header>
  );
}
