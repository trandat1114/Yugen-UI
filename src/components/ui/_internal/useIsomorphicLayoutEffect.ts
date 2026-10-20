import * as React from "react";

/**
 * `useLayoutEffect` trên trình duyệt, `useEffect` khi render ở server.
 * React 18 cảnh báo "useLayoutEffect does nothing on the server" mỗi lần SSR gặp useLayoutEffect (Next.js, Remix…);
 * trên client hành vi giống hệt useLayoutEffect (chạy đồng bộ trước khi trình duyệt vẽ).
 * Chỉ dùng nội bộ — không export qua barrel.
 */
export const useIsomorphicLayoutEffect: typeof React.useLayoutEffect =
  typeof window !== "undefined" && typeof window.document !== "undefined" ? React.useLayoutEffect : React.useEffect;
