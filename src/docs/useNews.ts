import { useEffect, useState } from "react";
import { LATEST_RELEASE } from "./news";

const SEEN_KEY = "yugen-ui-news-seen";
const EVENT = "yugen-news-seen";

/** Đánh dấu đã xem phiên bản mới nhất (gọi khi mở trang Có gì mới). */
export function markNewsSeen() {
  try {
    localStorage.setItem(SEEN_KEY, LATEST_RELEASE.version);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage bị chặn */
  }
}

/** true nếu người dùng chưa xem phiên bản mới nhất. */
export function useHasUnseenNews() {
  const [unseen, setUnseen] = useState(false);
  useEffect(() => {
    const check = () => {
      try {
        setUnseen(localStorage.getItem(SEEN_KEY) !== LATEST_RELEASE.version);
      } catch {
        setUnseen(false);
      }
    };
    check();
    window.addEventListener(EVENT, check);
    return () => window.removeEventListener(EVENT, check);
  }, []);
  return unseen;
}
