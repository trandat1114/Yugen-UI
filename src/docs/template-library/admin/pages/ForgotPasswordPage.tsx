import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button, Field, Input, Link as TextLink, MessageBar } from "@/components/ui";
import { useAdmin } from "../context";
import { Link } from "../router";
import { AuthCard } from "../ui";
import { resetSchema, zodResolver } from "../validation";

type Values = z.input<ReturnType<typeof resetSchema>>;

/** Asks for a reset link. The answer is the same whether the email has an account or not. */
export default function ForgotPasswordPage() {
  const { t, api } = useAdmin();
  const f = t.forgot;
  const schema = React.useMemo(() => resetSchema(t.form.errors), [t]);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "" } });

  const onSubmit = handleSubmit(async ({ email }) => {
    await api.requestPasswordReset(email);
    setSentTo(email);
  });

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
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label={t.form.email} required validationState={errors.email ? "error" : "none"} validationMessage={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </Field>
          <Button type="submit" appearance="primary" loading={isSubmitting}>
            {f.submit}
          </Button>
          {back}
        </form>
      )}
    </AuthCard>
  );
}
