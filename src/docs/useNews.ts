import { useEffect, useState } from "react";
import { CLI_NEWS, CREATE_NEWS, NEWS } from "./news";

const SEEN_KEY = "yugen-ui-news-seen";
const EVENT = "yugen-news-seen";
/** Phiên bản mới nhất của từng gói trên trang Có gì mới — đổi khi bất kỳ gói nào phát hành. */
const LATEST = [NEWS, CLI_NEWS, CREATE_NEWS].map((feed) => feed[0].version).join(" ");

/** Đánh dấu đã xem các phiên bản mới nhất (gọi khi mở trang Có gì mới). */
export function markNewsSeen() {
  try {
    localStorage.setItem(SEEN_KEY, LATEST);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage bị chặn */
  }
}

/** true nếu người dùng chưa xem phiên bản mới nhất của ít nhất một gói. */
export function useHasUnseenNews() {
  const [unseen, setUnseen] = useState(false);
  useEffect(() => {
    const check = () => {
      try {
        setUnseen(localStorage.getItem(SEEN_KEY) !== LATEST);
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
