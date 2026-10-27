import * as React from "react";
import {
  Navigation20Regular,
  People20Filled,
  People20Regular,
  Receipt20Filled,
  Receipt20Regular,
  Settings20Regular,
  SignOut20Regular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerSurface,
  Menu,
  MenuDivider,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Nav,
  NavItem,
  PageProgressFallback,
  Persona,
  SkeletonText,
  SimpleTooltip,
  toast,
} from "yugen-ui";
import { cn } from "yugen-ui";
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

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useAdmin();
  const { route } = useRouter();
  const section = sectionOf(route);
  return (
    <Nav selectedValue={section} aria-label={t.nav.label} className="px-2 py-3">
      {SECTIONS.map((item) => (
        <NavItem key={item.id} value={item.id} asChild>
          <Link
            to={{ name: item.id }}
            onClick={onNavigate}
            onPointerEnter={() => void loaders[item.id]()}
            onFocus={() => void loaders[item.id]()}
          >
            {section === item.id ? item.activeIcon : item.icon}
            <span className="min-w-0 flex-1 truncate">{t.nav[item.id]}</span>
          </Link>
        </NavItem>
      ))}
    </Nav>
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

/** Frame of the signed-in pages: top bar, sidebar (a Drawer on narrow screens) and the page. */
function Shell({ children }: { children: React.ReactNode }) {
  const { t, embedded } = useAdmin();
  const { route } = useRouter();
  const [navOpen, setNavOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  // Embedded: no landmarks that would clash with the host page's own <header> and <main>.
  const Header = embedded ? "div" : "header";
  const Main = embedded ? "div" : "main";

  // A new page starts at the top.
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [route]);

  return (
    <div className={cn("@container/app flex flex-col bg-background-2 text-foreground-1", embedded ? "h-full" : "h-dvh")}>
      {!embedded && (
        <a
          href="#content"
          className="sr-only rounded-medium bg-background-1 px-3 py-2 text-body1 font-semibold shadow-8 focus:not-sr-only focus:fixed focus:inset-s-2 focus:top-2 focus:z-50"
        >
          {t.nav.skip}
        </a>
      )}
      <Header className="flex h-14 shrink-0 items-center gap-2 border-b border-stroke-2 bg-background-1 px-3 @3xl/app:px-4">
        <Button appearance="subtle" icon={<Navigation20Regular />} aria-label={t.nav.open} className="@4xl/app:hidden" onClick={() => setNavOpen(true)} />
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

      <div className="flex min-h-0 flex-1">
        <div className="hidden w-56 shrink-0 overflow-y-auto border-e border-stroke-2 bg-background-1 @4xl/app:block">
          <Sidebar />
        </div>
        <Main
          ref={scrollRef}
          id={embedded ? undefined : "content"}
          tabIndex={embedded ? undefined : -1}
          className="min-w-0 flex-1 overflow-y-auto outline-none"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 @3xl/app:p-6">{children}</div>
        </Main>
      </div>

      <Drawer open={navOpen} onOpenChange={setNavOpen}>
        <DrawerSurface position="start" size="small" aria-describedby={undefined} className="flex flex-col p-0">
          <DrawerHeader className="flex-row items-center gap-2 border-b border-stroke-2 px-4 py-3">
            <Logo />
            <DrawerHeaderTitle>{t.appName}</DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody className="p-0">
            <Sidebar onNavigate={() => setNavOpen(false)} />
          </DrawerBody>
        </DrawerSurface>
      </Drawer>
    </div>
  );
}

/** Frame of the sign-in pages: the form centered on the page. */
function AuthFrame({ children }: { children: React.ReactNode }) {
  const { t, embedded } = useAdmin();
  const Main = embedded ? "div" : "main";
  return (
    <Main className={cn("@container/app overflow-y-auto bg-background-2 text-foreground-1", embedded ? "h-full" : "min-h-dvh")}>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 @3xl/app:py-16">
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
