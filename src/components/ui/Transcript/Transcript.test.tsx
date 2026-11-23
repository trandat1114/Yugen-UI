import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { AriaLiveAnnouncer } from "../AriaLive/AriaLive";
import { messagesEn } from "../messages-en";
import { Transcript, type TranscriptTurn } from "./Transcript";

const AT = Date.UTC(2026, 10, 23, 9, 5);

const history: TranscriptTurn[] = [
  { id: "1", speaker: "Mai", role: "user", text: "Book a table for two.", timestamp: AT },
  { id: "2", speaker: "Assistant", role: "assistant", text: "For what time?", timestamp: AT + 60_000 },
];

describe("Transcript", () => {
  it("lists the turns in a named region with speaker, time and text", () => {
    render(<Transcript turns={history} locale="en-US" />);
    const region = screen.getByRole("region", { name: "Bản ghi hội thoại" });
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Mai");
    expect(items[0]).toHaveTextContent("Book a table for two.");
    expect(items[0].querySelector("time")).toHaveAttribute("dateTime", new Date(AT).toISOString());
    expect(within(items[1]).getByText("Assistant")).toHaveClass("text-brand-foreground-1");
  });

  it("marks the streaming turn as current with text, not only color", () => {
    const { rerender } = render(
      <YugenProvider messages={messagesEn}>
        <Transcript turns={[...history, { id: "3", speaker: "Assistant", text: "At sev", status: "streaming" }]} />
      </YugenProvider>,
    );
    const items = screen.getAllByRole("listitem");
    // Đang nhận chữ: cả vùng aria-busy.
    expect(screen.getByRole("region")).toHaveAttribute("aria-busy", "true");
    expect(items[2]).toHaveAttribute("aria-current", "true");
    expect(within(items[2]).getByText("Speaking")).toBeInTheDocument();
    expect(items[2]).toHaveTextContent("(continuing)");
    expect(items[0]).not.toHaveAttribute("aria-current");
    // activeId thắng; null tắt hẳn lượt hiện tại.
    rerender(
      <YugenProvider messages={messagesEn}>
        <Transcript turns={history} activeId="1" />
      </YugenProvider>,
    );
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "true");
    rerender(
      <YugenProvider messages={messagesEn}>
        <Transcript turns={[{ id: "3", speaker: "A", text: "x", status: "streaming" }]} activeId={null} />
      </YugenProvider>,
    );
    expect(screen.getByRole("listitem")).not.toHaveAttribute("aria-current");
  });

  it("re-renders only the turn that changed when a token arrives", () => {
    const renderText = vi.fn((turn: TranscriptTurn) => turn.text);
    const streaming = (text: string): TranscriptTurn => ({ id: "3", speaker: "Assistant", text, status: "streaming" });
    const { rerender } = render(<Transcript turns={[...history, streaming("At")]} renderText={renderText} />);
    expect(renderText).toHaveBeenCalledTimes(3);
    renderText.mockClear();
    rerender(<Transcript turns={[...history, streaming("At seven")]} renderText={renderText} />);
    expect(renderText).toHaveBeenCalledTimes(1);
    expect(renderText).toHaveBeenLastCalledWith(expect.objectContaining({ text: "At seven" }));
  });

  it("announces a turn once when it completes, never the history", async () => {
    const turns = (text: string, status: TranscriptTurn["status"]): TranscriptTurn[] => [
      ...history,
      { id: "3", speaker: "Assistant", text, status },
    ];
    const { rerender } = render(
      <AriaLiveAnnouncer>
        <Transcript turns={turns("At", "streaming")} announce />
      </AriaLiveAnnouncer>,
    );
    const live = () => document.body.textContent ?? "";
    rerender(
      <AriaLiveAnnouncer>
        <Transcript turns={turns("At seven, a table by the window.", "complete")} announce />
      </AriaLiveAnnouncer>,
    );
    await vi.waitFor(() => expect(live()).toContain("Assistant: At seven, a table by the window."));
    expect(live()).not.toContain("Mai: Book a table for two.");
  });

  it("shows errors with text and an icon, empty and loading states", () => {
    const { rerender } = render(
      <Transcript turns={[{ id: "e", speaker: "Mai", text: "", status: "error" }, { id: "f", speaker: "Mai", text: "…", status: "error", error: "Mic is muted" }]} />,
    );
    expect(screen.getByText("Không nhận dạng được lời nói.")).toBeInTheDocument();
    expect(screen.getByText("Mic is muted")).toBeInTheDocument();
    rerender(<Transcript turns={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Chưa có ai nói gì.");
    rerender(<Transcript turns={[]} loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải bản ghi…");
    expect(screen.getByRole("region")).toHaveAttribute("aria-busy", "true");
    rerender(<Transcript turns={[]} empty="Say hello" />);
    expect(screen.getByRole("status")).toHaveTextContent("Say hello");
  });

  it("keeps the view pinned to the end while the reader is at the end", () => {
    const { rerender } = render(<Transcript turns={history} aria-label="Call" />);
    const region = screen.getByRole("region", { name: "Call" });
    let scrollHeight = 500;
    Object.defineProperty(region, "scrollHeight", { configurable: true, get: () => scrollHeight });
    Object.defineProperty(region, "clientHeight", { configurable: true, get: () => 200 });
    scrollHeight = 600;
    rerender(<Transcript turns={[...history, { id: "3", speaker: "A", text: "More" }]} aria-label="Call" />);
    expect(region.scrollTop).toBe(600);
    // Người dùng cuộn lên đọc lại: không kéo xuống nữa.
    region.scrollTop = 100;
    region.dispatchEvent(new Event("scroll"));
    scrollHeight = 700;
    rerender(<Transcript turns={[...history, { id: "3", speaker: "A", text: "More text" }]} aria-label="Call" />);
    expect(region.scrollTop).toBe(100);
    // autoScroll={false}: không bao giờ tự cuộn.
    region.scrollTop = 500;
    region.dispatchEvent(new Event("scroll"));
    scrollHeight = 800;
    rerender(<Transcript turns={[...history, { id: "3", speaker: "A", text: "Even more" }]} aria-label="Call" autoScroll={false} />);
    expect(region.scrollTop).toBe(500);
  });

  it("accepts a custom time and avatar, and wraps long words", () => {
    render(
      <Transcript
        turns={[{ id: "1", speaker: "Mai", text: "x".repeat(300), time: "just now", avatar: <span data-testid="avatar" /> }]}
      />,
    );
    expect(screen.getByText("just now")).toBeInTheDocument();
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.getByText("x".repeat(300))).toHaveClass("wrap-break-word");
  });
});
