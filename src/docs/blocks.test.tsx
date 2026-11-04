import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DoDont, ExampleTile, PropsTable, withCode } from "./blocks";

/**
 * Chữ trong registry (#259): tên prop dài có chỗ xuống dòng, đoạn `…` hiện thành <code> ở mọi nơi hiển thị.
 * Bố cục thật (không cuộn ngang ở 375px, ô ví dụ mở code chiếm cả hàng) nằm ở e2e/responsive.spec.ts và docs-flows.spec.ts.
 */
const LONG_NAME = "AppShellHeader / AppShellMain / AppShellAside / AppShellFooter.asChild";
const CODE_TEXT = "Gộp `@lg` vào `className` của `readAppShellCookie(cookieHeader, persistKey)`.";

const codes = (el: HTMLElement) => [...el.querySelectorAll("code")].map((c) => c.textContent);

describe("withCode", () => {
  it("đổi `…` thành <code>, giữ nguyên chữ thường", () => {
    const { container } = render(<p>{withCode(CODE_TEXT)}</p>);
    expect(codes(container)).toEqual(["@lg", "className", "readAppShellCookie(cookieHeader, persistKey)"]);
    expect(container.textContent).not.toContain("`");
    expect(container.querySelector("code")).toHaveAttribute("dir", "ltr");
  });

  it("[chữ](/trang) thành link tới trang docs, cả cạnh code", () => {
    const { container } = render(<p>{withCode("Dùng `modal={false}` hoặc [khoá cuộn](/concepts/positioning#scroll-lock).")}</p>);
    const link = container.querySelector("a");
    expect(link).toHaveTextContent("khoá cuộn");
    expect(link?.getAttribute("href")).toMatch(/concepts\/positioning#scroll-lock$/);
    expect(codes(container)).toEqual(["modal={false}"]);
    expect(container.textContent).toBe("Dùng modal={false} hoặc khoá cuộn.");
  });

  it("chữ không có cặp backtick trả về nguyên văn", () => {
    expect(withCode("Không có code")).toBe("Không có code");
    const { container } = render(<p>{withCode("Một dấu ` lẻ")}</p>);
    expect(container.querySelector("code")).toBeNull();
  });
});

describe("PropsTable", () => {
  it("tên dài có chỗ xuống dòng trước dấu chấm và mở ngoặc; mô tả có <code>", () => {
    render(
      <PropsTable
        props={[
          { name: LONG_NAME, type: "boolean", defaultValue: "false", description: CODE_TEXT },
          { name: "readAppShellCookie(cookie, persistKey)", type: "(cookie: string, key?: string) => AppShellState", description: "Đọc cookie." },
        ]}
      />,
    );
    const table = screen.getByRole("table", { name: "Bảng props" });
    const [first, second] = within(table).getAllByRole("row").slice(1);
    expect(first.querySelectorAll("wbr")).toHaveLength(1);
    expect(second.querySelectorAll("wbr")).toHaveLength(1);
    expect(codes(first)).toHaveLength(3);
    expect(table.textContent).not.toContain("`");
  });
});

describe("ExampleTile và DoDont", () => {
  it("mô tả ví dụ và từng dòng nên / không nên hiện <code>", () => {
    const { container } = render(
      <>
        <ExampleTile example={{ title: "Ví dụ", description: CODE_TEXT, code: "<Button />", render: () => null }} />
        <DoDont dos={[CODE_TEXT]} donts={["Đừng bỏ `aria-label`."]} />
      </>,
    );
    const inText = ["@lg", "className", "readAppShellCookie(cookieHeader, persistKey)"];
    expect(codes(container)).toEqual([...inText, ...inText, "aria-label"]);
    expect(container.textContent).not.toContain("`");
  });

  it("nút Code mở và đóng mã nguồn", async () => {
    const user = userEvent.setup();
    render(<ExampleTile example={{ title: "Ví dụ", code: "<Button />", render: () => null }} />);
    const toggle = screen.getByRole("button", { name: "Xem code" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName("Ẩn code");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
