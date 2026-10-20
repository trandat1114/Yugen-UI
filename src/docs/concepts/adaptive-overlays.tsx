import * as React from "react";
import type { ReactNode } from "react";
import { Dismiss24Regular, Filter20Regular, Location20Regular } from "@fluentui/react-icons";
import { Button, Checkbox } from "@/components/ui";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet/Sheet";
import { useMediaQuery } from "@/components/ui/Sheet/useMediaQuery";
import { DocSection, DoDont, PropsTable } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: bảng rộng cuộn ngang được bằng bàn phím (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
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

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function DemoStage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">{children}</div>
  );
}

/* ------------------------------------------------------------------ demos */

function AdaptiveFilterDemo() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen} snapPoints={[0.6, 0.92]}>
        <SheetTrigger asChild>
          <Button icon={<Filter20Regular />}>Mở bộ lọc</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader
            action={
              <SheetClose asChild>
                <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
              </SheetClose>
            }
          >
            <SheetTitle>Bộ lọc</SheetTitle>
            <SheetDescription>{isDesktop ? "Đang là panel bên cạnh." : "Đang là bottom sheet — kéo tay nắm thử xem."}</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="flex flex-col gap-M">
              <Checkbox label="Còn hàng" defaultChecked />
              <Checkbox label="Giao trong 2 giờ" />
              <Checkbox label="Miễn phí vận chuyển" />
            </div>
          </SheetBody>
          <SheetFooter>
            <Button appearance="primary" onClick={() => setOpen(false)}>
              Áp dụng
            </Button>
            <SheetClose asChild>
              <Button>Huỷ</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <span className="text-body1 text-foreground-3">
        Viewport hiện {isDesktop ? "≥ 768px → panel" : "< 768px → bottom sheet"}. Thu hẹp cửa sổ để đổi dạng.
      </span>
    </>
  );
}

const STOPS = ["Bến Nghé", "Nhà hát Thành phố", "Ba Son", "Văn Thánh", "Tân Cảng", "Thảo Điền", "An Phú", "Rạch Chiếc"];

function SnapPlaygroundDemo() {
  const [snap, setSnap] = React.useState(0.25);
  return (
    <>
      <Sheet mode="bottom" snapPoints={[0.25, 0.5, 0.9]} snapPoint={snap} onSnapPointChange={setSnap}>
        <SheetTrigger asChild>
          <Button icon={<Location20Regular />}>Thử ba nấc</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Tuyến metro số 1</SheetTitle>
            <SheetDescription>Nấc hiện tại: {Math.round(snap * 100)}% chiều cao màn hình.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <ol className="flex flex-col gap-S">
              {STOPS.map((stop, i) => (
                <li key={stop} className="flex items-center gap-S rounded-medium bg-background-2 px-M py-S">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-circular bg-background-1 text-caption1 font-semibold">
                    {i + 1}
                  </span>
                  {stop}
                </li>
              ))}
            </ol>
          </SheetBody>
        </SheetContent>
      </Sheet>
      <span className="text-body1 text-foreground-3">Nấc gần nhất: {Math.round(snap * 100)}%</span>
    </>
  );
}

/* ------------------------------------------------------------------ code */

const CHOOSE_CODE = `import { useMediaQuery, Popover, PopoverTrigger, PopoverSurface, Sheet, SheetTrigger, SheetContent } from "@/components/ui";

// Menu chia sẻ: Popover neo vào nút trên desktop, bottom sheet trong tầm ngón cái trên điện thoại.
function ShareAction() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const trigger = <Button icon={<Share20Regular />}>Chia sẻ</Button>;

  if (isDesktop) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverSurface><ShareOptions /></PopoverSurface>
      </Popover>
    );
  }
  return (
    <Sheet mode="bottom" snapPoints={[0.4]}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>Chia sẻ</SheetTitle></SheetHeader>
        <SheetBody><ShareOptions /></SheetBody>
      </SheetContent>
    </Sheet>
  );
}`;

const SHEET_CODE = `<Sheet
  side="end"              // desktop: panel ở cạnh cuối dòng (trái khi RTL)
  size="medium"           // 592px
  breakpoint={768}        // < 768px → bottom sheet
  snapPoints={[0.45, 0.9]}
  onSnapPointChange={(snap) => analytics.track("sheet_snap", { snap })}
>
  <SheetTrigger asChild><Button>Chi tiết đơn hàng</Button></SheetTrigger>
  <SheetContent>
    <SheetHeader action={<SheetClose asChild><Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" /></SheetClose>}>
      <SheetTitle>Đơn #2026-1020</SheetTitle>
      <SheetDescription>3 sản phẩm · giao trước 18:00</SheetDescription>
    </SheetHeader>
    <SheetBody>{/* nội dung dài — chỉ cuộn khi sheet ở nấc cao nhất */}</SheetBody>
    <SheetFooter>{/* luôn bám đáy màn hình, kể cả ở nấc 45% */}</SheetFooter>
  </SheetContent>
</Sheet>`;

const SAFE_AREA_CODE = `<!-- index.html: bật env(safe-area-inset-*) và để bàn phím ảo co nội dung lại -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
/>`;

const MOTION_CODE = `// CSS: Sheet dùng motion-reduce:animate-none / motion-reduce:transition-none sẵn.
// JS: hành vi tự viết đọc trực tiếp sở thích của người dùng.
const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

list.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });`;

/* ------------------------------------------------------------------ page */

export default function Page() {
  return (
    <>
      <DocSection
        id="choose"
        title="Chọn overlay"
        description="Bắt đầu từ tác vụ, rồi mới tới thiết bị. Overlay càng chặn nhiều thì càng phải xứng đáng với sự gián đoạn đó."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Overlay", "Desktop", "Điện thoại", "Dùng khi"]}
            rows={[
              [
                "Dialog",
                "Hộp giữa màn hình, modal.",
                "Vẫn giữa màn hình; chỉ dùng cho nội dung ngắn.",
                "Quyết định ngay: xác nhận, xoá, nhập 1–3 trường. modalType=\"alert\" cho hành động phá huỷ.",
              ],
              [
                "Drawer",
                "Panel cạnh trái / phải (overlay) hoặc nằm trong bố cục (inline).",
                "Dễ chiếm hết màn hình; nút đóng ở góc trên khó với tới.",
                "Điều hướng, panel phụ luôn ở một phía, đặc biệt InlineDrawer trên màn hình rộng.",
              ],
              [
                "Sheet (Labs)",
                "Panel cạnh start / end như Drawer.",
                "Bottom sheet kéo được, nhiều nấc, vuốt xuống để đóng.",
                "Tác vụ phụ cần không gian vừa phải trên mọi thiết bị: bộ lọc, chi tiết bản ghi, chia sẻ, chọn tuỳ chọn.",
              ],
              [
                "Popover",
                "Bề mặt nhỏ neo vào nút, không modal.",
                "Neo vào nút nhỏ, dễ bị bàn phím ảo hoặc mép màn hình che.",
                "Thông tin / lựa chọn ngắn gắn với một điểm cụ thể. Trên điện thoại cân nhắc chuyển sang Sheet.",
              ],
            ]}
          />
          <Bullets
            items={[
              <>
                Cần người dùng <strong className="font-semibold">dừng lại và quyết định</strong> → Dialog. Không đặt quyết định quan trọng
                trong một sheet có thể vuốt mất.
              </>,
              <>
                Nội dung <strong className="font-semibold">phụ trợ cho trang</strong> (lọc, xem chi tiết) và người dùng có thể dùng trên điện
                thoại → Sheet: một khai báo, hai dạng.
              </>,
              <>
                Lựa chọn nhỏ <strong className="font-semibold">gắn với một nút</strong> → Popover trên desktop; trên màn hình hẹp đổi sang
                bottom sheet bằng <C>useMediaQuery</C>.
              </>,
              <>Điều hướng chính của ứng dụng → Nav / InlineDrawer, không phải overlay tạm thời.</>,
            ]}
          />
          <CodeBlock code={CHOOSE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="sheet"
        title="Sheet: một API, hai dạng"
        description="Sheet chọn dạng theo chiều rộng viewport (useMediaQuery) — nội dung, focus và trạng thái giữ nguyên khi người dùng xoay máy hay thu nhỏ cửa sổ."
      >
        <div className="flex flex-col gap-L">
          <DemoStage>
            <AdaptiveFilterDemo />
          </DemoStage>
          <CodeBlock code={SHEET_CODE} />
          <PropsTable
            props={[
              { name: "mode", type: `"auto" | "side" | "bottom"`, defaultValue: `"auto"`, description: "auto theo breakpoint; side / bottom ép một dạng." },
              { name: "breakpoint", type: "number", defaultValue: "768", description: "Chiều rộng viewport (px) tối thiểu cho dạng panel." },
              { name: "side / size", type: `"start" | "end" / "small" | "medium" | "large"`, defaultValue: `"end" / "small"`, description: "Dạng panel: cạnh (tự đảo ở RTL) và độ rộng 320 / 592 / 940px." },
              { name: "snapPoints", type: "number[]", defaultValue: "[0.5, 0.9]", description: "Nấc chiều cao bottom sheet (phần của chiều cao viewport)." },
              { name: "modal / dismissible", type: "boolean", defaultValue: "true / true", description: "Lớp phủ + bẫy focus; cho phép Esc / bấm ngoài / vuốt để đóng." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="ergonomics"
        title="Công thái học bottom sheet"
        description="Trên điện thoại cầm một tay, phần ba dưới màn hình là vùng ngón cái với tới dễ nhất — bottom sheet đưa nội dung và hành động vào đúng vùng đó."
      >
        <div className="flex flex-col gap-L">
          <DemoStage>
            <SnapPlaygroundDemo />
          </DemoStage>
          <SimpleTable
            head={["Yếu tố", "Hành vi trong Yugen", "Gợi ý"]}
            rows={[
              ["Vùng ngón cái", "SheetFooter luôn bám đáy màn hình, kể cả ở nấc thấp.", "Đặt hành động chính ở footer, không ở tiêu đề."],
              [
                "Snap point",
                "Thả tay → về nấc gần nhất; nấc tính theo phần chiều cao viewport (dvh).",
                "2–3 nấc: xem nhanh (0.25–0.5), chi tiết (≈ 0.9 — chừa một dải trang phía trên để người dùng biết mình vẫn ở trang cũ).",
              ],
              [
                "Vuốt nhanh",
                "Vận tốc > 0.45 px/ms → nhảy sang nấc kế theo hướng vuốt.",
                "Không cần kéo xa; một cú hất là đủ.",
              ],
              [
                "Vuốt xuống để đóng",
                "Kéo thấp hơn nửa nấc thấp nhất hoặc hất xuống từ nấc thấp nhất; lớp phủ mờ dần theo tay.",
                "Tắt bằng dismissible={false} khi bắt buộc chọn.",
              ],
              [
                "Cuộn nội dung",
                "Chỉ cuộn ở nấc cao nhất; ở nấc thấp, kéo ở đâu cũng di chuyển sheet. Đang ở đầu nội dung mà kéo xuống → kéo cả sheet.",
                "Nội dung dài nên mở ở nấc thấp trước rồi để người dùng kéo lên.",
              ],
              [
                "Vùng không kéo",
                "Ô nhập, textarea, select và phần tử có data-sheet-no-drag không khởi động kéo; vuốt ngang được nhường cho carousel / slider.",
                "Gắn data-sheet-no-drag cho bản đồ, canvas, vùng vẽ.",
              ],
            ]}
          />
          <P>
            Trên trình duyệt desktop, thao tác kéo hoạt động với chuột (pointer events) khi Sheet ở dạng bottom; cuộn chuột và cử chỉ hai ngón
            trên touchpad không di chuyển sheet. Vì vậy dạng mặc định trên màn hình rộng là panel cạnh, không phải bottom sheet.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="a11y"
        title="Bàn phím & trình đọc màn hình"
        description="Mọi cử chỉ đều có cách làm tương đương không cần kéo (WCAG 2.5.1 Pointer Gestures, 2.5.7 Dragging Movements)."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Phím / tình huống", "Kết quả"]}
            rows={[
              ["Esc", "Đóng Sheet (trừ khi dismissible={false}); focus trở về nút đã mở."],
              ["Tab / Shift+Tab", "Đi vòng trong Sheet khi modal; không modal thì focus ra được trang phía sau."],
              ["Mở bottom sheet", "Focus vào chính bề mặt (role=\"dialog\") để trình đọc màn hình đọc SheetTitle + SheetDescription."],
              ["Tay nắm (là một nút)", "Enter / Space: nấc kế tiếp (vòng lại); ↑ / ↓: lên / xuống một nấc. Nhãn đọc kèm nấc hiện tại, ví dụ “Đổi chiều cao (45%)”."],
              ["Focus bàn phím hoặc chạm ô nhập ở nấc thấp", "Sheet tự mở lên nấc cao nhất để phần tử đang focus không nằm ngoài màn hình."],
              ["Vuốt để đóng", "Luôn kèm nút Đóng / Huỷ nhìn thấy được trong tiêu đề hoặc footer."],
            ]}
          />
          <P>
            Sheet dựng trên Radix Dialog: <C>aria-labelledby</C> trỏ tới SheetTitle, <C>aria-describedby</C> chỉ được gắn khi có
            SheetDescription, phần còn lại của trang bị ẩn khỏi cây truy cập khi modal. Tay nắm chỉ là nút khi có từ hai nấc; với một nấc nó là
            trang trí (aria-hidden).
          </P>
        </div>
      </DocSection>

      <DocSection
        id="safe-area"
        title="Vùng an toàn & bàn phím ảo"
        description="Tai thỏ, Dynamic Island và thanh home indicator lấn vào vùng hiển thị — bottom sheet phải chừa chỗ cho chúng."
      >
        <div className="flex flex-col gap-L">
          <Bullets
            items={[
              <>
                Footer (và Body khi không có footer) cộng <C>env(safe-area-inset-bottom)</C> vào padding dưới để nút không nằm dưới thanh home.
              </>,
              <>
                Chiều cao tối đa = <C>min(nấc cao nhất × 100dvh, 100dvh − env(safe-area-inset-top))</C> — không bao giờ chui dưới tai thỏ.
              </>,
              <>
                Dùng đơn vị <C>dvh</C> thay cho <C>vh</C>: chiều cao thật thay đổi khi thanh địa chỉ của trình duyệt di động co / giãn.
              </>,
              <>
                <C>env()</C> chỉ khác 0 khi trang khai báo <C>viewport-fit=cover</C>; thêm <C>interactive-widget=resizes-content</C> để bàn phím
                ảo đẩy nội dung lên thay vì che ô nhập.
              </>,
            ]}
          />
          <CodeBlock code={SAFE_AREA_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="motion"
        title="Giảm chuyển động"
        description="Khi hệ điều hành bật “giảm chuyển động”, overlay xuất hiện / biến mất tức thì — nhưng thao tác trực tiếp vẫn bám theo tay."
      >
        <div className="flex flex-col gap-L">
          <Bullets
            items={[
              "Trượt vào / ra, mờ lớp phủ và chuyển động về nấc đều tắt (motion-reduce:animate-none, motion-reduce:transition-none).",
              "Kéo bằng tay vẫn di chuyển sheet theo ngón tay — đó là thao tác trực tiếp, không phải hoạt ảnh trang trí.",
              "Hiệu ứng đàn hồi khi kéo quá nấc cao nhất chỉ xảy ra trong lúc kéo, dừng ngay khi thả tay.",
              "Carousel không tự bật autoplay khi người dùng chọn giảm chuyển động.",
            ]}
          />
          <CodeBlock code={MOTION_CODE} />
        </div>
      </DocSection>

      <DocSection id="rules" title="Nên & không nên">
        <DoDont
          dos={[
            "Dùng một Sheet cho cả desktop và điện thoại thay vì hai component rẽ nhánh thủ công.",
            "Đặt hành động chính ở SheetFooter — trong vùng ngón cái và luôn nhìn thấy.",
            "Luôn có nút đóng nhìn thấy được; cử chỉ chỉ là lối tắt.",
            "Thử trên máy thật với thanh địa chỉ co giãn, bàn phím ảo và chế độ giảm chuyển động.",
          ]}
          donts={[
            "Không dùng bottom sheet cho quyết định phá huỷ — dùng Dialog modalType=\"alert\".",
            "Không đặt quá 3 nấc; người dùng không nhớ được nhiều vị trí.",
            "Không mở overlay chồng overlay (Sheet trong Sheet, Dialog trên Sheet) trừ xác nhận ngắn.",
            "Không giấu thông tin bắt buộc ở phần dưới của nấc thấp — nó nằm ngoài màn hình.",
          ]}
        />
      </DocSection>
    </>
  );
}
