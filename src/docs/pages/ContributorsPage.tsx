import * as React from "react";
import {
  Accessibility16Regular,
  Bug16Regular,
  Code16Regular,
  Comment16Regular,
  CommentCheckmark16Regular,
  Document16Regular,
  Grid16Regular,
  Lightbulb16Regular,
  PaintBrush16Regular,
  Translate16Regular,
} from "@fluentui/react-icons";
import { Avatar, Badge, Button, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { DocSection, PageHeader } from "../blocks";
import { useLocale } from "../i18n";
import { SITE } from "../site";
import { SakuraBranch } from "../SakuraBranch";
import { SakuraBlossom } from "../YugenMark";
import {
  avatarOf,
  CONTRIBUTION_GROUPS,
  CONTRIBUTION_TYPES,
  contributionsIn,
  CONTRIBUTORS,
  CONTRIBUTORS_UPDATED,
  profileUrl,
  type ContributionGroup,
  type ContributionType,
  type Contributor,
} from "../contributors";

const TYPE_ICON: Record<ContributionType, React.ReactElement> = {
  code: <Code16Regular />,
  templates: <Grid16Regular />,
  docs: <Document16Regular />,
  translation: <Translate16Regular />,
  design: <PaintBrush16Regular />,
  review: <CommentCheckmark16Regular />,
  discussion: <Comment16Regular />,
  bug: <Bug16Regular />,
  a11y: <Accessibility16Regular />,
  idea: <Lightbulb16Regular />,
};

/** Bộ lọc theo loại chỉ hiện khi danh sách đủ dài để cần lọc. */
const FILTER_FROM = 9;

const VI = {
  eyebrow: "Cộng đồng",
  title: "Người đóng góp",
  lead: "Những người đã giúp Yugen UI bằng code, tài liệu, bản dịch, ý tưởng, báo lỗi hay review. Đóng góp nào được ghi nhận trên GitHub cũng có tên ở đây.",
  caption: "Mỗi bông hoa là một người, nở theo thứ tự lần đầu đóng góp tính từ gốc cành. Nụ là chỗ còn trống.",
  groups: {
    code: {
      title: "Code và tài liệu",
      desc: (n: number) => `PR đã merge: code, template, tài liệu, bản dịch. ${n} người, xếp theo lần đóng góp đầu tiên.`,
      invite: "Sửa một câu trong tài liệu hay nhận một good first issue. Lần deploy docs sau, tên bạn sẽ có trên cành.",
    },
    ideas: {
      title: "Ý tưởng và thảo luận",
      desc: (n: number) => `Đề xuất, thiết kế, báo lỗi, review và góp ý trong issue. ${n} người, xếp theo lần đóng góp đầu tiên.`,
      invite: "Báo một lỗi, đề xuất một thay đổi hay góp ý trong một issue đang mở. Lần deploy docs sau, tên bạn sẽ có trên cành.",
    },
  } satisfies Record<ContributionGroup, { title: string; desc: (n: number) => string; invite: string }>,
  maintainer: "Tác giả & maintainer",
  since: (date: string) => `Đóng góp từ ${date}`,
  counts: (name: string) => `Đóng góp của ${name}`,
  recent: (name: string) => `Đóng góp gần đây của ${name}`,
  more: (n: number) => `Xem cả ${n} đóng góp trên GitHub`,
  filter: "Lọc theo loại đóng góp",
  all: "Tất cả",
  inviteTitle: "Chỗ này dành cho bạn",
  inviteIssues: "Xem good first issue",
  inviteNew: "Mở issue",
  inviteOpen: "Xem issue đang mở",
  howTitle: "Cách ghi tên",
  how: [
    "Code, template, block, tài liệu, bản dịch: PR đã merge, xếp loại theo các file PR sửa.",
    "Review: review trên một PR đã merge.",
    "Báo lỗi, báo lỗi tiếp cận, đề xuất: issue mở bằng mẫu issue, trừ issue trùng, không hợp lệ hoặc chỉ là câu hỏi.",
    "Góp ý: bình luận trong issue của người khác, bỏ bình luận quá ngắn như \"+1\" hay \"Cảm ơn\". Lấy tự động như PR và issue.",
    "Thiết kế và ý tưởng ngoài GitHub, hoặc khi một góp ý cần ghi rõ loại (đề xuất, báo lỗi tiếp cận): maintainer ghi tay vào src/docs/contributors.extra.json.",
  ],
  updated: (date: string) =>
    `Danh sách cập nhật mỗi lần docs được deploy, lần gần nhất ${date}. Mỗi bản phát hành cũng ghi tên người đóng góp ở trang Có gì mới và trong CHANGELOG.`,
  privacy:
    "Trang chỉ dùng dữ liệu công khai trên GitHub: tên đăng nhập, tên hiển thị và ảnh đại diện. Muốn bỏ tên khỏi trang, mở issue hoặc nhắn maintainer.",
  types: {
    code: "Code",
    templates: "Template, block",
    docs: "Tài liệu",
    translation: "Bản dịch",
    design: "Thiết kế",
    review: "Review",
    discussion: "Góp ý",
    bug: "Báo lỗi",
    a11y: "Báo lỗi tiếp cận",
    idea: "Đề xuất",
  } satisfies Record<ContributionType, string>,
};

const EN: typeof VI = {
  eyebrow: "Community",
  title: "Contributors",
  lead: "The people who helped Yugen UI with code, docs, translations, ideas, bug reports and reviews. Every contribution recorded on GitHub puts a name here.",
  caption: "Each blossom is one person, opening in order of their first contribution from the base of the branch. Buds are the spots still open.",
  groups: {
    code: {
      title: "Code and docs",
      desc: (n) => `Merged pull requests: code, templates, docs, translations. ${n} ${n === 1 ? "person" : "people"}, in order of their first contribution.`,
      invite: "Fix a sentence in the docs or pick up a good first issue. Your name joins the branch on the next docs deploy.",
    },
    ideas: {
      title: "Ideas and discussion",
      desc: (n) => `Ideas, design, bug reports, reviews and feedback in issues. ${n} ${n === 1 ? "person" : "people"}, in order of their first contribution.`,
      invite: "Report a bug, suggest a change or give feedback on an open issue. Your name joins the branch on the next docs deploy.",
    },
  },
  maintainer: "Author & maintainer",
  since: (date) => `Contributing since ${date}`,
  counts: (name) => `Contributions by ${name}`,
  recent: (name) => `Recent contributions by ${name}`,
  more: (n) => `See all ${n} contributions on GitHub`,
  filter: "Filter by contribution",
  all: "All",
  inviteTitle: "This spot is for you",
  inviteIssues: "Browse good first issues",
  inviteNew: "Open an issue",
  inviteOpen: "Browse open issues",
  howTitle: "How credit works",
  how: [
    "Code, templates, blocks, docs, translations: merged pull requests, sorted by the files they change.",
    "Reviews: a review on a merged pull request.",
    "Bug reports, accessibility reports, ideas: issues opened from an issue template, except duplicates, invalid issues and questions.",
    "Feedback: comments on someone else's issue, except very short ones such as \"+1\" or \"Thanks\". Collected automatically, like pull requests and issues.",
    "Design and ideas outside GitHub, or a comment that deserves a more specific type (idea, accessibility report): added by a maintainer in src/docs/contributors.extra.json.",
  ],
  updated: (date) =>
    `The list refreshes on every docs deploy, last on ${date}. Each release also names its contributors on What's new and in the CHANGELOG.`,
  privacy:
    "This page uses public GitHub data only: username, display name and avatar. To take your name off the page, open an issue or contact a maintainer.",
  types: {
    code: "Code",
    templates: "Templates & blocks",
    docs: "Docs",
    translation: "Translation",
    design: "Design",
    review: "Reviews",
    discussion: "Feedback",
    bug: "Bug reports",
    a11y: "Accessibility reports",
    idea: "Ideas",
  },
};

type Copy = typeof VI;

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date));
}

/**
 * Giây animation cành hoa đã chạy trên HTML prerender trước khi React thay DOM (như hero trang chủ): contributors.css trừ
 * khoảng này vào delay để animation chạy tiếp thay vì phát lại.
 */
function prerenderedElapsed() {
  if (typeof document === "undefined" || !document.querySelector("#root .cb-art")) return 0;
  const firstPaint = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
  return Math.max(0, (performance.now() - firstPaint) / 1000);
}

/** Code: PR của người đó. Ý tưởng và thảo luận: issue và PR có người đó tham gia (mở, bình luận, review). */
const searchUrl = (login: string, group: ContributionGroup) =>
  `https://github.com/search?type=issues&q=${encodeURIComponent(
    `repo:${SITE.links.repository.replace("https://github.com/", "")} ${group === "code" ? `is:pr author:${login}` : `involves:${login}`}`,
  )}`;

function PersonCard({
  person,
  group,
  c,
  locale,
  onActive,
}: {
  /** Đã lọc theo mục (contributionsIn): số đếm và đóng góp gần đây chỉ thuộc mục này. */
  person: Contributor;
  group: ContributionGroup;
  c: Copy;
  locale: string;
  onActive: (login: string | null) => void;
}) {
  const types = CONTRIBUTION_TYPES.filter((type) => person.counts[type]);
  const total = (person.items ?? []).length;
  const leave = (event: React.FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onActive(null);
  };
  return (
    <li
      onPointerEnter={() => onActive(person.login)}
      onPointerLeave={() => onActive(null)}
      onFocus={() => onActive(person.login)}
      onBlur={leave}
      className="flex min-w-0 flex-col gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-4 transition-colors duration-normal focus-within:border-brand-stroke-2 hover:border-brand-stroke-2 motion-reduce:transition-none"
    >
      <div className="flex items-center gap-3">
        {/* Tên đã có ngay cạnh: ảnh và bông hoa chỉ để nhìn. */}
        <span aria-hidden className="relative shrink-0">
          <Avatar name={person.name} src={avatarOf(person, 96)} size={48} color="colorful" />
          <span className="absolute -inset-e-1.5 -bottom-1.5 inline-flex rounded-circular bg-background-1 p-0.5">
            <svg viewBox="-11 -11 22 22" className="size-4">
              <SakuraBlossom />
            </svg>
          </span>
        </span>
        <div className="min-w-0">
          <a href={profileUrl(person.login)} target="_blank" rel="noreferrer" className="text-subtitle2 font-semibold text-foreground-1 hover:underline">
            {person.name}
          </a>
          {person.name !== person.login && <p className="truncate text-caption1 text-foreground-3">@{person.login}</p>}
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-2 text-caption1 text-foreground-3">
        {person.maintainer && (
          <Badge appearance="tint" color="brand" size="medium">
            {c.maintainer}
          </Badge>
        )}
        <time dateTime={person.first}>{c.since(formatDate(person.first, locale))}</time>
      </p>
      <div className="min-w-0">
        <ul aria-label={c.counts(person.name)} className="flex flex-wrap gap-1.5">
          {types.map((type) => (
            <li key={type}>
              <Badge appearance="outline" color="informative" size="large" icon={TYPE_ICON[type]}>
                {/* Một khối chữ (khoảng trắng thường) để thứ tự đúng cả khi RTL. */}
                <span>
                  {c.types[type]} <span className="font-semibold tabular-nums">{person.counts[type]}</span>
                </span>
              </Badge>
            </li>
          ))}
        </ul>
        {total > 0 && (
          <>
            <ul aria-label={c.recent(person.name)} className="mt-3 flex flex-col gap-1 border-t border-stroke-2 pt-3 text-caption1">
              {person.items!.slice(0, 3).map((item) => (
                <li key={`${item.number ?? item.title}-${item.types[0]}`} className="flex min-w-0 gap-1.5">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="shrink-0 text-link tabular-nums hover:text-link-hover hover:underline">
                      {item.number ? `#${item.number}` : c.types[item.types[0]]}
                    </a>
                  ) : (
                    <span className="shrink-0 text-foreground-3">{c.types[item.types[0]]}</span>
                  )}
                  <span className="truncate text-foreground-2" title={item.title}>
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>
            {total > 3 && (
              <a href={searchUrl(person.login, group)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-caption1 text-link hover:text-link-hover hover:underline">
                {c.more(total)}
              </a>
            )}
          </>
        )}
      </div>
    </li>
  );
}

/** Ô cuối danh sách: một nụ chưa nở, mời người tiếp theo. */
function InviteCard({ c, group }: { c: Copy; group: ContributionGroup }) {
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-2xlarge border border-dashed border-stroke-1 p-4">
      <svg viewBox="-7 -12 14 14" aria-hidden className="size-9 text-foreground-1">
        <path d="M0 0C2.8 -2 3.6 -6.2 0 -10.5C-3.6 -6.2 -2.8 -2 0 0Z" fill="#ef8db6" stroke="#d9588f" strokeOpacity="0.5" strokeWidth="0.4" />
        <path d="M-2.6 -1.2Q0 1.6 2.6 -1.2Q1.2 -3.6 0 -2.2Q-1.2 -3.6 -2.6 -1.2Z" fill="currentColor" opacity="0.88" />
      </svg>
      <div className="flex-1">
        <p className="text-subtitle2 font-semibold text-foreground-1">{c.inviteTitle}</p>
        <p className="mt-1 text-body1 text-foreground-2">{c.groups[group].invite}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {group === "code" ? (
          <Button asChild size="small" appearance="primary">
            <a href={`${SITE.links.issues}?q=${encodeURIComponent('is:open label:"good first issue"')}`} target="_blank" rel="noreferrer">
              {c.inviteIssues}
            </a>
          </Button>
        ) : (
          <>
            <Button asChild size="small" appearance="primary">
              <a href={`${SITE.links.issues}/new/choose`} target="_blank" rel="noreferrer">
                {c.inviteNew}
              </a>
            </Button>
            <Button asChild size="small">
              <a href={`${SITE.links.issues}?q=${encodeURIComponent("is:open")}`} target="_blank" rel="noreferrer">
                {c.inviteOpen}
              </a>
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

/** Một mục của trang: người có đóng góp thuộc mục, thẻ chỉ hiện phần đóng góp đó; lọc theo loại khi danh sách dài. */
function GroupSection({
  group,
  c,
  locale,
  onActive,
}: {
  group: ContributionGroup;
  c: Copy;
  locale: string;
  onActive: (login: string | null) => void;
}) {
  const [filter, setFilter] = React.useState<"all" | ContributionType>("all");
  const people = CONTRIBUTORS.flatMap((person) => contributionsIn(person, group) ?? []);
  const types: ContributionType[] = CONTRIBUTION_GROUPS[group];
  const present = CONTRIBUTION_TYPES.filter((type) => types.includes(type) && people.some((p) => p.counts[type]));
  const shown = filter === "all" ? people : people.filter((p) => p.counts[filter]);
  const copy = c.groups[group];
  return (
    <DocSection id={group} title={copy.title} description={copy.desc(people.length)}>
      {people.length >= FILTER_FROM && present.length > 1 && (
        <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as typeof filter)} aria-label={c.filter} className="mb-4 flex-wrap">
          <ToggleGroupItem value="all">{c.all}</ToggleGroupItem>
          {present.map((type) => (
            <ToggleGroupItem key={type} value={type}>
              {c.types[type]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((person) => (
          <PersonCard key={person.login} person={person} group={group} c={c} locale={locale} onActive={onActive} />
        ))}
        <InviteCard c={c} group={group} />
      </ul>
    </DocSection>
  );
}

export function ContributorsPage() {
  const { locale } = useLocale();
  const c = locale === "en" ? EN : VI;
  const [elapsed] = React.useState(prerenderedElapsed);
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <div className="pb-8">
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />

      {/* Cắt phần cành ngoài khung (preserveAspectRatio slice trên màn hẹp) để trang không cuộn ngang. */}
      <figure className="-mx-4 mb-6 overflow-hidden md:-mx-12">
        <SakuraBranch people={CONTRIBUTORS} active={active} elapsed={elapsed} className="block aspect-60/13 min-h-40 w-full" />
        <figcaption className="mt-2 max-w-2xl px-4 text-caption1 text-foreground-3 md:px-12">{c.caption}</figcaption>
      </figure>

      <GroupSection group="code" c={c} locale={locale} onActive={setActive} />
      <GroupSection group="ideas" c={c} locale={locale} onActive={setActive} />

      <DocSection id="how" title={c.howTitle}>
        <ul className="flex max-w-3xl list-disc flex-col gap-2 ps-5 text-body1 text-foreground-2">
          {c.how.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 max-w-3xl text-body1 text-foreground-2">{c.updated(formatDate(CONTRIBUTORS_UPDATED, locale))}</p>
        <p className="mt-2 max-w-3xl text-body1 text-foreground-2">{c.privacy}</p>
      </DocSection>
    </div>
  );
}
