import * as React from "react";
import { Button, MessageBar } from "@/components/ui";
import { useLocale } from "../i18n";

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
 * trang (crawler và cache cần mỗi URL một ngôn ngữ). Chỉ hiện sau khi mount nên HTML prerender không đổi.
 */
export function LanguageSuggestion({ onChoose }: { onChoose: () => void }) {
  const { locale } = useLocale();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) !== null;
    } catch {
      dismissed = false;
    }
    setShow(locale === "en" && !dismissed && prefersVietnamese());
  }, [locale]);

  if (!show) return null;
  const close = () => {
    dismissLanguageSuggestion();
    setShow(false);
  };
  return (
    <MessageBar
      lang="vi"
      intent="info"
      className="mt-5"
      actions={
        <>
          <Button
            size="small"
            appearance="primary"
            onClick={() => {
              close();
              onChoose();
            }}
          >
            Xem bằng tiếng Việt
          </Button>
          <Button size="small" appearance="subtle" lang="vi" onClick={close}>
            Giữ tiếng Anh
          </Button>
        </>
      }
    >
      Trang này có bản tiếng Việt.
    </MessageBar>
  );
}
