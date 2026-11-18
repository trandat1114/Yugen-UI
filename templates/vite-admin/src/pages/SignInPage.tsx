import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button, Field, Input, Link as TextLink, MessageBar } from "yugen-ui";
import { HookForm, standardSchemaResolver } from "yugen-ui/form";
import { DEMO_ACCOUNT } from "../api";
import { useAuth } from "../auth";
import { useAdmin } from "../context";
import { Link, useRouter } from "../router";
import { AuthCard } from "../ui";
import { signInSchema } from "../validation";

type Values = z.input<ReturnType<typeof signInSchema>>;

/** Step 1 of signing in: email and password, then the code page. `next`: the page to return to. */
export default function SignInPage({ next }: { next?: string }) {
  const { t } = useAdmin();
  const { session, signIn } = useAuth();
  const { navigate } = useRouter();
  const s = t.signIn;
  const schema = React.useMemo(() => signInSchema(t.form.errors), [t]);
  const [failed, setFailed] = React.useState(false);
  const form = useForm<Values, unknown, Values>({
    resolver: standardSchemaResolver(schema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });
  const { register, setValue } = form;

  const onSubmit = async (values: Values) => {
    setFailed(false);
    try {
      await signIn(values.email, values.password);
      navigate({ name: "verify", next });
    } catch {
      setFailed(true);
    }
  };

  const fillDemo = () => {
    setValue("email", DEMO_ACCOUNT.email, { shouldValidate: true });
    setValue("password", DEMO_ACCOUNT.password, { shouldValidate: true });
  };

  return (
    <AuthCard title={s.title} lead={next ? s.leadNext : s.lead}>
      {session && (
        <MessageBar
          title={s.signedInAs(session.name)}
          actions={
            <TextLink asChild>
              <Link to={{ name: "customers" }}>{s.open}</Link>
            </TextLink>
          }
        />
      )}
      {/* Demo credentials, in plain sight. Remove this block when you connect real auth. */}
      <MessageBar
        layout="multiline"
        title={s.demoTitle}
        actions={
          <Button size="small" onClick={fillDemo}>
            {s.useDemo}
          </Button>
        }
      >
        {s.demoEmail} <strong className="font-mono font-semibold whitespace-nowrap">{DEMO_ACCOUNT.email}</strong> · {s.demoPassword}{" "}
        <strong className="font-mono font-semibold whitespace-nowrap">{DEMO_ACCOUNT.password}</strong>
      </MessageBar>

      <HookForm form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
        {failed && <MessageBar intent="error">{s.wrong}</MessageBar>}
        <Field label={t.form.email} required>
          <Input type="email" autoComplete="username" {...register("email")} />
        </Field>
        <Field label={s.password} required>
          <Input type="password" autoComplete="current-password" {...register("password")} />
        </Field>
        <TextLink asChild className="self-start text-body1">
          <Link to={{ name: "forgotPassword" }}>{s.forgot}</Link>
        </TextLink>
        <Button type="submit" appearance="primary">
          {s.submit}
        </Button>
      </HookForm>
    </AuthCard>
  );
}
