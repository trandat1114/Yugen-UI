import { Key20Regular, Mail20Regular, Person20Regular } from "@fluentui/react-icons";
import { Button, Card, Checkbox, Input } from "@/components/ui";

export const meta = { title: "Sign in", description: "Sign-in form with email, password and SSO", order: 1 };

export default function LoginBlock() {
  return (
    <Card size="large" className="mx-auto w-full max-w-sm gap-4 rounded-xlarge p-6">
      <div>
        <h3 className="font-display text-title3 font-semibold">Welcome back</h3>
        <p className="mt-1 text-body1 text-foreground-3">Sign in to keep working with your team.</p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" autoComplete="email" placeholder="name@company.com" contentBefore={<Mail20Regular />} required />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          contentBefore={<Key20Regular />}
          required
        />
        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" defaultChecked />
          <a href="#" className="text-body1 text-link hover:text-link-hover hover:underline">
            Forgot password?
          </a>
        </div>
        <Button appearance="primary" type="submit" className="w-full">
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-3 text-caption1 text-foreground-3">
        <span className="h-px flex-1 bg-stroke-2" />
        or
        <span className="h-px flex-1 bg-stroke-2" />
      </div>
      <Button icon={<Person20Regular />} className="w-full">
        Sign in with your work account
      </Button>
      <p className="text-center text-body1 text-foreground-3">
        Don&apos;t have an account?{" "}
        <a href="#" className="font-semibold text-link hover:underline">
          Sign up
        </a>
      </p>
    </Card>
  );
}
