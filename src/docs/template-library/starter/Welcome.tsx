import * as React from "react";
import {
  Accessibility20Regular,
  Add20Regular,
  ArrowCounterclockwise20Regular,
  ArrowRight16Regular,
  Open16Regular,
  Subtract20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from "@fluentui/react-icons";
import {
  AvatarGroup,
  AvatarGroupItem,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  Persona,
  ProgressBar,
  Slider,
  Switch,
  toast,
  ToggleGroup,
  ToggleGroupItem,
  type YugenBrand,
  type YugenTheme,
} from "@/components/ui";
import { JP, SakuraBloom, SakuraPetals } from "./Sakura";

export interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
}

export interface WelcomeProps {
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
  /** Nhúng trong trang khác (preview): cuộn trong khung, không có landmark <main>, heading bắt đầu từ h2. */
  embedded?: boolean;
}

const DOCS = "https://trandat1114.github.io/Yugen-UI/";
const REPO = "https://github.com/trandat1114/Yugen-UI";

const THEMES: { value: YugenTheme; label: string }[] = [
  { value: "light", label: "Sáng" },
  { value: "dark", label: "Tối" },
  { value: "high-contrast", label: "Tương phản cao" },
];
const BRANDS: { value: YugenBrand; label: string }[] = [
  { value: "sakura", label: "Sakura" },
  { value: "web", label: "Web" },
  { value: "teams", label: "Teams" },
];

/** Cuộn tới mục bằng JS — chạy cả khi trang nằm trong khung preview có router dùng hash. */
function scrollToId(e: React.MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-[0.9em] text-foreground-1">{children}</code>;
}

/** Dấu triện đỏ (hanko) — logo của starter. */
function Hanko({ size = "size-9" }: { size?: string }) {
  return (
    <span
      aria-hidden
      lang="ja"
      className={`${JP} ${size} inline-flex shrink-0 -rotate-3 items-center justify-center rounded-small border-2 border-brand-stroke text-subtitle1 font-bold text-brand-foreground-1`}
    >
      桜
    </span>
  );
}

function AppearanceMenu({ appearance, onChange }: { appearance: Appearance; onChange: WelcomeProps["onAppearanceChange"] }) {
  const icon =
    appearance.theme === "dark" ? <WeatherMoon20Regular /> : appearance.theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label="Giao diện" />
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-52">
        <MenuGroupHeader>Chế độ</MenuGroupHeader>
        <MenuRadioGroup value={appearance.theme} onValueChange={(v) => onChange({ theme: v as YugenTheme })}>
          {THEMES.map((t) => (
            <MenuItemRadio key={t.value} value={t.value}>
              {t.label}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
        <MenuDivider />
        <MenuGroupHeader>Thương hiệu</MenuGroupHeader>
        <MenuRadioGroup value={appearance.brand} onValueChange={(v) => onChange({ brand: v })}>
          {BRANDS.map((b) => (
            <MenuItemRadio key={b.value} value={b.value}>
              {b.label}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}

/** Thẻ trong khu "Thử ngay": chữ Hán làm nhãn, cách đọc romaji, tên tiếng Việt. */
function DemoCard({ kanji, reading, title, children }: { kanji: string; reading: string; title: string; children: React.ReactNode }) {
  return (
    <Card size="large" className="gap-L rounded-xlarge p-XL">
      <div className="flex items-center gap-M">
        <span
          lang="ja"
          aria-hidden
          className={`${JP} flex size-12 shrink-0 items-center justify-center rounded-large bg-brand-background-2 text-title3 font-bold text-brand-foreground-2`}
        >
          {kanji}
        </span>
        <div className="min-w-0">
          <h3 className="text-subtitle2 font-semibold text-foreground-1">{title}</h3>
          <p className="text-caption1 tracking-wide text-foreground-3">{reading}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function FormDemo() {
  const [email, setEmail] = React.useState("");
  const [news, setNews] = React.useState(true);
  return (
    <form
      className="flex flex-col gap-M"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ intent: "success", title: "Đã đăng ký", body: news ? `Bản tin sẽ gửi tới ${email}.` : "Bạn sẽ không nhận bản tin." });
      }}
    >
      <Field label="Email" hint="Field tự nối nhãn, gợi ý và aria-* cho ô nhập." required>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@vidu.vn" />
      </Field>
      <Switch checked={news} onCheckedChange={setNews} label="Nhận bản tin hằng tháng" />
      <Button appearance="primary" type="submit" className="self-start">
        Đăng ký
      </Button>
    </form>
  );
}

function CounterDemo() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="flex flex-col gap-M">
      <p className="font-display text-[56px] leading-none font-semibold tabular-nums text-foreground-1" aria-live="polite">
        {count}
      </p>
      <div className="flex flex-wrap items-center gap-S">
        <ButtonGroup>
          <Button icon={<Subtract20Regular />} aria-label="Giảm" onClick={() => setCount((c) => c - 1)} />
          <Button icon={<Add20Regular />} aria-label="Tăng" onClick={() => setCount((c) => c + 1)} />
        </ButtonGroup>
        <Button appearance="subtle" icon={<ArrowCounterclockwise20Regular />} onClick={() => setCount(0)} disabled={count === 0}>
          Đặt lại
        </Button>
      </div>
      <p className="text-caption1 text-foreground-3">
        Như starter của Vite — nhưng nút đã có focus ring, trạng thái disabled và nhãn cho trình đọc màn hình.
      </p>
    </div>
  );
}

function DialogDemo() {
  return (
    <div className="flex flex-col items-start gap-M">
      <p className="text-body1 text-foreground-2">Bẫy focus, đóng bằng Esc, trả focus về nút — Radix lo sẵn, Yugen lo phần đẹp.</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Mở hộp thoại</Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogTitle>
            <span lang="ja" className={`${JP} me-S text-brand-foreground-1`}>
              ようこそ
            </span>
            Chào mừng!
          </DialogTitle>
          <DialogDescription>
            Đây là DialogSurface của Yugen UI. Theme, brand và hướng chữ đi theo YugenProvider — kể cả khi hộp thoại render qua portal.
          </DialogDescription>
          <DialogActions>
            <DialogClose asChild>
              <Button appearance="secondary">Để sau</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button appearance="primary" onClick={() => toast({ intent: "success", title: "Bắt đầu thôi!" })}>
                Bắt đầu
              </Button>
            </DialogClose>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

function ThemeDemo({ appearance, onChange }: { appearance: Appearance; onChange: WelcomeProps["onAppearanceChange"] }) {
  return (
    <div className="flex flex-col gap-M">
      <ToggleGroup type="single" value={appearance.theme} onValueChange={(v) => v && onChange({ theme: v as YugenTheme })} aria-label="Chế độ">
        {THEMES.map((t) => (
          <ToggleGroupItem key={t.value} value={t.value}>
            {t.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ToggleGroup type="single" value={appearance.brand} onValueChange={(v) => v && onChange({ brand: v })} aria-label="Thương hiệu">
        {BRANDS.map((b) => (
          <ToggleGroupItem key={b.value} value={b.value}>
            {b.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-caption1 text-foreground-3">Cả trang đổi theo — mọi màu đều là token, không có giá trị cứng.</p>
    </div>
  );
}

function ProgressDemo() {
  const [value, setValue] = React.useState([64]);
  return (
    <div className="flex flex-col gap-M">
      <Slider label="Mức hoàn thành" showValue value={value} onValueChange={setValue} max={100} />
      <ProgressBar value={value[0] / 100} thickness="large" aria-label="Tiến độ" color={value[0] === 100 ? "success" : "brand"} />
      <p className="text-caption1 text-foreground-3">{value[0] === 100 ? "Hoàn thành — màu success tự đổi." : "Kéo thanh trượt hoặc dùng phím mũi tên."}</p>
    </div>
  );
}

function TeamDemo() {
  return (
    <div className="flex flex-col gap-M">
      <Persona name="Trần Lan" secondaryText="Thiết kế sản phẩm" presence="available" size="large" />
      <div className="flex flex-wrap items-center justify-between gap-M">
        <AvatarGroup layout="stack" size={32} maxAvatars={5} overflowLabel="Xem tất cả thành viên">
          {["Lê Minh", "Phạm Hà", "Ngô Vy", "Đỗ Quân", "Vũ An", "Hồ Linh"].map((name) => (
            <AvatarGroupItem key={name} name={name} />
          ))}
        </AvatarGroup>
        <Badge appearance="tint" color="success">
          6 đang trực tuyến
        </Badge>
      </div>
    </div>
  );
}

const STEPS = [
  {
    numeral: "一",
    title: "Sửa trang này",
    body: (
      <>
        Trang chào nằm trong <Code>src/Welcome.tsx</Code>. Xoá nó, render ứng dụng của bạn trong <Code>src/App.tsx</Code> — Provider,
        theme đã lưu và toast vẫn giữ nguyên.
      </>
    ),
  },
  {
    numeral: "二",
    title: "Thêm component",
    body: (
      <>
        Hơn 90 component trong một import: <Code>{'import { DataGrid } from "yugen-ui"'}</Code>. Mỗi trang tài liệu có ví dụ copy được và
        nút mở StackBlitz.
      </>
    ),
  },
  {
    numeral: "三",
    title: "Khoác màu thương hiệu",
    body: (
      <>
        Theme Designer tạo bảng màu 16 bậc từ một màu key, kiểm tra tương phản rồi cho bạn đoạn CSS dán vào <Code>src/index.css</Code>.
      </>
    ),
  },
];

const NEXT = [
  { kanji: "部品", title: "Components", body: "Hơn 90 component, ví dụ và bảng props.", href: `${DOCS}#/components/button` },
  { kanji: "区画", title: "Blocks", body: "Đăng nhập, cài đặt, thống kê — copy nguyên khối.", href: `${DOCS}#/blocks` },
  { kanji: "型", title: "Templates", body: "SaaS, blog Markdown, dashboard, chat AI.", href: `${DOCS}#/templates` },
  { kanji: "色", title: "Theme Designer", body: "Bảng màu thương hiệu, xuất CSS / JSON.", href: `${DOCS}#/theme-designer` },
  { kanji: "優", title: "Khả năng tiếp cận", body: "Bàn phím, trình đọc màn hình, tương phản.", href: `${DOCS}#/concepts/accessibility` },
  { kanji: "源", title: "GitHub", body: "Mã nguồn, issue, thảo luận.", href: REPO },
];

/** Trang chào của starter — thay bằng ứng dụng của bạn khi đã sẵn sàng. */
export function Welcome({ appearance, onAppearanceChange, embedded = false }: WelcomeProps) {
  const Main = embedded ? "div" : "main";
  const Title = embedded ? "h2" : "h1";
  const Section = embedded ? "h3" : "h2";

  return (
    <div className={`@container isolate flex flex-col bg-background-1 text-foreground-1 ${embedded ? "h-full overflow-y-auto" : "min-h-dvh"}`}>
      <header className="sticky top-0 z-10 border-b border-stroke-2 bg-background-1/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-M px-L">
          <a href={DOCS} className="flex items-center gap-S font-display text-subtitle2 font-semibold text-foreground-1" target="_blank" rel="noreferrer">
            <Hanko />
            Yugen Starter
          </a>
          <nav aria-label="Liên kết" className="ms-auto flex items-center gap-XS">
            <Button asChild appearance="subtle" className="hidden @md:inline-flex">
              <a href={DOCS} target="_blank" rel="noreferrer">
                Tài liệu
              </a>
            </Button>
            <Button asChild appearance="subtle" className="hidden @md:inline-flex">
              <a href={REPO} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </Button>
            <AppearanceMenu appearance={appearance} onChange={onAppearanceChange} />
          </nav>
        </div>
      </header>

      <Main aria-label={embedded ? "Yugen Starter" : undefined} className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-stroke-2 bg-hero-glow">
          <SakuraPetals />
          <SakuraBloom className="pointer-events-none absolute -inset-e-28 -top-28 size-104 opacity-50 @4xl:opacity-70" />
          <SakuraBloom className="pointer-events-none absolute -bottom-16 -inset-s-16 size-48 rotate-12 opacity-30" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-XXL px-L py-[clamp(48px,9cqi,120px)] @4xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex flex-col items-start gap-L">
              <p lang="ja" className={`${JP} text-subtitle1 tracking-[0.2em] text-brand-foreground-1`}>
                はじまりは、いつも静かに。
              </p>
              <Title className="font-display text-[clamp(40px,7cqi,80px)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance text-foreground-1">
                Ứng dụng của bạn <span className="text-gradient-sakura">đã nở hoa.</span>
              </Title>
              <p className="max-w-xl text-subtitle2 font-normal text-foreground-2">
                Vite, React và Tailwind CSS v4 đã nối sẵn với Yugen UI: theme sáng / tối / tương phản cao được ghi nhớ, toast, bàn phím và
                trình đọc màn hình đều chạy. Sửa <Code>src/Welcome.tsx</Code>, lưu lại và xem trang đổi ngay.
              </p>
              <div className="flex flex-wrap gap-S">
                <Button asChild appearance="primary" size="large" icon={<Open16Regular />} iconPosition="after">
                  <a href={DOCS} target="_blank" rel="noreferrer">
                    Mở tài liệu
                  </a>
                </Button>
                <Button asChild size="large" icon={<ArrowRight16Regular className="rtl:-scale-x-100" />} iconPosition="after">
                  <a href="#thu-ngay" onClick={(e) => scrollToId(e, "thu-ngay")}>
                    Thử component
                  </a>
                </Button>
              </div>
            </div>
            {/* Chữ dọc 幽玄 (yūgen — vẻ đẹp sâu lắng) + triện đỏ: điểm nhấn kiểu thư pháp. */}
            <div aria-hidden className="hidden items-start gap-M @4xl:flex">
              <span lang="ja" className={`${JP} pt-XL text-body1 tracking-[0.6em] text-foreground-3 [writing-mode:vertical-rl]`}>
                ゆうげん
              </span>
              <span
                lang="ja"
                className={`${JP} text-[clamp(96px,13cqi,176px)] leading-none font-bold text-foreground-1 [writing-mode:vertical-rl]`}
              >
                幽玄
              </span>
              <span className="self-end">
                <Hanko size="size-14" />
              </span>
            </div>
          </div>
        </section>

        {/* Ba bước */}
        <section aria-labelledby="buoc-dau" className="mx-auto w-full max-w-6xl px-L py-XXXL">
          <Section id="buoc-dau" className="font-display text-title2 font-semibold text-foreground-1">
            Ba bước đầu tiên
          </Section>
          <ol className="mt-XL grid gap-XL @3xl:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.numeral} className="relative flex flex-col gap-S border-t-2 border-brand-stroke pt-L">
                <span lang="ja" aria-hidden className={`${JP} text-[56px] leading-none font-bold text-brand-foreground-1/40`}>
                  {s.numeral}
                </span>
                <h3 className="text-subtitle1 font-semibold text-foreground-1">{s.title}</h3>
                <p className="text-body1 text-foreground-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Thử ngay */}
        <section id="thu-ngay" aria-labelledby="thu-ngay-title" className="scroll-mt-16 border-y border-stroke-2 bg-background-2">
          <div className="mx-auto w-full max-w-6xl px-L py-XXXL">
            <div className="flex flex-wrap items-end justify-between gap-M">
              <Section id="thu-ngay-title" className="font-display text-title2 font-semibold text-foreground-1">
                Thử ngay
              </Section>
              <p lang="ja" aria-hidden className={`${JP} text-subtitle1 tracking-[0.3em] text-foreground-3`}>
                試してみる
              </p>
            </div>
            <div className="mt-XL grid items-start gap-L @3xl:grid-cols-2 @6xl:grid-cols-3">
              <DemoCard kanji="形" reading="katachi · hình dạng" title="Biểu mẫu">
                <FormDemo />
              </DemoCard>
              <DemoCard kanji="数" reading="kazu · con số" title="Bộ đếm">
                <CounterDemo />
              </DemoCard>
              <DemoCard kanji="窓" reading="mado · ô cửa" title="Hộp thoại">
                <DialogDemo />
              </DemoCard>
              <DemoCard kanji="色" reading="iro · màu sắc" title="Giao diện">
                <ThemeDemo appearance={appearance} onChange={onAppearanceChange} />
              </DemoCard>
              <DemoCard kanji="進" reading="susumu · tiến lên" title="Tiến độ">
                <ProgressDemo />
              </DemoCard>
              <DemoCard kanji="人" reading="hito · con người" title="Đội ngũ">
                <TeamDemo />
              </DemoCard>
            </div>
          </div>
        </section>

        {/* Đi tiếp */}
        <section aria-labelledby="di-tiep" className="mx-auto w-full max-w-6xl px-L py-XXXL">
          <Section id="di-tiep" className="font-display text-title2 font-semibold text-foreground-1">
            Đi tiếp
          </Section>
          <ul className="mt-XL grid gap-L @xl:grid-cols-2 @4xl:grid-cols-3">
            {NEXT.map((n) => (
              <li key={n.title}>
                <a
                  href={n.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative flex h-full flex-col gap-XS overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 p-XL transition-shadow duration-faster hover:shadow-8"
                >
                  <span
                    lang="ja"
                    aria-hidden
                    className={`${JP} pointer-events-none absolute -inset-e-2 -bottom-6 text-[88px] leading-none font-bold text-foreground-1/5 transition-colors duration-normal group-hover:text-brand-foreground-1/15`}
                  >
                    {n.kanji}
                  </span>
                  <span className="flex items-center gap-XS text-subtitle2 font-semibold text-foreground-1">
                    {n.title}
                    <Open16Regular className="text-foreground-3" />
                  </span>
                  <span className="text-body1 text-foreground-2">{n.body}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Main>

      <footer className="border-t border-stroke-2 bg-background-2">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-M px-L py-XL text-caption1 text-foreground-3">
          <p>
            <span lang="ja" className={`${JP} me-S text-body1 text-foreground-1`}>
              幽玄
            </span>
            yūgen — vẻ đẹp sâu lắng ẩn sau những điều giản dị.
          </p>
          <p>
            Dựng bằng{" "}
            <a className="text-link underline hover:text-link-hover" href={DOCS} target="_blank" rel="noreferrer">
              Yugen UI
            </a>{" "}
            · Vite · React · Tailwind CSS v4
          </p>
        </div>
      </footer>
    </div>
  );
}
