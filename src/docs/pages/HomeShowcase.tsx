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
  WavyUnderline,
} from "@/components/ui";
import { cn } from "@/lib/cn";

const SPLIT_MENU = (
  <>
    <MenuItem icon={<Copy20Regular />}>Sao chép liên kết</MenuItem>
    <MenuItem icon={<Share20Regular />}>Chia sẻ với nhóm</MenuItem>
  </>
);

function Float({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={cn("absolute animate-surface-in", className)}>{children}</div>;
}

function ActionsCollage() {
  return (
    <>
      <Float className="top-[12%] inset-s-0">
        <Card className="flex-row items-center gap-XXS rounded-xlarge p-XS shadow-16">
          <Button appearance="subtle" icon={<TextBold20Regular />} aria-label="Đậm" />
          <Button appearance="subtle" icon={<TextItalic20Regular />} aria-label="Nghiêng" />
          <Button appearance="subtle" icon={<TextUnderline20Regular />} aria-label="Gạch chân" />
          <span className="mx-XS h-5 w-px bg-stroke-2" />
          <Button appearance="primary" icon={<Send20Regular />}>
            Gửi
          </Button>
        </Card>
      </Float>
      <Float className="top-[48%] inset-s-[6%]">
        <SplitButton appearance="primary" size="large" menu={SPLIT_MENU} className="shadow-16">
          Chia sẻ
        </SplitButton>
      </Float>
      <Float className="inset-e-[8%] bottom-[10%]">
        <Button appearance="primary" shape="circular" size="large" icon={<Add20Regular />} aria-label="Tạo mới" className="size-14 shadow-28" />
      </Float>
    </>
  );
}

function InputsCollage() {
  return (
    <>
      <Float className="top-[18%] inset-s-0 w-80 max-w-[80%]">
        <Card className="flex-row items-center gap-M rounded-xlarge px-L py-S shadow-16">
          <Play20Filled className="shrink-0 text-foreground-1" />
          <Slider aria-label="Tiến độ phát" defaultValue={[35]} />
          <ArrowMaximize20Regular className="shrink-0 text-foreground-2" />
        </Card>
      </Float>
      <Float className="top-[52%] inset-s-[-2%]">
        <SplitButton appearance="primary" size="large" menu={SPLIT_MENU} className="shadow-16">
          Văn bản
        </SplitButton>
      </Float>
      <Float className="inset-e-[6%] bottom-[8%]">
        <Card className="gap-XXS rounded-xlarge px-L py-S shadow-16">
          <Switch label="Phụ đề" defaultChecked />
          <Checkbox label="Tự động phát" defaultChecked />
        </Card>
      </Float>
    </>
  );
}

function FeedbackCollage() {
  return (
    <>
      <Float className="top-[10%] inset-s-0 w-80 max-w-[85%]">
        <div className="rounded-medium bg-background-1 shadow-16">
          <MessageBar intent="success" title="Đã đồng bộ">
            Mọi thay đổi đã được lưu.
          </MessageBar>
        </div>
      </Float>
      <Float className="top-[42%] inset-s-[8%]">
        <Card className="flex-row items-center gap-S rounded-xlarge px-L py-M shadow-16">
          <Avatar name="Ngô Lan" color="colorful" presence="available" />
          <Avatar name="Trần Bình" color="colorful" presence="busy" />
          <Avatar name="Lê Hoàng" color="colorful" presence="away" />
          <Badge appearance="tint" color="brand">
            +5
          </Badge>
        </Card>
      </Float>
      <Float className="inset-e-[6%] bottom-[10%]">
        <Card className="flex-row items-center gap-S rounded-xlarge px-M py-S shadow-16">
          <Badge color="danger">3</Badge>
          <span className="text-body1">Thông báo mới</span>
        </Card>
      </Float>
    </>
  );
}

function SurfacesCollage() {
  return (
    <>
      <Float className="top-[8%] inset-s-0 w-80 max-w-[85%]">
        <Card className="gap-S rounded-xlarge p-XL shadow-64">
          <p className="text-subtitle1 font-semibold">Lưu thay đổi?</p>
          <p className="text-body1 text-foreground-2">Bạn có thay đổi chưa lưu trong tài liệu này.</p>
          <div className="mt-S flex justify-end gap-S">
            <Button>Bỏ</Button>
            <Button appearance="primary">Lưu</Button>
          </div>
        </Card>
      </Float>
      <Float className="inset-e-[6%] bottom-[8%] w-64">
        <Card className="rounded-xlarge shadow-16">
          <CardHeader image={<Avatar name="Báo cáo" shape="square" color="brand" />} header="Báo cáo Q3" description="Cập nhật 2 giờ trước" />
        </Card>
      </Float>
    </>
  );
}

const SHOWCASE: { id: string; label: string; gradient: GradientName; href: string; Collage: () => React.ReactNode }[] = [
  { id: "actions", label: "Hành động", gradient: "sakura", href: "#/components/button", Collage: ActionsCollage },
  { id: "inputs", label: "Nhập liệu", gradient: "dusk", href: "#/components/slider", Collage: InputsCollage },
  { id: "feedback", label: "Phản hồi", gradient: "sunset", href: "#/components/messagebar", Collage: FeedbackCollage },
  { id: "surfaces", label: "Bề mặt", gradient: "brand", href: "#/components/card", Collage: SurfacesCollage },
];

export function HomeShowcase() {
  const [active, setActive] = React.useState(SHOWCASE[1].id);
  const current = SHOWCASE.find((s) => s.id === active) ?? SHOWCASE[0];

  return (
    <div className="grid items-center gap-XXXL lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <ul className="flex flex-col gap-S">
        {SHOWCASE.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={s.href}
                onMouseEnter={() => setActive(s.id)}
                onFocus={() => setActive(s.id)}
                className="group/item relative inline-block rounded-large pb-S"
              >
                <span className="font-display text-[clamp(44px,6.5vw,88px)] leading-[1.1] font-normal tracking-[-0.02em]">
                  {on ? (
                    <GradientText gradient={s.gradient}>{s.label}</GradientText>
                  ) : (
                    <span className="text-foreground-1 transition-colors duration-normal group-hover/item:text-foreground-2">
                      {s.label}
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

      <div className="relative h-110">
        <div data-brand="teams" className="absolute inset-y-0 inset-e-0 w-[78%] overflow-hidden rounded-3xlarge rounded-ee-[72px] shadow-8">
          <BloomArt />
        </div>
        <div key={current.id} className="absolute inset-0">
          <current.Collage />
        </div>
      </div>
    </div>
  );
}
