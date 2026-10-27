import type { Content } from "./content/types";

export interface SignUpValues {
  name: string;
  email: string;
  /** Index into `content.signUp.form.teamSizes`, "" until one is chosen. */
  teamSize: string;
  consent: boolean;
}

export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>;

export const EMPTY_SIGN_UP: SignUpValues = { name: "", email: "", teamSize: "", consent: false };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** One message per invalid field, in form order; an empty object means the form can be sent. */
export function validateSignUp(values: SignUpValues, messages: Content["signUp"]["errors"]): SignUpErrors {
  const errors: SignUpErrors = {};
  if (values.name.trim().length < 2) errors.name = messages.name;
  const email = values.email.trim();
  if (!email) errors.email = messages.emailRequired;
  else if (!EMAIL.test(email)) errors.email = messages.email;
  if (!values.teamSize) errors.teamSize = messages.teamSize;
  if (!values.consent) errors.consent = messages.consent;
  return errors;
}

/**
 * Sends the sign-up. A stand-in that waits a moment: replace the body with a call to your backend or form service, for
 * example `fetch("/api/sign-up", { method: "POST", body: JSON.stringify(values) })`, and throw when it fails.
 */
export async function submitSignUp(_values: SignUpValues): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}
