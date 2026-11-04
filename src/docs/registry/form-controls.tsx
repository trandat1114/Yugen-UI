import { useState } from "react";
import {
  Button,
  ColorPicker,
  DateTimePicker,
  Field,
  FormattedInput,
  MonthPicker,
  PasswordInput,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  YearPicker,
  type PasswordStrength,
} from "@/components/ui";
import type { ComponentDoc } from "../types";
import { declarationsOf } from "../setup";
import RAW from "./form-controls.tsx?raw";

/* `code` của ví dụ được cắt từ chính file này (giữa `// #region <tên>` và `// #endregion`). */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");
function source(...names: string[]) {
  return names
    .map((name) => {
      const start = LINES.findIndex((line) => line.trim() === `// #region ${name}`);
      const end = LINES.findIndex((line, i) => i > start && line.trim() === "// #endregion");
      return start < 0 || end < 0 ? `// Không tìm thấy "${name}"` : LINES.slice(start + 1, end).join("\n").trim();
    })
    .join("\n\n");
}

/* ======================================================================== PasswordInput */

// #region PasswordHero
function PasswordHero() {
  return (
    <Field label="Password" required className="w-72">
      <PasswordInput autoComplete="current-password" />
    </Field>
  );
}
// #endregion

// #region PasswordStrengthDemo
function PasswordStrengthDemo() {
  const [password, setPassword] = useState("");
  return (
    <Field label="New password" hint="12 characters or more, with numbers and symbols" className="w-80">
      <PasswordInput autoComplete="new-password" strength value={password} onChange={(e) => setPassword(e.target.value)} />
    </Field>
  );
}
// #endregion

// #region PasswordRulesDemo
// Your own scoring: one point per rule met, 0 when empty.
function scorePassword(password: string): PasswordStrength {
  if (!password) return 0;
  const rules = [password.length >= 10, /[A-Z]/.test(password), /\d/.test(password), !/password|123456|qwerty/i.test(password)];
  return Math.max(1, rules.filter(Boolean).length) as PasswordStrength;
}

function PasswordRulesDemo() {
  return (
    <Field label="Admin password" className="w-80">
      <PasswordInput autoComplete="new-password" strength={scorePassword} capsLockWarning={false} />
    </Field>
  );
}
// #endregion

// #region PasswordSizes
function PasswordSizes() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <PasswordInput size="small" aria-label="Password (small)" defaultValue="sakura-2026" />
      <PasswordInput appearance="filled-darker" aria-label="Password (filled darker)" defaultValue="sakura-2026" defaultVisible />
      <PasswordInput size="large" aria-label="Password (large)" />
      <PasswordInput disabled aria-label="Password (disabled)" defaultValue="sakura-2026" />
    </div>
  );
}
// #endregion

/* ======================================================================== FormattedInput */

// #region PhoneHero
function PhoneHero() {
  const [phone, setPhone] = useState("");
  return (
    <div className="flex w-72 flex-col gap-2">
      <Field label="Phone number">
        <FormattedInput format="phone" value={phone} onValueChange={setPhone} />
      </Field>
      <span className="text-caption1 text-foreground-3">Raw value: {phone || "—"}</span>
    </div>
  );
}
// #endregion

// #region CurrencyDemo
function CurrencyDemo() {
  const [amount, setAmount] = useState("1250");
  return (
    <div className="flex w-72 flex-col gap-3">
      <Field label="Amount" hint="Pads the decimals when you leave the field">
        <FormattedInput format="currency" currency="USD" value={amount} onValueChange={setAmount} />
      </Field>
      <Field label="Amount in yen">
        <FormattedInput format="currency" currency="JPY" defaultValue="98000" />
      </Field>
      <span className="text-caption1 text-foreground-3">Raw value: {amount || "—"}</span>
    </div>
  );
}
// #endregion

// #region CardDemo
function CardDemo() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Field label="Card number" hint="American Express groups as 4-6-5">
        <FormattedInput format="card" placeholder="1234 1234 1234 1234" />
      </Field>
      <Field label="Card number (Amex)">
        <FormattedInput format="card" defaultValue="378282246310005" />
      </Field>
    </div>
  );
}
// #endregion

// #region MaskDemo
function MaskDemo() {
  return (
    <Field label="Mobile number" className="w-72">
      <FormattedInput format="phone" mask="### ### ####" contentBefore={<span className="text-foreground-2">+44</span>} />
    </Field>
  );
}
// #endregion

// #region FormDemo
function FormDemo() {
  const [sent, setSent] = useState("");
  return (
    <form
      className="flex w-72 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
      }}
    >
      <Field label="Phone">
        <FormattedInput format="phone" name="phone" defaultValue="2025550143" />
      </Field>
      <Field label="Deposit">
        <FormattedInput format="currency" currency="EUR" name="deposit" defaultValue="300" />
      </Field>
      <Button type="submit" appearance="primary" className="self-start">
        Submit
      </Button>
      {sent && <code className="text-caption1 text-foreground-3">{sent}</code>}
    </form>
  );
}
// #endregion

/* ======================================================================== MonthPicker / YearPicker */

// #region MonthHero
function MonthHero() {
  const [expiry, setExpiry] = useState<Date | null>(null);
  const now = new Date();
  return (
    <Field label="Card expiry" className="w-72">
      <MonthPicker
        value={expiry}
        onValueChange={setExpiry}
        minDate={new Date(now.getFullYear(), now.getMonth(), 1)}
        maxDate={new Date(now.getFullYear() + 10, 11, 1)}
      />
    </Field>
  );
}
// #endregion

// #region YearDemo
function YearDemo() {
  const [year, setYear] = useState<Date | null>(new Date(2020, 0, 1));
  return (
    <div className="flex w-72 flex-col gap-2">
      <Field label="Graduation year">
        <YearPicker value={year} onValueChange={setYear} maxDate={new Date()} clearable />
      </Field>
      <span className="text-caption1 text-foreground-3">{year ? `Year ${year.getFullYear()}` : "No year selected"}</span>
    </div>
  );
}
// #endregion

// #region MonthReport
function MonthReport() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Field label="Report month">
        <MonthPicker defaultValue={new Date(2026, 9, 1)} clearable />
      </Field>
      <MonthPicker size="small" aria-label="Month (small)" />
      <MonthPicker disabled aria-label="Month (disabled)" defaultValue={new Date(2026, 0, 1)} />
    </div>
  );
}
// #endregion

/* ======================================================================== DateTimePicker */

// #region DateTimeHero
function DateTimeHero() {
  const [start, setStart] = useState<Date | null>(null);
  return (
    <div className="flex w-80 flex-col gap-2">
      <Field label="Meeting starts">
        <DateTimePicker value={start} onValueChange={setStart} minDate={new Date()} timeIncrement={15} clearable />
      </Field>
      <span className="text-caption1 text-foreground-3">{start ? start.toISOString() : "Not scheduled"}</span>
    </div>
  );
}
// #endregion

// #region DateTimeCycle
function DateTimeCycle() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <Field label="Departure (24-hour)">
        <DateTimePicker hourCycle="h23" defaultValue={new Date(2026, 10, 20, 18, 45)} />
      </Field>
      <Field label="Check-in (12-hour)">
        <DateTimePicker hourCycle="h12" defaultValue={new Date(2026, 10, 20, 14, 0)} />
      </Field>
    </div>
  );
}
// #endregion

/* ======================================================================== ColorPicker */

// #region ColorHero
const BRAND_SWATCHES = ["#0f6cbd", "#c2347a", "#107c10", "#c50f1f", "#8764b8", "#ca5010", "#038387", "#605e5c"];

function ColorHero() {
  const [color, setColor] = useState("#c2347a");
  return (
    <div className="flex flex-col gap-2">
      <ColorPicker value={color} onValueChange={setColor} swatches={BRAND_SWATCHES} aria-label="Accent color" />
      <span className="text-caption1 text-foreground-3">Selected {color}</span>
    </div>
  );
}
// #endregion

// #region ColorAlpha
function ColorAlpha() {
  const [color, setColor] = useState("#0f6cbd99");
  return (
    <div className="flex flex-col gap-2">
      <ColorPicker alpha defaultFormat="rgb" value={color} onValueChange={setColor} aria-label="Overlay color" />
      <span className="text-caption1 text-foreground-3">Selected {color}</span>
    </div>
  );
}
// #endregion

// #region ColorPopover
function ColorPopover() {
  const [color, setColor] = useState("#107c10");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button aria-label={`Label color ${color}`} className="gap-2">
          <span className="size-4 rounded-small ring-1 ring-stroke-accessible" style={{ backgroundColor: color }} />
          <span className="font-mono">{color}</span>
        </Button>
      </PopoverTrigger>
      <PopoverSurface align="start">
        <ColorPicker value={color} onValueChange={setColor} swatches={BRAND_SWATCHES} aria-label="Label color" />
      </PopoverSurface>
    </Popover>
  );
}
// #endregion

export const docs: ComponentDoc[] = [
  /* ===== PasswordInput ===== */
  {
    slug: "passwordinput",
    name: "PasswordInput",
    category: "Nhập liệu",
    lead: "PasswordInput là ô nhập mật khẩu có nút hiện / ẩn, nhắc Caps Lock và thước đo độ mạnh tuỳ chọn.",
    description:
      "Input với `type=\"password\"` và nút hiện / ẩn (nút bật tắt, `aria-pressed`; bấm chuột không làm mất focus khỏi ô nhập). Khi Caps Lock bật lúc gõ, một dòng nhắc hiện dưới ô và được đọc qua vùng live. `strength` thêm thước đo bốn nấc (Yếu, Trung bình, Khá, Mạnh) có chữ đi kèm, không chỉ dựa vào màu; `getPasswordStrength` chấm theo độ dài và số loại ký tự, hoặc truyền hàm chấm điểm riêng. Nhận mọi prop của Input và dùng được trong `<Field>`; chuỗi có sẵn đổi qua `messages.passwordInput`.",
    importCode: `import { PasswordInput, getPasswordStrength, type PasswordStrength } from "@/components/ui";`,
    hero: { title: "Đăng nhập", code: source("PasswordHero"), render: () => <PasswordHero /> },
    examples: [
      {
        title: "Thước đo độ mạnh",
        description: "strength dùng getPasswordStrength; mức độ được đọc khi đổi nấc.",
        code: source("PasswordStrengthDemo"),
        render: () => <PasswordStrengthDemo />,
      },
      {
        title: "Hàm chấm điểm riêng",
        description: "Trả về 0–4 theo quy tắc của bạn; capsLockWarning={false} tắt dòng nhắc Caps Lock.",
        code: source("PasswordRulesDemo"),
        render: () => <PasswordRulesDemo />,
      },
      {
        title: "Kích thước, appearance & disabled",
        description: "Như Input; defaultVisible hiện mật khẩu ngay từ đầu.",
        code: source("PasswordSizes"),
        render: () => <PasswordSizes />,
      },
    ],
    dos: [
      "Đặt `autoComplete` đúng: \"current-password\" khi đăng nhập, \"new-password\" khi tạo mật khẩu, để trình quản lý mật khẩu điền và gợi ý được.",
      "Ghi yêu cầu mật khẩu trong `hint` của Field, trước khi người dùng gõ.",
      "Kiểm tra độ mạnh thật ở server; thước đo chỉ là gợi ý nhanh.",
    ],
    donts: [
      "Không chặn dán vào ô mật khẩu — người dùng trình quản lý mật khẩu cần dán.",
      "Không chỉ dựa vào màu của thước đo; giữ chữ mô tả mức độ.",
    ],
    props: [
      { name: "visible / defaultVisible", type: "boolean", defaultValue: "false", description: "Đang hiện mật khẩu dạng chữ (controlled / uncontrolled)." },
      { name: "onVisibleChange", type: "(visible: boolean) => void", description: "Gọi khi bấm nút hiện / ẩn." },
      { name: "capsLockWarning", type: "boolean", defaultValue: "true", description: "Nhắc khi Caps Lock bật lúc gõ." },
      { name: "strength", type: "boolean | (password: string) => PasswordStrength", description: "Thước đo độ mạnh: true dùng getPasswordStrength, hoặc hàm trả 0–4." },
      { name: "getPasswordStrength", type: "(password: string) => PasswordStrength", description: "0 trống · 1 yếu · 2 trung bình · 3 khá · 4 mạnh, theo độ dài và số loại ký tự." },
      { name: "value / defaultValue / onChange", type: "—", description: "Như Input." },
      { name: "label / hint / validationState / validationMessage", type: "—", description: "Như Input; hoặc bọc trong <Field>." },
      { name: "size / appearance / contentBefore / contentAfter", type: "—", description: "Như Input; contentAfter nằm sau nút hiện / ẩn." },
      { name: "rootClassName", type: "string", description: "Class cho khung ngoài (ô nhập, thước đo, dòng nhắc)." },
      { name: "ref", type: "Ref<HTMLInputElement>", description: "Trỏ tới thẻ <input>." },
    ],
  },

  /* ===== FormattedInput ===== */
  {
    slug: "formattedinput",
    name: "FormattedInput",
    category: "Nhập liệu",
    lead: "FormattedInput định dạng số điện thoại, số thẻ và số tiền ngay khi gõ, vẫn giữ vị trí con trỏ.",
    description:
      "`format=\"phone\"` chèn khoảng trắng, ngoặc, gạch nối theo mask (`#` là một chữ số; mặc định theo vùng của `locale`: en-US \"(###) ###-####\", vi-VN \"#### ### ###\"). `format=\"card\"` nhóm 4-4-4-4, American Express 4-6-5. `format=\"currency\"` định dạng bằng Intl theo `locale` và `currency`, giới hạn số chữ số thập phân của đồng tiền và thêm đủ khi rời ô. Gõ, dán hay xoá giữa chừng đều giữ con trỏ đúng chỗ; Backspace ngay sau dấu phân cách xoá chữ số trước nó. `value` / `onValueChange` là giá trị thô (chữ số, hoặc số thập phân \"1234.5\"); có `name` thì form gửi giá trị thô qua một input ẩn. Nhận mọi prop của Input.",
    importCode: `import { FormattedInput, getPhoneMask, getCardMask, applyMask } from "@/components/ui";`,
    hero: { title: "Số điện thoại", code: source("PhoneHero"), render: () => <PhoneHero /> },
    examples: [
      {
        title: "Số tiền",
        description: "Theo locale của YugenProvider; JPY không có phần thập phân.",
        code: source("CurrencyDemo"),
        render: () => <CurrencyDemo />,
      },
      {
        title: "Số thẻ",
        description: "inputMode numeric và autoComplete \"cc-number\" có sẵn.",
        code: source("CardDemo"),
        render: () => <CardDemo />,
      },
      {
        title: "Mask riêng & mã quốc gia",
        description: "Mã quốc gia đặt ở contentBefore, không nằm trong giá trị.",
        code: source("MaskDemo"),
        render: () => <MaskDemo />,
      },
      {
        title: "Gửi form",
        description: "Với name, FormData chứa giá trị thô, không phải chữ đã định dạng.",
        code: source("FormDemo"),
        render: () => <FormDemo />,
      },
    ],
    dos: [
      "Lưu và gửi giá trị thô; định dạng chỉ để đọc dễ hơn.",
      "Đặt mã quốc gia ở `contentBefore` và một mask cố định khi form chỉ nhận số của một nước.",
      "Kiểm tra độ dài / tính hợp lệ (vd. Luhn cho số thẻ) khi gửi form và hiển thị lỗi qua `<Field>`.",
    ],
    donts: [
      "Không dùng FormattedInput cho số đếm có tăng giảm — dùng SpinButton.",
      "Không đặt chữ số trong phần cố định của mask; ký tự cố định chỉ là dấu phân cách.",
    ],
    props: [
      { name: "format", type: `"phone" | "card" | "currency"`, description: "Kiểu định dạng." },
      { name: "value / defaultValue", type: "string", description: "Giá trị thô: chữ số (phone, card) hoặc số thập phân \"1234.5\" (currency)." },
      { name: "onValueChange", type: "(value: string, details: { formatted: string }) => void", description: "Gọi khi giá trị thô đổi; details.formatted là chữ đang hiển thị." },
      { name: "mask", type: "string", description: "Mask cho phone / card: # là một chữ số. Mặc định theo locale (phone) / loại thẻ (card)." },
      { name: "currency", type: "string", defaultValue: `"USD"`, description: "Mã tiền tệ ISO 4217 cho currency." },
      { name: "locale", type: "string", defaultValue: "locale của YugenProvider", description: "Locale cho currency và mask phone mặc định." },
      { name: "name", type: "string", description: "Tên trường trong form; form gửi giá trị thô qua input ẩn." },
      { name: "label / hint / validationState / validationMessage / size / appearance / contentBefore / contentAfter / rootClassName", type: "—", description: "Như Input." },
      { name: "ref", type: "Ref<HTMLInputElement>", description: "Trỏ tới ô nhập hiển thị." },
      { name: "getPhoneMask(locale) / getCardMask(digits) / applyMask(raw, mask)", type: "helper", description: "Mask mặc định và hàm điền mask, dùng được ngoài component." },
    ],
  },

  /* ===== MonthPicker / YearPicker ===== */
  {
    slug: "monthpicker",
    name: "MonthPicker · YearPicker",
    category: "Nhập liệu",
    lead: "MonthPicker và YearPicker chọn một tháng hoặc một năm, cùng vỏ và bàn phím với DatePicker.",
    description:
      "Popover hiện lưới 12 tháng của một năm (MonthPicker) hoặc 12 năm (YearPicker). Bàn phím như lịch ngày: mũi tên di chuyển, Home / End về đầu / cuối hàng, PageUp / PageDown sang năm (hoặc 12 năm) trước / sau, Enter chọn; mở popover thì focus ô đang chọn. Giá trị là `Date`: ngày 1 của tháng, hoặc 1/1 của năm. minDate / maxDate làm mờ ô ngoài khoảng. Hiển thị theo `locale` của YugenProvider (\"November 2026\", \"tháng 11 năm 2026\"); đổi bằng `formatDate`.",
    importCode: `import { MonthPicker, YearPicker } from "@/components/ui";`,
    hero: { title: "Hạn thẻ", code: source("MonthHero"), render: () => <MonthHero /> },
    examples: [
      {
        title: "YearPicker",
        description: "maxDate là năm nay; clearable thêm nút xoá.",
        code: source("YearDemo"),
        render: () => <YearDemo />,
      },
      {
        title: "Tháng báo cáo, kích thước & disabled",
        description: "Cùng size và trạng thái với DatePicker.",
        code: source("MonthReport"),
        render: () => <MonthReport />,
      },
    ],
    dos: [
      "Dùng MonthPicker khi ngày không quan trọng (hạn thẻ, kỳ báo cáo, tháng lương).",
      "Đặt minDate / maxDate thay vì kiểm tra sau khi chọn.",
    ],
    donts: [
      "Không dùng YearPicker cho năm sinh trải rộng nhiều thập kỷ nếu người dùng gõ nhanh hơn — một ô số có thể hợp hơn.",
      "Không đọc ngày (getDate) của giá trị — luôn là ngày 1.",
    ],
    props: [
      { name: "value / defaultValue", type: "Date | null", description: "Tháng (ngày 1) hoặc năm (1/1) đã chọn." },
      { name: "onValueChange", type: "(date: Date | null) => void", description: "Gọi khi chọn hoặc xoá; null khi xoá." },
      { name: "minDate / maxDate", type: "Date", description: "Tháng / năm sớm và muộn nhất được chọn." },
      { name: "formatDate", type: "(date: Date) => string", description: "Định dạng hiển thị; mặc định tháng + năm (MonthPicker), năm (YearPicker) theo locale." },
      { name: "placeholder", type: "string", defaultValue: `"Select a month…" / "Select a year…"`, description: "Chữ khi chưa chọn." },
      { name: "clearable", type: "boolean", defaultValue: "false", description: "Hiện nút xoá khi có giá trị." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." },
      { name: "disabled / required / id / aria-*", type: "—", description: "Field tự truyền khi bọc trong <Field>." },
    ],
  },

  /* ===== DateTimePicker ===== */
  {
    slug: "datetimepicker",
    name: "DateTimePicker",
    category: "Nhập liệu",
    lead: "DateTimePicker chọn ngày và giờ trong cùng một popover: lịch ở trên, ô giờ ở dưới.",
    description:
      "Lịch là Calendar của DatePicker, ô giờ là TimePicker (gõ tự do \"9\", \"930\", \"9:30 PM\" hoặc chọn trong danh sách cách nhau `timeIncrement` phút). Chọn ngày giữ giờ đã chọn (mặc định 00:00); giờ chọn trước khi có ngày được dùng khi chọn ngày. Nút Xong đóng popover; giá trị đã cập nhật ngay khi chọn. Hiển thị ngày dạng số và giờ theo `locale` (chu kỳ 12 / 24 giờ theo locale hoặc `hourCycle`). minDate / maxDate giới hạn phần ngày.",
    importCode: `import { DateTimePicker } from "@/components/ui";`,
    hero: { title: "Lịch họp", code: source("DateTimeHero"), render: () => <DateTimeHero /> },
    examples: [
      {
        title: "Chu kỳ 24 / 12 giờ",
        description: "hourCycle ghi đè chu kỳ theo locale.",
        code: source("DateTimeCycle"),
        render: () => <DateTimeCycle />,
      },
    ],
    dos: [
      "Dùng khi thời điểm cụ thể quan trọng (lịch hẹn, hạn chót có giờ).",
      "Cho biết múi giờ ở hint khi người dùng ở nhiều nơi.",
    ],
    donts: [
      "Không dùng DateTimePicker khi chỉ cần ngày — dùng DatePicker.",
      "Không ép bước giờ quá nhỏ (1 phút) — danh sách quá dài; giờ lẻ vẫn gõ được.",
    ],
    props: [
      { name: "value / defaultValue", type: "Date | null", description: "Ngày giờ đã chọn." },
      { name: "onValueChange", type: "(date: Date | null) => void", description: "Gọi khi đổi ngày hoặc giờ, hoặc xoá." },
      { name: "timeIncrement", type: "number", defaultValue: "30", description: "Bước giữa các giờ trong danh sách (phút)." },
      { name: "hourCycle", type: `"h23" | "h12"`, defaultValue: "theo locale", description: "24 giờ hoặc 12 giờ." },
      { name: "minDate / maxDate", type: "Date", description: "Ngày sớm / muộn nhất (chỉ phần ngày)." },
      { name: "formatDate", type: "(date: Date) => string", description: "Định dạng hiển thị; mặc định ngày dạng số + giờ theo locale." },
      { name: "placeholder", type: "string", defaultValue: `"Select date and time…"`, description: "Chữ khi chưa chọn." },
      { name: "clearable", type: "boolean", defaultValue: "false", description: "Hiện nút xoá khi có giá trị." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." },
      { name: "disabled / required / id / aria-*", type: "—", description: "Field tự truyền khi bọc trong <Field>." },
    ],
  },

  /* ===== ColorPicker ===== */
  {
    slug: "colorpicker",
    name: "ColorPicker",
    category: "Nhập liệu",
    lead: "ColorPicker chọn màu tuỳ ý: vùng độ bão hoà / độ sáng, thanh sắc độ và độ đục, ô nhập HEX / RGB / HSL.",
    description:
      "Kéo hoặc dùng mũi tên trên vùng màu (trái / phải: độ bão hoà, lên / xuống: độ sáng, Shift ×10); thanh sắc độ và độ đục là slider có đủ bàn phím. Ô nhập đổi giữa HEX, RGB và HSL; gõ là áp dụng khi giá trị hợp lệ, mũi tên lên / xuống tăng giảm từng kênh. Nút lấy màu trên màn hình chỉ hiện khi trình duyệt có EyeDropper API (Chrome, Edge). `swatches` hiện màu có sẵn bằng SwatchPicker, ô trùng màu đang chọn được đánh dấu. Giá trị là hex (\"#rrggbb\", \"#rrggbbaa\" khi `alpha` và độ đục dưới 100%); `onValueChange` kèm rgb / hsl / hsv. Dải màu luôn chạy trái → phải, kể cả RTL. Đặt trong Popover để làm ô chọn màu.",
    importCode: `import { ColorPicker, parseColor, type ColorPickerChangeData } from "@/components/ui";`,
    hero: { title: "Màu nhấn", code: source("ColorHero"), render: () => <ColorHero /> },
    examples: [
      {
        title: "Độ đục (alpha)",
        description: "Thêm thanh và ô độ đục; giá trị thành hex 8 chữ số.",
        code: source("ColorAlpha"),
        render: () => <ColorAlpha />,
      },
      {
        title: "Trong Popover",
        description: "Nút hiện màu đang chọn mở ColorPicker.",
        setup: declarationsOf(RAW, ["BRAND_SWATCHES"]),
        code: source("ColorPopover"),
        render: () => <ColorPopover />,
      },
    ],
    dos: [
      "Thêm `swatches` với màu thương hiệu để người dùng chọn nhanh và nhất quán.",
      "Hiện mã màu cạnh nút mở picker, không chỉ ô màu.",
      "Kiểm tra độ tương phản khi màu người dùng chọn dùng cho chữ.",
    ],
    donts: [
      "Không dùng ColorPicker khi chỉ có vài màu cố định — dùng SwatchPicker.",
      "Không bật `alpha` khi nơi dùng màu không hỗ trợ trong suốt.",
    ],
    props: [
      { name: "value / defaultValue", type: "string", description: "Màu đã chọn: hex, rgb() hoặc hsl(). defaultValue mặc định là đen." },
      { name: "onValueChange", type: "(value: string, data: ColorPickerChangeData) => void", description: "value là hex; data có hex, rgb, hsl, hsv." },
      { name: "alpha", type: "boolean", defaultValue: "false", description: "Hiện thanh và ô độ đục." },
      { name: "swatches", type: "(string | { color: string; label?: string })[]", description: "Màu có sẵn, hiện bằng SwatchPicker." },
      { name: "defaultFormat", type: `"hex" | "rgb" | "hsl"`, defaultValue: `"hex"`, description: "Định dạng các ô nhập lúc đầu." },
      { name: "eyeDropper", type: "boolean", defaultValue: "true", description: "Nút lấy màu trên màn hình, khi trình duyệt hỗ trợ." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Khoá cả bộ chọn." },
      { name: "ref", type: "Ref<HTMLDivElement>", description: "Trỏ tới khung ngoài." },
      { name: "parseColor(input)", type: "(input: string) => RgbaColor | null", description: "Đọc hex, rgb(), hsl() thành { r, g, b, a }." },
    ],
  },
];
