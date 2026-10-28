import type { ReactNode } from "react";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { STATUS_COPY, STATUSES } from "../status/catalog";
import { StatusLab } from "../status/StatusLab";

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
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold whitespace-nowrap text-foreground-1" : "px-4 py-3 text-foreground-2"}>
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

const RECOVERY = `// 429 / 503: thời gian chờ lấy từ header, không đoán
const wait = Number(response.headers.get("Retry-After")) || 30;

// Mất mạng: thử lại khi trình duyệt báo có mạng
window.addEventListener("online", retry, { once: true });

// Bản mới: file JS của route không còn sau một lần deploy
const Settings = lazy(() => import("./pages/Settings").catch(() => ({ default: NewVersionPage })));`;

const COPY = STATUS_COPY.vi;

export default function StatusPagesPage() {
  return (
    <div className="flex flex-col">
      <DocSection id="when" title="Khi nào cần trang riêng">
        <P>
          Trang trạng thái thay cả vùng nội dung chính, nên chỉ dùng khi cả route không hiện được: đường dẫn không có trang, không có
          quyền, máy chủ lỗi, mất mạng lúc mở trang. Một phần của trang lỗi thì báo ngay tại phần đó, phần còn lại vẫn dùng được.
        </P>
        <SimpleTable
          head={["Tình huống", "Dùng"]}
          rows={[
            ["Cả route không render được", "Trang trạng thái"],
            ["Một vùng tải lỗi (bảng, biểu đồ)", <><C>ErrorState</C> trong vùng đó, có nút thử lại</>],
            ["Gửi form lỗi", "Lỗi ở từng field hoặc MessageBar; giữ nguyên dữ liệu đã nhập"],
            ["Lỗi ngắn, tự hết", "Toast hoặc MessageBar"],
          ]}
        />
      </DocSection>

      <DocSection
        id="lab"
        title="Phòng thử"
        description="Mười một trạng thái trong cùng bố cục với màn chờ khởi động. Đổi kiểu số (Kanji / Latin), chạy lại, hoặc xem toàn màn hình rồi chuyển trạng thái bằng nút trước / sau."
      >
        <StatusLab />
      </DocSection>

      <DocSection id="catalog" title="Danh mục trạng thái">
        <SimpleTable
          head={["Mã", "Tiêu đề", "Khi nào", "Hành động chính"]}
          rows={STATUSES.map((s) => [s.code ?? COPY[s.id].eyebrow, COPY[s.id].title, COPY[s.id].when, COPY[s.id].primary])}
        />
      </DocSection>

      <DocSection id="copy" title="Viết nội dung">
        <P>
          Tiêu đề nói chuyện gì xảy ra bằng lời thường (“Không tìm thấy trang”), mô tả nói vì sao nếu biết và người dùng làm được gì
          tiếp. Mã nằm ở dòng nhỏ phía trên tiêu đề cho ai cần báo lỗi, không bao giờ là chữ duy nhất trên trang.
        </P>
        <P>
          Không đổ lỗi cho người dùng, không đùa khi họ vừa mất việc đang làm, không in stack trace. Mã để tra lỗi (
          <C>7f3a-91c2</C>) là chữ thường, chọn và sao chép được.
        </P>
        <P>Mỗi trang có đúng một hành động chính; hành động phụ là lối ra an toàn như về trang chủ hay đổi tài khoản.</P>
      </DocSection>

      <DocSection id="art" title="Logo & mã viết dọc">
        <P>
          Logo ở góc đổi theo trạng thái: thiếu một cánh khi không tìm thấy trang, rụng hết khi trang đã bị gỡ, còn là nụ khi cần
          đăng nhập hoặc xin quyền, mực đứt khi máy chủ lỗi, nhạt khi hết thời gian chờ, chỉ còn vệt mờ khi mất mạng. Ở 429 và 503,
          nét cọ đầy dần theo thời gian chờ; hết giờ thì hoa nở cùng lúc nút Thử lại bật.
        </P>
        <P>
          Kiểu Kanji: mã viết dọc ở mép như màn chờ, đọc từng chữ số (四〇四); trạng thái không có mã dùng chữ: 圏外 (ngoài vùng phủ
          sóng) khi mất mạng, 新版 khi có bản mới. Kiểu Latin cho sản phẩm không dùng chữ Hán: mã nằm ngang, nét mảnh ở góc trên;
          trạng thái không có mã thì để trống góc đó.
        </P>
      </DocSection>

      <DocSection id="recovery" title="Tự khôi phục">
        <P>
          Trạng thái tạm thời phải tự hết: đếm ngược theo <C>Retry-After</C> rồi bật nút, nghe sự kiện <C>online</C> để thử lại khi có
          mạng, nạp file JS lỗi sau deploy thì mời tải lại. Đăng nhập xong (401) thì đưa người dùng về đúng trang họ định mở.
        </P>
        <CodeBlock code={RECOVERY} />
        <P>
          Trang 404 cần trả mã 404 thật và có <C>noindex</C>, để công cụ tìm kiếm không lập chỉ mục một trang trông như bình thường.
          Host tĩnh (GitHub Pages) chỉ trả được <C>404.html</C>; 500 và 503 khi đó do app tự hiện.
        </P>
      </DocSection>

      <DocSection id="a11y" title="Khả năng tiếp cận">
        <P>
          Tiêu đề là <C>h1</C> nói tên trạng thái; chuyển trang phía client thì đưa focus tới <C>h1</C> và cập nhật{" "}
          <C>document.title</C>. Mã viết dọc là trang trí (<C>aria-hidden</C>); mã đọc được nằm ở dòng phía trên tiêu đề.
        </P>
        <P>
          Đếm ngược báo qua live region <C>polite</C> theo từng quãng (10 giây), không phải mỗi giây. Không tự tải lại mà không nói trước.
          Khi giảm chuyển động, nét cọ có sẵn và cánh hoa nằm sẵn dưới đất thay vì rơi.
        </P>
      </DocSection>

      <DocSection id="rules" title="Nên & không nên">
        <DoDont
          dos={[
            "Nói chuyện gì xảy ra bằng lời thường, kèm mã ở dòng phụ.",
            "Một hành động chính, một lối ra an toàn.",
            "Đếm ngược theo Retry-After, thử lại khi có mạng.",
            "Trả mã HTTP thật và noindex cho trang 404.",
          ]}
          donts={[
            "Chuyển đường dẫn lạ về trang chủ như không có gì xảy ra.",
            "Chỉ hiện “404” hay “Error” mà không giải thích.",
            "In stack trace hoặc thông báo kỹ thuật cho người dùng.",
            "Tự tải lại liên tục khi máy chủ vẫn đang lỗi.",
          ]}
        />
      </DocSection>
    </div>
  );
}
