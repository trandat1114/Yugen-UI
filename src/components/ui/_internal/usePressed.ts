import * as React from "react";

/**
 * Đang nhấn: bật khi pointerdown trên control, tắt khi thả ở bất cứ đâu (kéo có thể ra ngoài control). Listener gắn ngay
 * trong start(), không đợi effect, để một cú chạm rất nhanh không bị kẹt ở trạng thái nhấn.
 */
export function usePressed() {
  const [value, setValue] = React.useState(false);
  const start = React.useCallback(() => {
    setValue(true);
    const stop = () => {
      setValue(false);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }, []);
  return { value, start };
}
