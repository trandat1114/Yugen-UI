import * as React from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  Checkmark20Regular,
  ChevronRight16Regular,
  Play20Regular,
  Search20Regular,
  Send20Regular,
} from "@fluentui/react-icons";
import {
  Breadcrumb,
  Button,
  Input,
  Label,
  Pagination,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  YugenProvider,
  type YugenDir,
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

const COPY = {
  rtl: {
    lang: "ar",
    hello: "مرحبا بك في يوغن",
    crumbs: ["الرئيسية", "المستندات", "التقارير"],
    search: "ابحث…",
    notify: "الإشعارات",
    volume: "مستوى الصوت",
    next: "التالي",
    back: "رجوع",
    tabs: ["عام", "الأمان", "الفوترة"],
    panel: "إعدادات الحساب العامة.",
  },
  ltr: {
    lang: "en",
    hello: "Welcome to Yugen",
    crumbs: ["Home", "Docs", "Reports"],
    search: "Search…",
    notify: "Notifications",
    volume: "Volume",
    next: "Next",
    back: "Back",
    tabs: ["General", "Security", "Billing"],
    panel: "General account settings.",
  },
} as const;

function DirectionDemo() {
  const [dir, setDir] = React.useState<YugenDir>("rtl");
  const t = COPY[dir];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Label id="rtl-demo-dir" weight="semibold">
          Text direction of the frame
        </Label>
        <RadioGroup aria-labelledby="rtl-demo-dir" layout="horizontal" value={dir} onValueChange={(v) => setDir(v as YugenDir)}>
          <Radio value="rtl" label="RTL (Arabic)" />
          <Radio value="ltr" label="LTR (English)" />
        </RadioGroup>
      </div>
      <YugenProvider dir={dir} lang={t.lang} className="flex flex-col gap-4 rounded-2xlarge border border-stroke-2 p-6">
        <h3 className="text-title3 font-semibold text-foreground-1">{t.hello}</h3>
        <Breadcrumb items={t.crumbs.map((label) => ({ label }))} />
        <div className="flex flex-wrap items-center gap-3">
          <Input aria-label={t.search} placeholder={t.search} contentBefore={<Search20Regular />} rootClassName="w-64" />
          <Switch label={t.notify} defaultChecked />
        </div>
        <Slider label={t.volume} showValue defaultValue={[30]} rootClassName="max-w-sm" />
        <Tabs defaultValue="0">
          <TabsList>
            {t.tabs.map((label, i) => (
              <TabsTrigger key={label} value={String(i)}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="0">{t.panel}</TabsContent>
          <TabsContent value="1">{t.panel}</TabsContent>
          <TabsContent value="2">{t.panel}</TabsContent>
        </Tabs>
        <Pagination pageCount={10} defaultPage={3} />
        <div className="flex flex-wrap gap-2">
          <Button icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />}>{t.back}</Button>
          <Button appearance="primary" icon={<ArrowRight20Regular className="rtl:-scale-x-100" />} iconPosition="after">
            {t.next}
          </Button>
        </div>
      </YugenProvider>
    </div>
  );
}

const ENABLE_CODE = `// Whole app: sets dir="rtl" on <html> and passes the direction to Radix
<YugenProvider applyToDocument dir="rtl" theme="light">
  <App />
</YugenProvider>

// Or a single region (for example, to preview a translation)
<YugenProvider dir="rtl" lang="ar" className="rounded-xlarge p-5">
  <Breadcrumb items={[{ label: "الرئيسية" }, { label: "المستندات" }]} />
</YugenProvider>`;

const HTML_CODE = `<!-- Set it in the HTML so the page does not switch direction while it loads -->
<html lang="ar" dir="rtl" data-theme="light">`;

const DEMO_CODE = `<YugenProvider dir="rtl" lang="ar" className="flex flex-col gap-4 rounded-2xlarge border border-stroke-2 p-6">
  <Breadcrumb items={[{ label: "الرئيسية" }, { label: "المستندات" }, { label: "التقارير" }]} />
  <Input aria-label="ابحث" placeholder="ابحث…" contentBefore={<Search20Regular />} rootClassName="w-64" />
  <Switch label="الإشعارات" defaultChecked />
  <Slider label="مستوى الصوت" showValue defaultValue={[30]} rootClassName="max-w-sm" />
  <Pagination pageCount={10} defaultPage={3} />
  <Button appearance="primary" icon={<ArrowRight20Regular className="rtl:-scale-x-100" />} iconPosition="after">
    التالي
  </Button>
</YugenProvider>`;

const ICON_CODE = `{/* Directional icons: flip with the reading direction */}
<ChevronRight16Regular className="rtl:-scale-x-100" />
<Button icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />}>Back</Button>

{/* Physical transforms: write both branches */}
<span className="translate-x-5.5 rtl:-translate-x-5.5" />

{/* Open / close chevron: flip first, then rotate the other way in RTL */}
<ChevronRight20Regular className="rtl:-scale-x-100 group-data-[state=open]:rotate-90 rtl:group-data-[state=open]:-rotate-90" />`;

const KEYBOARD_CODE = `import { useDirection } from "@radix-ui/react-direction";

/** ← / → follow the reading direction: in RTL, ArrowLeft means "forward". */
export function useInlineArrowKeys(onPrev: () => void, onNext: () => void) {
  const dir = useDirection(); // "ltr" | "rtl" — from YugenProvider
  return (event: React.KeyboardEvent) => {
    const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const prevKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (event.key === nextKey) {
      event.preventDefault();
      onNext();
    } else if (event.key === prevKey) {
      event.preventDefault();
      onPrev();
    }
  };
}`;

const ICONS = [
  { icon: <ArrowRight20Regular className="rtl:-scale-x-100" />, name: "Forward / back arrow", flip: true },
  { icon: <ChevronRight16Regular className="size-5 rtl:-scale-x-100" />, name: "Navigation chevron", flip: true },
  { icon: <Send20Regular className="rtl:-scale-x-100" />, name: "Send", flip: true },
  { icon: <Search20Regular />, name: "Search", flip: false },
  { icon: <Checkmark20Regular />, name: "Checkmark", flip: false },
  { icon: <Play20Regular />, name: "Play media", flip: false },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="enable"
        title="Enable RTL"
        description="One dir prop on YugenProvider: the wrapper (or <html> with applyToDocument) gets dir, and Radix's DirectionProvider passes the direction to every component."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={ENABLE_CODE} />
          <CodeBlock code={HTML_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              CSS: the <C>dir</C> attribute reverses flex, grid, the default text-align and every logical utility (<C>ms-*</C>, <C>ps-*</C>,{" "}
              <C>start-*</C>…).
            </li>
            <li>
              Behavior: Tabs, Menu (submenus open to the left), RadioGroup, Slider, ToggleGroup, ScrollArea, Toolbar, Tree, List, Carousel,
              TagPicker, InputOTP and Rating read the direction from <C>DirectionProvider</C> to reverse arrow keys and drag direction.
            </li>
            <li>
              Overlays: Popover, Tooltip, HoverCard, Dialog, Drawer, Menu and listbox put the provider&apos;s <C>dir</C> on their surface even
              though they render in a portal. The Toaster from <C>withToaster</C> uses the logical position <C>bottom-end</C>, so it moves to
              the left corner in RTL.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="demo"
        title="Live example"
        description="Switch the text direction of the frame below, then Tab in and use the arrow keys on Tabs and Slider: ← / → swap roles in RTL."
      >
        <div className="flex flex-col gap-4">
          <DirectionDemo />
          <CodeBlock code={DEMO_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="logical"
        title="Logical utilities"
        description="A rule for component authors: no physical directions in layout. Logical utilities follow dir on their own, without an rtl: variant."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Don't use (physical)", "Use (logical)", "CSS"]}
            rows={[
              [<C key="a">ml-* / mr-*</C>, <C key="b">ms-* / me-*</C>, "margin-inline-start / end"],
              [<C key="a">pl-* / pr-*</C>, <C key="b">ps-* / pe-*</C>, "padding-inline-start / end"],
              [<C key="a">left-* / right-*</C>, <C key="b">start-* / end-*</C>, "inset-inline-start / end"],
              [<C key="a">border-l / border-r</C>, <C key="b">border-s / border-e</C>, "border-inline-start / end"],
              [<C key="a">rounded-l-* / rounded-r-*</C>, <C key="b">rounded-s-* / rounded-e-*</C>, "border-start-start-radius…"],
              [<C key="a">rounded-tl-* / rounded-tr-*</C>, <C key="b">rounded-ss-* / rounded-se-*</C>, "border-start-start / start-end-radius"],
              [<C key="a">text-left / text-right</C>, <C key="b">text-start / text-end</C>, "text-align: start / end"],
              [<C key="a">space-x-* with manual margins</C>, <C key="b">gap-*</C>, "gap has no direction"],
            ]}
          />
          <P>
            Valid exceptions: centering with <C>left-1/2 -translate-x-1/2</C> (it is symmetric), and content that is always LTR, such as
            source code, phone numbers and URLs. Wrap it in <C>{'<bdi>'}</C> or <C>dir=&quot;ltr&quot;</C> so the bidi algorithm does not
            reorder its characters.
          </P>
          <div
            dir="rtl"
            lang="ar"
            className="flex max-w-xl flex-col gap-1 rounded-xlarge border border-stroke-2 bg-background-1 p-4 text-body1 text-foreground-1"
          >
            <p>
              اتصل بنا: <bdi>+84 912 345 678</bdi>
            </p>
            <p>
              الرمز: <code dir="ltr" className="rounded-small bg-background-4 px-1 font-mono text-caption1">npm run dev</code>
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection
        id="icons"
        title="Flipping icons & transforms"
        description="Icons that show a direction (forward, back, send, indent) flip in RTL. Icons that show an object or a concept stay as they are."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["ltr", "rtl"] as const).map((d) => (
              <div key={d} dir={d} className="rounded-xlarge border border-stroke-2 bg-background-1 p-4">
                <p className="mb-2 font-mono text-caption1 text-foreground-3">dir=&quot;{d}&quot;</p>
                <ul className="flex flex-col gap-2">
                  {ICONS.map((i) => (
                    <li key={i.name} className="flex items-center gap-3 text-body1 text-foreground-1">
                      <span className="flex size-8 items-center justify-center rounded-medium bg-background-3 text-foreground-2">{i.icon}</span>
                      <span className="min-w-0 flex-1">{i.name}</span>
                      <span className={cn("text-caption1", i.flip ? "text-brand-foreground-1" : "text-foreground-3")}>
                        {i.flip ? "flip" : "keep"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <CodeBlock code={ICON_CODE} />
          <P>
            Tailwind&apos;s <C>rtl:</C> variant matches elements inside any ancestor with <C>dir=&quot;rtl&quot;</C>, so it also works with
            nested YugenProviders. Use it for every physical value that has no logical counterpart: <C>translate-x</C>, <C>rotate</C>,{" "}
            <C>scale-x</C>, angled gradients, background-position.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="keyboard"
        title="Arrow keys"
        description="Radix components and the Yugen components with horizontal navigation already swap ← / →. In your own components, read the direction with useDirection()."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={KEYBOARD_CODE} />
          <P>
            <C>useYugen().dir</C> gives the same value, but <C>useDirection()</C> from <C>@radix-ui/react-direction</C> also works outside
            Yugen (under any <C>DirectionProvider</C>). ↑ / ↓ and Home / End do not depend on the text direction.
          </P>
        </div>
      </DocSection>

      <DocSection id="testing" title="Testing" description="Broken RTL usually shows up in spacing, icons and keys, so check each of them.">
        <div className="flex flex-col gap-4">
          <ol className="flex max-w-3xl list-decimal flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Switch LTR / RTL in the top bar of the docs site and go through your component&apos;s page.</li>
            <li>Compare spacing on both sides: icons in buttons, input padding and the selection bar of Nav / Tabs must switch sides.</li>
            <li>Use the keyboard: ← / → on Tabs, Slider, Toolbar, submenus and Carousel must follow the reading direction.</li>
            <li>Open overlays (Menu, Popover, Tooltip, Drawer start / end) and toasts. They render in portals.</li>
            <li>Search the source for leftover physical utilities:</li>
          </ol>
          <CodeBlock
            code={`# List physical classes to review (ignore left-1/2 centering matches)
rg -n "\\b(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|text-left|text-right)-" src/components`}
          />
          <DoDont
            dos={[
              "Use ms/me/ps/pe/start/end/border-s/border-e/rounded-s/rounded-e/text-start.",
              "Flip directional icons with rtl:-scale-x-100.",
              "Set lang along with dir so screen readers use the right language.",
            ]}
            donts={[
              "Flipping logos, checkmarks, magnifying glasses or media icons.",
              "Writing dir === 'rtl' branches in JS for what logical CSS already handles.",
              "Assuming ArrowRight always means “next”.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
