import type { ReactNode } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  MessageBar,
  Switch,
  YugenProvider,
  type YugenBrand,
  type YugenTheme,
  useYugen,
} from "@/components/ui";
import { DocSection, DoDont, PropsTable } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { docsPath } from "../router";

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

/** Đọc context của YugenProvider gần nhất — minh hoạ useYugen(). */
function ThemeInfo() {
  const { theme, brand, dir } = useYugen();
  return (
    <p className="font-mono text-caption1 text-foreground-3">
      useYugen() → theme: {theme} · brand: {brand} · dir: {dir}
    </p>
  );
}

function Sample() {
  return (
    <div className="flex flex-col gap-3">
      <ThemeInfo />
      <div className="flex flex-wrap items-center gap-2">
        <Button appearance="primary">Lưu</Button>
        <Button>Huỷ</Button>
        <Badge>3</Badge>
      </div>
      <Input placeholder="Tìm trong dự án" aria-label="Tìm trong dự án" />
      <div className="flex flex-wrap items-center gap-3">
        <Switch label="Đồng bộ" defaultChecked />
        <Checkbox label="Ghi nhớ" defaultChecked />
      </div>
    </div>
  );
}

const PANELS: { theme: YugenTheme; brand: YugenBrand }[] = [
  { theme: "light", brand: "sakura" },
  { theme: "dark", brand: "web" },
  { theme: "light", brand: "teams" },
];

const NESTED_CODE = `import { YugenProvider } from "@/components/ui";

<div className="grid gap-4 md:grid-cols-3">
  <YugenProvider theme="light" brand="sakura" className="rounded-xlarge border border-stroke-2 p-4">
    <Sample />
  </YugenProvider>
  <YugenProvider theme="dark" brand="web" className="rounded-xlarge border border-stroke-2 p-4">
    <Sample />
  </YugenProvider>
  <YugenProvider theme="light" brand="teams" className="rounded-xlarge border border-stroke-2 p-4">
    <Sample />
  </YugenProvider>
</div>`;

const HOOK_CODE = `import * as React from "react";
import { WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";
import { Button, YugenProvider, useYugen, type YugenTheme } from "@/components/ui";

export default function App() {
  const [theme, setTheme] = React.useState<YugenTheme>("light");
  return (
    <YugenProvider applyToDocument withToaster theme={theme}>
      <ThemeToggle onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))} />
    </YugenProvider>
  );
}

function ThemeToggle({ onToggle }: { onToggle: () => void }) {
  const { theme } = useYugen();
  const dark = theme === "dark";
  return (
    <Button
      appearance="subtle"
      icon={dark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
      aria-label={dark ? "Chuyển sang theme sáng" : "Chuyển sang theme tối"}
      onClick={onToggle}
    />
  );
}`;

const LAYERS_CODE = `/* 1. GLOBAL (tokens.css) — giá trị thô, không gắn vai trò */
:root { --grey-14: #242424; --white: #ffffff; }
[data-brand="web"] { --brand-70: #115ea3; --brand-80: #0f6cbd; /* … 10 → 160 */ }

/* 2. ALIAS (tokens.css) — vai trò, tên trùng Fluent UI v9, đổi theo theme */
[data-theme="light"] { --colorNeutralForeground1: var(--grey-14); }
[data-theme="light"], [data-brand] { --colorBrandBackground: var(--brand-80); }
[data-theme="dark"] { --colorBrandBackground: var(--brand-70); }

/* 3. UTILITY (index.css) — cầu nối sang Tailwind */
@theme inline {
  --color-foreground-1: var(--colorNeutralForeground1);   /* text-foreground-1 */
  --color-brand-background: var(--colorBrandBackground);  /* bg-brand-background */
}`;

const BRAND_CODE = `/* src/styles/tokens.css — dán sau các block brand có sẵn (ví dụ minh hoạ; dùng Theme Designer để sinh ramp chính xác) */
[data-brand="matcha"] {
  --brand-10: #0a1a10;
  --brand-20: #0f2818;
  --brand-30: #13351f;
  --brand-40: #174327;
  --brand-50: #1b522f;
  --brand-60: #1f6137;
  --brand-70: #236f3f;
  --brand-80: #277d47; /* màu chủ đạo — phải ≥ 4.5:1 trên nền trắng */
  --brand-90: #2f9455;
  --brand-100: #3fac66;
  --brand-110: #5bbb7d;
  --brand-120: #74c690;
  --brand-130: #93d4a8;
  --brand-140: #b1e1c0;
  --brand-150: #cdeed6;
  --brand-160: #e9f7ed;
}`;

const BRAND_USE_CODE = `// Toàn ứng dụng
<YugenProvider applyToDocument theme="light" brand="matcha">…</YugenProvider>

// Hoặc chỉ một vùng (ví dụ trang marketing của sản phẩm con)
<YugenProvider theme="light" brand="matcha" className="rounded-xlarge p-5">…</YugenProvider>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="attributes"
        title="data-theme & data-brand"
        description="Toàn bộ màu đọc từ CSS custom property. Hai attribute quyết định bộ giá trị: data-theme chọn bảng neutral / semantic, data-brand chọn ramp thương hiệu."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Attribute", "Giá trị", "Ý nghĩa"]}
            rows={[
              [<C key="a">data-theme</C>, <C key="b">light</C>, <>Mặc định (khai báo ở <C>:root</C>), tương đương <C>webLightTheme</C>.</>],
              [<C key="a">data-theme</C>, <C key="b">dark</C>, <>Tương đương <C>webDarkTheme</C>; nền tối, brand dùng bậc sáng hơn (Background = brand70, Foreground1 = brand100).</>],
              [
                <C key="a">data-theme</C>,
                <C key="b">high-contrast</C>,
                <>
                  Chế độ tương phản cao (tương đương teamsHighContrastTheme): nền đen, chữ trắng, nhấn cyan, link vàng, disabled xanh lá;
                  bóng đổ thành viền trắng 1px. Đã khai báo sẵn trong <C>tokens.css</C> — chọn “Tương phản cao” ở menu Theme trên cùng để thử.
                </>,
              ],
              [<C key="a">data-brand</C>, <C key="b">sakura</C>, "Mặc định — hồng anh đào 桜, Brand80 đạt 5.16:1 với chữ trắng."],
              [<C key="a">data-brand</C>, <C key="b">web</C>, "Communication Blue, brand gốc của Fluent 2."],
              [<C key="a">data-brand</C>, <C key="b">teams</C>, "Tím chàm “Dusk”."],
              [<C key="a">data-brand</C>, <C key="b">tên-riêng</C>, <>Bất kỳ ramp nào bạn khai báo bằng <C>[data-brand=&quot;tên-riêng&quot;]</C> (xem cuối trang).</>],
            ]}
          />
          <CodeBlock
            code={`<!-- Không cần JavaScript: attribute trên <html> là đủ -->
<html lang="vi" data-theme="dark" data-brand="web" dir="ltr">`}
          />
          <MessageBar intent="warning" title="Không dùng dark: variant." className="max-w-3xl">
            Tailwind <C>dark:</C> không biết tới <C>data-theme</C> lồng nhau và nhân đôi số class. Mọi khác biệt sáng / tối đã nằm trong token.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="provider"
        title="YugenProvider"
        description="Tương đương FluentProvider: áp theme, brand và hướng chữ cho một cây component, đồng thời gắn DirectionProvider của Radix, TooltipProvider và (tuỳ chọn) Toaster."
      >
        <div className="flex flex-col gap-4">
          <PropsTable
            props={[
              { name: "theme", type: `"light" | "dark" | "high-contrast"`, defaultValue: `"light"`, description: "Ghi vào data-theme." },
              { name: "brand", type: `"sakura" | "web" | "teams" | string`, defaultValue: `"sakura"`, description: "Ghi vào data-brand; nhận tên brand tuỳ biến." },
              { name: "dir", type: `"ltr" | "rtl"`, defaultValue: `"ltr"`, description: "Ghi dir lên thẻ bao và cấp hướng chữ cho Radix (bàn phím, Slider, Menu con…)." },
              {
                name: "applyToDocument",
                type: "boolean",
                defaultValue: "false",
                description:
                  "true: ghi data-theme / data-brand / dir lên <html> — dùng cho provider gốc để portal cũng đúng theme. false: chỉ áp cho thẻ div bao ngoài (theme lồng), div tự có bg-background-1 text-foreground-1.",
              },
              { name: "withTooltipProvider", type: "boolean", defaultValue: "true", description: "Bọc TooltipProvider (delay 300ms) cho Tooltip bên trong." },
              {
                name: "withToaster",
                type: "boolean",
                defaultValue: "false",
                description: "Gắn <Toaster /> để toast() hoạt động; vị trí bottom-end (bottom-start khi RTL). Chỉ bật ở provider gốc.",
              },
              {
                name: "messages",
                type: "YugenMessagesInput",
                description: "Đổi chuỗi có sẵn của component theo namespace, vd. messagesEn cho tiếng Anh. Provider lồng kế thừa rồi ghi đè tiếp. Xem Ngôn ngữ giao diện.",
              },
              { name: "locale", type: "string", defaultValue: `"vi-VN"`, description: "Locale Intl cho ngày, giờ và số trong component. Provider lồng kế thừa provider ngoài." },
              { name: "className, …div props", type: "HTMLAttributes<HTMLDivElement>", description: "Truyền xuống thẻ div bao ngoài (ref được forward)." },
            ]}
          />
          <CodeBlock
            code={`// Provider gốc — một lần duy nhất
<YugenProvider applyToDocument withToaster theme="light" brand="sakura" dir="ltr">
  <App />
</YugenProvider>`}
          />
        </div>
      </DocSection>

      <DocSection
        id="use-yugen"
        title="Hook useYugen()"
        description="Trả về { theme, brand, dir } của YugenProvider gần nhất — dùng khi component cần đổi nội dung (không phải màu) theo theme hoặc hướng chữ."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={HOOK_CODE} />
          <P>
            Đừng dùng <C>useYugen()</C> để chọn màu — màu đã tự đổi qua token. Hãy dùng nó cho nội dung: icon mặt trời / mặt trăng, ảnh
            minh hoạ sáng / tối, hướng mũi tên. Bề mặt trong portal đã tự theo provider lồng (xem trang Định vị).
          </P>
        </div>
      </DocSection>

      <DocSection
        id="nested"
        title="Theme lồng nhau"
        description="Đặt data-theme / data-brand trên bất kỳ phần tử nào để đổi theme cho cả nhánh con — YugenProvider không applyToDocument làm đúng việc đó."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            {PANELS.map((p) => (
              <YugenProvider key={`${p.theme}-${p.brand}`} theme={p.theme} brand={p.brand} className="rounded-xlarge border border-stroke-2 p-4">
                <Sample />
              </YugenProvider>
            ))}
          </div>
          <CodeBlock code={NESTED_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Khi lồng một brand bên trong theme khác với <C>{"<html>"}</C>, đặt <strong className="font-semibold">cả hai</strong> attribute
              trên <strong className="font-semibold">cùng một phần tử</strong>: alias brand được tính lại theo cặp{" "}
              <C>[data-brand][data-theme]</C>. YugenProvider luôn ghi cả hai.
            </li>
            <li>
              Phần tử mang attribute nên tự đặt nền (<C>bg-background-1</C>, <C>bg-background-2</C>…) — nếu không, nó trong suốt và lộ nền
              của theme cha.
            </li>
            <li>
              Dialog, Menu, Popover, Tooltip render qua portal vào <C>{"<body>"}</C> nhưng vẫn tự nhận theme / brand / hướng chữ của
              YugenProvider lồng gần nhất (qua <C>usePortalThemeProps()</C>). Chi tiết ở trang{" "}
              <a className="text-link underline hover:text-link-hover" href={docsPath("/concepts/positioning")}>Định vị</a>.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="layers" title="Ba lớp token" description="Global → Alias → Utility. Mỗi lớp chỉ được đọc bởi lớp ngay sau nó.">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Lớp", "Ví dụ", "Ai được dùng"]}
            rows={[
              ["Global", <C key="a">--grey-14, --brand-80, --red-shade-10</C>, "Chỉ tokens.css (và minh hoạ trang trí, trang bảng màu)."],
              ["Alias", <C key="a">--colorNeutralForeground1, --colorBrandBackground, --spacingM, --shadow16</C>, "index.css (map sang Tailwind) và CSS tuỳ biến khi thật cần."],
              ["Utility", <C key="a">text-foreground-1, bg-brand-background, p-3, shadow-16</C>, "Mọi file .tsx."],
            ]}
          />
          <CodeBlock code={LAYERS_CODE} />
          <P>
            Tên alias trùng 1-1 với token Fluent UI v9, nên tài liệu Fluent tra được trực tiếp: <C>tokens.colorNeutralStroke1</C> chính là{" "}
            <C>var(--colorNeutralStroke1)</C> và utility <C>border-stroke-1</C>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="custom-brand"
        title="Tạo brand riêng"
        description="Brand là một ramp 16 bậc --brand-10 … --brand-160. Alias (nền nút, link, focus, tint chọn) tự lấy đúng bậc cho light và dark."
      >
        <div className="flex flex-col gap-4">
          <ol className="flex max-w-3xl list-decimal flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Mở <a className="text-link underline hover:text-link-hover" href={docsPath("/theme-designer")}>Theme Designer</a>, nhập màu chủ đạo và
              tên brand. Trang sinh ramp bằng cách giữ đường cong lightness / chroma OKLCH của Communication Blue và đổi hue, xem trước trên
              component thật, kiểm tra tương phản.
            </li>
            <li>
              Ở mục <strong className="font-semibold">Xuất token</strong>, chép CSS (hoặc tải file) và dán khối{" "}
              <C>[data-brand=&quot;tên&quot;]</C> vào file CSS chính của app, ngay sau <C>@import &quot;yugen-ui/theme.css&quot;</C>. Dự án đã
              chép mã nguồn thì dán vào <C>src/styles/tokens.css</C>, sau các brand có sẵn.
            </li>
            <li>
              Dùng <C>brand=&quot;tên&quot;</C> trên YugenProvider (kiểu <C>YugenBrand</C> nhận chuỗi bất kỳ) hoặc{" "}
              <C>data-brand=&quot;tên&quot;</C> trên <C>{"<html>"}</C>.
            </li>
          </ol>
          <CodeBlock code={BRAND_CODE} />
          <CodeBlock code={BRAND_USE_CODE} />
          <DoDont
            dos={[
              "Giữ Brand80 ≥ 4.5:1 với chữ trắng — đó là nền của nút primary.",
              "Chọn hue cách xa đỏ danger để nút xoá không bị nhầm với nút chính.",
              "Kiểm tra cả light và dark ở trang Màu sắc › Khả năng tiếp cận.",
            ]}
            donts={[
              "Không tự pha từng bậc bằng tay — đường cong lightness lệch sẽ làm hover / pressed sai.",
              "Không trộn hai brand trong cùng một vùng giao diện.",
              "Không phủ brand lên diện tích lớn (header, sidebar, nền trang).",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
