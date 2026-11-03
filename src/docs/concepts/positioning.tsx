import * as React from "react";
import type { ReactNode } from "react";
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Dropdown,
  DropdownOption,
  Label,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Radio,
  RadioGroup,
  SimpleTooltip,
  Switch,
  YugenProvider,
} from "@/components/ui";
import { DocSection, DoDont, PropsTable } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-foreground-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const SIDES: Side[] = ["top", "right", "bottom", "left"];
const ALIGNS: Align[] = ["start", "center", "end"];

function Playground() {
  const [side, setSide] = React.useState<Side>("bottom");
  const [align, setAlign] = React.useState<Align>("center");
  const [offset, setOffset] = React.useState("6");

  return (
    <div className="grid gap-5 rounded-2xlarge border border-stroke-2 bg-background-1 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label id="pos-side-label" weight="semibold">
            side
          </Label>
          <RadioGroup aria-labelledby="pos-side-label" layout="horizontal" value={side} onValueChange={(v) => setSide(v as Side)}>
            {SIDES.map((s) => (
              <Radio key={s} value={s} label={s} />
            ))}
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label id="pos-align-label" weight="semibold">
            align
          </Label>
          <RadioGroup aria-labelledby="pos-align-label" layout="horizontal" value={align} onValueChange={(v) => setAlign(v as Align)}>
            {ALIGNS.map((a) => (
              <Radio key={a} value={a} label={a} />
            ))}
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label id="pos-offset-label" weight="semibold">
            sideOffset
          </Label>
          <RadioGroup aria-labelledby="pos-offset-label" layout="horizontal" value={offset} onValueChange={setOffset}>
            {["0", "6", "16"].map((o) => (
              <Radio key={o} value={o} label={o} />
            ))}
          </RadioGroup>
        </div>
      </div>
      <div className="flex min-h-56 items-center justify-center rounded-xlarge bg-background-3 p-5">
        <Popover>
          <PopoverTrigger asChild>
            <Button appearance="primary" className="min-w-40">
              Mở popover
            </Button>
          </PopoverTrigger>
          <PopoverSurface side={side} align={align} sideOffset={Number(offset)} withArrow>
            <p className="font-mono text-caption1 text-foreground-2">
              side=&quot;{side}&quot; align=&quot;{align}&quot; sideOffset={"{"}
              {offset}
              {"}"}
            </p>
          </PopoverSurface>
        </Popover>
      </div>
    </div>
  );
}

const PLAYGROUND_CODE = `<Popover>
  <PopoverTrigger asChild>
    <Button appearance="primary">Mở popover</Button>
  </PopoverTrigger>
  <PopoverSurface side="right" align="start" sideOffset={16} withArrow>
    Nội dung
  </PopoverSurface>
</Popover>

{/* Tooltip mặc định side="top" */}
<SimpleTooltip content="Sao chép" side="bottom">
  <Button icon={<Copy20Regular />} aria-label="Sao chép" />
</SimpleTooltip>`;

const COLLISION_CODE = `{/* Chừa chỗ cho thanh trên cùng cao 74px và lề 16px ở các cạnh còn lại */}
<PopoverSurface
  side="bottom"
  align="start"
  collisionPadding={{ top: 80, right: 16, bottom: 16, left: 16 }}
  className="max-h-(--radix-popover-content-available-height) overflow-y-auto data-[side=top]:origin-bottom"
>
  …
</PopoverSurface>

{/* Bám cố định theo phía đã chọn, chấp nhận bị cắt (hiếm khi cần) */}
<MenuPopover avoidCollisions={false}>…</MenuPopover>`;

const PORTAL_CODE = `<YugenProvider theme="dark" brand="web" className="p-4">
  <Popover>
    <PopoverTrigger asChild>
      <Button appearance="primary">Mở popover</Button>
    </PopoverTrigger>
    {/* Tự nhận theme tối + brand Web của provider lồng, dù render vào <body> */}
    <PopoverSurface withArrow>Nền tối, brand Web.</PopoverSurface>
  </Popover>
</YugenProvider>

// Tự viết bề mặt portal mới? Gắn props của provider gần nhất:
import { usePortalThemeProps } from "@/components/ui";

function MyFloatingSurface(props) {
  const portalTheme = usePortalThemeProps(); // {} khi ở provider gốc
  return <SomePrimitive.Portal><SomePrimitive.Content {...portalTheme} {...props} /></SomePrimitive.Portal>;
}`;

const SCROLL_LOCK_CODE = `// Cả app: giữ thanh cuộn khi Menu, ContextMenu, Dropdown mở
<YugenProvider applyToDocument scrollLock="keep-scrollbar">
  <App />
</YugenProvider>

// Không dùng provider: đặt attribute trên <html>
<html data-yugen-scroll-lock="keep-scrollbar">

// Một menu không khoá cuộn
<Menu modal={false}>…</Menu>`;

/** Bật "Giữ thanh cuộn" ghi attribute lên <html> của chính trang docs; tắt hoặc rời trang thì gỡ. */
function ScrollLockDemo() {
  const [keep, setKeep] = React.useState(false);
  React.useEffect(() => {
    const root = document.documentElement;
    if (keep) root.setAttribute("data-yugen-scroll-lock", "keep-scrollbar");
    else root.removeAttribute("data-yugen-scroll-lock");
    return () => root.removeAttribute("data-yugen-scroll-lock");
  }, [keep]);
  return (
    <div className="flex flex-col gap-4 rounded-2xlarge border border-stroke-2 p-6">
      <Switch label="Giữ thanh cuộn" checked={keep} onCheckedChange={setKeep} />
      <div className="flex flex-wrap items-center gap-3">
        <Menu>
          <MenuTrigger asChild>
            <Button>Menu</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuItem>Đổi tên</MenuItem>
            <MenuItem>Nhân bản</MenuItem>
            <MenuItem>Lưu trữ</MenuItem>
          </MenuPopover>
        </Menu>
        <Menu modal={false}>
          <MenuTrigger asChild>
            <Button>Menu không modal</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuItem>Đổi tên</MenuItem>
            <MenuItem>Nhân bản</MenuItem>
            <MenuItem>Lưu trữ</MenuItem>
          </MenuPopover>
        </Menu>
        <Dropdown aria-label="Trạng thái" placeholder="Trạng thái" className="w-48">
          <DropdownOption value="open">Đang mở</DropdownOption>
          <DropdownOption value="review">Chờ duyệt</DropdownOption>
          <DropdownOption value="done">Xong</DropdownOption>
        </Dropdown>
      </div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex h-24 items-center justify-center rounded-xlarge border border-dashed border-stroke-1 text-body1 text-foreground-3 select-none">
            Nhấn chuột phải vào đây
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Sao chép</ContextMenuItem>
          <ContextMenuItem>Dán</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <DocSection
        id="props"
        title="Các prop định vị"
        description="PopoverSurface, MenuPopover, MenubarContent, TooltipContent, HoverCardContent chuyển thẳng các prop này cho Radix Popper (ContextMenu mở tại con trỏ nên chỉ nhận nhóm prop va chạm)."
      >
        <div className="flex flex-col gap-4">
          <PropsTable
            props={[
              {
                name: "side",
                type: `"top" | "right" | "bottom" | "left"`,
                defaultValue: `"bottom" (Tooltip: "top")`,
                description: "Cạnh của trigger mà bề mặt bám vào. Là hướng vật lý: left / right không tự đảo khi RTL.",
              },
              {
                name: "align",
                type: `"start" | "center" | "end"`,
                defaultValue: `PopoverSurface "center" · MenuPopover "start"`,
                description: "Căn theo trục còn lại. start / end theo hướng chữ — Yugen gắn dir của provider lên bề mặt nên RTL tự đảo.",
              },
              { name: "sideOffset", type: "number", defaultValue: "Popover 6 · HoverCard 6 · Menu 4 · Tooltip 4", description: "Khoảng cách (px) giữa trigger và bề mặt." },
              { name: "alignOffset", type: "number", defaultValue: "0", description: "Dịch theo trục căn lề (dương = về phía end)." },
              { name: "avoidCollisions", type: "boolean", defaultValue: "true", description: "Tự lật sang cạnh đối diện và trượt dọc trục để không tràn khỏi khung nhìn." },
              { name: "collisionPadding", type: "number | Partial<Record<Side, number>>", defaultValue: "0", description: "Khoảng đệm với mép vùng va chạm (ví dụ chừa chỗ cho header sticky)." },
              { name: "collisionBoundary", type: "Element | Element[]", defaultValue: "viewport", description: "Vùng dùng để tính va chạm thay cho khung nhìn." },
              { name: "sticky", type: `"partial" | "always"`, defaultValue: `"partial"`, description: "Giữ bề mặt trong khung nhìn khi trigger cuộn ra một phần / hoàn toàn." },
              { name: "hideWhenDetached", type: "boolean", defaultValue: "false", description: "Ẩn bề mặt khi trigger bị che hoàn toàn (ví dụ cuộn ra khỏi vùng cuộn)." },
            ]}
          />
          <P>
            Sau khi định vị, Radix ghi <C>data-side</C> và <C>data-align</C> thực tế (kể cả khi đã lật) lên bề mặt, và cung cấp biến CSS{" "}
            <C>--radix-popover-content-available-height</C>, <C>--radix-popover-trigger-width</C>… (tiền tố đổi theo component: tooltip,
            dropdown-menu, select, hover-card).
          </P>
        </div>
      </DocSection>

      <DocSection
        id="playground"
        title="Thử side & align"
        description="Chọn giá trị rồi mở popover. Thử side=&quot;right&quot; trên màn hình hẹp để thấy bề mặt tự lật."
      >
        <div className="flex flex-col gap-4">
          <Playground />
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            {SIDES.map((s) => (
              <SimpleTooltip key={s} content={`side="${s}"`} side={s}>
                <Button>Tooltip {s}</Button>
              </SimpleTooltip>
            ))}
          </div>
          <CodeBlock code={PLAYGROUND_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="collision"
        title="Va chạm & tự lật"
        description="Mặc định bề mặt không bao giờ tràn khỏi khung nhìn: thiếu chỗ ở cạnh đã chọn thì lật sang cạnh đối diện, thiếu chỗ theo trục căn thì trượt vào trong."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={COLLISION_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Header sticky không được Radix biết tới — dùng <C>collisionPadding</C> ở cạnh tương ứng để bề mặt không chui dưới header.
            </li>
            <li>
              Danh sách dài: giới hạn chiều cao bằng biến <C>--radix-*-content-available-height</C> và cho cuộn, thay vì để bề mặt cao quá
              khung nhìn (Dropdown đã làm sẵn).
            </li>
            <li>
              Animation theo hướng xuất hiện: style bằng <C>data-[side=top]:…</C> vì cạnh thực tế có thể khác cạnh bạn chọn.
            </li>
          </ul>
          <MessageBar intent="info" title="Thử ngay:" className="max-w-3xl">
            cuộn để nút “Mở popover” ở trên sát mép dưới màn hình rồi mở với side=&quot;bottom&quot; — bề mặt sẽ hiện phía trên.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="portals"
        title="Portal & theme"
        description="Mọi bề mặt nổi render qua portal vào <body> để thoát overflow: hidden và z-index của cha. Chúng vẫn tự nhận theme, brand và hướng chữ của YugenProvider lồng gần nhất."
      >
        <div className="flex flex-col gap-4">
          <YugenProvider theme="dark" brand="web" className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 p-6">
            <p className="w-full text-body1 text-foreground-2">Vùng này là YugenProvider theme=&quot;dark&quot; brand=&quot;web&quot;.</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button appearance="primary">Mở popover</Button>
              </PopoverTrigger>
              <PopoverSurface withArrow>
                <p className="text-body1">Nền tối, brand Web — theo provider lồng.</p>
                <Button appearance="primary" size="small" className="mt-2">
                  Brand Web
                </Button>
              </PopoverSurface>
            </Popover>
            <SimpleTooltip content="Tooltip cũng theo provider lồng">
              <Button>Hover tôi</Button>
            </SimpleTooltip>
          </YugenProvider>
          <CodeBlock code={PORTAL_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Theme cho cả ứng dụng: luôn dùng <C>{"<YugenProvider applyToDocument>"}</C> ở gốc — attribute nằm trên <C>{"<html>"}</C> nên mọi
              portal tự đúng.
            </li>
            <li>
              Theme lồng: mọi bề mặt nổi của Yugen (PopoverSurface, MenuPopover, TooltipContent, HoverCardContent, DialogSurface,
              DrawerSurface, ContextMenu, Menubar, listbox Dropdown / Combobox / TagPicker) tự gắn <C>data-theme</C> / <C>data-brand</C> /
              <C>dir</C> của provider lồng qua hook <C>usePortalThemeProps()</C>. Bề mặt tự viết thì gọi hook này.
            </li>
            <li>
              Hướng chữ không cần xử lý: các bề mặt nổi (PopoverSurface, TooltipContent, HoverCardContent, DialogSurface, DrawerSurface,
              menu và listbox) tự gắn <C>dir</C> của provider gần nhất, vì context React (kể cả <C>DirectionProvider</C>) đi xuyên qua portal.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="scroll-lock"
        title="Khoá cuộn"
        description="Menu, ContextMenu và Dropdown khoá cuộn trang khi mở: lăn chuột và vuốt bên ngoài bị chặn, thanh cuộn của trang ẩn đi và body được bù lề để nội dung không xê dịch. App chọn giữ hay ẩn thanh cuộn."
      >
        <div className="flex flex-col gap-4">
          <ScrollLockDemo />
          <SimpleTable
            head={["Bề mặt", "Khoá cuộn", "Tắt được"]}
            rows={[
              ["Menu (cả MenuButton, SplitButton, mục thừa của Breadcrumb, DataGridColumnPicker)", <><C>modal</C> mặc định true</>, <C key="m">modal=&#123;false&#125;</C>],
              ["ContextMenu", <><C>modal</C> mặc định true</>, <C key="m">modal=&#123;false&#125;</C>],
              ["Dropdown", "Luôn khoá", "Không; dùng scrollLock để giữ thanh cuộn"],
              ["Menubar", "Không (menu của Menubar không modal)", "—"],
              ["Popover và component dựa trên Popover (Combobox, TagPicker, TimePicker…)", <>Không, trừ khi <C>modal</C></>, "—"],
              ["Dialog, Drawer có lớp phủ, Sheet, Tour", "Có", "Đúng ý đồ: nội dung phía sau không dùng được"],
            ]}
          />
          <CodeBlock code={SCROLL_LOCK_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <C>scrollLock=&quot;keep-scrollbar&quot;</C> trên provider gốc ghi <C>data-yugen-scroll-lock</C> lên <C>{"<html>"}</C>: thanh cuộn
              vẫn hiện và không có gì xê dịch, nhưng lăn chuột / vuốt bên ngoài bề mặt vẫn bị chặn. App không dùng provider thì tự đặt
              attribute này. Mặc định hiện tại là <C>&quot;hide-scrollbar&quot;</C>; bản 1.0 sẽ đổi sang <C>&quot;keep-scrollbar&quot;</C>.
            </li>
            <li>
              <C>modal=&#123;false&#125;</C> trên Menu hoặc ContextMenu: trang vẫn cuộn được, bấm ra ngoài tới trang ngay, và phần còn lại
              của trang không bị ẩn khỏi trình đọc màn hình. Hợp với menu mở từ thanh công cụ trong vùng nội dung dài.
            </li>
            <li>
              Phần tử <C>position: fixed</C> sát mép phải (header, nút nổi) xê dịch theo bề rộng thanh cuộn khi thanh cuộn ẩn, trừ khi có
              class <C>right-scroll-bar-position</C> (hoặc <C>width-before-scroll-bar</C> cho phần tử rộng hết trang). Với{" "}
              <C>keep-scrollbar</C> thì không cần.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="z-index" title="Thang z-index" description="Chỉ dùng vài bậc cố định; các bề mặt cùng bậc xếp chồng theo thứ tự mở (portal mở sau nằm trên).">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Bậc", "Dùng cho"]}
            rows={[
              [<C key="a">z-30</C>, "Thanh trên cùng sticky (TopBar của site docs). Nội dung sticky của ứng dụng không vượt bậc này."],
              [<C key="a">z-40</C>, "Lớp phủ của sidebar trên mobile (site docs)."],
              [<C key="a">z-50</C>, "Mọi overlay: lớp phủ + bề mặt Dialog / Drawer, Popover, Menu, Tooltip, HoverCard, listbox Dropdown / Combobox; sidebar mobile."],
              [<C key="a">z-100</C>, "Vùng Toast — luôn nằm trên cả Dialog để thông báo không bị che."],
            ]}
          />
          <DoDont
            dos={[
              "Để bề mặt nổi trong portal của component; dùng collisionPadding cho header sticky.",
              "Chọn side theo nội dung: Tooltip ở trên, Menu và listbox ở dưới, panel phụ ở cạnh.",
              "Giữ z-index trong thang 30 / 40 / 50 / 100.",
            ]}
            donts={[
              "Không đặt z-index tuỳ ý (z-[…] cỡ hàng nghìn) để “thắng” overlay.",
              "Không tắt avoidCollisions chỉ để bề mặt luôn ở một phía.",
              "Không tự viết Portal mà quên usePortalThemeProps() — bề mặt sẽ lấy theme của <html>.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
