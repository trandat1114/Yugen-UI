import { Button, Card, Divider, Field, Select, Switch, toast } from "@/components/ui";

export const meta = { title: "Tuỳ chọn", description: "Cài đặt tài khoản với Select, Switch và Toast", order: 5 };

const SETTINGS = [
  { id: "public", label: "Thống kê công khai", hint: "Cho phép người khác xem tổng số lượt nghe của bạn.", on: true },
  { id: "email", label: "Thông báo qua email", hint: "Báo cáo hằng tháng và cập nhật thanh toán.", on: true },
  { id: "beta", label: "Tính năng thử nghiệm", hint: "Dùng sớm các tính năng đang phát triển.", on: false },
];

export default function PreferencesBlock() {
  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">Tuỳ chọn</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">Quản lý cài đặt tài khoản và thông báo.</p>
      </div>

      <Field label="Tiền tệ mặc định" hint="Áp dụng cho báo cáo và hoá đơn mới.">
        <Select defaultValue="vnd">
          <option value="vnd">VND — Đồng Việt Nam</option>
          <option value="usd">USD — Đô la Mỹ</option>
          <option value="jpy">JPY — Yên Nhật</option>
        </Select>
      </Field>

      <Divider />

      <ul className="flex flex-col gap-3">
        {SETTINGS.map((s) => (
          <li key={s.id} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-body1 font-semibold">{s.label}</p>
              <p className="text-caption1 text-foreground-3">{s.hint}</p>
            </div>
            <Switch aria-label={s.label} defaultChecked={s.on} />
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <Button
          appearance="primary"
          onClick={() => toast({ intent: "success", title: "Đã lưu tuỳ chọn", body: "Thay đổi có hiệu lực ngay." })}
        >
          Lưu thay đổi
        </Button>
      </div>
    </Card>
  );
}
