import * as React from "react";
import {
  People20Filled,
  People20Regular,
  Receipt20Filled,
  Receipt20Regular,
  Settings20Regular,
  SignOut20Regular,
} from "@fluentui/react-icons";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Avatar,
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Nav,
  NavItem,
  PageProgressFallback,
  Persona,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SkeletonText,
  SimpleTooltip,
  toast,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useAuth } from "./auth";
import { useAdmin } from "./context";
import { isPublic, Link, useRouter, type Route } from "./router";

// Each page is its own chunk; hovering or focusing a nav item starts the download.
const loaders = {
  customers: () => import("./pages/CustomersPage"),
  customer: () => import("./pages/CustomerPage"),
  orders: () => import("./pages/OrdersPage"),
  settings: () => import("./pages/SettingsPage"),
  signIn: () => import("./pages/SignInPage"),
  forgotPassword: () => import("./pages/ForgotPasswordPage"),
  verify: () => import("./pages/VerifyPage"),
  notFound: () => import("./pages/NotFoundPage"),
};
const CustomersPage = React.lazy(loaders.customers);
const CustomerPage = React.lazy(loaders.customer);
const OrdersPage = React.lazy(loaders.orders);
const SettingsPage = React.lazy(loaders.settings);
const SignInPage = React.lazy(loaders.signIn);
const ForgotPasswordPage = React.lazy(loaders.forgotPassword);
const VerifyPage = React.lazy(loaders.verify);
const NotFoundPage = React.lazy(loaders.notFound);

type Section = "customers" | "orders";

const SECTIONS: { id: Section; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
  { id: "customers", icon: <People20Regular />, activeIcon: <People20Filled /> },
  { id: "orders", icon: <Receipt20Regular />, activeIcon: <Receipt20Filled /> },
];

function sectionOf(route: Route): Section | undefined {
  if (route.name === "customers" || route.name === "customer") return "customers";
  if (route.name === "orders") return "orders";
  return undefined;
}

function Logo() {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background font-display text-subtitle2 font-semibold text-foreground-on-brand"
    >
      桜
    </span>
  );
}

function PageFallback() {
  const { embedded } = useAdmin();
  const skeleton = (
    <div className="mx-auto w-full max-w-7xl p-6">
      <SkeletonText lines={5} />
    </div>
  );
  return embedded ? skeleton : <PageProgressFallback>{skeleton}</PageProgressFallback>;
}

/** Below the top bar; collapses to icons on wide screens and opens as a Drawer on narrow ones. */
function AppSidebar() {
  const { t } = useAdmin();
  const { route } = useRouter();
  const section = sectionOf(route);
  return (
    <Sidebar defaultWidth={224} label={t.appName}>
      <SidebarContent>
        <Nav selectedValue={section} aria-label={t.nav.label}>
          {SECTIONS.map((item) => (
            <NavItem key={item.id} value={item.id} asChild tooltip={t.nav[item.id]}>
              <Link to={{ name: item.id }} onPointerEnter={() => void loaders[item.id]()} onFocus={() => void loaders[item.id]()}>
                {section === item.id ? item.activeIcon : item.icon}
                <span className="min-w-0 flex-1 truncate">{t.nav[item.id]}</span>
              </Link>
            </NavItem>
          ))}
        </Nav>
      </SidebarContent>
    </Sidebar>
  );
}

function UserMenu() {
  const { t } = useAdmin();
  const { session, signOut } = useAuth();
  const { navigate } = useRouter();
  if (!session) return null;
  return (
    <Menu>
      <MenuTrigger asChild>
        <button type="button" className="rounded-circular">
          <span className="sr-only">{t.nav.account}: </span>
          <Avatar name={session.name} size={32} color="brand" />
        </button>
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-60">
        <Persona name={session.name} secondaryText={session.email} size="medium" avatar={{ color: "brand" }} className="px-2 py-2" />
        <MenuDivider />
        <MenuItem
          icon={<SignOut20Regular />}
          onSelect={() => {
            signOut();
            navigate({ name: "signIn" });
            toast({ intent: "info", title: t.nav.signedOut });
          }}
        >
          {t.nav.signOut}
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
}

/** Frame of the signed-in pages: top bar across, sidebar below it (a Drawer on narrow screens) and the page. */
function Shell({ children }: { children: React.ReactNode }) {
  const { t, embedded } = useAdmin();
  const { route } = useRouter();
  const scrollRef = React.useRef<HTMLElement>(null);
  // Embedded: no landmarks that would clash with the host page's own <header> and <main>.
  const Header = embedded ? "div" : "header";
  const Main = embedded ? "div" : "main";

  // A new page starts at the top.
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [route]);

  return (
    <AppShell
      layout="header"
      // Embedded: fills the preview, no skip link, sidebar state not saved.
      className={embedded ? "h-full" : undefined}
      persistKey={embedded ? undefined : "admin-sidebar"}
      skipLink={!embedded}
    >
      <AppShellHeader asChild>
        <Header>
          <SidebarTrigger />
          <Link to={{ name: "customers" }} className="flex min-w-0 items-center gap-2 rounded-medium pe-1">
            <Logo />
            <span className="truncate text-body1 font-semibold">{t.appName}</span>
          </Link>
          <div className="ms-auto flex shrink-0 items-center gap-1">
            <SimpleTooltip content={t.nav.settings}>
              <Button asChild appearance="subtle" iconOnly>
                <Link to={{ name: "settings" }} aria-label={t.nav.settings} aria-current={route.name === "settings" ? "page" : undefined}>
                  <Settings20Regular />
                </Link>
              </Button>
            </SimpleTooltip>
            <UserMenu />
          </div>
        </Header>
      </AppShellHeader>

      <AppSidebar />

      <AppShellMain asChild ref={scrollRef}>
        <Main>
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 @3xl/app-shell:p-6">{children}</div>
        </Main>
      </AppShellMain>
    </AppShell>
  );
}

/** Frame of the sign-in pages: the form centered on the page. */
function AuthFrame({ children }: { children: React.ReactNode }) {
  const { t, embedded } = useAdmin();
  const Main = embedded ? "div" : "main";
  return (
    <Main className={cn("@container/app-shell overflow-y-auto bg-background-2 text-foreground-1", embedded ? "h-full" : "min-h-dvh")}>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 @3xl/app-shell:py-16">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-body1 font-semibold">{t.appName}</span>
        </div>
        {children}
      </div>
    </Main>
  );
}

function titleOf(route: Route, t: ReturnType<typeof useAdmin>["t"]) {
  switch (route.name) {
    case "customers":
      return t.customers.title;
    case "customer":
      return t.customer.title;
    case "orders":
      return t.orders.title;
    case "settings":
      return t.settings.title;
    case "signIn":
      return t.signIn.title;
    case "forgotPassword":
      return t.forgot.title;
    case "verify":
      return t.verify.title;
    default:
      return t.notFound.title;
  }
}

/**
 * The page for the route. Pages other than sign-in need a session: without one, the visitor goes to the sign-in page,
 * which brings them back here afterwards (`next`).
 */
export function Layout() {
  const { t, embedded } = useAdmin();
  const { route, path, navigate } = useRouter();
  const { session } = useAuth();
  const open = isPublic(route);
  const blocked = !open && !session;

  React.useEffect(() => {
    if (blocked) navigate({ name: "signIn", next: path }, { replace: true });
  }, [blocked, navigate, path]);

  React.useEffect(() => {
    if (!embedded) document.title = t.pageTitle(titleOf(route, t));
  }, [embedded, route, t]);

  if (blocked) return null;

  const page =
    route.name === "customers" ? (
      <CustomersPage />
    ) : route.name === "customer" ? (
      <CustomerPage key={route.id} id={route.id} />
    ) : route.name === "orders" ? (
      <OrdersPage />
    ) : route.name === "settings" ? (
      <SettingsPage />
    ) : route.name === "signIn" ? (
      <SignInPage next={route.next} />
    ) : route.name === "forgotPassword" ? (
      <ForgotPasswordPage />
    ) : route.name === "verify" ? (
      <VerifyPage next={route.next} />
    ) : (
      <NotFoundPage />
    );
  const content = <React.Suspense fallback={<PageFallback />}>{page}</React.Suspense>;
  return open ? <AuthFrame>{content}</AuthFrame> : <Shell>{content}</Shell>;
}
