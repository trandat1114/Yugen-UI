import type { ReactNode } from "react";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { kanji, MINCHO } from "../boot/kanji";
import { LoadingLab } from "../boot/LoadingLab";

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

const MEASURE = `// Đếm file JS / CSS cùng origin đã tải xong
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) if (sameOrigin(entry)) count++;
}).observe({ type: "resource", buffered: true });

// So với số file của lần tải trước; nhiều hơn thì nới mẫu số — thanh chậm lại chứ không lùi
const measured = Math.min(0.95, count / Math.max(expected, count / 0.95));

// App render xong (html[data-docs-ready]) mới chạy nốt 95% → 100% trong 400 ms
if (document.documentElement.hasAttribute("data-docs-ready")) finish();`;

const SAMPLES = [0, 7, 10, 12, 40, 99, 100];

export default function LoadingScreenPage() {
  return (
    <div className="flex flex-col">
      <DocSection id="when" title="Khi nào cần">
        <P>
          Màn chờ toàn trang che mọi thứ, nên chỉ đáng dùng khi phía sau nó thật sự trống. Trang đã có nội dung thì để người dùng đọc
          luôn; phần còn đang tải dùng skeleton hoặc chỉ báo tại chỗ (xem Trải nghiệm chờ).
        </P>
        <SimpleTable
          head={["Tình huống trên site docs", "Màn chờ", "Vì sao"]}
          rows={[
            ["Trang prerender (bản build)", "Không", "HTML đã có nội dung ở lần vẽ đầu; che lại chỉ làm chậm LCP."],
            ["Prerender bị ẩn (khác ngôn ngữ, RTL)", "Có", <>data-pending ẩn #root tới khi React render xong.</>],
            [<C key="404">404.html</C>, "Có", "Khung trống, React tự render theo URL."],
            [<C key="dev">npm run dev</C>, "Có", "Không có prerender; Vite trả từng module (~280 file) trước lần render đầu."],
          ]}
        />
      </DocSection>

      <DocSection
        id="lab"
        title="Phòng thử concept"
        description="Bốn concept chạy cùng một lần tải mô phỏng. Đổi tốc độ, bật giảm chuyển động hoặc xem từng concept toàn màn hình."
      >
        <LoadingLab />
      </DocSection>

      <DocSection id="progress" title="Tiến độ đo thật">
        <P>
          Thanh tiến độ giả (chạy theo đồng hồ) sẽ sai ở máy nhanh lẫn máy chậm. Màn chờ của docs đếm file thật: số file JS và CSS đã
          tải xong, so với số file của lần mở trước (lưu trong localStorage). Lần đầu chưa có số đo thì dùng một con số ước lượng.
        </P>
        <CodeBlock code={MEASURE} />
        <P>
          Số dừng ở 95% tới khi trang render xong, nên không bao giờ báo xong sớm hơn thực tế. 15 giây không có file mới thì đổi sang
          thông báo lỗi kèm link Tải lại, thay vì quay mãi.
        </P>
      </DocSection>

      <DocSection id="numerals" title="Số Hán & chữ">
        <P>
          Số tiến độ viết bằng số Hán cho hợp với logo enso, dùng font Mincho nếu máy có (Yu Mincho, Hiragino Mincho, Noto Serif JP),
          không có thì serif. Không cần dấu %: số chỉ là nhịp, còn con số chính xác đi qua thuộc tính ARIA.
        </P>
        <SimpleTable
          head={["Số", "Viết"]}
          rows={SAMPLES.map((n) => [n, <span key={n} className="text-subtitle1" style={{ fontFamily: MINCHO }}>{kanji(n)}</span>])}
        />
        <P>
          Chữ “Đang tải” nằm dưới logo, giãn chữ rộng và mờ tỏ chậm. Trang tiếng Anh hiện “Loading”.
        </P>
      </DocSection>

      <DocSection id="motion" title="Giảm chuyển động">
        <P>
          Khi hệ điều hành bật giảm chuyển động (<C>prefers-reduced-motion: reduce</C>), mực không chạy theo nét bút mà đậm dần tại chỗ,
          chữ “Đang tải” đứng yên, và màn chờ đóng ngay thay vì mờ dần. Tiến độ vẫn hiện đầy đủ, chỉ bỏ phần chuyển động.
        </P>
      </DocSection>

      <DocSection id="a11y" title="Khả năng tiếp cận">
        <P>
          Màn chờ là <C>role=&quot;progressbar&quot;</C> có <C>aria-label</C> và <C>aria-valuenow</C> bằng số thường; số Hán để{" "}
          <C>aria-hidden</C> vì trình đọc màn hình đọc “四十一” không giúp gì. Khi xong, màn chờ đặt <C>aria-hidden</C> rồi rời khỏi DOM.
        </P>
        <P>
          Ở dev, lớp phủ lỗi biên dịch của Vite luôn nằm trên màn chờ. Ở chế độ tương phản cao của Windows, màn chờ dùng màu hệ thống
          (<C>Canvas</C>, <C>CanvasText</C>).
        </P>
      </DocSection>

      <DocSection id="rules" title="Nên & không nên">
        <DoDont
          dos={[
            "Chỉ hiện màn chờ khi trang chưa có gì để hiện.",
            "Đo tiến độ từ việc tải thật và chỉ tới 100 khi trang đã render.",
            "Đợi ~200 ms rồi mới hiện logo, để lần tải nhanh không bị chớp.",
            "Có thông báo lỗi và cách thử lại khi việc tải dừng hẳn.",
          ]}
          donts={[
            "Che trang prerender đã có nội dung chỉ để chạy hiệu ứng.",
            "Cho thanh tiến độ chạy theo đồng hồ rồi đứng ở 99%.",
            "Giữ màn chờ thêm sau khi trang đã sẵn sàng.",
            "Để trình đọc màn hình đọc số trang trí thay cho giá trị tiến độ.",
          ]}
        />
      </DocSection>
    </div>
  );
}
