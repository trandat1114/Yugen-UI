import type { ReactNode } from "react";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link underline hover:text-link-hover" href={href}>
      {children}
    </a>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: a wide table scrolls horizontally with the keyboard (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold text-foreground-1" : "px-4 py-3 text-foreground-2"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const METADATA_CODE = `// app/pricing/page.tsx — Server Component
import type { Metadata } from "next";
import { Button, Card } from "yugen-ui";

export const metadata: Metadata = {
  title: "Pricing · Acme",
  description: "Three plans for teams of 1 to 500 people, with a 14-day trial.",
  alternates: { canonical: "https://acme.vn/pricing" },
  openGraph: { title: "Pricing · Acme", images: ["/og/pricing.png"] },
};

export default function PricingPage() {
  return (
    <main>
      <h1 className="text-title1 font-semibold">Pricing</h1>
      {/* Card, Button… are client components but still render to HTML on the server */}
    </main>
  );
}`;

const DYNAMIC_CODE = `// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return { title: \`\${post.title} · Acme\`, description: post.excerpt };
}`;

const LINKS_CODE = `import NextLink from "next/link";
import { Button, Link } from "yugen-ui";

// Yugen's Link is an <a href> — crawlers follow it.
<Link href="/docs">Docs</Link>

// Use the framework's router and keep Yugen's look: asChild.
<Link asChild>
  <NextLink href="/pricing">Pricing</NextLink>
</Link>

// Looks like a Button, navigates like a link.
<Button appearance="primary" asChild>
  <NextLink href="/signup">Sign up</NextLink>
</Button>`;

const IMAGES_CODE = `import { Avatar, Image } from "yugen-ui";

<Image src="/team.jpg" alt="The Acme product team at the Da Nang office" width={640} height={360} />
<Image src="/wave.svg" alt="" /> {/* decorative image: empty alt */}
<Avatar name="Nguyen Minh Anh" src="/u/anh.jpg" /> {/* role="img", named by name */}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="server"
        title="What is in the HTML"
        description="Client components still render on the server; what crawlers miss is content that only appears after an interaction."
      >
        <div className="flex flex-col gap-4">
          <P>
            In the Next.js App Router, components marked <C>&quot;use client&quot;</C> still render to HTML on the server before they hydrate.
            Text in a Card, Table or Accordion is already in the HTML that is sent. The difference is content that only exists once someone
            interacts:
          </P>
          <Table
            head={["Component", "In the initial HTML"]}
            rows={[
              ["Accordion", "Yes — closed panels are rendered (hidden), so crawlers read them."],
              ["Tabs", "Only the selected tab. Put content that matters for search in the default tab, or give it its own page."],
              ["Dialog, Drawer, Popover, Menu, Tooltip", "No — they render when opened, through a portal. Keep the main content out of them."],
              ["Carousel", "Yes — every slide is in the HTML."],
              ["DataGrid, Table", "Yes, for data available when the server renders (not data fetched later on the client)."],
            ]}
          />
          <P>
            Setting up Next.js with Yugen: <A href={docsPath("/concepts/ssr")}>Server-side rendering &amp; Next.js</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="metadata" title="Title and description" description="One title and one description per page, written for people reading the search results.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={METADATA_CODE} />
          <P>Pages with dynamic content (posts, products) use <C>generateMetadata</C>:</P>
          <CodeBlock code={DYNAMIC_CODE} />
          <P>
            A Vite SPA has no per-page metadata on the server. Pages that should appear in search results need prerendering at build time or a
            framework with SSR; the Blog template of <C>create-yugen-ui</C> writes the title, description and Open Graph tags of each post at
            build time.
          </P>
        </div>
      </DocSection>

      <DocSection id="headings" title="Heading structure" description="One h1 per page, and no skipped levels below it.">
        <div className="flex flex-col gap-4">
          <P>
            Size and heading level are separate choices: pick the element for the structure (<C>h1</C>–<C>h3</C>) and the size from the type
            ramp (<C>text-title1</C>, <C>text-subtitle1</C>). Some components render a heading element themselves:
          </P>
          <Table
            head={["Component", "Element"]}
            rows={[
              ["DialogTitle", <C key="c">h2</C>],
              ["DrawerHeaderTitle", <C key="c">h2</C>],
              ["EmptyTitle", <C key="c">h3</C>],
              ["Card, CardHeader", "No heading element of their own — pass the h2 / h3 that fits where the card sits."],
            ]}
          />
        </div>
      </DocSection>

      <DocSection id="links" title="Links crawlers can follow" description="Navigate with an a element that has an href; never change pages from a button's onClick.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={LINKS_CODE} />
          <P>
            <C>asChild</C> keeps Yugen&apos;s classes and focus states but lets the framework render the <C>a</C> (prefetching, client-side
            navigation). Crawlers only follow <C>href</C>, so <C>{"<Button onClick={() => router.push(...)}>"}</C> leads to a page nobody finds.
          </P>
        </div>
      </DocSection>

      <DocSection id="images" title="Images and avatars" description="alt describes what the image shows; decorative images get an empty alt.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={IMAGES_CODE} />
          <P>
            Set <C>width</C> and <C>height</C> (or wrap the image in <C>AspectRatio</C>) so the browser reserves the space before the image
            loads, which avoids layout shift (CLS). Icon-only buttons need an <C>aria-label</C>; it is also the only text crawlers get from
            them.
          </P>
        </div>
      </DocSection>

      <DocSection id="checklist" title="Before you ship">
        <DoDont
          dos={[
            "Every page has its own title and description, and a canonical URL when the same content lives at several URLs.",
            "The main content is in the initial HTML, not behind a non-default tab, a Dialog or a Popover.",
            "One h1, heading levels in order, and an alt on every image.",
            "Navigation uses a href (Link, or asChild with the framework's link).",
          ]}
          donts={[
            "Changing pages from a Button's onClick.",
            "Picking the heading element for the size you want.",
            "An empty alt on an image that carries content, or keywords stuffed into alt.",
          ]}
        />
      </DocSection>
    </>
  );
}
