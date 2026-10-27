import * as React from "react";
import { Controller, useForm, useWatch, type FieldErrors, type FieldValues, type UseFormReturn } from "react-hook-form";
import { ArrowLeft16Regular, Cart24Regular, Edit16Regular } from "@fluentui/react-icons";
import {
  Button,
  Card,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  Field,
  Input,
  MessageBar,
  Radio,
  RadioGroup,
  Select,
  Wizard,
  type WizardStep,
} from "yugen-ui";
import { useHeadings, useStore } from "../context";
import { LineList } from "../LineList";
import { describeLines, freeShippingFrom, shippingCost, subtotalOf, type LineView } from "../lines";
import { sum } from "../money";
import { orderId, type Order } from "../orders";
import { SHIPPING, shippingOption } from "../products";
import { Link, SHOP, useRouter } from "../router";
import {
  addressSchema,
  cardDigits,
  paymentSchema,
  shippingSchema,
  zodResolver,
  type AddressValues,
  type PaymentValues,
  type ShippingValues,
} from "../validation";

/** The demo "payment provider" declines this card, to show how a failed payment looks. */
const DECLINED_CARD = "4000000000000002";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function check<T extends FieldValues>(errors: FieldErrors<T>, name: keyof T & string) {
  const message = errors[name]?.message;
  return { validationState: message ? "error" : "none", validationMessage: typeof message === "string" ? message : undefined } as const;
}

function Fieldset({ legend, legendId, children }: { legend: string; legendId?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4">
      <legend id={legendId} className="mb-3 text-subtitle2 font-semibold">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function AddressStep({ form }: { form: UseFormReturn<AddressValues> }) {
  const { t, format } = useStore();
  const {
    register,
    formState: { errors },
  } = form;
  const c = t.checkout;
  return (
    <div className="flex flex-col gap-6">
      <Fieldset legend={c.contact}>
        <Field label={c.name} required {...check(errors, "name")}>
          <Input autoComplete="name" {...register("name")} />
        </Field>
        <div className="grid gap-4 @xl/app:grid-cols-2">
          <Field label={c.email} required {...check(errors, "email")}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </Field>
          <Field label={c.phone} hint={c.phoneHint} {...check(errors, "phone")}>
            <Input type="tel" autoComplete="tel" {...register("phone")} />
          </Field>
        </div>
      </Fieldset>
      <Fieldset legend={c.deliverTo}>
        <Field label={c.line1} required {...check(errors, "line1")}>
          <Input autoComplete="address-line1" {...register("line1")} />
        </Field>
        <Field label={c.line2} {...check(errors, "line2")}>
          <Input autoComplete="address-line2" {...register("line2")} />
        </Field>
        <div className="grid gap-4 @xl/app:grid-cols-3">
          <Field label={c.city} required {...check(errors, "city")}>
            <Input autoComplete="address-level2" {...register("city")} />
          </Field>
          <Field label={c.postalCode} {...check(errors, "postalCode")}>
            <Input autoComplete="postal-code" {...register("postalCode")} />
          </Field>
          <Field label={c.country} required {...check(errors, "country")}>
            <Select autoComplete="country" {...register("country")}>
              {t.countries.map((code) => (
                <option key={code} value={code}>
                  {format.country(code)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Fieldset>
    </div>
  );
}

/** One option of a radio list: name and detail at the start, price at the end. */
function OptionLabel({ name, detail, aside }: { name: string; detail: string; aside?: string }) {
  return (
    <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
      <span className="flex min-w-0 flex-col">
        <span className="font-semibold">{name}</span>
        <span className="text-caption1">{detail}</span>
      </span>
      {aside && <span className="shrink-0 font-semibold tabular-nums">{aside}</span>}
    </span>
  );
}

const optionClass = [
  "w-full rounded-medium border border-stroke-1 p-1 [&>label]:flex [&>label]:flex-1",
  "has-[button[data-state=checked]]:border-brand-stroke has-[button[data-state=checked]]:bg-brand-background-2",
].join(" ");

function ShippingStep({ form, subtotal }: { form: UseFormReturn<ShippingValues>; subtotal: number }) {
  const { t, format, price } = useStore();
  const legendId = React.useId();
  const c = t.checkout;
  return (
    <Fieldset legend={c.shippingMethod} legendId={legendId}>
      <Controller
        control={form.control}
        name="shipping"
        render={({ field }) => (
          <RadioGroup aria-labelledby={legendId} value={field.value} onValueChange={field.onChange} className="gap-2">
            {SHIPPING.map((option) => {
              const cost = shippingCost(option.id, subtotal, price);
              const detail =
                option.id === "standard" && cost > 0
                  ? `${c.methods[option.id].detail} · ${c.freeFrom(format.money(freeShippingFrom(price)))}`
                  : c.methods[option.id].detail;
              return (
                <Radio
                  key={option.id}
                  value={option.id}
                  className={optionClass}
                  label={<OptionLabel name={c.methods[option.id].name} detail={detail} aside={cost === 0 ? c.free : format.money(cost)} />}
                />
              );
            })}
          </RadioGroup>
        )}
      />
    </Fieldset>
  );
}

function PaymentStep({ form }: { form: UseFormReturn<PaymentValues> }) {
  const { t } = useStore();
  const {
    control,
    register,
    formState: { errors },
  } = form;
  const method = useWatch({ control, name: "payment" });
  const legendId = React.useId();
  const c = t.checkout;
  return (
    <div className="flex flex-col gap-6">
      <Fieldset legend={c.paymentMethod} legendId={legendId}>
        <Controller
          control={control}
          name="payment"
          render={({ field }) => (
            <RadioGroup aria-labelledby={legendId} value={field.value} onValueChange={field.onChange} className="gap-2">
              <Radio value="card" className={optionClass} label={<OptionLabel name={c.card} detail={c.cardDetail} />} />
              <Radio value="cod" className={optionClass} label={<OptionLabel name={c.cod} detail={c.codDetail} />} />
            </RadioGroup>
          )}
        />
      </Fieldset>
      {method === "card" && (
        <div className="flex flex-col gap-4">
          <MessageBar intent="info" layout="multiline" title={c.demoTitle}>
            {c.demoBody}
          </MessageBar>
          {/* autoComplete off: this is a demo, so the browser shouldn't offer to fill in or save a real card. */}
          <Field label={c.cardName} required {...check(errors, "cardName")}>
            <Input autoComplete="off" {...register("cardName")} />
          </Field>
          <Field label={c.cardNumber} hint={c.cardHint} required {...check(errors, "cardNumber")}>
            <Input inputMode="numeric" autoComplete="off" {...register("cardNumber")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={c.expiry} hint={c.expiryHint} required {...check(errors, "expiry")}>
              <Input inputMode="numeric" autoComplete="off" placeholder="MM/YY" {...register("expiry")} />
            </Field>
            <Field label={c.cvc} required {...check(errors, "cvc")}>
              <Input inputMode="numeric" autoComplete="off" maxLength={4} {...register("cvc")} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

interface Entered {
  address: AddressValues;
  shipping: ShippingValues;
  payment: PaymentValues;
}

/** Everything entered so far; Edit goes back to the step (or opens the cart for the items). */
function ReviewStep({ lines, entered, onEdit }: { lines: LineView[]; entered: Entered; onEdit: (step: number) => void }) {
  const { t, format, setCartOpen } = useStore();
  const { address: a, payment } = entered;
  const option = shippingOption(entered.shipping.shipping);
  const c = t.checkout;
  const section = (title: string, edit: () => void, body: React.ReactNode) => (
    <div className="flex flex-col gap-2 border-t border-stroke-2 pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-body1 font-semibold">{title}</p>
        <Button appearance="subtle" size="small" icon={<Edit16Regular />} aria-label={`${c.edit}: ${title}`} onClick={edit}>
          {c.edit}
        </Button>
      </div>
      {body}
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      <p className="text-subtitle2 font-semibold">{c.review}</p>
      {section(t.order.items, () => setCartOpen(true), <LineList lines={lines} />)}
      {section(
        c.deliverTo,
        () => onEdit(0),
        <address className="text-body1 text-foreground-2 not-italic">
          {a.name}
          <br />
          {a.line1}
          {a.line2 ? `, ${a.line2}` : ""}
          <br />
          {[a.city, a.postalCode].filter(Boolean).join(" ")}, {format.country(a.country)}
          <br />
          {a.email}
          {a.phone ? ` · ${a.phone}` : ""}
        </address>,
      )}
      {section(c.shipping, () => onEdit(1), <p className="text-body1 text-foreground-2">{`${c.methods[option.id].name} · ${c.methods[option.id].detail}`}</p>)}
      {section(
        c.paymentMethod,
        () => onEdit(2),
        <p className="text-body1 text-foreground-2">{payment.payment === "card" ? c.cardEnding(cardDigits(payment.cardNumber).slice(-4)) : c.cod}</p>,
      )}
    </div>
  );
}

function Summary({ lines, shipping }: { lines: LineView[]; shipping: number | undefined }) {
  const { t, format } = useStore();
  const { H2 } = useHeadings();
  const subtotal = subtotalOf(lines, t.currency);
  const headingId = React.useId();
  const row = (label: string, value: string, strong = false) => (
    <div className={strong ? "flex justify-between gap-2 text-subtitle2 font-semibold" : "flex justify-between gap-2 text-body1"}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
  return (
    <Card size="large" role="region" aria-labelledby={headingId} className="gap-4 @4xl/app:sticky @4xl/app:top-20">
      <H2 id={headingId} className="text-subtitle2 font-semibold">
        {t.checkout.summary}
      </H2>
      <LineList lines={lines} />
      <dl className="flex flex-col gap-2 border-t border-stroke-2 pt-3">
        {row(t.checkout.subtotal, format.money(subtotal))}
        {shipping !== undefined && row(t.checkout.shipping, shipping === 0 ? t.checkout.free : format.money(shipping))}
        {row(t.checkout.total, format.money(sum([subtotal, shipping ?? 0], t.currency)), true)}
      </dl>
    </Card>
  );
}

function EmptyCheckout() {
  const { t } = useStore();
  const { H1 } = useHeadings();
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia>
          <Cart24Regular />
        </EmptyMedia>
        <H1 className="font-display text-subtitle1 font-semibold text-foreground-1">{t.checkout.emptyTitle}</H1>
        <EmptyDescription>{t.checkout.emptyBody}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild appearance="primary">
          <Link to={SHOP}>{t.cart.browse}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/**
 * Next "submits" the form of the step: on errors, the first wrong field gets focus, and from then on each field is
 * checked as you type, so its message goes away as soon as it is fixed.
 */
const submitStep =
  <T extends FieldValues>(form: UseFormReturn<T>, message: string) =>
  () =>
    new Promise<true | string>((resolve) => {
      void form.handleSubmit(
        () => resolve(true),
        () => resolve(message),
      )();
    });

export default function CheckoutPage() {
  const { t, price, cart, orders } = useStore();
  const { navigate } = useRouter();
  const { H1 } = useHeadings();
  const lines = describeLines(cart.lines, t, price);
  const subtotal = subtotalOf(lines, t.currency);
  const [step, setStep] = React.useState(0);
  const e = t.checkout.errors;

  // One form per step, each with its own zod schema (validation.ts).
  const address = useForm<AddressValues>({
    resolver: zodResolver(addressSchema(e)),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", line1: "", line2: "", city: "", postalCode: "", country: t.defaultCountry },
  });
  const shipping = useForm<ShippingValues>({ resolver: zodResolver(shippingSchema(e)), defaultValues: { shipping: "standard" } });
  const payment = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema(e)),
    mode: "onTouched",
    defaultValues: { payment: "card", cardName: "", cardNumber: "", expiry: "", cvc: "" },
  });
  const method = useWatch({ control: shipping.control, name: "shipping" });

  if (lines.length === 0) return <EmptyCheckout />;

  const entered = (): Entered => ({ address: address.getValues(), shipping: shipping.getValues(), payment: payment.getValues() });

  // A pretend payment: wait like a real provider would, then decline the test card.
  const pay = async () => {
    await wait(900);
    const p = payment.getValues();
    return p.payment === "card" && cardDigits(p.cardNumber) === DECLINED_CARD ? t.checkout.declined : true;
  };

  // A real shop sends the order to its server here and gets the id back.
  const place = () => {
    const { address: a, shipping: s, payment: p } = entered();
    const cost = shippingCost(s.shipping, subtotal, price);
    const order: Order = {
      id: orderId(),
      placedAt: new Date().toISOString(),
      currency: t.currency,
      lines: lines.map((l) => ({ productId: l.productId, color: l.color, ...(l.size && { size: l.size }), quantity: l.quantity, unitPrice: l.unit })),
      subtotal,
      shippingCost: cost,
      total: sum([subtotal, cost], t.currency),
      contact: { name: a.name.trim(), email: a.email.trim(), phone: a.phone.trim() },
      address: { line1: a.line1.trim(), line2: a.line2.trim(), city: a.city.trim(), postalCode: a.postalCode.trim(), country: a.country },
      shipping: s.shipping,
      payment: p.payment === "card" ? { method: "card", last4: cardDigits(p.cardNumber).slice(-4) } : { method: "cod" },
    };
    orders.save(order);
    cart.clear();
    // Replace: Back from the confirmation should not land on an empty checkout.
    navigate({ name: "order", id: order.id }, { replace: true });
  };

  const c = t.checkout;
  const steps: WizardStep[] = [
    { id: "address", title: c.steps.address, content: <AddressStep form={address} />, validate: submitStep(address, c.fix) },
    {
      id: "shipping",
      title: c.steps.shipping,
      content: <ShippingStep form={shipping} subtotal={subtotal} />,
      validate: submitStep(shipping, c.fix),
    },
    { id: "payment", title: c.steps.payment, content: <PaymentStep form={payment} />, validate: submitStep(payment, c.fix) },
    { id: "review", title: c.steps.review, content: <ReviewStep lines={lines} entered={entered()} onEdit={setStep} />, validate: pay },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Link to={SHOP} className="inline-flex items-center gap-1 self-start rounded-medium text-body1 text-link hover:text-link-hover hover:underline">
        <ArrowLeft16Regular aria-hidden className="rtl:-scale-x-100" />
        {c.back}
      </Link>
      <H1 className="font-display text-title2 font-semibold">{c.title}</H1>
      <div className="grid items-start gap-6 @4xl/app:grid-cols-[1fr_22rem]">
        <form noValidate onSubmit={(event) => event.preventDefault()} className="min-w-0 rounded-large bg-background-1 p-4 shadow-4 @3xl/app:p-6">
          <Wizard steps={steps} activeStep={step} onStepChange={setStep} onFinish={place} finishLabel={c.placeOrder} />
        </form>
        <Summary lines={lines} shipping={step >= 1 ? shippingCost(method, subtotal, price) : undefined} />
      </div>
    </div>
  );
}
