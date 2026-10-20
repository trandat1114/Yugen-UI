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
import { SITE, type SiteLinkKey } from "../site";

function ExternalOrSoon({ link, children }: { link: SiteLinkKey; children: ReactNode }) {
  const href = SITE.links[link];
  if (!href)
    return (
      <Button size="small" disabled title="Maintainer chưa cấu hình link trong src/docs/site.ts">
        Sắp có
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

const WAYS = [
  {
    icon: Code20Regular,
    title: "Đóng góp code",
    text: "Sửa lỗi, thêm component hoặc block. Đọc CONTRIBUTING.md và Design.md trước khi mở PR.",
    action: <ExternalOrSoon link="repository">Mở repository</ExternalOrSoon>,
  },
  {
    icon: Bug20Regular,
    title: "Báo lỗi",
    text: "Mô tả cách tái hiện, theme/brand/hướng chữ đang dùng và trình duyệt. Ảnh chụp giúp xử lý nhanh hơn.",
    action: <ExternalOrSoon link="issues">Tạo issue</ExternalOrSoon>,
  },
  {
    icon: Lightbulb20Regular,
    title: "Đề xuất tính năng",
    text: "Kể bài toán của bạn trước khi đề xuất giải pháp — component tốt bắt đầu từ một nhu cầu thật.",
    action: <ExternalOrSoon link="discussions">Thảo luận</ExternalOrSoon>,
  },
  {
    icon: Chat20Regular,
    title: "Hỏi & đáp",
    text: "Câu hỏi về cách dùng, tích hợp Next.js, theme tuỳ biến… để mọi người cùng tìm được câu trả lời.",
    action: <ExternalOrSoon link="discussions">Đặt câu hỏi</ExternalOrSoon>,
  },
  {
    icon: Translate20Regular,
    title: "Dịch tài liệu",
    text: "Tài liệu hiện bằng tiếng Việt, README song ngữ. Giúp mang Yugen UI tới nhiều ngôn ngữ hơn.",
    action: <ExternalOrSoon link="repository">Bắt đầu dịch</ExternalOrSoon>,
  },
  {
    icon: Grid20Regular,
    title: "Chia sẻ block",
    text: "Một file trong src/docs/block-library là đủ — đăng nhập, bảng giá, dashboard… đều được chào đón.",
    action: (
      <Button asChild size="small">
        <a href="#/blocks">Xem Blocks</a>
      </Button>
    ),
  },
];

const ROADMAP: { column: string; tone: "brand" | "informative" | "subtle"; items: string[] }[] = [
  {
    column: "Đang làm",
    tone: "brand",
    items: ["Phát hành gói npm đầu tiên", "Ảnh chụp & ví dụ cho README", "Kiểm thử thủ công các tương tác kéo-thả (Sheet, Resizable)"],
  },
  {
    column: "Tiếp theo",
    tone: "informative",
    items: ["CLI `npx yugen-ui add <component>`", "Overflow (ẩn bớt item theo độ rộng)", "TimePicker & DateRange nâng cao", "DataGrid ảo hoá"],
  },
  {
    column: "Đang cân nhắc",
    tone: "subtle",
    items: ["Figma kit Yugen", "ColorPicker đầy đủ", "Bộ test a11y tự động (axe)", "Gói icon Sakura riêng"],
  },
];

const FAQ = [
  {
    q: "Yugen UI có liên quan tới Microsoft không?",
    a: "Không. Yugen UI lấy cảm hứng từ hệ thống token và hành vi của Microsoft Fluent 2, nhưng là dự án độc lập của trandat1114 và không được Microsoft bảo trợ.",
  },
  {
    q: "Có dùng cho dự án thương mại được không?",
    a: "Được. Yugen UI phát hành theo giấy phép MIT — dùng, sửa, phân phối lại, kể cả thương mại, miễn giữ thông báo bản quyền.",
  },
  {
    q: "Nên cài gói npm hay copy component?",
    a: "Gói npm phù hợp khi muốn cập nhật dễ. Copy-paste (kiểu shadcn/ui) phù hợp khi muốn sở hữu và chỉnh sâu từng component. Hai cách dùng chung token nên có thể kết hợp.",
  },
  {
    q: "Có hỗ trợ Tailwind CSS v3 không?",
    a: "Không chính thức. Yugen dựa vào cấu hình CSS-first của Tailwind v4 (@theme, @utility). Nếu không dùng Tailwind, hãy import styles.css đã biên dịch sẵn.",
  },
  {
    q: "Làm sao để đề xuất một component mới?",
    a: "Mở thảo luận mô tả tình huống sử dụng, ảnh tham khảo và yêu cầu khả năng tiếp cận. Component mới cần có trang docs, ví dụ copy được và tuân thủ Design.md.",
  },
];

export function CommunityPage() {
  return (
    <div className="pb-XXXL">
      <PageHeader
        eyebrow="Cộng đồng"
        title="Cùng xây Yugen UI"
        lead="Yugen UI là mã nguồn mở. Mọi đóng góp — một báo lỗi, một block, một bản dịch — đều làm thư viện tốt hơn cho người dùng tiếp theo."
      />

      <DocSection id="ways" title="Cách tham gia">
        <div className="grid gap-L sm:grid-cols-2 xl:grid-cols-3">
          {WAYS.map(({ icon: Icon, title, text, action }) => (
            <Card key={title} size="large" className="gap-M rounded-2xlarge">
              <span className="inline-flex size-10 items-center justify-center rounded-xlarge bg-brand-background-2 text-brand-foreground-2">
                <Icon />
              </span>
              <div className="flex-1">
                <p className="text-subtitle2 font-semibold">{title}</p>
                <p className="mt-XS text-body1 text-foreground-2">{text}</p>
              </div>
              <div>{action}</div>
            </Card>
          ))}
        </div>
      </DocSection>

      <DocSection id="start" title="Bắt đầu đóng góp" description="Năm phút để chạy docs site trên máy của bạn.">
        <CodeBlock
          code={`npm install
npm run dev            # docs tại http://localhost:5173
npm run typecheck      # TypeScript strict
npm run lint:classes   # class Tailwind phải ở dạng canonical
npm run build:lib      # build gói npm vào dist/`}
        />
        <ul className="mt-L flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
          <li>Component mới: thư mục <code className="font-mono text-caption1">src/components/ui/&lt;Name&gt;</code> + mục docs trong <code className="font-mono text-caption1">src/docs/registry</code>.</li>
          <li>Block mới: một file trong <code className="font-mono text-caption1">src/docs/block-library</code>.</li>
          <li>Kiểm tra cả Light / Dark / Tương phản cao và LTR / RTL trước khi mở PR.</li>
        </ul>
      </DocSection>

      <DocSection id="roadmap" title="Lộ trình" description="Hướng đi dự kiến — có thể thay đổi theo góp ý của cộng đồng.">
        <div className="grid gap-L md:grid-cols-3">
          {ROADMAP.map((col) => (
            <div key={col.column} className="rounded-2xlarge border border-stroke-2 bg-background-2 p-L">
              <div className="mb-M flex items-center justify-between">
                <p className="text-subtitle2 font-semibold">{col.column}</p>
                <Badge appearance="tint" color={col.tone}>
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
          Xem những gì đã hoàn thành ở trang{" "}
          <a href="#/news" className="inline-flex items-center gap-XXS text-link hover:text-link-hover hover:underline">
            Có gì mới <ArrowRight16Regular className="rtl:-scale-x-100" />
          </a>
        </p>
      </DocSection>

      <DocSection id="showcase" title="Dự án dùng Yugen UI">
        <Empty variant="outline">
          <EmptyHeader>
            <EmptyMedia>
              <Rocket20Regular />
            </EmptyMedia>
            <EmptyTitle>Chưa có dự án nào được giới thiệu</EmptyTitle>
            <EmptyDescription>Bạn đang dùng Yugen UI? Gửi ảnh chụp và một dòng mô tả để xuất hiện ở đây.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <ExternalOrSoon link="discussions">Giới thiệu dự án</ExternalOrSoon>
          </EmptyContent>
        </Empty>
      </DocSection>

      <DocSection id="conduct" title="Quy tắc ứng xử" description="Cộng đồng áp dụng Contributor Covenant 2.1 (CODE_OF_CONDUCT.md).">
        <ul className="grid max-w-4xl gap-S sm:grid-cols-2">
          {[
            "Tôn trọng mọi người, mọi trình độ và mọi ngôn ngữ.",
            "Góp ý vào vấn đề, không vào con người.",
            "Ưu tiên khả năng tiếp cận — người dùng cuối của chúng ta rất đa dạng.",
            "Ghi công rõ ràng khi dùng lại ý tưởng hoặc mã nguồn.",
          ].map((rule) => (
            <li key={rule} className="flex items-start gap-S rounded-large bg-background-2 p-M text-body1">
              <HeartPulse20Regular className="mt-XXS shrink-0 text-brand-foreground-1" />
              {rule}
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="people" title="Người đóng góp">
        <div className="flex flex-wrap items-center gap-XXL">
          <Persona name={SITE.author} primaryText={SITE.author} secondaryText="Tác giả & maintainer" avatar={{ color: "brand" }} size="large" />
          <p className="max-w-md text-body1 text-foreground-3">
            Danh sách người đóng góp sẽ được cập nhật theo các PR được hợp nhất. Bạn có thể là người tiếp theo.
          </p>
        </div>
      </DocSection>

      <DocSection id="faq" title="Câu hỏi thường gặp">
        <Accordion type="single" collapsible className="max-w-3xl">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionHeader>{item.q}</AccordionHeader>
              <AccordionPanel>
                <p className="text-body1 text-foreground-2">{item.a}</p>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </DocSection>

      <DocSection id="credits" title="Ghi công">
        <ul className="grid max-w-4xl gap-S text-body1 text-foreground-2 sm:grid-cols-2">
          <li>Microsoft Fluent 2 — cấu trúc token, thang đo và hành vi component (nguồn cảm hứng).</li>
          <li>shadcn/ui — mô hình copy-paste và danh mục component.</li>
          <li>Radix UI — primitive cho hành vi và khả năng tiếp cận.</li>
          <li>Fluent System Icons (MIT) — bộ icon.</li>
          <li>Tailwind CSS v4 — engine utility.</li>
          <li>cmdk, react-day-picker, react-resizable-panels — thư viện nền.</li>
        </ul>
      </DocSection>
    </div>
  );
}
