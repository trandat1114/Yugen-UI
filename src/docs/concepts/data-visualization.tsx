import type { ReactNode } from "react";
import { Kbd } from "@/components/ui";
import { BarChart, LineChart, StatTile } from "@/components/ui/Chart/Chart";
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
              <th key={h} scope="col" className="px-L py-S text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-L py-M font-semibold text-foreground-1" : "px-L py-M text-foreground-2"}>
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

/* ------------------------------------------------------------------ Bảng màu */

const CATEGORICAL = [
  { name: "Sakura 桜", light: "#C2347A", dark: "#E24A92", cl: "5.16", cd: "3.90" },
  { name: "Ai 藍 · chàm", light: "#2F6FD0", dark: "#4A8EEB", cl: "4.88", cd: "4.41" },
  { name: "Kohaku 琥珀 · hổ phách", light: "#B78300", dark: "#C08400", cl: "3.35", cd: "4.53" },
  { name: "Fuji 藤 · tử đằng", light: "#7A5AD6", dark: "#9079E6", cl: "4.93", cd: "4.20" },
  { name: "Matcha 抹茶 · xanh ngọc", light: "#0E9F8A", dark: "#14A08A", cl: "3.31", cd: "4.45" },
  { name: "Kaki 柿 · hồng giòn", light: "#D65A22", dark: "#E0662E", cl: "3.93", cd: "4.23" },
  { name: "Sora 空 · xanh trời", light: "#0A8FB8", dark: "#22A4C6", cl: "3.73", cd: "4.98" },
  { name: "Koke 苔 · rêu", light: "#4E8A1E", dark: "#5FA032", cl: "4.22", cd: "4.55" },
];

function Swatch({ token, size = 28 }: { token: string; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden className="shrink-0">
      <rect width={size} height={size} rx={4} style={{ fill: `var(${token})` }} />
    </svg>
  );
}

function PalettePanel({ theme }: { theme: "light" | "dark" }) {
  return (
    <div data-theme={theme} className="flex flex-col gap-M rounded-xlarge border border-stroke-2 bg-background-1 p-L">
      <p className="text-caption1 font-semibold text-foreground-3">
        {theme === "light" ? "Light · bề mặt #FFFFFF" : "Dark · bề mặt #292929"}
      </p>
      <ol className="flex flex-col gap-S">
        {CATEGORICAL.map((c, i) => (
          <li key={c.name} className="flex items-center gap-M">
            <span className="w-4 text-end text-caption1 text-foreground-3 tabular-nums">{i + 1}</span>
            <Swatch token={`--colorChartCategorical${i + 1}`} />
            <span className="min-w-0 flex-1 truncate text-body1 text-foreground-1">{c.name}</span>
            <span dir="ltr" className="font-mono text-caption1 text-foreground-2">
              {theme === "light" ? c.light : c.dark}
            </span>
            <span className="w-12 text-end text-caption1 text-foreground-3 tabular-nums">{theme === "light" ? c.cl : c.cd}:1</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RampPanel({ theme }: { theme: "light" | "dark" }) {
  return (
    <div data-theme={theme} className="flex flex-col gap-M rounded-xlarge border border-stroke-2 bg-background-1 p-L">
      <p className="text-caption1 font-semibold text-foreground-3">{theme === "light" ? "Light" : "Dark (neo đảo chiều)"}</p>
      <div className="flex flex-col gap-XS">
        <span className="text-caption1 text-foreground-2">Tuần tự · nhỏ → lớn</span>
        <div className="flex gap-XXS">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <Swatch key={n} token={`--colorChartSequential${n}`} size={32} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-XS">
        <span className="text-caption1 text-foreground-2">Phân kỳ · âm · giữa · dương</span>
        <div className="flex gap-XXS">
          <Swatch token="--colorChartDivergingNeg" size={32} />
          <Swatch token="--colorChartDivergingMid" size={32} />
          <Swatch token="--colorChartDivergingPos" size={32} />
          <span className="ms-M flex items-center gap-S text-caption1 text-foreground-2">
            <Swatch token="--colorChartOther" size={16} />
            Khác / làm nền
          </span>
        </div>
      </div>
    </div>
  );
}

const VALIDATE = `# Từ thư mục skill dataviz — chạy cho từng chế độ, trên đúng bề mặt của biểu đồ
node scripts/validate_palette.js "#c2347a,#2f6fd0,#b78300,#7a5ad6,#0e9f8a,#d65a22,#0a8fb8,#4e8a1e" --mode light --surface "#ffffff"
node scripts/validate_palette.js "#e24a92,#4a8eeb,#c08400,#9079e6,#14a08a,#e0662e,#22a4c6,#5fa032" --mode dark --surface "#292929"

# Dạng "mọi cặp" (scatter, bản đồ, small multiples) — chỉ 3 màu đầu
node scripts/validate_palette.js "#c2347a,#2f6fd0,#b78300" --mode light --surface "#ffffff" --pairs all`;

const TOKENS_CSS = `/* src/styles/charts.css — dùng trong SVG qua style={{ fill: "var(--…)" }} */
--colorChartCategorical1 … 8   /* nhận diện chuỗi, thứ tự cố định */
--colorChartSequential1 … 7    /* độ lớn, một sắc Sakura (ordinal: chỉ bậc 3–7) */
--colorChartDivergingNeg / Mid / Pos
--colorChartOther              /* "Khác", chuỗi làm nền */
--colorChartSurface  --colorChartGrid  --colorChartAxis  --colorChartCrosshair
--colorChartLabel  --colorChartLabelStrong
--chartAreaOpacity  --chartDimOpacity`;

/* ------------------------------------------------------------------ Demo */

const demoSales = [
  { month: "T7", online: 510, store: 325 },
  { month: "T8", online: 488, store: 340 },
  { month: "T9", online: 560, store: 352 },
  { month: "T10", online: 615, store: 360 },
];

const demoTrend = [
  { month: "T5", search: 5050, social: 3600 },
  { month: "T6", search: 5600, social: 3900 },
  { month: "T7", search: 6100, social: 3700 },
  { month: "T8", search: 6400, social: 4200 },
  { month: "T9", search: 6250, social: 4550 },
  { month: "T10", search: 6900, social: 4800 },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="form"
        title="Chọn dạng biểu đồ"
        description="Màu đến sau cùng. Trước hết hỏi: người đọc cần làm gì với dữ liệu — so độ lớn, nhận diện chuỗi, thấy dấu âm/dương, hay chỉ cần một con số?"
      >
        <div className="flex flex-col gap-XL">
          <SimpleTable
            head={["Nhiệm vụ", "Dạng mặc định", "Việc của màu", "Trong Yugen"]}
            rows={[
              ["Một giá trị hiện tại (+ xu hướng)", "Ô số liệu — không phải biểu đồ một cột", "—", <C key="c">StatTile</C>],
              ["So sánh độ lớn", "Cột; thanh ngang khi nhiều danh mục / tên dài", "Một màu (ô 1)", <C key="c">BarChart</C>],
              ["Xu hướng theo thời gian", "Đường; vùng nếu chỉ một chuỗi", "Một màu hoặc phân loại", <><C>LineChart</C> <C>AreaChart</C></>],
              ["Phân biệt nhiều chuỗi", "Cột nhóm / chồng, nhiều đường", "Phân loại", <><C>BarChart</C> <C>LineChart</C></>],
              ["Một chuỗi là trọng tâm", "Nhấn mạnh: một màu, còn lại xám", "1 màu + xám", <C key="c">highlight</C>],
              ["Trên / dưới mốc 0", "Cột phân kỳ", "Phân kỳ (2 cực + giữa xám)", <C key="c">diverging</C>],
              ["Phần – tổng", "Cột chồng; donut ≤ 6 lát để nhìn nhanh", "Phân loại", <><C>stacked</C> <C>DonutChart</C></>],
              ["Hơn ~7 nhóm đều quan trọng", "Bảng (hoặc bảng + biểu đồ)", "—", <C key="c">Table</C>],
            ]}
          />
          <P>
            Thang số chuỗi: 1–3 chuỗi chỉ màu là đủ; 4 chuỗi bắt buộc nhãn trực tiếp; 5–6 là trần mềm (legend hoặc small multiples); 7–8 là trần
            token. Chuỗi thứ 9 không bao giờ là một màu mới — gộp vào “Khác”, tách small multiples hoặc mã hoá kết hợp.
          </P>
          <div className="grid gap-L md:grid-cols-2">
            <div className="flex flex-col gap-S rounded-xlarge border border-stroke-2 bg-background-1 p-L">
              <p className="text-caption1 font-semibold text-foreground-3">Câu trả lời là một con số</p>
              <StatTile label="Đơn hàng hôm nay" value={1284} delta={0.064} deltaLabel="so với hôm qua" trend={[820, 910, 870, 990, 1040, 1010, 1120, 1180, 1150, 1210, 1240, 1284]} />
            </div>
            <div className="flex flex-col gap-S rounded-xlarge border border-stroke-2 bg-background-1 p-L">
              <p className="text-caption1 font-semibold text-foreground-3">Câu chuyện là một chuỗi</p>
              <LineChart
                data={demoTrend}
                index="month"
                highlight="social"
                height={180}
                hideTableToggle
                series={[
                  { key: "search", label: "Tìm kiếm" },
                  { key: "social", label: "Mạng xã hội" },
                ]}
              />
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        id="palette"
        title="Bảng màu & token"
        description="Mỗi màu làm đúng một việc: phân loại (nhận diện), tuần tự (độ lớn), phân kỳ (dấu), trạng thái (tốt/xấu — dành riêng). Bảng phân loại Yugen dẫn bằng Sakura, thứ tự cố định — chính thứ tự là cơ chế an toàn cho người mù màu."
      >
        <div className="flex flex-col gap-XL">
          <div className="grid gap-L lg:grid-cols-2">
            <PalettePanel theme="light" />
            <PalettePanel theme="dark" />
          </div>
          <P>
            Dark không phải đảo màu tự động: cùng 8 sắc, mỗi sắc chọn bậc riêng cho bề mặt tối (OKLCH L 0.48–0.67) và kiểm lại trên{" "}
            <C>#292929</C>. Ở theme Tương phản cao mọi mark thành trắng; nhận diện chuyển sang hoa văn 45° / 135° (cột, lát) và nét đứt (đường).
          </P>
          <SimpleTable
            head={["Kiểm tra (validate_palette.js)", "Light · #FFFFFF", "Dark · #292929"]}
            rows={[
              ["Dải lightness OKLCH", "PASS — cả 8 trong 0.43–0.77", "PASS — cả 8 trong 0.48–0.67"],
              ["Chroma ≥ 0.10", "PASS", "PASS"],
              ["Mù màu đỏ–lục, cặp kề (ΔE ≥ 8)", "PASS — tệ nhất 12.9 (Kaki ↔ Matcha, deutan)", "PASS — tệ nhất 12.8 (Kaki ↔ Matcha, protan)"],
              ["Mắt thường, cặp kề (ΔE ≥ 15)", "PASS — tệ nhất 19.8 (Koke ↔ Sora)", "PASS — tệ nhất 19.0 (Koke ↔ Sora)"],
              ["Tương phản với bề mặt ≥ 3:1", "PASS — 3.31 … 5.16", "PASS — 3.90 … 4.98"],
              ["Mọi cặp (scatter, bản đồ)", "3 màu đầu: ΔE 14.4 — trần 3 chuỗi", "3 màu đầu: ΔE 13.8 — trần 3 chuỗi"],
            ]}
          />
          <CodeBlock code={VALIDATE} />
          <div className="grid gap-L lg:grid-cols-2">
            <RampPanel theme="light" />
            <RampPanel theme="dark" />
          </div>
          <P>
            Tuần tự là một sắc Sakura từ nhạt đến đậm (dark: neo đảo chiều — giá trị nhỏ chìm về nền). Khi dùng cho thứ bậc rời rạc (phễu, hạng) chỉ
            lấy bậc 3–7 để bậc nhạt nhất vẫn ≥ 2:1 (đã kiểm <C>--ordinal</C>). Phân kỳ: Sakura ↔ Ai, điểm giữa xám trung tính — không bao giờ là
            một sắc. Màu trạng thái (success / warning / danger) không nằm trong bảng phân loại và luôn đi cùng icon + chữ.
          </P>
          <CodeBlock code={TOKENS_CSS} />
        </div>
      </DocSection>

      <DocSection
        id="marks"
        title="Mark & khoảng trắng"
        description="Vẻ tĩnh, có chủ ý đến từ vài thông số cố định và hai khoảng trắng. Chỉ dữ liệu được phép “to tiếng”."
      >
        <div className="flex flex-col gap-XL">
          <SimpleTable
            head={["Mark", "Thông số"]}
            rows={[
              ["Cột / thanh", "≤ 24px (không lấp đầy khe), đầu dữ liệu bo 4px, vuông ở đường gốc, mọc từ một đường gốc"],
              ["Đường", "2px, đầu và khớp bo tròn"],
              ["Chấm / điểm cuối", "≥ 8px, cùng màu chuỗi, viền 2px màu bề mặt"],
              ["Vùng", "Màu chuỗi ~10% (dark 14%) — lớp nhạt, không phải khối đặc"],
              ["Lưới / trục", "Mảnh 1px, liền nét (không bao giờ đứt), lệch một bậc so với bề mặt"],
              ["Khe bề mặt", "2px giữa mọi mark chạm nhau: đoạn cột chồng, cột cạnh nhau, lát donut — không vẽ viền quanh mark"],
              ["Nhãn", "Chọn lọc: điểm cuối, cực trị, chuỗi là trọng tâm. Chữ luôn dùng token chữ, không dùng màu chuỗi"],
            ]}
          />
          <div className="rounded-xlarge border border-stroke-2 bg-background-1 p-L">
            <BarChart
              title="Doanh thu (triệu ₫)"
              description="Hai chuỗi → có legend; cột mảnh, khe 2px giữa hai cột trong nhóm"
              data={demoSales}
              index="month"
              series={[
                { key: "online", label: "Trực tuyến" },
                { key: "store", label: "Cửa hàng" },
              ]}
              height={220}
            />
          </div>
        </div>
      </DocSection>

      <DocSection
        id="interaction"
        title="Tương tác"
        description="Biểu đồ HTML/SVG mặc định là tương tác. Tooltip bổ sung, không bao giờ là cách duy nhất để đọc giá trị."
      >
        <div className="flex flex-col gap-XL">
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>Đường / vùng: crosshair dọc bám mốc X gần nhất; một tooltip liệt kê mọi chuỗi tại mốc đó.</li>
            <li>Cột / lát: chính mark là vùng chạm (rộng hơn mark, gồm cả khe); mark được chọn nổi lên, các mark khác mờ đi.</li>
            <li>Trong tooltip giá trị đậm và đứng trước về thứ bậc; tên chuỗi là phụ, khoá bằng một nét ngắn màu chuỗi (không phải ô đặc). Legend thì phản chiếu mark: ô cho cột / vùng, nét cho đường.</li>
            <li>Legend của biểu đồ nhiều chuỗi là nút bật/tắt; chuỗi còn lại giữ nguyên màu (màu theo thực thể, không theo thứ hạng).</li>
            <li>Bộ lọc (khoảng ngày, chiều dữ liệu) nằm một hàng phía trên mọi biểu đồ mà nó tác động — không đặt trong thẻ biểu đồ.</li>
          </ul>
          <SimpleTable
            head={["Phím", "Hành vi"]}
            rows={[
              [<Kbd key="k">Tab</Kbd>, "Vào biểu đồ (một điểm dừng duy nhất) — tooltip hiện cho điểm đang focus."],
              [<span key="k" className="inline-flex gap-XS"><Kbd>←</Kbd><Kbd>→</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd></span>, "Điểm trước / sau (vùng vẽ luôn LTR nên → là tiến, kể cả trang RTL)."],
              [<span key="k" className="inline-flex gap-XS"><Kbd>Home</Kbd><Kbd>End</Kbd></span>, "Điểm đầu / cuối."],
              [<Kbd key="k">Esc</Kbd>, "Ẩn tooltip."],
            ]}
          />
          <div className="rounded-xlarge border border-stroke-2 bg-background-1 p-L">
            <LineChart
              title="Lượt truy cập"
              description="Rê chuột hoặc Tab vào biểu đồ rồi dùng phím mũi tên"
              data={demoTrend}
              index="month"
              markers
              height={220}
              series={[
                { key: "search", label: "Tìm kiếm" },
                { key: "social", label: "Mạng xã hội" },
              ]}
            />
          </div>
        </div>
      </DocSection>

      <DocSection
        id="accessibility"
        title="Khả năng tiếp cận"
        description="Nhận diện không bao giờ chỉ dựa vào màu: legend luôn có khi ≥ 2 chuỗi, nhãn trực tiếp khi ≤ 4, và mọi biểu đồ có bảng dữ liệu tương đương."
      >
        <div className="flex flex-col gap-XL">
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>
              Khung là <C>figure</C> có tên từ tiêu đề; vùng vẽ SVG mang <C>aria-label</C> tóm tắt dữ liệu; mỗi điểm dữ liệu focus được là{" "}
              <C>role=&quot;img&quot;</C> với nhãn “danh mục, chuỗi: giá trị”.
            </li>
            <li>
              Nút <strong className="font-semibold text-foreground-1">Bảng dữ liệu</strong> chuyển sang <C>table</C> có tiêu đề cột và tiêu đề hàng — bản
              tương đương đạt WCAG của biểu đồ.
            </li>
            <li>
              Theme Tương phản cao và <C>forced-colors</C> tự bật hoa văn / nét đứt; prop <C>texture</C> bật thủ công (in ấn, mù màu toàn phần).
            </li>
            <li>Số và ngày định dạng bằng Intl theo <C>locale</C> (mặc định vi-VN): trục rút gọn 1 N / 2,5 Tr, tooltip và bảng đầy đủ.</li>
            <li>Vùng vẽ luôn <C>dir=&quot;ltr&quot;</C> (trục thời gian không đảo); tiêu đề, legend và tooltip theo hướng chữ của trang.</li>
            <li>Animation vào cảnh (cột mọc từ gốc, đường tự vẽ) tắt hẳn khi <C>prefers-reduced-motion</C>.</li>
          </ul>
          <div className="rounded-xlarge border border-stroke-2 bg-background-1 p-L">
            <BarChart
              title="Chế độ bảng"
              description="defaultShowTable mở sẵn bảng; bấm “Bảng dữ liệu” để quay lại biểu đồ"
              data={demoSales}
              index="month"
              series={[
                { key: "online", label: "Trực tuyến" },
                { key: "store", label: "Cửa hàng" },
              ]}
              indexLabel="Tháng"
              defaultShowTable
              height={220}
            />
          </div>
        </div>
      </DocSection>

      <DocSection id="anti-patterns" title="Lỗi thường gặp" description="Nếu biểu đồ khớp một mục bên phải, nó sai — sửa trước khi phát hành.">
        <DoDont
          dos={[
            "Hai đại lượng khác thang → hai biểu đồ, small multiples, hoặc chỉ số hoá về cùng gốc trên một trục.",
            "Màu theo thực thể: lọc bớt chuỗi thì chuỗi còn lại giữ nguyên màu.",
            "Câu chuyện là một con số → StatTile; là một chuỗi → highlight, phần còn lại xám.",
            "Lưới và trục mảnh 1px liền nét, lùi về sau; cột mảnh, nhiều khoảng thở.",
            "Nhãn không vừa trong mark thì đưa ra ngoài đầu cột hoặc vào tooltip — giá trị vẫn có trong bảng.",
            "Chạy validate_palette.js cho mọi bảng màu mới, cả light và dark.",
          ]}
          donts={[
            "Biểu đồ hai trục Y — tạo ra tương quan không có thật.",
            "Sinh thêm màu thứ 9, hoặc xoay vòng màu khi quá 8 chuỗi.",
            "Cầu vồng cho dữ liệu tuần tự; một sắc ở điểm giữa phân kỳ; hai cực cùng tông lạnh.",
            "Màu trạng thái dùng cho “chuỗi 4”, hoặc màu chuỗi dùng để báo trạng thái.",
            "Donut để so các giá trị sát nhau, pie 2 lát, biểu đồ một cột.",
            "Ghi số ở mọi điểm, lưới nét đứt, viền vẽ quanh mark, tooltip là cách duy nhất để đọc giá trị.",
          ]}
        />
      </DocSection>
    </>
  );
}
