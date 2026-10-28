/**
 * Lộ trình — nguồn duy nhất cho trang Cộng đồng (/community › Lộ trình) và ROADMAP.md (`npm run roadmap`).
 * Mỗi bản phát hành ứng với một milestone trên GitHub; chi tiết, ưu tiên và phụ thuộc nằm ở GitHub Project.
 * Đổi milestone / issue thì sửa ở đây, chạy `npm run roadmap`; roadmap.test.ts báo lỗi nếu ROADMAP.md lệch.
 */
import { homepage } from "../../package.json";
import { NEWS } from "./news";
import { SITE } from "./site";

export type RoadmapStatus = "done" | "doing" | "planned";
export type RoadmapStage = "now" | "next" | "later";

export interface RoadmapItem {
  status: RoadmapStatus;
  /** Issue (hoặc PR khi không có issue) trên GitHub. */
  issue?: number;
  vi: string;
  en: string;
}

export interface RoadmapRelease {
  /** Tên milestone trên GitHub ("0.9.0", "cli 0.3.0"); "Backlog" cho việc chưa xếp lịch. */
  milestone: string;
  kind: "patch" | "minor" | "major" | "cli" | "backlog";
  /** YYYY-MM-DD, hạn dự kiến của milestone. */
  due?: string;
  vi: string;
  en: string;
  items: RoadmapItem[];
}

export const ROADMAP_UPDATED = "2026-10-28";
export const PROJECT_URL = "https://github.com/users/trandat1114/projects/6";

export const ROADMAP: Record<RoadmapStage, RoadmapRelease[]> = {
  now: [
    {
      milestone: "0.13.0",
      kind: "minor",
      due: "2026-11-10",
      vi: "Khúc xạ cho glass, mùa hoa anh đào trong template Glass, Sonner và bốn component hiển thị.",
      en: "Glass refraction, cherry blossom season in the Glass template, Sonner and four display components.",
      items: [
        { status: "done", issue: 210, vi: "Glass phần 2: menu mọc từ nút, thumb glass cho Slider và Switch, trục Glass trong Theme Designer", en: "Glass part 2: menus that grow from the button, glass thumbs on Slider and Switch, a Glass axis in the Theme Designer" },
        { status: "done", issue: 227, vi: "GlassRefraction: mép bề mặt glass bẻ cong nền phía sau (Chromium); template Glass có chuyến đi ở Nhật Bản và xem trước trên ảnh", en: "GlassRefraction: glass edges bend what is behind them (Chromium); Japan trips and a photo preview in the Glass template" },
        { status: "done", issue: 224, vi: "Trang Templates: xem toàn màn hình, một khung lớn cho các template khác", en: "Templates page: full-screen preview, one large view for the other templates" },
        { status: "done", issue: 223, vi: "Checkbox, Switch, Field: input ẩn của form không kéo dài trang", en: "Checkbox, Switch, Field: the hidden form input no longer stretches the page" },
        { status: "done", issue: 234, vi: "Sonner: thông báo xếp chồng, theo promise từ loading tới success / error", en: "Sonner: stacked notifications that follow a promise from loading to success / error" },
        { status: "done", issue: 174, vi: "Timeline, DescriptionList, Stat và Prose; template Blog và Docs dùng Prose", en: "Timeline, DescriptionList, Stat and Prose; the Blog and Docs templates use Prose" },
      ],
    },
    {
      milestone: "1.0.0",
      kind: "major",
      vi: "API ổn định. Chưa định ngày: phát hành khi danh sách điều kiện hoàn tất.",
      en: "Stable API. No fixed date: ships when the readiness checklist is done.",
      items: [
        { status: "planned", issue: 65, vi: "Rà soát API, gỡ deprecation, quyết định về React 18 và class spacing viết hoa", en: "API review, deprecations removed, decisions on React 18 and upper-case spacing" },
        { status: "done", issue: 63, vi: "SEO: URL theo đường dẫn, prerender từng trang, sitemap", en: "SEO: path URLs, prerendered pages, sitemap" },
        { status: "planned", issue: 160, vi: "Đề xuất cho 1.0 (đang chờ duyệt): AppShell, Form, NavigationMenu, block 2.0, codemod, kiểm thử", en: "1.0 proposal (under review): AppShell, Form, NavigationMenu, blocks 2.0, codemods, testing" },
      ],
    },
  ],
  next: [
    {
      milestone: "Backlog",
      kind: "backlog",
      vi: "Chưa xếp lịch.",
      en: "Not scheduled yet.",
      items: [
        { status: "planned", issue: 230, vi: "Glass: YugenProvider đổi mọi component điều hướng sang glass (sau #171)", en: "Glass: a YugenProvider default that switches navigation components to glass (after #171)" },
        { status: "planned", issue: 68, vi: "Đăng ký @yugen vào danh mục registry của shadcn", en: "Register @yugen in the shadcn registry index" },
        { status: "planned", vi: "Đang cân nhắc: bộ Figma, gói icon Sakura", en: "Under consideration: Figma kit, Sakura icon set" },
      ],
    },
  ],
  later: [],
};

export const STAGE_LABEL: Record<RoadmapStage, { vi: string; en: string }> = {
  now: { vi: "Đang làm", en: "Now" },
  next: { vi: "Tiếp theo", en: "Next" },
  later: { vi: "Sau đó", en: "Later" },
};

export const STATUS_LABEL: Record<RoadmapStatus, { vi: string; en: string }> = {
  done: { vi: "Đã xong", en: "Done" },
  doing: { vi: "Đang làm", en: "In progress" },
  planned: { vi: "Dự kiến", en: "Planned" },
};

const KIND_LABEL: Record<RoadmapRelease["kind"], { vi: string; en: string }> = {
  patch: { vi: "bản vá", en: "patch" },
  minor: { vi: "minor", en: "minor" },
  major: { vi: "major", en: "major" },
  cli: { vi: "CLI", en: "CLI" },
  backlog: { vi: "", en: "" },
};

/** "0.8.4 · bản vá", "cli 0.2.0", "Backlog". */
export function releaseTitle(r: RoadmapRelease, lang: "vi" | "en") {
  if (r.kind === "cli" || r.kind === "backlog") return r.milestone;
  return `${r.milestone} · ${KIND_LABEL[r.kind][lang]}`;
}

export const issueUrl = (n: number) => `${SITE.links.repository}/issues/${n}`;

/** Nội dung ROADMAP.md (tiếng Việt) sinh từ ROADMAP + NEWS. */
export function roadmapMarkdown() {
  const box: Record<RoadmapStatus, string> = { done: "[x]", doing: "[~]", planned: "[ ]" };
  const lines = [
    "# Lộ trình Yugen UI · Roadmap",
    "",
    "<!-- Sinh từ src/docs/roadmap.ts bằng `npm run roadmap`. Đừng sửa tay. -->",
    "",
    `Kế hoạch theo từng bản phát hành, cập nhật ${ROADMAP_UPDATED}. Mỗi bản là một milestone trên GitHub; ưu tiên, độ lớn và`,
    `phụ thuộc nằm ở [GitHub Project](${PROJECT_URL}). \`[x]\` đã xong, \`[~]\` đang làm, \`[ ]\` dự kiến.`,
    "",
    "Muốn nhận một mục? Bình luận vào issue trước khi bắt tay làm. English: the community page",
    `(${homepage}community?lang=en) shows the same roadmap.`,
  ];
  for (const stage of ["now", "next", "later"] as const) {
    if (ROADMAP[stage].length === 0) continue;
    lines.push("", `## ${STAGE_LABEL[stage].vi}`);
    for (const r of ROADMAP[stage]) {
      const due = r.due ? ` · hạn ${r.due}` : "";
      lines.push("", `### ${releaseTitle(r, "vi")}${due}`, "", r.vi, "");
      for (const item of r.items) lines.push(`- ${box[item.status]} ${item.vi}${item.issue ? ` (#${item.issue})` : ""}`);
    }
  }
  lines.push("", "## Đã phát hành", "", "Chi tiết ở trang Có gì mới (`/news`) và `CHANGELOG.md`.", "");
  for (const n of NEWS.filter((r) => !r.upcoming)) lines.push(`- **${n.version}** (${n.date}): ${n.title}`);
  return `${lines.join("\n")}\n`;
}
