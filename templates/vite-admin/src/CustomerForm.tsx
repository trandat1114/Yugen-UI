import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button, DrawerBody, DrawerFooter, DrawerHeader, DrawerHeaderTitle, Field, FormErrorSummary, Input, Select } from "yugen-ui";
import { HookForm, standardSchemaResolver } from "yugen-ui/form";
import { CUSTOMER_STATUSES, PLANS, type Customer, type CustomerInput } from "./api";
import { useAdmin } from "./context";
import { customerSchema } from "./validation";

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

/**
 * Fields of a customer, checked by the zod schema in validation.ts as you leave each one and on save. HookForm shows each
 * error in the Field of the same name, lists them in FormErrorSummary and moves focus to the first one.
 */
export default function CustomerForm({ customer, title, close, onCancel, onSubmit }: CustomerFormProps) {
  const { t } = useAdmin();
  const schema = React.useMemo(() => customerSchema(t.form.errors), [t]);
  const form = useForm<Values, unknown, CustomerInput>({
    resolver: standardSchemaResolver(schema),
    mode: "onTouched",
    defaultValues: customer
      ? { name: customer.name, email: customer.email, company: customer.company, phone: customer.phone, status: customer.status, plan: customer.plan }
      : EMPTY,
  });
  const { register } = form;

  return (
    <HookForm form={form} onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader>
        <DrawerHeaderTitle action={close}>{title}</DrawerHeaderTitle>
        <p className="text-body1 text-foreground-3">{t.form.lead}</p>
      </DrawerHeader>
      <DrawerBody className="flex flex-col gap-4 py-4">
        <FormErrorSummary />
        <Field label={t.form.name} required>
          <Input autoComplete="off" {...register("name")} />
        </Field>
        <Field label={t.form.email} required>
          <Input type="email" autoComplete="off" {...register("email")} />
        </Field>
        <Field label={t.form.company}>
          <Input autoComplete="off" {...register("company")} />
        </Field>
        <Field label={t.form.phone} hint={t.form.phoneHint}>
          <Input type="tel" autoComplete="off" {...register("phone")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.form.status}>
            <Select {...register("status")}>
              {CUSTOMER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t.statuses[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.form.plan}>
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
    </HookForm>
  );
}
