import { describe, expect, it, vi } from "vitest";
import { createRef, Profiler } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox, comboboxMessagesEn, normalizeSearchText, type ComboboxProps } from "./Combobox";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Field } from "../Field/Field";
import { messagesEn } from "../messages-en";

const CITIES = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế", { value: "Cần Thơ", disabled: true }];

function setup(props: Partial<ComboboxProps> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <>
      <label htmlFor="city">Thành phố</label>
      <Combobox id="city" options={CITIES} placeholder="Chọn thành phố" onValueChange={onValueChange} {...(props as object)} />
    </>,
  );
  const input = screen.getByRole("combobox", { name: "Thành phố" });
  const optionNames = () => screen.queryAllByRole("option").map((o) => o.textContent);
  const active = () => {
    const id = input.getAttribute("aria-activedescendant");
    return id ? document.getElementById(id)?.textContent : null;
  };
  return { user, input, onValueChange, optionNames, active };
}

describe("normalizeSearchText", () => {
  it("bỏ dấu tiếng Việt, đ → d, chữ thường, cắt khoảng trắng", () => {
    expect(normalizeSearchText("  Đà Nẵng ")).toBe("da nang");
    expect(normalizeSearchText("HỒ CHÍ MINH")).toBe("ho chi minh");
    expect(normalizeSearchText("Huế")).toBe("hue");
  });
});

describe("Combobox", () => {
  it("ARIA ban đầu: combobox đóng, không có listbox", () => {
    const { input } = setup();
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("ArrowDown mở danh sách, highlight mục đầu; mũi tên di chuyển (bỏ qua disabled, vòng quanh)", async () => {
    const { user, input, optionNames, active } = setup();
    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
    expect(optionNames()).toEqual(["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế", "Cần Thơ"]);
    await waitFor(() => expect(active()).toBe("Hà Nội"));

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Hồ Chí Minh");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Huế");
    // Cần Thơ disabled → vòng về đầu.
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Hà Nội");
    await user.keyboard("{ArrowUp}");
    expect(active()).toBe("Huế");
  });

  it("gõ để lọc (không dấu khớp có dấu), Enter chọn mục đang highlight", async () => {
    const { user, input, optionNames, active, onValueChange } = setup();
    await user.click(input);
    await user.keyboard("da");
    expect(optionNames()).toEqual(["Đà Nẵng"]);
    expect(active()).toBe("Đà Nẵng");

    await user.clear(input);
    await user.keyboard("h");
    expect(optionNames()).toEqual(["Hà Nội", "Hồ Chí Minh", "Huế", "Cần Thơ"]);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("Hồ Chí Minh");
    expect(input).toHaveValue("Hồ Chí Minh");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(input).toHaveFocus();
  });

  it("không có kết quả → thông báo trống", async () => {
    const { user, input, optionNames } = setup();
    await user.click(input);
    await user.keyboard("xyz");
    expect(optionNames()).toEqual([]);
    expect(screen.getByText("Không tìm thấy kết quả")).toBeInTheDocument();
  });

  it("Escape đóng danh sách, trả lại nhãn đã chọn (bỏ chữ đang gõ)", async () => {
    const { user, input, onValueChange } = setup({ defaultValue: "Huế" });
    expect(input).toHaveValue("Huế");
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}ha");
    expect(input).toHaveValue("ha");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Huế");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("mở lại → highlight mục đang chọn", async () => {
    const { user, input, active } = setup({ defaultValue: "Đà Nẵng" });
    input.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(active()).toBe("Đà Nẵng"));
    expect(screen.getByRole("option", { name: "Đà Nẵng" })).toHaveAttribute("aria-selected", "true");
  });

  it("click option chọn giá trị", async () => {
    const { user, input, onValueChange } = setup();
    await user.click(screen.getByRole("button", { name: "Mở danh sách" }));
    await user.click(await screen.findByRole("option", { name: "Huế" }));
    expect(onValueChange).toHaveBeenLastCalledWith("Huế");
    expect(input).toHaveValue("Huế");
  });

  it("freeform: Enter giữ chữ tự gõ không khớp option", async () => {
    const { user, input, onValueChange } = setup({ freeform: true });
    await user.click(input);
    await user.keyboard("Vũng Tàu");
    expect(screen.getByText("Nhấn Enter để dùng “Vũng Tàu”")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("Vũng Tàu");
    expect(input).toHaveValue("Vũng Tàu");
  });

  it("multiselect: Enter bật/tắt từng mục, danh sách vẫn mở", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Thành phố" multiselect options={CITIES} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Thành phố" });
    input.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["Hà Nội"]);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["Hà Nội", "Hồ Chí Minh"]);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Hồ Chí Minh" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["Hà Nội"]);
  });

  it("disabled: không mở được", async () => {
    const { user, input } = setup({ disabled: true });
    expect(input).toBeDisabled();
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("Home / End để con trỏ đi trong ô nhập: không chặn mặc định, không lên phần tử cha, không đổi highlight", async () => {
    const user = userEvent.setup();
    const onParentKeyDown = vi.fn();
    render(
      <div onKeyDown={onParentKeyDown}>
        <Combobox aria-label="Thành phố" options={CITIES} />
      </div>,
    );
    const input = screen.getByRole("combobox", { name: "Thành phố" });
    input.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}");
    const active = () => document.getElementById(input.getAttribute("aria-activedescendant")!)?.textContent;
    expect(active()).toBe("Hồ Chí Minh");
    onParentKeyDown.mockClear();
    expect(fireEvent.keyDown(input, { key: "Home" })).toBe(true);
    expect(fireEvent.keyDown(input, { key: "End" })).toBe(true);
    expect(onParentKeyDown).not.toHaveBeenCalled();
    expect(active()).toBe("Hồ Chí Minh");
  });

  it("freeform: đóng danh sách giữ chữ đã gõ (khớp nhãn thì lấy option), xoá hết thì bỏ chọn", async () => {
    const { user, input, onValueChange } = setup({ freeform: true, defaultValue: "Huế" });
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}da nang{Escape}");
    expect(onValueChange).toHaveBeenLastCalledWith("Đà Nẵng");
    expect(input).toHaveValue("Đà Nẵng");
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}{Backspace}{Escape}");
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(input).toHaveValue("");
  });

  it("freeform + multiselect: Enter thêm chữ tự gõ (không trùng), ô nhập trống lại, danh sách vẫn mở", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Thành phố" multiselect freeform options={CITIES} defaultValue={["Huế"]} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Thành phố" });
    await user.click(input);
    await user.keyboard("Vũng Tàu{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["Huế", "Vũng Tàu"]);
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("Vũng Tàu{Enter}");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("");
  });

  it("gõ khi danh sách đã đóng thì mở lại", async () => {
    const { user, input } = setup();
    await user.click(input);
    await screen.findByRole("listbox");
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("Hà Nội");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Backspace}");
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("bấm lại vào ô nhập không đóng danh sách; nút mũi tên đóng", async () => {
    const { user, input } = setup();
    const toggle = screen.getByRole("button", { name: "Mở danh sách" });
    await user.click(input);
    await screen.findByRole("listbox");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-label", "Đóng danh sách");
    await user.click(toggle);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("ref trỏ tới ô nhập", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Combobox ref={ref} aria-label="Thành phố" options={CITIES} />);
    expect(ref.current).toBe(screen.getByRole("combobox", { name: "Thành phố" }));
  });
});

describe("Combobox listbox", () => {
  // Thứ tự vẽ: Miền Bắc (Hà Nội, Hải Phòng) · Miền Trung (Đà Nẵng, Huế disabled) · Khác (không nhóm) · Miền Nam.
  const GROUPED = [
    { value: "hn", label: "Hà Nội", group: "Miền Bắc" },
    { value: "dn", label: "Đà Nẵng", group: "Miền Trung" },
    { value: "hp", label: "Hải Phòng", group: "Miền Bắc" },
    { value: "hue", label: "Huế", group: "Miền Trung", disabled: true },
    { value: "khac", label: "Khác" },
    { value: "hcm", label: "Hồ Chí Minh", group: "Miền Nam" },
  ];

  function open(props: Partial<ComboboxProps> = {}) {
    const onRender = vi.fn();
    const utils = render(
      <Profiler id="combobox" onRender={onRender}>
        <Combobox aria-label="Thành phố" options={GROUPED} {...(props as object)} />
      </Profiler>,
    );
    const input = screen.getByRole("combobox", { name: "Thành phố" });
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const active = () => {
      const id = input.getAttribute("aria-activedescendant");
      return id ? document.getElementById(id)?.textContent : null;
    };
    const press = (key: string, init: object = {}) => fireEvent.keyDown(input, { key, ...init });
    return { ...utils, input, active, press, onRender };
  }

  it("nhóm có tiêu đề (role=group), option không nhóm nằm thẳng trong listbox", () => {
    open();
    const groups = screen.getAllByRole("group");
    expect(groups.map((g) => document.getElementById(g.getAttribute("aria-labelledby")!)?.textContent)).toEqual([
      "Miền Bắc",
      "Miền Trung",
      "Miền Nam",
    ]);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Hà Nội", "Hải Phòng", "Đà Nẵng", "Huế", "Khác", "Hồ Chí Minh"]);
    expect(screen.getByRole("option", { name: "Khác" }).parentElement).toBe(screen.getByRole("listbox"));
    expect(screen.getByRole("option", { name: "Huế" })).toHaveAttribute("aria-disabled", "true");
  });

  it("Alt + mũi tên nhảy nhóm có tên; ⌘ + mũi tên về đầu / cuối", () => {
    const { active, press } = open();
    expect(active()).toBe("Hà Nội");
    press("ArrowDown", { altKey: true });
    expect(active()).toBe("Đà Nẵng");
    // Bỏ qua option không nhóm, sang Miền Nam.
    press("ArrowDown", { altKey: true });
    expect(active()).toBe("Hồ Chí Minh");
    // Hết nhóm: như mũi tên thường (vòng về đầu).
    press("ArrowDown", { altKey: true });
    expect(active()).toBe("Hà Nội");
    press("ArrowUp", { altKey: true });
    expect(active()).toBe("Hồ Chí Minh");
    press("ArrowUp", { altKey: true });
    expect(active()).toBe("Đà Nẵng");
    press("ArrowDown");
    expect(active()).toBe("Khác");
    press("ArrowDown", { altKey: true });
    expect(active()).toBe("Hồ Chí Minh");
    press("ArrowUp", { metaKey: true });
    expect(active()).toBe("Hà Nội");
    press("ArrowDown", { metaKey: true });
    expect(active()).toBe("Hồ Chí Minh");
  });

  it("đang gõ IME: mũi tên / Enter không đổi highlight, không chọn", () => {
    const onValueChange = vi.fn();
    const { active, press } = open({ onValueChange });
    press("ArrowDown", { isComposing: true });
    press("Enter", { keyCode: 229 });
    expect(active()).toBe("Hà Nội");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("Enter khi danh sách đóng: chặn mặc định (không submit form), không chọn gì", () => {
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Thành phố" options={GROUPED} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Thành phố" });
    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("mỗi phím mũi tên chỉ một lượt commit; option đầu nhóm kéo theo tiêu đề vào tầm nhìn", () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    const { press, onRender } = open();
    // Lúc mở: tiêu đề Miền Bắc rồi Hà Nội.
    expect(scroll.mock.contexts.map((el) => (el as Element).textContent)).toEqual(["Miền Bắc", "Hà Nội"]);
    scroll.mockClear();
    onRender.mockClear();
    press("ArrowDown");
    expect(onRender).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts.map((el) => (el as Element).textContent)).toEqual(["Hải Phòng"]);
    scroll.mockClear();
    press("ArrowDown");
    expect(scroll.mock.contexts.map((el) => (el as Element).textContent)).toEqual(["Miền Trung", "Đà Nẵng"]);
    // Option không nhóm đứng sau nhóm Miền Trung: chỉ cuộn chính nó, không kéo cả nhóm trước.
    scroll.mockClear();
    press("ArrowDown");
    expect(scroll.mock.contexts.map((el) => (el as Element).textContent)).toEqual(["Khác"]);
    scroll.mockClear();
    press("ArrowDown");
    expect(scroll.mock.contexts.map((el) => (el as Element).textContent)).toEqual(["Miền Nam", "Hồ Chí Minh"]);
  });

  it("option đang highlight biến mất (options đổi khi đang mở) → highlight option bật đầu tiên", () => {
    const { active, press, rerender } = open();
    press("ArrowUp");
    expect(active()).toBe("Hồ Chí Minh");
    rerender(
      <Profiler id="combobox" onRender={() => {}}>
        <Combobox aria-label="Thành phố" options={GROUPED.slice(1, 5)} />
      </Profiler>,
    );
    expect(active()).toBe("Đà Nẵng");
  });

  it("rê chuột đổi highlight, không cần commit khi rê trên option đang highlight", () => {
    const { active, onRender } = open();
    fireEvent.pointerMove(screen.getByRole("option", { name: "Khác" }));
    expect(active()).toBe("Khác");
    onRender.mockClear();
    fireEvent.pointerMove(screen.getByRole("option", { name: "Khác" }));
    fireEvent.pointerMove(screen.getByRole("option", { name: "Huế" }));
    expect(onRender).not.toHaveBeenCalled();
    expect(active()).toBe("Khác");
  });
});

describe("Combobox messages", () => {
  it("comboboxMessagesEn đổi nhãn nút và câu không có kết quả", async () => {
    const user = userEvent.setup();
    render(
      <YugenProvider messages={{ combobox: comboboxMessagesEn }}>
        <Combobox aria-label="City" options={CITIES} />
      </YugenProvider>,
    );
    await user.type(screen.getByRole("combobox", { name: "City" }), "zzz");
    expect(await screen.findByText("No results found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close list", hidden: true })).toBeInTheDocument();
  });
});

describe("Combobox: tên của listbox", () => {
  // Bộ test mặc định chạy trong messagesVi; bản tiếng Anh bọc provider riêng.
  const LANGS = [
    ["vi", undefined, "Gợi ý"],
    ["en", messagesEn, "Suggestions"],
  ] as const;

  async function openListbox(ui: React.ReactElement, messages?: typeof messagesEn) {
    const user = userEvent.setup();
    render(messages ? <YugenProvider messages={messages} locale="en-US">{ui}</YugenProvider> : ui);
    await user.click(screen.getByRole("combobox"));
    return screen.findByRole("listbox");
  }

  it.each(LANGS)("nhãn của Field (%s): aria-labelledby trỏ tới nhãn", async (_, messages) => {
    const listbox = await openListbox(
      <Field label="Thành phố">
        <Combobox options={CITIES} />
      </Field>,
      messages,
    );
    expect(listbox).toHaveAccessibleName("Thành phố");
    expect(listbox).toHaveAttribute("aria-labelledby", screen.getByText("Thành phố").id);
    expect(listbox).not.toHaveAttribute("aria-label");
  });

  it.each(LANGS)("chỉ có aria-label trên ô nhập (%s): tên có sẵn trong messages", async (_, messages, name) => {
    const listbox = await openListbox(<Combobox aria-label="Thành phố" options={CITIES} />, messages);
    expect(listbox).toHaveAccessibleName(name);
    expect(listbox).not.toHaveAttribute("aria-labelledby");
  });

  it.each(LANGS)("không có nhãn (%s): tên có sẵn trong messages", async (_, messages, name) => {
    const listbox = await openListbox(<Combobox options={CITIES} />, messages);
    expect(listbox).toHaveAccessibleName(name);
  });
});
