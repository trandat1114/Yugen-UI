import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { YugenMessages } from "@/components/ui/YugenProvider/context";
import type { ComponentCategory, ConceptGroup, ConceptMeta } from "../types";
import type { EnBundle } from "./en/bundle";
import { setLinkLocale } from "../router";
import { vi, type MessageKey } from "./vi";

export type { MessageKey };

/** Ngôn ngữ của trang docs — "vi" mặc định; "en" nạp lười gói chuỗi tiếng Anh. */
export type Locale = "vi" | "en";
export const isLocale = (v: unknown): v is Locale => v === "vi" || v === "en";

export interface LocaleValue {
  locale: Locale;
  /** Chuỗi giao diện theo key; `{name}` trong chuỗi được thay bằng `vars.name`. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  category: (c: ComponentCategory) => string;
  group: (g: ConceptGroup) => string;
  foundation: (f: { slug: string; name: string }) => string;
  component: (m: { slug: string; name: string; lead: string }) => { name: string; lead: string };
  /** Meta trang khái niệm theo ngôn ngữ (tiêu đề luôn dịch; lead / mục lục chỉ khi trang đã có bản dịch). */
  concept: (m: ConceptMeta) => ConceptMeta;
  /** `messages` cho YugenProvider của docs: chuỗi có sẵn của component theo ngôn ngữ (không có = mặc định tiếng Anh). */
  ui?: YugenMessages;
}

const format = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;

// Chuỗi có sẵn của component bằng tiếng Việt (kèm locale vi của lịch, ~11 KB gzip): chunk riêng, chỉ trang tiếng Việt nạp
// (#307). Trang tiếng Anh — mặc định — không tải.
let viUi: YugenMessages | undefined;
let viUiPromise: Promise<YugenMessages> | null = null;

/** Nạp `messagesVi` (cache; lỗi → bỏ cache để lần sau thử lại). */
export function loadVietnameseUi(): Promise<YugenMessages> {
  if (!viUiPromise) {
    viUiPromise = import("@/components/ui/messages-vi").then((m) => (viUi = m.messagesVi));
    viUiPromise.catch(() => (viUiPromise = null));
  }
  return viUiPromise;
}

/** Nạp phần chữ của một ngôn ngữ (main.tsx / prerender gọi trước lần render đầu; di chuột lên nút đổi ngôn ngữ gọi trước). */
export const loadLocale = (locale: Locale): Promise<unknown> => (locale === "en" ? loadEnglish() : loadVietnameseUi());

function createValue(b: EnBundle | null): LocaleValue {
  const messages: Record<MessageKey, string> = b ? b.messages : vi;
  return {
    locale: b ? "en" : "vi",
    // Chuỗi có sẵn của component: mặc định là tiếng Anh (= messagesEn, không cần nạp); trang tiếng Việt truyền messagesVi
    // (chưa nạp xong: tạm tiếng Anh).
    ui: b ? undefined : viUi,
    t: (key, vars) => format(messages[key], vars),
    category: (c) => b?.categories[c] ?? c,
    group: (g) => b?.groups[g] ?? g,
    foundation: (f) => b?.foundations[f.slug] ?? f.name,
    component: (m) => {
      const e = b?.components[m.slug];
      return { name: e?.name ?? m.name, lead: e?.lead ?? m.lead };
    },
    concept: (m) => {
      const e = b?.concepts[m.slug];
      if (!e) return m;
      const toc = e.toc;
      return { ...m, title: e.title, lead: e.lead ?? m.lead, toc: toc ? m.toc.map((i) => ({ ...i, label: toc[i.id] ?? i.label })) : m.toc };
    },
  };
}

// Giá trị tiếng Việt, tạo lại một lần sau khi `messagesVi` nạp xong.
let viValue = createValue(null);
const vietnamese = () => (viValue.ui === viUi ? viValue : (viValue = createValue(null)));
const LocaleContext = createContext<LocaleValue>(viValue);

let enBundle: EnBundle | null = null;
let enPromise: Promise<EnBundle> | null = null;

/** Nạp gói tiếng Anh (một chunk riêng, cache; lỗi → bỏ cache để lần sau thử lại). */
export function loadEnglish(): Promise<EnBundle> {
  if (!enPromise) {
    enPromise = import("./en/bundle").then((m) => (enBundle = m.bundle));
    enPromise.catch(() => (enPromise = null));
  }
  return enPromise;
}

/** Giá trị ngôn ngữ ngoài React (prerender): "en" cần `loadEnglish()` xong trước, nếu chưa thì trả tiếng Việt. */
export function localeValue(locale: Locale): LocaleValue {
  return locale === "en" && enBundle ? createValue(enBundle) : vietnamese();
}

/**
 * Cung cấp ngôn ngữ cho cây docs và giữ `<html lang>` khớp với nội dung (a11y). Lần đầu mở ở "en": chờ gói tiếng Anh
 * rồi mới render (không nháy tiếng Việt); đổi ngôn ngữ khi đang xem: giữ nội dung hiện tại tới khi gói nạp xong.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const wantsEn = locale === "en";
  const [bundle, setBundle] = useState<EnBundle | null>(() => {
    if (wantsEn && !enBundle) void loadEnglish().catch(() => {});
    return enBundle;
  });
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(!wantsEn || !!enBundle);

  useEffect(() => {
    if (!wantsEn || bundle) return;
    let alive = true;
    loadEnglish().then(
      (b) => {
        if (!alive) return;
        setBundle(b);
        setReady(true);
      },
      () => {
        if (!alive) return;
        setFailed(true);
        setReady(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [wantsEn, bundle]);

  // Trang tiếng Việt: main.tsx đã nạp messagesVi trước; đổi sang tiếng Việt khi đang xem thì nạp rồi render lại.
  const [ui, setUi] = useState(viUi);
  useEffect(() => {
    if (wantsEn || ui) return;
    let alive = true;
    loadVietnameseUi().then(
      (m) => alive && setUi(m),
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [wantsEn, ui]);

  const active = wantsEn && bundle ? bundle : null;
  // `ui` trong deps: messagesVi vừa nạp thì vietnamese() trả giá trị mới.
  const value = useMemo(() => (active ? createValue(active) : vietnamese()), [active, ui]);
  // Link nội bộ (docsPath) theo ngôn ngữ đang hiển thị — đặt trong render để cây con dùng ngay.
  setLinkLocale(value.locale);

  useEffect(() => {
    if (wantsEn && !bundle && !failed) return; // đang nạp: giữ lang hiện tại
    document.documentElement.lang = value.locale;
  }, [value.locale, wantsEn, bundle, failed]);

  return <LocaleContext.Provider value={value}>{ready ? children : null}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
