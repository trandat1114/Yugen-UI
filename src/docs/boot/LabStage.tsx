import * as React from "react";
import { FullScreenMaximize16Regular, FullScreenMinimize16Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui/Button/Button";
import { cn } from "@/lib/cn";
import { useLocale } from "../i18n";

const TEXT = {
  vi: { open: (name: string) => `Xem ${name} toàn màn hình`, exit: "Thoát toàn màn hình", controls: (name: string) => `Điều khiển ${name}` },
  en: { open: (name: string) => `View ${name} full screen`, exit: "Exit full screen", controls: (name: string) => `${name} controls` },
};

/** Thanh điều khiển ẩn sau chừng này ms không di chuột, để xem trọn khung hình. */
const IDLE_MS = 2500;

/**
 * Giữ lần render cuối khi khung ra khỏi màn hình: các khung chạy chung một lần tải mô phỏng, nên khung không ai nhìn thấy
 * khỏi phải dựng lại và vẽ lại 60 lần mỗi giây. Cuộn vào thì render lại ngay với tiến độ hiện tại.
 */
const Hold = React.memo(
  function Hold({ children }: { active: boolean; children: React.ReactNode }) {
    return <>{children}</>;
  },
  (_, next) => !next.active,
);

/**
 * Khung xem trước của các phòng thử Yugen Labs: tỉ lệ 16:10, nội dung là hình minh hoạ (inert, aria-hidden) với kích thước theo
 * cqmin nên xem toàn màn hình vẫn đúng tỉ lệ. Trình duyệt chỉ vẽ phần tử đang toàn màn hình, nên khi đó `controls` hiện trong
 * một thanh nổi ở góc trên của chính khung; thanh tự ẩn khi không di chuột, focus bằng bàn phím thì hiện lại.
 */
export function LabStage({
  name,
  note,
  controls,
  className,
  children,
}: {
  name: string;
  note: React.ReactNode;
  controls?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  const t = TEXT[locale === "en" ? "en" : "vi"];
  const ref = React.useRef<HTMLDivElement>(null);
  const [canFullscreen, setCanFullscreen] = React.useState(false);
  const [full, setFull] = React.useState(false);
  const [idle, setIdle] = React.useState(false);
  const [onScreen, setOnScreen] = React.useState(true);
  const timer = React.useRef<number | undefined>(undefined);

  const wake = React.useCallback(() => {
    setIdle(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  }, []);

  React.useEffect(() => {
    setCanFullscreen(document.fullscreenEnabled);
    const onChange = () => {
      const on = document.fullscreenElement === ref.current;
      setFull(on);
      if (on) wake();
      else window.clearTimeout(timer.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.clearTimeout(timer.current);
    };
  }, [wake]);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const inert = React.useCallback((node: HTMLDivElement | null) => node?.setAttribute("inert", ""), []);

  return (
    <figure className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div
        ref={ref}
        onPointerMove={full ? wake : undefined}
        className={cn(
          "relative aspect-16/10 overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 text-foreground-1 @container-size",
          "[&:fullscreen]:rounded-none [&:fullscreen]:border-0",
          full && idle && "cursor-none",
        )}
      >
        <div ref={inert} aria-hidden className="absolute inset-0">
          <Hold active={onScreen || full}>{children}</Hold>
        </div>
        {full && (
          <div
            role="group"
            aria-label={t.controls(name)}
            onFocus={wake}
            className={cn(
              "absolute inset-s-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-x-4 gap-y-2 rounded-large border border-stroke-2 bg-background-1 p-2 shadow-16",
              "transition-opacity duration-normal motion-reduce:transition-none",
              idle && "opacity-0 focus-within:opacity-100",
            )}
          >
            {controls}
            <Button size="small" appearance="subtle" icon={<FullScreenMinimize16Regular />} onClick={() => void document.exitFullscreen()}>
              {t.exit}
            </Button>
          </div>
        )}
      </div>
      <figcaption className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body1 font-semibold text-foreground-1">{name}</p>
          <p className="text-caption1 text-foreground-2">{note}</p>
        </div>
        {canFullscreen && (
          <Button
            appearance="subtle"
            size="small"
            icon={<FullScreenMaximize16Regular />}
            aria-label={t.open(name)}
            title={t.open(name)}
            onClick={() => void ref.current?.requestFullscreen()}
          />
        )}
      </figcaption>
    </figure>
  );
}
