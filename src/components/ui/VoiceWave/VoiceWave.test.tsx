import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { installMatchMedia, setMediaQueries } from "@/test/matchMedia";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { resampleLevels, VoiceWave } from "./VoiceWave";

afterEach(() => vi.unstubAllGlobals());

const barsOf = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>("span"));
const scales = (el: HTMLElement) => barsOf(el).map((bar) => Number(/scaleY\(([\d.]+)\)/.exec(bar.style.transform)?.[1]));

function queueFrames() {
  const callbacks: FrameRequestCallback[] = [];
  const cancel = vi.fn();
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => callbacks.push(cb));
  vi.stubGlobal("cancelAnimationFrame", cancel);
  return { flush: () => act(() => callbacks.splice(0).forEach((cb) => cb(0))), pending: () => callbacks.length, cancel };
}

describe("VoiceWave", () => {
  it("names each state from messages.voiceWave and keeps the bars hidden from assistive tech", () => {
    const { rerender } = render(<VoiceWave state="listening" />);
    expect(screen.getByRole("img", { name: "Đang nghe" })).toHaveAttribute("data-state", "listening");
    rerender(
      <YugenProvider messages={messagesEn}>
        <VoiceWave state="muted" />
      </YugenProvider>,
    );
    const wave = screen.getByRole("img", { name: "Microphone muted" });
    expect(wave.firstElementChild).toHaveAttribute("aria-hidden", "true");
    rerender(<VoiceWave state="error" label="Mic blocked" />);
    expect(screen.getByRole("img", { name: "Mic blocked" })).toBeInTheDocument();
  });

  it("lies flat when idle, muted or in error, and keeps the bar count (no layout shift)", () => {
    const { rerender } = render(<VoiceWave state="idle" bars={12} levels={[1, 1, 1]} />);
    const wave = screen.getByRole("img");
    expect(barsOf(wave)).toHaveLength(12);
    expect(new Set(scales(wave))).toEqual(new Set([0.1]));
    rerender(<VoiceWave state="muted" bars={12} />);
    expect(barsOf(wave)[0]).toHaveClass("bg-foreground-disabled");
    rerender(<VoiceWave state="error" bars={12} />);
    expect(barsOf(wave)[0]).toHaveClass("bg-danger-background-3");
    rerender(<VoiceWave state="speaking" bars={12} />);
    expect(barsOf(wave)).toHaveLength(12);
    expect(Math.max(...scales(wave))).toBeGreaterThan(0.5);
  });

  it("draws the given levels, resampled to the bar count, with a minimum bar", () => {
    render(<VoiceWave state="speaking" bars={4} levels={[0, 0, 1, 1, 0.5, 0.5, -3, Number.NaN]} tone="neutral" align="bottom" size="large" />);
    const wave = screen.getByRole("img");
    expect(scales(wave)).toEqual([0.1, 1, 0.55, 0.1]);
    expect(barsOf(wave)[0]).toHaveClass("bg-foreground-3", "origin-bottom", "w-1.5");
  });

  it("reads source once per frame without re-rendering, and stops on cleanup", () => {
    const frames = queueFrames();
    let level = 0.2;
    const source = vi.fn(() => [level, level, level]);
    let renders = 0;
    function Probe({ state = "listening" }: { state?: "listening" | "idle" }) {
      renders++;
      return <VoiceWave state={state} bars={3} source={source} />;
    }
    const { rerender, unmount } = render(<Probe />);
    const wave = screen.getByRole("img");
    const before = renders;
    frames.flush();
    expect(source).toHaveBeenCalledTimes(1);
    expect(scales(wave)).toEqual([0.28, 0.28, 0.28]);
    level = 1;
    frames.flush();
    expect(scales(wave)).toEqual([1, 1, 1]);
    expect(renders).toBe(before);
    expect(frames.pending()).toBe(1);
    // Đổi sang idle: dừng vòng frame, các vạch về dáng phẳng.
    rerender(<Probe state="idle" />);
    expect(frames.cancel).toHaveBeenCalled();
    expect(scales(wave)).toEqual([0.1, 0.1, 0.1]);
    unmount();
  });

  it("does not animate with reduced motion", () => {
    // matchMedia mới: useMediaQuery bỏ MediaQueryList đã cache từ các test trước.
    installMatchMedia();
    setMediaQueries({ "prefers-reduced-motion": true });
    const frames = queueFrames();
    const source = vi.fn(() => [1]);
    render(<VoiceWave state="speaking" source={source} />);
    frames.flush();
    frames.flush();
    expect(source).not.toHaveBeenCalled();
  });

  it("ignores empty frames and clamps the bar count", () => {
    const frames = queueFrames();
    const { rerender } = render(<VoiceWave state="listening" bars={200} source={() => null} />);
    const wave = screen.getByRole("img");
    expect(barsOf(wave)).toHaveLength(64);
    const before = scales(wave);
    frames.flush();
    expect(scales(wave)).toEqual(before);
    rerender(<VoiceWave state="listening" bars={1} />);
    expect(barsOf(wave)).toHaveLength(3);
  });
});

describe("resampleLevels", () => {
  it("averages the slice each bar covers and repeats values when there are more bars than data", () => {
    expect(resampleLevels([0, 1, 0, 1], 2)).toEqual([0.5, 0.5]);
    expect(resampleLevels([0.2, 0.8], 4)).toEqual([0.2, 0.2, 0.8, 0.8]);
    expect(resampleLevels([], 3)).toEqual([0, 0, 0]);
  });
});
