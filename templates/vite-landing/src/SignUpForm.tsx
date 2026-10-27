import * as React from "react";
import { Button, Checkbox, Field, Input, Select, toast } from "yugen-ui";
import { useLanding } from "./context";
import { EMPTY_SIGN_UP, submitSignUp, validateSignUp, type SignUpValues } from "./signUp";

/**
 * Sign-up form: Yugen Field for labels and messages, `validateSignUp` for the rules (no form library). Messages appear
 * after the first submit and update as the person types; focus goes to the first field to fix.
 */
export function SignUpForm() {
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
