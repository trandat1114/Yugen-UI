import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ComponentCategory, ConceptGroup, ConceptMeta } from "../types";
import type { EnBundle } from "./en/bundle";
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
}

const format = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;

function createValue(b: EnBundle | null): LocaleValue {
  const messages: Record<MessageKey, string> = b ? b.messages : vi;
  return {
    locale: b ? "en" : "vi",
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

const VI_VALUE = createValue(null);
const LocaleContext = createContext<LocaleValue>(VI_VALUE);

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
  return locale === "en" && enBundle ? createValue(enBundle) : VI_VALUE;
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

  const active = wantsEn && bundle ? bundle : null;
  const value = useMemo(() => (active ? createValue(active) : VI_VALUE), [active]);

  useEffect(() => {
    if (wantsEn && !bundle && !failed) return; // đang nạp: giữ lang hiện tại
    document.documentElement.lang = value.locale;
  }, [value.locale, wantsEn, bundle, failed]);

  return <LocaleContext.Provider value={value}>{ready ? children : null}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
