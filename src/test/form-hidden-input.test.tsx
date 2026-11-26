import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown/Dropdown";
import { Field } from "@/components/ui/Field/Field";
import { Switch } from "@/components/ui/Switch/Switch";
import { Radio, RadioGroup } from "@/components/ui/RadioGroup/RadioGroup";

/*
 * Trong <form>, Radix Select thêm một input / select ẩn (position: absolute) cạnh control để gửi giá trị theo form. Nó phải có
 * phần tử định vị bao quanh nằm trong component; nếu không, nó thoát khỏi vùng cuộn chứa control và kéo dài trang (#223).
 * jsdom không tính layout: kiểm phần tử định vị gần nhất. Trang /templates được E2E đo thật (e2e/docs-flows.spec.ts).
 */
function positionedParent(el: Element, stop: Element) {
  for (let p = el.parentElement; p && p !== stop; p = p.parentElement) if (p.classList.contains("relative")) return p;
  return null;
}

describe("phần tử ẩn cho <form> nằm trong control", () => {
  it.each([
    [
      "Dropdown trong Field",
      <Field key="d" label="Quốc gia">
        <Dropdown name="country" placeholder="Chọn">
          <DropdownOption value="vn">Việt Nam</DropdownOption>
        </Dropdown>
      </Field>,
      'select[aria-hidden="true"]',
      'button[role="combobox"]',
    ],
  ])("%s", (_, control, hidden, visible) => {
    const { container } = render(<form>{control}</form>);
    const form = container.querySelector("form")!;
    const input = form.querySelector(hidden)!;
    expect(input).not.toBeNull();
    const parent = positionedParent(input, form);
    expect(parent).not.toBeNull();
    expect(parent!.contains(form.querySelector(visible))).toBe(true);
  });
});

describe("Checkbox / Switch / Radio là input gốc (#357)", () => {
  it("không có bản ẩn; giá trị đi thẳng vào FormData", () => {
    const { container } = render(
      <form>
        <Checkbox name="consent" defaultChecked label="Đồng ý" />
        <Switch name="alerts" defaultChecked label="Thông báo" />
        <RadioGroup name="plan" defaultValue="free" aria-label="Gói">
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
        </RadioGroup>
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(form.querySelectorAll('input[aria-hidden="true"]')).toHaveLength(0);
    const data = new FormData(form);
    expect([data.get("consent"), data.get("alerts"), data.get("plan")]).toEqual(["on", "on", "free"]);
  });
});
