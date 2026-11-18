import * as React from "react";
import { DiamondDismiss20Filled } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { useAnnounce } from "../AriaLive/AriaLive";
import { useComposedRefs } from "../_internal/composeRefs";
import {
  FormContext,
  FormPendingContext,
  controlOf,
  createFieldRegistry,
  errorOf,
  firstInvalid,
  type FormContextValue,
} from "../_internal/formContext";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { useYugenMessages } from "../YugenProvider/context";
import { formMessagesEn } from "./messages";
import { constraintErrors, normalizeErrors, sameErrors, type FormErrors } from "./validation";

export { formMessagesVi, formMessagesEn, type FormMessages } from "./messages";
export type { FormErrors } from "./validation";

/** What a Form action can return: errors by control name, shown in each Field and in FormErrorSummary. */
export interface FormActionResult {
  /** A key that names no control (`form`, say) is an error about the whole form: FormErrorSummary lists it without a link. */
  errors?: FormErrors | null;
}

/** A React 19 form action. Return `{ errors }` to show them; the form keeps what people typed when there are errors. */
export type FormAction = (formData: FormData) => void | FormActionResult | null | Promise<void | FormActionResult | null>;

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "action"> {
  /**
   * React 19 action (`formData => …`), also the `formAction` of `useActionState`; or a URL for a plain HTML submit. The
   * submit Button shows pending until it finishes.
   */
  action?: string | FormAction;
  /** Errors by control name, for example `state.errors` of `useActionState`. Shown until the control changes. */
  errors?: FormErrors | null;
  /**
   * Checks of your own, run on submit after the controls' constraints (`required`, `type`, `pattern`, `minLength`…) and
   * again on change after the first submit. Its message wins over the constraint message of the same name.
   */
  validate?: (formData: FormData) => FormErrors | null | undefined | void;
  /** Skips the constraint checks (`validate` still runs). The browser's own error bubbles never show. */
  noValidate?: boolean;
  ref?: React.Ref<HTMLFormElement>;
}

const NO_ERRORS: Readonly<Record<string, string>> = Object.freeze({});
const NO_NAMES: ReadonlySet<string> = new Set();

/**
 * Form for React 19 actions (#162): checks the controls' constraints with translated messages before the action runs,
 * shows the errors the action returns in each Field by `name`, moves focus to the first invalid control after a failed
 * submit, and gives the submit Button its pending state.
 */
export function Form({ action, errors, validate, noValidate, onSubmit, onReset, onChange, children, ref, ...props }: FormProps) {
  const msg = useYugenMessages("form", formMessagesEn);
  const formRef = React.useRef<HTMLFormElement>(null);
  const composedRef = useComposedRefs(ref, formRef);
  const [fields] = React.useState(createFieldRegistry);
  const [clientErrors, setClientErrors] = React.useState(NO_ERRORS);
  const [actionErrors, setActionErrors] = React.useState(NO_ERRORS);
  /** Names whose action / `errors` message is out of date (the control changed since); "all" after a reset. */
  const [stale, setStale] = React.useState<ReadonlySet<string> | "all">(NO_NAMES);
  const [attempt, setAttempt] = React.useState(0);
  /** The action ran and React will reset the form when it commits (React 19 resets after every form action). */
  const autoReset = React.useRef(false);

  const propErrors = normalizeErrors(errors);
  const [lastPropErrors, setLastPropErrors] = React.useState(propErrors);
  if (!sameErrors(propErrors, lastPropErrors)) {
    setLastPropErrors(propErrors);
    setStale(NO_NAMES);
  }

  const merged = React.useMemo(() => {
    const out: Record<string, string> = {};
    const fresh = (name: string) => stale !== "all" && !stale.has(name);
    for (const source of [actionErrors, lastPropErrors]) for (const name of Object.keys(source)) if (fresh(name)) out[name] = source[name];
    Object.assign(out, clientErrors);
    return Object.keys(out).length ? out : NO_ERRORS;
  }, [actionErrors, lastPropErrors, clientErrors, stale]);

  const check = (form: HTMLFormElement, only?: string) => {
    const found = noValidate ? {} : constraintErrors(form, msg, only);
    const own = normalizeErrors(validate?.(new FormData(form)) || null);
    for (const name of Object.keys(own)) if (only === undefined || name === only) found[name] = own[name];
    return found;
  };

  const control = React.useCallback((name: string) => (formRef.current ? controlOf(formRef.current, name, fields.get()) : null), [fields]);

  // After each submit that ends with errors: focus the first invalid control, once the errors are rendered (so its
  // label, aria-invalid and message are read together).
  React.useEffect(() => {
    if (!attempt) return;
    const name = firstInvalid(Object.keys(merged), control);
    if (name) control(name)?.focus();
    // `merged` is read for this attempt only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const formAction = React.useMemo(
    () =>
      typeof action === "function"
        ? async (formData: FormData) => {
            autoReset.current = true;
            const result = (await action(formData)) as FormActionResult | null | undefined;
            const next = normalizeErrors(result?.errors);
            // After an await, state updates need their own transition to land with the end of the action (#162).
            React.startTransition(() => {
              setActionErrors(next);
              setStale(NO_NAMES);
              setAttempt((n) => n + 1);
            });
          }
        : action,
    [action],
  );

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    autoReset.current = false;
    const found = check(event.currentTarget);
    const failed = Object.keys(found).length > 0;
    setClientErrors((prev) => (failed ? found : prev === NO_ERRORS ? prev : NO_ERRORS));
    if (failed) {
      // Stops the action and the native submit, like the browser does for an invalid form.
      event.preventDefault();
      setAttempt((n) => n + 1);
      return;
    }
    onSubmit?.(event);
  };

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    onReset?.(event);
    if (autoReset.current) {
      autoReset.current = false;
      // React resets the form after an action; when it returned errors, keep what people typed so they can fix it.
      if (merged !== NO_ERRORS) {
        event.preventDefault();
        return;
      }
    }
    if (event.defaultPrevented) return;
    setClientErrors(NO_ERRORS);
    setActionErrors(NO_ERRORS);
    setStale("all");
  };

  const handleChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    onChange?.(event);
    const name = (event.target as { name?: unknown }).name;
    if (typeof name !== "string" || !name) return;
    setStale((prev) => (prev === "all" || prev.has(name) ? prev : new Set(prev).add(name)));
    if (!attempt) return;
    // After the first submit, the changed control is checked again as people type.
    const message = check(event.currentTarget, name)[name];
    setClientErrors((prev) => {
      if (errorOf(prev, name) === message) return prev;
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return Object.keys(next).length ? next : NO_ERRORS;
    });
  };

  const value = React.useMemo<FormContextValue>(() => ({ errors: merged, attempt, fields, control }), [merged, attempt, fields, control]);

  return (
    <FormContext.Provider value={value}>
      <FormPendingContext.Provider value={false}>
        <form
          ref={composedRef}
          {...props}
          noValidate
          action={formAction}
          onSubmit={handleSubmit}
          onReset={handleReset}
          onChange={handleChange}
        >
          {children}
        </form>
      </FormPendingContext.Provider>
    </FormContext.Provider>
  );
}

export interface FormErrorSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Heading. Default: `messages.form.summaryTitle(count)` ("There are 2 problems"). */
  title?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

const NO_FIELDS = createFieldRegistry();

/** Text of a control's label for the summary when its Field has no `label` (Checkbox with its own label…). */
function labelOf(el: HTMLElement): string | undefined {
  const labelled = el.getAttribute("aria-labelledby");
  const text =
    (el as HTMLInputElement).labels?.[0]?.textContent ??
    el.getAttribute("aria-label") ??
    (labelled ? el.ownerDocument.getElementById(labelled.split(" ")[0])?.textContent : undefined);
  return text?.trim() || undefined;
}

/**
 * The errors of the surrounding Form or HookForm as a list of links that move focus to each control (WCAG 3.3.1),
 * announced to screen readers after each submit that ends with errors. Renders nothing while there are none.
 */
export function FormErrorSummary({ title, className, ref, ...props }: FormErrorSummaryProps) {
  const form = React.useContext(FormContext);
  const msg = useYugenMessages("form", formMessagesEn);
  const registry = form?.fields ?? NO_FIELDS;
  const fields = React.useSyncExternalStore(registry.subscribe, registry.get, registry.get);
  const { announce } = useAnnounce();
  const titleId = React.useId();
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const errors = form?.errors ?? NO_ERRORS;
  const attempt = form?.attempt ?? 0;

  // Fields in the order they mount (the order of the form), then the errors that have no Field.
  const names = [...[...fields.keys()].filter((name) => errorOf(errors, name)), ...Object.keys(errors).filter((name) => !fields.has(name))];
  const key = names.join("\n");

  /** Controls of errors that no Field registered with a label: id for the link, label text from the DOM. */
  const [found, setFound] = React.useState<Record<string, { id: string; label?: string }>>({});
  useIsomorphicLayoutEffect(() => {
    const next: Record<string, { id: string; label?: string }> = {};
    for (const name of names) {
      if (fields.get(name)?.label) continue;
      const el = form?.control(name);
      if (el) next[name] = { id: el.id, label: labelOf(el) };
    }
    setFound((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    // `key` stands for `names`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fields, form]);

  React.useEffect(() => {
    const body = bodyRef.current;
    if (!attempt || !body) return;
    const parts = Array.from(body.querySelectorAll("[data-summary-text]"), (node) => node.textContent?.trim() ?? "").filter(Boolean);
    announce(parts.map((part) => (/[.!?…:]$/.test(part) ? part : `${part}.`)).join(" "), { batchId: titleId });
    // Announced once per submit, not as people fix the errors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (!names.length) return null;

  const focus = (event: React.MouseEvent, name: string) => {
    event.preventDefault();
    form?.control(name)?.focus();
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={titleId}
      className={cn(
        "flex w-full items-start gap-2 rounded-medium border border-danger-border-1 bg-danger-background-1 px-3 py-2 text-body1 text-foreground-1",
        className,
      )}
      {...props}
    >
      <DiamondDismiss20Filled className="mt-0.5 size-5 shrink-0 text-danger-foreground-1" />
      <div ref={bodyRef} className="flex min-w-0 flex-1 flex-col gap-1">
        <p id={titleId} data-summary-text className="font-semibold">
          {title ?? msg.summaryTitle(names.length)}
        </p>
        <ul className="flex flex-col gap-0.5">
          {names.map((name) => {
            const field = fields.get(name);
            const label = field?.label ?? found[name]?.label;
            const id = field?.id ?? found[name]?.id;
            const text = (
              <span data-summary-text>
                {label ? <>{label}: </> : null}
                {errors[name]}
              </span>
            );
            return (
              <li key={name}>
                {id !== undefined ? (
                  <a
                    href={`#${id}`}
                    onClick={(event) => focus(event, name)}
                    className="rounded-small text-danger-foreground-1 underline hover:text-foreground-1"
                  >
                    {text}
                  </a>
                ) : (
                  text
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
