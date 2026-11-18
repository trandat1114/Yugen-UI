---
"yugen-ui": minor
---

New `yugen-ui/form` subpath (#162): `HookForm` connects react-hook-form to `Field`, `FormErrorSummary` and the submit `Button` (errors by `name`, loading while `onSubmit` runs, focus on the first invalid control), and `standardSchemaResolver(schema)` validates with any Standard Schema library (zod 4, valibot, arktype) without `@hookform/resolvers`. Built-in rules without a message (`register("code", { required: true, minLength: 4 })`) get the strings of `messages.form`. `react-hook-form` (^7.55.0) is an optional peer dependency: only this subpath imports it, the package root does not.
