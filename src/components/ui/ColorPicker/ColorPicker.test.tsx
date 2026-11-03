import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { ColorPicker, parseColor } from "./ColorPicker";

const english = ({ children }: { children: React.ReactNode }) => (
  <YugenProvider messages={messagesEn} locale="en-US">
    {children}
  </YugenProvider>
);

describe("parseColor", () => {
  it("hiểu hex, rgb(), hsl()", () => {
    expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor("0f6cbd")).toEqual({ r: 15, g: 108, b: 189, a: 1 });
    expect(parseColor("#0f6cbd80")).toEqual({ r: 15, g: 108, b: 189, a: 0.502 });
    expect(parseColor("rgb(10, 20, 30)")).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(parseColor("rgba(10 20 30 / 50%)")).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    const hsl = parseColor("hsl(120deg 100% 25%)")!;
    expect([hsl.r, hsl.g, hsl.b].map(Math.round)).toEqual([0, 128, 0]);
    expect(parseColor("blue")).toBeNull();
  });
});

describe("ColorPicker", () => {
  afterEach(() => {
    delete (window as { EyeDropper?: unknown }).EyeDropper;
  });

  it("ô hex: gõ đủ 6 chữ số là áp dụng, báo hex + rgb / hsl", async () => {
    const onValueChange = vi.fn();
    render(<ColorPicker defaultValue="#ff0000" onValueChange={onValueChange} />, { wrapper: english });
    const hex = screen.getByLabelText("Hex");
    expect(hex).toHaveValue("#ff0000");
    await userEvent.clear(hex);
    await userEvent.type(hex, "0f6cbd");
    expect(onValueChange).toHaveBeenLastCalledWith(
      "#0f6cbd",
      expect.objectContaining({ rgb: { r: 15, g: 108, b: 189, a: 1 }, hsl: expect.objectContaining({ h: 208 }) }),
    );
  });

  it("đổi định dạng sang RGB / HSL, sửa một kênh", async () => {
    const onValueChange = vi.fn();
    render(<ColorPicker defaultValue="#000000" onValueChange={onValueChange} />, { wrapper: english });
    await userEvent.selectOptions(screen.getByLabelText("Color format"), "rgb");
    const red = screen.getByLabelText("Red");
    await userEvent.clear(red);
    await userEvent.type(red, "255");
    expect(onValueChange).toHaveBeenLastCalledWith("#ff0000", expect.anything());
    fireEvent.keyDown(screen.getByLabelText("Green"), { key: "ArrowUp", shiftKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith("#ff0a00", expect.anything());
    await userEvent.selectOptions(screen.getByLabelText("Color format"), "hsl");
    expect(screen.getByRole("textbox", { name: "Hue" })).toHaveValue("2");
    expect(screen.getByLabelText("Lightness")).toHaveValue("50");
  });

  it("vùng màu: bàn phím đổi bão hoà / độ sáng", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker defaultValue="#ff0000" onValueChange={onValueChange} />, { wrapper: english });
    const area = screen.getByRole("slider", { name: "Saturation and brightness" });
    expect(area).toHaveAttribute("aria-valuetext", "Saturation 100%, brightness 100%");
    fireEvent.keyDown(area, { key: "ArrowDown", shiftKey: true });
    expect(area).toHaveAttribute("aria-valuetext", "Saturation 100%, brightness 90%");
    expect(onValueChange).toHaveBeenLastCalledWith("#e60000", expect.anything());
    fireEvent.keyDown(area, { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith("#e6e6e6", expect.anything());
  });

  it("thanh sắc độ (Radix Slider) giữ sắc độ khi màu là xám", () => {
    render(<ColorPicker defaultValue="#ff0000" />, { wrapper: english });
    const hue = screen.getByRole("slider", { name: "Hue" });
    fireEvent.keyDown(hue, { key: "ArrowRight" });
    expect(hue).toHaveAttribute("aria-valuenow", "1");
    fireEvent.keyDown(screen.getByRole("slider", { name: "Saturation and brightness" }), { key: "Home" });
    expect(hue).toHaveAttribute("aria-valuenow", "1");
  });

  it("alpha: thanh + ô độ đục, hex 8 chữ số", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker alpha defaultValue="#0f6cbd" onValueChange={onValueChange} />, { wrapper: english });
    const opacity = screen.getByRole("slider", { name: "Opacity" });
    expect(opacity).toHaveAttribute("aria-valuetext", "100%");
    fireEvent.keyDown(opacity, { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith("#0f6cbd00", expect.objectContaining({ rgb: { r: 15, g: 108, b: 189, a: 0 } }));
    expect(screen.getByRole("textbox", { name: "Opacity" })).toHaveValue("0");
  });

  it("controlled: value từ ngoài cập nhật các ô", () => {
    function Controlled() {
      const [color, setColor] = React.useState("#ff0000");
      return (
        <>
          <ColorPicker value={color} onValueChange={setColor} />
          <button type="button" onClick={() => setColor("rgb(0, 128, 0)")}>
            Green
          </button>
        </>
      );
    }
    render(<Controlled />, { wrapper: english });
    fireEvent.click(screen.getByRole("button", { name: "Green" }));
    expect(screen.getByLabelText("Hex")).toHaveValue("#008000");
  });

  it("swatches: chọn màu có sẵn, đánh dấu màu đang chọn", async () => {
    const onValueChange = vi.fn();
    render(<ColorPicker defaultValue="#0f6cbd" swatches={["#0f6cbd", { color: "#c50f1f", label: "Cranberry" }]} onValueChange={onValueChange} />, {
      wrapper: english,
    });
    expect(screen.getByRole("radiogroup", { name: "Preset colors" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "#0f6cbd" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: "Cranberry" }));
    expect(onValueChange).toHaveBeenLastCalledWith("#c50f1f", expect.anything());
    expect(screen.getByRole("radio", { name: "Cranberry" })).toHaveAttribute("aria-checked", "true");
  });

  it("EyeDropper: chỉ hiện khi trình duyệt hỗ trợ", async () => {
    const { unmount } = render(<ColorPicker />, { wrapper: english });
    expect(screen.queryByRole("button", { name: "Pick a color from the screen" })).not.toBeInTheDocument();
    unmount();

    (window as { EyeDropper?: unknown }).EyeDropper = class {
      open() {
        return Promise.resolve({ sRGBHex: "#123456" });
      }
    };
    const onValueChange = vi.fn();
    render(<ColorPicker onValueChange={onValueChange} />, { wrapper: english });
    await userEvent.click(await screen.findByRole("button", { name: "Pick a color from the screen" }));
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("#123456", expect.anything()));
  });

  it("chuỗi tiếng Việt qua messagesVi", () => {
    render(<ColorPicker />);
    expect(screen.getByRole("slider", { name: "Sắc độ" })).toBeInTheDocument();
  });
});
