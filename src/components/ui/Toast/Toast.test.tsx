import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { watchDeprecations } from "@/test/deprecation";
import { Toaster, dismissAllToasts, dispatchToast, toast, useToast } from "./Toast";

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

describe("dispatchToast (export lỗi thời)", () => {
  beforeEach(() => {
    render(<Toaster />);
  });
  afterEach(() => {
    act(() => dismissAllToasts());
  });

  it("vẫn hiện toast và cảnh báo một lần; toast() và useToast().dispatchToast không cảnh báo", () => {
    const warnings = watchDeprecations();
    let api: ReturnType<typeof useToast> | undefined;
    function Probe() {
      api = useToast();
      return null;
    }
    render(<Probe />);
    act(() => {
      dispatchToast({ toastId: "x", title: "Cũ" });
      dispatchToast({ toastId: "y", title: "Cũ 2" });
      toast({ toastId: "z", title: "Helper" });
      api?.dispatchToast({ toastId: "w", title: "Hook" });
    });
    for (const title of ["Cũ", "Cũ 2", "Helper", "Hook"]) expect(screen.getByText(title)).toBeInTheDocument();
    expect(warnings("dispatchToast")).toBe(1);
  });
});
