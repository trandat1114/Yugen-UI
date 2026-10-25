import type { ReactNode } from "react";
import { MessageBar } from "@/components/ui";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

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

/** Table cell with a list of component / prop names as code. */
function Names({ items }: { items: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {items.map((n) => (
        <C key={n}>{n}</C>
      ))}
    </span>
  );
}

const PROVIDER_CODE = `// Fluent UI React v9
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

<FluentProvider theme={webLightTheme} dir="ltr">
  <App />
</FluentProvider>

// Yugen UI
import { YugenProvider } from "@/components/ui";

<YugenProvider applyToDocument withToaster theme="light" brand="web" dir="ltr">
  <App />
</YugenProvider>`;

const BRAND_CODE = `// Fluent: BrandVariants 10 → 160 passed to createLightTheme / createDarkTheme
const brand: BrandVariants = { 10: "#061724", 20: "#082338", /* … */ 160: "#ebf3fc" };
const theme = createLightTheme(brand);

/* Yugen: the same 16 steps, declared once in tokens.css; light and dark pick the right step */
[data-brand="contoso"] {
  --brand-10: #061724;
  --brand-20: #082338;
  /* … */
  --brand-160: #ebf3fc;
}`;

const STYLES_CODE = `// Fluent UI React v9 with Griffel
import { makeStyles, tokens, typographyStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: \`\${tokens.spacingVerticalL} \${tokens.spacingHorizontalXL}\`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
    ":hover": { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  title: { ...typographyStyles.subtitle1, color: tokens.colorNeutralForeground1 },
  meta: { ...typographyStyles.caption1, color: tokens.colorNeutralForeground3 },
});

function Tile() {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Revenue</h3>
      <span className={styles.meta}>Updated 5 minutes ago</span>
    </div>
  );
}

// Yugen UI: the same tokens, written as utilities
function Tile() {
  return (
    <div className="flex flex-col gap-2 rounded-medium bg-background-1 px-5 py-4 shadow-4 hover:bg-background-1-hover">
      <h3 className="text-subtitle1 font-semibold text-foreground-1">Revenue</h3>
      <span className="text-caption1 text-foreground-3">Updated 5 minutes ago</span>
    </div>
  );
}`;

const TOAST_CODE = `// Fluent UI React v9
const toasterId = useId("toaster");
const { dispatchToast } = useToastController(toasterId);
dispatchToast(
  <Toast>
    <ToastTitle>Saved</ToastTitle>
    <ToastBody>Changes take effect immediately.</ToastBody>
  </Toast>,
  { intent: "success" },
);
<Toaster toasterId={toasterId} />

// Yugen UI: options are an object, no JSX needed
const { dispatchToast } = useToast("settings");
dispatchToast({ intent: "success", title: "Saved", body: "Changes take effect immediately." });
<Toaster toasterId="settings" />

// Or the static helper for the default Toaster (YugenProvider withToaster)
toast({ intent: "success", title: "Saved" });`;

const OPTIONS_CODE = `// Fluent UI React v9
<Combobox placeholder="Choose a city" onOptionSelect={(_, data) => setCity(data.optionValue)}>
  <Option value="hn">Hanoi</Option>
  <Option value="dn">Da Nang</Option>
</Combobox>

// Yugen UI: options is an array, the callback gets the value
<Combobox
  placeholder="Choose a city"
  options={[
    { value: "hn", label: "Hanoi" },
    { value: "dn", label: "Da Nang" },
  ]}
  onValueChange={setCity}
/>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="differences"
        title="Core differences"
        description="The design language is the same. Yugen differs in how it is distributed, how styles are written and which libraries handle behavior."
      >
        <SimpleTable
          head={["", "Fluent UI React v9", "Yugen UI"]}
          rows={[
            ["Distribution", <C key="a">@fluentui/react-components</C>, "The yugen-ui npm package, or the source copied into your project (src/components/ui)"],
            ["Styling", "Griffel: makeStyles + tokens (CSS-in-JS at runtime / build time)", "Tailwind CSS v4 utilities, mapped 1:1 to the same token names"],
            ["Theme", <>Theme object (<C>webLightTheme</C>) through <C>FluentProvider</C></>, <>CSS custom properties per <C>data-theme</C> / <C>data-brand</C> through <C>YugenProvider</C></>],
            ["Customizing parts", "Slots (root, icon, content…)", "asChild, ReactNode props, compound components, render-props (see Slots)"],
            ["Behavior & a11y", "Own implementation + Tabster", "Radix UI, cmdk, react-day-picker"],
            ["Callbacks", <C key="a">(event, data) =&gt; …</C>, <C key="a">(value) =&gt; …</C>],
            ["Icons", <C key="a">@fluentui/react-icons</C>, "The same"],
          ]}
        />
      </DocSection>

      <DocSection
        id="provider"
        title="Provider & theme"
        description="FluentProvider → YugenProvider. The theme object becomes two attributes."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={PROVIDER_CODE} />
          <SimpleTable
            head={["Fluent v9", "Yugen UI"]}
            rows={[
              [<C key="a">webLightTheme</C>, <C key="b">theme=&quot;light&quot; brand=&quot;web&quot;</C>],
              [<C key="a">webDarkTheme</C>, <C key="b">theme=&quot;dark&quot; brand=&quot;web&quot;</C>],
              [<C key="a">teamsLightTheme / teamsDarkTheme</C>, <C key="b">brand=&quot;teams&quot;</C>],
              [<C key="a">teamsHighContrastTheme</C>, <><C>theme=&quot;high-contrast&quot;</C> (included in tokens.css)</>],
              [<C key="a">createLightTheme(brandVariants)</C>, <><C>[data-brand=&quot;name&quot;]</C> with <C>--brand-10 … --brand-160</C></>],
              [<C key="a">useFluent().dir</C>, <><C>useYugen()</C> → <C>{"{ theme, brand, dir }"}</C>, or Radix&apos;s <C>useDirection()</C></>],
            ]}
          />
          <CodeBlock code={BRAND_CODE} />
          <P>
            Fluent brand ramps (<C>BrandVariants</C> 10 → 160) work unchanged. Yugen&apos;s default brand is Sakura; for the original Fluent
            look, set <C>brand=&quot;web&quot;</C>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="styles"
        title="makeStyles → utilities"
        description="Alias token names match Fluent, so every tokens.* has a matching utility. Drop the useStyles hook and write classes directly."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={STYLES_CODE} />
          <SimpleTable
            head={["Fluent token", "Yugen utility", "Notes"]}
            rows={[
              [<C key="a">tokens.colorNeutralForeground1 … 4</C>, <C key="b">text-foreground-1 … 4</C>, ""],
              [<C key="a">tokens.colorNeutralForegroundOnBrand</C>, <C key="b">text-foreground-on-brand</C>, ""],
              [<C key="a">tokens.colorBrandForegroundLink</C>, <C key="b">text-link</C>, "Hover: text-link-hover"],
              [<C key="a">tokens.colorNeutralBackground1(Hover|Pressed)</C>, <C key="b">bg-background-1, hover:bg-background-1-hover…</C>, ""],
              [<C key="a">tokens.colorSubtleBackgroundHover</C>, <C key="b">hover:bg-subtle-hover</C>, ""],
              [<C key="a">tokens.colorBrandBackground</C>, <C key="b">bg-brand-background</C>, "Background2: bg-brand-background-2"],
              [<C key="a">tokens.colorNeutralStroke1 / 2 / Accessible</C>, <C key="b">border-stroke-1 / 2 / accessible</C>, ""],
              [<C key="a">tokens.colorStrokeFocus2</C>, <C key="b">outline-stroke-focus</C>, "Already applied on :focus-visible"],
              [<C key="a">tokens.colorStatusDangerForeground1</C>, <C key="b">text-danger-foreground-1</C>, "Same for success / warning"],
              [<C key="a">tokens.colorPaletteTealBackground2</C>, <C key="b">bg-teal-bg</C>, "cranberry, marigold, teal, lavender, forest, steel"],
              [<C key="a">tokens.spacingHorizontalM / spacingVerticalM</C>, <C key="b">px-3 / py-3, gap-3</C>, "One scale for both axes"],
              [<C key="a">tokens.spacingHorizontalSNudge</C>, <C key="b">px-1.5</C>, "The Fluent ramp matches Tailwind's numeric scale"],
              [<C key="a">tokens.borderRadiusMedium / Circular</C>, <C key="b">rounded-medium / rounded-circular</C>, ""],
              [<C key="a">tokens.shadow4 / 16 / 64</C>, <C key="b">shadow-4 / shadow-16 / shadow-64</C>, ""],
              [<C key="a">typographyStyles.body1 / subtitle1</C>, <C key="b">text-body1 / text-subtitle1 font-semibold</C>, "Weight is a separate class"],
              [<C key="a">tokens.fontWeightSemibold</C>, <C key="b">font-semibold</C>, "Only normal / semibold"],
              [<C key="a">tokens.durationNormal, curveDecelerateMid</C>, <C key="b">duration-normal ease-decelerate-mid</C>, ""],
              [<C key="a">tokens.fontFamilyMonospace</C>, <C key="b">font-mono</C>, ""],
            ]}
          />
          <P>
            When you need plain CSS (complex selectors, third-party libraries), the color, radius, shadow and motion aliases are CSS variables
            with the Fluent names: <C>var(--colorNeutralStroke1)</C>, <C>var(--borderRadiusMedium)</C>, <C>var(--shadow16)</C>. Spacing is the
            exception and merges the two axes: <C>spacingHorizontalM</C> and <C>spacingVerticalM</C> are both <C>var(--spacingM)</C>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="components"
        title="Component mapping"
        description="Most components keep their names and props (appearance, size, shape, icon, intent). The notes column lists what to change when you migrate."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Fluent v9", "Yugen UI", "Notes"]}
            rows={[
              [<Names key="a" items={["FluentProvider"]} />, <Names key="b" items={["YugenProvider"]} />, "See Provider & theme."],
              [<Names key="a" items={["Button"]} />, <Names key="b" items={["Button"]} />, <>Adds <C>appearance=&quot;danger&quot;</C>; <C>as=&quot;a&quot;</C> → <C>asChild</C>.</>],
              [<Names key="a" items={["CompoundButton"]} />, "—", "A Button with two lines of text, or an interactive Card."],
              [<Names key="a" items={["MenuButton"]} />, <Names key="b" items={["Menu", "MenuTrigger asChild", "Button"]} />, <>Button with <C>icon={"{<ChevronDown20Regular />}"}</C> <C>iconPosition=&quot;after&quot;</C>.</>],
              [<Names key="a" items={["SplitButton"]} />, <Names key="b" items={["SplitButton"]} />, <>Pass the menu through the <C>menu</C> prop.</>],
              [<Names key="a" items={["ToggleButton"]} />, <Names key="b" items={["ToggleButton"]} />, <><C>checked</C> + <C>onCheckedChange</C>, plus <C>checkedIcon</C>.</>],
              [<Names key="a" items={["Link", "Toolbar"]} />, <Names key="b" items={["Link", "Toolbar", "ToolbarButton", "ToolbarToggleButton", "ToolbarDivider", "ToolbarGroup"]} />, <>Link adds <C>external</C>.</>],
              [<Names key="a" items={["Field", "Label", "InfoLabel"]} />, <Names key="b" items={["Field", "Label", "InfoLabel"]} />, "Same props; Field also accepts a render-prop."],
              [<Names key="a" items={["Input", "Textarea", "SearchBox", "SpinButton"]} />, <Names key="b" items={["Input", "Textarea", "SearchBox", "SpinButton"]} />, <>Same <C>appearance</C>, <C>contentBefore / After</C>; <C>onChange(ev, data)</C> → React&apos;s native <C>onChange(ev)</C>; SearchBox and SpinButton also have <C>onValueChange(value)</C>.</>],
              [<Names key="a" items={["Select"]} />, <Names key="b" items={["Select"]} />, <>A native <C>{"<select>"}</C>, as in Fluent.</>],
              [<Names key="a" items={["Dropdown", "Option", "OptionGroup"]} />, <Names key="b" items={["Dropdown", "DropdownOption", "DropdownGroup"]} />, <><C>selectedOptions / onOptionSelect</C> → <C>value / onValueChange</C>.</>],
              [<Names key="a" items={["Combobox", "Option"]} />, <Names key="b" items={["Combobox"]} />, <>Option children → an <C>options</C> array; supports <C>multiselect</C>, <C>freeform</C>.</>],
              [<Names key="a" items={["TagPicker", "TagPickerControl", "TagPickerInput", "TagPickerList", "TagPickerOption"]} />, <Names key="b" items={["TagPicker"]} />, <>One component: <C>options</C> + <C>value / onValueChange</C>.</>],
              [<Names key="a" items={["Checkbox", "RadioGroup", "Radio", "Switch"]} />, <Names key="b" items={["Checkbox", "RadioGroup", "Radio", "Switch"]} />, <><C>onChange(ev, data)</C> → <C>onCheckedChange(checked)</C> / <C>onValueChange(value)</C>.</>],
              [<Names key="a" items={["Slider"]} />, <Names key="b" items={["Slider"]} />, <><C>value</C> is an <strong className="font-semibold">array</strong> of numbers (<C>[40]</C>); ranges with two thumbs are supported.</>],
              [<Names key="a" items={["Rating", "RatingDisplay"]} />, <Names key="b" items={["Rating", "RatingDisplay"]} />, ""],
              [<Names key="a" items={["Calendar", "DatePicker (compat)"]} />, <Names key="b" items={["Calendar", "DatePicker", "DateRangePicker"]} />, "Built on react-day-picker v10."],
              [<Names key="a" items={["TabList", "Tab"]} />, <Names key="b" items={["Tabs", "TabsList", "TabsTrigger", "TabsContent"]} />, <><C>selectedValue / onTabSelect</C> → <C>value / onValueChange</C>; panels included.</>],
              [<Names key="a" items={["Breadcrumb", "BreadcrumbItem", "BreadcrumbButton", "BreadcrumbDivider"]} />, <Names key="b" items={["Breadcrumb", "BreadcrumbItem", "BreadcrumbButton", "BreadcrumbDivider"]} />, <>Adds an <C>items</C> prop that inserts dividers and collapses extra items into “…”.</>],
              [<Names key="a" items={["Nav", "NavDrawer", "NavItem", "NavCategory", "NavSubItem"]} />, <Names key="b" items={["Nav", "NavItem", "NavCategory", "NavCategoryItem", "NavSubItem", "NavSectionHeader"]} />, "No NavDrawer: put Nav inside InlineDrawer / OverlayDrawer."],
              [<Names key="a" items={["Menu", "MenuTrigger", "MenuPopover", "MenuList", "MenuItem…"]} />, <Names key="b" items={["Menu", "MenuTrigger", "MenuPopover", "MenuItem", "MenuItemCheckbox", "MenuItemRadio"]} />, <>No <C>MenuList</C>: items go directly in MenuPopover; <C>checkedValues</C> → MenuRadioGroup / <C>checked</C>.</>],
              [<Names key="a" items={["Avatar", "AvatarGroup", "Persona"]} />, <Names key="b" items={["Avatar", "AvatarGroup", "Persona"]} />, <>Avatar has <C>presence</C> instead of PresenceBadge.</>],
              [<Names key="a" items={["Badge", "CounterBadge", "PresenceBadge"]} />, <Names key="b" items={["Badge"]} />, "CounterBadge → Badge with a number; PresenceBadge → Avatar presence / Persona presenceOnly."],
              [<Names key="a" items={["Tag", "InteractionTag", "TagGroup"]} />, <Names key="b" items={["Tag", "InteractionTag", "TagGroup"]} />, ""],
              [<Names key="a" items={["Text", "Title1…Caption2"]} />, <Names key="b" items={["Text", "Title1…Caption2"]} />, "Same preset names."],
              [<Names key="a" items={["Image"]} />, <Names key="b" items={["Image", "AspectRatio"]} />, ""],
              [<Names key="a" items={["List", "ListItem"]} />, <Names key="b" items={["List", "ListItem"]} />, <>ListItem has <C>media / title / description / actions</C> slots.</>],
              [<Names key="a" items={["Table…", "useTableFeatures"]} />, <Names key="b" items={["Table…", "TableCellLayout", "TableSelectionCell"]} />, "You manage sort / selection state (see the DataTable example on the Table page)."],
              [<Names key="a" items={["Tree", "TreeItem", "TreeItemLayout"]} />, <Names key="b" items={["Tree", "TreeItem", "TreeItemLayout"]} />, ""],
              [<Names key="a" items={["Carousel…"]} />, <Names key="b" items={["Carousel", "CarouselViewport", "CarouselCard", "CarouselNavContainer"]} />, ""],
              [<Names key="a" items={["MessageBar", "MessageBarBody", "MessageBarTitle", "MessageBarActions"]} />, <Names key="b" items={["MessageBar"]} />, <>One component: <C>title</C>, children, <C>actions</C>, <C>onDismiss</C>, <C>layout</C>.</>],
              [<Names key="a" items={["Toaster", "useToastController", "Toast…"]} />, <Names key="b" items={["Toaster", "useToast", "toast()"]} />, "Options are an object (see below)."],
              [<Names key="a" items={["ProgressBar", "Spinner", "Skeleton", "SkeletonItem"]} />, <Names key="b" items={["ProgressBar", "Spinner", "Skeleton", "SkeletonItem"]} />, ""],
              [<Names key="a" items={["Card", "CardHeader", "CardPreview", "CardFooter"]} />, <Names key="b" items={["Card", "CardHeader", "CardPreview", "CardContent", "CardFooter"]} />, ""],
              [<Names key="a" items={["Dialog", "DialogSurface", "DialogBody", "DialogTitle", "DialogContent", "DialogActions"]} />, <Names key="b" items={["Dialog", "DialogSurface", "DialogTitle", "DialogContent", "DialogActions"]} />, <>No DialogBody; for <C>modalType=&quot;non-modal&quot;</C>, use Popover.</>],
              [<Names key="a" items={["OverlayDrawer", "InlineDrawer", "DrawerHeader…"]} />, <Names key="b" items={["OverlayDrawer", "InlineDrawer", "DrawerHeader", "DrawerBody", "DrawerFooter"]} />, ""],
              [<Names key="a" items={["Popover", "PopoverSurface"]} />, <Names key="b" items={["Popover", "PopoverSurface"]} />, <><C>positioning=&quot;above-start&quot;</C> → <C>side=&quot;top&quot; align=&quot;start&quot;</C>.</>],
              [<Names key="a" items={["Tooltip"]} />, <Names key="b" items={["Tooltip", "SimpleTooltip"]} />, <><C>relationship=&quot;label&quot;</C> → set <C>aria-label</C> on the trigger yourself.</>],
              [<Names key="a" items={["Accordion", "AccordionItem", "AccordionHeader", "AccordionPanel"]} />, <Names key="b" items={["Accordion", "AccordionItem", "AccordionHeader", "AccordionPanel"]} />, <><C>openItems / onToggle</C> → <C>value / onValueChange</C>, <C>multiple</C> → <C>type=&quot;multiple&quot;</C>.</>],
              [<Names key="a" items={["Divider"]} />, <Names key="b" items={["Divider"]} />, ""],
            ]}
          />
          <CodeBlock code={OPTIONS_CODE} />
          <CodeBlock code={TOAST_CODE} />
        </div>
      </DocSection>

      <DocSection id="props" title="Renamed props" description="General rule: appearance, size, shape, icon and intent stay the same; callbacks follow Radix and receive the value instead of event + data.">
        <SimpleTable
          head={["Fluent v9", "Yugen UI"]}
          rows={[
            [<C key="a">appearance, size, shape, icon, iconPosition</C>, "Unchanged (size: small / medium / large)."],
            [<C key="a">as=&quot;a&quot;</C>, <C key="b">asChild</C>],
            [<C key="a">onChange={"{(ev, data) => data.checked}"}</C>, <C key="b">onCheckedChange={"{(checked) => …}"}</C>],
            [<C key="a">onChange={"{(ev, data) => data.value}"}</C>, <C key="b">onValueChange={"{(value) => …}"}</C>],
            [<C key="a">onOptionSelect / selectedOptions</C>, <C key="b">onValueChange / value</C>],
            [<C key="a">onTabSelect / selectedValue</C>, <C key="b">onValueChange / value</C>],
            [<C key="a">onOpenChange={"{(ev, data) => data.open}"}</C>, <C key="b">onOpenChange={"{(open) => …}"}</C>],
            [<C key="a">positioning</C>, <C key="b">side, align, sideOffset, collisionPadding</C>],
            [<C key="a">Slider value: number</C>, <C key="b">Slider value: number[]</C>],
            [<C key="a">mountNode</C>, "None. Portals always render into <body> but take the theme / brand / dir of the nearest nested YugenProvider."],
          ]}
        />
      </DocSection>

      <DocSection
        id="missing"
        title="Not in Yugen yet"
        description="Some Fluent v9 components and utilities have no equivalent yet. These are the recommended replacements."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Fluent v9", "Replacement"]}
            rows={[
              [<C key="a">DataGrid</C>, <>Table + the DataTable pattern (filter, sort, row selection, pagination) on the <a className="text-link underline hover:text-link-hover" href={docsPath("/components/table")}>Table page</a>.</>],
              [<C key="a">Overflow, useOverflowMenu</C>, "Hide items by breakpoint and collect them in a “…” Menu; Breadcrumb has maxDisplayedItems."],
              [<C key="a">ColorPicker, SwatchPicker</C>, <>An <C>{'<input type="color">'}</C> inside a Field, or a ToggleGroup of color swatches.</>],
              [<C key="a">TimePicker (compat)</C>, <>A Combobox with a list of times, or <C>{'<Input type="time">'}</C>.</>],
              [<C key="a">TeachingPopover</C>, <>PopoverSurface <C>appearance=&quot;brand&quot;</C> + navigation buttons.</>],
              [<C key="a">Virtualizer</C>, "An external virtualization library (for example @tanstack/react-virtual)."],
              [<C key="a">useArrowNavigationGroup, useFocusableGroup (Tabster)</C>, "Toolbar / ToggleGroup / List have roving focus built in; in your own components, read the direction with useDirection()."],
              [<C key="a">makeStyles, mergeClasses, shorthands</C>, <><C>cn()</C> + Tailwind utilities.</>],
              [<C key="a">Portal mountNode, nested FluentProvider for portals</C>, <>Not needed. Floating surfaces follow the nearest nested YugenProvider (<C>usePortalThemeProps()</C>).</>],
            ]}
          />
          <MessageBar intent="info" title="Migrating gradually:" className="max-w-3xl">
            the two libraries can run side by side, FluentProvider and YugenProvider don&apos;t conflict. Move one screen at a time, starting
            with the one that has the fewest complex components.
          </MessageBar>
          <DoDont
            dos={[
              "Look up Fluent token → utility in the table above; the alias names are identical.",
              "Change (ev, data) callbacks to the form that receives the value.",
              "Set brand=\"web\" to keep the original Fluent blue.",
            ]}
            donts={[
              "Don't copy hex values from a Fluent theme into className.",
              "Don't keep makeStyles next to a migrated component; its styles would come from two sources.",
              "Don't forget that Slider takes an array of numbers.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
