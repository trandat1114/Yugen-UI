/** Fluent UI AriaLiveAnnouncer — https://storybooks.fluentui.dev/react/?path=/docs/utilities-arialiveannouncer--docs */
import * as React from "react";
import { VisuallyHidden, visuallyHiddenClass } from "../VisuallyHidden/VisuallyHidden";

export type AriaLivePoliteness = "polite" | "assertive";

export interface AnnounceOptions {
  /** "polite" (mặc định) chờ trình đọc màn hình đọc xong; "assertive" ngắt lời ngay. */
  politeness?: AriaLivePoliteness;
  /** Thông báo cùng batchId đang chờ trong hàng đợi sẽ bị thay bằng thông báo mới nhất. */
  batchId?: string;
}

export type AnnounceFn = (message: string, options?: AnnounceOptions) => void;

/* Nhịp đọc của hàng đợi (hành vi, không phải giá trị thị giác). */
/** Khoảng nghỉ sau khi xoá vùng live — để thông báo trùng nội dung vẫn được đọc lại. */
const CLEAR_DELAY = 50;
/** Thời gian giữ mỗi thông báo trước khi đưa thông báo kế tiếp vào vùng live. */
const MESSAGE_GAP = 500;

interface QueuedMessage {
  message: string;
  batchId?: string;
}

function createAnnouncer(getRegion: (politeness: AriaLivePoliteness) => HTMLElement | null) {
  const queues: Record<AriaLivePoliteness, QueuedMessage[]> = { polite: [], assertive: [] };
  const timers: Record<AriaLivePoliteness, ReturnType<typeof setTimeout> | undefined> = { polite: undefined, assertive: undefined };

  // setTimeout toàn cục, không phải window.setTimeout: announcer dự phòng sống ở mức module nên timer có thể chạy sau khi
  // window đã mất (môi trường test bị gỡ, unmount muộn) — khi đó getRegion trả null và hàng đợi tự dừng, không văng lỗi.
  const flush = (politeness: AriaLivePoliteness) => {
    const item = queues[politeness].shift();
    const region = getRegion(politeness);
    if (!item || !region) {
      timers[politeness] = undefined;
      return;
    }
    region.textContent = "";
    timers[politeness] = setTimeout(() => {
      region.textContent = item.message;
      timers[politeness] = setTimeout(() => flush(politeness), MESSAGE_GAP);
    }, CLEAR_DELAY);
  };

  const announce: AnnounceFn = (message, { politeness = "polite", batchId } = {}) => {
    if (typeof window === "undefined" || !message) return;
    const queue = queues[politeness];
    if (batchId !== undefined) {
      const index = queue.findIndex((m) => m.batchId === batchId);
      if (index !== -1) queue.splice(index, 1);
    }
    queue.push({ message, batchId });
    if (timers[politeness] === undefined) flush(politeness);
  };

  const dispose = () => {
    (Object.keys(timers) as AriaLivePoliteness[]).forEach((p) => {
      clearTimeout(timers[p]);
      timers[p] = undefined;
      queues[p].length = 0;
    });
  };

  return { announce, dispose };
}

/* ---------- Fallback: vùng live gắn thẳng vào <body> khi không có AriaLiveAnnouncer ---------- */

let fallbackAnnouncer: ReturnType<typeof createAnnouncer> | null = null;

function getFallbackAnnouncer() {
  if (fallbackAnnouncer) return fallbackAnnouncer;
  const regions: Partial<Record<AriaLivePoliteness, HTMLElement>> = {};
  fallbackAnnouncer = createAnnouncer((politeness) => {
    if (typeof document === "undefined") return null;
    let region = regions[politeness];
    if (!region || !region.isConnected) {
      region = document.createElement("div");
      region.setAttribute("aria-live", politeness);
      region.setAttribute("aria-atomic", "true");
      region.setAttribute("data-yugen-live-region", politeness);
      region.className = visuallyHiddenClass;
      document.body.appendChild(region);
      regions[politeness] = region;
    }
    return region;
  });
  return fallbackAnnouncer;
}

const AnnounceContext = React.createContext<AnnounceFn | null>(null);

export interface AriaLiveAnnouncerProps {
  children?: React.ReactNode;
}

/** Gắn một lần ở gốc ứng dụng: render hai vùng live ẩn (polite / assertive) và cung cấp useAnnounce(). */
export function AriaLiveAnnouncer({ children }: AriaLiveAnnouncerProps) {
  const politeRef = React.useRef<HTMLDivElement>(null);
  const assertiveRef = React.useRef<HTMLDivElement>(null);
  const [announcer] = React.useState(() =>
    createAnnouncer((politeness) => (politeness === "polite" ? politeRef.current : assertiveRef.current)),
  );

  React.useEffect(() => () => announcer.dispose(), [announcer]);

  return (
    <AnnounceContext.Provider value={announcer.announce}>
      {children}
      <VisuallyHidden asChild>
        <div ref={politeRef} aria-live="polite" aria-atomic="true" data-yugen-live-region="polite" />
      </VisuallyHidden>
      <VisuallyHidden asChild>
        <div ref={assertiveRef} aria-live="assertive" aria-atomic="true" data-yugen-live-region="assertive" />
      </VisuallyHidden>
    </AnnounceContext.Provider>
  );
}

/**
 * Trả về `{ announce }` để đọc thông báo cho trình đọc màn hình.
 * Không có AriaLiveAnnouncer bên ngoài → tự tạo vùng live ở <body> (lazy).
 */
export function useAnnounce(): { announce: AnnounceFn } {
  const contextAnnounce = React.useContext(AnnounceContext);
  const announce = React.useCallback<AnnounceFn>(
    (message, options) => (contextAnnounce ?? getFallbackAnnouncer().announce)(message, options),
    [contextAnnounce],
  );
  return React.useMemo(() => ({ announce }), [announce]);
}
