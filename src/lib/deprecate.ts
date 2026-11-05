/**
 * Warns about an API that is going away: development only, once per `id`.
 * The app's bundler (Vite, webpack, Next.js) replaces `process.env.NODE_ENV` in production builds, so the call is
 * removed; without `process` (plain ESM in the browser) it stays silent.
 *
 * ```ts
 * if (appearance === "transparent") warnDeprecated("Button.appearance.transparent", 'use appearance="subtle"', "1.0.0");
 * ```
 */
const warned = new Set<string>();

/** The versioning and deprecation policy, linked from every warning. */
const VERSIONING_URL = "https://trandat1114.github.io/Yugen-UI/concepts/versioning";

// Declared here so neither the library build nor the app needs @types/node.
declare const process: { env: { NODE_ENV?: string } };

function isDev(): boolean {
  try {
    return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

/** A development-only console warning, once per `id`. */
export function warnDev(id: string, message: string): void {
  if (!isDev() || warned.has(id)) return;
  warned.add(id);
  console.warn(`[yugen-ui] ${message}`);
}

export function warnDeprecated(id: string, replacement: string, removedIn?: string): void {
  const when = removedIn ? `will be removed in v${removedIn}` : "will be removed in the next major version";
  warnDev(id, `"${id}" is deprecated and ${when}: ${replacement}. See ${VERSIONING_URL}`);
}

/** Tests only: lets every warning fire again. */
export function resetDeprecationWarnings(): void {
  warned.clear();
}
