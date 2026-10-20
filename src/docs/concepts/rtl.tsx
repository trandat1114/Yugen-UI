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
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-L py-S text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-L py-M text-foreground-2">
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
    lang: "vi",
    hello: "Chào mừng đến với Yugen",
    crumbs: ["Trang chủ", "Tài liệu", "Báo cáo"],
    search: "Tìm kiếm…",
    notify: "Thông báo",
    volume: "Âm lượng",
    next: "Tiếp",
    back: "Quay lại",
    tabs: ["Chung", "Bảo mật", "Thanh toán"],
    panel: "Cài đặt chung của tài khoản.",
  },
} as const;

function DirectionDemo() {
  const [dir, setDir] = React.useState<YugenDir>("rtl");
  const t = COPY[dir];

  return (
    <div className="flex flex-col gap-M">
      <div className="flex flex-wrap items-center gap-M">
        <Label id="rtl-demo-dir" weight="semibold">
          Hướng chữ của khung
        </Label>
        <RadioGroup aria-labelledby="rtl-demo-dir" layout="horizontal" value={dir} onValueChange={(v) => setDir(v as YugenDir)}>
          <Radio value="rtl" label="RTL (Arabic)" />
          <Radio value="ltr" label="LTR (Tiếng Việt)" />
        </RadioGroup>
      </div>
      <YugenProvider dir={dir} lang={t.lang} className="flex flex-col gap-L rounded-2xlarge border border-stroke-2 p-XXL">
        <h3 className="text-title3 font-semibold text-foreground-1">{t.hello}</h3>
        <Breadcrumb items={t.crumbs.map((label) => ({ label }))} />
        <div className="flex flex-wrap items-center gap-M">
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
        <div className="flex flex-wrap gap-S">
          <Button icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />}>{t.back}</Button>
          <Button appearance="primary" icon={<ArrowRight20Regular className="rtl:-scale-x-100" />} iconPosition="after">
            {t.next}
          </Button>
        </div>
      </YugenProvider>
    </div>
  );
}

const ENABLE_CODE = `// Toàn ứng dụng: ghi dir="rtl" lên <html> và cấp hướng chữ cho Radix
<YugenProvider applyToDocument dir="rtl" theme="light">
  <App />
</YugenProvider>

// Hoặc chỉ một vùng (ví dụ xem trước bản dịch)
<YugenProvider dir="rtl" lang="ar" className="rounded-xlarge p-XL">
  <Breadcrumb items={[{ label: "الرئيسية" }, { label: "المستندات" }]} />
</YugenProvider>`;

const HTML_CODE = `<!-- Đặt sẵn trong HTML để trang không nhảy hướng khi tải -->
<html lang="ar" dir="rtl" data-theme="light">`;

const DEMO_CODE = `<YugenProvider dir="rtl" lang="ar" className="flex flex-col gap-L rounded-2xlarge border border-stroke-2 p-XXL">
  <Breadcrumb items={[{ label: "الرئيسية" }, { label: "المستندات" }, { label: "التقارير" }]} />
  <Input aria-label="ابحث" placeholder="ابحث…" contentBefore={<Search20Regular />} rootClassName="w-64" />
  <Switch label="الإشعارات" defaultChecked />
  <Slider label="مستوى الصوت" showValue defaultValue={[30]} rootClassName="max-w-sm" />
  <Pagination pageCount={10} defaultPage={3} />
  <Button appearance="primary" icon={<ArrowRight20Regular className="rtl:-scale-x-100" />} iconPosition="after">
    التالي
  </Button>
</YugenProvider>`;

const ICON_CODE = `{/* Icon chỉ hướng: lật theo chiều đọc */}
<ChevronRight16Regular className="rtl:-scale-x-100" />
<Button icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />}>Quay lại</Button>

{/* Transform vật lý: viết hai nhánh */}
<span className="translate-x-5.5 rtl:-translate-x-5.5" />

{/* Chevron mở / đóng: lật trước, rồi xoay ngược chiều trong RTL */}
<ChevronRight20Regular className="rtl:-scale-x-100 group-data-[state=open]:rotate-90 rtl:group-data-[state=open]:-rotate-90" />`;

const KEYBOARD_CODE = `import { useDirection } from "@radix-ui/react-direction";

/** ← / → theo chiều đọc: trong RTL, ArrowLeft là "tiến". */
export function useInlineArrowKeys(onPrev: () => void, onNext: () => void) {
  const dir = useDirection(); // "ltr" | "rtl" — lấy từ YugenProvider
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
  { icon: <ArrowRight20Regular className="rtl:-scale-x-100" />, name: "Mũi tên tiến / lùi", flip: true },
  { icon: <ChevronRight16Regular className="size-5 rtl:-scale-x-100" />, name: "Chevron điều hướng", flip: true },
  { icon: <Send20Regular className="rtl:-scale-x-100" />, name: "Gửi", flip: true },
  { icon: <Search20Regular />, name: "Tìm kiếm", flip: false },
  { icon: <Checkmark20Regular />, name: "Dấu tích", flip: false },
  { icon: <Play20Regular />, name: "Phát media", flip: false },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="enable"
        title="Bật RTL"
        description="Một prop dir trên YugenProvider: thẻ bao (hoặc <html> khi applyToDocument) nhận dir, và DirectionProvider của Radix truyền hướng chữ cho mọi component."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={ENABLE_CODE} />
          <CodeBlock code={HTML_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>
              CSS: thuộc tính <C>dir</C> đảo flex, grid, text-align mặc định và mọi utility logical (<C>ms-*</C>, <C>ps-*</C>, <C>start-*</C>…).
            </li>
            <li>
              Hành vi: Tabs, Menu (menu con mở sang trái), RadioGroup, Slider, ToggleGroup, ScrollArea, Toolbar, Tree, List, Carousel,
              TagPicker, InputOTP, Rating đọc hướng từ <C>DirectionProvider</C> để đảo phím mũi tên và chiều kéo.
            </li>
            <li>
              Overlay: Popover, Tooltip, HoverCard, Dialog, Drawer, Menu và listbox gắn <C>dir</C> của provider lên bề mặt dù render trong
              portal; Toaster của <C>withToaster</C> dùng vị trí logic <C>bottom-end</C> nên tự sang góc trái khi RTL.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="demo"
        title="Ví dụ trực tiếp"
        description="Đổi hướng chữ của khung bên dưới; thử Tab rồi dùng phím mũi tên trên Tabs và Slider — ← / → đổi vai trò khi RTL."
      >
        <div className="flex flex-col gap-L">
          <DirectionDemo />
          <CodeBlock code={DEMO_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="logical"
        title="Utility logical"
        description="Quy tắc cho tác giả component: không dùng hướng vật lý cho bố cục. Utility logical tự đảo theo dir, không cần variant rtl:."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Không dùng (vật lý)", "Dùng (logical)", "CSS"]}
            rows={[
              [<C key="a">ml-* / mr-*</C>, <C key="b">ms-* / me-*</C>, "margin-inline-start / end"],
              [<C key="a">pl-* / pr-*</C>, <C key="b">ps-* / pe-*</C>, "padding-inline-start / end"],
              [<C key="a">left-* / right-*</C>, <C key="b">start-* / end-*</C>, "inset-inline-start / end"],
              [<C key="a">border-l / border-r</C>, <C key="b">border-s / border-e</C>, "border-inline-start / end"],
              [<C key="a">rounded-l-* / rounded-r-*</C>, <C key="b">rounded-s-* / rounded-e-*</C>, "border-start-start-radius…"],
              [<C key="a">rounded-tl-* / rounded-tr-*</C>, <C key="b">rounded-ss-* / rounded-se-*</C>, "border-start-start / start-end-radius"],
              [<C key="a">text-left / text-right</C>, <C key="b">text-start / text-end</C>, "text-align: start / end"],
              [<C key="a">space-x-* với margin tay</C>, <C key="b">gap-*</C>, "gap không có hướng"],
            ]}
          />
          <P>
            Ngoại lệ hợp lệ: căn giữa bằng <C>left-1/2 -translate-x-1/2</C> (đối xứng), và nội dung luôn LTR như mã nguồn, số điện thoại,
            URL — bọc bằng <C>{'<bdi>'}</C> hoặc <C>dir=&quot;ltr&quot;</C> để thuật toán bidi không đảo thứ tự ký tự.
          </P>
          <div
            dir="rtl"
            lang="ar"
            className="flex max-w-xl flex-col gap-XS rounded-xlarge border border-stroke-2 bg-background-1 p-L text-body1 text-foreground-1"
          >
            <p>
              اتصل بنا: <bdi>+84 912 345 678</bdi>
            </p>
            <p>
              الرمز: <code dir="ltr" className="rounded-small bg-background-4 px-XS font-mono text-caption1">npm run dev</code>
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection
        id="icons"
        title="Lật icon & transform"
        description="Icon biểu thị hướng (tiến, lùi, gửi, thụt lề) phải lật trong RTL; icon biểu thị vật thể hay khái niệm thì giữ nguyên."
      >
        <div className="flex flex-col gap-L">
          <div className="grid gap-M sm:grid-cols-2">
            {(["ltr", "rtl"] as const).map((d) => (
              <div key={d} dir={d} className="rounded-xlarge border border-stroke-2 bg-background-1 p-L">
                <p className="mb-S font-mono text-caption1 text-foreground-3">dir=&quot;{d}&quot;</p>
                <ul className="flex flex-col gap-S">
                  {ICONS.map((i) => (
                    <li key={i.name} className="flex items-center gap-M text-body1 text-foreground-1">
                      <span className="flex size-8 items-center justify-center rounded-medium bg-background-3 text-foreground-2">{i.icon}</span>
                      <span className="min-w-0 flex-1">{i.name}</span>
                      <span className={cn("text-caption1", i.flip ? "text-brand-foreground-1" : "text-foreground-3")}>
                        {i.flip ? "lật" : "giữ"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <CodeBlock code={ICON_CODE} />
          <P>
            Biến thể <C>rtl:</C> của Tailwind khớp phần tử nằm trong bất kỳ tổ tiên nào có <C>dir=&quot;rtl&quot;</C>, nên hoạt động cả với
            YugenProvider lồng. Dùng nó cho mọi giá trị vật lý không có bản logical: <C>translate-x</C>, <C>rotate</C>, <C>scale-x</C>,
            gradient có góc, background-position.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="keyboard"
        title="Phím mũi tên"
        description="Component Radix và các component Yugen có điều hướng ngang đã tự đảo ← / →. Khi tự viết, đọc hướng bằng useDirection()."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={KEYBOARD_CODE} />
          <P>
            <C>useYugen().dir</C> cho cùng giá trị nhưng <C>useDirection()</C> của <C>@radix-ui/react-direction</C> cũng hoạt động bên ngoài
            Yugen (bất kỳ <C>DirectionProvider</C> nào). ↑ / ↓, Home / End không đổi theo hướng chữ.
          </P>
        </div>
      </DocSection>

      <DocSection id="testing" title="Kiểm thử" description="RTL hỏng thường lộ ra ở khoảng cách, icon và phím — kiểm tra cả ba.">
        <div className="flex flex-col gap-L">
          <ol className="flex max-w-3xl list-decimal flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>Bật nút LTR / RTL trên thanh trên cùng của site docs và lướt qua trang component của bạn.</li>
            <li>So khoảng cách hai bên: icon trong nút, padding của ô nhập, vạch chọn của Nav / Tabs phải đổi phía.</li>
            <li>Đi bằng bàn phím: ← / → trên Tabs, Slider, Toolbar, menu con, Carousel phải theo chiều đọc.</li>
            <li>Mở overlay (Menu, Popover, Tooltip, Drawer start / end) và Toast — chúng nằm trong portal.</li>
            <li>Tìm utility vật lý còn sót trong mã nguồn:</li>
          </ol>
          <CodeBlock
            code={`# Liệt kê class vật lý cần xem lại (bỏ qua kết quả căn giữa left-1/2)
rg -n "\\b(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|text-left|text-right)-" src/components`}
          />
          <DoDont
            dos={[
              "Dùng ms/me/ps/pe/start/end/border-s/border-e/rounded-s/rounded-e/text-start.",
              "Lật icon chỉ hướng bằng rtl:-scale-x-100.",
              "Đặt lang cùng dir để trình đọc màn hình đọc đúng ngôn ngữ.",
            ]}
            donts={[
              "Không lật logo, dấu tích, kính lúp, icon media.",
              "Không viết nhánh dir === 'rtl' trong JS cho thứ CSS logical làm được.",
              "Không giả định ArrowRight luôn là “tiếp theo”.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
