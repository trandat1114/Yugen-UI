import type { ReactNode } from "react";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link underline hover:text-link-hover" href={href}>
      {children}
    </a>
  );
}

const ENGLISH_CODE = `import { YugenProvider, messagesEn } from "yugen-ui";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <YugenProvider applyToDocument withToaster messages={messagesEn} locale="en-US">
      {children}
    </YugenProvider>
  );
}`;

const OVERRIDE_CODE = `// Change only the strings you need; the rest keep their defaults
<YugenProvider messages={{ dialog: { close: "Close dialog" } }}>…</YugenProvider>

// A nested provider inherits messages and locale from the outer one, then overrides
<YugenProvider messages={messagesEn} locale="en-US">
  <YugenProvider messages={{ toast: { dismiss: "Hide" } }}>…</YugenProvider>
</YugenProvider>

// A component's own label prop still wins over messages
<SearchBox dismissLabel="Clear keywords" />`;

const OTHER_CODE = `import { messagesEn, type YugenMessages } from "yugen-ui";

// The full YugenMessages type: a missing namespace is a type error
export const messagesJa: YugenMessages = {
  ...messagesEn,
  dialog: { close: "閉じる" },
  toast: { region: "通知", regionHotkey: "通知 ({hotkey})", dismiss: "通知を閉じる" },
  // …
};

<YugenProvider messages={messagesJa} locale="ja-JP">…</YugenProvider>`;

const SOURCE_CODE = `// Source copied with the CLI or shadcn: each component has its own messages.ts
import { dialogMessagesEn } from "@/components/ui/Dialog/Dialog";
import { toastMessagesEn } from "@/components/ui/Toast/Toast";

const messages = { dialog: dialogMessagesEn, toast: toastMessagesEn };

<YugenProvider messages={messages} locale="en-US">…</YugenProvider>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="english"
        title="Switch to English"
        description="messagesEn holds the English version of every built-in string; locale changes how dates, times and numbers are formatted."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={ENGLISH_CODE} />
          <P>
            Built-in strings are the text a component shows or reads to screen readers without you passing it: the close button label,
            “Loading…”, “No results found”, chart descriptions, aria-live announcements. Content you pass in (titles, children, a Field
            label) is not changed.
          </P>
          <P>
            <C>messagesEn</C> is a plain object. Bundlers only include it when you import it, so a Vietnamese-only app pays nothing for it.
          </P>
        </div>
      </DocSection>

      <DocSection id="override" title="Change a few strings" description="messages takes a partial object: by component namespace, only the strings to change.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={OVERRIDE_CODE} />
          <P>
            Priority: the component&apos;s own label prop (such as SearchBox <C>dismissLabel</C>), then <C>messages</C> from the nearest
            provider, then outer providers, then the Vietnamese default. Editors suggest namespace and key names from the types, and
            the Messages section at the end of each component page lists every key with its Vietnamese and English text.
          </P>
        </div>
      </DocSection>

      <DocSection id="locale" title="Dates, times and numbers" description="The locale on YugenProvider is the default Intl locale for components.">
        <div className="flex flex-col gap-4">
          <P>
            Charts, DatePicker, TimePicker, NotificationCenter and Rating format numbers, dates and times with the provider{" "}
            <C>locale</C> (default <C>"vi-VN"</C>). A component&apos;s own <C>locale</C> prop still wins. Calendar uses a
            react-day-picker locale, set in <C>messages.calendar.locale</C>; <C>messagesEn</C> already sets English.
          </P>
          <P>
            Text direction is handled separately by the <C>dir</C> prop, see <A href={docsPath("/concepts/rtl")}>RTL</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="other" title="Other languages" description="Write a full YugenMessages object, usually starting from messagesEn.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={OTHER_CODE} />
          <P>
            Strings that contain values (step numbers, notification counts, file names) are functions, so each language can handle
            plurals and word order. When an upgrade adds a string, the type checker shows what is missing.
          </P>
        </div>
      </DocSection>

      <DocSection id="source" title="Copied source" description="Each component has a messages.ts file next to it.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={SOURCE_CODE} />
          <P>
            <C>messagesEn</C> is only in the npm package. With source copied by <A href={docsPath("/concepts/cli")}>@yugen-ui/cli</A> or
            shadcn, combine the <C>…MessagesEn</C> objects of the components you have; the <C>YugenMessages</C> type only lists those
            components too. To change a default for good, edit <C>messages.ts</C> directly.
          </P>
          <DoDont
            dos={[
              "Set messages and locale once on the root YugenProvider.",
              "Use a component's label prop when one place needs different text from the rest of the app.",
            ]}
            donts={[
              "Create a new messages object on every render: declare it outside the component or use useMemo.",
              "Translate your own content with messages; it is only for the components' built-in text.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
