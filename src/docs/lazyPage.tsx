import type { ComponentType } from "react";

export type PreloadableComponent<P> = ComponentType<P> & { preload: () => Promise<void> };

/**
 * Như `React.lazy` nhưng nạp trước được: sau khi `preload()` xong, lần render đầu không treo. main.tsx nạp trước phần của
 * route hiện tại rồi mới render, để HTML prerender được thay bằng trang hoàn chỉnh trong một lần (không nháy khung xương).
 */
export function lazyPage<P extends object>(load: () => Promise<ComponentType<P>>): PreloadableComponent<P> {
  let Loaded: ComponentType<P> | undefined;
  let failure: { error: unknown } | undefined;
  let pending: Promise<void> | undefined;

  const preload = () =>
    (pending ??= load().then(
      (component) => void (Loaded = component),
      (error: unknown) => {
        // Lỗi mạng: lần render này báo lỗi (ErrorBoundary), lần sau thử nạp lại.
        failure = { error };
        pending = undefined;
      },
    ));

  function LazyPage(props: P) {
    if (failure) {
      const { error } = failure;
      failure = undefined;
      throw error;
    }
    if (!Loaded) throw preload();
    return <Loaded {...props} />;
  }
  return Object.assign(LazyPage, { preload });
}
