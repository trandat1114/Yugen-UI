import { useActionState, useState } from "react";
// #region rhf-imports
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { HookForm, standardSchemaResolver } from "@/components/ui/HookForm/HookForm";
// #endregion
import { Button, Checkbox, Field, Form, FormErrorSummary, Input, Select, type FormActionResult, type FormErrors } from "@/components/ui";
import type { ComponentDoc } from "../types";
import RAW from "./form.tsx?raw";

/*
 * `code` của mỗi ví dụ được cắt từ chính file này (giữa `// #region <tên>` và `// #endregion`), nên luôn trùng từng ký tự
 * với component mà `render` hiển thị. react-hook-form / zod chỉ dùng ở trang docs và ở `yugen-ui/form`.
 */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");

function source(...names: string[]) {
  return names
    .map((name) => {
      const start = LINES.findIndex((line) => line.trim() === `// #region ${name}`);
      const end = LINES.findIndex((line, i) => i > start && line.trim() === "// #endregion");
      if (start < 0 || end < 0) return `// Không tìm thấy mã nguồn "${name}"`;
      return LINES.slice(start + 1, end).join("\n").trim();
    })
    .join("\n\n");
}

// #region wait
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
// #endregion

/* ============================================================== Form + React 19 action */

// #region createAccount
/** Stands in for your API: "taken@example.com" already has an account. */
async function createAccount(formData: FormData): Promise<FormActionResult> {
  await wait(800);
  if (formData.get("email") === "taken@example.com") {
    return { errors: { email: "This email already has an account. Sign in instead." } };
  }
  return {};
}
// #endregion

// #region SignUpForm
function SignUpForm() {
  const [created, setCreated] = useState<string | null>(null);

  return (
    <Form
      action={async (formData) => {
        setCreated(null);
        const result = await createAccount(formData);
        if (!result.errors) setCreated(String(formData.get("name")));
        return result;
      }}
      className="flex w-full max-w-120 flex-col gap-3"
    >
      <FormErrorSummary />
      <Field label="Full name" required>
        <Input name="name" autoComplete="name" />
      </Field>
      <Field label="Email" required hint='Try "taken@example.com" to see an error from the action.'>
        <Input name="email" type="email" autoComplete="email" />
      </Field>
      <Field label="Password" required hint="At least 8 characters.">
        <Input name="password" type="password" minLength={8} autoComplete="new-password" />
      </Field>
      <Button type="submit" appearance="primary" className="self-start">
        Create account
      </Button>
      {created && (
        <p role="status" className="text-body1 text-success-foreground-1">
          Account created for {created}.
        </p>
      )}
    </Form>
  );
}
// #endregion

// #region ProfileForm
type ProfileState = { errors?: FormErrors; saved?: string };

async function saveProfile(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  await wait(800);
  const handle = String(formData.get("handle"));
  if (handle === "admin") return { errors: { handle: "This handle is taken. Pick another one." } };
  return { saved: handle };
}

function ProfileForm() {
  const [state, formAction] = useActionState(saveProfile, {});

  return (
    <Form action={formAction} errors={state.errors} className="flex w-full max-w-120 flex-col gap-3">
      <Field label="Handle" required hint='3 to 20 lowercase letters, digits or dashes. "admin" is taken.'>
        <Input name="handle" pattern="[a-z0-9-]+" minLength={3} maxLength={20} defaultValue={state.saved} />
      </Field>
      <Button type="submit" appearance="primary" className="self-start">
        Save
      </Button>
      {state.saved && (
        <p role="status" className="text-body1 text-success-foreground-1">
          Saved as @{state.saved}.
        </p>
      )}
    </Form>
  );
}
// #endregion

// #region PasswordForm
function checkPasswords(formData: FormData): FormErrors {
  return { confirm: formData.get("confirm") === formData.get("password") ? null : "The two passwords don't match." };
}

function PasswordForm() {
  const [changed, setChanged] = useState(false);

  return (
    <Form
      validate={checkPasswords}
      action={async () => {
        await wait(800);
        setChanged(true);
      }}
      className="flex w-full max-w-120 flex-col gap-3"
    >
      <Field label="New password" required hint="At least 8 characters.">
        <Input name="password" type="password" minLength={8} autoComplete="new-password" />
      </Field>
      <Field label="Confirm the password" required>
        <Input name="confirm" type="password" autoComplete="new-password" />
      </Field>
      <Button type="submit" appearance="primary" className="self-start">
        Change password
      </Button>
      {changed && (
        <p role="status" className="text-body1 text-success-foreground-1">
          Password changed.
        </p>
      )}
    </Form>
  );
}
// #endregion

/* ============================================================== react-hook-form + zod */

// #region inviteSchema
const PLANS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro · $99/month" },
  { value: "team", label: "Team · $249/month" },
];

const inviteSchema = z.object({
  name: z.string().trim().min(2, "Enter a name of at least 2 characters."),
  email: z.string().trim().min(1, "Enter an email address.").pipe(z.email("Enter a valid email address.")),
  plan: z.string().min(1, "Choose a plan."),
  terms: z.boolean().refine((accepted) => accepted, "Accept the terms to continue."),
});
// #endregion

// #region InviteForm
function InviteForm() {
  const [invited, setInvited] = useState<string | null>(null);
  const form = useForm({
    resolver: standardSchemaResolver(inviteSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", plan: "", terms: false },
  });

  return (
    <HookForm
      form={form}
      onSubmit={async (values) => {
        setInvited(null);
        await wait(800);
        if (values.email === "taken@example.com") {
          form.setError("email", { message: "This person is already a member." });
          return;
        }
        setInvited(values.email);
      }}
      className="flex w-full max-w-120 flex-col gap-3"
    >
      <FormErrorSummary />
      <Field label="Name" required>
        <Input autoComplete="name" {...form.register("name")} />
      </Field>
      <Field label="Email" required hint='"taken@example.com" is already a member.'>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field label="Plan" required>
        <Select {...form.register("plan")}>
          <option value="">Choose a plan…</option>
          {PLANS.map((plan) => (
            <option key={plan.value} value={plan.value}>
              {plan.label}
            </option>
          ))}
        </Select>
      </Field>
      <Controller
        control={form.control}
        name="terms"
        render={({ field }) => (
          <Field name="terms">
            <Checkbox
              ref={field.ref}
              label="I agree to the terms of use"
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
            />
          </Field>
        )}
      />
      <Button type="submit" appearance="primary" className="self-start">
        Send invitation
      </Button>
      {invited && (
        <p role="status" className="text-body1 text-success-foreground-1">
          Invitation sent to {invited}.
        </p>
      )}
    </HookForm>
  );
}
// #endregion

export const docs: ComponentDoc[] = [
  {
    slug: "form",
    name: "Form",
    category: "Nhập liệu",
    lead: "Form kiểm tra dữ liệu trước khi gửi, hiện lỗi trong từng Field theo name và tóm tắt lỗi ở đầu form, với action của React 19 hoặc react-hook-form.",
    description:
      "Form chạy action của React 19 (action, useActionState, useFormStatus). Trước khi action chạy, Form kiểm tra ràng buộc của control (required, type, pattern, minLength, min / max…) với thông báo lấy từ messages.form, nên được dịch cùng phần còn lại. Lỗi action trả về ({ errors: { email: \"…\" } }) hoặc prop errors hiện trong Field có control cùng name, không cần validationState / validationMessage. Sau một lần gửi lỗi, focus chuyển tới control lỗi đầu tiên và Form giữ chữ đã nhập; Button type=\"submit\" bên trong tự loading khi đang gửi. FormErrorSummary liệt kê lỗi thành link tới từng control (WCAG 3.3.1) và đọc cho trình đọc màn hình sau mỗi lần gửi. Với react-hook-form, dùng HookForm từ yugen-ui/form (react-hook-form là peer tuỳ chọn) và standardSchemaResolver cho mọi validator theo Standard Schema: zod 4, valibot, arktype.",
    importCode: `import { Form, FormErrorSummary, Field, Input, Button } from "@/components/ui";
// react-hook-form (optional): npm i react-hook-form
import { HookForm, standardSchemaResolver } from "@/components/ui/HookForm/HookForm";`,
    hero: {
      title: "Action của React 19",
      description: "Gửi khi còn trống để thấy lỗi ràng buộc; nhập taken@example.com để thấy lỗi action trả về. Form giữ chữ đã nhập khi có lỗi.",
      code: source("wait", "createAccount", "SignUpForm"),
      render: () => <SignUpForm />,
    },
    examples: [
      {
        title: "useActionState và prop errors",
        description:
          "State của useActionState đi vào errors. Lỗi ẩn khi người dùng sửa ô đó và hiện lại với kết quả mới; sau khi lưu thành công React đặt lại form về defaultValue.",
        code: source("wait", "ProfileForm"),
        render: () => <ProfileForm />,
      },
      {
        title: "Kiểm tra riêng với validate",
        description: "validate nhận FormData, chạy sau ràng buộc của control: hợp cho kiểm tra giữa nhiều ô như xác nhận mật khẩu.",
        code: source("wait", "PasswordForm"),
        render: () => <PasswordForm />,
      },
      {
        title: "react-hook-form + zod",
        description:
          "HookForm nhận kết quả của useForm. standardSchemaResolver dùng schema zod (hoặc valibot, arktype) mà không cần @hookform/resolvers. Field đọc lỗi theo name của register; control dùng Controller thì đặt name trên Field.",
        code: source("rhf-imports", "wait", "inviteSchema", "InviteForm"),
        render: () => <InviteForm />,
      },
    ],
    dos: [
      "Đặt name cho mọi control: Field tìm lỗi theo name, FormData và react-hook-form cũng vậy.",
      "Đặt FormErrorSummary ở đầu form dài để người dùng thấy hết lỗi sau khi gửi.",
      "Kiểm tra lại ở server và trả lỗi theo name; lỗi của cả form dùng một khoá không phải tên control (form).",
    ],
    donts: [
      "Không vô hiệu hoá nút gửi khi form chưa hợp lệ: để người dùng bấm và thấy lỗi cụ thể.",
      "Không truyền validationState / validationMessage cho Field trong Form, trừ khi muốn tự hiện trạng thái khác.",
      "Không lồng form; mỗi Form là một thẻ <form>.",
    ],
    props: [
      {
        name: "action",
        type: "string | (formData: FormData) => FormActionResult | void | Promise<…>",
        description: "Action của React 19 (cả formAction của useActionState) hoặc URL. Trả { errors } để hiện lỗi theo name.",
      },
      { name: "errors", type: "FormErrors", description: "Lỗi theo name, vd. state.errors của useActionState. Ẩn khi control đổi, hiện lại khi giá trị prop đổi." },
      { name: "validate", type: "(formData: FormData) => FormErrors | void", description: "Kiểm tra riêng khi gửi, sau ràng buộc của control; thông báo của nó thắng thông báo ràng buộc cùng name." },
      { name: "noValidate", type: "boolean", defaultValue: "false", description: "Bỏ kiểm tra ràng buộc (validate vẫn chạy). Bong bóng lỗi của trình duyệt không bao giờ hiện." },
      { name: "FormErrorSummary.title", type: "ReactNode", description: "Tiêu đề; mặc định là messages.form.summaryTitle(số lỗi)." },
      { name: "HookForm.form", type: "UseFormReturn", description: "Kết quả của useForm(). HookForm cũng cung cấp nó cho useFormContext()." },
      { name: "HookForm.onSubmit / onInvalid", type: "SubmitHandler / SubmitErrorHandler", description: "Như handleSubmit(onSubmit, onInvalid). Nút gửi loading tới khi onSubmit xong." },
      { name: "standardSchemaResolver(schema)", type: "(schema: StandardSchema) => Resolver", description: "Resolver cho mọi validator theo Standard Schema: lỗi đầu tiên của mỗi trường; lỗi không có path vào errors.root." },
      { name: "Field.name", type: "string", description: "Tên control mà Field đọc lỗi; mặc định là name của control con." },
    ],
  },
];
