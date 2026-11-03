import type { ComponentType } from "react";

export type PreloadableComponent<P> = ComponentType<P> & { preload: () => Promise<void>; prefetch: () => void };

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

  // Nạp trước khi người dùng trỏ / focus vào link (#305): như preload nhưng lỗi không giữ lại — lần render thật tự nạp lại.
  const prefetch = () => {
    if (Loaded || pending) return;
    void load().then(
      (component) => void (Loaded ??= component),
      () => {},
    );
  };

  function LazyPage(props: P) {
    if (failure) {
      const { error } = failure;
      failure = undefined;
      throw error;
    }
    if (!Loaded) throw preload();
    return <Loaded {...props} />;
  }
  return Object.assign(LazyPage, { preload, prefetch });
}
