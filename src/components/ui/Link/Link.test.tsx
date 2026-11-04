import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Link, linkMessagesVi } from "./Link";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

describe("Link", () => {
  it("thẻ a với href; ref tới phần tử; className gộp với biến thể", () => {
    const ref = { current: null as HTMLAnchorElement | null };
    render(
      <Link ref={ref} href="/docs" className="font-semibold">
        Tài liệu
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Tài liệu" });
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("font-semibold", "text-link", "text-body1");
  });

  it("appearance subtle / inline", () => {
    render(
      <Link href="#" appearance="subtle" inline>
        Phụ
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Phụ" });
    expect(link).toHaveClass("text-foreground-2", "underline");
    expect(link).not.toHaveClass("text-body1");
  });

  it("disabled: bỏ href, aria-disabled, vẫn là link focus được; click không gọi onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Link href="/docs" disabled onClick={onClick} tabIndex={0}>
        Tài liệu
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Tài liệu" });
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("onClick chạy khi không disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <Link href="/docs" onClick={onClick}>
        Tài liệu
      </Link>,
    );
    await user.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("external: mở tab mới, rel an toàn, icon + chữ ẩn; target / rel riêng vẫn thắng", () => {
    const { unmount } = render(
      <Link href="https://example.com" external>
        Ví dụ
      </Link>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("Ví dụ (mở trong thẻ mới)");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden");
    unmount();
    render(
      <Link href="https://example.com" external target="_top" rel="noopener">
        Ví dụ
      </Link>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("target", "_top");
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener");
  });

  it("chữ ẩn của external: tiếng Anh mặc định, tiếng Việt qua linkMessagesVi", () => {
    const { unmount } = renderBare(
      <Link href="#" external>
        Docs
      </Link>,
    );
    expect(screen.getByRole("link")).toHaveTextContent("Docs (opens in new tab)");
    unmount();
    renderBare(
      <YugenProvider messages={{ link: linkMessagesVi }}>
        <Link href="#" external>
          Docs
        </Link>
      </YugenProvider>,
    );
    expect(screen.getByRole("link")).toHaveTextContent("Docs (mở trong thẻ mới)");
  });

  it("asChild: class + thuộc tính lên phần tử con, icon external nằm trong phần tử con", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Link asChild external disabled onClick={onClick}>
        <a href="/router">Router</a>
      </Link>,
    );
    const link = screen.getByText("Router").closest("a")!;
    expect(link).toHaveClass("text-link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link.querySelector("svg")).not.toBeNull();
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });
});
