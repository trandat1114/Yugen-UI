import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button, Field, Input, Link as TextLink, MessageBar } from "yugen-ui";
import { HookForm, standardSchemaResolver } from "yugen-ui/form";
import { useAdmin } from "../context";
import { Link } from "../router";
import { AuthCard } from "../ui";
import { resetSchema } from "../validation";

type Values = z.input<ReturnType<typeof resetSchema>>;

/** Asks for a reset link. The answer is the same whether the email has an account or not. */
export default function ForgotPasswordPage() {
  const { t, api } = useAdmin();
  const f = t.forgot;
  const schema = React.useMemo(() => resetSchema(t.form.errors), [t]);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const form = useForm<Values, unknown, Values>({ resolver: standardSchemaResolver(schema), mode: "onTouched", defaultValues: { email: "" } });

  const onSubmit = async ({ email }: Values) => {
    await api.requestPasswordReset(email);
    setSentTo(email);
  };

  const back = (
    <TextLink asChild className="self-start text-body1">
      <Link to={{ name: "signIn" }}>{f.back}</Link>
    </TextLink>
  );

  return (
    <AuthCard title={f.title} lead={f.lead}>
      {sentTo ? (
        <>
          <MessageBar intent="success" layout="multiline" title={f.sentTitle}>
            {f.sentBody(sentTo)}
          </MessageBar>
          {back}
        </>
      ) : (
        <HookForm form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label={t.form.email} required>
            <Input type="email" autoComplete="email" {...form.register("email")} />
          </Field>
          <Button type="submit" appearance="primary">
            {f.submit}
          </Button>
          {back}
        </HookForm>
      )}
    </AuthCard>
  );
}
