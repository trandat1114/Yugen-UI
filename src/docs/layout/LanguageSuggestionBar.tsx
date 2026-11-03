import { Button, MessageBar } from "@/components/ui";

export interface LanguageSuggestionBarProps {
  onChoose: () => void;
  onClose: () => void;
}

/** Thanh gợi ý tiếng Việt của LanguageSuggestion (nạp lười). */
export function LanguageSuggestionBar({ onChoose, onClose }: LanguageSuggestionBarProps) {
  return (
    <MessageBar
      lang="vi"
      intent="info"
      className="mt-5"
      actions={
        <>
          <Button size="small" appearance="primary" onClick={onChoose}>
            Xem bằng tiếng Việt
          </Button>
          <Button size="small" appearance="subtle" lang="vi" onClick={onClose}>
            Giữ tiếng Anh
          </Button>
        </>
      }
    >
      Trang này có bản tiếng Việt.
    </MessageBar>
  );
}
