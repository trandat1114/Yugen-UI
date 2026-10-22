import type { ReactNode } from "react";
import { MessageBar } from "@/components/ui";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: bảng rộng cuộn ngang được bằng bàn phím (axe scrollable-region-focusable).
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

/** Ô chứa danh sách tên component / prop dạng code. */
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

const BRAND_CODE = `// Fluent: BrandVariants 10 → 160 truyền vào createLightTheme / createDarkTheme
const brand: BrandVariants = { 10: "#061724", 20: "#082338", /* … */ 160: "#ebf3fc" };
const theme = createLightTheme(brand);

/* Yugen: cùng 16 bậc, khai báo một lần trong tokens.css — light và dark tự lấy đúng bậc */
[data-brand="contoso"] {
  --brand-10: #061724;
  --brand-20: #082338;
  /* … */
  --brand-160: #ebf3fc;
}`;

const STYLES_CODE = `// Fluent UI React v9 — Griffel
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
      <h3 className={styles.title}>Doanh thu</h3>
      <span className={styles.meta}>Cập nhật 5 phút trước</span>
    </div>
  );
}

// Yugen UI — cùng token, viết bằng utility
function Tile() {
  return (
    <div className="flex flex-col gap-2 rounded-medium bg-background-1 px-5 py-4 shadow-4 hover:bg-background-1-hover">
      <h3 className="text-subtitle1 font-semibold text-foreground-1">Doanh thu</h3>
      <span className="text-caption1 text-foreground-3">Cập nhật 5 phút trước</span>
    </div>
  );
}`;

const TOAST_CODE = `// Fluent UI React v9
const toasterId = useId("toaster");
const { dispatchToast } = useToastController(toasterId);
dispatchToast(
  <Toast>
    <ToastTitle>Đã lưu</ToastTitle>
    <ToastBody>Thay đổi có hiệu lực ngay.</ToastBody>
  </Toast>,
  { intent: "success" },
);
<Toaster toasterId={toasterId} />

// Yugen UI — tuỳ chọn là object, không cần JSX
const { dispatchToast } = useToast("settings");
dispatchToast({ intent: "success", title: "Đã lưu", body: "Thay đổi có hiệu lực ngay." });
<Toaster toasterId="settings" />

// Hoặc helper tĩnh tới Toaster mặc định (YugenProvider withToaster)
toast({ intent: "success", title: "Đã lưu" });`;

const OPTIONS_CODE = `// Fluent UI React v9
<Combobox placeholder="Chọn thành phố" onOptionSelect={(_, data) => setCity(data.optionValue)}>
  <Option value="hn">Hà Nội</Option>
  <Option value="dn">Đà Nẵng</Option>
</Combobox>

// Yugen UI — options là mảng, callback nhận thẳng giá trị
<Combobox
  placeholder="Chọn thành phố"
  options={[
    { value: "hn", label: "Hà Nội" },
    { value: "dn", label: "Đà Nẵng" },
  ]}
  onValueChange={setCity}
/>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="differences"
        title="Khác biệt cốt lõi"
        description="Ngôn ngữ thiết kế giống nhau; khác nhau ở cách phân phối, cách viết style và thư viện hành vi bên dưới."
      >
        <SimpleTable
          head={["", "Fluent UI React v9", "Yugen UI"]}
          rows={[
            ["Phân phối", <C key="a">@fluentui/react-components</C>, "Mã nguồn chép vào dự án (src/components/ui)"],
            ["Style", "Griffel: makeStyles + tokens (CSS-in-JS lúc chạy / build)", "Tailwind CSS v4 utility, map 1-1 với cùng tên token"],
            ["Theme", <>Object theme (<C>webLightTheme</C>) qua <C>FluentProvider</C></>, <>CSS custom property theo <C>data-theme</C> / <C>data-brand</C> qua <C>YugenProvider</C></>],
            ["Tuỳ biến phần con", "Slot (root, icon, content…)", "asChild, prop ReactNode, component ghép, render-prop (xem trang Slot)"],
            ["Hành vi & a11y", "Cài đặt riêng + Tabster", "Radix UI, cmdk, react-day-picker"],
            ["Callback", <C key="a">(event, data) =&gt; …</C>, <C key="a">(value) =&gt; …</C>],
            ["Icon", <C key="a">@fluentui/react-icons</C>, "Giống hệt"],
          ]}
        />
      </DocSection>

      <DocSection
        id="provider"
        title="Provider & theme"
        description="FluentProvider → YugenProvider. Theme object trở thành hai attribute."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={PROVIDER_CODE} />
          <SimpleTable
            head={["Fluent v9", "Yugen UI"]}
            rows={[
              [<C key="a">webLightTheme</C>, <C key="b">theme=&quot;light&quot; brand=&quot;web&quot;</C>],
              [<C key="a">webDarkTheme</C>, <C key="b">theme=&quot;dark&quot; brand=&quot;web&quot;</C>],
              [<C key="a">teamsLightTheme / teamsDarkTheme</C>, <C key="b">brand=&quot;teams&quot;</C>],
              [<C key="a">teamsHighContrastTheme</C>, <><C>theme=&quot;high-contrast&quot;</C> (có sẵn trong tokens.css)</>],
              [<C key="a">createLightTheme(brandVariants)</C>, <><C>[data-brand=&quot;tên&quot;]</C> với <C>--brand-10 … --brand-160</C></>],
              [<C key="a">useFluent().dir</C>, <><C>useYugen()</C> → <C>{"{ theme, brand, dir }"}</C>, hoặc <C>useDirection()</C> của Radix</>],
            ]}
          />
          <CodeBlock code={BRAND_CODE} />
          <P>
            Ramp brand của Fluent (<C>BrandVariants</C> 10 → 160) dùng lại nguyên vẹn. Brand mặc định của Yugen là Sakura; muốn giao diện giống
            Fluent gốc, đặt <C>brand=&quot;web&quot;</C>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="styles"
        title="makeStyles → utility"
        description="Tên alias token trùng Fluent, nên mỗi tokens.* có một utility tương ứng. Bỏ hook useStyles, viết class trực tiếp."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={STYLES_CODE} />
          <SimpleTable
            head={["Fluent token", "Yugen utility", "Ghi chú"]}
            rows={[
              [<C key="a">tokens.colorNeutralForeground1 … 4</C>, <C key="b">text-foreground-1 … 4</C>, ""],
              [<C key="a">tokens.colorNeutralForegroundOnBrand</C>, <C key="b">text-foreground-on-brand</C>, ""],
              [<C key="a">tokens.colorBrandForegroundLink</C>, <C key="b">text-link</C>, "Hover: text-link-hover"],
              [<C key="a">tokens.colorNeutralBackground1(Hover|Pressed)</C>, <C key="b">bg-background-1, hover:bg-background-1-hover…</C>, ""],
              [<C key="a">tokens.colorSubtleBackgroundHover</C>, <C key="b">hover:bg-subtle-hover</C>, ""],
              [<C key="a">tokens.colorBrandBackground</C>, <C key="b">bg-brand-background</C>, "Background2: bg-brand-background-2"],
              [<C key="a">tokens.colorNeutralStroke1 / 2 / Accessible</C>, <C key="b">border-stroke-1 / 2 / accessible</C>, ""],
              [<C key="a">tokens.colorStrokeFocus2</C>, <C key="b">outline-stroke-focus</C>, "Đã áp sẵn cho :focus-visible"],
              [<C key="a">tokens.colorStatusDangerForeground1</C>, <C key="b">text-danger-foreground-1</C>, "Tương tự success / warning"],
              [<C key="a">tokens.colorPaletteTealBackground2</C>, <C key="b">bg-teal-bg</C>, "cranberry, marigold, teal, lavender, forest, steel"],
              [<C key="a">tokens.spacingHorizontalM / spacingVerticalM</C>, <C key="b">px-3 / py-3, gap-3</C>, "Một thang chung cho hai trục"],
              [<C key="a">tokens.spacingHorizontalSNudge</C>, <C key="b">px-1.5</C>, "Ramp Fluent trùng thang số của Tailwind"],
              [<C key="a">tokens.borderRadiusMedium / Circular</C>, <C key="b">rounded-medium / rounded-circular</C>, ""],
              [<C key="a">tokens.shadow4 / 16 / 64</C>, <C key="b">shadow-4 / shadow-16 / shadow-64</C>, ""],
              [<C key="a">typographyStyles.body1 / subtitle1</C>, <C key="b">text-body1 / text-subtitle1 font-semibold</C>, "Weight tách riêng"],
              [<C key="a">tokens.fontWeightSemibold</C>, <C key="b">font-semibold</C>, "Chỉ normal / semibold"],
              [<C key="a">tokens.durationNormal, curveDecelerateMid</C>, <C key="b">duration-normal ease-decelerate-mid</C>, ""],
              [<C key="a">tokens.fontFamilyMonospace</C>, <C key="b">font-mono</C>, ""],
            ]}
          />
          <P>
            Khi cần CSS thuần (selector phức tạp, thư viện bên thứ ba), alias màu, bo góc, shadow, motion vẫn là biến CSS cùng tên Fluent:{" "}
            <C>var(--colorNeutralStroke1)</C>, <C>var(--borderRadiusMedium)</C>, <C>var(--shadow16)</C>. Riêng spacing gộp hai trục:{" "}
            <C>spacingHorizontalM</C> và <C>spacingVerticalM</C> đều là <C>var(--spacingM)</C>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="components"
        title="Bảng tương ứng component"
        description="Đa số giữ nguyên tên và prop (appearance, size, shape, icon, intent). Cột ghi chú nêu khác biệt cần sửa khi chuyển."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Fluent v9", "Yugen UI", "Ghi chú"]}
            rows={[
              [<Names key="a" items={["FluentProvider"]} />, <Names key="b" items={["YugenProvider"]} />, "Xem phần Provider."],
              [<Names key="a" items={["Button"]} />, <Names key="b" items={["Button"]} />, <>Thêm <C>appearance=&quot;danger&quot;</C>; <C>as=&quot;a&quot;</C> → <C>asChild</C>.</>],
              [<Names key="a" items={["CompoundButton"]} />, "—", "Ghép Button + hai dòng chữ, hoặc Card interactive."],
              [<Names key="a" items={["MenuButton"]} />, <Names key="b" items={["Menu", "MenuTrigger asChild", "Button"]} />, <>Button với <C>icon={"{<ChevronDown20Regular />}"}</C> <C>iconPosition=&quot;after&quot;</C>.</>],
              [<Names key="a" items={["SplitButton"]} />, <Names key="b" items={["SplitButton"]} />, <>Menu truyền qua prop <C>menu</C>.</>],
              [<Names key="a" items={["ToggleButton"]} />, <Names key="b" items={["ToggleButton"]} />, <><C>checked</C> + <C>onCheckedChange</C>, thêm <C>checkedIcon</C>.</>],
              [<Names key="a" items={["Link", "Toolbar"]} />, <Names key="b" items={["Link", "Toolbar", "ToolbarButton", "ToolbarToggleButton", "ToolbarDivider", "ToolbarGroup"]} />, <>Link thêm <C>external</C>.</>],
              [<Names key="a" items={["Field", "Label", "InfoLabel"]} />, <Names key="b" items={["Field", "Label", "InfoLabel"]} />, "Giữ nguyên prop; Field nhận thêm render-prop."],
              [<Names key="a" items={["Input", "Textarea", "SearchBox", "SpinButton"]} />, <Names key="b" items={["Input", "Textarea", "SearchBox", "SpinButton"]} />, <>Cùng <C>appearance</C>, <C>contentBefore / After</C>; <C>onChange(ev, data)</C> → <C>onChange(ev)</C> gốc của React; SearchBox và SpinButton có thêm <C>onValueChange(value)</C>.</>],
              [<Names key="a" items={["Select"]} />, <Names key="b" items={["Select"]} />, <>Thẻ <C>{"<select>"}</C> gốc như Fluent.</>],
              [<Names key="a" items={["Dropdown", "Option", "OptionGroup"]} />, <Names key="b" items={["Dropdown", "DropdownOption", "DropdownGroup"]} />, <><C>selectedOptions / onOptionSelect</C> → <C>value / onValueChange</C>.</>],
              [<Names key="a" items={["Combobox", "Option"]} />, <Names key="b" items={["Combobox"]} />, <>Option con → mảng <C>options</C>; có <C>multiselect</C>, <C>freeform</C>.</>],
              [<Names key="a" items={["TagPicker", "TagPickerControl", "TagPickerInput", "TagPickerList", "TagPickerOption"]} />, <Names key="b" items={["TagPicker"]} />, <>Một component: <C>options</C> + <C>value / onValueChange</C>.</>],
              [<Names key="a" items={["Checkbox", "RadioGroup", "Radio", "Switch"]} />, <Names key="b" items={["Checkbox", "RadioGroup", "Radio", "Switch"]} />, <><C>onChange(ev, data)</C> → <C>onCheckedChange(checked)</C> / <C>onValueChange(value)</C>.</>],
              [<Names key="a" items={["Slider"]} />, <Names key="b" items={["Slider"]} />, <><C>value</C> là <strong className="font-semibold">mảng</strong> số (<C>[40]</C>), hỗ trợ khoảng hai đầu.</>],
              [<Names key="a" items={["Rating", "RatingDisplay"]} />, <Names key="b" items={["Rating", "RatingDisplay"]} />, ""],
              [<Names key="a" items={["Calendar", "DatePicker (compat)"]} />, <Names key="b" items={["Calendar", "DatePicker", "DateRangePicker"]} />, "Dựa trên react-day-picker v10."],
              [<Names key="a" items={["TabList", "Tab"]} />, <Names key="b" items={["Tabs", "TabsList", "TabsTrigger", "TabsContent"]} />, <><C>selectedValue / onTabSelect</C> → <C>value / onValueChange</C>; có sẵn panel.</>],
              [<Names key="a" items={["Breadcrumb", "BreadcrumbItem", "BreadcrumbButton", "BreadcrumbDivider"]} />, <Names key="b" items={["Breadcrumb", "BreadcrumbItem", "BreadcrumbButton", "BreadcrumbDivider"]} />, <>Thêm prop <C>items</C> tự chèn divider và gom mục thừa vào “…”.</>],
              [<Names key="a" items={["Nav", "NavDrawer", "NavItem", "NavCategory", "NavSubItem"]} />, <Names key="b" items={["Nav", "NavItem", "NavCategory", "NavCategoryItem", "NavSubItem", "NavSectionHeader"]} />, "Không có NavDrawer — đặt Nav trong InlineDrawer / OverlayDrawer."],
              [<Names key="a" items={["Menu", "MenuTrigger", "MenuPopover", "MenuList", "MenuItem…"]} />, <Names key="b" items={["Menu", "MenuTrigger", "MenuPopover", "MenuItem", "MenuItemCheckbox", "MenuItemRadio"]} />, <>Không có <C>MenuList</C> — item đặt thẳng trong MenuPopover; <C>checkedValues</C> → MenuRadioGroup / <C>checked</C>.</>],
              [<Names key="a" items={["Avatar", "AvatarGroup", "Persona"]} />, <Names key="b" items={["Avatar", "AvatarGroup", "Persona"]} />, <>Avatar có <C>presence</C> thay cho PresenceBadge.</>],
              [<Names key="a" items={["Badge", "CounterBadge", "PresenceBadge"]} />, <Names key="b" items={["Badge"]} />, "CounterBadge → Badge với số; PresenceBadge → Avatar presence / Persona presenceOnly."],
              [<Names key="a" items={["Tag", "InteractionTag", "TagGroup"]} />, <Names key="b" items={["Tag", "InteractionTag", "TagGroup"]} />, ""],
              [<Names key="a" items={["Text", "Title1…Caption2"]} />, <Names key="b" items={["Text", "Title1…Caption2"]} />, "Cùng tên preset."],
              [<Names key="a" items={["Image"]} />, <Names key="b" items={["Image", "AspectRatio"]} />, ""],
              [<Names key="a" items={["List", "ListItem"]} />, <Names key="b" items={["List", "ListItem"]} />, <>ListItem có slot <C>media / title / description / actions</C>.</>],
              [<Names key="a" items={["Table…", "useTableFeatures"]} />, <Names key="b" items={["Table…", "TableCellLayout", "TableSelectionCell"]} />, "Tự quản state sắp xếp / chọn (xem ví dụ DataTable ở trang Table)."],
              [<Names key="a" items={["Tree", "TreeItem", "TreeItemLayout"]} />, <Names key="b" items={["Tree", "TreeItem", "TreeItemLayout"]} />, ""],
              [<Names key="a" items={["Carousel…"]} />, <Names key="b" items={["Carousel", "CarouselViewport", "CarouselCard", "CarouselNavContainer"]} />, ""],
              [<Names key="a" items={["MessageBar", "MessageBarBody", "MessageBarTitle", "MessageBarActions"]} />, <Names key="b" items={["MessageBar"]} />, <>Một component: <C>title</C>, children, <C>actions</C>, <C>onDismiss</C>, <C>layout</C>.</>],
              [<Names key="a" items={["Toaster", "useToastController", "Toast…"]} />, <Names key="b" items={["Toaster", "useToast", "toast()"]} />, "Tuỳ chọn là object (xem bên dưới)."],
              [<Names key="a" items={["ProgressBar", "Spinner", "Skeleton", "SkeletonItem"]} />, <Names key="b" items={["ProgressBar", "Spinner", "Skeleton", "SkeletonItem"]} />, ""],
              [<Names key="a" items={["Card", "CardHeader", "CardPreview", "CardFooter"]} />, <Names key="b" items={["Card", "CardHeader", "CardPreview", "CardContent", "CardFooter"]} />, ""],
              [<Names key="a" items={["Dialog", "DialogSurface", "DialogBody", "DialogTitle", "DialogContent", "DialogActions"]} />, <Names key="b" items={["Dialog", "DialogSurface", "DialogTitle", "DialogContent", "DialogActions"]} />, <>Không có DialogBody; <C>modalType=&quot;non-modal&quot;</C> → dùng Popover.</>],
              [<Names key="a" items={["OverlayDrawer", "InlineDrawer", "DrawerHeader…"]} />, <Names key="b" items={["OverlayDrawer", "InlineDrawer", "DrawerHeader", "DrawerBody", "DrawerFooter"]} />, ""],
              [<Names key="a" items={["Popover", "PopoverSurface"]} />, <Names key="b" items={["Popover", "PopoverSurface"]} />, <><C>positioning=&quot;above-start&quot;</C> → <C>side=&quot;top&quot; align=&quot;start&quot;</C>.</>],
              [<Names key="a" items={["Tooltip"]} />, <Names key="b" items={["Tooltip", "SimpleTooltip"]} />, <><C>relationship=&quot;label&quot;</C> → tự đặt <C>aria-label</C> trên trigger.</>],
              [<Names key="a" items={["Accordion", "AccordionItem", "AccordionHeader", "AccordionPanel"]} />, <Names key="b" items={["Accordion", "AccordionItem", "AccordionHeader", "AccordionPanel"]} />, <><C>openItems / onToggle</C> → <C>value / onValueChange</C>, <C>multiple</C> → <C>type=&quot;multiple&quot;</C>.</>],
              [<Names key="a" items={["Divider"]} />, <Names key="b" items={["Divider"]} />, ""],
            ]}
          />
          <CodeBlock code={OPTIONS_CODE} />
          <CodeBlock code={TOAST_CODE} />
        </div>
      </DocSection>

      <DocSection id="props" title="Prop đổi tên" description="Quy tắc chung: appearance, size, shape, icon, intent giữ nguyên; callback chuyển sang kiểu Radix (giá trị thay vì event + data).">
        <SimpleTable
          head={["Fluent v9", "Yugen UI"]}
          rows={[
            [<C key="a">appearance, size, shape, icon, iconPosition</C>, "Giữ nguyên (size: small / medium / large)."],
            [<C key="a">as=&quot;a&quot;</C>, <C key="b">asChild</C>],
            [<C key="a">onChange={"{(ev, data) => data.checked}"}</C>, <C key="b">onCheckedChange={"{(checked) => …}"}</C>],
            [<C key="a">onChange={"{(ev, data) => data.value}"}</C>, <C key="b">onValueChange={"{(value) => …}"}</C>],
            [<C key="a">onOptionSelect / selectedOptions</C>, <C key="b">onValueChange / value</C>],
            [<C key="a">onTabSelect / selectedValue</C>, <C key="b">onValueChange / value</C>],
            [<C key="a">onOpenChange={"{(ev, data) => data.open}"}</C>, <C key="b">onOpenChange={"{(open) => …}"}</C>],
            [<C key="a">positioning</C>, <C key="b">side, align, sideOffset, collisionPadding</C>],
            [<C key="a">Slider value: number</C>, <C key="b">Slider value: number[]</C>],
            [<C key="a">mountNode</C>, "Không có — portal luôn vào <body> nhưng tự nhận theme / brand / dir của YugenProvider lồng."],
          ]}
        />
      </DocSection>

      <DocSection
        id="missing"
        title="Chưa có trong Yugen"
        description="Một số component và tiện ích của Fluent v9 chưa có bản tương đương. Đây là cách thay thế khuyến nghị."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Fluent v9", "Thay thế"]}
            rows={[
              [<C key="a">DataGrid</C>, <>Table + mẫu DataTable (lọc, sắp xếp, chọn hàng, phân trang) ở <a className="text-link underline hover:text-link-hover" href="#/components/table">trang Table</a>.</>],
              [<C key="a">Overflow, useOverflowMenu</C>, "Ẩn mục theo breakpoint và gom vào Menu “…”; Breadcrumb có sẵn maxDisplayedItems."],
              [<C key="a">ColorPicker, SwatchPicker</C>, <>Thẻ <C>{'<input type="color">'}</C> trong Field, hoặc ToggleGroup các ô màu.</>],
              [<C key="a">TimePicker (compat)</C>, <>Combobox với danh sách giờ, hoặc <C>{'<Input type="time">'}</C>.</>],
              [<C key="a">TeachingPopover</C>, <>PopoverSurface <C>appearance=&quot;brand&quot;</C> + nút điều hướng.</>],
              [<C key="a">Virtualizer</C>, "Thư viện ảo hoá bên ngoài (ví dụ @tanstack/react-virtual)."],
              [<C key="a">useArrowNavigationGroup, useFocusableGroup (Tabster)</C>, "Toolbar / ToggleGroup / List có roving focus sẵn; tự viết thì đọc hướng bằng useDirection()."],
              [<C key="a">makeStyles, mergeClasses, shorthands</C>, <><C>cn()</C> + utility Tailwind.</>],
              [<C key="a">Portal mountNode, FluentProvider lồng cho portal</C>, <>Không cần — bề mặt nổi tự theo YugenProvider lồng (<C>usePortalThemeProps()</C>).</>],
            ]}
          />
          <MessageBar intent="info" title="Mẹo chuyển dần:" className="max-w-3xl">
            hai thư viện chạy song song được — FluentProvider và YugenProvider không xung đột. Chuyển từng màn hình, bắt đầu từ màn hình ít
            component phức tạp nhất.
          </MessageBar>
          <DoDont
            dos={[
              "Tra token Fluent → utility theo bảng trên; tên alias giống hệt.",
              "Chuyển callback (ev, data) sang dạng nhận giá trị.",
              "Đặt brand=\"web\" nếu muốn giữ màu xanh Fluent gốc.",
            ]}
            donts={[
              "Không chép giá trị hex từ theme Fluent vào className.",
              "Không giữ makeStyles song song cho component đã chuyển — trùng nguồn style.",
              "Không quên Slider nhận mảng số.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
