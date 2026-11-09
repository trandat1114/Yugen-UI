/**
 * Lộ trình — nguồn duy nhất cho trang Cộng đồng (/community › Lộ trình) và ROADMAP.md (`npm run roadmap`).
 * Mỗi bản phát hành ứng với một milestone trên GitHub; chi tiết, ưu tiên và phụ thuộc nằm ở GitHub Project.
 * Đổi milestone / issue thì sửa ở đây, chạy `npm run roadmap`; roadmap.test.ts báo lỗi nếu ROADMAP.md lệch.
 */
import { homepage } from "../../package.json";
import { NEWS_INDEX } from "./news";
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

export const ROADMAP_UPDATED = "2026-11-09";
export const PROJECT_URL = "https://github.com/users/trandat1114/projects/6";

export const ROADMAP: Record<RoadmapStage, RoadmapRelease[]> = {
  now: [
    {
      milestone: "1.0.0",
      kind: "major",
      vi: "API ổn định. Chưa định ngày: phát hành khi danh sách điều kiện hoàn tất.",
      en: "Stable API. No fixed date: ships when the readiness checklist is done.",
      items: [
        { status: "planned", issue: 65, vi: "Rà soát API, gỡ deprecation, quyết định về class spacing viết hoa", en: "API review, deprecations removed, decision on upper-case spacing" },
        { status: "done", issue: 63, vi: "SEO: URL theo đường dẫn, prerender từng trang, sitemap", en: "SEO: path URLs, prerendered pages, sitemap" },
        { status: "planned", issue: 162, vi: "Form: kiểm tra dữ liệu và tóm tắt lỗi", en: "Form: validation and an error summary" },
        { status: "planned", issue: 163, vi: "Thư viện block 2.0 (marketing, ứng dụng, thương mại), cài bằng CLI", en: "Block library 2.0 (marketing, app, commerce), installable with the CLI" },
        { status: "planned", issue: 164, vi: "Codemod 0.x → 1.0 (yugen migrate) cho các tên đã đổi", en: "Codemods 0.x → 1.0 (yugen migrate) for the renamed props" },
        { status: "planned", issue: 371, vi: "Kiểu prop riêng của Yugen cho Calendar và Resizable (không lộ kiểu của thư viện khác)", en: "Yugen-owned prop types for Calendar and Resizable (no third-party types in public props)" },
        { status: "planned", issue: 354, vi: "Phân lớp CSS: token trong @layer theme, nhóm token tuỳ chọn, styles.css không reset toàn cục", en: "CSS layering: tokens in @layer theme, opt-in token groups, no global reset from styles.css" },
        { status: "planned", issue: 356, vi: "Phần ngày tháng thành peer tuỳ chọn (yugen-ui/dates)", en: "The date stack as an optional peer (yugen-ui/dates)" },
        { status: "planned", issue: 357, vi: "Input gốc cho Checkbox, Switch và RadioGroup", en: "Native inputs for Checkbox, Switch and RadioGroup" },
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

/** Nội dung ROADMAP.md sinh từ ROADMAP + NEWS: tiếng Anh trước, tiếng Việt bên dưới (#276). */
export function roadmapMarkdown() {
  const box: Record<RoadmapStatus, string> = { done: "[x]", doing: "[~]", planned: "[ ]" };
  const released = NEWS_INDEX.NEWS.filter((r) => !r.upcoming);
  const stages = (lang: "vi" | "en", h: string) => {
    const out: string[] = [];
    for (const stage of ["now", "next", "later"] as const) {
      if (ROADMAP[stage].length === 0) continue;
      out.push("", `${h} ${STAGE_LABEL[stage][lang]}`);
      for (const r of ROADMAP[stage]) {
        const due = r.due ? (lang === "en" ? ` · due ${r.due}` : ` · hạn ${r.due}`) : "";
        out.push("", `${h}# ${releaseTitle(r, lang)}${due}`, "", r[lang], "");
        for (const item of r.items) out.push(`- ${box[item.status]} ${item[lang]}${item.issue ? ` (#${item.issue})` : ""}`);
      }
    }
    return out;
  };
  const lines = [
    "# Yugen UI Roadmap",
    "",
    "<!-- Sinh từ src/docs/roadmap.ts bằng `npm run roadmap`. Đừng sửa tay. -->",
    "",
    "*Tiếng Việt: [xem bên dưới](#tiếng-việt).*",
    "",
    `Plans for each release, updated ${ROADMAP_UPDATED}. Each release is a GitHub milestone; priority, size and`,
    `dependencies are in the [GitHub Project](${PROJECT_URL}). \`[x]\` done, \`[~]\` in progress, \`[ ]\` planned.`,
    "",
    `Want to pick something up? Comment on the issue before you start. The same roadmap is on the`,
    `[community page](${homepage}community).`,
    ...stages("en", "##"),
    "",
    "## Released",
    "",
    "Details on What's new (`/news`) and in `CHANGELOG.md`.",
    "",
    ...released.map((n) => `- **${n.version}** (${n.date}): ${n.title.en}`),
    "",
    "---",
    "",
    "## Tiếng Việt",
    "",
    `Kế hoạch theo từng bản phát hành, cập nhật ${ROADMAP_UPDATED}. Mỗi bản là một milestone trên GitHub; ưu tiên, độ lớn và`,
    `phụ thuộc nằm ở [GitHub Project](${PROJECT_URL}). \`[x]\` đã xong, \`[~]\` đang làm, \`[ ]\` dự kiến.`,
    "",
    `Muốn nhận một mục? Bình luận vào issue trước khi bắt tay làm. Trang [Cộng đồng](${homepage}vi/community) có cùng lộ trình.`,
    ...stages("vi", "###"),
    "",
    "### Đã phát hành",
    "",
    "Chi tiết ở trang Có gì mới (`/news`) và `CHANGELOG.md`.",
    "",
    ...released.map((n) => `- **${n.version}** (${n.date}): ${n.title.vi}`),
  ];
  return `${lines.join("\n")}\n`;
}
