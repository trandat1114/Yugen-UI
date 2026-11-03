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

export const ROADMAP_UPDATED = "2026-11-03";
export const PROJECT_URL = "https://github.com/users/trandat1114/projects/6";

export const ROADMAP: Record<RoadmapStage, RoadmapRelease[]> = {
  now: [
    {
      milestone: "0.14.0",
      kind: "minor",
      due: "2026-11-11",
      vi: "AppShell, Sortable, hooks dùng chung, CSS theo component dùng và trang Người đóng góp.",
      en: "AppShell, Sortable, shared hooks, CSS for the components you use and a Contributors page.",
      items: [
        { status: "done", issue: 161, vi: "AppShell và Sidebar: thu về icon trên màn rộng, Drawer trên màn hẹp; các template dựng trên nó", en: "AppShell and Sidebar: an icon rail on wide screens, a Drawer on narrow ones; the templates are built on it" },
        { status: "done", issue: 175, vi: "Sortable: sắp xếp lại bằng kéo thả hoặc bàn phím; thứ tự cột của DataGrid, thứ tự tag của TagPicker, Kanban trong template Admin", en: "Sortable: reorder by drag and drop or keyboard; DataGrid column order, TagPicker tag order, a Kanban board in the Admin template" },
        { status: "done", issue: 172, vi: "Hooks dùng chung, chính là những hook các component dùng: useControllableState, useDisclosure, useLocalStorage, useHotkeys…", en: "Shared hooks, the ones the components use themselves: useControllableState, useDisclosure, useLocalStorage, useHotkeys…" },
        { status: "done", issue: 169, vi: "CSS theo component dùng: theme-core.css và sources/<Component>.css; template từ khoảng 25 kB xuống 14–19 kB gzip", en: "CSS for the components you use: theme-core.css and sources/<Component>.css; templates go from about 25 kB to 14–19 kB gzip" },
        { status: "done", issue: 263, vi: "Markdown: hiển thị Markdown tĩnh (bài viết, ghi chú phát hành, CMS) theo kiểu chữ của Prose", en: "Markdown: render static Markdown (articles, release notes, CMS fields) with Prose typography" },
        { status: "done", issue: 248, vi: "Trang Người đóng góp: ghi tên người gửi PR, báo lỗi, đề xuất và review", en: "Contributors page: credits merged PRs, bug reports, suggestions and reviews" },
        { status: "done", issue: 261, vi: "Có gì mới bằng tiếng Anh; tin viết bằng Markdown, CI nhẹ cho PR chỉ sửa tin", en: "What's new in English; release notes in Markdown, a light CI check for news-only PRs" },
        { status: "done", issue: 266, vi: "Docs trên điện thoại: bảng props và bảng Messages không cuộn ngang, mọi trang component vừa 375px", en: "Docs on phones: the props and Messages tables never scroll sideways, every component page fits 375px" },
        { status: "doing", issue: 277, vi: "Tiếng Anh mặc định: docs ở gốc (tiếng Việt dưới /vi/, có gợi ý cho trình duyệt tiếng Việt) và chữ có sẵn của component (messagesVi cho tiếng Việt)", en: "English by default: the docs at the root (Vietnamese under /vi/, with a suggestion for Vietnamese browsers) and components' built-in text (messagesVi for Vietnamese)" },
        { status: "doing", issue: 275, vi: "Ảnh người đóng góp trong CONTRIBUTING.md và README, cập nhật vài phút sau mỗi đóng góp", en: "Contributor avatars in CONTRIBUTING.md and the README, updated a few minutes after each contribution" },
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
        { status: "planned", issue: 160, vi: "Đề xuất cho 1.0 (đã duyệt): Form, NavigationMenu, block 2.0, codemod, kiểm thử", en: "1.0 proposals (approved): Form, NavigationMenu, blocks 2.0, codemods, testing" },
        { status: "planned", issue: 169, vi: "@yugen-ui/cli ghi các dòng @import của CSS theo component (init, doctor)", en: "@yugen-ui/cli writes the @import lines for per-component CSS (init, doctor)" },
        { status: "doing", issue: 276, vi: "Tài liệu repo tiếng Anh trước, tiếng Việt bên dưới: CONTRIBUTING, README, ROADMAP, template issue / PR, Design.md, wiki", en: "Repository documents in English first, Vietnamese below: CONTRIBUTING, README, ROADMAP, issue / PR templates, Design.md, wiki" },
        { status: "planned", issue: 278, vi: "Nội dung demo bằng tiếng Anh: ví dụ trên docs, block và template", en: "Demo content in English: docs examples, blocks and templates" },
        { status: "planned", issue: 243, vi: "Khóa cuộn: chọn giữ hay ẩn thanh cuộn khi mở Menu, ContextMenu, Dropdown", en: "Scroll lock: keep or hide the page scrollbar while Menu, ContextMenu or Dropdown is open" },
        { status: "planned", issue: 244, vi: "Typography: trang Typeset tinh chỉnh Prose (font, cỡ chữ, khoảng cách) và copy CSS", en: "Typography: a Typeset page to tune Prose (fonts, size, spacing) and copy the CSS" },
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
