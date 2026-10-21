import type { ReactNode } from "react";
import {
  Bug20Regular,
  Chat20Regular,
  Code20Regular,
  Translate20Regular,
  Grid20Regular,
  Lightbulb20Regular,
  HeartPulse20Regular,
  Rocket20Regular,
  ArrowRight16Regular,
} from "@fluentui/react-icons";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Badge,
  Button,
  Card,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Persona,
} from "@/components/ui";
import { DocSection, PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { AuthorLink } from "../AuthorLink";
import { useLocale } from "../i18n";
import { SITE, type SiteLinkKey } from "../site";

const VI = {
  soon: "Sắp có",
  soonHint: "Maintainer chưa cấu hình link trong src/docs/site.ts",
  eyebrow: "Cộng đồng",
  title: "Cùng xây Yugen UI",
  lead: "Yugen UI là mã nguồn mở. Mọi đóng góp — một báo lỗi, một block, một bản dịch — đều làm thư viện tốt hơn cho người dùng tiếp theo.",
  waysTitle: "Cách tham gia",
  ways: [
    { title: "Đóng góp code", text: "Sửa lỗi, thêm component hoặc block. Đọc CONTRIBUTING.md và Design.md trước khi mở PR.", action: "Mở repository" },
    {
      title: "Báo lỗi",
      text: "Mô tả cách tái hiện, theme/brand/hướng chữ đang dùng và trình duyệt. Ảnh chụp giúp xử lý nhanh hơn.",
      action: "Tạo issue",
    },
    {
      title: "Đề xuất tính năng",
      text: "Kể bài toán của bạn trước khi đề xuất giải pháp — component tốt bắt đầu từ một nhu cầu thật.",
      action: "Thảo luận",
    },
    {
      title: "Hỏi & đáp",
      text: "Câu hỏi về cách dùng, tích hợp Next.js, theme tuỳ biến… để mọi người cùng tìm được câu trả lời.",
      action: "Đặt câu hỏi",
    },
    {
      title: "Dịch tài liệu",
      text: "Tài liệu hiện bằng tiếng Việt, README song ngữ. Giúp mang Yugen UI tới nhiều ngôn ngữ hơn.",
      action: "Bắt đầu dịch",
    },
    {
      title: "Chia sẻ block",
      text: "Một file trong src/docs/block-library là đủ — đăng nhập, bảng giá, dashboard… đều được chào đón.",
      action: "Xem Blocks",
    },
  ],
  startTitle: "Bắt đầu đóng góp",
  startDesc: "Năm phút để chạy docs site trên máy của bạn.",
  startCode: `npm install
npm run dev            # docs tại http://localhost:5173
npm run typecheck      # TypeScript strict
npm run lint:classes   # class Tailwind phải ở dạng canonical
npm run build:lib      # build gói npm vào dist/`,
  startComponent: ["Component mới: thư mục", "+ mục docs trong"],
  startBlock: "Block mới: một file trong",
  startCheck: "Kiểm tra cả Light / Dark / Tương phản cao và LTR / RTL trước khi mở PR.",
  roadmapTitle: "Lộ trình",
  roadmapDesc: "Hướng đi dự kiến — có thể thay đổi theo góp ý của cộng đồng.",
  roadmap: [
    {
      column: "Đang làm · 0.5 – 0.6",
      items: [
        "Phát hành yugen-ui 0.5.0 lên npm, docs trên GitHub Pages",
        "Test tự động: Vitest, Playwright + axe, ảnh chụp, mô phỏng chạm",
        "CI: ngân sách dung lượng, React 18 & 19, Changesets",
      ],
    },
    {
      column: "Tiếp theo · 0.7 – 0.8",
      items: [
        "Registry shadcn: init một lệnh (theme, cn, YugenProvider) rồi add",
        "Docs tiếng Anh, props sinh từ TypeScript, Open in StackBlitz",
        "Overflow, DateRangePicker, TimePicker, DataGrid ảo hoá",
        "FileUpload, Stepper, Labs AI (StreamingMarkdown, Citation…)",
      ],
    },
    {
      column: "Hướng tới 1.0",
      items: [
        "Chốt API, chính sách SemVer & deprecate",
        "Docs theo phiên bản, template: starter, SaaS, blog Markdown",
        "SEO: URL theo đường dẫn, prerender, sitemap",
        "Figma kit, gói icon Sakura",
      ],
    },
  ],
  roadmapDone: "Xem những gì đã hoàn thành ở trang",
  roadmapNews: "Có gì mới",
  roadmapDetail: "danh sách chi tiết trong",
  showcaseTitle: "Dự án dùng Yugen UI",
  showcaseEmpty: "Chưa có dự án nào được giới thiệu",
  showcaseEmptyDesc: "Bạn đang dùng Yugen UI? Gửi ảnh chụp và một dòng mô tả để xuất hiện ở đây.",
  showcaseAction: "Giới thiệu dự án",
  conductTitle: "Quy tắc ứng xử",
  conductDesc: "Cộng đồng áp dụng Contributor Covenant 2.1 (CODE_OF_CONDUCT.md).",
  conduct: [
    "Tôn trọng mọi người, mọi trình độ và mọi ngôn ngữ.",
    "Góp ý vào vấn đề, không vào con người.",
    "Ưu tiên khả năng tiếp cận — người dùng cuối của chúng ta rất đa dạng.",
    "Ghi công rõ ràng khi dùng lại ý tưởng hoặc mã nguồn.",
  ],
  peopleTitle: "Người đóng góp",
  authorRole: "Tác giả & maintainer",
  peopleNote: "Danh sách người đóng góp sẽ được cập nhật theo các PR được hợp nhất. Bạn có thể là người tiếp theo.",
  faqTitle: "Câu hỏi thường gặp",
  /** `a`: các đoạn văn; câu trả lời có 2 đoạn chèn tên tác giả (có link) ở giữa. */
  faq: [
    {
      q: "Yugen UI có liên quan tới Microsoft không?",
      a: [
        "Không. Yugen UI lấy cảm hứng từ hệ thống token và hành vi của Microsoft Fluent 2, nhưng là dự án độc lập của",
        "và không được Microsoft bảo trợ.",
      ],
    },
    {
      q: "Có dùng cho dự án thương mại được không?",
      a: ["Được. Yugen UI phát hành theo giấy phép MIT — dùng, sửa, phân phối lại, kể cả thương mại, miễn giữ thông báo bản quyền."],
    },
    {
      q: "Nên cài gói npm hay copy component?",
      a: [
        "Gói npm phù hợp khi muốn cập nhật dễ. Copy-paste (kiểu shadcn/ui) phù hợp khi muốn sở hữu và chỉnh sâu từng component. Hai cách dùng chung token nên có thể kết hợp.",
      ],
    },
    {
      q: "Có hỗ trợ Tailwind CSS v3 không?",
      a: [
        "Không chính thức. Yugen dựa vào cấu hình CSS-first của Tailwind v4 (@theme, @utility). Nếu không dùng Tailwind, hãy import styles.css đã biên dịch sẵn.",
      ],
    },
    {
      q: "Làm sao để đề xuất một component mới?",
      a: [
        "Mở thảo luận mô tả tình huống sử dụng, ảnh tham khảo và yêu cầu khả năng tiếp cận. Component mới cần có trang docs, ví dụ copy được và tuân thủ Design.md.",
      ],
    },
  ] as { q: string; a: string[] }[],
  creditsTitle: "Ghi công",
  credits: [
    "Microsoft Fluent 2 — cấu trúc token, thang đo và hành vi component (nguồn cảm hứng).",
    "shadcn/ui — mô hình copy-paste và danh mục component.",
    "Radix UI — primitive cho hành vi và khả năng tiếp cận.",
    "Fluent System Icons (MIT) — bộ icon.",
    "Tailwind CSS v4 — engine utility.",
    "cmdk, react-day-picker, react-resizable-panels — thư viện nền.",
  ],
};

type Copy = typeof VI;

const EN: Copy = {
  soon: "Coming soon",
  soonHint: "The maintainer hasn't configured this link in src/docs/site.ts yet",
  eyebrow: "Community",
  title: "Build Yugen UI together",
  lead: "Yugen UI is open source. Every contribution — a bug report, a block, a translation — makes the library better for the next person.",
  waysTitle: "Ways to get involved",
  ways: [
    { title: "Contribute code", text: "Fix bugs, add components or blocks. Read CONTRIBUTING.md and Design.md before opening a PR.", action: "Open repository" },
    {
      title: "Report a bug",
      text: "Describe how to reproduce it, plus the theme / brand / text direction and browser you use. Screenshots speed things up.",
      action: "Open an issue",
    },
    {
      title: "Suggest a feature",
      text: "Describe your problem before proposing a solution — good components start from a real need.",
      action: "Discuss",
    },
    {
      title: "Q&A",
      text: "Questions about usage, Next.js integration, custom themes… asked in the open so everyone can find the answers.",
      action: "Ask a question",
    },
    {
      title: "Translate the docs",
      text: "The docs are written in Vietnamese, with a bilingual README and an English mode in progress. Help bring Yugen UI to more languages.",
      action: "Start translating",
    },
    {
      title: "Share a block",
      text: "One file in src/docs/block-library is all it takes — sign-in, pricing, dashboards… all welcome.",
      action: "Browse Blocks",
    },
  ],
  startTitle: "Start contributing",
  startDesc: "Five minutes to run the docs site on your machine.",
  startCode: `npm install
npm run dev            # docs at http://localhost:5173
npm run typecheck      # strict TypeScript
npm run lint:classes   # Tailwind classes must be canonical
npm run build:lib      # build the npm package into dist/`,
  startComponent: ["New component: a folder in", "plus a docs entry in"],
  startBlock: "New block: a single file in",
  startCheck: "Check Light / Dark / High contrast and LTR / RTL before opening a PR.",
  roadmapTitle: "Roadmap",
  roadmapDesc: "Where we're heading — subject to change based on community feedback.",
  roadmap: [
    {
      column: "In progress · 0.5 – 0.6",
      items: [
        "Publish yugen-ui 0.5.0 to npm, docs on GitHub Pages",
        "Automated tests: Vitest, Playwright + axe, screenshots, touch emulation",
        "CI: size budgets, React 18 & 19, Changesets",
      ],
    },
    {
      column: "Next · 0.7 – 0.8",
      items: [
        "shadcn registry: one-command init (theme, cn, YugenProvider), then add",
        "English docs, props generated from TypeScript, Open in StackBlitz",
        "Overflow, DateRangePicker, TimePicker, virtualized DataGrid",
        "FileUpload, Stepper, Labs AI (StreamingMarkdown, Citation…)",
      ],
    },
    {
      column: "Toward 1.0",
      items: [
        "Stable API, SemVer & deprecation policy",
        "Versioned docs, templates: starter, SaaS, Markdown blog",
        "SEO: path-based URLs, prerendering, sitemap",
        "Figma kit, Sakura icon pack",
      ],
    },
  ],
  roadmapDone: "See what has shipped on",
  roadmapNews: "What's new",
  roadmapDetail: "full list in",
  showcaseTitle: "Built with Yugen UI",
  showcaseEmpty: "No projects featured yet",
  showcaseEmptyDesc: "Using Yugen UI? Send a screenshot and a one-line description to be featured here.",
  showcaseAction: "Feature your project",
  conductTitle: "Code of conduct",
  conductDesc: "The community follows the Contributor Covenant 2.1 (CODE_OF_CONDUCT.md).",
  conduct: [
    "Respect everyone — every skill level and every language.",
    "Critique the issue, not the person.",
    "Put accessibility first — our end users are wonderfully diverse.",
    "Give clear credit when reusing ideas or code.",
  ],
  peopleTitle: "Contributors",
  authorRole: "Author & maintainer",
  peopleNote: "The contributor list grows with every merged PR. You could be next.",
  faqTitle: "FAQ",
  faq: [
    {
      q: "Is Yugen UI affiliated with Microsoft?",
      a: [
        "No. Yugen UI is inspired by Microsoft Fluent 2's token system and component behavior, but it's an independent project by",
        "and isn't endorsed by Microsoft.",
      ],
    },
    {
      q: "Can I use it in commercial projects?",
      a: ["Yes. Yugen UI is MIT licensed — use, modify and redistribute it, commercially too, as long as you keep the copyright notice."],
    },
    {
      q: "Should I install the npm package or copy components?",
      a: [
        "The npm package suits you if you want easy updates. Copy-paste (shadcn/ui style) suits you if you want to own and deeply customize each component. Both share the same tokens, so you can mix them.",
      ],
    },
    {
      q: "Is Tailwind CSS v3 supported?",
      a: [
        "Not officially. Yugen relies on Tailwind v4's CSS-first configuration (@theme, @utility). If you don't use Tailwind, import the precompiled styles.css.",
      ],
    },
    {
      q: "How do I propose a new component?",
      a: [
        "Open a discussion describing the use case, reference images and accessibility requirements. New components need a docs page and copyable examples, and must follow Design.md.",
      ],
    },
  ],
  creditsTitle: "Credits",
  credits: [
    "Microsoft Fluent 2 — token structure, scales and component behavior (inspiration).",
    "shadcn/ui — the copy-paste model and component catalog.",
    "Radix UI — primitives for behavior and accessibility.",
    "Fluent System Icons (MIT) — the icon set.",
    "Tailwind CSS v4 — the utility engine.",
    "cmdk, react-day-picker, react-resizable-panels — foundation libraries.",
  ],
};

const WAY_ICONS = [Code20Regular, Bug20Regular, Lightbulb20Regular, Chat20Regular, Translate20Regular, Grid20Regular];
/** Link của từng cách tham gia (cùng thứ tự với `ways`); mục cuối là link nội bộ tới Blocks. */
const WAY_LINKS: ({ link: SiteLinkKey; fallback?: SiteLinkKey } | null)[] = [
  { link: "repository" },
  { link: "issues" },
  { link: "discussions", fallback: "issues" },
  { link: "discussions", fallback: "issues" },
  { link: "repository" },
  null,
];
const ROADMAP_TONES = ["brand", "informative", "subtle"] as const;

function ExternalOrSoon({ link, fallback, copy, children }: { link: SiteLinkKey; fallback?: SiteLinkKey; copy: Copy; children: ReactNode }) {
  const href = SITE.links[link] || (fallback ? SITE.links[fallback] : "");
  if (!href)
    return (
      <Button size="small" disabled title={copy.soonHint}>
        {copy.soon}
      </Button>
    );
  return (
    <Button asChild size="small" appearance="primary">
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    </Button>
  );
}

export function CommunityPage() {
  const { locale } = useLocale();
  const c = locale === "en" ? EN : VI;

  return (
    <div className="pb-XXXL">
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />

      <DocSection id="ways" title={c.waysTitle}>
        <div className="grid gap-L sm:grid-cols-2 xl:grid-cols-3">
          {c.ways.map(({ title, text, action }, i) => {
            const Icon = WAY_ICONS[i];
            const link = WAY_LINKS[i];
            return (
              <Card key={title} size="large" className="gap-M rounded-2xlarge">
                <span className="inline-flex size-10 items-center justify-center rounded-xlarge bg-brand-background-2 text-brand-foreground-2">
                  <Icon />
                </span>
                <div className="flex-1">
                  <p className="text-subtitle2 font-semibold">{title}</p>
                  <p className="mt-XS text-body1 text-foreground-2">{text}</p>
                </div>
                <div>
                  {link ? (
                    <ExternalOrSoon link={link.link} fallback={link.fallback} copy={c}>
                      {action}
                    </ExternalOrSoon>
                  ) : (
                    <Button asChild size="small">
                      <a href="#/blocks">{action}</a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </DocSection>

      <DocSection id="start" title={c.startTitle} description={c.startDesc}>
        <CodeBlock code={c.startCode} />
        <ul className="mt-L flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
          <li>
            {c.startComponent[0]} <code className="font-mono text-caption1">src/components/ui/&lt;Name&gt;</code> {c.startComponent[1]}{" "}
            <code className="font-mono text-caption1">src/docs/registry</code>.
          </li>
          <li>
            {c.startBlock} <code className="font-mono text-caption1">src/docs/block-library</code>.
          </li>
          <li>{c.startCheck}</li>
        </ul>
      </DocSection>

      <DocSection id="roadmap" title={c.roadmapTitle} description={c.roadmapDesc}>
        <div className="grid gap-L md:grid-cols-3">
          {c.roadmap.map((col, i) => (
            <div key={col.column} className="rounded-2xlarge border border-stroke-2 bg-background-2 p-L">
              <div className="mb-M flex items-center justify-between">
                <p className="text-subtitle2 font-semibold">{col.column}</p>
                <Badge appearance="tint" color={ROADMAP_TONES[i]}>
                  {col.items.length}
                </Badge>
              </div>
              <ul className="flex flex-col gap-S">
                {col.items.map((item) => (
                  <li key={item} className="rounded-large border border-stroke-2 bg-background-1 px-M py-S text-body1 shadow-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-L text-body1 text-foreground-3">
          {c.roadmapDone}{" "}
          <a href="#/news" className="inline-flex items-center gap-XXS text-link hover:text-link-hover hover:underline">
            {c.roadmapNews} <ArrowRight16Regular className="rtl:-scale-x-100" />
          </a>
          {SITE.links.repository && (
            <>
              {" "}· {c.roadmapDetail}{" "}
              <a
                href={`${SITE.links.repository}/blob/main/ROADMAP.md`}
                target="_blank"
                rel="noreferrer"
                className="text-link underline hover:text-link-hover"
              >
                ROADMAP.md
              </a>
            </>
          )}
        </p>
      </DocSection>

      <DocSection id="showcase" title={c.showcaseTitle}>
        <Empty variant="outline">
          <EmptyHeader>
            <EmptyMedia>
              <Rocket20Regular />
            </EmptyMedia>
            <EmptyTitle>{c.showcaseEmpty}</EmptyTitle>
            <EmptyDescription>{c.showcaseEmptyDesc}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <ExternalOrSoon link="discussions" copy={c}>
              {c.showcaseAction}
            </ExternalOrSoon>
          </EmptyContent>
        </Empty>
      </DocSection>

      <DocSection id="conduct" title={c.conductTitle} description={c.conductDesc}>
        <ul className="grid max-w-4xl gap-S sm:grid-cols-2">
          {c.conduct.map((rule) => (
            <li key={rule} className="flex items-start gap-S rounded-large bg-background-2 p-M text-body1">
              <HeartPulse20Regular className="mt-XXS shrink-0 text-brand-foreground-1" />
              {rule}
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="people" title={c.peopleTitle}>
        <div className="flex flex-wrap items-center gap-XXL">
          <Persona
            name={SITE.author}
            primaryText={<AuthorLink className="text-foreground-1" />}
            secondaryText={c.authorRole}
            avatar={{ color: "brand" }}
            size="large"
          />
          <p className="max-w-md text-body1 text-foreground-3">{c.peopleNote}</p>
        </div>
      </DocSection>

      <DocSection id="faq" title={c.faqTitle}>
        <Accordion type="single" collapsible className="max-w-3xl">
          {c.faq.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionHeader>{item.q}</AccordionHeader>
              <AccordionPanel>
                <p className="text-body1 text-foreground-2">
                  {item.a.length > 1 ? (
                    <>
                      {item.a[0]} <AuthorLink className="text-link hover:text-link-hover" /> {item.a[1]}
                    </>
                  ) : (
                    item.a[0]
                  )}
                </p>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </DocSection>

      <DocSection id="credits" title={c.creditsTitle}>
        <ul className="grid max-w-4xl gap-S text-body1 text-foreground-2 sm:grid-cols-2">
          {c.credits.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </DocSection>
    </div>
  );
}
