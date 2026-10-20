import * as React from "react";
import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  MessageBar,
  normalizeSearchText,
  SearchBox,
  toast,
} from "@/components/ui";
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

function Tile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-M rounded-xlarge border border-stroke-2 bg-background-1 p-L">
      <span className="text-caption1 font-semibold text-foreground-3">{title}</span>
      {children}
    </div>
  );
}

function DeleteProjectDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button appearance="danger">Xoá dự án</Button>
      </DialogTrigger>
      <DialogSurface modalType="alert">
        <DialogTitle action={null}>Xoá dự án “Sakura”?</DialogTitle>
        <DialogDescription>12 tệp và lịch sử thay đổi sẽ bị xoá vĩnh viễn. Không thể hoàn tác.</DialogDescription>
        <DialogActions>
          <DialogClose asChild>
            <Button>Huỷ</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="danger">Xoá vĩnh viễn</Button>
          </DialogClose>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

const CITIES = ["Hà Nội", "Hải Phòng", "Huế", "Đà Nẵng", "Hội An", "Nha Trang", "Đà Lạt", "TP. Hồ Chí Minh", "Cần Thơ", "Hạ Long"];

function FilterDemo() {
  const [query, setQuery] = React.useState("");
  const [announced, setAnnounced] = React.useState("");
  const results = CITIES.filter((c) => normalizeSearchText(c).includes(normalizeSearchText(query)));

  // Chỉ thông báo khi người dùng ngừng gõ — tránh đọc liên tục sau mỗi phím.
  React.useEffect(() => {
    const id = window.setTimeout(() => setAnnounced(query ? `${results.length} kết quả cho “${query}”` : ""), 600);
    return () => window.clearTimeout(id);
  }, [query, results.length]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-S">
      <SearchBox aria-label="Lọc thành phố" placeholder="Lọc thành phố" value={query} onValueChange={setQuery} />
      <p className="text-caption1 text-foreground-3">{results.length} kết quả</p>
      <p role="status" className="sr-only">
        {announced}
      </p>
      <ul className="flex flex-wrap gap-XS">
        {results.map((c) => (
          <li key={c} className="rounded-circular bg-background-3 px-S py-XXS text-caption1 text-foreground-2">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

const CHOOSE_CODE = `{/* Lỗi gắn với một ô */}
<Field label="Mã giảm giá" validationState="error" validationMessage="Mã đã hết hạn ngày 30/9.">
  <Input defaultValue="SAKURA30" />
</Field>

{/* Trạng thái của cả trang / vùng, tồn tại tới khi được xử lý */}
<MessageBar
  intent="warning"
  title="Bộ nhớ sắp đầy."
  actions={<Button size="small">Nâng cấp</Button>}
>
  Bạn đã dùng 92% dung lượng.
</MessageBar>

{/* Phản hồi ngắn cho hành động vừa làm */}
toast({ intent: "success", title: "Đã lưu thay đổi" });

{/* Cần quyết định ngay, chặn mọi thao tác khác */}
<DialogSurface modalType="alert">
  <DialogTitle action={null}>Xoá dự án “Sakura”?</DialogTitle>
  …
</DialogSurface>`;

const POLITENESS_CODE = `{/* Polite: đọc khi trình đọc màn hình rảnh — kết quả, trạng thái, xác nhận */}
<div role="status">Đã lưu bản nháp lúc 14:05</div>

{/* Assertive: ngắt lời ngay — chỉ cho lỗi và cảnh báo cần xử lý */}
<div role="alert">Mất kết nối. Thay đổi chưa được lưu.</div>

{/* Vùng live phải có sẵn trong DOM TRƯỚC khi đổi nội dung */}
<p role="status" className="sr-only">{message}</p>`;

const TIMING_CODE = `import { toast } from "@/components/ui";

// Thành công, không có hành động: tự đóng sau 3 giây là hợp lý.
toast({ intent: "success", title: "Đã sao chép liên kết" });

// Lỗi hoặc có hành động: giữ lại tới khi người dùng đóng.
toast({
  intent: "error",
  title: "Không thể đồng bộ",
  body: "Kiểm tra kết nối mạng rồi thử lại.",
  timeout: -1,
  action: {
    label: "Thử lại",
    // Người dùng trình đọc màn hình có thể không kịp tới toast — chỉ cách làm khác.
    altText: "Thử đồng bộ lại bằng nút Đồng bộ trên thanh công cụ",
    onClick: retrySync,
  },
});`;

const ANNOUNCE_CODE = `import { AriaLiveAnnouncer, useAnnounce, YugenProvider } from "@/components/ui";

// 1. Gắn một lần ở gốc: render hai vùng live ẩn (polite / assertive)
<YugenProvider applyToDocument withToaster>
  <AriaLiveAnnouncer>
    <App />
  </AriaLiveAnnouncer>
</YugenProvider>

// 2. Gọi ở bất kỳ đâu
function UploadButton({ files }: { files: File[] }) {
  const { announce } = useAnnounce();

  async function upload() {
    announce("Đang tải lên…");
    try {
      await uploadFiles(files);
      announce(\`Đã tải lên \${files.length} tệp\`, { batchId: "upload" });
    } catch {
      announce("Tải lên thất bại. Thử lại sau.", { politeness: "assertive", batchId: "upload" });
    }
  }

  return <Button onClick={upload}>Tải lên</Button>;
}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="choose"
        title="Chọn kênh thông báo"
        description="Mức gián đoạn phải tương xứng với mức quan trọng. Bắt đầu từ kênh ít gián đoạn nhất còn đủ để người dùng không bỏ lỡ."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Kênh", "Khi nào", "Gián đoạn", "Trình đọc màn hình"]}
            rows={[
              ["Validation tại chỗ (Field)", "Lỗi hoặc gợi ý gắn với một ô nhập.", "Thấp", "Đọc khi focus vào ô (aria-describedby)."],
              ["MessageBar", "Trạng thái của trang / vùng: cảnh báo hạn mức, chế độ chỉ đọc, lỗi tải dữ liệu. Ở lại tới khi xử lý xong.", "Trung bình", "role=alert (error, warning) hoặc role=status (info, success)."],
              ["Toast", "Phản hồi ngắn cho hành động vừa làm: đã lưu, đã gửi, đã sao chép. Không chặn thao tác.", "Thấp", "Vùng thông báo của Radix; F8 để tới."],
              ["Dialog modalType=\"alert\"", "Cần quyết định ngay, thường là phá huỷ hoặc không hoàn tác được.", "Cao (chặn)", "role=alertdialog, focus vào bề mặt."],
              ["Live region (AriaLiveAnnouncer)", "Thay đổi không có thông báo nhìn thấy: lọc xong, tải thêm, đếm kết quả.", "Không", "Chỉ đọc, không hiển thị."],
            ]}
          />
          <div className="grid gap-L md:grid-cols-2">
            <Tile title="Validation tại chỗ">
              <Field label="Mã giảm giá" validationState="error" validationMessage="Mã đã hết hạn ngày 30/9.">
                <Input defaultValue="SAKURA30" />
              </Field>
            </Tile>
            <Tile title="MessageBar">
              <MessageBar intent="warning" title="Bộ nhớ sắp đầy." actions={<Button size="small">Nâng cấp</Button>}>
                Bạn đã dùng 92% dung lượng.
              </MessageBar>
            </Tile>
            <Tile title="Toast">
              <Button className="self-start" onClick={() => toast({ intent: "success", title: "Đã lưu thay đổi" })}>
                Lưu
              </Button>
            </Tile>
            <Tile title="Dialog alert">
              <div className="self-start">
                <DeleteProjectDialog />
              </div>
            </Tile>
          </div>
          <CodeBlock code={CHOOSE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="politeness"
        title="polite & assertive"
        description="Live region quyết định trình đọc màn hình đọc thay đổi lúc nào: polite chờ người dùng rảnh, assertive cắt ngang ngay."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Mức", "Thuộc tính", "Component Yugen", "Dùng cho"]}
            rows={[
              ["Polite", <C key="a">role=&quot;status&quot; · aria-live=&quot;polite&quot;</C>, "MessageBar info / success; Toast info / success; announce() mặc định", "Xác nhận, kết quả, tiến độ."],
              ["Assertive", <C key="a">role=&quot;alert&quot; · aria-live=&quot;assertive&quot;</C>, "MessageBar error / warning; Toast error / warning; announce(…, { politeness: \"assertive\" })", "Lỗi chặn công việc, mất dữ liệu, hết phiên."],
            ]}
          />
          <CodeBlock code={POLITENESS_CODE} />
          <P>
            Một số tổ hợp trình đọc màn hình bỏ qua vùng live được chèn vào DOM <strong className="font-semibold">cùng lúc</strong> với nội
            dung của nó. Với MessageBar hiện ra sau một hành động, giữ một khung chứa luôn có mặt và chỉ thay phần bên trong — hoặc gọi
            thêm <C>announce()</C> — để chắc chắn được đọc.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="timing"
        title="Đừng tự đóng điều quan trọng"
        description="Toast mặc định tự đóng sau 3 giây. Người đọc chậm, người phóng to màn hình, người dùng trình đọc màn hình đều có thể bỏ lỡ (WCAG 2.2.1)."
      >
        <div className="flex flex-col gap-L">
          <div className="flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">
            <Button onClick={() => toast({ intent: "success", title: "Đã sao chép liên kết" })}>Toast tự đóng</Button>
            <Button
              onClick={() =>
                toast({
                  intent: "error",
                  title: "Không thể đồng bộ",
                  body: "Kiểm tra kết nối mạng rồi thử lại.",
                  timeout: -1,
                  action: { label: "Thử lại", altText: "Thử đồng bộ lại bằng nút Đồng bộ trên thanh công cụ" },
                })
              }
            >
              Toast giữ lại
            </Button>
          </div>
          <CodeBlock code={TIMING_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>Rê chuột hoặc focus vào toast sẽ tạm dừng đồng hồ; F8 đưa focus tới vùng thông báo.</li>
            <li>
              Hành động trong toast phải có cách khác để làm (nút trên trang, menu); <C>altText</C> nói cho người dùng trình đọc màn hình
              biết cách đó.
            </li>
            <li>Lỗi chặn công việc thuộc về MessageBar hoặc validation tại chỗ, không phải toast.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="async"
        title="Kết quả bất đồng bộ"
        description="Khi nội dung thay đổi mà không có thông báo nhìn thấy — lọc danh sách, tải thêm, lưu tự động — hãy đọc kết quả qua live region."
      >
        <div className="flex flex-col gap-L">
          <div className="flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">
            <FilterDemo />
          </div>
          <P>
            Ví dụ trên dùng một <C>{'<p role="status" className="sr-only">'}</C> cập nhật sau khi người dùng ngừng gõ 600ms. Với nhiều
            thông báo từ nhiều nơi, dùng tiện ích <C>AriaLiveAnnouncer</C> + <C>useAnnounce()</C>: hàng đợi tự giãn cách để không thông báo
            nào bị nuốt, và <C>batchId</C> thay thông báo cũ cùng loại bằng thông báo mới nhất.
          </P>
          <CodeBlock code={ANNOUNCE_CODE} />
        </div>
      </DocSection>

      <DocSection id="rules" title="Nên & không nên">
        <DoDont
          dos={[
            "Kèm icon và chữ cho mọi trạng thái — không chỉ dựa vào màu.",
            "Viết thông báo nói rõ chuyện gì đã xảy ra và cần làm gì tiếp theo.",
            "Một sự kiện — một thông báo; gộp các cập nhật liên tiếp bằng batchId hoặc debounce.",
            "Giữ toast lỗi hoặc toast có hành động tới khi người dùng đóng (timeout: -1).",
          ]}
          donts={[
            "Không dùng role=\"alert\" cho thông tin thường — nó cắt ngang người dùng.",
            "Không thông báo theo từng phím gõ.",
            "Không đặt thông tin hay hành động duy nhất trong toast tự đóng.",
            "Không dùng Dialog cho thông báo không cần quyết định.",
          ]}
        />
      </DocSection>
    </>
  );
}
