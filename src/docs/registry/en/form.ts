import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/form.tsx.
export const en: Record<string, ComponentDocEn> = {
  form: {
    description:
      'Form runs React 19 actions (action, useActionState, useFormStatus). Before the action runs, Form checks the controls\' constraints (required, type, pattern, minLength, min / max…) with messages from messages.form, so they are translated with the rest. Errors the action returns ({ errors: { email: "…" } }) or the errors prop show in the Field whose control has that name, with no validationState / validationMessage. After a failed submit, focus moves to the first invalid control and Form keeps what people typed; a type="submit" Button inside is loading while the form submits. FormErrorSummary lists the errors as links to each control (WCAG 3.3.1) and is read to screen readers after each submit. For react-hook-form, use HookForm from yugen-ui/form (react-hook-form is an optional peer) and standardSchemaResolver for any Standard Schema validator: zod 4, valibot, arktype.',
    examples: [
      {
        title: "useActionState and the errors prop",
        description:
          "The state of useActionState goes into errors. An error hides when people change that control and comes back with the next result; after a successful save React resets the form to defaultValue.",
      },
      {
        title: "Checks of your own with validate",
        description: "validate gets the FormData and runs after the controls' constraints: use it for checks across fields, like confirming a password.",
      },
      {
        title: "react-hook-form + zod",
        description:
          "HookForm takes what useForm returns. standardSchemaResolver uses a zod schema (or valibot, arktype) without @hookform/resolvers. Field reads the error by the name from register; for a control in a Controller, set name on the Field.",
      },
    ],
    dos: [
      "Give every control a name: Field finds its error by name, and so do FormData and react-hook-form.",
      "Put FormErrorSummary at the top of a long form so people see every error after submitting.",
      "Check again on the server and return errors by name; an error about the whole form uses a key that is not a control name (form).",
    ],
    donts: [
      "Don't disable the submit button while the form is invalid. Let people click it and see the specific errors.",
      "Don't pass validationState / validationMessage to a Field inside Form, unless you want to show a different state yourself.",
      "Don't nest forms; each Form is one <form> element.",
    ],
    props: {
      action: "React 19 action (also the formAction of useActionState) or a URL. Return { errors } to show errors by name.",
      errors: "Errors by name, e.g. state.errors of useActionState. Hidden when the control changes, shown again when the prop's value changes.",
      validate: "Checks of your own on submit, after the controls' constraints; its message wins over the constraint message of the same name.",
      noValidate: "Skips the constraint checks (validate still runs). The browser's own error bubbles never show.",
      "FormErrorSummary.title": "Heading. Default: messages.form.summaryTitle(number of errors).",
      "HookForm.form": "What useForm() returns. HookForm also provides it to useFormContext().",
      "HookForm.onSubmit / onInvalid": "As in handleSubmit(onSubmit, onInvalid). The submit button is loading until onSubmit finishes.",
      "standardSchemaResolver(schema)":
        "Resolver for any Standard Schema validator: the first issue of each field; an issue with no path goes to errors.root.",
      "Field.name": "Name of the control whose error Field shows. Default: the child control's name.",
    },
  },
};
