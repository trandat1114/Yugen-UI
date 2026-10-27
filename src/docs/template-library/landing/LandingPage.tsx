import * as React from "react";
import { ArrowRight20Regular, DarkTheme20Regular } from "@fluentui/react-icons";
import { Badge, Button, type YugenTheme } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Content } from "./content/types";
import { LandingContext, SectionLink, type SectionId } from "./context";
import { Logo, LogoRow } from "./Logos";
import { ProductShot } from "./ProductShot";

// Loaded right after the first screen renders, so the hero paints sooner: features, pricing, testimonials, FAQ and the
// sign-up form; and the theme menu with the popover code it needs.
const BelowTheFold = React.lazy(() => import("./BelowTheFold"));
const ThemeMenu = React.lazy(() => import("./ThemeMenu"));


export interface LandingPageProps {
  t: Content;
  theme: YugenTheme;
  onThemeChange: (theme: YugenTheme) => void;
  /** Embedded in another page (preview): scrolls in its own frame, headings start at h2, no landmarks. */
  embedded: boolean;
}

const NAV: SectionId[] = ["features", "pricing", "faq"];

/**
 * The whole page: sticky header, hero, logo row, features, pricing, testimonials, FAQ, sign-up and footer. Layout uses
 * container queries, so it also adapts to the frame it is embedded in.
 */
export function LandingPage({ t, theme, onThemeChange, embedded }: LandingPageProps) {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const context = React.useMemo(() => {
    const sectionId = (section: SectionId) => (embedded ? `landing-preview-${section}` : section);
    return {
      t,
      embedded,
      sectionId,
      scrollTo: (section: SectionId) => {
        const frame = frameRef.current;
        const target = frame?.querySelector<HTMLElement>(`#${sectionId(section)}`);
        if (!frame || !target) return;
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const top = target.getBoundingClientRect().top - frame.getBoundingClientRect().top + frame.scrollTop - margin;
        const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
        frame.scrollTo({ top: section === "top" ? 0 : top, behavior: smooth ? "smooth" : "auto" });
      },
    };
  }, [t, embedded]);
  const labels: Record<SectionId, string> = {
    top: t.product.name,
    features: t.nav.features,
    pricing: t.nav.pricing,
    faq: t.nav.faq,
    signup: t.nav.signUp,
  };

  const H1 = embedded ? "h2" : "h1";
  // Embedded: no landmarks that would clash with the host page's own <header>, <main> and <footer>.
  const Header = embedded ? "div" : "header";
  const Main = embedded ? "div" : "main";
  const Footer = embedded ? "div" : "footer";
  // The same for every theme: the build renders this button to HTML before anyone's saved theme is known.
  const themeButton = <Button appearance="subtle" icon={<DarkTheme20Regular />} aria-label={t.appearance.label} />;

  // The lazy parts start loading once the first screen is on screen, so their downloads don't compete with it.
  const [painted, setPainted] = React.useState(false);
  React.useEffect(() => {
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setPainted(true));
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);
  // Taller than the screen, so the footer starts below the fold and nothing moves in view when the sections arrive.
  const belowTheFoldFallback = <div className="min-h-dvh" />;

  return (
    <LandingContext.Provider value={context}>
      <div
        ref={frameRef}
        className={cn("@container/landing bg-background-1 text-foreground-1", embedded ? "h-full overflow-y-auto" : "min-h-dvh")}
      >
        <Header className="sticky top-0 z-10 border-b border-stroke-2 bg-background-1">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
            <SectionLink to="top" className="flex items-center gap-2 rounded-medium pe-1 font-display text-subtitle2 font-semibold">
              <Logo />
              {t.product.name}
            </SectionLink>
            <nav aria-label={t.nav.label} className="ms-6 hidden @2xl/landing:block">
              <ul className="flex items-center gap-1">
                {NAV.map((section) => (
                  <li key={section}>
                    <SectionLink
                      to={section}
                      className="flex h-8 items-center rounded-medium px-3 text-body1 text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1"
                    >
                      {labels[section]}
                    </SectionLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="ms-auto flex items-center gap-1">
              {/* The same button stands in while the menu loads. */}
              {painted ? (
                <React.Suspense fallback={themeButton}>
                  <ThemeMenu t={t} theme={theme} onChange={onThemeChange} trigger={themeButton} />
                </React.Suspense>
              ) : (
                themeButton
              )}
              <Button asChild appearance="primary" className="ms-1">
                <SectionLink to="signup">{t.nav.signUp}</SectionLink>
              </Button>
            </div>
          </div>
        </Header>

        <Main>
          <section
            id={context.sectionId("top")}
            aria-labelledby={`${context.sectionId("top")}-title`}
            className="bg-linear-to-b from-brand-background-2 to-background-1 px-4 pt-12 pb-16 @3xl/landing:pt-20 @3xl/landing:pb-24"
          >
            <div className="mx-auto grid max-w-6xl items-center gap-12 @5xl/landing:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div className="flex flex-col items-start">
                <Badge appearance="tint" color="brand" size="large" shape="circular" className="px-2.5">
                  {t.hero.badge}
                </Badge>
                <H1
                  id={`${context.sectionId("top")}-title`}
                  className="mt-4 font-display text-title1 font-semibold text-balance text-foreground-1 @3xl/landing:text-large-title"
                >
                  {t.hero.title}
                </H1>
                <p className="mt-4 max-w-xl text-body2 text-foreground-2 @3xl/landing:text-subtitle1 @3xl/landing:font-normal">
                  {t.hero.lead}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild appearance="primary" size="large">
                    <SectionLink to="signup">
                      {t.hero.primary}
                      <ArrowRight20Regular aria-hidden className="rtl:-scale-x-100" />
                    </SectionLink>
                  </Button>
                  <Button asChild size="large">
                    <SectionLink to="pricing">{t.hero.secondary}</SectionLink>
                  </Button>
                </div>
                <p className="mt-4 text-caption1 text-foreground-3">{t.hero.note}</p>
              </div>
              <ProductShot shot={t.hero.shot} />
            </div>
          </section>

          <div className="px-4 pb-16">
            <p className="mb-6 text-center text-body1 text-foreground-3">{t.logos.title}</p>
            <LogoRow label={t.logos.title} />
          </div>

          {painted ? (
            <React.Suspense fallback={belowTheFoldFallback}>
              <BelowTheFold />
            </React.Suspense>
          ) : (
            belowTheFoldFallback
          )}
        </Main>

        <Footer className="border-t border-stroke-2 px-4 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 @3xl/landing:flex-row @3xl/landing:items-start @3xl/landing:justify-between">
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 font-display text-subtitle2 font-semibold">
                <Logo />
                {t.product.name}
              </span>
              <p className="text-body1 text-foreground-2">{t.footer.tagline}</p>
            </div>
            <nav aria-label={t.nav.footer}>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {(["features", "pricing", "faq", "signup"] as const).map((section) => (
                  <li key={section}>
                    <SectionLink to={section} className="rounded-small text-body1 text-foreground-2 hover:text-foreground-1 hover:underline">
                      {labels[section]}
                    </SectionLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <p className="mx-auto mt-8 max-w-6xl text-caption1 text-foreground-3">
            © {t.product.name} · {t.footer.sample} ·{" "}
            <a href="https://trandat1114.github.io/Yugen-UI/" className="rounded-small text-link underline hover:text-link-hover">
              {t.footer.madeWith}
            </a>
          </p>
        </Footer>
      </div>
    </LandingContext.Provider>
  );
}
