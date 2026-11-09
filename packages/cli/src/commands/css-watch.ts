import fs from "node:fs";
import path from "node:path";
import { findGenerated } from "../lib/leanCss.js";
import { CliError } from "../lib/errors.js";
import { exists } from "../lib/fs.js";
import { p } from "../lib/ui.js";
import { css, type CssOptions } from "./css.js";

const CODE_FILE = /\.(?:[cm]?[jt]sx?|vue|svelte)$/i;
const SKIP_DIRS = new Set(["node_modules", "dist", "build", "out", "coverage", "public", "storybook-static"]);

export interface CssWatchOptions extends Omit<CssOptions, "check"> {
  check?: boolean;
  signal?: AbortSignal;
  debounceMs?: number;
}

const isCodeFile = (file: string) => {
  const parts = file.split(path.sep);
  return CODE_FILE.test(file) && !parts.some((part) => SKIP_DIRS.has(part));
};

function directories(root: string): string[] {
  const start = path.resolve(root);
  if (!exists(start)) return [];
  if (!fs.statSync(start).isDirectory()) return [path.dirname(start)];

  const result: string[] = [];
  const pending = [start];
  while (pending.length) {
    const dir = pending.pop()!;
    result.push(dir);
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isDirectory() && !SKIP_DIRS.has(entry.name) && (!entry.name.startsWith(".") || entry.name === ".storybook"))
        pending.push(path.join(dir, entry.name));
    }
  }
  return result;
}

function watchDirectories(roots: string[], signal: AbortSignal, onChange: (file: string) => void): () => void {
  const watchers = new Map<string, fs.FSWatcher>();
  const seen = new Set<string>();

  const add = (dir: string) => {
    const abs = path.resolve(dir);
    if (seen.has(abs) || !exists(abs)) return;
    let stat: fs.Stats;
    try {
      stat = fs.statSync(abs);
    } catch {
      return;
    }
    if (!stat.isDirectory()) return;
    seen.add(abs);
    try {
      const watcher = fs.watch(abs, { signal }, (event, filename) => {
        const name = filename?.toString();
        const file = name ? path.join(abs, name) : abs;
        if (event === "rename" && exists(file)) {
          try {
            if (fs.statSync(file).isDirectory()) for (const nested of directories(file)) add(nested);
          } catch {
            // The path may disappear between the rename event and stat.
          }
        }
        if (!name || isCodeFile(file)) onChange(file);
      });
      watcher.on("error", (error) => {
        if (!signal.aborted) p.log.warn(`yugen css --watch: ${error.message}`);
      });
      watchers.set(abs, watcher);
    } catch (error) {
      if (!signal.aborted) p.log.warn(`yugen css --watch: cannot watch ${abs}: ${(error as Error).message}`);
    }
  };

  for (const root of roots) for (const dir of directories(root)) add(dir);

  return () => {
    for (const watcher of watchers.values()) watcher.close();
    watchers.clear();
  };
}

function rootsFor(opts: CssWatchOptions): string[] {
  if (opts.src?.length) return opts.src.map((dir) => path.resolve(opts.cwd, dir));
  const generated = findGenerated(opts.cwd)[0];
  if (generated?.recorded.src?.length) return generated.recorded.src.map((dir) => path.resolve(opts.cwd, dir));
  return [opts.cwd];
}

/** Chạy `yugen css` rồi giữ tiến trình để tự cập nhật khi import component thay đổi. */
export async function watchCss(opts: CssWatchOptions): Promise<void> {
  if (opts.check) throw new CliError("`yugen css --watch` cannot be combined with `--check`.");
  const { signal = new AbortController().signal, debounceMs = 160 } = opts;
  await css(opts);
  if (signal.aborted) return;

  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = Promise.resolve();
  const update = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      running = running
        .then(async () => {
          await css(opts);
        })
        .catch((error) => p.log.error(`yugen css --watch: ${(error as Error).message}`));
    }, debounceMs);
  };
  const stopWatching = watchDirectories(rootsFor(opts), signal, update);
  p.log.info("Watching app imports for yugen-ui component changes. Press Ctrl+C to stop.");

  await new Promise<void>((resolve) => {
    const done = () => {
      if (timer) clearTimeout(timer);
      stopWatching();
      resolve();
    };
    if (signal.aborted) done();
    else signal.addEventListener("abort", done, { once: true });
  });
}
