import { createContext, useContext } from "react";
import { loadDocs, parseFrontmatter, type DocPage, type Docs } from "./docs";
import type { Content } from "./content/types";

// Every file in content/<lang>/docs/<section>/: adding a page is adding a .md file. An app made with `create --lang` keeps
// one language folder.
//
// Front matter for the sidebar, loaded up front. The docsContent plugin in vite.config.ts trims these imports to the front
// matter, so the first load stays small however many pages there are. Without the plugin (the preview on the Yugen UI
// docs) they hold the whole file, which works the same.
const meta = import.meta.glob<string>("./content/*/docs/*/*.md", { query: "?raw&meta", import: "default", eager: true });
// Page text: one chunk per page, loaded when the page opens.
const bodies = import.meta.glob<string>(["./content/*/docs/*/*.md", "!./content/*/docs/*/index.md"], { query: "?raw", import: "default" });

const cache = new Map<string, Docs>();

/** Sections and pages of one language (content/<lang>/docs). */
export function docsFor(lang: string): Docs {
  let docs = cache.get(lang);
  if (!docs) {
    const prefix = `./content/${lang}/docs/`;
    docs = loadDocs(Object.fromEntries(Object.entries(meta).filter(([file]) => file.startsWith(prefix))));
    cache.set(lang, docs);
  }
  return docs;
}

const texts = new Map<string, Promise<string>>();

/** Markdown of a page without its front matter. Cached: readPromise() needs the same promise on every render. */
export function loadPage(lang: string, page: DocPage): Promise<string> {
  const file = `./content/${lang}/docs/${page.key}.md`;
  let text = texts.get(file);
  if (!text) {
    const load = bodies[file];
    text = load ? load().then((raw) => parseFrontmatter(raw).body) : Promise.reject(new Error(`${file} not found`));
    texts.set(file, text);
  }
  return text;
}

const settled = new WeakMap<Promise<unknown>, { done: boolean; value?: unknown; error?: unknown; failed?: boolean }>();

/**
 * Read a promise inside a Suspense boundary, on React 18 and 19 alike (React.use is React 19 only): throws the promise
 * while it is pending, then returns its value or throws its error. The promise must be cached (loadPage caches per file).
 */
export function readPromise<T>(promise: Promise<T>): T {
  let state = settled.get(promise);
  if (!state) {
    const entry: { done: boolean; value?: unknown; error?: unknown; failed?: boolean } = { done: false };
    settled.set(promise, entry);
    promise.then(
      (value) => Object.assign(entry, { done: true, value }),
      (error) => Object.assign(entry, { done: true, failed: true, error }),
    );
    state = entry;
  }
  if (!state.done) throw promise;
  if (state.failed) throw state.error;
  return state.value as T;
}

export interface Site {
  t: Content;
  docs: Docs;
}

/** Text and pages of the language in use, provided by Layout. */
export const SiteContext = createContext<Site | null>(null);

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite must be used inside <Layout>");
  return value;
}
