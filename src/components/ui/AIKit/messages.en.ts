import type { PromptInputMessages, StreamingMarkdownMessages, CitationMessages, ReasoningMessages } from "./messages";

export const promptInputMessagesEn: PromptInputMessages = {
  placeholder: "Ask anything…",
  label: "Enter a prompt",
  send: "Send",
  stop: "Stop responding",
  attach: "Attach files",
  attachments: "Attachments",
  remove: (fileName) => `Remove ${fileName}`,
  hint: "Enter to send · Shift+Enter for a new line",
  dropzone: "Drop files to attach",
  attachedOne: (fileName) => `Attached ${fileName}`,
  attachedMany: (count) => (count === 1 ? "Attached 1 file" : `Attached ${count} files`),
  removed: (fileName) => `Removed ${fileName}`,
  duplicate: (fileName) => `“${fileName}” is already attached.`,
  invalidType: (fileName) => `“${fileName}” isn't an allowed file type.`,
  tooLarge: (fileName, maxSize) => `“${fileName}” is larger than ${maxSize}.`,
  tooMany: (maxFiles) => (maxFiles === 1 ? "You can attach only 1 file." : `You can attach up to ${maxFiles} files.`),
};

export const streamingMarkdownMessagesEn: StreamingMarkdownMessages = {
  newTab: "(opens in new tab)",
  taskDone: "Done:",
  taskTodo: "Not done:",
  table: "Table",
};

export const citationMessagesEn: CitationMessages = {
  source: "Source",
  sources: "Sources",
  newTab: "(opens in new tab)",
};

export const reasoningMessagesEn: ReasoningMessages = {
  thinking: "Thinking…",
  thought: "Thought",
  thoughtFor: (duration) => `Thought for ${duration}`,
};
