import * as React from "react";
import { useLocale } from "../i18n";
import type { LanguageSuggestionBarProps } from "./LanguageSuggestionBar";

const DISMISSED_KEY = "yugen-docs-language-suggestion";

/** Đã chọn ngôn ngữ (bấm gợi ý, "Giữ tiếng Anh" hoặc nút ngôn ngữ trên thanh trên): không gợi ý nữa. */
export function dismissLanguageSuggestion() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Không lưu được (chế độ riêng tư): gợi ý hiện lại ở lần mở sau.
  }
}

const prefersVietnamese = () => (navigator.languages?.length ? navigator.languages : [navigator.language]).some((l) => /^vi\b/i.test(l));

/**
 * Docs mặc định tiếng Anh (#277). Trình duyệt đặt tiếng Việt mà đang xem bản tiếng Anh thì gợi ý một lần, không tự chuyển
 * trang (crawler và cache cần mỗi URL một ngôn ngữ). Chỉ hiện sau khi mount nên HTML prerender không đổi. Thanh gợi ý
 * (MessageBar) nạp lười, chỉ khi cần hiện (#307).
 */
export function LanguageSuggestion({ onChoose }: { onChoose: () => void }) {
  const { locale } = useLocale();
  const [Bar, setBar] = React.useState<React.ComponentType<LanguageSuggestionBarProps> | null>(null);

  React.useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) !== null;
    } catch {
      dismissed = false;
    }
    if (locale !== "en" || dismissed || !prefersVietnamese()) {
      setBar(null);
      return;
    }
    let alive = true;
    import("./LanguageSuggestionBar").then(
      (m) => alive && setBar(() => m.LanguageSuggestionBar),
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [locale]);

  if (!Bar) return null;
  const close = () => {
    dismissLanguageSuggestion();
    setBar(null);
  };
  return (
    <Bar
      onChoose={() => {
        close();
        onChoose();
      }}
      onClose={close}
    />
  );
}
