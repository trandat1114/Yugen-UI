import * as React from "react";
import type { AdminApi, Session } from "./api";

/*
 * Mock session, kept in sessionStorage: it lasts until the tab is closed. Replace `signIn` / `verify` in api.ts with
 * your auth provider and keep the rest: pages read `useAuth()`, and Layout sends visitors without a session to the
 * sign-in page, then back to where they were.
 */

const SESSION_KEY = "yugen-admin-session";
/** Email that passed the password step and waits for its code. */
const PENDING_KEY = "yugen-admin-pending";
const SIGNED_OUT_KEY = "yugen-admin-signed-out";

/**
 * The first visit in a tab starts signed in as the demo user, so the app opens on its data. Sign out to see the sign-in
 * flow and the redirect. Set to false (or delete it) when you connect real authentication.
 */
export const DEMO_AUTO_SIGN_IN = true;

interface AuthValue {
  session: Session | null;
  pendingEmail: string | null;
  /** Step 1: email and password. Rejects with ApiError 401. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Step 2: the code. Rejects with ApiError 401, or when there is no pending sign-in. */
  verify: (code: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthValue | null>(null);

export function useAuth() {
  const value = React.useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

function read(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null; // storage blocked
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* storage blocked */
  }
}

function savedSession(demo: Session): Session | null {
  try {
    const saved = read(SESSION_KEY);
    if (saved) return JSON.parse(saved) as Session;
  } catch {
    /* not JSON */
  }
  return DEMO_AUTO_SIGN_IN && !read(SIGNED_OUT_KEY) ? demo : null;
}

export interface AuthProviderProps {
  api: AdminApi;
  /** User of the automatic demo session. */
  demo: Session;
  /** Embedded preview: signed in as the demo user, kept in memory only. */
  embedded: boolean;
  children: React.ReactNode;
}

export function AuthProvider({ api, demo, embedded, children }: AuthProviderProps) {
  const [session, setSession] = React.useState<Session | null>(() => (embedded ? demo : savedSession(demo)));
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(() => (embedded ? null : read(PENDING_KEY)));

  React.useEffect(() => {
    if (embedded) return;
    write(SESSION_KEY, session && JSON.stringify(session));
    write(PENDING_KEY, pendingEmail);
  }, [embedded, session, pendingEmail]);

  const value = React.useMemo<AuthValue>(
    () => ({
      session,
      pendingEmail,
      signIn: async (email, password) => {
        await api.signIn(email, password);
        setPendingEmail(email.trim());
      },
      verify: async (code) => {
        if (!pendingEmail) throw new Error("No sign-in is waiting for a code.");
        const next = await api.verifyCode(pendingEmail, code);
        setPendingEmail(null);
        setSession(next);
      },
      signOut: () => {
        setSession(null);
        if (!embedded) write(SIGNED_OUT_KEY, "1");
      },
    }),
    [api, embedded, session, pendingEmail],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
