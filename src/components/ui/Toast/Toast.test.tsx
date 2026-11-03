import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { watchDeprecations } from "@/test/deprecation";
import { Toaster, dismissAllToasts, toast } from "./Toast";

function show(options: Parameters<typeof toast>[0]) {
  act(() => {
    toast(options);
  });
  return screen.getByText(String(options.title)).closest("li") as HTMLElement;
}

const closeButton = (item: HTMLElement) => within(item).queryByRole("button", { name: "Đóng thông báo" });

describe("Toast dismissible", () => {
  beforeEach(() => {
    render(<Toaster />);
  });
  afterEach(() => {
    act(() => dismissAllToasts());
  });

  it("mặc định có nút đóng; dismissible: false ẩn nút", () => {
    expect(closeButton(show({ toastId: "a", title: "Có nút" }))).toBeInTheDocument();
    expect(closeButton(show({ toastId: "b", title: "Không nút", dismissible: false }))).toBeNull();
  });

  it("hideDismiss (tên cũ) vẫn chạy và cảnh báo một lần", () => {
    const warnings = watchDeprecations();
    expect(closeButton(show({ toastId: "c", title: "Cũ", hideDismiss: true }))).toBeNull();
    show({ toastId: "d", title: "Cũ 2", hideDismiss: true });
    expect(warnings("ToastOptions.hideDismiss")).toBe(1);
  });

  it("dismissible thắng khi truyền cả hai", () => {
    watchDeprecations();
    expect(closeButton(show({ toastId: "e", title: "Mới thắng", dismissible: true, hideDismiss: true }))).toBeInTheDocument();
  });
});
