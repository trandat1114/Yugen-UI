/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Docs analytics collector (#190); unset = no beacon. */
  readonly VITE_ANALYTICS_URL?: string;
  /** Support acknowledgement endpoint (#183); unset keeps the form visible but unavailable. */
  readonly VITE_SUPPORT_API_URL?: string;
  /** Cloudflare Turnstile site key for the support form (yugen-analytics-api #14); unset = no challenge. */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

/** Template sources are typechecked in the library repo; generated apps install this package separately. */
declare module "@yugen-ui/cli/vite" {
  export function yugenCss(options?: {
    cwd?: string;
    src?: string[];
    out?: string;
    precompile?: boolean;
    debounceMs?: number;
  }): import("vite").Plugin;
}
