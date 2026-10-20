import * as React from "react";
import { Code16Regular, Eye16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { PageHeader } from "../blocks";
import { CodeBlock, CopyButton } from "../CodeBlock";

export interface BlockMeta {
  title: string;
  description: string;
  /** Thứ tự hiển thị (nhỏ trước). */
  order: number;
}

type BlockModule = { default: React.ComponentType; meta: BlockMeta };

// Component thật + mã nguồn thô của CHÍNH file đó → code copy luôn khớp với preview.
const modules = import.meta.glob<BlockModule>("../block-library/*.tsx", { eager: true });
const sources = import.meta.glob<string>("../block-library/*.tsx", { eager: true, query: "?raw", import: "default" });

const BLOCKS = Object.entries(modules)
  .map(([path, mod]) => ({ path, meta: mod.meta, Component: mod.default, source: sources[path] ?? "" }))
  .filter((b) => b.meta)
  .sort((a, b) => a.meta.order - b.meta.order);

function BlockCard({ meta, Component, source }: (typeof BLOCKS)[number]) {
  const [mode, setMode] = React.useState<"preview" | "code">("preview");

  return (
    <article className="mb-XL flex break-inside-avoid flex-col overflow-hidden rounded-3xlarge border border-stroke-2 bg-background-1 shadow-2">
      <header className="flex items-center justify-between gap-M border-b border-stroke-2 px-L py-S">
        <div className="min-w-0">
          <h2 className="truncate text-subtitle2 font-semibold">{meta.title}</h2>
          <p className="truncate text-caption1 text-foreground-3">{meta.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-XS">
          <div className="inline-flex rounded-medium bg-background-3 p-XXS" role="tablist" aria-label="Chế độ xem">
            {(["preview", "code"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                aria-label={m === "preview" ? "Preview" : "Code"}
                title={m === "preview" ? "Preview" : "Code"}
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-small transition-colors duration-faster",
                  mode === m ? "bg-background-1 text-foreground-1 shadow-2" : "text-foreground-3 hover:text-foreground-1",
                )}
              >
                {m === "preview" ? <Eye16Regular /> : <Code16Regular />}
              </button>
            ))}
          </div>
          <CopyButton text={source} />
        </div>
      </header>
      {mode === "preview" ? (
        <div className="flex justify-center bg-background-3 p-XL">
          <div className="w-full">
            <Component />
          </div>
        </div>
      ) : (
        <CodeBlock code={source} bare className="max-h-140 overflow-auto" />
      )}
    </article>
  );
}

export function BlocksPage() {
  return (
    <div className="pb-XXXL">
      <PageHeader
        eyebrow="Blocks"
        title="Blocks"
        lead="Các cụm giao diện ghép sẵn từ component của Yugen UI — đăng nhập, cài đặt, thống kê, danh sách… Copy nguyên khối vào dự án rồi chỉnh nội dung."
      >
        Mỗi block là một file trong <code className="font-mono text-caption1">src/docs/block-library/</code>. Tab “Code” hiển thị đúng
        mã nguồn của file đó.
      </PageHeader>
      <div className="columns-1 gap-XL lg:columns-2 2xl:columns-3">
        {BLOCKS.map((b) => (
          <BlockCard key={b.path} {...b} />
        ))}
      </div>
    </div>
  );
}
