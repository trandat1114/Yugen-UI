import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Cloudflare Turnstile for the VietQR acknowledgement form (yugen-analytics-api #14). Off unless the build sets
 * VITE_TURNSTILE_SITE_KEY. The script loads on the first focus inside the form, never with the page, and the check runs
 * when the form is sent (`execution: "execute"`), so every submission gets a fresh token (single-use, valid 300 s).
 * When the script is blocked or the check fails, the form sends without a token and the API decides
 * (TURNSTILE_REQUIRED). Local testing: Cloudflare's test site key `1x00000000000000000000AA` always passes.
 */
export const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
/** Up to 32 characters of [A-Za-z0-9_-]; the API can tell this widget's tokens apart in analytics. */
export const TURNSTILE_ACTION = "support-acknowledgement";
/** Longest wait for the script, and for a check nobody finishes (Turnstile has its own timeout too). */
const LOAD_TIMEOUT_MS = 15_000;
const CHECK_TIMEOUT_MS = 120_000;

type Callback = (...args: never[]) => void;

export interface TurnstileApi {
  render(container: HTMLElement, params: Record<string, string | boolean | Callback>): string | null | undefined;
  execute(container: HTMLElement): void;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    /** The `onload` callback of api.js while it loads. */
    yugenTurnstileReady?: () => void;
  }
}

let loading: Promise<TurnstileApi> | null = null;

/** Loads api.js once from Cloudflare (never proxied or cached: the docs say that breaks on updates). */
export function loadTurnstile(timeoutMs = LOAD_TIMEOUT_MS): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    const done = (api?: TurnstileApi) => {
      window.clearTimeout(timer);
      delete window.yugenTurnstileReady;
      if (api) return resolve(api);
      script.remove();
      loading = null;
      reject(new Error("turnstile_unavailable"));
    };
    const timer = window.setTimeout(() => done(), timeoutMs);
    window.yugenTurnstileReady = () => done(window.turnstile);
    script.src = `${TURNSTILE_SCRIPT}&onload=yugenTurnstileReady`;
    script.async = true;
    script.onerror = () => done();
    document.head.append(script);
  });
  return loading;
}

/** For tests: forget the loaded script. */
export function resetTurnstileLoader() {
  loading = null;
}

export interface Turnstile {
  /** The element the widget renders into. It stays empty until the visitor has to click something. */
  ref: RefObject<HTMLDivElement | null>;
  /** True while the check waits for the visitor. */
  interactive: boolean;
  /** Loads the script and renders the widget; call on the first focus inside the form. */
  prepare: () => void;
  /** A fresh token, or undefined when Turnstile is off, blocked, unsupported or failed. */
  token: () => Promise<string | undefined>;
}

export function useTurnstile(siteKey: string | undefined, language: "en" | "vi"): Turnstile {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<Promise<string | null> | null>(null);
  const pending = useRef<((token?: string) => void) | null>(null);
  const used = useRef(false);
  const [interactive, setInteractive] = useState(false);

  const settle = useCallback((token?: string) => {
    const resolve = pending.current;
    pending.current = null;
    setInteractive(false);
    resolve?.(token);
  }, []);

  const render = useCallback(() => {
    if (!siteKey) return Promise.resolve(null);
    widget.current ??= loadTurnstile()
      .then((api) => {
        const container = ref.current;
        if (!container) return null;
        return (
          api.render(container, {
            sitekey: siteKey,
            action: TURNSTILE_ACTION,
            language,
            theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
            // flexible = full width with a 300 px minimum; compact fits narrower cards.
            size: container.clientWidth > 0 && container.clientWidth < 300 ? "compact" : "flexible",
            execution: "execute",
            appearance: "interaction-only",
            "response-field": false,
            callback: (token: string) => settle(token),
            "error-callback": () => settle(),
            "timeout-callback": () => settle(),
            "unsupported-callback": () => settle(),
            "before-interactive-callback": () => setInteractive(true),
            "after-interactive-callback": () => setInteractive(false),
          }) ?? null
        );
      })
      .catch(() => {
        widget.current = null;
        return null;
      });
    return widget.current;
  }, [siteKey, language, settle]);

  const prepare = useCallback(() => {
    void render();
  }, [render]);

  const token = useCallback(async () => {
    const id = await render();
    const api = window.turnstile;
    const container = ref.current;
    if (!id || !api || !container) return undefined;
    return new Promise<string | undefined>((resolve) => {
      settle();
      const timer = window.setTimeout(() => settle(), CHECK_TIMEOUT_MS);
      pending.current = (value) => {
        window.clearTimeout(timer);
        resolve(value);
      };
      try {
        // Tokens are single-use: a second submission needs a new check.
        if (used.current) api.reset(id);
        used.current = true;
        api.execute(container);
      } catch {
        settle();
      }
    });
  }, [render, settle]);

  useEffect(
    () => () => {
      settle();
      const current = widget.current;
      widget.current = null;
      used.current = false;
      void current?.then((id) => id && window.turnstile?.remove(id));
    },
    [settle],
  );

  return { ref, interactive, prepare, token };
}
