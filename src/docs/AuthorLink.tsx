import { cn } from "@/lib/cn";
import { SITE } from "./site";

/** Tên tác giả "trandat1114" luôn dẫn tới trang GitHub cá nhân (mở tab mới). */
export function AuthorLink({ className }: { className?: string }) {
  return (
    <a
      href={SITE.links.author}
      target="_blank"
      rel="noreferrer"
      className={cn("font-semibold underline-offset-2 hover:underline", className)}
    >
      {SITE.author}
    </a>
  );
}
