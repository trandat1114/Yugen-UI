import type { MessageScrollerMessages, MessageBubbleMessages, TypingIndicatorMessages, ChatComposerMessages } from "./messages";

export const messageScrollerMessagesEn: MessageScrollerMessages = {
  label: "Conversation",
  loadingOlder: "Loading earlier messages…",
  jumpToLatest: "Jump to latest message",
  newMessages: (count) => (count === 1 ? "1 new message" : `${count} new messages`),
};

export const messageBubbleMessagesEn: MessageBubbleMessages = {
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  read: "Seen",
  error: "Couldn't send.",
  retry: "Retry",
};

export const typingIndicatorMessagesEn: TypingIndicatorMessages = {
  label: (author) => `${author ?? "Someone"} is typing…`,
};

export const chatComposerMessagesEn: ChatComposerMessages = {
  placeholder: "Type a message…",
  label: "Message",
  send: "Send",
  stop: "Stop responding",
  hint: "Enter to send · Shift+Enter for a new line",
  countPrefix: "Typed",
  countSuffix: "characters",
};
