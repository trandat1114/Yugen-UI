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
  Board20Regular,
  BranchFork20Regular,
  Folder20Regular,
  HandRight20Regular,
} from "@fluentui/react-icons";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AvatarGroup,
  AvatarGroupItem,
  Badge,
  type BadgeProps,
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
import {
  issueUrl,
  PROJECT_URL,
  releaseTitle,
  ROADMAP,
  ROADMAP_UPDATED,
  STAGE_LABEL,
  STATUS_LABEL,
  type RoadmapStage,
  type RoadmapStatus,
} from "../roadmap";
import { docsPath } from "../router";
import { avatarOf, CONTRIBUTORS } from "../contributors";

const WIKI = `${SITE.links.repository}/wiki`;

const VI = {
  soon: "Sắp có",
  soonHint: "Maintainer chưa cấu hình link trong src/docs/site.ts",
  eyebrow: "Cộng đồng",
  title: "Cùng xây Yugen UI",
  lead: "Yugen UI là mã nguồn mở. Báo lỗi, viết block hay dịch một trang đều giúp thư viện tốt hơn cho người dùng sau.",
  waysTitle: "Cách tham gia",
  ways: [
    { title: "Đóng góp code", text: "Sửa lỗi, thêm component hoặc block. Đọc CONTRIBUTING.md và Design.md trước khi mở PR.", action: "Mở repository" },
    {
      title: "Báo lỗi",
      text: "Mô tả cách tái hiện, theme, thương hiệu, hướng chữ và trình duyệt đang dùng. Ảnh chụp giúp xử lý nhanh hơn.",
      action: "Tạo issue",
    },
    {
      title: "Đề xuất tính năng",
      text: "Kể bài toán của bạn trước khi đề xuất giải pháp. Component tốt bắt đầu từ một nhu cầu thật.",
      action: "Thảo luận",
    },
    {
      title: "Hỏi & đáp",
      text: "Hỏi về cách dùng, tích hợp Next.js, theme tuỳ biến… ở nơi mọi người cùng tìm được câu trả lời.",
      action: "Đặt câu hỏi",
    },
    {
      title: "Dịch tài liệu",
      text: "Docs có tiếng Việt và tiếng Anh. Trang component và nhiều trang khái niệm chưa có bản tiếng Anh; mỗi PR một trang là đủ.",
      action: "Bắt đầu dịch",
    },
    {
      title: "Chia sẻ block",
      text: "Một file trong src/docs/block-library là đủ: đăng nhập, bảng giá, dashboard…",
      action: "Xem Blocks",
    },
  ],
  howTitle: "Dự án vận hành thế nào",
  howDesc: "Việc đang ở đâu, đi qua những bước nào và bắt đầu từ đâu.",
  how: [
    {
      title: "Kế hoạch",
      text: "Mỗi bản phát hành là một milestone trên GitHub. Ưu tiên, độ lớn và thứ tự làm nằm ở GitHub Project.",
      action: "Mở Project",
    },
    {
      title: "Nhánh và phát hành",
      text: "PR vào next; next lên main khi phát hành. yugen-ui dùng Changesets, 2–4 tuần một bản. CLI phát hành riêng bằng tag cli@X.Y.Z.",
      action: "Quy trình phát hành",
    },
    {
      title: "Mã nằm ở đâu",
      text: "Component: src/components/ui. Trang docs: src/docs/concepts, src/docs/registry. Block và template: src/docs/block-library, src/docs/template-library. Nội dung viết theo wiki › Writing.",
      action: "CONTRIBUTING.md",
    },
    {
      title: "Nhận việc",
      text: "Issue có nhãn good first issue hợp để bắt đầu. Bình luận vào issue trước khi làm để tránh hai người làm trùng.",
      action: "good first issue",
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
  roadmapDesc: (date: string) => `Theo từng bản phát hành, cập nhật ${date}. Có thể đổi theo góp ý của cộng đồng.`,
  roadmapDue: "hạn",
  roadmapShipped: "Đã phát hành:",
  roadmapNews: "Có gì mới",
  roadmapBoard: "Bảng chi tiết:",
  showcaseTitle: "Dự án dùng Yugen UI",
  showcaseEmpty: "Chưa có dự án nào được giới thiệu",
  showcaseEmptyDesc: "Bạn đang dùng Yugen UI? Gửi ảnh chụp và một dòng mô tả để xuất hiện ở đây.",
  showcaseAction: "Giới thiệu dự án",
  conductTitle: "Quy tắc ứng xử",
  conductDesc: "Cộng đồng áp dụng Contributor Covenant 2.1 (CODE_OF_CONDUCT.md).",
  conduct: [
    "Tôn trọng mọi người, mọi trình độ và mọi ngôn ngữ.",
    "Góp ý vào vấn đề, không vào con người.",
    "Ưu tiên khả năng tiếp cận: người dùng cuối rất đa dạng.",
    "Ghi công rõ ràng khi dùng lại ý tưởng hoặc mã nguồn.",
  ],
  peopleTitle: "Người đóng góp",
  authorRole: "Tác giả & maintainer",
  peopleNote: "PR được merge, issue báo lỗi hay đề xuất và review đều được ghi tên ở trang Người đóng góp.",
  peopleAction: "Xem người đóng góp",
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
      a: ["Được. Yugen UI dùng giấy phép MIT: dùng, sửa, phân phối lại, kể cả thương mại, miễn giữ thông báo bản quyền."],
    },
    {
      q: "Nên cài gói npm hay chép mã nguồn?",
      a: [
        "Gói npm hợp khi muốn cập nhật dễ. Chép mã nguồn (bằng @yugen-ui/cli hoặc shadcn CLI) hợp khi cần tuỳ biến sâu từng component. Hai cách dùng chung token nên có thể kết hợp.",
      ],
    },
    {
      q: "Khi nào có bản mới?",
      a: ["yugen-ui ra bản mới khoảng 2–4 tuần một lần. Ngày dự kiến của từng bản có ở mục Lộ trình và trên GitHub Project."],
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
        "Mở thảo luận mô tả tình huống sử dụng, ảnh tham khảo và yêu cầu khả năng tiếp cận. Component mới cần có trang docs, ví dụ chép được và theo Design.md.",
      ],
    },
  ] as { q: string; a: string[] }[],
  creditsTitle: "Ghi công",
  credits: [
    "Microsoft Fluent 2: cấu trúc token, thang đo và hành vi component (nguồn cảm hứng).",
    "shadcn/ui: mô hình chép mã nguồn và danh mục component.",
    "Radix UI: primitive cho hành vi và khả năng tiếp cận.",
    "Fluent System Icons (MIT): bộ icon.",
    "Tailwind CSS v4: engine utility.",
    "cmdk, react-day-picker, react-resizable-panels: thư viện nền.",
  ],
};

type Copy = typeof VI;

const EN: Copy = {
  soon: "Coming soon",
  soonHint: "The maintainer hasn't configured this link in src/docs/site.ts yet",
  eyebrow: "Community",
  title: "Build Yugen UI together",
  lead: "Yugen UI is open source. A bug report, a block or a translated page all make the library better for the next person.",
  waysTitle: "Ways to get involved",
  ways: [
    { title: "Contribute code", text: "Fix bugs, add components or blocks. Read CONTRIBUTING.md and Design.md before opening a PR.", action: "Open repository" },
    {
      title: "Report a bug",
      text: "Describe how to reproduce it, plus the theme, brand, text direction and browser you use. Screenshots speed things up.",
      action: "Open an issue",
    },
    {
      title: "Suggest a feature",
      text: "Describe your problem before proposing a solution. Good components start from a real need.",
      action: "Discuss",
    },
    {
      title: "Q&A",
      text: "Ask about usage, Next.js integration, custom themes… in the open, so everyone can find the answers.",
      action: "Ask a question",
    },
    {
      title: "Translate the docs",
      text: "The docs are in Vietnamese and English. Component pages and many concept pages have no English version yet; one page per PR is plenty.",
      action: "Start translating",
    },
    {
      title: "Share a block",
      text: "One file in src/docs/block-library is all it takes: sign-in, pricing, dashboards…",
      action: "Browse Blocks",
    },
  ],
  howTitle: "How the project works",
  howDesc: "Where work is tracked, what it goes through and where to start.",
  how: [
    {
      title: "Planning",
      text: "Every release is a GitHub milestone. Priorities, sizes and the order of work live in the GitHub Project.",
      action: "Open the Project",
    },
    {
      title: "Branches and releases",
      text: "PRs go to next; next moves to main for a release. yugen-ui uses Changesets, one release every 2–4 weeks. The CLI ships separately with a cli@X.Y.Z tag.",
      action: "Release process",
    },
    {
      title: "Where the code lives",
      text: "Components: src/components/ui. Docs pages: src/docs/concepts, src/docs/registry. Blocks and templates: src/docs/block-library, src/docs/template-library. Copy follows wiki › Writing.",
      action: "CONTRIBUTING.md",
    },
    {
      title: "Picking up work",
      text: "Issues labelled good first issue are a good start. Comment on the issue before you begin so two people don't do the same work.",
      action: "good first issue",
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
  roadmapDesc: (date: string) => `By release, updated ${date}. It can change with community feedback.`,
  roadmapDue: "due",
  roadmapShipped: "Shipped:",
  roadmapNews: "What's new",
  roadmapBoard: "Full board:",
  showcaseTitle: "Built with Yugen UI",
  showcaseEmpty: "No projects featured yet",
  showcaseEmptyDesc: "Using Yugen UI? Send a screenshot and a one-line description to be featured here.",
  showcaseAction: "Feature your project",
  conductTitle: "Code of conduct",
  conductDesc: "The community follows the Contributor Covenant 2.1 (CODE_OF_CONDUCT.md).",
  conduct: [
    "Respect everyone, at every skill level and in every language.",
    "Critique the issue, not the person.",
    "Put accessibility first: end users are diverse.",
    "Give clear credit when reusing ideas or code.",
  ],
  peopleTitle: "Contributors",
  authorRole: "Author & maintainer",
  peopleNote: "Merged pull requests, bug reports, ideas and reviews are all credited on the Contributors page.",
  peopleAction: "See all contributors",
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
      a: ["Yes. Yugen UI is MIT licensed: use, modify and redistribute it, commercially too, as long as you keep the copyright notice."],
    },
    {
      q: "Should I install the npm package or copy the source?",
      a: [
        "The npm package suits you if you want easy updates. Copying the source (with @yugen-ui/cli or the shadcn CLI) suits you if you need to customize components deeply. Both share the same tokens, so you can mix them.",
      ],
    },
    {
      q: "When is the next release?",
      a: ["yugen-ui ships roughly every 2–4 weeks. Each release's target date is in the Roadmap section and on the GitHub Project."],
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
    "Microsoft Fluent 2: token structure, scales and component behavior (inspiration).",
    "shadcn/ui: the copy-the-source model and component catalog.",
    "Radix UI: primitives for behavior and accessibility.",
    "Fluent System Icons (MIT): the icon set.",
    "Tailwind CSS v4: the utility engine.",
    "cmdk, react-day-picker, react-resizable-panels: foundation libraries.",
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
const HOW_ICONS = [Board20Regular, BranchFork20Regular, Folder20Regular, HandRight20Regular];
const HOW_LINKS = [
  PROJECT_URL,
  `${WIKI}/Release-Process`,
  `${SITE.links.repository}/blob/main/CONTRIBUTING.md`,
  `${SITE.links.issues}?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`,
];

const STATUS_BADGE: Record<RoadmapStatus, Pick<BadgeProps, "color" | "appearance">> = {
  done: { color: "success", appearance: "tint" },
  doing: { color: "brand", appearance: "tint" },
  planned: { color: "subtle", appearance: "tint" },
};

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

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

function Roadmap({ copy }: { copy: Copy }) {
  const { locale } = useLocale();
  const lang = locale === "en" ? "en" : "vi";
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      {(Object.keys(ROADMAP) as RoadmapStage[]).filter((stage) => ROADMAP[stage].length > 0).map((stage) => (
        <section key={stage} aria-labelledby={`roadmap-${stage}`} className="flex flex-col gap-3 rounded-2xlarge border border-stroke-2 bg-background-2 p-4">
          <h3 id={`roadmap-${stage}`} className="text-subtitle2 font-semibold">
            {STAGE_LABEL[stage][lang]}
          </h3>
          {ROADMAP[stage].map((release) => (
            <article key={release.milestone} className="flex flex-col gap-2 rounded-large border border-stroke-2 bg-background-1 p-3 shadow-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <h4 className="text-body1 font-semibold text-foreground-1">{releaseTitle(release, lang)}</h4>
                {release.due && (
                  <time dateTime={release.due} className="text-caption1 text-foreground-3">
                    {copy.roadmapDue} {formatDate(release.due, locale)}
                  </time>
                )}
              </div>
              <p className="text-caption1 text-foreground-2">{release[lang]}</p>
              <ul className="flex flex-col gap-1">
                {release.items.map((item) => (
                  <li key={item[lang]} className="flex items-start gap-2 text-caption1 text-foreground-1">
                    <Badge size="small" className="mt-0.5 shrink-0" {...STATUS_BADGE[item.status]}>
                      {STATUS_LABEL[item.status][lang]}
                    </Badge>
                    <span>
                      {item[lang]}
                      {item.issue && (
                        <>
                          {" "}
                          <a href={issueUrl(item.issue)} target="_blank" rel="noreferrer" className="whitespace-nowrap text-link underline hover:text-link-hover">
                            #{item.issue}
                          </a>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

const maintainer = CONTRIBUTORS.find((person) => person.maintainer);
const others = CONTRIBUTORS.filter((person) => !person.maintainer);

export function CommunityPage() {
  const { locale } = useLocale();
  const c = locale === "en" ? EN : VI;

  return (
    <div className="pb-8">
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />

      <DocSection id="ways" title={c.waysTitle}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {c.ways.map(({ title, text, action }, i) => {
            const Icon = WAY_ICONS[i];
            const link = WAY_LINKS[i];
            return (
              <Card key={title} size="large" className="gap-3 rounded-2xlarge">
                <span className="inline-flex size-10 items-center justify-center rounded-xlarge bg-brand-background-2 text-brand-foreground-2">
                  <Icon />
                </span>
                <div className="flex-1">
                  <p className="text-subtitle2 font-semibold">{title}</p>
                  <p className="mt-1 text-body1 text-foreground-2">{text}</p>
                </div>
                <div>
                  {link ? (
                    <ExternalOrSoon link={link.link} fallback={link.fallback} copy={c}>
                      {action}
                    </ExternalOrSoon>
                  ) : (
                    <Button asChild size="small">
                      <a href={docsPath("/blocks")}>{action}</a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </DocSection>

      <DocSection id="how" title={c.howTitle} description={c.howDesc}>
        <div className="grid gap-4 sm:grid-cols-2">
          {c.how.map(({ title, text, action }, i) => {
            const Icon = HOW_ICONS[i];
            return (
              <div key={title} className="flex gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xlarge bg-background-3 text-foreground-2">
                  <Icon />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-subtitle2 font-semibold">{title}</p>
                  <p className="text-body1 text-foreground-2">{text}</p>
                  <a
                    href={HOW_LINKS[i]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 self-start text-body1 text-link hover:text-link-hover hover:underline"
                  >
                    {action} <ArrowRight16Regular className="rtl:-scale-x-100" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </DocSection>

      <DocSection id="start" title={c.startTitle} description={c.startDesc}>
        <CodeBlock code={c.startCode} />
        <ul className="mt-4 flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
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

      <DocSection id="roadmap" title={c.roadmapTitle} description={c.roadmapDesc(formatDate(ROADMAP_UPDATED, locale))}>
        <Roadmap copy={c} />
        <p className="mt-4 text-body1 text-foreground-3">
          {c.roadmapShipped}{" "}
          <a href={docsPath("/news")} className="text-link underline hover:text-link-hover">
            {c.roadmapNews}
          </a>{" "}
          · {c.roadmapBoard}{" "}
          <a href={PROJECT_URL} target="_blank" rel="noreferrer" className="text-link underline hover:text-link-hover">
            GitHub Project
          </a>{" "}
          ·{" "}
          <a href={`${SITE.links.repository}/blob/main/ROADMAP.md`} target="_blank" rel="noreferrer" className="text-link underline hover:text-link-hover">
            ROADMAP.md
          </a>
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
        <ul className="grid max-w-4xl gap-2 sm:grid-cols-2">
          {c.conduct.map((rule) => (
            <li key={rule} className="flex items-start gap-2 rounded-large bg-background-2 p-3 text-body1">
              <HeartPulse20Regular className="mt-0.5 shrink-0 text-brand-foreground-1" />
              {rule}
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="people" title={c.peopleTitle}>
        <div className="flex flex-wrap items-center gap-6">
          <Persona
            name={SITE.author}
            primaryText={<AuthorLink className="text-foreground-1" />}
            secondaryText={c.authorRole}
            avatar={{ color: "brand", src: maintainer && avatarOf(maintainer, 96) }}
            size="large"
          />
          {others.length > 0 && (
            <AvatarGroup layout="stack" size={32} maxAvatars={8}>
              {others.map((person) => (
                <AvatarGroupItem key={person.login} name={person.name} src={avatarOf(person, 64)} />
              ))}
            </AvatarGroup>
          )}
          <div className="flex max-w-md flex-col items-start gap-3">
            <p className="text-body1 text-foreground-3">{c.peopleNote}</p>
            <Button asChild size="small">
              <a href={docsPath("/contributors")}>{c.peopleAction}</a>
            </Button>
          </div>
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
        <ul className="grid max-w-4xl gap-2 text-body1 text-foreground-2 sm:grid-cols-2">
          {c.credits.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </DocSection>
    </div>
  );
}
