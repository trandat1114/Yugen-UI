import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button, DrawerBody, DrawerFooter, DrawerHeader, DrawerHeaderTitle, Field, Input, Select } from "yugen-ui";
import { CUSTOMER_STATUSES, PLANS, type Customer, type CustomerInput } from "./api";
import { useAdmin } from "./context";
import { customerSchema, zodResolver } from "./validation";

type Values = z.input<ReturnType<typeof customerSchema>>;

const EMPTY: Values = { name: "", email: "", company: "", phone: "", status: "active", plan: "free" };

export interface CustomerFormProps {
  customer?: Customer;
  title: string;
  /** Close button of the drawer header. */
  close: React.ReactNode;
  onCancel: () => void;
  onSubmit: (values: CustomerInput) => void;
}

/** Fields of a customer, checked by the zod schema in validation.ts as you leave each one and on save. */
export default function CustomerForm({ customer, title, close, onCancel, onSubmit }: CustomerFormProps) {
  const { t } = useAdmin();
  const schema = React.useMemo(() => customerSchema(t.form.errors), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values, unknown, CustomerInput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: customer
      ? { name: customer.name, email: customer.email, company: customer.company, phone: customer.phone, status: customer.status, plan: customer.plan }
      : EMPTY,
  });
  const check = (name: keyof Values) =>
    ({ validationState: errors[name] ? "error" : "none", validationMessage: errors[name]?.message }) as const;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader>
        <DrawerHeaderTitle action={close}>{title}</DrawerHeaderTitle>
        <p className="text-body1 text-foreground-3">{t.form.lead}</p>
      </DrawerHeader>
      <DrawerBody className="flex flex-col gap-4 py-4">
        <Field label={t.form.name} required {...check("name")}>
          <Input autoComplete="off" {...register("name")} />
        </Field>
        <Field label={t.form.email} required {...check("email")}>
          <Input type="email" autoComplete="off" {...register("email")} />
        </Field>
        <Field label={t.form.company} {...check("company")}>
          <Input autoComplete="off" {...register("company")} />
        </Field>
        <Field label={t.form.phone} hint={t.form.phoneHint} {...check("phone")}>
          <Input type="tel" autoComplete="off" {...register("phone")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.form.status} {...check("status")}>
            <Select {...register("status")}>
              {CUSTOMER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t.statuses[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.form.plan} {...check("plan")}>
            <Select {...register("plan")}>
              {PLANS.map((plan) => (
                <option key={plan} value={plan}>
                  {t.plans[plan]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </DrawerBody>
      <DrawerFooter className="justify-end border-t border-stroke-2">
        <Button onClick={onCancel}>{t.common.cancel}</Button>
        <Button type="submit" appearance="primary">
          {customer ? t.form.save : t.form.create}
        </Button>
      </DrawerFooter>
    </form>
  );
}
