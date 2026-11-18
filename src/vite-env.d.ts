/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Docs analytics collector (#190); unset = no beacon. */
  readonly VITE_ANALYTICS_URL?: string;
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
