import type { ReactNode } from "react";
import {
  Add20Regular,
  ArrowRight16Regular,
  Copy20Regular,
  Delete20Regular,
  Document20Regular,
  Edit20Regular,
  Folder20Regular,
  MoreHorizontal20Regular,
  Search20Regular,
  Share20Regular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownOption,
  Field,
  Input,
  Kbd,
  ListItem,
  List,
  Menu,
  MenuDivider,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Radio,
  RadioGroup,
} from "@/components/ui";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function Demo({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">{children}</div>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-L py-S text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-L py-M text-foreground-2">
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

const AS_CHILD_CODE = `import { ArrowRight16Regular, Share20Regular } from "@fluentui/react-icons";
import { Button, Popover, PopoverSurface, PopoverTrigger } from "@/components/ui";

{/* Button render thành <a> nhưng giữ nguyên style, ref, sự kiện */}
<Button asChild appearance="primary">
  <a href="#/concepts/theming">
    Đọc về Theming
    <ArrowRight16Regular className="rtl:-scale-x-100" />
  </a>
</Button>

{/* Trigger của Radix gộp hành vi mở / aria-* vào Button của bạn */}
<Popover>
  <PopoverTrigger asChild>
    <Button icon={<Share20Regular />}>Chia sẻ</Button>
  </PopoverTrigger>
  <PopoverSurface>Liên kết đã được sao chép.</PopoverSurface>
</Popover>`;

const NODE_PROPS_CODE = `<Button icon={<Add20Regular />}>Tạo mới</Button>
<Button icon={<ArrowRight16Regular className="rtl:-scale-x-100" />} iconPosition="after">Tiếp tục</Button>
<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm" />

<Input
  aria-label="Tìm tệp"
  placeholder="Tìm tệp"
  contentBefore={<Search20Regular />}
  contentAfter={<Kbd>/</Kbd>}
  rootClassName="w-64"
/>

<Badge icon={<Document20Regular />}>12</Badge>

<Menu>
  <MenuTrigger asChild>
    <Button>Thao tác</Button>
  </MenuTrigger>
  <MenuPopover>
    <MenuItem icon={<Edit20Regular />} secondaryContent="Ctrl+E">Sửa</MenuItem>
    <MenuItem icon={<Copy20Regular />} secondaryContent="Ctrl+D">Nhân bản</MenuItem>
    <MenuDivider />
    <MenuItem icon={<Delete20Regular />}>Xoá</MenuItem>
  </MenuPopover>
</Menu>`;

const LIST_CODE = `<List className="w-full max-w-md">
  <ListItem
    media={<Avatar name="Phạm Thu Hà" color="colorful" />}
    title="Phạm Thu Hà"
    description="Đã chỉnh sửa Kế hoạch quý 3"
    actions={<Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />}
  />
</List>

<Dropdown placeholder="Chọn thư mục" aria-label="Thư mục">
  <DropdownOption value="docs" media={<Folder20Regular />}>Tài liệu</DropdownOption>
  <DropdownOption value="design" media={<Folder20Regular />}>Thiết kế</DropdownOption>
</Dropdown>`;

const CARD_CODE = `import { Avatar, Badge, Button, Card, CardContent, CardFooter, CardHeader } from "@/components/ui";

<Card className="w-full max-w-sm">
  <CardHeader
    image={<Avatar name="Nhóm Sakura" color="brand" />}
    header="Nhóm Sakura"
    description="Cập nhật 5 phút trước"
    action={<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />}
  />
  <CardContent>Bản phác thảo trang chủ mới đã sẵn sàng để góp ý.</CardContent>
  {/* Chèn bất kỳ phần tử nào giữa các phần — thứ tự do bạn quyết định */}
  <div className="flex gap-XS">
    <Badge appearance="tint" color="brand">Thiết kế</Badge>
    <Badge appearance="tint" color="informative">Bản nháp</Badge>
  </div>
  <CardFooter>
    <Button appearance="primary">Mở</Button>
    <Button>Bỏ qua</Button>
  </CardFooter>
</Card>`;

const RENDER_PROP_CODE = `{/* 1. Element: Field clone và gắn id, aria-describedby, aria-invalid, required, disabled */}
<Field label="Tên dự án" hint="Hiển thị trên thanh tiêu đề." required>
  <Input placeholder="Yugen Docs" />
</Field>

{/* 2. Render-prop: tự quyết định props đi vào đâu */}
<Field label="Quyền truy cập" hint="Có thể đổi sau trong Cài đặt.">
  {(props) => (
    <RadioGroup {...props} defaultValue="team" layout="horizontal">
      <Radio value="private" label="Riêng tư" />
      <Radio value="team" label="Trong nhóm" />
    </RadioGroup>
  )}
</Field>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="overview"
        title="Slot trong Yugen"
        description="Mỗi khái niệm slot của Fluent v9 có một cách tương ứng trong Yugen — đều là React thuần, không cần API riêng."
      >
        <SimpleTable
          head={["Fluent v9", "Yugen UI", "Ví dụ"]}
          rows={[
            [<>Slot <C>root</C>, prop <C>as</C></>, <C key="a">asChild</C>, "Button, Link, BreadcrumbButton, NavItem; mọi *Trigger của Radix"],
            [<>Slot <C>icon</C></>, <C key="a">icon</C>, "Button, ToggleButton, Badge, MenuItem, TabsTrigger, AccordionHeader"],
            [<>Slot <C>contentBefore</C> / <C>contentAfter</C></>, "Cùng tên", "Input, SearchBox"],
            [<>Slot <C>media</C></>, <C key="a">media</C>, "ListItem, DropdownOption, TableCellLayout, TagPicker option"],
            [<>Slot <C>action</C> / <C>actions</C></>, "Cùng tên", "CardHeader action, MessageBar actions, ListItem actions, TreeItemLayout actions"],
            ["Sub-component (CardHeader, DialogBody…)", "Component ghép", "Card*, Dialog*, Drawer*, Table*, Menu*"],
            [<>Slot nhận hàm render</>, "Render-prop children", <>Field: <C>{"(props) => <Control {...props} />"}</C></>],
            [<>className của slot con</>, <><C>rootClassName</C>, <C>listboxClassName</C>…</>, "Input, Slider, InfoLabel, Dropdown, Combobox, Select"],
          ]}
        />
      </DocSection>

      <DocSection
        id="as-child"
        title="asChild — đổi phần tử gốc"
        description="asChild dùng Slot của Radix: component không render thẻ của nó mà gộp className, ref, sự kiện và aria-* vào đúng một phần tử con bạn truyền vào."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <Button asChild appearance="primary">
              <a href="#/concepts/theming">
                Đọc về Theming
                <ArrowRight16Regular className="rtl:-scale-x-100" />
              </a>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button icon={<Share20Regular />}>Chia sẻ</Button>
              </PopoverTrigger>
              <PopoverSurface>Liên kết đã được sao chép.</PopoverSurface>
            </Popover>
          </Demo>
          <CodeBlock code={AS_CHILD_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>Con phải là <strong className="font-semibold">một</strong> phần tử duy nhất, forward ref và trải (spread) props xuống DOM.</li>
            <li>
              Với <C>{"<Button asChild>"}</C>, prop <C>icon</C> bị bỏ qua (Button chỉ render children) — đặt icon bên trong phần tử con như
              ví dụ trên.
            </li>
            <li>
              Dùng asChild để bọc link của router: <C>{"<BreadcrumbButton asChild><RouterLink to=\"/\">…</RouterLink></BreadcrumbButton>"}</C>.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="node-props"
        title="Prop nhận ReactNode: icon, contentBefore, media, actions"
        description="Thay vì slot object, các vùng phụ nhận thẳng ReactNode. Component lo căn chỉnh, khoảng cách và cỡ icon."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <Button icon={<Add20Regular />}>Tạo mới</Button>
            <Button icon={<ArrowRight16Regular className="rtl:-scale-x-100" />} iconPosition="after">
              Tiếp tục
            </Button>
            <Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm" />
            <Input aria-label="Tìm tệp" placeholder="Tìm tệp" contentBefore={<Search20Regular />} contentAfter={<Kbd>/</Kbd>} rootClassName="w-64" />
            <Badge icon={<Document20Regular />}>12</Badge>
            <Menu>
              <MenuTrigger asChild>
                <Button>Thao tác</Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuItem icon={<Edit20Regular />} secondaryContent="Ctrl+E">
                  Sửa
                </MenuItem>
                <MenuItem icon={<Copy20Regular />} secondaryContent="Ctrl+D">
                  Nhân bản
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<Delete20Regular />}>Xoá</MenuItem>
              </MenuPopover>
            </Menu>
          </Demo>
          <CodeBlock code={NODE_PROPS_CODE} />
          <Demo>
            <List className="w-full max-w-md">
              <ListItem
                media={<Avatar name="Phạm Thu Hà" color="colorful" />}
                title="Phạm Thu Hà"
                description="Đã chỉnh sửa Kế hoạch quý 3"
                actions={<Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />}
              />
            </List>
            <Dropdown placeholder="Chọn thư mục" aria-label="Thư mục">
              <DropdownOption value="docs" media={<Folder20Regular />}>
                Tài liệu
              </DropdownOption>
              <DropdownOption value="design" media={<Folder20Regular />}>
                Thiết kế
              </DropdownOption>
            </Dropdown>
          </Demo>
          <CodeBlock code={LIST_CODE} />
          <P>
            Cỡ icon do component đặt bằng <C>[&_svg]:size-*</C> (small 16, medium 20, large 24), nên chỉ cần truyền icon Fluent cỡ 20 và để
            component co giãn. Icon chỉ có nghĩa trang trí không cần <C>aria-label</C>; nút chỉ có icon thì bắt buộc có.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="compound"
        title="Component ghép (compound)"
        description="Card, Dialog, Drawer, Table, Menu được chia thành nhiều phần nhỏ. Bỏ phần không cần, đổi thứ tự, hoặc chèn phần tử của bạn vào giữa."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <Card className="w-full max-w-sm">
              <CardHeader
                image={<Avatar name="Nhóm Sakura" color="brand" />}
                header="Nhóm Sakura"
                description="Cập nhật 5 phút trước"
                action={<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />}
              />
              <CardContent>Bản phác thảo trang chủ mới đã sẵn sàng để góp ý.</CardContent>
              <div className="flex gap-XS">
                <Badge appearance="tint" color="brand">
                  Thiết kế
                </Badge>
                <Badge appearance="tint" color="informative">
                  Bản nháp
                </Badge>
              </div>
              <CardFooter>
                <Button appearance="primary">Mở</Button>
                <Button>Bỏ qua</Button>
              </CardFooter>
            </Card>
          </Demo>
          <CodeBlock code={CARD_CODE} />
          <SimpleTable
            head={["Họ component", "Các phần"]}
            rows={[
              ["Card", "Card · CardHeader (image, header, description, action) · CardPreview · CardContent · CardFooter"],
              ["Dialog", "Dialog · DialogTrigger · DialogSurface (modalType) · DialogTitle (action) · DialogDescription · DialogContent · DialogActions · DialogClose"],
              ["Drawer", "Drawer / OverlayDrawer / InlineDrawer · DrawerSurface · DrawerHeader · DrawerHeaderTitle (action) · DrawerBody · DrawerFooter"],
              ["Table", "Table · TableHeader · TableHeaderCell · TableBody · TableRow · TableCell · TableCellLayout · TableCellActions · TableSelectionCell"],
              ["Menu", "Menu · MenuTrigger · MenuPopover · MenuItem · MenuItemCheckbox · MenuItemRadio · MenuGroupHeader · MenuDivider · MenuSub…"],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="render-prop"
        title="Render-prop trong Field"
        description="Field nối nhãn, gợi ý và validation với control. Truyền element khi control nhận id trực tiếp; truyền hàm khi bạn cần quyết định props đi vào đâu."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <div className="flex w-full max-w-md flex-col gap-L">
              <Field label="Tên dự án" hint="Hiển thị trên thanh tiêu đề." required>
                <Input placeholder="Yugen Docs" />
              </Field>
              <Field label="Quyền truy cập" hint="Có thể đổi sau trong Cài đặt.">
                {(props) => (
                  <RadioGroup {...props} defaultValue="team" layout="horizontal">
                    <Radio value="private" label="Riêng tư" />
                    <Radio value="team" label="Trong nhóm" />
                  </RadioGroup>
                )}
              </Field>
            </div>
          </Demo>
          <CodeBlock code={RENDER_PROP_CODE} />
          <SimpleTable
            head={["Prop Field truyền xuống", "Giá trị"]}
            rows={[
              [<C key="a">id</C>, <>Prop <C>id</C> của Field hoặc id tự sinh (<C>useId</C>) — label trỏ tới bằng <C>htmlFor</C>.</>],
              [<C key="a">aria-describedby</C>, <>id của validationMessage và hint (nếu có).</>],
              [<C key="a">aria-invalid</C>, <><C>true</C> khi <C>validationState=&quot;error&quot;</C>.</>],
              [<C key="a">required, disabled</C>, "Lấy từ prop cùng tên của Field."],
            ]}
          />
          <P>
            Với element, props đặt trực tiếp trên control <strong className="font-semibold">thắng</strong> props của Field (Field gộp theo
            thứ tự <C>{"{ ...fieldProps, ...child.props }"}</C>). Lưu ý <C>{"<label for>"}</C> không đặt tên được cho{" "}
            <C>role=&quot;radiogroup&quot;</C> — với nhóm lựa chọn, xem cách gắn nhãn nhóm ở trang{" "}
            <a className="text-link underline hover:text-link-hover" href="#/concepts/component-labelling">
              Gắn nhãn component
            </a>
            .
          </P>
        </div>
      </DocSection>

      <DocSection
        id="class-targets"
        title="rootClassName & className"
        description="Component có nhiều lớp DOM cho bạn nhắm style vào đúng lớp. Quy tắc chung: className vào phần nhìn thấy chính, rootClassName vào khối bao ngoài."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Component", "className", "Prop phụ"]}
            rows={[
              ["Input, SearchBox", "Khung ô nhập (viền, nền, thanh focus)", <><C>rootClassName</C> — khối ngoài gồm label + hint; đặt width / margin ở đây</>],
              ["Slider", "Radix root (rail + thumb)", <><C>rootClassName</C> — khối ngoài gồm label + giá trị</>],
              ["InfoLabel", "Thẻ label", <><C>rootClassName</C> — span bọc label + nút (i)</>],
              ["Select", "Khung ngoài (đặt width ở đây)", <><C>selectClassName</C> — chính thẻ {"<select>"}</>],
              ["Textarea", "Khung ngoài (đặt width ở đây)", <><C>textareaClassName</C> — chính thẻ {"<textarea>"}</>],
              ["ProgressBar", "Thanh tiến độ", <><C>rootClassName</C> — khối ngoài khi có label / description</>],
              ["Dropdown, Combobox, TagPicker", "Trigger / ô nhập", <><C>listboxClassName</C> — bề mặt listbox trong portal</>],
              ["PopoverSurface, MenuPopover, TooltipContent", "Bề mặt nổi trong portal", "—"],
            ]}
          />
          <CodeBlock
            code={`<Input rootClassName="w-72" className="bg-background-2" placeholder="Khung nền xám, khối rộng 288px" />
<Slider rootClassName="max-w-xs" label="Âm lượng" defaultValue={[40]} />
<Select className="w-48" selectClassName="font-semibold">…</Select>
<Dropdown className="w-56" listboxClassName="max-h-60">…</Dropdown>`}
          />
          <DoDont
            dos={[
              "Dùng asChild để đổi thẻ gốc (link, link của router) thay vì bọc thêm một lớp.",
              "Truyền icon Fluent cỡ 20 vào prop icon / media và để component tự co giãn.",
              "Dùng render-prop của Field khi control không nhận id ở phần tử gốc.",
            ]}
            donts={[
              "Không truyền nhiều hơn một con cho phần tử asChild.",
              "Không đặt width lên className của Input khi có label — dùng rootClassName.",
              "Không chép lại markup bên trong component để thêm một icon — dùng prop có sẵn.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
