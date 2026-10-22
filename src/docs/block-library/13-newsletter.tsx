import { useState } from "react";
import { Mail20Regular } from "@fluentui/react-icons";
import { Button, Card, CardHeader, Field, Input, Switch, toast } from "@/components/ui";

export const meta = { title: "Đăng ký bản tin", description: "Field gắn nhãn và gợi ý cho ô email, Switch và toast xác nhận", order: 13 };

export default function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [monthly, setMonthly] = useState(true);

  return (
    <Card className="max-w-md gap-L rounded-xlarge p-XL">
      <CardHeader
        image={<Mail20Regular className="text-brand-foreground-1" />}
        header="Bản tin Yugen"
        description="Mỗi tháng một email: component mới và mẹo dùng."
      />
      <form
        className="flex flex-col gap-M"
        onSubmit={(e) => {
          e.preventDefault();
          toast({ intent: "success", title: "Đã đăng ký", body: monthly ? `Bản tin sẽ gửi tới ${email}.` : "Bạn sẽ chỉ nhận thông báo quan trọng." });
        }}
      >
        <Field label="Email" hint="Chúng tôi không chia sẻ email của bạn." required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@vidu.vn" />
        </Field>
        <Switch checked={monthly} onCheckedChange={setMonthly} label="Nhận bản tin hằng tháng" />
        <Button appearance="primary" type="submit" className="self-start">
          Đăng ký
        </Button>
      </form>
    </Card>
  );
}
