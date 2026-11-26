import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Controller, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Field } from "../Field/Field";
import { FormErrorSummary } from "../Form/Form";
import { Input } from "../Input/Input";
import { HookForm, standardSchemaResolver, type StandardSchema } from "./HookForm";

const schema = z.object({
  name: z.string().trim().min(2, "Tên cần ít nhất 2 ký tự."),
  email: z.string().pipe(z.email("Email không hợp lệ.")),
  terms: z.boolean().refine((accepted) => accepted, "Hãy đồng ý điều khoản."),
});

function SignUp({ onSubmit }: { onSubmit: (values: z.output<typeof schema>) => unknown }) {
  const form = useForm({ resolver: standardSchemaResolver(schema), defaultValues: { name: "", email: "", terms: false } });
  return (
    <HookForm form={form} onSubmit={onSubmit} aria-label="Đăng ký">
      <FormErrorSummary />
      <Field label="Họ tên" required>
        <Input {...form.register("name")} />
      </Field>
      <Field label="Email" required>
        <Input type="email" {...form.register("email")} />
      </Field>
      <Controller
        control={form.control}
        name="terms"
        render={({ field }) => (
          <Field name="terms">
            <Checkbox ref={field.ref} label="Tôi đồng ý" checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />
          </Field>
        )}
      />
      <Button type="submit">Tạo tài khoản</Button>
    </HookForm>
  );
}

const input = (name: RegExp) => screen.getByRole("textbox", { name });

describe("HookForm", () => {
  it("standardSchemaResolver (zod 4): lỗi của schema trong Field theo name, tóm tắt, focus ô lỗi đầu tiên", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SignUp onSubmit={onSubmit} />);
    await user.type(input(/Email/), "x");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await waitFor(() => expect(input(/Họ tên/)).toHaveAccessibleDescription("Tên cần ít nhất 2 ký tự."));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input(/Email/)).toHaveAccessibleDescription("Email không hợp lệ.");
    expect(screen.getByRole("checkbox", { name: "Tôi đồng ý" })).toHaveAccessibleDescription("Hãy đồng ý điều khoản.");
    expect(input(/Họ tên/)).toHaveFocus();
    const summary = screen.getByRole("group", { name: "Có 3 lỗi cần sửa" });
    const links = Array.from(summary.querySelectorAll("a"));
    expect(links.map((a) => a.textContent)).toEqual(["Họ tên: Tên cần ít nhất 2 ký tự.", "Email: Email không hợp lệ.", "Tôi đồng ý: Hãy đồng ý điều khoản."]);
    await user.click(links[2]);
    expect(screen.getByRole("checkbox", { name: "Tôi đồng ý" })).toHaveFocus();
  });

  it("gửi hợp lệ: giá trị đã qua schema, nút gửi loading trong lúc onSubmit chạy", async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const onSubmit = vi.fn((_values: z.output<typeof schema>) => new Promise<void>((resolve) => (finish = resolve)));
    render(<SignUp onSubmit={onSubmit} />);
    await user.type(input(/Họ tên/), "  An  ");
    await user.type(input(/Email/), "an@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: "An", email: "an@example.com", terms: true });
    const submit = screen.getByRole("button", { name: "Tạo tài khoản" });
    expect(submit).toHaveAttribute("aria-busy", "true");
    await act(async () => finish());
    expect(submit).not.toHaveAttribute("aria-busy");
    expect(screen.queryByRole("group", { name: /lỗi/ })).not.toBeInTheDocument();
  });

  it("quy tắc của register không có thông báo: chuỗi của messages.form; setError root vào tóm tắt, không link", async () => {
    const user = userEvent.setup();
    function Rules() {
      const form = useForm({ defaultValues: { code: "", age: "" } });
      return (
        <HookForm
          form={form}
          onSubmit={() => form.setError("root.server", { message: "Máy chủ đang bận." })}
        >
          <FormErrorSummary />
          <Field label="Mã">
            <Input {...form.register("code", { required: true, minLength: { value: 4, message: "" } })} />
          </Field>
          <Field label="Tuổi">
            <Input type="number" {...form.register("age", { min: 18 })} />
          </Field>
          <Button type="submit">Lưu</Button>
        </HookForm>
      );
    }
    render(<Rules />);
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(input(/Mã/)).toHaveAccessibleDescription("Hãy điền mục này."));
    await user.type(input(/Mã/), "ab");
    await user.type(screen.getByRole("spinbutton", { name: "Tuổi" }), "12");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(input(/Mã/)).toHaveAccessibleDescription("Nhập ít nhất 4 ký tự (hiện có 2)."));
    expect(screen.getByRole("spinbutton", { name: "Tuổi" })).toHaveAccessibleDescription("Nhập giá trị từ 18 trở lên.");

    await user.type(input(/Mã/), "cd");
    await user.clear(screen.getByRole("spinbutton", { name: "Tuổi" }));
    await user.type(screen.getByRole("spinbutton", { name: "Tuổi" }), "20");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    const summary = await screen.findByRole("group", { name: "Có 1 lỗi cần sửa" });
    expect(summary).toHaveTextContent("Máy chủ đang bận.");
    expect(summary.querySelector("a")).toBeNull();
  });

  it("quy tắc maxLength, max, pattern, validate không có thông báo", async () => {
    const user = userEvent.setup();
    function Rules() {
      const form = useForm({ defaultValues: { code: "abcdef", qty: "9", zip: "12", nick: "x" } });
      return (
        <HookForm form={form} onSubmit={() => {}}>
          <Field label="Mã">
            <Input {...form.register("code", { maxLength: 4 })} />
          </Field>
          <Field label="Số lượng">
            <Input type="number" {...form.register("qty", { max: { value: 5, message: "" } })} />
          </Field>
          <Field label="Mã bưu chính">
            <Input {...form.register("zip", { pattern: /^\d{5}$/ })} />
          </Field>
          <Field label="Biệt danh">
            <Input {...form.register("nick", { validate: (value) => value.length > 1 })} />
          </Field>
          <Button type="submit">Lưu</Button>
        </HookForm>
      );
    }
    render(<Rules />);
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(input(/^Mã$/)).toHaveAccessibleDescription("Nhập tối đa 4 ký tự (hiện có 6)."));
    expect(screen.getByRole("spinbutton", { name: "Số lượng" })).toHaveAccessibleDescription("Nhập giá trị không quá 5.");
    expect(input(/Mã bưu chính/)).toHaveAccessibleDescription("Nhập đúng định dạng được yêu cầu.");
    expect(input(/Biệt danh/)).toHaveAccessibleDescription("Giá trị không hợp lệ.");
  });

  it("đường dẫn lồng nhau (field array) và useFormContext trong con", async () => {
    const user = userEvent.setup();
    const listSchema = z.object({ items: z.array(z.object({ title: z.string().min(1, "Nhập tiêu đề.") })) });
    function Items() {
      const { control, register } = useFormContext<z.input<typeof listSchema>>();
      const { fields } = useFieldArray({ control, name: "items" });
      return fields.map((item, index) => (
        <Field key={item.id} label={`Tiêu đề ${index + 1}`}>
          <Input {...register(`items.${index}.title`)} />
        </Field>
      ));
    }
    function List() {
      const form = useForm({ resolver: standardSchemaResolver(listSchema), defaultValues: { items: [{ title: "a" }, { title: "" }] } });
      return (
        <HookForm form={form} onSubmit={() => {}}>
          <Items />
          <Button type="submit">Lưu</Button>
        </HookForm>
      );
    }
    render(<List />);
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(input(/Tiêu đề 2/)).toHaveAccessibleDescription("Nhập tiêu đề."));
    expect(input(/Tiêu đề 1/)).not.toHaveAttribute("aria-invalid");
    expect(input(/Tiêu đề 2/)).toHaveFocus();
  });

  it("standardSchemaResolver nhận mọi validator theo Standard Schema (path dạng { key }, lỗi không path → root)", async () => {
    const custom: StandardSchema<{ a: string }, { a: number }> = {
      "~standard": {
        version: 1,
        vendor: "test",
        validate: (value) => {
          const a = (value as { a: string }).a;
          if (a === "") return { issues: [{ message: "Thiếu a", path: [{ key: "a" }] }, { message: "Sai cả form" }] };
          return { value: { a: Number(a) } };
        },
      },
    };
    const resolver = standardSchemaResolver(custom);
    const options = { fields: {}, shouldUseNativeValidation: false };
    expect(await resolver({ a: "" }, undefined, options)).toEqual({
      values: {},
      errors: { a: { type: "validate", message: "Thiếu a" }, root: { type: "validate", message: "Sai cả form" } },
    });
    expect(await resolver({ a: "2" }, undefined, options)).toEqual({ values: { a: 2 }, errors: {} });
  });
});
