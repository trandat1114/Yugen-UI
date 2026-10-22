import * as React from "react";
import { Accessibility20Regular, ArrowRight16Regular, Open16Regular, WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";
import {
  Button,
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  type YugenBrand,
  type YugenTheme,
} from "@/components/ui";
import defaultContent from "./content";
import type { Content, Rich } from "./content/types";
import { JP, SakuraBloom } from "./Sakura";

export interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
}

export interface WelcomeProps {
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
  /** Page text; defaults to the language picked in `content/index.ts`. */
  content?: Content;
  /** Embedded in another page (preview): scrolls inside its frame, no <main> landmark, headings start at h2. */
  embedded?: boolean;
}

const DOCS = "https://trandat1114.github.io/Yugen-UI/";
const REPO = "https://github.com/trandat1114/Yugen-UI";
const THEMES: YugenTheme[] = ["light", "dark", "high-contrast"];
const BRANDS: { value: YugenBrand; label: string }[] = [
  { value: "sakura", label: "Sakura" },
  { value: "web", label: "Web" },
];

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-[0.9em] text-foreground-1">{children}</code>;
}

function Text({ parts }: { parts: Rich }) {
  return parts.map((part, i) => (typeof part === "string" ? part : <Code key={i}>{part.code}</Code>));
}

/** Red seal (hanko), the starter's logo. */
function Hanko({ size = "size-9" }: { size?: string }) {
  return (
    <span
      aria-hidden
      lang="ja"
      className={`${JP} ${size} inline-flex shrink-0 -rotate-3 items-center justify-center rounded-small border-2 border-brand-stroke text-subtitle1 font-bold text-brand-foreground-1`}
    >
      桜
    </span>
  );
}

function AppearanceMenu({ appearance, onChange, t }: { appearance: Appearance; onChange: WelcomeProps["onAppearanceChange"]; t: Content }) {
  const icon =
    appearance.theme === "dark" ? <WeatherMoon20Regular /> : appearance.theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label={t.nav.appearance} />
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-52">
        <MenuGroupHeader>{t.nav.mode}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.theme} onValueChange={(v) => onChange({ theme: v as YugenTheme })}>
          {THEMES.map((theme) => (
            <MenuItemRadio key={theme} value={theme}>
              {t.themes[theme]}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
        <MenuDivider />
        <MenuGroupHeader>{t.nav.brand}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.brand} onValueChange={(v) => onChange({ brand: v })}>
          {BRANDS.map((b) => (
            <MenuItemRadio key={b.value} value={b.value}>
              {b.label}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}

/** The starter's welcome page. Replace it with your app when you are ready. */
export function Welcome({ appearance, onAppearanceChange, content: t = defaultContent, embedded = false }: WelcomeProps) {
  const Main = embedded ? "div" : "main";
  const Title = embedded ? "h2" : "h1";
  const Section = embedded ? "h3" : "h2";

  return (
    <div lang={t.lang} className={`@container isolate flex flex-col bg-background-1 text-foreground-1 ${embedded ? "h-full overflow-y-auto" : "min-h-dvh"}`}>
      <header className="sticky top-0 z-10 border-b border-stroke-2 bg-background-1/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
          <span className="flex items-center gap-2 font-display text-subtitle2 font-semibold text-foreground-1">
            <Hanko />
            {t.appName}
          </span>
          <nav aria-label={t.nav.label} className="ms-auto flex items-center gap-1">
            <Button asChild appearance="subtle" className="hidden @md:inline-flex">
              <a href={DOCS} target="_blank" rel="noreferrer">
                {t.nav.docs}
              </a>
            </Button>
            <Button asChild appearance="subtle" className="hidden @md:inline-flex">
              <a href={REPO} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </Button>
            <AppearanceMenu appearance={appearance} onChange={onAppearanceChange} t={t} />
          </nav>
        </div>
      </header>

      <Main aria-label={embedded ? t.appName : undefined} className="flex-1">
        <section className="relative overflow-hidden border-b border-stroke-2 bg-hero-glow">
          <SakuraBloom className="pointer-events-none absolute -inset-e-24 -top-24 size-80 opacity-40 @4xl:opacity-60" />
          <div className="relative mx-auto grid w-full max-w-5xl items-center gap-6 px-4 py-[clamp(40px,7cqi,96px)] @4xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex flex-col items-start gap-4">
              <Title className="font-display text-[clamp(36px,6cqi,64px)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance text-foreground-1">
                {t.hero.title}
              </Title>
              <p className="max-w-xl text-subtitle2 font-normal text-foreground-2">
                <Text parts={t.hero.body} />
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild appearance="primary" size="large" icon={<Open16Regular />} iconPosition="after">
                  <a href={DOCS} target="_blank" rel="noreferrer">
                    {t.hero.docs}
                  </a>
                </Button>
                <Button asChild size="large" icon={<ArrowRight16Regular className="rtl:-scale-x-100" />} iconPosition="after">
                  <a
                    href="#next-steps"
                    onClick={(e) => {
                      // Scroll with JS: also works inside a preview frame whose router uses the hash.
                      e.preventDefault();
                      document.getElementById("next-steps")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {t.hero.next}
                  </a>
                </Button>
              </div>
            </div>
            {/* Vertical 幽玄 (yūgen) with the seal: a calligraphy accent on wide screens. */}
            <div aria-hidden className="hidden items-start gap-3 @4xl:flex">
              <span lang="ja" className={`${JP} text-[clamp(88px,11cqi,152px)] leading-none font-bold text-foreground-1 [writing-mode:vertical-rl]`}>
                幽玄
              </span>
              <span className="self-end">
                <Hanko size="size-12" />
              </span>
            </div>
          </div>
        </section>

        <section id="next-steps" aria-labelledby="next-steps-title" className="mx-auto w-full max-w-5xl scroll-mt-16 px-4 py-8">
          <Section id="next-steps-title" className="font-display text-title2 font-semibold text-foreground-1">
            {t.steps.title}
          </Section>
          <ol className="mt-5 grid gap-5 @3xl:grid-cols-3">
            {t.steps.items.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-2 border-t-2 border-brand-stroke pt-4">
                <span aria-hidden className="font-display text-title3 font-semibold text-brand-foreground-1 tabular-nums">
                  {i + 1}
                </span>
                <h3 className="text-subtitle1 font-semibold text-foreground-1">{step.title}</h3>
                <p className="text-body1 text-foreground-2">
                  <Text parts={step.body} />
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="explore" className="border-t border-stroke-2 bg-background-2">
          <div className="mx-auto w-full max-w-5xl px-4 py-8">
            <Section id="explore" className="font-display text-title2 font-semibold text-foreground-1">
              {t.links.title}
            </Section>
            <ul className="mt-5 grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-4">
              {t.links.items.map((link) => (
                <li key={link.title}>
                  <a
                    href={`${DOCS}${link.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full flex-col gap-1 rounded-xlarge border border-stroke-2 bg-background-1 p-4 transition-shadow duration-faster hover:shadow-8"
                  >
                    <span className="flex items-center gap-1 text-subtitle2 font-semibold text-foreground-1">
                      {link.title}
                      <Open16Regular className="text-foreground-3" />
                    </span>
                    <span className="text-body1 text-foreground-2">{link.body}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Main>

      <footer className="border-t border-stroke-2 bg-background-2">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-caption1 text-foreground-3">
          <p>
            <span lang="ja" className={`${JP} me-2 text-body1 text-foreground-1`}>
              幽玄
            </span>
            {t.footer.yugen}
          </p>
          <p>
            {t.footer.builtWith}{" "}
            <a className="text-link underline hover:text-link-hover" href={DOCS} target="_blank" rel="noreferrer">
              Yugen UI
            </a>{" "}
            · Vite · React · Tailwind CSS v4
          </p>
        </div>
      </footer>
    </div>
  );
}
