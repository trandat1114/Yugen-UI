import * as React from "react";
import {
  FormProvider,
  get,
  set,
  useFormState,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  type Resolver,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { useComposedRefs } from "../_internal/composeRefs";
import {
  FormContext,
  FormPendingContext,
  controlOf,
  createFieldRegistry,
  firstInvalid,
  type FormContextValue,
} from "../_internal/formContext";
import { useYugenMessages } from "../YugenProvider/context";
import { formMessagesEn, type FormMessages } from "../Form/messages";
import { requiredMessage } from "../Form/validation";

/*
 * `yugen-ui/form` (#162): react-hook-form for Form's Field, FormErrorSummary and submit Button. react-hook-form is an
 * optional peer dependency of yugen-ui; only this subpath imports it, never the package root.
 */

/** Standard Schema v1 (https://standardschema.dev), the part this resolver reads: zod 4, valibot, arktype… implement it. */
export interface StandardSchema<Input = unknown, Output = Input> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output } | undefined;
  };
}

export type StandardSchemaResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardSchemaIssue> };

export interface StandardSchemaIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined;
}

/**
 * A react-hook-form resolver for any Standard Schema validator (zod 4, valibot, arktype…): the first issue of each field
 * becomes its error, an issue with no path goes to `errors.root`.
 */
export function standardSchemaResolver<Input extends FieldValues, Output = Input, Context = unknown>(
  schema: StandardSchema<Input, Output>,
): Resolver<Input, Context, Output> {
  return async (values) => {
    const result = await schema["~standard"].validate(values);
    if (!result.issues) return { values: result.value, errors: {} };
    const errors: Record<string, unknown> = {};
    for (const issue of result.issues) {
      const name = issue.path?.length ? issue.path.map((segment) => String(typeof segment === "object" ? segment.key : segment)).join(".") : "root";
      if (!get(errors, name)) set(errors, name, { type: "validate", message: issue.message });
    }
    return { values: {}, errors: errors as FieldErrors<Input> };
  };
}

export interface HookFormProps<TFieldValues extends FieldValues = FieldValues, TContext = unknown, TTransformedValues = TFieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onInvalid"> {
  /** What `useForm()` returns. HookForm also provides it to `useFormContext()`. */
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  /** Called with the values once they pass validation (`handleSubmit`). The submit Button is loading until it settles. */
  onSubmit: SubmitHandler<TTransformedValues>;
  /** Called with the errors when validation fails. */
  onInvalid?: SubmitErrorHandler<TFieldValues>;
  ref?: React.Ref<HTMLFormElement>;
}

type Control = UseFormReturn<FieldValues>["control"];

/** A rule's value (`minLength: 8` or `minLength: { value: 8, message }`) as registered with `register(name, rules)`. */
function ruleValue(control: Control, name: string, type: string): unknown {
  const rule = (get(control._fields, name) as { _f?: Record<string, unknown> } | undefined)?._f?.[type];
  return rule && typeof rule === "object" && "value" in rule ? (rule as { value: unknown }).value : rule;
}

/** Message for a built-in rule that has none (`register("name", { required: true })`), from `messages.form`. */
function ruleMessage(error: FieldError, name: string, form: UseFormReturn<FieldValues>, m: FormMessages): string {
  const length = () => {
    const value: unknown = form.getValues(name);
    return typeof value === "string" || Array.isArray(value) ? value.length : 0;
  };
  const limit = () => ruleValue(form.control, name, error.type);
  switch (error.type) {
    case "required":
      return requiredMessage(error.ref, m);
    case "minLength":
      return m.tooShort(Number(limit()), length());
    case "maxLength":
      return m.tooLong(Number(limit()), length());
    case "min":
      return m.rangeUnderflow(String(limit()));
    case "max":
      return m.rangeOverflow(String(limit()));
    case "pattern":
      return m.pattern;
    default:
      return m.invalid;
  }
}

/** Nested react-hook-form errors → one message per field path (`email`, `items.0.name`, `root.server`). */
function flatten(errors: object, form: UseFormReturn<FieldValues>, m: FormMessages, prefix = "", out: Record<string, string> = {}, inError = false) {
  for (const [key, value] of Object.entries(errors)) {
    // `ref` and `types` of an error are not fields.
    if (!value || typeof value !== "object" || (inError && (key === "ref" || key === "types"))) continue;
    const name = prefix ? `${prefix}.${key}` : key;
    // An error has a `type` (rule) or a `message` (`setError(name, { message })` sets no type).
    const error = typeof (value as FieldError).type === "string" || typeof (value as FieldError).message === "string" ? (value as FieldError) : undefined;
    if (error) out[name] = error.message || ruleMessage(error, name, form, m);
    // Nested objects and field arrays; `root` can hold errors of its own (`setError("root.server", …)`).
    if (!error || key === "root") flatten(value, form, m, name, out, !!error);
  }
  return out;
}

/**
 * `<form>` for react-hook-form: Field shows the error of its control by `name`, FormErrorSummary lists the errors, a
 * `type="submit"` Button is loading while `onSubmit` runs, and after a failed submit focus moves to the first invalid
 * control (react-hook-form does it for registered fields; HookForm for the rest).
 */
export function HookForm<TFieldValues extends FieldValues = FieldValues, TContext = unknown, TTransformedValues = TFieldValues>({
  form,
  onSubmit,
  onInvalid,
  children,
  ref,
  ...props
}: HookFormProps<TFieldValues, TContext, TTransformedValues>) {
  const msg = useYugenMessages("form", formMessagesEn);
  const { errors, isSubmitting, submitCount } = useFormState({ control: form.control });
  const formRef = React.useRef<HTMLFormElement>(null);
  const composedRef = useComposedRefs(ref, formRef);
  const [fields] = React.useState(createFieldRegistry);
  const loose = form as unknown as UseFormReturn<FieldValues>;
  // react-hook-form updates its error object in place: read it on every render, not through useMemo.
  const flat = flatten(errors, loose, msg);

  const control = React.useCallback((name: string) => (formRef.current ? controlOf(formRef.current, name, fields.get()) : null), [fields]);
  /** Focus when the submit started: react-hook-form moves it to the first registered field with an error. */
  const focusBefore = React.useRef<Element | null>(null);

  React.useEffect(() => {
    const el = formRef.current;
    if (!submitCount || isSubmitting || !el) return;
    const active = el.ownerDocument.activeElement;
    // react-hook-form (or `setError(…, { shouldFocus: true })`) already moved focus to an invalid field.
    if (active !== focusBefore.current || active?.getAttribute("aria-invalid") === "true") return;
    const name = firstInvalid(Object.keys(flat), control);
    if (name) control(name)?.focus();
    // Once per submit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount, isSubmitting]);

  const value: FormContextValue = { errors: flat, attempt: submitCount, fields, control };
  const submit = form.handleSubmit(onSubmit, onInvalid);
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    focusBefore.current = event.currentTarget.ownerDocument.activeElement;
    return submit(event);
  };

  return (
    <FormProvider {...form}>
      <FormContext.Provider value={value}>
        <FormPendingContext.Provider value={isSubmitting}>
          <form ref={composedRef} noValidate {...props} onSubmit={handleSubmit}>
            {children}
          </form>
        </FormPendingContext.Provider>
      </FormContext.Provider>
    </FormProvider>
  );
}

