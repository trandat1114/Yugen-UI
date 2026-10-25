import type { ReactNode } from "react";
import { Delete20Regular, MoreHorizontal20Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, MessageBar } from "@/components/ui";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { docsPath } from "../../router";

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
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

function Names({ items }: { items: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {items.map((n) => (
        <C key={n}>{n}</C>
      ))}
    </span>
  );
}

/** Shorthand for a [shadcn, Yugen, note] row. */
function row(shadcn: string[], yugen: string[], note: ReactNode = ""): ReactNode[] {
  return [<Names key="a" items={shadcn} />, yugen.length ? <Names key="b" items={yugen} /> : "—", note];
}

const VARIANTS = [
  { shadcn: `variant="default"`, appearance: "primary" as const, label: "Primary" },
  { shadcn: `variant="secondary"`, appearance: "secondary" as const, label: "Secondary" },
  { shadcn: `variant="destructive"`, appearance: "danger" as const, label: "Danger" },
  { shadcn: `variant="outline"`, appearance: "outline" as const, label: "Outline" },
  { shadcn: `variant="ghost"`, appearance: "subtle" as const, label: "Subtle" },
  { shadcn: `variant="link"`, appearance: "transparent" as const, label: "Transparent" },
];

const VARIANT_CODE = `// shadcn/ui
<Button>Save</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon"><Trash2 /></Button>

// Yugen UI. NOTE: Button defaults to secondary, not primary
<Button appearance="primary">Save</Button>
<Button appearance="danger" size="small">Delete</Button>
<Button appearance="subtle" icon={<Delete20Regular />} aria-label="Delete" />`;

const THEME_CODE = `/* shadcn/ui: globals.css */
:root {
  --primary: oklch(0.205 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --radius: 0.625rem;
}
.dark {
  --primary: oklch(0.922 0 0);
}
/* <html class="dark"> + dark: variants in classes */

/* Yugen UI: tokens.css already has light, dark and the brands */
/* <html data-theme="dark" data-brand="web">, no dark: needed */`;

const BEFORE_CODE = `// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";

<Card className="w-full max-w-sm">
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
    <CardDescription>You have 3 unread messages.</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
    </CardAction>
  </CardHeader>
  <CardContent className="text-sm text-muted-foreground">
    The design team meeting has moved to 3:00 PM.
  </CardContent>
  <CardFooter className="gap-2">
    <Badge variant="secondary">Calendar</Badge>
    <Button variant="outline" size="sm" className="ml-auto">View all</Button>
  </CardFooter>
</Card>`;

const AFTER_CODE = `// Yugen UI
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader } from "@/components/ui";

<Card className="w-full max-w-sm">
  <CardHeader
    header="Notifications"
    description="You have 3 unread messages."
    action={<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />}
  />
  <CardContent className="text-body1 text-foreground-3">
    The design team meeting has moved to 3:00 PM.
  </CardContent>
  <CardFooter className="gap-2">
    <Badge appearance="tint" color="informative">Calendar</Badge>
    <Button appearance="outline" size="small" className="ms-auto">View all</Button>
  </CardFooter>
</Card>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="overview"
        title="Similarities & differences"
        description="If you know shadcn/ui, most of what you know still applies: the same Radix, cmdk, react-day-picker and Tailwind, and the same idea that the source code is yours."
      >
        <SimpleTable
          head={["", "shadcn/ui", "Yugen UI"]}
          rows={[
            ["Install", <C key="a">npx shadcn add button</C>, <C key="b">npx @yugen-ui/cli add button</C>],
            ["File structure", <C key="a">components/ui/button.tsx</C>, <><C>components/ui/Button/Button.tsx</C> + the <C>@/components/ui</C> barrel</>],
            ["Primitives", "Radix, cmdk, react-day-picker, vaul, sonner, embla", "Radix, cmdk, react-day-picker, react-resizable-panels (no vaul / sonner / embla)"],
            ["Design language", "Neutral, minimal", "Fluent 2: type ramp, elevation, motion and interaction states"],
            ["Variant API", <><C>variant</C>, <C>size: sm | default | lg | icon</C></>, <><C>appearance</C>, <C>size: small | medium | large</C>, <C>shape</C></>],
            ["Color tokens", <><C>--primary</C>, <C>--muted</C>… (oklch)</>, <>Fluent names: <C>--colorBrandBackground</C>, <C>--colorNeutralForeground3</C>… (hex)</>],
            ["Dark mode", <><C>.dark</C> + <C>dark:</C></>, <>Nestable <C>data-theme</C>, no <C>dark:</C></>],
            ["Icons", "lucide-react", "@fluentui/react-icons"],
          ]}
        />
      </DocSection>

      <DocSection
        id="components"
        title="Component mapping"
        description="Many components have the same name (Tabs, Tooltip, Command, ContextMenu, Menubar, HoverCard, ScrollArea, Resizable, Kbd, Empty). The table below covers the ones that differ."
      >
        <SimpleTable
          head={["shadcn/ui", "Yugen UI", "Notes"]}
          rows={[
            row(["Accordion", "AccordionTrigger", "AccordionContent"], ["Accordion", "AccordionHeader", "AccordionPanel"], <>Same Radix props (<C>type</C>, <C>collapsible</C>).</>),
            row(["Alert", "AlertTitle", "AlertDescription"], ["MessageBar"], <><C>variant=&quot;destructive&quot;</C> → <C>intent=&quot;error&quot;</C>; the title goes in <C>title</C>; also has <C>actions</C>, <C>onDismiss</C>.</>),
            row(["AlertDialog", "AlertDialogContent", "AlertDialogAction", "AlertDialogCancel"], ["Dialog", "DialogSurface modalType=\"alert\"", "DialogClose"], <>Hide the X button with <C>{"<DialogTitle action={null}>"}</C>.</>),
            row(["AspectRatio"], ["AspectRatio"], <><C>ratio</C>, as in shadcn.</>),
            row(["Avatar", "AvatarImage", "AvatarFallback"], ["Avatar"], <>One component: <C>name</C> (initials are generated), <C>src</C>, <C>presence</C>.</>),
            row(["Badge"], ["Badge"], <><C>variant</C> → <C>appearance</C> + <C>color</C>.</>),
            row(["Breadcrumb", "BreadcrumbLink", "BreadcrumbPage", "BreadcrumbSeparator", "BreadcrumbEllipsis"], ["Breadcrumb", "BreadcrumbButton", "BreadcrumbButton current", "BreadcrumbDivider", "BreadcrumbOverflow"], <>Or pass an <C>items</C> array.</>),
            row(["Button", "ButtonGroup"], ["Button", "ButtonGroup"], "See the variant table below."),
            row(["Card", "CardTitle", "CardDescription", "CardAction"], ["Card", "CardHeader"], <><C>{"<CardHeader header description action image />"}</C>.</>),
            row(["Carousel (embla)"], ["Carousel", "CarouselViewport", "CarouselCard", "CarouselNavContainer"], "No embla dependency."),
            row(["Chart"], [], "Not available yet."),
            row(["Checkbox", "RadioGroup", "RadioGroupItem"], ["Checkbox", "RadioGroup", "Radio"], <>Built-in <C>label</C> prop.</>),
            row(["Combobox (Popover + Command)"], ["Combobox"], <>A complete component: <C>options</C>, <C>multiselect</C>, <C>freeform</C>.</>),
            row(["Data Table (TanStack)"], ["Table"], "DataTable pattern on the Table page, no TanStack needed."),
            row(["Date Picker"], ["DatePicker", "DateRangePicker"], "A complete component instead of a recipe."),
            row(["Dialog", "DialogContent", "DialogHeader", "DialogFooter"], ["Dialog", "DialogSurface", "DialogTitle", "DialogActions"], <><strong className="font-semibold">Note:</strong> in shadcn, <C>DialogContent</C> is the surface; in Yugen it is the body.</>),
            row(["Drawer (vaul)"], ["Drawer", "DrawerSurface position=\"bottom\""], "No drag to close."),
            row(["DropdownMenu", "DropdownMenuContent", "DropdownMenuItem", "DropdownMenuLabel", "DropdownMenuSeparator", "DropdownMenuShortcut"], ["Menu", "MenuPopover", "MenuItem", "MenuGroupHeader", "MenuDivider", "MenuItem secondaryContent"], <><C>DropdownMenuCheckboxItem / RadioItem / Sub</C> → <C>MenuItemCheckbox / MenuItemRadio / MenuSub</C>.</>),
            row(["Field", "FieldLabel", "FieldDescription", "FieldError"], ["Field"], <>One component: <C>label</C>, <C>hint</C>, <C>validationState</C>, <C>validationMessage</C>.</>),
            row(["Form (react-hook-form)"], ["Field"], "Use the form library you prefer and pass errors to validationMessage."),
            row(["Input Group"], ["Input contentBefore / contentAfter"], ""),
            row(["Input OTP", "InputOTPGroup", "InputOTPSlot"], ["InputOTP"], <><C>maxLength</C> → <C>length</C>; group slots with <C>groups={"{[3, 3]}"}</C>.</>),
            row(["Item"], ["List", "ListItem"], <><C>media</C>, <C>title</C>, <C>description</C>, <C>actions</C>.</>),
            row(["Navigation Menu"], [], "Not available yet. Use Nav (vertical) or Menubar."),
            row(["Native Select"], ["Select"], <>A native <C>{"<select>"}</C>.</>),
            row(["Pagination", "PaginationLink", "PaginationNext"], ["Pagination"], <>One component: <C>pageCount</C>, <C>page / onPageChange</C>.</>),
            row(["Popover", "PopoverContent"], ["Popover", "PopoverSurface"], <>Adds <C>appearance</C>, <C>withArrow</C>.</>),
            row(["Progress"], ["ProgressBar"], <>shadcn takes 0–100; Yugen defaults to <C>max=1</C>, so pass <C>max={"{100}"}</C> or a value from 0 to 1.</>),
            row(["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectItem"], ["Dropdown", "DropdownOption"], "Trigger, value and content are merged into Dropdown."),
            row(["Separator"], ["Divider"], <>Can contain text; <C>vertical</C>, <C>appearance</C>.</>),
            row(["Sheet", "SheetContent side"], ["Drawer", "DrawerSurface position"], <><C>left / right</C> → <C>start / end</C> (logical).</>),
            row(["Sidebar"], ["Nav", "InlineDrawer"], ""),
            row(["Sonner / Toast"], ["Toaster", "toast()", "useToast"], <><C>toast(&quot;Saved&quot;, {"{ description }"})</C> → <C>toast({"{ title, body }"})</C>.</>),
            row(["Table", "TableHead", "TableCaption", "TableFooter"], ["Table", "TableHeaderCell"], <>For the caption / footer, use native <C>{"<caption>"}</C> and <C>{"<tfoot>"}</C>.</>),
            row(["Toggle", "ToggleGroup"], ["ToggleButton", "ToggleGroup"], <><C>pressed</C> → <C>checked</C>.</>),
            row(["Typography"], ["Text", "Title1…Caption2"], ""),
          ]}
        />
      </DocSection>

      <DocSection
        id="variants"
        title="Variants & sizes"
        description="Names follow Fluent. The difference most often missed: a Button with no appearance is secondary, not primary."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {VARIANTS.map((v) => (
              <div key={v.appearance} className="flex flex-col items-start gap-2">
                <span className="font-mono text-caption1 text-foreground-3">{v.shadcn}</span>
                <Button appearance={v.appearance}>{v.label}</Button>
                <span className="font-mono text-caption1 text-brand-foreground-1">appearance=&quot;{v.appearance}&quot;</span>
              </div>
            ))}
          </div>
          <SimpleTable
            head={["shadcn/ui", "Yugen UI"]}
            rows={[
              [<C key="a">size=&quot;sm&quot; / &quot;default&quot; / &quot;lg&quot;</C>, <C key="b">size=&quot;small&quot; / &quot;medium&quot; / &quot;large&quot;</C>],
              [<C key="a">size=&quot;icon&quot;</C>, <><C>icon</C> without children gives a square button; <C>aria-label</C> is required</>],
              [<C key="a">Badge variant=&quot;default&quot;</C>, <C key="b">appearance=&quot;filled&quot; color=&quot;brand&quot;</C>],
              [<C key="a">Badge variant=&quot;secondary&quot;</C>, <C key="b">appearance=&quot;tint&quot; color=&quot;informative&quot;</C>],
              [<C key="a">Badge variant=&quot;destructive&quot;</C>, <C key="b">color=&quot;danger&quot;</C>],
              [<C key="a">Badge variant=&quot;outline&quot;</C>, <C key="b">appearance=&quot;outline&quot;</C>],
              [<C key="a">Alert variant=&quot;destructive&quot;</C>, <C key="b">MessageBar intent=&quot;error&quot;</C>],
            ]}
          />
          <CodeBlock code={VARIANT_CODE} />
          <div className="flex flex-wrap items-center gap-2">
            <Button appearance="primary">Save</Button>
            <Button appearance="danger" size="small">
              Delete
            </Button>
            <Button appearance="subtle" icon={<Delete20Regular />} aria-label="Delete" />
          </div>
        </div>
      </DocSection>

      <DocSection
        id="css-variables"
        title="CSS variables & utilities"
        description="Map by role, not by value: find the Fluent token that does the same job."
      >
        <SimpleTable
          head={["shadcn/ui", "Yugen alias", "Yugen utility"]}
          rows={[
            [<C key="a">--background</C>, <C key="b">--colorShellBackground / --colorNeutralBackground1</C>, <><C>bg-shell</C> (page background), <C>bg-background-1</C> (surfaces)</>],
            [<C key="a">--foreground</C>, <C key="b">--colorNeutralForeground1</C>, <C key="c">text-foreground-1</C>],
            [<C key="a">--card, --popover</C>, <C key="b">--colorNeutralBackground1</C>, <C key="c">bg-background-1</C>],
            [<C key="a">--primary</C>, <C key="b">--colorBrandBackground</C>, <C key="c">bg-brand-background</C>],
            [<C key="a">--primary-foreground</C>, <C key="b">--colorNeutralForegroundOnBrand</C>, <C key="c">text-foreground-on-brand</C>],
            [<C key="a">--secondary, --muted</C>, <C key="b">--colorNeutralBackground3</C>, <C key="c">bg-background-3</C>],
            [<C key="a">--muted-foreground</C>, <C key="b">--colorNeutralForeground3</C>, <C key="c">text-foreground-3</C>],
            [<C key="a">--accent</C>, <C key="b">--colorSubtleBackgroundHover</C>, <C key="c">hover:bg-subtle-hover</C>],
            [<C key="a">--destructive</C>, <C key="b">--colorStatusDangerBackground3 / Foreground1</C>, <><C>bg-danger-background-3</C>, <C>text-danger-foreground-1</C></>],
            [<C key="a">--border</C>, <C key="b">--colorNeutralStroke2</C>, <C key="c">border-stroke-2</C>],
            [<C key="a">--input</C>, <C key="b">--colorNeutralStroke1 (+ StrokeAccessible on the bottom edge)</C>, <><C>border-stroke-1</C>, or <C>fieldControlClass</C></>],
            [<C key="a">--ring</C>, <C key="b">--colorStrokeFocus2</C>, <C key="c">outline-stroke-focus</C>],
            [<C key="a">--radius</C>, <C key="b">--borderRadiusSmall … 4XLarge, Circular</C>, <><C>rounded-small</C> 2 · <C>medium</C> 4 · <C>large</C> 6 · <C>xlarge</C> 8 · <C>circular</C></>],
            [<C key="a">--sidebar</C>, <C key="b">--colorShellNavBackground</C>, <C key="c">bg-shell-nav</C>],
            [<C key="a">--chart-1 … 5</C>, "Palette shared", <><C>bg-teal-bg</C>, <C>text-lavender-fg</C>… (use sparingly)</>],
          ]}
        />
        <div className="mt-4">
          <SimpleTable
            head={["shadcn utility", "Yugen utility"]}
            rows={[
              [<C key="a">text-xs / text-sm / text-base / text-lg</C>, <C key="b">text-caption1 / text-body1 / text-body2 / text-subtitle1</C>],
              [<C key="a">font-medium</C>, <C key="b">font-semibold (only normal / semibold exist)</C>],
              [<C key="a">rounded-md / rounded-lg / rounded-full</C>, <C key="b">rounded-medium / rounded-xlarge / rounded-circular</C>],
              [<C key="a">shadow-xs / shadow-sm / shadow-md / shadow-lg</C>, <C key="b">shadow-2 / shadow-4 / shadow-8 / shadow-16</C>],
              [<C key="a">ml-auto / pl-2 / left-0</C>, <C key="b">ms-auto / ps-2 / start-0</C>],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="theming"
        title="Theming differences"
        description="shadcn switches themes with a .dark class and a set of CSS variables. Yugen uses two nestable attributes and tokens checked for contrast."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={THEME_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Tailwind&apos;s default scales (<C>bg-zinc-900</C>, <C>text-sm</C>, <C>rounded-lg</C>) are turned off. Classes copied from shadcn
              have no effect; replace them using the tables above.
            </li>
            <li>
              There is no <C>dark:</C>: every light / dark difference is in the tokens. Nest a theme with <C>data-theme</C> on any element.
            </li>
            <li>
              The brand color is a 16-step ramp (<C>--brand-10 … 160</C>) instead of a single <C>--primary</C> variable: hover, pressed,
              selected tint, focus and link all come from the ramp. Create a ramp in the{" "}
              <a className="text-link underline hover:text-link-hover" href={docsPath("/theme-designer")}>
                Theme Designer
              </a>
              .
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="example" title="Migration example" description="A shadcn Card and the matching Yugen version.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={BEFORE_CODE} />
          <CodeBlock code={AFTER_CODE} />
          <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <Card className="w-full max-w-sm">
              <CardHeader
                header="Notifications"
                description="You have 3 unread messages."
                action={<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="More actions" />}
              />
              <CardContent className="text-body1 text-foreground-3">The design team meeting has moved to 3:00 PM.</CardContent>
              <CardFooter className="gap-2">
                <Badge appearance="tint" color="informative">
                  Calendar
                </Badge>
                <Button appearance="outline" size="small" className="ms-auto">
                  View all
                </Button>
              </CardFooter>
            </Card>
          </div>
          <MessageBar intent="info" title="Checklist for each file:" className="max-w-3xl">
            change imports to <C>@/components/ui</C>; <C>variant</C> → <C>appearance</C>; <C>size</C> sm / lg → small / large; shadcn color
            classes → token utilities; <C>ml / mr / left / right</C> → logical; lucide → Fluent icons at size 20.
          </MessageBar>
          <DoDont
            dos={[
              "Add appearance=\"primary\" to the main button; the default is secondary.",
              "Map classes by role (muted-foreground → foreground-3), not by similar lightness.",
              "Use the complete components (Combobox, DatePicker, Pagination) instead of hand-assembled recipes.",
            ]}
            donts={[
              "Don't bring over the Tailwind palette or dark:; neither exists here.",
              "Don't confuse shadcn's DialogContent (the surface) with Yugen's DialogContent (the body).",
              "Don't use font-medium; the only weights are normal and semibold.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
