import path from "node:path";
import { css, type CssOptions } from "./commands/css.js";

type FileWatcher = {
  on(event: string, listener: (file: string) => void): unknown;
  off?: (event: string, listener: (file: string) => void) => unknown;
};

export interface YugenCssViteServer {
  watcher: FileWatcher;
}

export interface YugenCssVitePlugin {
  name: string;
  enforce: "pre";
  buildStart(): Promise<void>;
  configureServer(server: YugenCssViteServer): (() => void) | void;
}

export interface YugenCssViteOptions {
  cwd?: string;
  src?: string[];
  out?: string;
  precompile?: boolean;
  debounceMs?: number;
}

const CODE_FILE = /\.(?:[cm]?[jt]sx?|vue|svelte)$/i;
const SKIP_PART = /(^|[\\/])(node_modules|dist|build|out|coverage|public|storybook-static)([\\/]|$)/;

const request = (opts: YugenCssViteOptions, cwd: string) =>
  ({ cwd, src: opts.src, out: opts.out, precompile: opts.precompile } satisfies Omit<CssOptions, "check" | "mainCss" | "extra">);

/** Vite plugin that keeps the lean `yugen-ui.css` file in sync during dev and before a build. */
export function yugenCss(options: YugenCssViteOptions = {}): YugenCssVitePlugin {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const debounceMs = options.debounceMs ?? 160;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = Promise.resolve();
  const relevant = (file: string) => {
    const abs = path.resolve(file);
    const rel = path.relative(cwd, abs);
    return rel && !rel.startsWith("..") && !path.isAbsolute(rel) && CODE_FILE.test(abs) && !SKIP_PART.test(rel);
  };
  const regenerate = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      running = running
        .then(async () => {
          await css(request(options, cwd));
        })
        .catch((error) => console.error(`[yugen-ui] ${(error as Error).message}`));
    }, debounceMs);
  };

  return {
    name: "yugen-ui-css",
    enforce: "pre",
    async buildStart() {
      await css(request(options, cwd));
    },
    configureServer(server) {
      const listener = (file: string) => {
        if (relevant(file)) regenerate();
      };
      for (const event of ["add", "change", "unlink"]) server.watcher.on(event, listener);
      return () => {
        if (timer) clearTimeout(timer);
        for (const event of ["add", "change", "unlink"]) server.watcher.off?.(event, listener);
      };
    },
  };
}

export default yugenCss;
