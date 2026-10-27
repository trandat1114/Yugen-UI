import * as React from "react";
import { Checkmark20Filled } from "@fluentui/react-icons";
import { Button, Checkbox, Field, Input, Select, toast } from "yugen-ui";
import { useLanding } from "./context";
import { EMPTY_SIGN_UP, submitSignUp, validateSignUp, type SignUpValues } from "./signUp";

/** The last call to action: why to start now, next to the sign-up form. */
export function SignUpSection() {
  const { t, embedded, sectionId } = useLanding();
  const H2 = embedded ? "h3" : "h2";
  const titleId = `${sectionId("signup")}-title`;

  return (
    <section id={sectionId("signup")} aria-labelledby={titleId} className="scroll-mt-16 px-4 pb-16 @3xl/landing:pb-24">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-4xlarge bg-brand-background-2 p-6 @3xl/landing:p-10 @4xl/landing:grid-cols-2 @4xl/landing:p-14">
        <div>
          <H2 id={titleId} className="font-display text-title2 font-semibold text-foreground-1 @3xl/landing:text-title1">
            {t.signUp.title}
          </H2>
          <p className="mt-3 text-body2 text-foreground-2">{t.signUp.lead}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {t.signUp.points.map((point) => (
              <li key={point} className="flex items-center gap-2 text-body1 text-foreground-1">
                <Checkmark20Filled aria-hidden className="size-5 shrink-0 text-brand-foreground-1" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xlarge bg-background-1 p-6 shadow-8">
          <SignUpForm />
        </div>
      </div>
    </section>
  );
}

/**
 * Sign-up form: Yugen Field for labels and messages, `validateSignUp` for the rules (no form library). Messages appear
 * after the first submit and update as the person types; focus goes to the first field to fix.
 */
function SignUpForm() {
  const { t } = useLanding();
  const f = t.signUp.form;
  const id = React.useId();
  const [values, setValues] = React.useState<SignUpValues>(EMPTY_SIGN_UP);
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const errors = submitted ? validateSignUp(values, t.signUp.errors) : {};
  const set = <K extends keyof SignUpValues>(key: K, value: SignUpValues[K]) => setValues((v) => ({ ...v, [key]: value }));
  const state = (key: keyof SignUpValues) => (errors[key] ? "error" : "none") as "error" | "none";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSubmitted(true);
    const invalid = Object.keys(validateSignUp(values, t.signUp.errors));
    if (invalid.length > 0) {
      document.getElementById(`${id}-${invalid[0]}`)?.focus();
      return;
    }
    setSending(true);
    try {
      await submitSignUp(values);
      toast({ intent: "success", title: t.signUp.success.title, body: t.signUp.success.body(values.email.trim()) });
      setValues(EMPTY_SIGN_UP);
      setSubmitted(false);
    } finally {
      setSending(false);
    }
  };

  return (
    // noValidate: the browser's own bubbles would show before (and differ from) the messages below.
    <form noValidate aria-label={f.label} onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field id={`${id}-name`} label={f.name} required validationState={state("name")} validationMessage={errors.name}>
        <Input
          name="name"
          autoComplete="name"
          size="large"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          validationState={state("name")}
        />
      </Field>
      <Field
        id={`${id}-email`}
        label={f.email}
        hint={f.emailHint}
        required
        validationState={state("email")}
        validationMessage={errors.email}
      >
        <Input
          name="email"
          type="email"
          autoComplete="email"
          size="large"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          validationState={state("email")}
        />
      </Field>
      <Field id={`${id}-teamSize`} label={f.teamSize} required validationState={state("teamSize")} validationMessage={errors.teamSize}>
        <Select name="teamSize" size="large" value={values.teamSize} onChange={(e) => set("teamSize", e.target.value)}>
          <option value="" disabled>
            {f.teamSizePlaceholder}
          </option>
          {f.teamSizes.map((size, i) => (
            <option key={size} value={String(i)}>
              {size}
            </option>
          ))}
        </Select>
      </Field>
      <Field id={`${id}-consent`} required validationState={state("consent")} validationMessage={errors.consent}>
        <Checkbox
          name="consent"
          label={f.consent}
          checked={values.consent}
          onCheckedChange={(checked) => set("consent", checked === true)}
        />
      </Field>
      <Button type="submit" appearance="primary" size="large" loading={sending} loadingText={f.submitting} className="mt-2">
        {f.submit}
      </Button>
    </form>
  );
}
