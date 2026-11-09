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
      milestone: "0.16.0",
      kind: "minor",
      due: "2026-11-18",
      vi: "Hiệu năng: import nhẹ hơn, CSS theo đúng phần bạn import, ít render lại hơn.",
      en: "Performance: lighter imports, CSS that follows your imports, fewer re-renders.",
      items: [
        { status: "done", issue: 343, vi: "Kiểu cho mọi export với moduleResolution nodenext; bỏ tsc-alias", en: "Types for every export under moduleResolution nodenext; tsc-alias replaced" },
        { status: "done", issue: 344, vi: "Import theo subpath: yugen-ui/Button chỉ nạp một component", en: "Subpath imports: yugen-ui/Button loads one component" },
        { status: "done", issue: 345, vi: "Helper an toàn cho server: readAppShellCookie chạy trong Server Component", en: "Server-safe helpers: readAppShellCookie works in Server Components" },
        { status: "done", issue: 346, vi: "YugenProvider chỉ nạp Toaster khi bật withToaster", en: "YugenProvider loads the Toaster only with withToaster" },
        { status: "done", issue: 347, vi: "Ít render lại hơn: theme có context riêng, messages inline so theo giá trị", en: "Fewer re-renders: the theme in its own context, inline messages compared by value" },
        { status: "done", issue: 348, vi: "Theme trước lần vẽ đầu khi SSR: yugenHtmlAttributes, yugenThemeScript", en: "Theme before the first paint with SSR: yugenHtmlAttributes, yugenThemeScript" },
        { status: "done", issue: 349, vi: "Component ngày tháng không còn kèm locale tiếng Việt", en: "Date components no longer bundle the Vietnamese locale" },
        { status: "done", issue: 350, vi: "Menu thu gọn của Breadcrumb và thẻ chú thích nạp lúc cần; Nav không kèm Tooltip", en: "Breadcrumb's overflow menu and citation cards load on demand; Nav without Tooltip" },
        { status: "done", issue: 352, vi: "Biểu đồ: một bước hover khoảng 1 ms dù nhiều điểm, markup nhỏ hơn, Sparkline không cần observer", en: "Charts: a hover step takes about 1 ms at any point count, smaller markup, Sparkline without an observer" },
        { status: "done", issue: 353, vi: "CSS nền: keyframe chỉ xuất khi dùng, tokens.css là CSS thuần, theme.css import theme-core.css", en: "CSS floor: keyframes only when used, plain tokens.css, theme.css imports theme-core.css" },
        { status: "done", issue: 169, vi: "yugen css: chỉ CSS của các component mà app import (init, add, doctor)", en: "yugen css: only the CSS of the components an app imports (init, add, doctor)" },
        { status: "done", issue: 355, vi: "Class của variant được gộp một lần cho mỗi tổ hợp props", en: "Variant classes merged once per combination of props" },
        { status: "done", issue: 360, vi: "Ngân sách dung lượng: số đo + 8%, CSS đã biên dịch, kiểm tra độ dư trong CI", en: "Size budgets: measured + 8%, compiled CSS, a slack check in CI" },
        { status: "done", issue: 370, vi: "Docs và CI cho esbuild có code splitting (import theo subpath)", en: "Docs and CI for esbuild code splitting (subpath imports)" },
        { status: "done", issue: 351, vi: "Combobox và TagPicker dùng listbox riêng, không cần cmdk", en: "Combobox and TagPicker on their own listbox, without cmdk" },
        { status: "done", issue: 368, vi: "yugen css --watch và plugin Vite: import mới có style ngay khi dev", en: "yugen css --watch and a Vite plugin, so a new import is styled during dev" },
        { status: "done", issue: 369, vi: "Deprecate withToaster: template và docs đặt Toaster rõ ràng", en: "Deprecate withToaster: an explicit Toaster in templates and docs" },
        { status: "done", issue: 372, vi: "Việc còn lại của đợt rà soát: directive của cookie.ts trong registry, optimizePackageImports cho next-starter, mức sàn test", en: "Audit follow-ups: registry directive for cookie.ts, optimizePackageImports in next-starter, test floors" },
      ],
    },
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
