import type { ReactNode } from "react";
import { Delete20Regular, Share20Regular, TextBold20Regular, TextItalic20Regular, TextUnderline20Regular } from "@fluentui/react-icons";
import {
  Button,
  Checkbox,
  Field,
  InfoLabel,
  Input,
  Label,
  Radio,
  RadioGroup,
  SimpleTooltip,
  Slider,
  Switch,
  Textarea,
} from "@/components/ui";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function Demo({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-XL rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">{children}</div>;
}

function Verdict({ kind, children }: { kind: "do" | "dont"; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-M rounded-xlarge border border-stroke-2 bg-background-1 p-L">
      <span className={kind === "do" ? "text-caption1 font-semibold text-success-foreground-1" : "text-caption1 font-semibold text-danger-foreground-1"}>
        {kind === "do" ? "✓ Nên" : "✕ Không nên"}
      </span>
      {children}
    </div>
  );
}

const VISIBLE_CODE = `<Field label="Họ và tên" required>
  <Input autoComplete="name" />
</Field>

<Checkbox label="Nhận bản tin hằng tháng" />
<Switch label="Chế độ tiết kiệm pin" />
<Slider label="Độ sáng" showValue defaultValue={[60]} />

{/* Bố cục tự do: Label + htmlFor trỏ tới id của control */}
<Label htmlFor="bio" size="large">Giới thiệu</Label>
<Textarea id="bio" rows={3} />

{/* Nhãn kèm giải thích */}
<InfoLabel htmlFor="vat" info="Mã số thuế 10 hoặc 13 chữ số do cơ quan thuế cấp.">Mã số thuế</InfoLabel>
<Input id="vat" inputMode="numeric" />`;

const ICON_ONLY_CODE = `<div role="toolbar" aria-label="Định dạng văn bản" className="flex gap-XS">
  <SimpleTooltip content="Đậm (Ctrl+B)">
    <Button appearance="subtle" icon={<TextBold20Regular />} aria-label="Đậm" aria-keyshortcuts="Control+B" />
  </SimpleTooltip>
  <SimpleTooltip content="Nghiêng (Ctrl+I)">
    <Button appearance="subtle" icon={<TextItalic20Regular />} aria-label="Nghiêng" aria-keyshortcuts="Control+I" />
  </SimpleTooltip>
  <SimpleTooltip content="Gạch chân (Ctrl+U)">
    <Button appearance="subtle" icon={<TextUnderline20Regular />} aria-label="Gạch chân" aria-keyshortcuts="Control+U" />
  </SimpleTooltip>
</div>

{/* Nhãn đủ ngữ cảnh khi có nhiều nút giống nhau trên trang */}
<Button appearance="subtle" icon={<Delete20Regular />} aria-label="Xoá tệp Báo cáo quý 3.pdf" />`;

const DESCRIBED_CODE = `<Field
  label="Email công việc"
  hint="Dùng để đăng nhập và nhận hoá đơn."
  validationState="error"
  validationMessage="Email cần có @ và tên miền, ví dụ an@congty.vn."
  required
>
  <Input type="email" defaultValue="an.congty.vn" />
</Field>`;

const DOM_CODE = `<!-- HTML mà Field sinh ra -->
<label for=":r5:">Email công việc<span>*</span></label>
<input
  id=":r5:"
  required
  aria-invalid="true"
  aria-describedby=":r5:-message :r5:-hint"
/>
<span id=":r5:-message">Email cần có @ và tên miền, ví dụ an@congty.vn.</span>
<span id=":r5:-hint">Dùng để đăng nhập và nhận hoá đơn.</span>`;

const GROUP_CODE = `{/* RadioGroup: role="radiogroup" lấy tên từ một nhãn nhìn thấy qua aria-labelledby */}
<div className="flex flex-col gap-XS">
  <Label id="shipping-label" weight="semibold">Phương thức giao hàng</Label>
  <RadioGroup aria-labelledby="shipping-label" defaultValue="standard">
    <Radio value="standard" label="Tiêu chuẩn (3–5 ngày)" />
    <Radio value="express" label="Hoả tốc (trong ngày)" />
  </RadioGroup>
</div>

{/* Nhóm Checkbox: fieldset + legend là cách gốc, không cần ARIA */}
<fieldset>
  <legend className="pb-XS text-body1 font-semibold">Nhận thông báo qua</legend>
  <div className="flex flex-col">
    <Checkbox label="Email" defaultChecked />
    <Checkbox label="SMS" />
    <Checkbox label="Ứng dụng di động" />
  </div>
</fieldset>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="visible-label"
        title="Nhãn nhìn thấy: Field và Label"
        description="Nhãn nhìn thấy giúp mọi người — người dùng chuột, bàn phím, trình đọc màn hình, nhập bằng giọng nói — cùng biết control dùng để làm gì."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <div className="flex w-72 flex-col gap-L">
              <Field label="Họ và tên" required>
                <Input autoComplete="name" />
              </Field>
              <Checkbox label="Nhận bản tin hằng tháng" />
              <Switch label="Chế độ tiết kiệm pin" />
              <Slider label="Độ sáng" showValue defaultValue={[60]} />
            </div>
            <div className="flex w-72 flex-col gap-L">
              <div className="flex flex-col gap-XS">
                <Label htmlFor="labelling-bio" size="large">
                  Giới thiệu
                </Label>
                <Textarea id="labelling-bio" rows={3} />
              </div>
              <div className="flex flex-col gap-XS">
                <InfoLabel htmlFor="labelling-vat" info="Mã số thuế 10 hoặc 13 chữ số do cơ quan thuế cấp.">
                  Mã số thuế
                </InfoLabel>
                <Input id="labelling-vat" inputMode="numeric" />
              </div>
            </div>
          </Demo>
          <CodeBlock code={VISIBLE_CODE} />
          <P>
            Checkbox, Switch, Radio, Slider có prop <C>label</C> riêng và tự nối bằng <C>useId</C>. Với Input / Textarea / Select / Dropdown /
            Combobox, bọc trong <C>Field</C> — Field sinh id, gắn <C>htmlFor</C>, <C>aria-describedby</C> và <C>aria-invalid</C>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="icon-only"
        title="Nút chỉ có icon"
        description="Icon không có tên. Mọi nút chỉ có icon phải có aria-label; thêm Tooltip cùng nội dung để người dùng nhìn cũng biết."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <div role="toolbar" aria-label="Định dạng văn bản" className="flex gap-XS">
              <SimpleTooltip content="Đậm (Ctrl+B)">
                <Button appearance="subtle" icon={<TextBold20Regular />} aria-label="Đậm" aria-keyshortcuts="Control+B" />
              </SimpleTooltip>
              <SimpleTooltip content="Nghiêng (Ctrl+I)">
                <Button appearance="subtle" icon={<TextItalic20Regular />} aria-label="Nghiêng" aria-keyshortcuts="Control+I" />
              </SimpleTooltip>
              <SimpleTooltip content="Gạch chân (Ctrl+U)">
                <Button appearance="subtle" icon={<TextUnderline20Regular />} aria-label="Gạch chân" aria-keyshortcuts="Control+U" />
              </SimpleTooltip>
            </div>
            <SimpleTooltip content="Chia sẻ">
              <Button icon={<Share20Regular />} aria-label="Chia sẻ" />
            </SimpleTooltip>
            <SimpleTooltip content="Xoá tệp">
              <Button appearance="subtle" icon={<Delete20Regular />} aria-label="Xoá tệp Báo cáo quý 3.pdf" />
            </SimpleTooltip>
          </Demo>
          <CodeBlock code={ICON_ONLY_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>
              Tooltip <strong className="font-semibold">không</strong> thay nhãn: nó chỉ hiện khi hover / focus và Radix gắn nó làm mô tả
              (<C>aria-describedby</C>). Tên vẫn phải đến từ <C>aria-label</C>.
            </li>
            <li>
              Nhãn nên khớp chữ trong tooltip (WCAG 2.5.3 — nhãn trong tên) để người dùng điều khiển bằng giọng nói gọi đúng tên.
            </li>
            <li>Khi một trang có nhiều nút cùng icon (Xoá trên mỗi hàng), thêm ngữ cảnh vào nhãn: “Xoá tệp Báo cáo quý 3.pdf”.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="described-by"
        title="Mô tả & validation: aria-describedby"
        description="Tên cho biết control là gì; mô tả cho biết thêm điều cần biết. Field nối cả hint lẫn validationMessage vào control."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <div className="w-80">
              <Field
                label="Email công việc"
                hint="Dùng để đăng nhập và nhận hoá đơn."
                validationState="error"
                validationMessage="Email cần có @ và tên miền, ví dụ an@congty.vn."
                required
              >
                <Input type="email" defaultValue="an.congty.vn" />
              </Field>
            </div>
          </Demo>
          <CodeBlock code={DESCRIBED_CODE} />
          <CodeBlock code={DOM_CODE} />
          <P>
            Trình đọc màn hình đọc: “Email công việc, bắt buộc, không hợp lệ, ô nhập — Email cần có @ và tên miền…, Dùng để đăng nhập…”.
            validationMessage không tự đọc khi vừa xuất hiện; khi người dùng gửi form lỗi, hãy chuyển focus về ô lỗi đầu tiên — nhãn và
            mô tả lỗi sẽ được đọc cùng nhau.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="groups"
        title="Nhãn cho nhóm: RadioGroup & nhóm Checkbox"
        description="Mỗi lựa chọn có nhãn riêng, nhưng cả nhóm cũng cần một tên — nếu không, người dùng trình đọc màn hình nghe “Tiêu chuẩn” mà không biết đang chọn gì."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <div className="flex flex-col gap-XS">
              <Label id="labelling-shipping" weight="semibold">
                Phương thức giao hàng
              </Label>
              <RadioGroup aria-labelledby="labelling-shipping" defaultValue="standard">
                <Radio value="standard" label="Tiêu chuẩn (3–5 ngày)" />
                <Radio value="express" label="Hoả tốc (trong ngày)" />
              </RadioGroup>
            </div>
            <fieldset>
              <legend className="pb-XS text-body1 font-semibold text-foreground-1">Nhận thông báo qua</legend>
              <div className="flex flex-col">
                <Checkbox label="Email" defaultChecked />
                <Checkbox label="SMS" />
                <Checkbox label="Ứng dụng di động" />
              </div>
            </fieldset>
          </Demo>
          <CodeBlock code={GROUP_CODE} />
          <P>
            Lưu ý: <C>{"<label for>"}</C> của Field chỉ đặt tên được cho phần tử form thật (input, select, textarea, button). Nếu đặt
            RadioGroup trong Field bằng render-prop, nhóm vẫn cần <C>aria-labelledby</C> trỏ tới một nhãn có id như ví dụ trên.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="placeholder"
        title="Placeholder không phải nhãn"
        description="Placeholder biến mất khi bắt đầu gõ, có tương phản thấp (foreground-4) và không được mọi trình đọc màn hình đọc như tên."
      >
        <div className="flex flex-col gap-L">
          <div className="grid gap-L md:grid-cols-2">
            <Verdict kind="dont">
              <Input placeholder="Số điện thoại" aria-label="Số điện thoại" />
              <p className="text-caption1 text-foreground-3">Gõ một ký tự là mất ngữ cảnh; không biết định dạng mong đợi.</p>
            </Verdict>
            <Verdict kind="do">
              <Field label="Số điện thoại" hint="10 chữ số, bắt đầu bằng 0.">
                <Input type="tel" autoComplete="tel" placeholder="0912 345 678" />
              </Field>
              <p className="text-caption1 text-foreground-3">Nhãn luôn hiện; định dạng nằm trong hint; placeholder chỉ là ví dụ.</p>
            </Verdict>
          </div>
          <DoDont
            dos={[
              "Dùng nhãn nhìn thấy cho mọi control; ngắn, cụ thể, viết hoa chữ đầu.",
              "aria-label cho nút chỉ có icon, kèm Tooltip cùng nội dung.",
              "Đặt tên cho nhóm (RadioGroup, nhóm Checkbox) bằng aria-labelledby hoặc fieldset + legend.",
              "Đưa định dạng, ràng buộc vào hint để được nối qua aria-describedby.",
            ]}
            donts={[
              "Không dùng placeholder thay nhãn.",
              "Không lặp loại control trong nhãn (“Nút Lưu”, “Ô nhập tên”) — trình đọc màn hình đã đọc role.",
              "Không đặt aria-label khác hẳn chữ đang hiển thị.",
              "Không dựa vào Tooltip làm tên duy nhất.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
