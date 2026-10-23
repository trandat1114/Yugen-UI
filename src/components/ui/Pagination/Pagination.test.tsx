import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Pagination, paginationMessagesEn } from "./Pagination";

describe("Pagination messages", () => {
  it("mặc định tiếng Việt", () => {
    render(<Pagination pageCount={3} />);
    expect(screen.getByRole("navigation", { name: "Phân trang" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 2" })).toBeInTheDocument();
  });

  it("paginationMessagesEn; aria-label riêng vẫn ưu tiên", () => {
    render(
      <YugenProvider messages={{ pagination: paginationMessagesEn }}>
        <Pagination pageCount={3} aria-label="Kết quả" />
      </YugenProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Kết quả" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toHaveTextContent("Next");
    expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument();
  });
});
