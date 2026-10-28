import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown/Dropdown";
import { Field } from "@/components/ui/Field/Field";
import { Switch } from "@/components/ui/Switch/Switch";
import { Radio, RadioGroup } from "@/components/ui/RadioGroup/RadioGroup";

/*
 * Trong <form>, Radix thêm một input / select ẩn (position: absolute) cạnh control để gửi giá trị theo form. Nó phải có
 * phần tử định vị bao quanh nằm trong component; nếu không, nó thoát khỏi vùng cuộn chứa control và kéo dài trang (#223).
 * jsdom không tính layout: kiểm phần tử định vị gần nhất. Trang /templates được E2E đo thật (e2e/docs-flows.spec.ts).
 */
function positionedParent(el: Element, stop: Element) {
  for (let p = el.parentElement; p && p !== stop; p = p.parentElement) if (p.classList.contains("relative")) return p;
  return null;
}

describe("phần tử ẩn cho <form> nằm trong control", () => {
  it.each([
    ["Checkbox", <Checkbox key="c" name="consent" label="Đồng ý" />, 'input[type="checkbox"][aria-hidden="true"]', "button"],
    ["Switch", <Switch key="s" name="alerts" label="Thông báo" />, 'input[type="checkbox"][aria-hidden="true"]', "button"],
    [
      "Radio",
      <RadioGroup key="r" name="plan" aria-label="Gói">
        <Radio value="free" label="Free" />
      </RadioGroup>,
      'input[type="radio"][aria-hidden="true"]',
      "button",
    ],
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
