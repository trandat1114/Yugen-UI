import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DirectionProvider } from "@radix-ui/react-direction";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { InteractionTag, Tag, TagGroup, tagMessagesVi } from "./Tag";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

describe("Tag", () => {
  it("không dismissible: span tĩnh; ref + className; icon / media / secondaryText", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Tag ref={ref} className="me-1" icon={<svg data-testid="icon" />} media={<span data-testid="media" />} secondaryText="Nhóm A">
        Thiết kế
      </Tag>,
    );
    const tag = ref.current!;
    expect(tag.tagName).toBe("SPAN");
    expect(tag).toHaveClass("me-1", "bg-background-3", "h-8", "rounded-medium", "ps-1");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByTestId("media")).toBeInTheDocument();
    expect(screen.getByText("Nhóm A")).toHaveClass("text-caption2");
  });

  it("dismissible: thành nút, tên có mô tả gỡ; bấm / Delete / Backspace gọi onDismiss kèm value", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Tag dismissible value="ui" onDismiss={onDismiss}>
        Giao diện
      </Tag>,
    );
    const button = screen.getByRole("button", { name: "Giao diện, Gỡ" });
    await user.click(button);
    expect(onDismiss).toHaveBeenLastCalledWith(expect.anything(), "ui");
    await user.keyboard("{Delete}");
    await user.keyboard("{Backspace}");
    await user.keyboard("{Enter}");
    expect(onDismiss).toHaveBeenCalledTimes(4);
    await user.keyboard("a");
    expect(onDismiss).toHaveBeenCalledTimes(4);
  });

  it("dismissible: onClick / onKeyDown preventDefault chặn gỡ; disabled", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { rerender } = render(
      <Tag dismissible onDismiss={onDismiss} onClick={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()}>
        Khoá
      </Tag>,
    );
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Delete}");
    expect(onDismiss).not.toHaveBeenCalled();
    rerender(
      <Tag dismissible disabled appearance="outline" onDismiss={onDismiss}>
        Khoá
      </Tag>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveClass("border-stroke-disabled", "bg-transparent");
  });

  it("appearance / size / shape", () => {
    render(
      <>
        <Tag appearance="brand" size="extra-small" shape="circular" data-testid="a">
          A
        </Tag>
        <Tag appearance="outline" size="small" disabled data-testid="b">
          B
        </Tag>
      </>,
    );
    expect(screen.getByTestId("a")).toHaveClass("bg-brand-background-2", "h-5", "rounded-circular");
    expect(screen.getByTestId("b")).toHaveClass("h-6", "border-stroke-disabled");
    expect(screen.getByTestId("b")).toHaveAttribute("aria-disabled", "true");
  });
});

describe("InteractionTag", () => {
  it("nút chính + nút X riêng có nhãn theo tên tag", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <InteractionTag ref={ref} value="react" dismissible onClick={onClick} onDismiss={onDismiss} className="me-2">
        React
      </InteractionTag>,
    );
    const main = screen.getByRole("button", { name: "React" });
    expect(ref.current).toBe(main);
    expect(main.parentElement).toHaveClass("me-2");
    expect(main).toHaveClass("rounded-e-none");
    await user.click(main);
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Gỡ React" }));
    expect(onDismiss).toHaveBeenCalledWith(expect.anything(), "react");
  });

  it("nhãn không phải chuỗi dùng nhãn chung; dismissLabel ghi đè; disabled tắt cả hai nút", () => {
    const { rerender } = render(
      <InteractionTag dismissible>
        <b>Đậm</b>
      </InteractionTag>,
    );
    expect(screen.getByRole("button", { name: "Gỡ" })).toBeInTheDocument();
    rerender(
      <InteractionTag dismissible dismissLabel="Bỏ chọn" disabled appearance="brand">
        Vue
      </InteractionTag>,
    );
    expect(screen.getByRole("button", { name: "Bỏ chọn" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Vue" })).toBeDisabled();
  });

  it("chuỗi gỡ: tiếng Anh mặc định, tiếng Việt qua tagMessagesVi", () => {
    const { unmount } = renderBare(
      <>
        <InteractionTag dismissible>Svelte</InteractionTag>
        <Tag dismissible>Solid</Tag>
      </>,
    );
    expect(screen.getByRole("button", { name: "Remove Svelte" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Solid, Remove" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ tag: tagMessagesVi }}>
        <InteractionTag dismissible>Svelte</InteractionTag>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Gỡ Svelte" })).toBeInTheDocument();
  });
});

describe("TagGroup", () => {
  function Removable({ onDismiss }: { onDismiss?: (value: string) => void }) {
    const [tags, setTags] = React.useState(["Táo", "Cam", "Lê"]);
    return (
      <TagGroup
        aria-label="Trái cây"
        size="small"
        appearance="outline"
        onDismiss={(value) => {
          onDismiss?.(value);
          setTags((all) => all.filter((t) => t !== value));
        }}
      >
        {tags.map((t) => (
          <Tag key={t} value={t} dismissible>
            {t}
          </Tag>
        ))}
      </TagGroup>
    );
  }

  const tag = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name}`) });

  it("onDismiss → role toolbar; size / appearance của nhóm áp cho tag; gỡ thì focus sang tag kế bên", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Removable onDismiss={onDismiss} />);
    const group = screen.getByRole("toolbar", { name: "Trái cây" });
    expect(group).toHaveClass("gap-1.5");
    expect(tag("Táo")).toHaveClass("h-6", "border-stroke-1");
    await user.click(tag("Cam"));
    expect(onDismiss).toHaveBeenCalledWith("Cam");
    await waitFor(() => expect(tag("Lê")).toHaveFocus());
    // Gỡ tag cuối: focus lùi về tag trước.
    await user.keyboard("{Delete}");
    await waitFor(() => expect(tag("Táo")).toHaveFocus());
  });

  it("←/→/Home/End đi giữa các tag; RTL đảo chiều", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Removable />);
    tag("Táo").focus();
    await user.keyboard("{ArrowRight}");
    expect(tag("Cam")).toHaveFocus();
    await user.keyboard("{End}");
    expect(tag("Lê")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(tag("Lê")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(tag("Táo")).toHaveFocus();
    unmount();

    render(
      <DirectionProvider dir="rtl">
        <Removable />
      </DirectionProvider>,
    );
    tag("Táo").focus();
    await user.keyboard("{ArrowLeft}");
    expect(tag("Cam")).toHaveFocus();
  });

  it("không có onDismiss: không có role; disabled của nhóm tắt mọi tag; prop của tag thắng nhóm", () => {
    render(
      <TagGroup disabled appearance="brand" data-testid="group">
        <Tag dismissible>A</Tag>
        <Tag appearance="filled" data-testid="b">
          B
        </Tag>
      </TagGroup>,
    );
    expect(screen.getByTestId("group")).not.toHaveAttribute("role");
    expect(screen.getByRole("button", { name: /^A/ })).toBeDisabled();
    expect(screen.getByTestId("b")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByTestId("b")).not.toHaveClass("bg-brand-background-2");
  });
});
