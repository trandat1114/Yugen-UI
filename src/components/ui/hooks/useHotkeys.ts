import * as React from "react";

export type HotkeyHandler = (event: KeyboardEvent) => void;

export interface UseHotkeysOptions {
  /** Nơi lắng nghe phím; mặc định `document`. */
  target?: Document | Window | HTMLElement | null;
  /** Tắt tạm toàn bộ phím tắt. */
  enabled?: boolean;
  /** Cho phím tắt không có Ctrl / Alt / ⌘ chạy cả khi đang gõ trong input, textarea, select, contenteditable. Mặc định false. */
  enableOnFormTags?: boolean;
  /** Gọi `preventDefault()` khi khớp. Mặc định true. */
  preventDefault?: boolean;
  /** Chạy lại khi giữ phím (`event.repeat`), ví dụ mũi tên di chuyển liên tục. Mặc định false: giữ phím chỉ tính một lần. */
  repeat?: boolean;
}

interface Combo {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  /** `start` / `end`: mũi tên theo chiều chữ — đảo trái / phải khi giao diện RTL. */
  logical: "start" | "end" | null;
}

const ALIASES: Record<string, string> = {
  esc: "escape",
  space: " ",
  spacebar: " ",
  plus: "+",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
  return: "enter",
};

const isApple = () => typeof navigator !== "undefined" && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

/** "mod+shift+k" → bộ phím cần khớp. `mod` là ⌘ trên Apple, Ctrl ở nơi khác. */
function parseCombo(combo: string): Combo {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());
  // "ctrl++" (dấu + là phím): phần tử cuối rỗng sau khi tách.
  const raw = parts.pop() || "+";
  const result: Combo = { key: ALIASES[raw] ?? raw, ctrl: false, meta: false, alt: false, shift: false, logical: null };
  for (const part of parts) {
    if (part === "mod") {
      if (isApple()) result.meta = true;
      else result.ctrl = true;
    } else if (part === "ctrl" || part === "control") result.ctrl = true;
    else if (part === "meta" || part === "cmd" || part === "command") result.meta = true;
    else if (part === "alt" || part === "option") result.alt = true;
    else if (part === "shift") result.shift = true;
  }
  if (raw === "start" || raw === "end") {
    result.logical = raw;
    result.key = "arrowleft";
  }
  return result;
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName);
}

function isRtl(target: EventTarget | null) {
  const el = target instanceof Element ? target : document.documentElement;
  return getComputedStyle(el).direction === "rtl";
}

function matches(e: KeyboardEvent, combo: Combo) {
  if (e.ctrlKey !== combo.ctrl || e.metaKey !== combo.meta || e.altKey !== combo.alt) return false;
  let key = combo.key;
  if (combo.logical) {
    // Trong RTL, "start" là mũi tên phải và "end" là mũi tên trái.
    const rtl = isRtl(e.target);
    key = (combo.logical === "start") !== rtl ? "arrowleft" : "arrowright";
  }
  const pressed = e.key.toLowerCase();
  // Phím in được (? / ! …) đã mang sẵn trạng thái Shift trong `e.key`; chỉ kiểm tra Shift cho phím chức năng và chữ cái.
  const printable = key.length === 1 && !/[a-z]/.test(key);
  if (!printable && e.shiftKey !== combo.shift) return false;
  if (pressed === key) return true;
  // Alt (Option) đổi ký tự (⌥K → ˚): so theo vị trí phím vật lý.
  return e.altKey && key.length === 1 && (e.code === `Key${key.toUpperCase()}` || e.code === `Digit${key}`);
}

/**
 * Đăng ký phím tắt. Khoá của object là tổ hợp phím, giá trị là hàm xử lý.
 * - `mod` = ⌘ trên Mac, Ctrl ở nơi khác: `"mod+k"`, `"mod+shift+p"`, `"escape"`, `"?"`.
 * - Phím tắt thường (không Ctrl / Alt / ⌘) bị bỏ qua khi đang gõ trong ô nhập, trừ khi bật `enableOnFormTags`.
 * - `start` / `end` là mũi tên theo chiều chữ: giao diện RTL tự đảo (`"start"` = mũi tên phải); `"left"` / `"right"` luôn là vật lý.
 * - Bỏ qua phím đang gõ dở bằng IME (`isComposing`, keyCode 229) và phím đang giữ (`repeat`), trừ khi bật `repeat`.
 * - Hàm xử lý luôn là bản mới nhất nên không cần `useCallback`.
 *
 * ```tsx
 * useHotkeys({ "mod+k": () => setOpen(true), "?": () => setHelp(true) });
 * ```
 */
export function useHotkeys(hotkeys: Record<string, HotkeyHandler>, options: UseHotkeysOptions = {}) {
  const { enabled = true, enableOnFormTags = false, preventDefault = true, repeat = false } = options;
  const target = options.target === undefined ? (typeof document === "undefined" ? null : document) : options.target;

  const handlers = React.useRef(hotkeys);
  React.useEffect(() => {
    handlers.current = hotkeys;
  });
  // Danh sách tổ hợp là thứ duy nhất làm đăng ký lại listener; object `hotkeys` mới mỗi lần render thì không.
  const signature = Object.keys(hotkeys).join("\n");

  React.useEffect(() => {
    if (!enabled || !target) return;
    const combos = signature.split("\n").map((name) => [name, parseCombo(name)] as const);
    const onKeyDown = (event: Event) => {
      const e = event as KeyboardEvent;
      // Safari báo keydown khi chốt chữ IME với isComposing = false nhưng keyCode 229.
      if (e.isComposing || e.keyCode === 229 || e.defaultPrevented) return;
      if (e.repeat && !repeat) return;
      const editing = isEditable(e.target);
      for (const [name, combo] of combos) {
        if (!matches(e, combo)) continue;
        const modified = combo.ctrl || combo.meta || combo.alt;
        if (editing && !modified && !enableOnFormTags) continue;
        if (preventDefault) e.preventDefault();
        handlers.current[name]?.(e);
        return;
      }
    };
    target.addEventListener("keydown", onKeyDown);
    return () => target.removeEventListener("keydown", onKeyDown);
  }, [signature, target, enabled, enableOnFormTags, preventDefault, repeat]);
}
