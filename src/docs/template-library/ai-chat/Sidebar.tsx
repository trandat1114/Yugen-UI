import * as React from "react";
import { Compose20Regular, Delete20Regular, Edit20Regular, MoreHorizontal20Regular, Settings20Regular } from "@fluentui/react-icons";
import {
  Button,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Nav,
  NavItem,
  NavSectionHeader,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui";
import { Logo } from "./Brand";
import { groupConversations, type Conversation } from "./conversations";
import type { Content } from "./content/types";
import { Link, useRouter } from "./router";

export interface ConversationActions {
  onRename: (c: Conversation) => void;
  onDelete: (c: Conversation) => void;
}

/** Rename / delete menu for a conversation, on its sidebar row and in the header. */
export function ConversationMenu({
  conversation,
  label,
  t,
  onRename,
  onDelete,
  size = "small",
  className,
}: ConversationActions & { conversation: Conversation; label: string; t: Content; size?: "small" | "medium"; className?: string }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" size={size} icon={<MoreHorizontal20Regular />} aria-label={label} className={className} />
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-40">
        <MenuItem icon={<Edit20Regular />} onSelect={() => onRename(conversation)}>
          {t.chat.rename}
        </MenuItem>
        <MenuItem icon={<Delete20Regular />} onSelect={() => onDelete(conversation)}>
          {t.chat.delete}
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
}

export interface ChatSidebarProps extends ConversationActions {
  t: Content;
  conversations: Conversation[];
  streaming: ReadonlySet<string>;
}

/**
 * New chat, conversations grouped by date, and Settings. Hidden completely when collapsed (titles have no icons for a
 * rail); on narrow screens the same content opens in a Drawer that closes when a link is followed.
 */
export function ChatSidebar({ t, conversations, streaming, onRename, onDelete }: ChatSidebarProps) {
  const { route } = useRouter();
  const selected = route.name === "chat" ? route.id : undefined;
  // Date groups need the current time; it only has to be right to the day.
  const [now] = React.useState(() => Date.now());
  const groups = groupConversations(conversations, now);

  return (
    <Sidebar collapsible="offcanvas" defaultWidth={272} label={t.appName}>
      <SidebarHeader>
        <Logo />
        <span className="truncate text-body1 font-semibold">{t.appName}</span>
      </SidebarHeader>
      <div className="p-3">
        <Button asChild className="w-full justify-start">
          <Link to={{ name: "new" }} aria-current={route.name === "new" ? "page" : undefined}>
            <Compose20Regular aria-hidden />
            {t.nav.newChat}
          </Link>
        </Button>
      </div>

      <SidebarContent className="pt-0">
        <Nav aria-label={t.nav.label} selectedValue={selected}>
          {groups.map((group) => (
            <React.Fragment key={group.key}>
              <NavSectionHeader>{t.nav.groups[group.key]}</NavSectionHeader>
              {group.items.map((c) => (
                <div key={c.id} className="group/row relative">
                  <NavItem value={c.id} asChild className="pe-10">
                    <Link to={{ name: "chat", id: c.id }}>
                      <span className="min-w-0 flex-1 truncate">{c.title}</span>
                      {streaming.has(c.id) && (
                        <>
                          <span aria-hidden className="size-2 shrink-0 animate-pulse rounded-circular bg-brand-background motion-reduce:animate-none" />
                          <span className="sr-only">{t.nav.replying}</span>
                        </>
                      )}
                    </Link>
                  </NavItem>
                  <ConversationMenu
                    conversation={c}
                    label={t.nav.options(c.title)}
                    t={t}
                    onRename={onRename}
                    onDelete={onDelete}
                    // Shown on hover and focus with a mouse; always shown on touch screens.
                    className="absolute inset-e-1 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/row:opacity-100 group-hover/row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
        </Nav>
        {groups.length === 0 && <p className="px-3 py-2 text-caption1 text-foreground-3">{t.nav.empty}</p>}
      </SidebarContent>

      <SidebarFooter>
        <Button asChild appearance="subtle" className="w-full justify-start">
          <Link to={{ name: "settings" }} aria-current={route.name === "settings" ? "page" : undefined}>
            <Settings20Regular aria-hidden />
            {t.nav.settings}
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
