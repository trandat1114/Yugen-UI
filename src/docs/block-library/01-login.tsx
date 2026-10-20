import { Key20Regular, Mail20Regular, Person20Regular } from "@fluentui/react-icons";
import { Button, Card, Checkbox, Input } from "@/components/ui";

export const meta = { title: "Đăng nhập", description: "Form đăng nhập với email, mật khẩu và SSO", order: 1 };

export default function LoginBlock() {
  return (
    <Card size="large" className="mx-auto w-full max-w-sm gap-L rounded-xlarge p-XXL">
      <div>
        <h3 className="font-display text-title3 font-semibold">Chào mừng trở lại</h3>
        <p className="mt-XS text-body1 text-foreground-3">Đăng nhập để tiếp tục làm việc với nhóm của bạn.</p>
      </div>

      <form className="flex flex-col gap-M" onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" autoComplete="email" placeholder="ten@congty.vn" contentBefore={<Mail20Regular />} required />
        <Input
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          contentBefore={<Key20Regular />}
          required
        />
        <div className="flex items-center justify-between">
          <Checkbox label="Ghi nhớ tôi" defaultChecked />
          <a href="#" className="text-body1 text-link hover:text-link-hover hover:underline">
            Quên mật khẩu?
          </a>
        </div>
        <Button appearance="primary" type="submit" className="w-full">
          Đăng nhập
        </Button>
      </form>

      <div className="flex items-center gap-M text-caption1 text-foreground-3">
        <span className="h-px flex-1 bg-stroke-2" />
        hoặc
        <span className="h-px flex-1 bg-stroke-2" />
      </div>
      <Button icon={<Person20Regular />} className="w-full">
        Đăng nhập bằng tài khoản công ty
      </Button>
      <p className="text-center text-body1 text-foreground-3">
        Chưa có tài khoản?{" "}
        <a href="#" className="font-semibold text-link hover:underline">
          Đăng ký
        </a>
      </p>
    </Card>
  );
}
