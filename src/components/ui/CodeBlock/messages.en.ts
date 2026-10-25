import type { CopyCodeButtonMessages, CodeBlockMessages, CodeTabsMessages, PackageManagerTabsMessages } from "./messages";

export const copyCodeButtonMessagesEn: CopyCodeButtonMessages = {
  copy: "Copy",
  copied: "Copied",
  copyLabel: "Copy code",
  copiedLabel: "Copied",
  copiedStatus: "Copied to clipboard",
};

export const codeBlockMessagesEn: CodeBlockMessages = {
  wrap: "Word wrap",
  wrapOn: "Turn on word wrap",
  wrapOff: "Turn off word wrap",
  added: "Added:",
  removed: "Removed:",
  collapse: "Show less",
  expand: (lines) => `Show more (${lines} ${lines === 1 ? "line" : "lines"})`,
};

export const codeTabsMessagesEn: CodeTabsMessages = { files: "Files" };

export const packageManagerTabsMessagesEn: PackageManagerTabsMessages = { label: "Package manager" };
