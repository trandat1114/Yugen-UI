import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { ErrorBoundary, StatusPage, isChunkLoadError, statusPageCopy } from "./StatusPage";

const english = ({ children }: { children: React.ReactNode }) => (
  <YugenProvider messages={messagesEn} locale="en-US">
    {children}
  </YugenProvider>
);

describe("StatusPage", () => {
  it("404: mã, dòng mã đọc được, tiêu đề h1 và mô tả có sẵn", () => {
    render(<StatusPage status={404} />, { wrapper: english });
    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByText("Error 404")).toBeInTheDocument();
    expect(screen.getByText("404")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("The link may be mistyped, or the page has moved.")).toBeInTheDocument();
  });

  it("ghi đè tiêu đề, ẩn mô tả, hành động, h2", () => {
    render(
      <StatusPage
        status={403}
        title="Billing is for owners"
        description={null}
        headingAs="h2"
        primaryAction={<button type="button">Request access</button>}
        secondaryAction={<a href="/">Home</a>}
      >
        <p>Signed in as an@example.com</p>
      </StatusPage>,
      { wrapper: english },
    );
    expect(screen.getByRole("heading", { level: 2, name: "Billing is for owners" })).toBeInTheDocument();
    expect(screen.queryByText(statusPageCopy(403).description)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request access" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("Signed in as an@example.com")).toBeInTheDocument();
  });

  it("offline: không có mã, có icon; code={null} ẩn mã", () => {
    const { container, rerender } = render(<StatusPage status="offline" />, { wrapper: english });
    expect(screen.getByRole("heading", { name: "You're offline" })).toBeInTheDocument();
    expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    rerender(<StatusPage status={500} code={null} />);
    expect(screen.queryByText("500")).not.toBeInTheDocument();
    expect(screen.getByText("Error 500")).toBeInTheDocument();
  });

  it("errorId: chữ chọn được và nút chép, báo đã chép", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<StatusPage status={500} errorId="7f3a-91c2" />, { wrapper: english });
    expect(screen.getByText("7f3a-91c2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Copy error ID" }));
    expect(writeText).toHaveBeenCalledWith("7f3a-91c2");
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  it("autoFocus đưa focus vào tiêu đề", () => {
    render(<StatusPage status={404} autoFocus />, { wrapper: english });
    expect(screen.getByRole("heading", { name: "Page not found" })).toHaveFocus();
  });

  it("chuỗi tiếng Việt qua messagesVi; ref trỏ tới khung", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<StatusPage status={404} ref={ref} />);
    expect(screen.getByRole("heading", { name: "Không tìm thấy trang" })).toBeInTheDocument();
    expect(screen.getByText("Lỗi 404")).toBeInTheDocument();
    expect(ref.current).toHaveAttribute("aria-labelledby", screen.getByRole("heading").id);
  });
});

describe("ErrorBoundary", () => {
  function Boom({ error }: { error?: Error }): React.ReactNode {
    if (error) throw error;
    return <p>All good</p>;
  }

  it("isChunkLoadError nhận lỗi nạp file sau khi deploy", () => {
    expect(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: /assets/x.js"))).toBe(true);
    expect(isChunkLoadError(new Error("Importing a module script failed."))).toBe(true);
    expect(isChunkLoadError(Object.assign(new Error("x"), { name: "ChunkLoadError" }))).toBe(true);
    expect(isChunkLoadError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isChunkLoadError("boom")).toBe(false);
  });

  it("lỗi render → trang 500 + Thử lại; onError được gọi", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn();
    function Harness() {
      const [error, setError] = React.useState<Error | undefined>(new Error("render failed"));
      return (
        <>
          <button type="button" onClick={() => setError(undefined)}>
            Fix
          </button>
          <ErrorBoundary onError={onError}>
            <Boom error={error} />
          </ErrorBoundary>
        </>
      );
    }
    render(<Harness />, { wrapper: english });
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong on our side");
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "render failed" }), expect.anything());
    await userEvent.click(screen.getByRole("button", { name: "Fix" }));
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("lỗi nạp file → bản mới + Tải lại", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom error={new TypeError("Failed to fetch dynamically imported module")} />
      </ErrorBoundary>,
      { wrapper: english },
    );
    expect(screen.getByRole("heading", { name: "A new version is available" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("fallback riêng và resetKeys", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Harness({ path, error }: { path: string; error?: Error }) {
      return (
        <ErrorBoundary resetKeys={[path]} fallback={({ error: e }) => <p>Failed: {(e as Error).message}</p>}>
          <Boom error={error} />
        </ErrorBoundary>
      );
    }
    const { rerender } = render(<Harness path="/a" error={new Error("nope")} />, { wrapper: english });
    expect(screen.getByText("Failed: nope")).toBeInTheDocument();
    rerender(<Harness path="/a" />);
    expect(screen.getByText("Failed: nope")).toBeInTheDocument();
    rerender(<Harness path="/b" />);
    expect(screen.getByText("All good")).toBeInTheDocument();
    fireEvent.click(document.body);
  });
});
