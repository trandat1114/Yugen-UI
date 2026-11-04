import * as React from "react";
import { Compose20Regular } from "@fluentui/react-icons";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Button,
  PageProgress,
  PageProgressFallback,
  SidebarTrigger,
  SkeletonText,
  toast,
  useAppShell,
  ErrorBoundary,
} from "yugen-ui";
import type { SendMessage } from "./api";
import type { Appearance } from "./appearance";
import { seedConversations, type Conversation } from "./conversations";
import type { Content } from "./content/types";
import { ConfirmDialog, RenameDialog, useDialogTarget } from "./Dialogs";
import { Link, useRouter } from "./router";
import { ChatSidebar, ConversationMenu } from "./Sidebar";
import { ThemeMenu } from "./ThemeMenu";
import { useChat } from "./useChat";

// Each page is its own chunk: the chat (Markdown, code highlighting, Trace) loads only when it is shown.
const ChatPage = React.lazy(() => import("./ChatPage"));
const SettingsPage = React.lazy(() => import("./SettingsPage"));
const NotFoundPage = React.lazy(() => import("./NotFoundPage"));

export interface ChatLayoutProps {
  content: Content;
  send: SendMessage;
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
  failReplies: boolean;
  onFailRepliesChange: (value: boolean) => void;
  /** Embedded in another page (preview): fills its parent, no <main> landmark, headings start at h2, nothing saved. */
  embedded?: boolean;
}

function PageFallback({ embedded }: { embedded: boolean }) {
  const skeleton = (
    <div className="mx-auto w-full max-w-3xl p-6">
      <SkeletonText lines={4} />
    </div>
  );
  // The top progress bar is fixed to the window: not in a preview inside another page.
  return embedded ? skeleton : <PageProgressFallback>{skeleton}</PageProgressFallback>;
}

/** New chat in the header whenever the sidebar (which has its own New chat) is out of view. */
function HeaderNewChat({ t }: { t: Content }) {
  const { collapsed } = useAppShell();
  return (
    <Button asChild appearance="subtle" className={collapsed ? undefined : "@3xl:hidden"}>
      <Link to={{ name: "new" }} aria-label={t.nav.newChat}>
        <Compose20Regular aria-hidden />
      </Link>
    </Button>
  );
}

/** App frame: conversation list (Drawer on narrow screens), header, and the page for the current route. */
export function ChatLayout({
  content: t,
  send,
  appearance,
  onAppearanceChange,
  failReplies,
  onFailRepliesChange,
  embedded = false,
}: ChatLayoutProps) {
  const { route, navigate } = useRouter();
  const seed = React.useCallback(() => seedConversations(t, Date.now()), [t]);
  const chat = useChat({ send, persist: !embedded, seed, untitled: t.chat.newTitle });
  const renaming = useDialogTarget<Conversation>();
  const deleting = useDialogTarget<Conversation>();

  const current = route.name === "chat" ? chat.conversations.find((c) => c.id === route.id) : undefined;
  const busy = current ? chat.streaming.has(current.id) : false;
  const title =
    route.name === "chat"
      ? (current?.title ?? t.notFound.chatTitle)
      : route.name === "settings"
        ? t.settings.title
        : route.name === "notFound"
          ? t.notFound.title
          : t.chat.newTitle;

  React.useEffect(() => {
    if (!embedded) document.title = `${title} · ${t.appName}`;
  }, [embedded, title, t.appName]);

  // Esc stops the reply in the open conversation, unless a dialog or menu used it to close.
  const stopOnEscape = (e: KeyboardEvent | React.KeyboardEvent) => {
    if (e.key !== "Escape" || e.defaultPrevented || !current || !busy) return;
    e.preventDefault();
    chat.stop(current.id);
  };
  const stopRef = React.useRef(stopOnEscape);
  React.useEffect(() => {
    stopRef.current = stopOnEscape;
  });
  React.useEffect(() => {
    if (embedded) return;
    const onKeyDown = (e: KeyboardEvent) => stopRef.current(e);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [embedded]);

  const sendQuestion = (text: string, files: File[]) => {
    const id = chat.send(current?.id ?? null, text, files);
    if (id !== current?.id) navigate({ name: "chat", id });
  };

  const remove = (c: Conversation) => {
    chat.remove(c.id);
    if (c.id === current?.id) navigate({ name: "new" }, { replace: true });
    toast({ intent: "success", title: t.remove.done });
  };

  const Main = embedded ? "div" : "main";
  const Heading = embedded ? "h2" : "h1";

  let page: React.ReactNode;
  if (route.name === "new" || current) {
    page = (
      <ChatPage
        t={t}
        conversation={current}
        busy={busy}
        embedded={embedded}
        onSend={sendQuestion}
        onStop={() => current && chat.stop(current.id)}
        onRegenerate={() => current && chat.regenerate(current.id)}
      />
    );
  } else if (route.name === "settings") {
    page = (
      <SettingsPage
        t={t}
        embedded={embedded}
        appearance={appearance}
        onAppearanceChange={onAppearanceChange}
        conversations={chat.conversations}
        onClear={chat.clear}
        failReplies={failReplies}
        onFailRepliesChange={onFailRepliesChange}
      />
    );
  } else {
    page = <NotFoundPage t={t} kind={route.name === "chat" ? "chat" : "page"} />;
  }

  return (
    <AppShell
      lang={t.lang}
      breakpoint="3xl"
      onKeyDown={embedded ? stopOnEscape : undefined}
      // Embedded: fills the preview, no skip link, sidebar state not saved.
      className={embedded ? "h-full" : undefined}
      persistKey={embedded ? undefined : "chat-sidebar"}
      skipLink={!embedded}
    >
      {!embedded && <PageProgress />}

      <ChatSidebar
        t={t}
        conversations={chat.conversations}
        streaming={chat.streaming}
        onRename={renaming.show}
        onDelete={deleting.show}
      />

      <AppShellHeader className="gap-1 px-2 @xl/app-shell:px-4">
        <SidebarTrigger />
        <Heading className="min-w-0 flex-1 truncate px-1 text-subtitle2 font-semibold">{title}</Heading>
        <div className="flex shrink-0 items-center gap-1">
          {current && (
            <ConversationMenu
              conversation={current}
              label={t.chat.options}
              t={t}
              onRename={renaming.show}
              onDelete={deleting.show}
              size="medium"
            />
          )}
          {route.name !== "new" && <HeaderNewChat t={t} />}
          <ThemeMenu appearance={appearance} onChange={onAppearanceChange} t={t} />
        </div>
      </AppShellHeader>

      <AppShellMain asChild className="flex flex-col">
        <Main>
          <ErrorBoundary resetKeys={[JSON.stringify(route)]}>
            <React.Suspense fallback={<PageFallback embedded={embedded} />}>{page}</React.Suspense>
          </ErrorBoundary>
        </Main>
      </AppShellMain>

      <RenameDialog
        open={renaming.open}
        conversation={renaming.target}
        onOpenChange={renaming.onOpenChange}
        onRename={(value) => renaming.target && chat.rename(renaming.target.id, value)}
        t={t}
      />
      <ConfirmDialog
        open={deleting.open}
        onOpenChange={deleting.onOpenChange}
        title={t.remove.title}
        body={t.remove.body(deleting.target?.title ?? "")}
        confirm={t.remove.confirm}
        cancel={t.remove.cancel}
        onConfirm={() => deleting.target && remove(deleting.target)}
      />
    </AppShell>
  );
}
