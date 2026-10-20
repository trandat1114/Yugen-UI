import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

/** Ẩn tạm các global của trình duyệt để `typeof window === "undefined"` như trên server thật (Node của Next.js). */
export function withoutBrowserGlobals<T>(fn: () => T): T {
  const keys = ["window", "document", "localStorage", "sessionStorage", "matchMedia"] as const;
  const saved = keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  for (const key of keys) {
    Object.defineProperty(globalThis, key, { value: undefined, configurable: true, writable: true });
  }
  try {
    return fn();
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete (globalThis as Record<string, unknown>)[key];
    }
  }
}

/** `renderToString` như trên server thật (không có window / document / localStorage). */
export function renderOnServer(element: ReactElement): string {
  return withoutBrowserGlobals(() => renderToString(element));
}
