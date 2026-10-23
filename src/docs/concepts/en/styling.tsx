import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown20Regular, MoreHorizontal20Regular, Star20Regular } from "@fluentui/react-icons";
import {
  Avatar,
  Badge,
  Button,
  type ButtonProps,
  fieldControlClass,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Demo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6", className)}>
      {children}
    </div>
  );
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

/* ---------------------------------------------------------------- cn demo */
const MERGE_CASES: [string, string][] = [
  ["text-body1 text-foreground-2", "text-foreground-1"],
  ["px-3 py-2", "px-5"],
  ["rounded-medium shadow-4", "rounded-circular shadow-16"],
  ["bg-background-1 hover:bg-background-1-hover", "bg-brand-background-2"],
];

/* ---------------------------------------------------------------- spacing */
const SPACING = [
  { step: "0.5", fluent: "XXS", px: 2, bar: "w-0.5" },
  { step: "1", fluent: "XS", px: 4, bar: "w-1" },
  { step: "1.5", fluent: "SNudge", px: 6, bar: "w-1.5" },
  { step: "2", fluent: "S", px: 8, bar: "w-2" },
  { step: "2.5", fluent: "MNudge", px: 10, bar: "w-2.5" },
  { step: "3", fluent: "M", px: 12, bar: "w-3" },
  { step: "4", fluent: "L", px: 16, bar: "w-4" },
  { step: "5", fluent: "XL", px: 20, bar: "w-5" },
  { step: "6", fluent: "XXL", px: 24, bar: "w-6" },
  { step: "8", fluent: "XXXL", px: 32, bar: "w-8" },
];

/* ---------------------------------------------------------------- cva demo */
const pillVariants = cva("rounded-circular", {
  variants: {
    tone: {
      neutral: "",
      brand: "border-transparent bg-brand-background-2 text-brand-foreground-2 hover:bg-brand-background-2-hover active:bg-brand-background-2-pressed",
    },
  },
  defaultVariants: { tone: "neutral" },
});

type PillButtonProps = ButtonProps & VariantProps<typeof pillVariants>;

function PillButton({ tone, className, ...props }: PillButtonProps) {
  return <Button className={cn(pillVariants({ tone }), className)} {...props} />;
}

const CVA_CODE = `import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "@/components/ui";
import { cn } from "@/lib/cn";

const pillVariants = cva("rounded-circular", {
  variants: {
    tone: {
      neutral: "",
      brand:
        "border-transparent bg-brand-background-2 text-brand-foreground-2 hover:bg-brand-background-2-hover active:bg-brand-background-2-pressed",
    },
  },
  defaultVariants: { tone: "neutral" },
});

type PillButtonProps = ButtonProps & VariantProps<typeof pillVariants>;

export function PillButton({ tone, className, ...props }: PillButtonProps) {
  return <Button className={cn(pillVariants({ tone }), className)} {...props} />;
}

<PillButton>Neutral</PillButton>
<PillButton tone="brand" icon={<Star20Regular />}>Starred</PillButton>`;

/* ---------------------------------------------------------------- media object */
const PEOPLE = [
  { name: "Emma Collins", role: "Product designer · International Payments and Reconciliation Platform team" },
  { name: "Daniel Park", role: "Frontend engineer" },
];

const MEDIA_CODE = `<div className="flex items-center gap-3">
  <Avatar name="Emma Collins" color="colorful" size={40} />
  <div className="min-w-0 flex-1">
    <p className="truncate text-body1 font-semibold text-foreground-1">Emma Collins</p>
    <p className="truncate text-caption1 text-foreground-3">Product designer · International Payments…</p>
  </div>
  <div className="flex shrink-0 items-center gap-1">
    <Button size="small">Message</Button>
    <Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />
  </div>
</div>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="classname"
        title="className & cn()"
        description="Your className always goes last in the component's cn(...), so it wins over any default class from the same group."
      >
        <div className="flex flex-col gap-4">
          <Demo>
            <Button>Default</Button>
            <Button className="rounded-circular px-5">Rounded</Button>
            <Button appearance="primary" className="min-w-40">
              Wider
            </Button>
            <Badge className="tracking-wide uppercase">New</Badge>
          </Demo>
          <CodeBlock
            code={`<Button className="rounded-circular px-5">Rounded</Button>
<Button appearance="primary" className="min-w-40">Wider</Button>
<Badge className="tracking-wide uppercase">New</Badge>`}
          />
          <P>
            <C>cn()</C> in <C>src/lib/cn.ts</C> is <C>clsx</C> + <C>tailwind-merge</C>, configured to{" "}
            <strong className="font-semibold">know</strong> Yugen&apos;s scales. Without that, plain <C>tailwind-merge</C> treats{" "}
            <C>text-body1</C> as a text color and drops it when it meets <C>text-foreground-1</C>, so the text falls back to the default
            size. The actual output of <C>cn()</C> on this page:
          </P>
          <SimpleTable
            head={["Component classes", "className passed in", "cn() returns"]}
            rows={MERGE_CASES.map(([base, extra]) => [
              <C key="a">{base}</C>,
              <C key="b">{extra}</C>,
              <C key="c">{cn(base, extra)}</C>,
            ])}
          />
          <MessageNote>
            Always import <C>cn</C> from <C>@/lib/cn</C>; don&apos;t use <C>twMerge</C> directly. If you add new tokens (font size, shadow,
            duration…), declare them in <C>extendTailwindMerge</C> in <C>cn.ts</C>.
          </MessageNote>
        </div>
      </DocSection>

      <DocSection
        id="tokens"
        title="Token utilities only"
        description="Tailwind's default palette, radius, shadows, font sizes and easing are turned off in index.css. Only utilities mapped from Fluent tokens remain."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["For", "Use", "Don't use"]}
            rows={[
              ["Secondary text color", <C key="a">text-foreground-2</C>, <C key="b">text-gray-600, text-[#…]</C>],
              ["Primary button background", <C key="a">bg-brand-background</C>, <C key="b">bg-pink-600, bg-[#…]</C>],
              ["UI font size", <C key="a">text-body1</C>, <C key="b">text-sm, text-[14px]</C>],
              ["Control radius", <C key="a">rounded-medium</C>, <C key="b">rounded-md, rounded-[4px]</C>],
              ["Menu shadow", <C key="a">shadow-16</C>, <C key="b">shadow-lg</C>],
              ["Hover duration", <C key="a">duration-faster</C>, <C key="b">duration-100</C>],
              ["Dark theme", <C key="a">data-theme=&quot;dark&quot;</C>, <C key="b">dark:bg-…</C>],
            ]}
          />
          <h3 className="text-subtitle1 font-semibold text-foreground-1">Spacing</h3>
          <P>
            Spacing uses Tailwind&apos;s numeric scale: <C>p-3</C>, <C>gap-2</C>, <C>mt-6</C>. The ten steps below match Fluent&apos;s spacing
            ramp, so moving from Fluent UI is a rename: <C>spacingHorizontalM</C> → <C>px-3</C>. Keep padding, margin and gap within these ten
            steps; element sizes (<C>h-8</C>, <C>size-5</C>, <C>w-64</C>) use the other numbers.
          </P>
          <P>
            The old uppercase aliases (<C>p-M</C>, <C>gap-SNudge</C>) still work but are deprecated since 0.10 and will be removed in 1.0.
            Replace them using the right-hand column of the table.
          </P>
          <div className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
            {SPACING.map((s) => (
              <div key={s.step} className="flex items-center gap-4 border-b border-stroke-3 px-4 py-2 last:border-b-0">
                <span className="w-16 font-mono text-caption1 font-semibold text-brand-foreground-1">p-{s.step}</span>
                <span className="w-12 font-mono text-caption1 text-foreground-3">{s.px}px</span>
                <span className={cn("h-3 rounded-small bg-brand-background", s.bar)} />
                <span className="ms-auto font-mono text-caption1 text-foreground-3">
                  <span className="sr-only">Old alias: </span>p-{s.fluent}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DocSection>

      <DocSection
        id="variants"
        title="Overrides & variants"
        description="For a one-off override, use className. For something you repeat in many places, package it as a variant with class-variance-authority (cva)."
      >
        <div className="flex flex-col gap-4">
          <P>
            Since the source lives in your project, the shadcn way is to edit the <C>variants</C> table in <C>Button.tsx</C> directly. To
            keep the original file untouched so updates stay easy, wrap the component and add variants with <C>cva</C>:
          </P>
          <Demo>
            <PillButton>Neutral</PillButton>
            <PillButton tone="brand" icon={<Star20Regular />}>
              Starred
            </PillButton>
            <PillButton tone="brand" size="small">
              Small
            </PillButton>
          </Demo>
          <CodeBlock code={CVA_CODE} />
          <P>
            Components also export their variant functions so you can style other elements: <C>buttonVariants</C>, <C>linkVariants</C>,{" "}
            <C>imageVariants</C>, <C>toggleButtonVariants</C>. For example <C>{`<a className={buttonVariants({ appearance: "primary" })}>`}</C>,
            although <C>{"<Button asChild>"}</C> is usually shorter (see Slots).
          </P>
        </div>
      </DocSection>

      <DocSection
        id="state"
        title="Data attributes & important"
        description="Radix writes state to the DOM as data attributes. Style states with data-[…] variants instead of React state."
      >
        <div className="flex flex-col gap-4">
          <Demo>
            <Menu>
              <MenuTrigger asChild>
                <Button
                  appearance="subtle"
                  icon={<ChevronDown20Regular className="transition-transform duration-normal" />}
                  iconPosition="after"
                  className="data-[state=open]:bg-subtle-pressed data-[state=open]:text-foreground-1 data-[state=open]:[&_svg]:rotate-180"
                >
                  Sort
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuItem>Newest</MenuItem>
                <MenuItem>Oldest</MenuItem>
                <MenuItem>Name A → Z</MenuItem>
              </MenuPopover>
            </Menu>
            <Button icon={<Star20Regular className="size-4!" />}>16px icon in a medium button</Button>
          </Demo>
          <CodeBlock
            code={`<MenuTrigger asChild>
  <Button
    appearance="subtle"
    icon={<ChevronDown20Regular className="transition-transform duration-normal" />}
    iconPosition="after"
    className="data-[state=open]:bg-subtle-pressed data-[state=open]:text-foreground-1 data-[state=open]:[&_svg]:rotate-180"
  >
    Sort
  </Button>
</MenuTrigger>

{/* A medium Button sets [&_svg]:size-5, so a 16px icon needs the ! suffix (Tailwind v4) */}
<Button icon={<Star20Regular className="size-4!" />}>16px icon in a medium button</Button>`}
          />
          <SimpleTable
            head={["Attribute", "Set by", "Example variant"]}
            rows={[
              [<C key="a">data-state=&quot;open | closed&quot;</C>, "Menu, Popover, Dialog, Tooltip, Accordion, Collapsible trigger & content", <C key="b">data-[state=open]:bg-subtle-pressed</C>],
              [<C key="a">data-state=&quot;checked | unchecked&quot;</C>, "Checkbox, Switch, Radio, MenuItemCheckbox", <C key="b">data-[state=checked]:bg-brand-background</C>],
              [<C key="a">data-state=&quot;active&quot;</C>, "TabsTrigger, TabsContent", <C key="b">data-[state=active]:font-semibold</C>],
              [<C key="a">data-highlighted</C>, "Menu and Dropdown items (keyboard / mouse)", <C key="b">data-highlighted:bg-background-1-hover</C>],
              [<C key="a">data-disabled</C>, "Disabled items, Slider, Dropdown trigger", <C key="b">data-disabled:text-foreground-disabled</C>],
              [<C key="a">data-side=&quot;top | bottom…&quot;</C>, "Floating surfaces after positioning (including when flipped)", <C key="b">data-[side=top]:origin-bottom</C>],
            ]}
          />
          <P>
            Use the <C>!</C> suffix (Tailwind v4 syntax, placed at the <strong className="font-semibold">end</strong> of the class) only when a
            parent component sets a more specific selector such as <C>[&_svg]:size-5</C>. Don&apos;t sprinkle <C>!</C> to beat the
            component&apos;s own classes; your className already comes last in <C>cn()</C>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="shared"
        title="Shared classes"
        description="When you write a new control, build it from the shared classes to keep the Fluent look instead of copying class strings."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Class", "Exported from", "Used for"]}
            rows={[
              [<C key="a">fieldControlClass</C>, "Field", "Input shell: stroke-1 border, stroke-accessible bottom edge, 2px brand bar that grows from the center on focus; data-invalid / data-disabled."],
              [<C key="a">fieldAppearanceClass[appearance]</C>, "Select", "Same as above, per appearance: outline / underline / filled-darker / filled-lighter."],
              [<C key="a">popoverSurfaceClass</C>, "Popover", "Floating surface: z-50, bg-background-1, shadow-16, open / close animation."],
              [<C key="a">menuPopoverClass</C>, <span key="b">Menu</span>, "Menu surface (Menu, ContextMenu, Menubar)."],
              [<C key="a">menuItemClass</C>, "Menu", "32px menu item, highlighted through data-highlighted."],
              [<C key="a">listboxOptionClass</C>, "Dropdown", "Listbox option (Dropdown, Combobox, TagPicker)."],
              [<C key="a">cmdkOptionClass</C>, "Combobox", "cmdk option: highlighted through data-selected=true."],
            ]}
          />
          <P>Example: a custom read-only field that still has the stroke-accessible bottom edge and the brand bar on focus (click it or Tab to it):</P>
          <Demo>
            <div
              tabIndex={0}
              role="textbox"
              aria-readonly
              aria-label="Referral code"
              className={cn(fieldControlClass, "flex h-8 w-64 items-center px-2.5 font-mono text-body1")}
            >
              YUGEN-2026-SAKURA
            </div>
          </Demo>
          <CodeBlock
            code={`import { fieldControlClass } from "@/components/ui";
import { cn } from "@/lib/cn";

<div
  tabIndex={0}
  role="textbox"
  aria-readonly
  aria-label="Referral code"
  className={cn(fieldControlClass, "flex h-8 w-64 items-center px-2.5 font-mono text-body1")}
>
  YUGEN-2026-SAKURA
</div>`}
          />
        </div>
      </DocSection>

      <DocSection
        id="media-object"
        title="The media object pattern"
        description="Avatar or icon, a text block and actions: a layout found everywhere. Three classes decide whether it breaks."
      >
        <div className="flex flex-col gap-4">
          <Demo className="flex-col items-stretch">
            {PEOPLE.map((p) => (
              <div key={p.name} className="flex w-full max-w-md items-center gap-3">
                <Avatar name={p.name} color="colorful" size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body1 font-semibold text-foreground-1">{p.name}</p>
                  <p className="truncate text-caption1 text-foreground-3" title={p.role}>
                    {p.role}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="small">Message</Button>
                  <Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />
                </div>
              </div>
            ))}
          </Demo>
          <CodeBlock code={MEDIA_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <C>min-w-0 flex-1</C> on the text block: a flex item doesn&apos;t shrink below its content by default, so without{" "}
              <C>min-w-0</C>, <C>truncate</C> has no effect and the row overflows.
            </li>
            <li>
              <C>shrink-0</C> on the avatar and the action group keeps their size when the text is long.
            </li>
            <li>
              <C>gap-*</C> instead of margins, which stays correct in RTL. CardHeader, ListItem, TableCellLayout and Persona already package
              this pattern.
            </li>
          </ul>
          <DoDont
            dos={[
              "Merge classes with cn() and put the user's className last.",
              "Use token utilities (text-foreground-2, p-3, rounded-medium, shadow-16).",
              "Style states with the data-[state=…] attributes Radix already sets.",
            ]}
            donts={[
              "Don't use arbitrary values (#hex, 14px, 120ms) or the Tailwind palette (bg-blue-500).",
              "Don't use dark:. The theme lives in the tokens.",
              "Don't use ml/mr/pl/pr/left/right; use ms/me/ps/pe/start/end.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}

function MessageNote({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl rounded-medium border border-stroke-2 bg-background-3 px-3 py-2 text-body1 text-foreground-2">{children}</div>
  );
}
