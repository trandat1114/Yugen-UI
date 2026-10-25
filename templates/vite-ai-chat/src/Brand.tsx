import { Sparkle16Filled, Sparkle20Filled, Sparkle24Filled } from "@fluentui/react-icons";

/** App logo in the sidebar and the Drawer. */
export function Logo() {
  return (
    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background text-foreground-on-brand">
      <Sparkle20Filled />
    </span>
  );
}

/** Avatar next to the assistant's answers; `large` on the New chat page. */
export function AssistantAvatar({ large = false }: { large?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-circular bg-brand-background-2 text-brand-foreground-2 ${large ? "size-12" : "size-8"}`}
    >
      {large ? <Sparkle24Filled /> : <Sparkle16Filled />}
    </span>
  );
}
