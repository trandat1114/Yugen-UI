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

export const ROADMAP_UPDATED = "2026-11-04";
export const PROJECT_URL = "https://github.com/users/trandat1114/projects/6";

export const ROADMAP: Record<RoadmapStage, RoadmapRelease[]> = {
  now: [
    {
      milestone: "0.15.0",
      kind: "minor",
      due: "2026-11-25",
      vi: "Rà soát trước 1.0 (API, Labs, bảo mật), prop mặc định và mật độ từ YugenProvider, tuỳ chọn thanh cuộn.",
      en: "Reviews before 1.0 (API, Labs, security), default props and density from YugenProvider, a scroll lock setting.",
      items: [
        { status: "doing", issue: 157, vi: "Rà soát API: tên mới cho các prop lệch chuẩn, tên cũ cảnh báo deprecation tới 1.0", en: "API review: new names for the outlier props, old names deprecated until 1.0" },
        { status: "planned", issue: 158, vi: "Yugen Labs: promote component đã chín, phần còn lại đánh dấu thử nghiệm", en: "Yugen Labs: promote what is mature, mark the rest experimental" },
        { status: "done", issue: 171, vi: "Prop mặc định và mật độ (density) từ YugenProvider", en: "Default props and density from YugenProvider" },
        { status: "planned", issue: 230, vi: "Glass làm mặc định cho component điều hướng, qua prop mặc định", en: "Glass as a default for navigation components, through default props" },
        { status: "planned", issue: 243, vi: "Khóa cuộn: chọn giữ hay ẩn thanh cuộn khi mở Menu, ContextMenu, Dropdown", en: "Scroll lock: keep or hide the page scrollbar while Menu, ContextMenu or Dropdown is open" },
        { status: "planned", issue: 165, vi: "Rà soát bảo mật các component hiển thị nội dung không tin cậy", en: "Security review of components that render untrusted content" },
        { status: "done", issue: 320, vi: "Icon có sẵn trong thư viện: cài yugen-ui nhẹ hơn ~180 MB", en: "Built-in icons: installing yugen-ui is ~180 MB lighter" },
        { status: "done", issue: 62, vi: "Chỉ hỗ trợ React 19: bỏ React 18 khỏi peer dependency và CI", en: "React 19 only: React 18 leaves the peer dependencies and CI" },
      ],
    },
    {
      milestone: "0.16.0",
      kind: "minor",
      due: "2026-12-09",
      vi: "Những phần còn thiếu của một bộ component đầy đủ.",
      en: "The missing pieces of a complete kit.",
      items: [
        { status: "planned", issue: 168, vi: "NavigationMenu cho header website", en: "NavigationMenu for website headers" },
        { status: "planned", issue: 173, vi: "Form control còn thiếu: PasswordInput, input có định dạng, chọn tháng / năm / ngày giờ, ColorPicker", en: "Missing form controls: PasswordInput, formatted inputs, month / year / date-time pickers, ColorPicker" },
        { status: "planned", issue: 244, vi: "Typography: trang Typeset tinh chỉnh Prose (font, cỡ chữ, khoảng cách) và copy CSS", en: "Typography: a Typeset page to tune Prose (fonts, size, spacing) and copy the CSS" },
        { status: "planned", issue: 238, vi: "Trang lỗi HTTP: component StatusPage, trang 404 cho docs, not-found trong template", en: "HTTP status pages: a StatusPage component, a docs 404 route, not-found routes in the templates" },
        { status: "planned", issue: 167, vi: "Unit test tối thiểu cho mọi component, coverage trong CI", en: "A unit test floor for every component, with coverage in CI" },
        { status: "planned", issue: 166, vi: "Visual regression cho mọi component (3 theme + RTL)", en: "Visual regression for every component (3 themes + RTL)" },
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
        { status: "planned", issue: 160, vi: "Đề xuất cho 1.0 (đã duyệt): Form, NavigationMenu, block 2.0, codemod, kiểm thử", en: "1.0 proposals (approved): Form, NavigationMenu, blocks 2.0, codemods, testing" },
        { status: "planned", issue: 169, vi: "@yugen-ui/cli ghi các dòng @import của CSS theo component (init, doctor)", en: "@yugen-ui/cli writes the @import lines for per-component CSS (init, doctor)" },
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
