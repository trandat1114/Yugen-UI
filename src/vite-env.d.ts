/// <reference types="vite/client" />

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
