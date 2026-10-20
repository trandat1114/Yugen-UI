import type { ReactNode } from "react";
import {
  Accessibility24Regular,
  Code24Regular,
  Color24Regular,
  DarkTheme24Regular,
  Layer24Regular,
  PaintBrush24Regular,
} from "@fluentui/react-icons";
import { Badge, Button, Card, CardContent, CardHeader, MessageBar } from "@/components/ui";
import { DocSection } from "../../blocks";
import { AuthorLink } from "../../AuthorLink";
import { CodeBlock } from "../../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-large bg-brand-background-2 text-brand-foreground-2">
      {children}
    </span>
  );
}

const PILLARS = [
  {
    icon: <Color24Regular />,
    title: "Built on Fluent 2",
    tag: "Tokens & behavior",
    body: "Token names map 1:1 to Fluent UI React v9 (colorNeutralForeground1, spacingHorizontalM, shadow16…), with the same spacing scale, type ramp, corner radii, elevation, motion and per-component state rules.",
  },
  {
    icon: <Code24Regular />,
    title: "You own the code",
    tag: "Copy-paste",
    body: "Like shadcn/ui, you can copy component folders straight into your project — readable and editable — or install the npm package. Complex behavior builds on Radix, cmdk and react-day-picker.",
  },
  {
    icon: <PaintBrush24Regular />,
    title: "Sakura 桜 brand",
    tag: "Brand",
    body: "The default brand is cherry-blossom pink with a 16-step ramp; Brand80 reaches 5.16:1 against white text. Switch to Web (Fluent blue), Teams or your own brand with a single attribute.",
  },
];

const PRINCIPLES = [
  {
    icon: <Layer24Regular />,
    title: "Three-layer tokens",
    body: "Global (raw values) → Alias (roles, Fluent names) → Utility (Tailwind classes). Components only use utilities, so changing a theme means changing tokens, not components.",
  },
  {
    icon: <Accessibility24Regular />,
    title: "Accessible from the start",
    body: "ARIA semantics and keyboard navigation from Radix, a high-contrast 2px focus ring, text at 4.5:1 or better, and color is never the only signal.",
  },
  {
    icon: <DarkTheme24Regular />,
    title: "Switchable theme, brand and direction",
    body: "data-theme (light / dark), data-brand and dir are DOM attributes — set them on <html> for the whole app or nest them per region through YugenProvider.",
  },
  {
    icon: <Code24Regular />,
    title: "Code you can take home",
    body: "Every example and every Block imports only from @/components/ui and @fluentui/react-icons — paste the snippet into your project and it runs.",
  },
];

const SECTIONS = [
  {
    href: "#/foundations/color",
    title: "Design language",
    body: "Color, typography, spacing, corner radius, elevation, motion — where every token comes from, with contrast checkers.",
  },
  {
    href: "#/components/button",
    title: "Components",
    body: "100+ components in groups: Actions, Inputs, Navigation, Data display, Feedback, Surfaces & overlays, Layout. Every page has live examples, Do / Don't and a props table.",
  },
  {
    href: "#/blocks",
    title: "Blocks",
    body: "Sample screens composed from components (sign-in, stats, scheduling, feedback…). The Code tab shows the whole file, ready to copy.",
  },
  {
    href: "#/theme-designer",
    title: "Theme Designer",
    body: "Generate a 16-step brand ramp from one key color, preview it on real components and export a [data-brand] CSS block.",
  },
  {
    href: "#/concepts/quick-start",
    title: "Concepts",
    body: "Guides on integration, styling, theming, slots, positioning, RTL, SSR, accessibility and migrating from Fluent UI or shadcn/ui.",
  },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="what"
        title="What is Yugen UI?"
        description="幽玄 (yūgen) is a subtle, profound beauty that suggests more than it says. Yugen UI brings that spirit to interfaces: restrained, clear and deep."
      >
        <div className="flex flex-col gap-XL">
          <P>
            Yugen UI is a set of components and tokens for{" "}
            <strong className="font-semibold text-foreground-1">React 18 + TypeScript + Tailwind CSS v4</strong>, created by{" "}
            <AuthorLink className="text-link hover:text-link-hover" />. It combines three sources: the token structure and component
            behavior of Microsoft Fluent 2, the copy-paste distribution model of shadcn/ui, and its own Sakura brand palette.
          </P>
          <div className="grid gap-L md:grid-cols-3">
            {PILLARS.map((p) => (
              <Card key={p.title} size="large">
                <CardHeader image={<IconTile>{p.icon}</IconTile>} header={p.title} description={p.tag} />
                <CardContent>{p.body}</CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-S">
            <Button asChild appearance="primary">
              <a href="#/concepts/quick-start">Quick start</a>
            </Button>
            <Button asChild>
              <a href="#/components/button">Browse components</a>
            </Button>
          </div>
        </div>
      </DocSection>

      <DocSection id="principles" title="Principles" description="Four principles guide every design and code decision.">
        <div className="flex flex-col gap-XL">
          <div className="grid gap-L sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="flex gap-M rounded-xlarge border border-stroke-2 bg-background-1 p-L">
                <IconTile>{p.icon}</IconTile>
                <div className="min-w-0 flex-1">
                  <h3 className="text-subtitle2 font-semibold text-foreground-1">{p.title}</h3>
                  <p className="mt-XS text-body1 text-foreground-2">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <P>
            For example, a primary button's background goes through all three layers. Changing <C>data-brand</C> only swaps the Global
            layer; the Alias layer and the classes in the component stay the same:
          </P>
          <CodeBlock
            code={`/* 1. Global — raw values, per brand (tokens.css) */
[data-brand="sakura"] { --brand-80: #c2347a; }

/* 2. Alias — roles, Fluent-style names (tokens.css) */
[data-theme="light"], [data-brand] { --colorBrandBackground: var(--brand-80); }

/* 3. Utility — the bridge to Tailwind (index.css) */
@theme inline { --color-brand-background: var(--colorBrandBackground); }

// Components only know utilities
<button className="bg-brand-background text-foreground-on-brand">Save</button>`}
          />
        </div>
      </DocSection>

      <DocSection
        id="structure"
        title="How the docs are organized"
        description="The docs go from foundations to details; every page can switch between light and dark themes from the top bar."
      >
        <div className="grid gap-M sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="group flex flex-col gap-XS rounded-xlarge border border-stroke-2 bg-background-1 p-L transition-colors duration-faster hover:bg-subtle-hover"
            >
              <span className="text-subtitle2 font-semibold text-foreground-1 group-hover:text-brand-foreground-1">{s.title}</span>
              <span className="text-body1 text-foreground-2">{s.body}</span>
            </a>
          ))}
        </div>
      </DocSection>

      <DocSection id="credit" title="Credits">
        <div className="flex flex-col gap-L">
          <P>
            <strong className="font-semibold text-foreground-1">Yugen UI</strong> © <AuthorLink className="text-link hover:text-link-hover" />.
            Inspired by{" "}
            <a className="text-link underline hover:text-link-hover" href="https://fluent2.microsoft.design/" target="_blank" rel="noopener noreferrer">
              Microsoft Fluent 2
            </a>{" "}
            and{" "}
            <a className="text-link underline hover:text-link-hover" href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">
              shadcn/ui
            </a>
            . Icons: Fluent System Icons (MIT). Behavior: Radix UI, cmdk, react-day-picker, react-resizable-panels.
          </P>
          <div className="flex flex-wrap gap-S">
            <Badge appearance="tint" color="brand">React 18</Badge>
            <Badge appearance="tint" color="brand">TypeScript 5</Badge>
            <Badge appearance="tint" color="brand">Tailwind CSS 4</Badge>
            <Badge appearance="tint" color="informative">Radix UI</Badge>
            <Badge appearance="tint" color="informative">Fluent System Icons</Badge>
          </div>
          <MessageBar intent="info" title="Not an official Microsoft product." className="max-w-3xl">
            Token names and the spacing / typography / radius / elevation / motion scales follow Fluent UI React v9; the Sakura palette,
            gradients and brand ramps are defined by Yugen UI.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
