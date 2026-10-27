import type * as React from "react";

/**
 * Glass (Yugen Labs): bề mặt nổi mọc ra từ nút mở nó và thu về đó khi đóng (#210). Keyframes morph-in / morph-out đọc
 * --morph-from; hàm này đặt nó lúc animation bắt đầu: dịch từ tâm nút tới tâm bề mặt và co về đúng cỡ nút. Lúc đó popper
 * của Radix đã đặt vị trí xong (Radix tắt animation tới khi đo xong). Nút tìm qua aria-controls = id của bề mặt; không
 * thấy thì giữ dự phòng scale(0.9). prefers-reduced-motion: component không dùng morph (motion-safe).
 */
export function morphFromTrigger(event: React.AnimationEvent<HTMLElement>) {
  const surface = event.currentTarget;
  if (event.target !== surface || !event.animationName.startsWith("morph-") || !surface.id) return;
  const trigger = document.querySelector(`[aria-controls="${CSS.escape(surface.id)}"]`);
  // Wrapper của popper mang vị trí; bề mặt chưa có transform riêng ngoài animation nên lấy cỡ bằng offset*.
  const box = (surface.parentElement ?? surface).getBoundingClientRect();
  if (!trigger || !surface.offsetWidth || !surface.offsetHeight) return;
  const from = trigger.getBoundingClientRect();
  const x = from.left + from.width / 2 - (box.left + surface.offsetWidth / 2);
  const y = from.top + from.height / 2 - (box.top + surface.offsetHeight / 2);
  const sx = Math.min(1, Math.max(0.1, from.width / surface.offsetWidth));
  const sy = Math.min(1, Math.max(0.1, from.height / surface.offsetHeight));
  surface.style.setProperty("--morph-from", `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`);
}

/** Class morph cho bề mặt glass: thay animation mặc định khi người dùng không giảm chuyển động. */
export const morphClass = "motion-safe:animate-morph-in motion-safe:data-[state=closed]:animate-morph-out";
