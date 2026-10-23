import { useState } from "react";
import { Eye16Regular, Open16Regular } from "@fluentui/react-icons";
import { Button, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { CopyButton } from "../CodeBlock";
import { useLocale } from "../i18n";
import { TEMPLATES, templateCreateCommand, templateStackBlitzUrl } from "../templates";
import { docsPath } from "../router";

/** Trang chủ › Tạo dự án nhanh: chọn template → lệnh `npx create-yugen-ui` tương ứng (packages/create-yugen-ui). */
export function HomeCreate() {
  const { t, locale } = useLocale();
  const [dir, setDir] = useState(TEMPLATES[0].dir);
  const template = TEMPLATES.find((x) => x.dir === dir) ?? TEMPLATES[0];
  const command = templateCreateCommand(dir);

  return (
    <div className="flex flex-col gap-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-4 md:p-5">
      <ToggleGroup
        type="single"
        appearance="subtle"
        value={dir}
        onValueChange={(v) => v && setDir(v)}
        aria-label={t("home.createTemplate")}
        className="flex-wrap"
      >
        {TEMPLATES.map((x) => (
          <ToggleGroupItem key={x.dir} value={x.dir}>
            {x.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="max-w-3xl text-body1 text-foreground-2">{template[locale].description}</p>
      <div className="flex items-start gap-2 rounded-large border border-stroke-2 bg-background-3 py-1 ps-3 pe-1">
        <code className="min-w-0 flex-1 py-1 font-mono text-body1 wrap-anywhere text-foreground-1">
          <span className="text-foreground-3 select-none">$ </span>
          {command}
        </code>
        <CopyButton text={command} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild appearance="primary" icon={<Eye16Regular />}>
          <a href={docsPath("/templates")}>{t("home.createPreview")}</a>
        </Button>
        <Button asChild icon={<Open16Regular />}>
          <a href={templateStackBlitzUrl(dir)} target="_blank" rel="noreferrer">
            {t("home.createStackblitz")}
          </a>
        </Button>
      </div>
    </div>
  );
}
