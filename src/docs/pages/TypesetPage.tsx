import * as React from "react";
import { ArrowReset20Regular } from "@fluentui/react-icons";
import {
  Button,
  Card,
  CodeTabs,
  Field,
  Input,
  Markdown,
  Select,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui";
import { DocSection, PageHeader } from "../blocks";
import { CopyButton } from "../CodeBlock";
import { useLocale, type Locale } from "../i18n";
import { docsPath } from "../router";
import {
  BODY_FONTS,
  DEFAULT_TYPESET,
  LIMITS,
  MONO_FONTS,
  PRESETS,
  applyPreset,
  paramsToTypeset,
  sanitizeClassName,
  typesetCss,
  typesetFontLink,
  typesetFonts,
  typesetSnippet,
  typesetToParams,
  typesetVars,
  type TypesetPreset,
  type TypesetState,
} from "../typeset";

const translator = (locale: Locale) => (vi: string, en: string) => (locale === "en" ? en : vi);

const PRESET_LABEL: Record<TypesetPreset, [string, string]> = {
  docs: ["Tài liệu", "Docs"],
  article: ["Bài viết", "Article"],
  chat: ["Chat", "Chat"],
  compact: ["Gọn", "Compact"],
};

/** Nội dung xem trước, theo ngôn ngữ trang. */
const SAMPLES: Record<"docs" | "article" | "chat" | "news", [string, string]> = {
  docs: [
    `# Cài đặt\n\nCài gói rồi import theme **một lần** ở file CSS gốc. Component dùng token của theme, nên đổi brand là đổi cả bộ.\n\n\`\`\`bash\nnpm i yugen-ui\n\`\`\`\n\n## Dùng component\n\n- Import từ \`yugen-ui\`.\n- Bọc app trong \`YugenProvider\` để có theme, brand và hướng chữ.\n- Mọi component có trạng thái focus rõ và dùng được bằng bàn phím.\n\n| Prop | Mặc định |\n| --- | --- |\n| \`size\` | \`"medium"\` |\n| \`appearance\` | \`"secondary"\` |`,
    `# Installation\n\nInstall the package, then import the theme **once** in your root CSS file. Components read the theme's tokens, so changing the brand changes the whole set.\n\n\`\`\`bash\nnpm i yugen-ui\n\`\`\`\n\n## Using components\n\n- Import from \`yugen-ui\`.\n- Wrap the app in \`YugenProvider\` for theme, brand and text direction.\n- Every component has a clear focus state and works with the keyboard.\n\n| Prop | Default |\n| --- | --- |\n| \`size\` | \`"medium"\` |\n| \`appearance\` | \`"secondary"\` |`,
  ],
  article: [
    `# Mùa hoa anh đào ở Kyoto\n\nSáng sớm, sương còn đọng trên mặt sông Kamo. Những cánh hoa đầu tiên rơi xuống nước rồi trôi chậm qua các cây cầu đá, trước khi phố xá kịp thức dậy.\n\n> Hoa đẹp nhất vào ngày nó bắt đầu rụng.\n\n## Đi đâu trước\n\nCon đường Triết học dài hai cây số, chạy dọc một con kênh nhỏ. Đi bộ từ chùa Ginkaku về phía nam, bạn sẽ thấy hàng trăm cây anh đào nghiêng mình trên mặt nước.\n\nChiều tối, ghé Gion. Đèn lồng được thắp lên, và hoa dưới ánh đèn có màu khác hẳn ban ngày.`,
    `# Cherry blossom season in Kyoto\n\nEarly in the morning, mist still rests on the Kamo River. The first petals fall into the water and drift slowly past the stone bridges before the city wakes up.\n\n> Blossoms are at their best on the day they begin to fall.\n\n## Where to start\n\nThe Philosopher's Path runs two kilometres along a narrow canal. Walk south from Ginkaku-ji and you pass hundreds of cherry trees leaning over the water.\n\nIn the evening, head to Gion. The lanterns come on, and the blossoms under them look nothing like they did at noon.`,
  ],
  chat: [
    `Được, có ba cách để đổi brand:\n\n1. Đặt \`brand\` trên \`YugenProvider\`.\n2. Thêm \`data-brand\` vào một phần tử bất kỳ để đổi riêng vùng đó.\n3. Tạo brand mới trong **Theme Designer** rồi copy CSS.\n\nCách 2 hữu ích khi một trang có nhiều thương hiệu.`,
    `Sure, there are three ways to change the brand:\n\n1. Set \`brand\` on \`YugenProvider\`.\n2. Add \`data-brand\` to any element to change just that area.\n3. Create a new brand in the **Theme Designer** and copy the CSS.\n\nOption 2 helps when one page shows several brands.`,
  ],
  news: [
    `## Mới\n\n- **AppShell**: bố cục app với sidebar thu gọn, thanh trên cùng dính và \`Ctrl+B\`.\n- **Sortable**: danh sách kéo thả dùng được bằng bàn phím và trình đọc màn hình.\n\n## Sửa lỗi\n\n- Bảng props không còn tràn ngang trên màn hình hẹp.`,
    `## New\n\n- **AppShell**: an app layout with a collapsible sidebar, a sticky top bar and \`Ctrl+B\`.\n- **Sortable**: drag-and-drop lists that work with the keyboard and screen readers.\n\n## Fixed\n\n- Props tables no longer scroll sideways on narrow screens.`,
  ],
};

function initialState(): TypesetState {
  // Prerender không có URL: dùng mặc định; link chia sẻ ?ts-… áp khi trang chạy trên trình duyệt.
  return typeof window === "undefined" ? DEFAULT_TYPESET : paramsToTypeset(new URLSearchParams(window.location.search));
}

/** Trang Typeset (#244): chỉnh font và nhịp chữ của Prose trên nội dung thật, rồi copy CSS. */
export function TypesetPage() {
  const { locale } = useLocale();
  const t = translator(locale);
  const [state, setState] = React.useState(initialState);
  const [name, setName] = React.useState("my-prose");
  const set = <K extends keyof TypesetState>(key: K, value: TypesetState[K]) => setState((s) => ({ ...s, [key]: value }));
  const className = sanitizeClassName(name);

  // Giữ trạng thái trên URL (thay thế, không thêm vào lịch sử) để copy link là chia sẻ được.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const k of [...params.keys()]) if (k.startsWith("ts-")) params.delete(k);
    typesetToParams(state, params);
    const query = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, [state]);

  // Font từ Google Fonts chỉ nạp để xem trước; CSS xuất ra kèm link riêng cho app.
  React.useEffect(() => {
    for (const font of typesetFonts(state)) {
      if (document.getElementById(`ts-font-${font.id}`)) continue;
      document.head.append(
        Object.assign(document.createElement("link"), {
          id: `ts-font-${font.id}`,
          rel: "stylesheet",
          href: `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`,
        }),
      );
    }
  }, [state]);

  const vars = typesetVars(state) as React.CSSProperties;
  const fontLink = typesetFontLink(state);
  const files = [
    { name: `${className}.css`, code: typesetCss(state, className), language: "css" as const },
    { name: "Article.tsx", code: typesetSnippet(state, className), language: "tsx" as const },
    ...(fontLink ? [{ name: "index.html", code: fontLink, language: "html" as const }] : []),
  ];
  const shareUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    for (const k of [...params.keys()]) if (k.startsWith("ts-")) params.delete(k);
    const query = typesetToParams(state, params).toString();
    return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;
  }, [state]);
  const fontSelect = (label: string, key: "body" | "heading" | "mono") => (
    <Field label={label}>
      <Select value={state[key]} onChange={(e) => set(key, e.target.value)}>
        {key === "heading" && <option value="body">{t("Giống chữ thân", "Same as body")}</option>}
        {(key === "mono" ? MONO_FONTS : BODY_FONTS).map((f) => (
          <option key={f.id} value={f.id}>
            {f.id === "inherit" ? (key === "mono" ? t("Font mono của theme", "Theme mono") : t("Font của app", "App font")) : f.label}
          </option>
        ))}
      </Select>
    </Field>
  );
  const slider = (label: string, key: "size" | "leading" | "flow" | "measure", unit: string) => (
    <Slider
      label={`${label} (${unit})`}
      showValue
      value={[state[key]]}
      onValueChange={([v]) => set(key, v)}
      min={LIMITS[key].min}
      max={LIMITS[key].max}
      step={LIMITS[key].step}
    />
  );

  return (
    <div className="pb-8">
      <PageHeader
        eyebrow={t("Công cụ", "Tools")}
        title="Typeset"
        lead={t(
          "Chỉnh font, cỡ chữ, line-height, khoảng cách giữa các khối và độ rộng dòng cho nội dung dài (Prose, Markdown), xem trên nội dung thật, rồi copy CSS.",
          "Tune the fonts, size, line height, space between blocks and line length for long-form text (Prose, Markdown), check them on real content, then copy the CSS.",
        )}
      >
        {t("Preset có sẵn trong theme: ", "Presets in the theme: ")}
        <code className="font-mono text-caption1">yugen-prose-docs</code>, <code className="font-mono text-caption1">-article</code>,{" "}
        <code className="font-mono text-caption1">-chat</code>, <code className="font-mono text-caption1">-compact</code>.{" "}
        <a className="text-link underline hover:text-link-hover" href={docsPath("/components/prose")}>
          Prose
        </a>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Card size="large" className="gap-4 rounded-2xlarge p-5 xl:sticky xl:top-24 xl:self-start">
          <div className="flex flex-col gap-2">
            <p id="ts-preset" className="text-body1 font-semibold">
              Preset
            </p>
            <ToggleGroup
              type="single"
              size="small"
              aria-labelledby="ts-preset"
              value={state.preset}
              onValueChange={(v) => v && setState((s) => applyPreset(s, v as TypesetPreset))}
              className="flex-wrap"
            >
              {PRESETS.map((p) => (
                <ToggleGroupItem key={p} value={p}>
                  {t(...PRESET_LABEL[p])}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {fontSelect(t("Chữ thân", "Body"), "body")}
          {fontSelect(t("Tiêu đề", "Headings"), "heading")}
          {fontSelect("Code", "mono")}
          {slider(t("Cỡ chữ", "Size"), "size", "px")}
          {slider(t("Line-height", "Line height"), "leading", "×")}
          {slider(t("Khoảng cách khối", "Flow"), "flow", "em")}
          {slider(t("Độ rộng dòng", "Measure"), "measure", "ch")}
          <Button icon={<ArrowReset20Regular />} onClick={() => setState(DEFAULT_TYPESET)}>
            {t("Về mặc định", "Reset")}
          </Button>
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          <Tabs defaultValue="docs">
            <TabsList size="small">
              <TabsTrigger value="docs">{t("Tài liệu", "Docs")}</TabsTrigger>
              <TabsTrigger value="article">{t("Bài viết", "Article")}</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="news">{t("Tin mới", "News")}</TabsTrigger>
            </TabsList>
            {(["docs", "article", "chat", "news"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
                <Markdown headingOffset={tab === "news" ? 1 : 0} style={{ ...vars, maxWidth: `${state.measure}ch` }}>
                  {SAMPLES[tab][locale === "en" ? 1 : 0]}
                </Markdown>
              </TabsContent>
            ))}
          </Tabs>

          <DocSection id="output" title={t("CSS xuất ra", "Output")}>
            <div className="flex flex-col gap-3">
              <Field label={t("Tên class", "Class name")} hint={`.${className}`}>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <CodeTabs files={files} maxHeight={360} />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-caption1 text-foreground-3">{t("Link chia sẻ", "Share link")}</span>
                <CopyButton text={shareUrl} className="border border-stroke-1" />
              </div>
            </div>
          </DocSection>
        </div>
      </div>
    </div>
  );
}
