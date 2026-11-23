import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import type { TranscriptTurn } from "../Transcript/Transcript";
import { VoiceAssistant, voiceAssistantMessagesEn, voiceAssistantMessagesVi, type VoiceAssistantState } from "./VoiceAssistant";

const turns: TranscriptTurn[] = [
  { id: "1", speaker: "You", role: "user", text: "What's on my calendar?" },
  { id: "2", speaker: "Aiko", role: "assistant", text: "Two meetings", status: "streaming" },
];

const en = (ui: React.ReactNode) => <YugenProvider messages={messagesEn}>{ui}</YugenProvider>;

describe("VoiceAssistant", () => {
  it("says each state in words and shows the matching controls", () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const onRetry = vi.fn();
    const view = (state: VoiceAssistantState, extra: Partial<React.ComponentProps<typeof VoiceAssistant>> = {}) =>
      en(<VoiceAssistant name="Aiko" state={state} onStart={onStart} onEnd={onEnd} onRetry={onRetry} {...extra} />);
    const { rerender } = render(view("idle"));
    const region = screen.getByRole("region", { name: "Call with Aiko" });
    expect(region).toHaveAttribute("data-assistant-state", "idle");
    expect(within(region).getByRole("status")).toHaveTextContent("Ready");
    fireEvent.click(screen.getByRole("button", { name: "Start talking" }));
    expect(onStart).toHaveBeenCalledTimes(1);

    rerender(view("connecting"));
    expect(screen.getByRole("status")).toHaveTextContent("Connecting…");
    expect(screen.getByRole("button", { name: "Mute" })).toBeDisabled();

    for (const [state, text] of [
      ["listening", "Listening"],
      ["thinking", "Thinking…"],
      ["speaking", "Speaking"],
    ] as const) {
      rerender(view(state, { duration: 65 }));
      expect(screen.getByRole("status")).toHaveTextContent(text);
      expect(screen.getByRole("status").parentElement).toHaveTextContent("1:05");
      expect(screen.getByRole("toolbar", { name: "Call controls" })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("button", { name: "End call" }));
    expect(onEnd).toHaveBeenCalledTimes(1);

    rerender(view("ended", { duration: 65 }));
    expect(screen.getByRole("status")).toHaveTextContent("Ended");
    expect(screen.getByRole("status").parentElement).not.toHaveTextContent("1:05");
    expect(screen.getByRole("button", { name: "Start talking" })).toBeInTheDocument();

    rerender(view("error"));
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't reach the assistant.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    rerender(view("error", { error: "Microphone blocked" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Microphone blocked");
  });

  it("drives the wave from the state and mute", () => {
    const onMutedChange = vi.fn();
    const { rerender } = render(en(<VoiceAssistant name="Aiko" state="listening" onMutedChange={onMutedChange} />));
    const wave = () => screen.getByRole("img");
    expect(wave()).toHaveAttribute("data-state", "listening");
    fireEvent.click(screen.getByRole("button", { name: "Mute" }));
    expect(onMutedChange).toHaveBeenCalledWith(true);
    rerender(en(<VoiceAssistant name="Aiko" state="listening" muted />));
    expect(wave()).toHaveAttribute("data-state", "muted");
    expect(screen.getByRole("status")).toHaveTextContent("Muted");
    rerender(en(<VoiceAssistant name="Aiko" state="thinking" muted />));
    expect(wave()).toHaveAttribute("data-state", "idle");
    expect(screen.getByRole("status")).toHaveTextContent("Thinking…");
    rerender(en(<VoiceAssistant name="Aiko" state="speaking" levels={[0.5, 0.9]} />));
    expect(wave()).toHaveAttribute("data-state", "speaking");
    rerender(en(<VoiceAssistant name="Aiko" state="error" />));
    expect(wave()).toHaveAttribute("data-state", "error");
  });

  it("shows the transcript only when there are turns, in a scroll box", () => {
    const { rerender } = render(<VoiceAssistant name="Aiko" state="speaking" turns={turns} layout="inline" transcriptClassName="h-40" actions={<button type="button">Keypad</button>} />);
    const transcript = screen.getByRole("region", { name: "Bản ghi hội thoại" });
    expect(transcript).toHaveClass("overflow-y-auto", "max-h-48", "h-40");
    expect(within(transcript).getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Keypad" })).toBeInTheDocument();
    rerender(<VoiceAssistant name="Aiko" state="speaking" turns={[]} />);
    expect(screen.queryByRole("region", { name: "Bản ghi hội thoại" })).toBeNull();
  });

  it("renders on the server without a window", () => {
    const html = renderToString(<VoiceAssistant name="Aiko" state="listening" turns={turns} duration={3} />);
    expect(html).toContain("data-assistant-state=\"listening\"");
    expect(html).toContain(">Listening<");
  });

  it("has state names in both languages", () => {
    expect(Object.keys(voiceAssistantMessagesVi.states)).toEqual(Object.keys(voiceAssistantMessagesEn.states));
  });
});
