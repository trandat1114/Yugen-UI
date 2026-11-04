import type { ReactNode } from "react";
import { DocSection } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { docsPath } from "../router";

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

function List({ children }: { children: ReactNode }) {
  return <ul className="flex max-w-3xl list-disc flex-col gap-2 ps-5 text-body2 text-foreground-2">{children}</ul>;
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

const THEME_ROOT = `// ThemeRoot.tsx: state theme nằm ở đây, ứng dụng được truyền vào qua children
import * as React from "react";
import { YugenProvider, type YugenTheme } from "yugen-ui";

export const SetThemeContext = React.createContext<(theme: YugenTheme) => void>(() => {});

export function ThemeRoot({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<YugenTheme>("light");
  return (
    <SetThemeContext.Provider value={setTheme}>
      <YugenProvider applyToDocument theme={theme}>
        {children}
      </YugenProvider>
    </SetThemeContext.Provider>
  );
}

// main.tsx
createRoot(document.getElementById("root")!).render(
  <ThemeRoot>
    <App />
  </ThemeRoot>,
);`;

export default function Page() {
  return (
    <>
      <DocSection
        id="imports"
        title="Đường dẫn import và bundler"
        description="Import từ yugen-ui hay từ yugen-ui/<Thư mục> cho cùng một bản build production với phần lớn bundler. Ngoại lệ là esbuild có code splitting và Node không qua bundler."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Nơi code chạy", "yugen-ui", "yugen-ui/<Thư mục>"]}
            rows={[
              ["Vite, Rollup, webpack, Next.js (production)", "Chỉ phần ứng dụng dùng", "Như import từ gốc"],
              [
                <>
                  esbuild với <C>splitting: true</C>
                </>,
                "Các phần nạp lúc cần nằm luôn trong chunk đầu",
                "Chỉ phần ứng dụng dùng",
              ],
              [
                "Node, không bundler (Vitest, Jest, SSR, dev server)",
                <>
                  <C>{"{ Button }"}</C>: 498 file, 1.6 s lần đầu
                </>,
                "14 file, 61 ms",
              ],
            ]}
          />
          <P>
            esbuild chia cả file vào chunk trước khi bỏ các export không dùng. Vì vậy import từ gốc gói,{" "}
            <C>{"import { Calendar }"}</C> kéo theo Toaster, menu của Breadcrumb và thẻ chú thích vào chunk đầu: 76.46 kB, so với 31.60 kB
            khi import từ <C>yugen-ui/Calendar</C>. Hai subpath tự chứa một phần như vậy: <C>yugen-ui/AIKit</C> cũng export Citation nên
            StreamingMarkdown lấy từ đó có thẻ chú thích trong chunk đầu, còn <C>toast</C> từ <C>yugen-ui/Toast</C> kéo theo Toaster vì
            cả hai nằm chung một file.
          </P>
          <P>
            Next.js: thêm gói vào <C>optimizePackageImports</C> để dev server và bundle phía server chỉ nạp phần trang dùng. Cấu hình và
            cách biết tên nào thuộc thư mục nào có ở <A href={docsPath("/concepts/quick-start#imports")}>Bắt đầu nhanh › Đường dẫn import</A>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="on-demand"
        title="Phần nạp lúc cần"
        description="Ba phần chỉ một số ứng dụng render có chunk riêng. Mỗi phần bắt đầu nạp ngay khi nó được render ở client."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Phần", "Bắt đầu nạp", "Chunk đầu, 0.15 → 0.16", "Nạp sau"]}
            rows={[
              [
                <>
                  Toaster của <C>withToaster</C>
                </>,
                "Lần render đầu ở client (sau hydrate nếu có SSR)",
                <>
                  <C>{"{ YugenProvider }"}</C> 24.91 → 13.31 kB
                </>,
                "12.5 kB",
              ],
              [
                "Menu “…” của Breadcrumb",
                <>
                  Khi <C>BreadcrumbOverflow</C> mount
                </>,
                <>
                  <C>{"{ Breadcrumb }"}</C> 40.17 → 13.47 kB
                </>,
                "28.37 kB",
              ],
              [
                "Thẻ chú thích trong StreamingMarkdown",
                "Khi chip chú thích đầu tiên mount",
                <>
                  <C>{"{ StreamingMarkdown }"}</C> 49.28 → 27.34 kB
                </>,
                "24.25 kB",
              ],
            ]}
          />
          <List>
            <li>Đo trên bản build Vite 8, React để external. Ứng dụng không render phần đó thì không bao giờ nạp nó.</li>
            <li>
              Trong lúc chờ code, Breadcrumb render đúng nút “…” và StreamingMarkdown render đúng chip, cùng kích thước và ARIA, nên bố cục
              không xê dịch. Bấm chuột hay nhấn phím trong lúc đó thì menu hoặc thẻ mở ngay khi code tới, và focus chuyển sang nút thật.
              Nạp lỗi thì lần tương tác sau thử lại.
            </li>
            <li>
              HTML từ server có các bản thay thế này và không có Toaster, nên hydrate khớp (
              <A href={docsPath("/concepts/ssr#hydration")}>SSR & Next.js</A>).
            </li>
            <li>
              <C>toast()</C> gọi trước khi Toaster nạp xong vẫn hiện khi nó mount. <C>{"<Toaster />"}</C> tự đặt làm con của provider gốc
              thì nằm trong chunk đầu: toast đầu tiên không phải chờ chunk, và live region có trong trang từ lần vẽ đầu.
            </li>
            <li>
              Hai component nhẹ đi mà không nạp gì sau. Nav không còn import Tooltip (Sidebar của AppShell gắn tooltip cho dạng rail):{" "}
              <C>{"{ Nav, NavItem }"}</C> 29.94 → 11.97 kB. Calendar không còn kèm locale tiếng Việt: <C>{"{ Calendar }"}</C> 32.39 → 30.42
              kB.
            </li>
          </List>
        </div>
      </DocSection>

      <DocSection
        id="css"
        title="Dung lượng CSS"
        description="theme.css cho Tailwind quét mọi component trong gói. Lệnh css của CLI ghi một file chỉ gồm các component mà code của bạn import."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Template Starter", "CSS (gzip)"]}
            rows={[
              [<C key="t">yugen-ui/theme.css</C>, "26.7 kB"],
              [
                <>
                  <C>yugen-ui.css</C> do <C>yugen css</C> ghi (5 thư mục component)
                </>,
                "13.2 kB",
              ],
              [
                <>
                  Chỉ <C>theme-core.css</C>, không component nào
                </>,
                "6.74 kB",
              ],
            ]}
          />
          <P>
            Trên các template khác, <C>yugen css</C> cho 11.8 đến 20.0 kB, so với khoảng 26 kB (
            <A href={docsPath("/concepts/styling#lean-css")}>Tuỳ biến style › Chỉ CSS của component bạn dùng</A>). Chạy lệnh trong{" "}
            <C>predev</C> / <C>prebuild</C>; <C>yugen add</C> tự cập nhật file, còn <C>yugen css --check</C> thoát với mã 1 khi file đã
            cũ (<A href={docsPath("/concepts/cli#css")}>CLI</A>).
          </P>
          <P>
            Không dùng Tailwind: <C>yugen css --precompile</C> biên dịch cùng danh sách đó bằng các gói Tailwind của dự án và thay{" "}
            <C>yugen-ui/styles.css</C>: từ 26.75 kB xuống 12.79 đến 21.06 kB trên các template.
          </P>
          <P>
            Keyframe nằm trong <C>@theme</C> nên Tailwind chỉ xuất những keyframe mà class của bạn dùng: không có keyframe nào khi chỉ có{" "}
            <C>theme-core.css</C>, một keyframe với ứng dụng chỉ dùng Button.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="theme"
        title="Theme trước lần vẽ đầu"
        description="HTML từ server không biết người dùng chọn theme nào. Hai helper đặt theme lên <html> trước khi trình duyệt vẽ trang."
      >
        <div className="flex flex-col gap-4">
          <P>
            <C>yugenHtmlAttributes()</C> trả về các attribute mà <C>applyToDocument</C> ghi, dùng cho <C>{"<html>"}</C> của root layout.{" "}
            <C>yugenThemeScript()</C> trả về một script cho <C>{"<head>"}</C>, áp theme đã lưu hoặc theo cài đặt hệ điều hành. Cả hai là
            hàm thường, import từ <C>yugen-ui</C> hoặc <C>yugen-ui/YugenProvider/document</C>, chạy được trong Server Component. Cách cài ở{" "}
            <A href={docsPath("/concepts/ssr#theme-flash")}>SSR & Next.js</A>.
          </P>
          <P>
            Ở client, YugenProvider ghi attribute trong layout effect, nên <C>useEffect</C> của component con đã thấy chúng. Không có SSR
            (SPA dùng Vite) thì trình duyệt vẽ <C>index.html</C> trước khi React chạy: dùng script inline ở{" "}
            <A href={docsPath("/concepts/quick-start#persist-theme")}>Bắt đầu nhanh</A>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="re-renders"
        title="Render lại"
        description="YugenProvider có hai context. Đổi theme chỉ render lại các component đọc theme."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Context", "Chứa", "Render lại khi context đổi"]}
            rows={[
              [
                "Theme",
                "theme, brand, dir",
                <>
                  Bề mặt render qua portal (Dialog, Menu, Popover…), biểu đồ, CodeBlock, nơi gọi <C>useYugenTheme()</C> và{" "}
                  <C>useYugen()</C>
                </>,
              ],
              ["Cấu hình", "locale, density, messages, defaults", "Mọi component đọc props mặc định hoặc chuỗi giao diện"],
            ]}
          />
          <SimpleTable
            head={["1 800 control, jsdom", "0.15", "0.16"]}
            rows={[
              ["Đổi theme, children giữ nguyên", "66–117 ms", "1.3–1.9 ms"],
              [
                <>
                  Component cha render lại, <C>messages</C> inline cùng nội dung
                </>,
                "65–67 ms",
                "0.1–0.2 ms",
              ],
            ]}
          />
          <P>
            Dòng đầu cần element của ứng dụng giữ nguyên. Khi component giữ state theme cũng tạo luôn element của ứng dụng, mọi component
            render lại mỗi lần đổi theme (khoảng 68 ms trong cùng phép đo). Hãy để state theme trong một component nhận ứng dụng qua{" "}
            <C>children</C>: đổi theme khi đó chỉ render lại component này, React bỏ qua cả cây trừ các component đọc theme.
          </P>
          <CodeBlock code={THEME_ROOT} />
          <List>
            <li>
              <C>messages</C> và <C>defaults</C> viết inline được so theo giá trị, sâu hai cấp (component, rồi từng key), nên không cần{" "}
              <C>useMemo</C>. Hàm hay element tạo trong lúc render là giá trị mới mỗi lần: khai báo chúng bên ngoài component.
            </li>
            <li>
              Trong component của bạn, <C>useYugenTheme()</C> trả về <C>{"{ theme, brand, dir }"}</C> và <C>useYugenLocale()</C> trả về
              locale; <C>useYugen()</C> render lại khi một trong hai đổi (<A href={docsPath("/concepts/theming#use-yugen")}>Theming</A>).
            </li>
            <li>
              Component có variant (Button, Input, Badge, Card…) gộp class một lần cho mỗi tổ hợp props: render 1 000 Button ở server mất
              6.35 ms thay vì 12.58 ms. <C>className</C> được gộp thêm ở mỗi lần render (8.13 ms).
            </li>
          </List>
        </div>
      </DocSection>

      <DocSection
        id="charts"
        title="Biểu đồ nhiều điểm"
        description="Rê chuột trên LineChart, AreaChart hay BarChart không còn tính lại cả biểu đồ, và Sparkline có chiều rộng cố định không đo gì."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Một bước hover, jsdom", "0.15", "0.16"]}
            rows={[
              ["LineChart, 3 series 500 điểm", "9.65 ms", "1.05 ms"],
              ["LineChart, 3 series 2 000 điểm", "39.2 ms", "1.11 ms"],
              ["BarChart, 150 nhóm 3 cột", "10.6 ms", "2.33 ms"],
            ]}
          />
          <List>
            <li>
              Thang đo, path, nhãn và các lớp SVG tĩnh được memo theo props, chiều rộng và các series đang ẩn. Giữ <C>data</C> và{" "}
              <C>series</C> ổn định (state, hằng số hoặc <C>useMemo</C>) để component cha render lại không dựng lại chúng.
            </li>
            <li>
              Fill và stroke đặt trên nhóm của series thay vì từng điểm: LineChart 4 series 200 điểm có marker render 183.9 kB markup thay vì
              263.3 kB.
            </li>
            <li>
              Trong bảng và danh sách, cho Sparkline một <C>width</C> bằng số: khi đó nó không dùng ResizeObserver. 200 Sparkline với{" "}
              <C>{"width={120}"}</C> commit một lần thay vì ba và mount trong 60–153 ms thay vì 229–514 ms. <C>width=&quot;auto&quot;</C>{" "}
              theo phần tử cha.
            </li>
            <li>
              Trong component của bạn, <C>{"useElementSize({ enabled: false })"}</C> bỏ qua việc đo khi đã biết kích thước (
              <A href={docsPath("/components/hooks")}>Hooks</A>). Chọn dạng biểu đồ và bảng màu:{" "}
              <A href={docsPath("/concepts/data-visualization")}>Trực quan hoá dữ liệu</A>.
            </li>
          </List>
        </div>
      </DocSection>
    </>
  );
}
