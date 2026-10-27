import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { z } from "zod";
import { CUSTOMER_STATUSES, PLANS } from "./api";
import type { Content } from "./content/types";

/**
 * zod schema → react-hook-form resolver, for flat forms like the ones in this app. It does what `zodResolver` from
 * `@hookform/resolvers` does; that package is left out because its optional peer dependencies make a plain
 * `npm install` fail with ERESOLVE on npm 11. Once that is fixed upstream you can use it instead.
 */
export function zodResolver<Input extends FieldValues, Output extends FieldValues>(
  schema: z.ZodType<Output, Input>,
): Resolver<Input, unknown, Output> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const name = issue.path.join(".");
      // The first problem of each field is the one to fix first.
      errors[name] ??= { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: errors as FieldErrors<Input> };
  };
}

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
