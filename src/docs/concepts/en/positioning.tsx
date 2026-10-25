import * as React from "react";
import type { ReactNode } from "react";
import {
  Button,
  Label,
  MessageBar,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Radio,
  RadioGroup,
  SimpleTooltip,
  YugenProvider,
} from "@/components/ui";
import { DocSection, DoDont, PropsTable } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
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
                <td key={j} className="px-4 py-3 text-foreground-2">
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

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const SIDES: Side[] = ["top", "right", "bottom", "left"];
const ALIGNS: Align[] = ["start", "center", "end"];

function Playground() {
  const [side, setSide] = React.useState<Side>("bottom");
  const [align, setAlign] = React.useState<Align>("center");
  const [offset, setOffset] = React.useState("6");

  return (
    <div className="grid gap-5 rounded-2xlarge border border-stroke-2 bg-background-1 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label id="pos-side-label" weight="semibold">
            side
          </Label>
          <RadioGroup aria-labelledby="pos-side-label" layout="horizontal" value={side} onValueChange={(v) => setSide(v as Side)}>
            {SIDES.map((s) => (
              <Radio key={s} value={s} label={s} />
            ))}
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label id="pos-align-label" weight="semibold">
            align
          </Label>
          <RadioGroup aria-labelledby="pos-align-label" layout="horizontal" value={align} onValueChange={(v) => setAlign(v as Align)}>
            {ALIGNS.map((a) => (
              <Radio key={a} value={a} label={a} />
            ))}
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label id="pos-offset-label" weight="semibold">
            sideOffset
          </Label>
          <RadioGroup aria-labelledby="pos-offset-label" layout="horizontal" value={offset} onValueChange={setOffset}>
            {["0", "6", "16"].map((o) => (
              <Radio key={o} value={o} label={o} />
            ))}
          </RadioGroup>
        </div>
      </div>
      <div className="flex min-h-56 items-center justify-center rounded-xlarge bg-background-3 p-5">
        <Popover>
          <PopoverTrigger asChild>
            <Button appearance="primary" className="min-w-40">
              Open popover
            </Button>
          </PopoverTrigger>
          <PopoverSurface side={side} align={align} sideOffset={Number(offset)} withArrow>
            <p className="font-mono text-caption1 text-foreground-2">
              side=&quot;{side}&quot; align=&quot;{align}&quot; sideOffset={"{"}
              {offset}
              {"}"}
            </p>
          </PopoverSurface>
        </Popover>
      </div>
    </div>
  );
}

const PLAYGROUND_CODE = `<Popover>
  <PopoverTrigger asChild>
    <Button appearance="primary">Open popover</Button>
  </PopoverTrigger>
  <PopoverSurface side="right" align="start" sideOffset={16} withArrow>
    Content
  </PopoverSurface>
</Popover>

{/* Tooltip defaults to side="top" */}
<SimpleTooltip content="Copy" side="bottom">
  <Button icon={<Copy20Regular />} aria-label="Copy" />
</SimpleTooltip>`;

const COLLISION_CODE = `{/* Leave room for a 74px top bar and a 16px margin on the other edges */}
<PopoverSurface
  side="bottom"
  align="start"
  collisionPadding={{ top: 80, right: 16, bottom: 16, left: 16 }}
  className="max-h-(--radix-popover-content-available-height) overflow-y-auto data-[side=top]:origin-bottom"
>
  …
</PopoverSurface>

{/* Stay on the chosen side and accept clipping (rarely needed) */}
<MenuPopover avoidCollisions={false}>…</MenuPopover>`;

const PORTAL_CODE = `<YugenProvider theme="dark" brand="web" className="p-4">
  <Popover>
    <PopoverTrigger asChild>
      <Button appearance="primary">Open popover</Button>
    </PopoverTrigger>
    {/* Picks up the dark theme and Web brand of the nested provider, even though it renders into <body> */}
    <PopoverSurface withArrow>Dark background, Web brand.</PopoverSurface>
  </Popover>
</YugenProvider>

// Writing a new portal surface? Spread the props of the nearest provider:
import { usePortalThemeProps } from "@/components/ui";

function MyFloatingSurface(props) {
  const portalTheme = usePortalThemeProps(); // {} under the root provider
  return <SomePrimitive.Portal><SomePrimitive.Content {...portalTheme} {...props} /></SomePrimitive.Portal>;
}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="props"
        title="Positioning props"
        description="PopoverSurface, MenuPopover, MenubarContent, TooltipContent and HoverCardContent pass these props straight to Radix Popper. ContextMenu opens at the pointer, so it only takes the collision props."
      >
        <div className="flex flex-col gap-4">
          <PropsTable
            props={[
              {
                name: "side",
                type: `"top" | "right" | "bottom" | "left"`,
                defaultValue: `"bottom" (Tooltip: "top")`,
                description: "The side of the trigger the surface attaches to. It is a physical direction: left / right do not swap in RTL.",
              },
              {
                name: "align",
                type: `"start" | "center" | "end"`,
                defaultValue: `PopoverSurface "center" · MenuPopover "start"`,
                description: "Alignment on the other axis. start / end follow the text direction; Yugen sets the provider's dir on the surface, so they swap in RTL.",
              },
              { name: "sideOffset", type: "number", defaultValue: "Popover 6 · HoverCard 6 · Menu 4 · Tooltip 4", description: "Distance (px) between the trigger and the surface." },
              { name: "alignOffset", type: "number", defaultValue: "0", description: "Shift along the alignment axis (positive = toward end)." },
              { name: "avoidCollisions", type: "boolean", defaultValue: "true", description: "Flip to the opposite side and slide along the axis so the surface stays inside the viewport." },
              { name: "collisionPadding", type: "number | Partial<Record<Side, number>>", defaultValue: "0", description: "Padding from the edges of the collision area (for example, room for a sticky header)." },
              { name: "collisionBoundary", type: "Element | Element[]", defaultValue: "viewport", description: "The area used for collision checks instead of the viewport." },
              { name: "sticky", type: `"partial" | "always"`, defaultValue: `"partial"`, description: "Keep the surface in the viewport when the trigger scrolls partly / fully out of view." },
              { name: "hideWhenDetached", type: "boolean", defaultValue: "false", description: "Hide the surface when the trigger is fully hidden (for example, scrolled out of a scroll container)." },
            ]}
          />
          <P>
            After positioning, Radix writes the actual <C>data-side</C> and <C>data-align</C> (also after a flip) on the surface, and provides
            the CSS variables <C>--radix-popover-content-available-height</C>, <C>--radix-popover-trigger-width</C>… (the prefix depends on
            the component: tooltip, dropdown-menu, select, hover-card).
          </P>
        </div>
      </DocSection>

      <DocSection
        id="playground"
        title="Try side & align"
        description="Pick values, then open the popover. Try side=&quot;right&quot; on a narrow screen to see the surface flip."
      >
        <div className="flex flex-col gap-4">
          <Playground />
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            {SIDES.map((s) => (
              <SimpleTooltip key={s} content={`side="${s}"`} side={s}>
                <Button>Tooltip {s}</Button>
              </SimpleTooltip>
            ))}
          </div>
          <CodeBlock code={PLAYGROUND_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="collision"
        title="Collisions & flipping"
        description="By default a surface never overflows the viewport. Without room on the chosen side it flips to the opposite side; without room along the alignment axis it slides inward."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={COLLISION_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Radix does not know about your sticky header. Set <C>collisionPadding</C> on that side so the surface does not slide under it.
            </li>
            <li>
              Long lists: cap the height with the <C>--radix-*-content-available-height</C> variable and let the list scroll, instead of
              letting the surface grow taller than the viewport (Dropdown already does this).
            </li>
            <li>
              Animations by direction: style with <C>data-[side=top]:…</C>, because the actual side can differ from the one you picked.
            </li>
          </ul>
          <MessageBar intent="info" title="Try it:" className="max-w-3xl">
            scroll until the “Open popover” button above sits near the bottom of the screen, then open it with side=&quot;bottom&quot;. The
            surface appears above the button.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="portals"
        title="Portals & theme"
        description="Every floating surface renders through a portal into <body> to escape overflow: hidden and the parent's z-index. It still picks up the theme, brand and text direction of the nearest nested YugenProvider."
      >
        <div className="flex flex-col gap-4">
          <YugenProvider theme="dark" brand="web" className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 p-6">
            <p className="w-full text-body1 text-foreground-2">This area is a YugenProvider with theme=&quot;dark&quot; brand=&quot;web&quot;.</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button appearance="primary">Open popover</Button>
              </PopoverTrigger>
              <PopoverSurface withArrow>
                <p className="text-body1">Dark background and Web brand, from the nested provider.</p>
                <Button appearance="primary" size="small" className="mt-2">
                  Web brand
                </Button>
              </PopoverSurface>
            </Popover>
            <SimpleTooltip content="The tooltip follows the nested provider too">
              <Button>Hover me</Button>
            </SimpleTooltip>
          </YugenProvider>
          <CodeBlock code={PORTAL_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              App-wide theme: use <C>{"<YugenProvider applyToDocument>"}</C> at the root. The attributes sit on <C>{"<html>"}</C>, so every
              portal gets them.
            </li>
            <li>
              Nested theme: every Yugen floating surface (PopoverSurface, MenuPopover, TooltipContent, HoverCardContent, DialogSurface,
              DrawerSurface, ContextMenu, Menubar, the Dropdown / Combobox / TagPicker listbox) sets the nested provider&apos;s{" "}
              <C>data-theme</C> / <C>data-brand</C> / <C>dir</C> through the <C>usePortalThemeProps()</C> hook. Call this hook in surfaces
              you write yourself.
            </li>
            <li>
              Text direction needs no extra work: floating surfaces (PopoverSurface, TooltipContent, HoverCardContent, DialogSurface,
              DrawerSurface, menus and listboxes) set the <C>dir</C> of the nearest provider, because React context (including{" "}
              <C>DirectionProvider</C>) passes through portals.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="z-index" title="z-index scale" description="Use only a few fixed levels. Surfaces on the same level stack in the order they open (a portal opened later sits on top).">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Level", "Used for"]}
            rows={[
              [<C key="a">z-30</C>, "Sticky top bar (the docs site TopBar). Sticky app content stays at or below this level."],
              [<C key="a">z-40</C>, "Sidebar backdrop on mobile (docs site)."],
              [<C key="a">z-50</C>, "All overlays: backdrop and surface of Dialog / Drawer, Popover, Menu, Tooltip, HoverCard, the Dropdown / Combobox listbox; mobile sidebar."],
              [<C key="a">z-100</C>, "Toast region. It sits above Dialogs so notifications are never covered."],
            ]}
          />
          <DoDont
            dos={[
              "Keep floating surfaces in the component's portal; use collisionPadding for a sticky header.",
              "Pick the side by content: Tooltip on top, Menu and listbox below, side panels at the side.",
              "Keep z-index within the 30 / 40 / 50 / 100 scale.",
            ]}
            donts={[
              "Setting arbitrary z-index values (z-[…] in the thousands) to “win” over overlays.",
              "Turning off avoidCollisions just to keep the surface on one side.",
              "Writing your own Portal without usePortalThemeProps(). The surface then takes the theme of <html>.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
