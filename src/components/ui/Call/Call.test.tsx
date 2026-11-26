import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { callMessagesEn, callMessagesVi, CallControlButton, CallControls, CallStatus, CallSurface, formatCallDuration } from "./Call";

afterEach(() => vi.useRealTimers());

const en = (ui: React.ReactNode) => <YugenProvider messages={messagesEn}>{ui}</YugenProvider>;

describe("CallStatus", () => {
  it("says the state in words inside a status region, with the duration outside it", () => {
    const { rerender } = render(en(<CallStatus state="connected" duration={151} />));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Connected");
    expect(status).not.toHaveTextContent("2:31");
    expect(status.parentElement).toHaveTextContent("2:31");
    rerender(en(<CallStatus state="connecting" duration={151} />));
    expect(screen.getByRole("status")).toHaveTextContent("Connecting…");
    expect(screen.getByRole("status").parentElement).not.toHaveTextContent("2:31");
    expect(screen.getByRole("status").previousElementSibling).toHaveClass("animate-pulse", "motion-reduce:animate-none");
    rerender(en(<CallStatus state="failed" label="No answer" />));
    expect(screen.getByRole("status")).toHaveTextContent("No answer");
  });

  it("formats durations", () => {
    expect(formatCallDuration(0)).toBe("0:00");
    expect(formatCallDuration(65.9)).toBe("1:05");
    expect(formatCallDuration(3725)).toBe("1:02:05");
    expect(formatCallDuration(-3)).toBe("0:00");
    expect(formatCallDuration(Number.NaN)).toBe("0:00");
  });
});

describe("CallSurface", () => {
  it("names the region after the other party and lays out identity, content and controls", () => {
    const { rerender } = render(
      <CallSurface name="Aiko" state="ringing" description="+81 3 1234 5678" avatar={<span data-testid="avatar" />} controls={<CallControls />}>
        <p>Transcript here</p>
      </CallSurface>,
    );
    const region = screen.getByRole("region", { name: "Cuộc gọi với Aiko" });
    expect(region).toHaveAttribute("data-layout", "stacked");
    expect(within(region).getByTestId("avatar")).toBeInTheDocument();
    expect(within(region).getByText("+81 3 1234 5678")).toBeInTheDocument();
    expect(within(region).getByRole("status")).toHaveTextContent("Đang đổ chuông…");
    expect(within(region).getByText("Transcript here")).toBeInTheDocument();
    expect(within(region).getByRole("toolbar", { name: "Điều khiển cuộc gọi" })).toBeInTheDocument();
    rerender(<CallSurface name="Aiko" state="ended" layout="inline" />);
    expect(screen.getByRole("region")).toHaveAttribute("data-layout", "inline");
  });
});

describe("CallControls", () => {
  it("is one tab stop with arrow keys between the buttons", () => {
    render(
      en(
        <CallControls>
          <CallControlButton kind="mute" />
          <CallControlButton kind="speaker" disabled />
          <CallControlButton kind="camera" />
          <CallControlButton kind="end" />
        </CallControls>,
      ),
    );
    const toolbar = screen.getByRole("toolbar", { name: "Call controls" });
    const [mute, , camera, end] = within(toolbar).getAllByRole("button");
    expect(mute).toHaveAttribute("tabindex", "0");
    expect(camera).toHaveAttribute("tabindex", "-1");
    mute.focus();
    fireEvent.keyDown(mute, { key: "ArrowRight" });
    // Nút bị vô hiệu bị bỏ qua.
    expect(camera).toHaveFocus();
    fireEvent.keyDown(camera, { key: "End" });
    expect(end).toHaveFocus();
  });
});

describe("CallControlButton", () => {
  it("toggles with aria-pressed, a constant name and a different icon", () => {
    const onPressedChange = vi.fn();
    const { rerender } = render(en(<CallControlButton kind="mute" pressed={false} onPressedChange={onPressedChange} />));
    const button = screen.getByRole("button", { name: "Mute" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    const iconBefore = button.querySelector("svg")?.innerHTML;
    fireEvent.click(button);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    rerender(en(<CallControlButton kind="mute" pressed onPressedChange={onPressedChange} />));
    expect(screen.getByRole("button", { name: "Mute" })).toHaveAttribute("aria-pressed", "true");
    expect(button.querySelector("svg")?.innerHTML).not.toBe(iconBefore);
  });

  it("plain actions have no aria-pressed and take a custom label and icon", () => {
    const onClick = vi.fn();
    render(<CallControlButton label="Keypad" icon={<svg data-testid="icon" />} onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Keypad" });
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("asks for a second press before ending the call when confirm is set", () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    render(en(<CallControlButton kind="end" confirm onClick={onClick} />));
    const end = screen.getByRole("button", { name: "End call" });
    expect(end.querySelector("[aria-hidden]")).toHaveClass("bg-danger-background-3");
    fireEvent.click(end);
    expect(onClick).not.toHaveBeenCalled();
    expect(end).toHaveAccessibleName("Press again to end");
    fireEvent.click(end);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(end).toHaveAccessibleName("End call");
    // Hết 4 giây, hoặc rời focus: quay lại trạng thái ban đầu.
    fireEvent.click(end);
    act(() => vi.advanceTimersByTime(4000));
    expect(end).toHaveAccessibleName("End call");
    fireEvent.click(end);
    fireEvent.blur(end);
    expect(end).toHaveAccessibleName("End call");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ends right away without confirm", () => {
    const onClick = vi.fn();
    render(<CallControlButton kind="end" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Kết thúc" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("callMessages", () => {
  it("names the call in both languages", () => {
    expect(callMessagesEn.surface("Aiko")).toBe("Call with Aiko");
    expect(callMessagesVi.surface("Lan")).toBe("Cuộc gọi với Lan");
  });
});
