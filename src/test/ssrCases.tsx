/**
 * Danh sách element đại diện cho mọi nhóm component trong barrel — dùng chung cho test SSR (node) và hydration (jsdom).
 * Props tối thiểu nhưng thực tế (giống ví dụ trên docs). Mỗi case là một hàm để mỗi lần render tạo element mới.
 */
import type { ReactElement } from "react";
import {
  Add20Regular,
  Calendar20Regular,
  Home20Regular,
  Mail20Regular,
  MoreHorizontal20Regular,
  Settings20Regular,
  Share20Regular,
  TextBold20Regular,
  TextItalic20Regular,
} from "@fluentui/react-icons";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AreaChart,
  AriaLiveAnnouncer,
  AspectRatio,
  AsyncContent,
  Avatar,
  AvatarGroup,
  AvatarGroupItem,
  Badge,
  BarChart,
  BloomArt,
  Blur,
  Body1,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Carousel,
  CarouselCard,
  CarouselNavContainer,
  CarouselViewport,
  ChatComposer,
  Checkbox,
  CodeBlock,
  CodeTabs,
  Collapse,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ColorSwatch,
  Combobox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CompoundButton,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  CopyCodeButton,
  CounterBadge,
  DatePicker,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Display,
  Divider,
  DonutChart,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Dropdown,
  DropdownOption,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  ErrorState,
  Fade,
  Field,
  GradientText,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Image,
  InfoLabel,
  InlineDrawer,
  Input,
  InputOTP,
  InteractionTag,
  Kbd,
  KbdGroup,
  Label,
  LineChart,
  Link,
  List,
  ListItem,
  LoadingOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MessageBar,
  MessageBubble,
  MessageDaySeparator,
  MessageReaction,
  MessageScroller,
  Nav,
  NavItem,
  OverlayDrawer,
  PackageManagerTabs,
  PageProgress,
  Pagination,
  Persona,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  PresenceBadge,
  ProgressBar,
  Questionnaire,
  Radio,
  RadioGroup,
  Rating,
  RatingDisplay,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Rotate,
  Scale,
  ScrollArea,
  SearchBox,
  Select,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SimpleTooltip,
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonItem,
  SkeletonList,
  SkeletonTable,
  SkeletonText,
  Slide,
  Slider,
  SpinButton,
  Spinner,
  SplitButton,
  Sparkline,
  Stagger,
  StatTile,
  SwatchPicker,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  TagGroup,
  TagPicker,
  TeachingPopover,
  TeachingPopoverBody,
  TeachingPopoverSurface,
  TeachingPopoverTrigger,
  Textarea,
  Title3,
  Toaster,
  ToggleButton,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarToggleButton,
  TooltipProvider,
  Trace,
  TraceLog,
  TraceStep,
  Tree,
  TreeItem,
  TreeItemLayout,
  TypingIndicator,
  VisuallyHidden,
  WavyUnderline,
  YugenProvider,
} from "@/components/ui";

export interface SsrCase {
  name: string;
  render: () => ReactElement;
  /**
   * Cảnh báo SSR đã biết đến từ thư viện bên thứ ba (Yugen không sửa được) — so với thông điệp + component stack.
   * Chỉ dùng cho test Node; hydration vẫn phải sạch hoàn toàn.
   */
  knownServerWarnings?: { pattern: RegExp; reason: string }[];
}

/** Khớp cảnh báo useLayoutEffect khi frame đầu tiên của component stack là `component`. */
const layoutEffectWarningAt = (component: string) =>
  new RegExp(String.raw`^Warning: useLayoutEffect does nothing on the server[^\n]*\n\s+at ${component} \(`);

/** Mốc thời gian cố định cho Trace / Calendar (Date được giả lập trong test). */
export const SSR_NOW = Date.UTC(2026, 9, 20, 8, 30, 0);

const revenue = [
  { month: "T5", online: 120, store: 80 },
  { month: "T6", online: 150, store: 95 },
  { month: "T7", online: 170, store: 90 },
  { month: "T8", online: 140, store: 110 },
];
const series = [
  { key: "online", label: "Trực tuyến" },
  { key: "store", label: "Cửa hàng" },
];

export const SSR_CASES: SsrCase[] = [
  /* ---------- Provider ---------- */
  {
    name: "YugenProvider (dark, rtl, Toaster)",
    render: () => (
      <YugenProvider theme="dark" brand="web" dir="rtl" withToaster>
        <Button appearance="primary">Lưu</Button>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Nội dung A</TabsContent>
        </Tabs>
      </YugenProvider>
    ),
  },

  /* ---------- Hành động ---------- */
  {
    name: "Button / CompoundButton / ButtonGroup / loading",
    render: () => (
      <div>
        <Button appearance="primary" icon={<Add20Regular />}>
          Tạo
        </Button>
        <Button loading loadingText="Đang lưu…">
          Lưu
        </Button>
        <Button loading={false} icon={<Share20Regular />}>
          Chia sẻ
        </Button>
        <CompoundButton secondaryContent="Gửi lời mời">Tạo cuộc họp</CompoundButton>
        <ButtonGroup>
          <Button>Hoàn tác</Button>
          <Button icon={<MoreHorizontal20Regular />} aria-label="Thêm" />
        </ButtonGroup>
      </div>
    ),
  },
  {
    name: "SplitButton / MenuButton / Menu (đóng)",
    render: () => (
      <div>
        <SplitButton appearance="primary" menu={<MenuItem>Hẹn giờ gửi</MenuItem>}>
          Gửi
        </SplitButton>
        <MenuButton menu={<MenuItem>Mới nhất</MenuItem>}>Sắp xếp</MenuButton>
        <Menu>
          <MenuTrigger asChild>
            <Button aria-label="Thao tác" icon={<MoreHorizontal20Regular />} />
          </MenuTrigger>
          <MenuPopover>
            <MenuItem>Trả lời</MenuItem>
          </MenuPopover>
        </Menu>
      </div>
    ),
  },
  {
    name: "ToggleButton / ToggleGroup / Toolbar / Link",
    render: () => (
      <div>
        <ToggleButton defaultChecked>Yêu thích</ToggleButton>
        <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Định dạng chữ">
          <ToggleGroupItem value="bold" icon={<TextBold20Regular />} aria-label="In đậm" />
          <ToggleGroupItem value="italic" icon={<TextItalic20Regular />} aria-label="In nghiêng" />
        </ToggleGroup>
        <Toolbar aria-label="Định dạng">
          <ToolbarToggleButton icon={<TextBold20Regular />} aria-label="In đậm" />
          <ToolbarDivider />
          <ToolbarButton>Chèn</ToolbarButton>
        </Toolbar>
        <Link href="#/docs">Tài liệu</Link>
      </div>
    ),
  },

  /* ---------- Nhập liệu ---------- */
  {
    name: "Field / Input / Textarea / SearchBox / Label / InfoLabel",
    render: () => (
      <div>
        <Field label="Mô tả" hint="Tối đa 200 ký tự." required validationState="error" validationMessage="Bắt buộc">
          <Textarea placeholder="Viết vài dòng…" />
        </Field>
        <Input label="Email" placeholder="ten@congty.vn" hint="Gửi xác minh" />
        <SearchBox placeholder="Tìm" />
        <Label required>Tên</Label>
        <InfoLabel info="Giải thích">Email khôi phục</InfoLabel>
      </div>
    ),
  },
  {
    name: "Select / Dropdown / Combobox / TagPicker",
    render: () => (
      <div>
        <Select defaultValue="vn" aria-label="Quốc gia">
          <option value="vn">Việt Nam</option>
          <option value="jp">Nhật Bản</option>
        </Select>
        <Dropdown placeholder="Chọn phòng ban" aria-label="Phòng ban">
          <DropdownOption value="design">Thiết kế</DropdownOption>
          <DropdownOption value="dev">Phát triển</DropdownOption>
        </Dropdown>
        <Combobox aria-label="Thành phố" options={["Hà Nội", "Huế"]} defaultValue="Huế" />
        <TagPicker
          aria-label="Thẻ"
          defaultValue={["design"]}
          options={[
            { value: "design", label: "Thiết kế" },
            { value: "ux", label: "UX" },
          ]}
        />
      </div>
    ),
  },
  {
    name: "Checkbox / RadioGroup / Switch / Slider / SpinButton / Rating",
    render: () => (
      <div>
        <Checkbox label="Ghi nhớ" defaultChecked />
        <Checkbox label="Một phần" checked="indeterminate" />
        <RadioGroup defaultValue="email" aria-label="Kênh">
          <Radio value="email" label="Email" />
          <Radio value="sms" label="SMS" />
        </RadioGroup>
        <Switch label="Thông báo" defaultChecked />
        <Slider label="Độ sáng" showValue defaultValue={[70]} />
        <SpinButton aria-label="Số lượng" defaultValue={1} min={0} max={99} />
        <Rating defaultValue={3} aria-label="Đánh giá" />
        <RatingDisplay value={4.5} count={128} />
      </div>
    ),
  },
  {
    name: "InputOTP / SwatchPicker",
    render: () => (
      <div>
        <InputOTP aria-label="Mã xác thực" groups={[3, 3]} />
        <SwatchPicker aria-label="Màu" defaultSelectedValue="#C2347A">
          <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng" />
          <ColorSwatch value="#0F6CBD" color="#0F6CBD" aria-label="Xanh" />
        </SwatchPicker>
      </div>
    ),
  },
  {
    name: "Calendar",
    render: () => <Calendar mode="single" selected={new Date(2026, 9, 12)} defaultMonth={new Date(2026, 9, 1)} />,
    knownServerWarnings: [
      { pattern: layoutEffectWarningAt("DayPicker"), reason: "react-day-picker v10 (useAnimation) gọi useLayoutEffect trực tiếp" },
    ],
  },
  {
    name: "DatePicker",
    render: () => (
      <div>
        <DatePicker aria-label="Ngày bắt đầu" value={new Date(2026, 9, 12)} />
        <DatePicker aria-label="Ngày kết thúc" value={null} clearable />
      </div>
    ),
  },

  /* ---------- Điều hướng ---------- */
  {
    name: "Tabs / Breadcrumb / Pagination / Nav",
    render: () => (
      <div>
        <Tabs defaultValue="mail">
          <TabsList>
            <TabsTrigger value="mail" icon={<Mail20Regular />}>
              Thư
            </TabsTrigger>
            <TabsTrigger value="calendar" icon={<Calendar20Regular />}>
              Lịch
            </TabsTrigger>
            <TabsTrigger value="settings" icon={<Settings20Regular />} disabled>
              Cài đặt
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mail">3 thư chưa đọc.</TabsContent>
          <TabsContent value="calendar">Không có sự kiện.</TabsContent>
        </Tabs>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbButton>Trang chủ</BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton current>Báo cáo</BreadcrumbButton>
          </BreadcrumbItem>
        </Breadcrumb>
        <Pagination pageCount={10} defaultPage={4} />
        <Nav defaultSelectedValue="home" aria-label="Ứng dụng">
          <NavItem value="home" icon={<Home20Regular />}>
            Trang chủ
          </NavItem>
          <NavItem value="mail" icon={<Mail20Regular />}>
            Thư
          </NavItem>
        </Nav>
      </div>
    ),
  },
  {
    name: "Menubar / ContextMenu / Command",
    render: () => (
      <div>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Tệp</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Tạo mới</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div>Nhấp chuột phải</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Sao chép</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <Command>
          <CommandInput placeholder="Nhập lệnh…" />
          <CommandList>
            <CommandEmpty>Không có kết quả.</CommandEmpty>
            <CommandGroup heading="Gợi ý">
              <CommandItem>Lịch</CommandItem>
              <CommandItem>Máy tính</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    ),
  },

  /* ---------- Hiển thị dữ liệu ---------- */
  {
    name: "Avatar / AvatarGroup / Persona / Badge / CounterBadge / PresenceBadge",
    render: () => (
      <div>
        <Avatar name="Nguyễn Văn An" color="colorful" presence="available" />
        <Avatar name="Trần Bình" src="/a.png" />
        <AvatarGroup layout="stack" maxAvatars={2} aria-label="Thành viên">
          <AvatarGroupItem name="An" />
          <AvatarGroupItem name="Bình" />
          <AvatarGroupItem name="Cường" />
        </AvatarGroup>
        <Persona name="Nguyễn Văn An" secondaryText="Thiết kế" presence="busy" avatar={{ color: "colorful" }} />
        <Badge appearance="tint" color="success">
          Hoạt động
        </Badge>
        <CounterBadge count={120} />
        <PresenceBadge status="away" />
      </div>
    ),
  },
  {
    name: "Tag / Kbd / Text / Image / AspectRatio / List",
    render: () => (
      <div>
        <TagGroup aria-label="Chủ đề">
          <Tag>Thiết kế</Tag>
          <Tag dismissible>Bỏ được</Tag>
          <InteractionTag>Tương tác</InteractionTag>
        </TagGroup>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
        </KbdGroup>
        <Display>Aa</Display>
        <Title3>Tiêu đề</Title3>
        <Body1>Thân bài</Body1>
        <Image src="/hero.png" alt="Ảnh" shape="rounded" />
        <AspectRatio ratio={16 / 9}>
          <span>Video</span>
        </AspectRatio>
        <List aria-label="Người" selectionMode="single" defaultSelectedItems={["an"]}>
          <ListItem value="an" title="An" description="Kỹ sư" />
          <ListItem value="binh" title="Bình" />
        </List>
      </div>
    ),
  },
  {
    name: "Table",
    render: () => (
      <Table sortable aria-label="Hoá đơn">
        <TableHeader>
          <TableRow>
            <TableSelectionCell checked="mixed" aria-label="Chọn tất cả" />
            <TableHeaderCell sortDirection="ascending">Khách hàng</TableHeaderCell>
            <TableHeaderCell sortable={false}>Số tiền</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow selected>
            <TableSelectionCell checked aria-label="Chọn HD-1" />
            <TableCell>
              <TableCellLayout media={<Avatar name="An" />} description="an@contoso.vn">
                An
              </TableCellLayout>
            </TableCell>
            <TableCell>2.490.000 ₫</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  },
  {
    name: "Tree",
    render: () => (
      <Tree aria-label="Tệp" defaultOpenItems={["src"]} selectionMode="single" defaultSelectedValue="main">
        <TreeItem itemType="branch" value="src">
          <TreeItemLayout>src</TreeItemLayout>
          <Tree>
            <TreeItem itemType="leaf" value="main">
              <TreeItemLayout aside={<Badge size="small">3</Badge>}>main.tsx</TreeItemLayout>
            </TreeItem>
          </Tree>
        </TreeItem>
        <TreeItem itemType="leaf" value="pkg">
          <TreeItemLayout>package.json</TreeItemLayout>
        </TreeItem>
      </Tree>
    ),
  },
  {
    name: "Carousel (autoplay)",
    render: () => (
      <Carousel loop aria-label="Nổi bật">
        <CarouselViewport>
          <CarouselCard>Slide 1</CarouselCard>
          <CarouselCard>Slide 2</CarouselCard>
          <CarouselCard>Slide 3</CarouselCard>
        </CarouselViewport>
        <CarouselNavContainer autoplay />
      </Carousel>
    ),
  },

  /* ---------- Phản hồi ---------- */
  {
    name: "MessageBar / ProgressBar / Spinner / Empty / Toaster",
    render: () => (
      <div>
        <MessageBar intent="success" title="Đã lưu">
          Đã đồng bộ.
        </MessageBar>
        <ProgressBar value={0.6} label="Đang tải" description="6 / 10" />
        <ProgressBar aria-label="Không xác định" />
        <Spinner label="Đang tải dữ liệu…" />
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Add20Regular />
            </EmptyMedia>
            <EmptyTitle>Chưa có dự án</EmptyTitle>
            <EmptyDescription>Tạo dự án đầu tiên.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button appearance="primary">Tạo</Button>
          </EmptyContent>
        </Empty>
        <Toaster />
        <AriaLiveAnnouncer />
      </div>
    ),
  },
  {
    name: "Skeleton + presets",
    render: () => (
      <div>
        <Skeleton aria-label="Đang tải">
          <SkeletonItem shape="circle" size={40} />
          <SkeletonItem size={12} />
        </Skeleton>
        <SkeletonText lines={3} />
        <SkeletonAvatar />
        <SkeletonCard media actions={2} />
        <SkeletonList rows={3} />
        <SkeletonTable rows={3} columns={4} />
      </div>
    ),
  },

  /* ---------- Bề mặt & overlay (đóng) ---------- */
  {
    name: "Card / Dialog / Popover / HoverCard / TeachingPopover / Tooltip (đóng)",
    render: () => (
      <div>
        <Card>
          <CardHeader header="Lê Hằng đã chia sẻ" description="5 phút trước" image={<Avatar name="Lê Hằng" />} />
          <CardContent>Kế hoạch quý IV.</CardContent>
          <CardFooter>
            <Button>Mở</Button>
          </CardFooter>
        </Card>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Xoá</Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogTitle>Xoá tệp?</DialogTitle>
          </DialogSurface>
        </Dialog>
        <Popover>
          <PopoverTrigger asChild>
            <Button>Hiển thị</Button>
          </PopoverTrigger>
          <PopoverSurface>Tuỳ chọn</PopoverSurface>
        </Popover>
        <HoverCard>
          <HoverCardTrigger asChild>
            <a href="#/u">@minhanh</a>
          </HoverCardTrigger>
          <HoverCardContent>Minh Anh</HoverCardContent>
        </HoverCard>
        <TeachingPopover>
          <TeachingPopoverTrigger asChild>
            <Button>Mẹo</Button>
          </TeachingPopoverTrigger>
          <TeachingPopoverSurface>
            <TeachingPopoverBody>Ghim trang hay dùng.</TeachingPopoverBody>
          </TeachingPopoverSurface>
        </TeachingPopover>
        <TooltipProvider>
          <SimpleTooltip content="Chia sẻ">
            <Button aria-label="Chia sẻ" icon={<Share20Regular />} />
          </SimpleTooltip>
        </TooltipProvider>
      </div>
    ),
  },
  {
    name: "Drawer (overlay đóng + inline mở) / Sheet (đóng)",
    render: () => (
      <div>
        <OverlayDrawer open={false}>
          <DrawerBody>Ẩn</DrawerBody>
        </OverlayDrawer>
        <InlineDrawer open separator>
          <DrawerHeader>
            <DrawerHeaderTitle>Điều hướng</DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>Trang chủ</DrawerBody>
        </InlineDrawer>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Bộ lọc</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
            </SheetHeader>
            <SheetBody>Nội dung</SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    ),
  },

  /* ---------- Bố cục ---------- */
  {
    name: "Accordion / Collapsible / Divider / ScrollArea",
    render: () => (
      <div>
        <Accordion type="single" collapsible defaultValue="1">
          <AccordionItem value="1">
            <AccordionHeader>Yugen UI là gì?</AccordionHeader>
            <AccordionPanel>Thư viện component.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionHeader>Dark mode?</AccordionHeader>
            <AccordionPanel>Có.</AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button>Hiện thêm</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>Thêm</CollapsibleContent>
        </Collapsible>
        <Divider>Hoặc</Divider>
        <ScrollArea className="h-40">
          <p>Nội dung dài</p>
        </ScrollArea>
      </div>
    ),
  },
  {
    name: "Resizable",
    render: () => (
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="side" defaultSize="30%" minSize="20%" collapsible>
          Thanh bên
        </ResizablePanel>
        <ResizableHandle withHandle collapseButton="before" />
        <ResizablePanel id="main" defaultSize="70%">
          Nội dung
        </ResizablePanel>
      </ResizablePanelGroup>
    ),
  },
  {
    name: "Resizable (persistKey)",
    knownServerWarnings: [
      {
        pattern: layoutEffectWarningAt("PersistedPanelGroup"),
        reason: "useDefaultLayout của react-resizable-panels v4 gọi useLayoutEffect trực tiếp",
      },
    ],
    render: () => (
      <ResizablePanelGroup orientation="horizontal" persistKey="ssr-layout">
        <ResizablePanel id="a" defaultSize="40%">
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize="60%">
          B
        </ResizablePanel>
      </ResizablePanelGroup>
    ),
  },

  /* ---------- Chuyển động / tiện ích / trang trí ---------- */
  {
    name: "Motion / VisuallyHidden / Decorative",
    render: () => (
      <div>
        <Fade visible>
          <div>Fade</div>
        </Fade>
        <Scale visible appear>
          <div>Scale</div>
        </Scale>
        <Slide visible from="end">
          <div>Slide</div>
        </Slide>
        <Collapse visible={false}>
          <div>Collapse</div>
        </Collapse>
        <Blur visible>
          <div>Blur</div>
        </Blur>
        <Rotate visible>
          <div>Rotate</div>
        </Rotate>
        <Stagger visible>
          <div>1</div>
          <div>2</div>
        </Stagger>
        <VisuallyHidden>Ẩn</VisuallyHidden>
        <GradientText>Yugen</GradientText>
        <WavyUnderline />
        <BloomArt />
      </div>
    ),
  },

  /* ---------- Yugen Labs ---------- */
  {
    name: "Wait UX: LoadingOverlay / AsyncContent / ErrorState / PageProgress (absolute)",
    render: () => (
      <div>
        <LoadingOverlay loading label="Đang tải…">
          <p>Nội dung cũ</p>
        </LoadingOverlay>
        <AsyncContent status="loading">{() => <p>Xong</p>}</AsyncContent>
        <AsyncContent status="success">
          <p>Dữ liệu</p>
        </AsyncContent>
        <AsyncContent status="empty" />
        <AsyncContent status="error" onRetry={() => {}} />
        <ErrorState onRetry={() => {}} size="small" />
        <PageProgress position="absolute" value={0.4} />
      </div>
    ),
  },
  {
    // position="fixed" render qua portal → lớp so HTML bỏ qua (renderToString không hỗ trợ portal), chỉ còn hydrateRoot.
    name: "PageProgress (fixed, portal)",
    render: () => (
      <div>
        <PageProgress active />
      </div>
    ),
  },
  {
    name: "Charts: BarChart / LineChart / AreaChart / DonutChart",
    render: () => (
      <div>
        <BarChart title="Doanh thu" data={revenue} index="month" series={series} />
        <BarChart title="Ngang" data={revenue} index="month" series={series} orientation="horizontal" layout="stacked" />
        <LineChart title="Truy cập" data={revenue} index="month" series={series} />
        <AreaChart title="Vùng" data={revenue} index="month" series={series} stacked />
        <DonutChart
          title="Nguồn"
          data={[
            { label: "Tìm kiếm", value: 40 },
            { label: "Trực tiếp", value: 25 },
            { label: "Mạng xã hội", value: 20 },
          ]}
        />
      </div>
    ),
  },
  {
    name: "Sparkline / StatTile",
    render: () => (
      <div>
        <Sparkline data={[3, 5, 4, 8, 6, 9]} width={120} />
        <Sparkline data={[3, 5, null, 8]} width="auto" variant="area" />
        <StatTile label="Doanh thu" value={1284000000} delta={0.124} deltaLabel="so với tháng trước" trend={[1, 3, 2, 5, 4, 6]} />
      </div>
    ),
  },
  {
    name: "Trace (bước đang chạy + đồng hồ)",
    render: () => (
      <Trace title="Agent: tóm tắt hợp đồng" startedAt={SSR_NOW - 65_000}>
        <TraceStep status="success" title="Đọc tệp" duration={320} metadata={["gpt", "1.2k token"]} />
        <TraceStep status="running" title="Tóm tắt" startedAt={SSR_NOW - 4_200} details={<TraceLog>đang chạy…</TraceLog>} />
        <TraceStep status="running" title="Tự ghi mốc bắt đầu" />
        <TraceStep status="pending" title="Gửi email" />
      </Trace>
    ),
  },
  {
    name: "Questionnaire (stepper + list)",
    render: () => (
      <div>
        <Questionnaire
          title="Khảo sát"
          questions={[
            { id: "fw", type: "single", title: "Framework?", required: true, options: [{ value: "react", label: "React" }] },
            { id: "score", type: "rating", title: "Điểm" },
          ]}
        />
        <Questionnaire
          mode="list"
          questions={[
            { id: "nps", type: "scale", title: "NPS", minLabel: "Không", maxLabel: "Rất" },
            { id: "note", type: "longText", title: "Ghi chú", maxLength: 200 },
            { id: "ok", type: "yesNo", title: "Đồng ý?" },
          ]}
        />
      </div>
    ),
  },
  {
    name: "MessageScroller + MessageBubble / ChatComposer",
    render: () => (
      <div>
        <MessageScroller label="Cuộc trò chuyện" className="h-80">
          <MessageDaySeparator>Hôm nay</MessageDaySeparator>
          <MessageBubble author="Minh" time="09:00" dateTime="2026-10-20T09:00">
            Chào bạn!
          </MessageBubble>
          <MessageBubble author="Minh" time="09:01">
            Hôm nay thế nào?
          </MessageBubble>
          <MessageBubble side="outgoing" status="read" time="09:02" reactions={<MessageReaction emoji="👍" count={2} />}>
            Ổn cả.
          </MessageBubble>
          <MessageBubble side="outgoing" status="error" errorMessage="Không gửi được" onRetry={() => {}}>
            Tin lỗi
          </MessageBubble>
          <MessageBubble author="Trợ lý" appearance="plain" streaming>
            Đang trả lời…
          </MessageBubble>
          <TypingIndicator author="Minh" />
        </MessageScroller>
        <ChatComposer onSend={() => {}} placeholder="Nhập tin nhắn" maxLength={500} showCount showHint />
      </div>
    ),
  },
  {
    name: "CodeBlock / CodeTabs / PackageManagerTabs / CopyCodeButton",
    render: () => (
      <div>
        <CodeBlock filename="Button.tsx" code={'<Button appearance="primary">Lưu</Button>'} showLineNumbers highlightLines="1" />
        <CodeBlock code={"-a\n+b\n c"} language="ts" diff maxHeight={120} />
        <CodeTabs
          files={[
            { name: "App.tsx", code: "export default function App() {}" },
            { name: "styles.css", code: ".a { color: red; }" },
          ]}
        />
        <PackageManagerTabs packages="yugen-ui" />
        <CopyCodeButton text="npm i yugen-ui" />
      </div>
    ),
  },
];
