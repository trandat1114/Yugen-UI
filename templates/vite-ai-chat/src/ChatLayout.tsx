import * as React from "react";
import { Compose20Regular, Navigation20Regular } from "@fluentui/react-icons";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerSurface,
  PageProgress,
  PageProgressFallback,
  SkeletonText,
  toast,
} from "yugen-ui";
import type { SendMessage } from "./api";
import type { Appearance } from "./appearance";
import { Logo } from "./Brand";
import { seedConversations, type Conversation } from "./conversations";
import type { Content } from "./content/types";
import { ConfirmDialog, RenameDialog, useDialogTarget } from "./Dialogs";
import { Link, useRouter } from "./router";
import { ConversationMenu, Sidebar } from "./Sidebar";
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
  const [navOpen, setNavOpen] = React.useState(false);
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

  const sidebar = (
    <Sidebar
      t={t}
      conversations={chat.conversations}
      streaming={chat.streaming}
      onNavigate={() => setNavOpen(false)}
      onRename={renaming.show}
      onDelete={deleting.show}
    />
  );

  return (
    <div
      lang={t.lang}
      onKeyDown={embedded ? stopOnEscape : undefined}
      className={`@container flex bg-background-2 text-foreground-1 ${embedded ? "h-full" : "h-dvh"}`}
    >
      {!embedded && <PageProgress />}

      <div className="hidden w-68 shrink-0 flex-col border-e border-stroke-2 bg-background-1 @3xl:flex">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-stroke-2 px-4">
          <Logo />
          <span className="truncate text-body1 font-semibold">{t.appName}</span>
        </div>
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-stroke-2 bg-background-1 px-2 @xl:px-4">
          <Button appearance="subtle" icon={<Navigation20Regular />} aria-label={t.nav.open} className="@3xl:hidden" onClick={() => setNavOpen(true)} />
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
            {route.name !== "new" && (
              <Button asChild appearance="subtle" className="@3xl:hidden">
                <Link to={{ name: "new" }} aria-label={t.nav.newChat}>
                  <Compose20Regular aria-hidden />
                </Link>
              </Button>
            )}
            <ThemeMenu appearance={appearance} onChange={onAppearanceChange} t={t} />
          </div>
        </header>

        <Main className="flex min-h-0 flex-1 flex-col">
          <React.Suspense fallback={<PageFallback embedded={embedded} />}>{page}</React.Suspense>
        </Main>
      </div>

      <Drawer open={navOpen} onOpenChange={setNavOpen}>
        <DrawerSurface position="start" size="small" aria-describedby={undefined} className="flex flex-col p-0">
          <DrawerHeader className="flex-row items-center gap-2 border-b border-stroke-2 px-4 py-3">
            <Logo />
            <DrawerHeaderTitle>{t.appName}</DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody className="min-h-0 flex-1 p-0">{sidebar}</DrawerBody>
        </DrawerSurface>
      </Drawer>

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
    </div>
  );
}
