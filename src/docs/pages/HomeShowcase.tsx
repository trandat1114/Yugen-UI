import * as React from "react";
import {
  ArrowMaximize20Regular,
  Play20Filled,
  Send20Regular,
  TextBold20Regular,
  TextItalic20Regular,
  TextUnderline20Regular,
  Add20Regular,
  Share20Regular,
  Copy20Regular,
  ArrowRight16Regular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Badge,
  BloomArt,
  Button,
  Card,
  CardHeader,
  Checkbox,
  GradientText,
  type GradientName,
  MenuItem,
  MessageBar,
  Slider,
  SplitButton,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  WavyUnderline,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useLocale, type MessageKey } from "../i18n";

function SplitMenu() {
  const { t } = useLocale();
  return (
    <>
      <MenuItem icon={<Copy20Regular />}>{t("show.copyLink")}</MenuItem>
      <MenuItem icon={<Share20Regular />}>{t("show.shareTeam")}</MenuItem>
    </>
  );
}

const SPLIT_MENU = <SplitMenu />;

function Float({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={cn("absolute animate-surface-in", className)}>{children}</div>;
}

function ActionsCollage() {
  const { t } = useLocale();
  return (
    <>
      <Float className="top-[12%] inset-s-0">
        <Card className="flex-row items-center gap-0.5 rounded-xlarge p-1 shadow-16">
          <Button appearance="subtle" icon={<TextBold20Regular />} aria-label={t("show.bold")} />
          <Button appearance="subtle" icon={<TextItalic20Regular />} aria-label={t("show.italic")} />
          <Button appearance="subtle" icon={<TextUnderline20Regular />} aria-label={t("show.underline")} />
          <span className="mx-1 h-5 w-px bg-stroke-2" />
          <Button appearance="primary" icon={<Send20Regular />}>
            {t("show.send")}
          </Button>
        </Card>
      </Float>
      <Float className="top-[48%] inset-s-[6%]">
        <SplitButton appearance="primary" size="large" menu={SPLIT_MENU} className="shadow-16">
          {t("show.share")}
        </SplitButton>
      </Float>
      <Float className="inset-e-[8%] bottom-[10%]">
        <Button appearance="primary" shape="circular" size="large" icon={<Add20Regular />} aria-label={t("show.create")} className="size-14 shadow-28" />
      </Float>
    </>
  );
}

function InputsCollage() {
  const { t } = useLocale();
  return (
    <>
      <Float className="top-[18%] inset-s-0 w-80 max-w-[80%]">
        <Card className="flex-row items-center gap-3 rounded-xlarge px-4 py-2 shadow-16">
          <Play20Filled className="shrink-0 text-foreground-1" />
          <Slider aria-label={t("show.progress")} defaultValue={[35]} />
          <ArrowMaximize20Regular className="shrink-0 text-foreground-2" />
        </Card>
      </Float>
      <Float className="top-[52%] inset-s-[-2%]">
        <SplitButton appearance="primary" size="large" menu={SPLIT_MENU} className="shadow-16">
          {t("show.text")}
        </SplitButton>
      </Float>
      <Float className="inset-e-[6%] bottom-[8%]">
        <Card className="gap-0.5 rounded-xlarge px-4 py-2 shadow-16">
          <Switch label={t("show.captions")} defaultChecked />
          <Checkbox label={t("show.autoplay")} defaultChecked />
        </Card>
      </Float>
    </>
  );
}

function FeedbackCollage() {
  const { t } = useLocale();
  return (
    <>
      <Float className="top-[10%] inset-s-0 w-80 max-w-[85%]">
        <div className="rounded-medium bg-background-1 shadow-16">
          <MessageBar intent="success" title={t("show.synced")}>
            {t("show.saved")}
          </MessageBar>
        </div>
      </Float>
      <Float className="top-[42%] inset-s-[8%]">
        <Card className="flex-row items-center gap-2 rounded-xlarge px-4 py-3 shadow-16">
          <Avatar name="Ngô Lan" color="colorful" presence="available" />
          <Avatar name="Trần Bình" color="colorful" presence="busy" />
          <Avatar name="Lê Hoàng" color="colorful" presence="away" />
          <Badge appearance="tint" color="brand">
            +5
          </Badge>
        </Card>
      </Float>
      <Float className="inset-e-[6%] bottom-[10%]">
        <Card className="flex-row items-center gap-2 rounded-xlarge px-3 py-2 shadow-16">
          <Badge color="danger">3</Badge>
          <span className="text-body1">{t("show.notifications")}</span>
        </Card>
      </Float>
    </>
  );
}

function SurfacesCollage() {
  const { t } = useLocale();
  return (
    <>
      <Float className="top-[8%] inset-s-0 w-80 max-w-[85%]">
        <Card className="gap-2 rounded-xlarge p-5 shadow-64">
          <p className="text-subtitle1 font-semibold">{t("show.saveTitle")}</p>
          <p className="text-body1 text-foreground-2">{t("show.saveBody")}</p>
          <div className="mt-2 flex justify-end gap-2">
            <Button>{t("show.discard")}</Button>
            <Button appearance="primary">{t("show.save")}</Button>
          </div>
        </Card>
      </Float>
      <Float className="inset-e-[6%] bottom-[8%] w-64">
        <Card className="rounded-xlarge shadow-16">
          <CardHeader
            image={<Avatar name={t("show.report")} shape="square" color="brand" />}
            header={t("show.reportTitle")}
            description={t("show.reportUpdated")}
          />
        </Card>
      </Float>
    </>
  );
}

const SHOWCASE: { id: string; label: MessageKey; gradient: GradientName; href: string; Collage: () => React.ReactNode }[] = [
  { id: "actions", label: "show.actions", gradient: "sakura", href: "#/components/button", Collage: ActionsCollage },
  { id: "inputs", label: "show.inputs", gradient: "dusk", href: "#/components/slider", Collage: InputsCollage },
  { id: "feedback", label: "show.feedback", gradient: "sunset", href: "#/components/messagebar", Collage: FeedbackCollage },
  { id: "surfaces", label: "show.surfaces", gradient: "brand", href: "#/components/card", Collage: SurfacesCollage },
];

export function HomeShowcase() {
  const [active, setActive] = React.useState(SHOWCASE[1].id);
  const { t } = useLocale();
  const current = SHOWCASE.find((s) => s.id === active) ?? SHOWCASE[0];

  return (
    <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
      {/* Dưới lg: chip đổi nhóm (chạm không chuyển trang) + link riêng tới component. */}
      <ToggleGroup
        type="single"
        appearance="subtle"
        value={active}
        onValueChange={(v) => v && setActive(v)}
        aria-label={t("home.explore")}
        className="w-auto max-w-full overflow-x-auto scrollbar-none lg:hidden"
      >
        {SHOWCASE.map((s) => (
          <ToggleGroupItem key={s.id} value={s.id} className="shrink-0 whitespace-nowrap">
            {t(s.label)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ul className="hidden flex-col gap-2 lg:flex">
        {SHOWCASE.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={s.href}
                onMouseEnter={() => setActive(s.id)}
                onFocus={() => setActive(s.id)}
                className="group/item relative inline-block rounded-large pb-2"
              >
                <span className="font-display text-[clamp(44px,6.5vw,88px)] leading-[1.1] font-normal tracking-[-0.02em]">
                  {on ? (
                    <GradientText gradient={s.gradient}>{t(s.label)}</GradientText>
                  ) : (
                    <span className="text-foreground-1 transition-colors duration-normal group-hover/item:text-foreground-2">
                      {t(s.label)}
                    </span>
                  )}
                </span>
                <WavyUnderline
                  gradient={s.gradient}
                  thickness={5}
                  className={cn(
                    "absolute inset-x-0 -bottom-1 h-5 origin-left rtl:origin-right transition-[opacity,scale] duration-gentle ease-decelerate-mid",
                    on ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>

      <div className="relative h-80 sm:h-96 lg:h-110">
        <div data-brand="teams" className="absolute inset-y-0 inset-e-0 w-[78%] overflow-hidden rounded-3xlarge rounded-ee-[72px] shadow-8">
          <BloomArt />
        </div>
        <div key={current.id} className="absolute inset-0">
          <current.Collage />
        </div>
      </div>

      <a
        href={current.href}
        className="inline-flex items-center gap-1 justify-self-start rounded-small text-body1 font-semibold text-brand-foreground-1 hover:underline lg:hidden"
      >
        {t("home.viewComponent")}
        <ArrowRight16Regular className="rtl:-scale-x-100" />
      </a>
    </div>
  );
}
