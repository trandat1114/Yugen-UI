import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { z } from "zod";
import type { Content } from "./content/types";
import { SHIPPING } from "./products";

/**
 * zod schema → react-hook-form resolver, for flat forms like the checkout. It does what `zodResolver` from
 * `@hookform/resolvers` does; that package is left out because its optional peer dependencies make a plain
 * `npm install` fail with ERESOLVE on npm 11. Once that is fixed upstream you can use it instead.
 */
export function zodResolver<Values extends FieldValues>(schema: z.ZodType): Resolver<Values> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data as Values, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const name = issue.path.join(".");
      // The first problem of each field is the one to fix first.
      errors[name] ??= { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: errors as FieldErrors<Values> };
  };
}

/** Fields of each checkout step, as typed. Each step is its own form, checked when you press Next. */
export interface AddressValues {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ShippingValues {
  shipping: (typeof SHIPPING)[number]["id"];
}

export interface PaymentValues {
  payment: "card" | "cod";
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

type Errors = Content["checkout"]["errors"];

/** Luhn checksum: catches most typos in a card number before anything is sent. */
export function luhn(digits: string) {
  let total = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    total += d;
  }
  return digits.length > 0 && total % 10 === 0;
}

export const cardDigits = (value: string) => value.replace(/[\s-]/g, "");

/** "MM/YY" that is this month or later. */
export function expiryOk(value: string, now = new Date()) {
  const m = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!m) return false;
  const year = 2000 + Number(m[2]);
  const month = Number(m[1]);
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

const required = (message: string) => z.string().trim().min(1, message);

export function addressSchema(m: Errors) {
  return z.object({
    name: z.string().trim().min(2, m.nameShort),
    email: required(m.emailRequired).pipe(z.email(m.emailInvalid)),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?[\d\s().-]{6,20})?$/, m.phoneInvalid),
    line1: z.string().trim().min(4, m.line1Required),
    line2: z.string(),
    city: required(m.cityRequired),
    postalCode: z
      .string()
      .trim()
      .regex(/^([A-Za-z0-9][A-Za-z0-9 -]{1,9})?$/, m.postalInvalid),
    country: required(m.countryRequired),
  });
}

export function shippingSchema(m: Errors) {
  return z.object({ shipping: z.enum(SHIPPING.map((s) => s.id) as [ShippingValues["shipping"]], m.shippingRequired) });
}

export function paymentSchema(m: Errors, now?: Date) {
  return z.discriminatedUnion("payment", [
    z.object({ payment: z.literal("cod") }),
    z.object({
      payment: z.literal("card"),
      cardName: z.string().trim().min(2, m.cardNameRequired),
      cardNumber: z
        .string()
        .transform(cardDigits)
        .refine((v) => /^\d{12,19}$/.test(v) && luhn(v), m.cardNumberInvalid),
      expiry: z.string().refine((v) => expiryOk(v, now), m.expiryInvalid),
      cvc: z
        .string()
        .trim()
        .regex(/^\d{3,4}$/, m.cvcInvalid),
    }),
  ]);
}
