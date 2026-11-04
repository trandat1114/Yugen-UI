import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagPicker } from "./TagPicker";
import { Field } from "../Field/Field";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { renderOnServer } from "@/test/serverRender";
import { captureConsole } from "@/test/consoleCapture";

const OPTIONS = [
  { value: "tao", label: "Táo" },
  { value: "cam", label: "Cam" },
  { value: "le", label: "Lê" },
];

function Picker({ onValueChange, reorderable = true }: { onValueChange?: (v: string[]) => void; reorderable?: boolean }) {
  const [value, setValue] = useState(["tao", "cam", "le"]);
  return (
    <TagPicker
      aria-label="Trái cây"
      options={OPTIONS}
      value={value}
      reorderable={reorderable}
      onValueChange={(v) => {
        setValue(v);
        onValueChange?.(v);
      }}
    />
  );
}

const tags = () => Array.from(document.querySelectorAll("[data-tag]")).map((t) => t.textContent?.split(",")[0]);
const tag = (label: string) => screen.getAllByRole("button").find((b) => b.textContent?.startsWith(label))!;
/** Sortable nạp lúc cần: đợi tag nhận hành vi kéo. */
const sortableReady = () => waitFor(() => expect(document.querySelector("[data-sortable-list]")).not.toBeNull());

describe("TagPicker reorderable", () => {
  it("Alt + mũi tên đổi thứ tự tag, focus ở lại tag; Delete vẫn gỡ tag", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Picker onValueChange={onValueChange} />);
    await sortableReady();
    tag("Táo").focus();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onValueChange).toHaveBeenLastCalledWith(["cam", "tao", "le"]);
    expect(tag("Táo")).toHaveFocus();
    expect(tags()).toEqual(["Cam", "Táo", "Lê"]);

    // Alt + → ở tag cuối: không nhảy vào ô nhập.
    await user.keyboard("{Alt>}{ArrowRight}{ArrowRight}{/Alt}");
    expect(onValueChange).toHaveBeenLastCalledWith(["cam", "le", "tao"]);
    expect(tag("Táo")).toHaveFocus();

    await user.keyboard("{Delete}");
    expect(onValueChange).toHaveBeenLastCalledWith(["cam", "le"]);
  });

  it("không reorderable: Alt + mũi tên chỉ di chuyển focus như thường", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Picker onValueChange={onValueChange} reorderable={false} />);
    tag("Táo").focus();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(tag("Cam")).toHaveFocus();
    expect(document.querySelector("[data-sortable-item]")).toBeNull();
  });

  it("server và lượt hydrate vẽ tag thường (kể cả khi Sortable đã nạp sẵn), Sortable gắn vào sau", async () => {
    // Một TagPicker reorderable khác đã nạp Sortable vào cache của module.
    const first = render(<Picker />);
    await sortableReady();
    first.unmount();

    const html = renderOnServer(<Picker />);
    expect(html).not.toContain("data-sortable");
    expect(html).toContain("Táo");
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const recoverable: unknown[] = [];
    const logged = captureConsole();
    let root!: Root;
    try {
      await act(async () => {
        root = hydrateRoot(container, <Picker />, { onRecoverableError: (error) => recoverable.push(error) });
      });
    } finally {
      logged.restore();
    }
    expect(recoverable).toEqual([]);
    expect(logged.errors).toEqual([]);
    expect(Array.from(container.querySelectorAll("[data-tag]")).map((t) => t.textContent?.split(",")[0])).toEqual(["Táo", "Cam", "Lê"]);
    expect(container.querySelectorAll("[data-sortable-item]")).toHaveLength(3);
    act(() => root.unmount());
    container.remove();
  });
});

describe("TagPicker listbox", () => {
  const GROUPED = [
    { value: "tao", label: "Táo", group: "Quả" },
    { value: "cai", label: "Cải", group: "Rau", secondaryText: "Rau lá" },
    { value: "cam", label: "Cam", group: "Quả", disabled: true },
    { value: "le", label: "Lê", group: "Quả" },
  ];

  function setup(props: Partial<React.ComponentProps<typeof TagPicker>> = {}) {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagPicker aria-label="Thực phẩm" options={GROUPED} onValueChange={onValueChange} {...props} />);
    const input = screen.getByRole("combobox", { name: "Thực phẩm" });
    const active = () => {
      const id = input.getAttribute("aria-activedescendant");
      return id ? document.getElementById(id)?.textContent : null;
    };
    return { user, input, onValueChange, active };
  }

  it("nhóm theo thứ tự xuất hiện, mũi tên bỏ qua option disabled, Enter thêm tag và highlight mục còn lại", async () => {
    const { user, input, onValueChange, active } = setup();
    input.focus();
    await user.keyboard("{ArrowDown}");
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("group").map((g) => g.getAttribute("aria-labelledby") && document.getElementById(g.getAttribute("aria-labelledby")!)?.textContent)).toEqual(["Quả", "Rau"]);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Táo", "Cam", "Lê", "CảiRau lá"]);
    expect(screen.getByRole("option", { name: "Cam" })).toHaveAttribute("data-disabled", "true");
    expect(active()).toBe("Táo");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Lê");
    expect(screen.getByRole("option", { name: "Lê" })).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("option", { name: "Táo" })).toHaveAttribute("data-selected", "false");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["le"]);
    expect(screen.queryByRole("option", { name: "Lê" })).not.toBeInTheDocument();
    expect(active()).toBe("Táo");
  });

  it("rê chuột đổi highlight, bấm option thêm tag; hết option → thông báo trống", async () => {
    const { user, input, onValueChange, active } = setup({ defaultValue: ["cai"] });
    await user.click(input);
    await user.pointer({ target: screen.getByRole("option", { name: "Lê" }) });
    expect(active()).toBe("Lê");
    await user.click(screen.getByRole("option", { name: "Lê" }));
    await user.click(screen.getByRole("option", { name: "Táo" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["cai", "le", "tao"]);
    // Chỉ còn Cam (disabled): không có highlight, bấm không thêm.
    expect(active()).toBeNull();
    await user.click(screen.getByRole("option", { name: "Cam" }));
    expect(onValueChange).toHaveBeenCalledTimes(2);
    await user.keyboard("xyz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Không tìm thấy kết quả")).toBeInTheDocument();
  });

  it("freeform: Enter thêm chữ tự gõ khi không khớp option", async () => {
    const { user, input, onValueChange } = setup({ freeform: true });
    await user.click(input);
    await user.keyboard("Nho{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["Nho"]);
    expect(input).toHaveValue("");
  });
});

describe("TagPicker: tên của listbox", () => {
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
      <Field label="Trái cây">
        <TagPicker options={OPTIONS} />
      </Field>,
      messages,
    );
    expect(listbox).toHaveAccessibleName("Trái cây");
    expect(listbox).toHaveAttribute("aria-labelledby", screen.getByText("Trái cây").id);
    expect(listbox).not.toHaveAttribute("aria-label");
  });

  it.each(LANGS)("chỉ có aria-label trên ô nhập (%s): listbox dùng lại tên đó", async (_, messages) => {
    const listbox = await openListbox(<TagPicker aria-label="Trái cây" options={OPTIONS} />, messages);
    expect(listbox).toHaveAccessibleName("Trái cây");
    expect(listbox).not.toHaveAttribute("aria-labelledby");
  });

  it.each(LANGS)("không có nhãn (%s): tên có sẵn trong messages", async (_, messages, name) => {
    const listbox = await openListbox(<TagPicker options={OPTIONS} />, messages);
    expect(listbox).toHaveAccessibleName(name);
  });
});
