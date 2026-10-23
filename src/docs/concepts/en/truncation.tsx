import * as React from "react";
import type { ReactNode } from "react";
import { Document20Regular, MoreHorizontal20Regular, Send20Regular } from "@fluentui/react-icons";
import { Button, Card, CardHeader, Persona, SimpleTooltip, Text, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-mono text-caption1 text-brand-foreground-1">{label}</span>
      <div className="w-64 max-w-full rounded-medium border border-dashed border-stroke-1 p-2">{children}</div>
    </div>
  );
}

const LONG_TITLE = "Consolidated report on revenue and operating costs for Q3 2026 (version for the board of directors)";
const LONG_FILE = "Yugen-UI-interface-design-services-contract-final-signed-version.pdf";

/** A link that shows the full-text tooltip only when the text is actually truncated. */
function TruncatedLink({ href, children }: { href: string; children: string }) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = React.useState(false);
  const isTruncated = () => {
    const el = ref.current;
    return !!el && el.scrollWidth > el.clientWidth;
  };

  return (
    <Tooltip open={open} onOpenChange={(next) => setOpen(next && isTruncated())}>
      <TooltipTrigger asChild>
        <a
          ref={ref}
          href={href}
          onClick={(e) => e.preventDefault()}
          className="block min-w-0 truncate rounded-small text-body1 text-link hover:text-link-hover hover:underline"
        >
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 break-all">{children}</TooltipContent>
    </Tooltip>
  );
}

const WRAP_CODE = `{/* Default: let text wrap; wrap-break-word for long strings without spaces */}
<Card className="w-72">
  <CardHeader
    image={<Document20Regular />}
    header={<span className="wrap-break-word">Consolidated report on revenue and operating costs for Q3…</span>}
    description="Updated yesterday"
  />
</Card>`;

const HOW_CODE = `{/* One line: needs a constrained width; in flex, the element needs min-w-0 */}
<p className="truncate">…</p>

{/* Several lines */}
<p className="line-clamp-2">…</p>

{/* Text component */}
<Text truncate wrap={false} block>…</Text>

{/* In flex: without min-w-0, truncate has no effect */}
<div className="flex items-center gap-2">
  <Document20Regular className="shrink-0" />
  <span className="min-w-0 flex-1 truncate">…</span>
</div>`;

const TOOLTIP_CODE = `import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";

/** A link that shows the full-text tooltip only when the text is actually truncated. */
export function TruncatedLink({ href, children }: { href: string; children: string }) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = React.useState(false);
  const isTruncated = () => {
    const el = ref.current;
    return !!el && el.scrollWidth > el.clientWidth;
  };

  return (
    <Tooltip open={open} onOpenChange={(next) => setOpen(next && isTruncated())}>
      <TooltipTrigger asChild>
        <a ref={ref} href={href} className="block min-w-0 truncate text-link hover:underline">
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 break-all">{children}</TooltipContent>
    </Tooltip>
  );
}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="prefer-wrap"
        title="Prefer wrapping"
        description="Truncated text is hidden content. People who zoom in, longer translations (Vietnamese often runs 20–30% longer than English) and touch users lose the most."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-5 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <div className="flex flex-col gap-2">
              <span className="text-caption1 font-semibold text-success-foreground-1">✓ Wraps</span>
              <Card className="w-72">
                <CardHeader image={<Document20Regular />} header={<span className="wrap-break-word">{LONG_TITLE}</span>} description="Updated yesterday" />
              </Card>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-caption1 font-semibold text-danger-foreground-1">✕ Truncated for no reason</span>
              <Card className="w-72">
                <CardHeader image={<Document20Regular />} header={<span className="block truncate">{LONG_TITLE}</span>} description="Updated yesterday" />
              </Card>
            </div>
          </div>
          <CodeBlock code={WRAP_CODE} />
          <P>
            Truncate only when there is a real constraint: table or list rows that need an even height, navigation bars, tabs, breadcrumbs,
            chips in an input, file names in a fixed frame.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="how"
        title="How to truncate"
        description="Three tools with one requirement: the element must have a constrained width."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-5 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <Labeled label="truncate">
              <p className="truncate text-body1 text-foreground-1">{LONG_TITLE}</p>
            </Labeled>
            <Labeled label="line-clamp-2">
              <p className="line-clamp-2 text-body1 text-foreground-1">{LONG_TITLE}</p>
            </Labeled>
            <Labeled label="<Text truncate wrap={false} block>">
              <Text truncate wrap={false} block>
                {LONG_TITLE}
              </Text>
            </Labeled>
            <Labeled label="flex + min-w-0">
              <div className="flex items-center gap-2 text-body1 text-foreground-1">
                <Document20Regular className="shrink-0 text-foreground-3" />
                <span className="min-w-0 flex-1 truncate">{LONG_FILE}</span>
                <Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />
              </div>
            </Labeled>
            <Labeled label="Persona (truncates itself)">
              <Persona name="Alexandra Catherine Montgomery-Whitfield" secondaryText="Lead, User Experience and Research team" />
            </Labeled>
          </div>
          <CodeBlock code={HOW_CODE} />
          <P>
            Some components have truncation built in: <C>TableCellLayout truncate</C>, <C>Persona</C>, <C>MenuItem</C> (long labels), the
            value of <C>Dropdown</C>, <C>Tag</C>. Screen readers still read the full text; truncation only affects what is visible.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="full-text"
        title="Show the full text"
        description="Every truncated string needs a way to the full content that works with mouse, keyboard and touch."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <p className="text-caption1 text-foreground-3">Hover or Tab to each link. Only the truncated link shows a tooltip.</p>
            <div className="flex w-72 max-w-full flex-col gap-2">
              <TruncatedLink href="#/files/1">{LONG_FILE}</TruncatedLink>
              <TruncatedLink href="#/files/2">Budget-2027.xlsx</TruncatedLink>
            </div>
          </div>
          <CodeBlock code={TOOLTIP_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Put the tooltip on an element that is <strong className="font-semibold">already focusable</strong> (a link, a button, an
              interactive table cell). Don&apos;t add <C>tabIndex</C> to a paragraph just to get a tooltip; let it wrap or open a detail page.
            </li>
            <li>
              <C>title</C> is the bare minimum: it only shows on hover and does not work with the keyboard or touch.
            </li>
            <li>In tables and lists, a detail page or an expandable panel is the best place for the full text.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="buttons"
        title="Don't truncate the main label of a button"
        description="“Delete perm…” or “Send to rev…” turns a clear action into a guessing game. Buttons have whitespace-nowrap and a minimum width so the label is always complete."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <span className="text-caption1 font-semibold text-success-foreground-1">✓ Shorten the wording or use an icon + tooltip</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button appearance="primary" icon={<Send20Regular />}>
                  Send for review
                </Button>
                <SimpleTooltip content="Send to reviewer">
                  <Button appearance="subtle" icon={<Send20Regular />} aria-label="Send to reviewer" />
                </SimpleTooltip>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <span className="text-caption1 font-semibold text-danger-foreground-1">✕ Truncate the label to fit</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button appearance="primary" className="max-w-32">
                  <span className="min-w-0 truncate">Save and send to reviewer</span>
                </Button>
              </div>
            </div>
          </div>
          <DoDont
            dos={[
              "Let text wrap by default; use wrap-break-word for long strings without spaces.",
              "When you must truncate: truncate / line-clamp-* plus min-w-0 on the flex item.",
              "Show the full text with a Tooltip on a focusable element, or on a detail page.",
              "Keep button labels to 1–3 words; when space is short, move secondary actions into a “…” menu.",
            ]}
            donts={[
              "Truncating the main label of a Button, an important MenuItem or a page title.",
              "Relying on title as the only way to see the full text.",
              "Adding tabIndex to static text just to attach a tooltip.",
              "Truncating figures (amounts, dates). Users will misread them.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
