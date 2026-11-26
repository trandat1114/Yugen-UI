import { z } from "zod";
import { CUSTOMER_STATUSES, PLANS } from "./api";
import type { Content } from "./content/types";

/*
 * zod schemas of the app's forms, with messages from the content. The forms pass them to `standardSchemaResolver` from
 * `yugen-ui/form`, which reads any Standard Schema validator (zod 4, valibot, arktype): no @hookform/resolvers needed.
 */

const email = (required: string, invalid: string) => z.string().trim().min(1, required).pipe(z.email(invalid));

export function customerSchema(m: Content["form"]["errors"]) {
  return z.object({
    name: z.string().trim().min(2, m.nameShort).max(80, m.nameLong),
    email: email(m.emailRequired, m.emailInvalid),
    company: z.string().trim().max(80, m.companyLong),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?[\d\s().-]{6,20})?$/, m.phoneInvalid),
    status: z.enum(CUSTOMER_STATUSES),
    plan: z.enum(PLANS),
  });
}

export function signInSchema(m: Content["form"]["errors"]) {
  return z.object({
    email: email(m.emailRequired, m.emailInvalid),
    password: z.string().min(1, m.passwordRequired),
  });
}

export function resetSchema(m: Content["form"]["errors"]) {
  return z.object({ email: email(m.emailRequired, m.emailInvalid) });
}
