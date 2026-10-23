import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { ChatComposer, MessageBubble, TypingIndicator } from "./MessageScroller";
import { chatComposerMessagesEn, messageBubbleMessagesEn, typingIndicatorMessagesEn } from "./messages";

describe("MessageScroller messages", () => {
  it("mặc định tiếng Việt", () => {
    render(
      <>
        <ChatComposer onSend={() => {}} />
        <MessageBubble side="outgoing" status="read">
          Chào
        </MessageBubble>
        <TypingIndicator />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Tin nhắn" })).toHaveAttribute("placeholder", "Nhập tin nhắn…");
    expect(screen.getByRole("button", { name: "Gửi" })).toBeInTheDocument();
    expect(screen.getByTitle("Đã xem")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Đối phương đang soạn tin…");
  });

  it("messages tiếng Anh, prop nhãn vẫn ưu tiên", () => {
    render(
      <YugenProvider
        messages={{ chatComposer: chatComposerMessagesEn, messageBubble: messageBubbleMessagesEn, typingIndicator: typingIndicatorMessagesEn }}
      >
        <ChatComposer onSend={() => {}} sendLabel="Go" />
        <MessageBubble side="outgoing" status="error" onRetry={() => {}}>
          Hi
        </MessageBubble>
        <TypingIndicator author="Lan" />
      </YugenProvider>,
    );
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveAttribute("placeholder", "Type a message…");
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't send.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Lan is typing…");
  });
});
