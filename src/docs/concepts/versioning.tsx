import type { ReactNode } from "react";
import { MessageBar } from "@/components/ui";
import { DocSection } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} scope="col" className="px-L py-S text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-L py-M font-semibold text-foreground-1" : "px-L py-M text-foreground-2"}>
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

const WARN = `[yugen-ui] "Button.appearance.transparent" đã lỗi thời và sẽ bị xoá ở v2.0.0:
dùng appearance="subtle". Xem https://trandat1114.github.io/Yugen-UI/#/concepts/versioning`;

const DEPRECATE = `import { warnDeprecated } from "@/lib/deprecate";

/** @deprecated Dùng \`appearance="subtle"\`. Sẽ xoá ở v2.0.0. */
if (appearance === "transparent") {
  warnDeprecated("Button.appearance.transparent", 'dùng appearance="subtle"', "2.0.0");
}`;

const PIN = `# Giữ trong một dòng minor khi cần ổn định tuyệt đối (giai đoạn 0.x)
npm install yugen-ui@~0.6.0

# Từ 1.0: nhận mọi bản minor / patch, không bao giờ tự lên major
npm install yugen-ui@^1.0.0`;

export default function Page() {
  return (
    <>
      <DocSection id="semver" title="Semantic Versioning" description="MAJOR.MINOR.PATCH — đọc số phiên bản là biết mức rủi ro khi nâng cấp.">
        <div className="flex flex-col gap-L">
          <Table
            head={["Phần tăng", "Ý nghĩa", "Ví dụ"]}
            rows={[
              ["PATCH 1.2.3 → 1.2.4", "Sửa lỗi, cải thiện a11y / hiệu năng; không đổi API.", "Sửa focus ring bị cắt trong Dialog"],
              ["MINOR 1.2.3 → 1.3.0", "Thêm component, prop, token, biến thể; đánh dấu deprecate.", "Thêm prop presets cho DateRangePicker"],
              ["MAJOR 1.2.3 → 2.0.0", "Xoá API đã deprecate hoặc thay đổi phá vỡ khác.", "Bỏ appearance=\"transparent\""],
            ]}
          />
          <MessageBar intent="warning" title="Giai đoạn 0.x.">
            Trước 1.0, bản <strong className="font-semibold">minor</strong> (0.6 → 0.7) vẫn có thể chứa thay đổi phá vỡ — luôn được ghi ở mục
            “Thay đổi lớn” trong CHANGELOG và trang Có gì mới. Bản patch (0.6.1 → 0.6.2) thì không.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="breaking" title="Thế nào là thay đổi phá vỡ" description="Mọi thứ khiến mã đang chạy đúng phải sửa mới chạy tiếp, hoặc đổi giao diện ngoài ý muốn.">
        <Table
          head={["Phá vỡ (chỉ ở major)", "Không phá vỡ (minor / patch)"]}
          rows={[
            ["Xoá / đổi tên component, prop, giá trị prop, export, hook", "Thêm component, prop tuỳ chọn, giá trị mới cho union"],
            ["Đổi tên hoặc xoá token / utility (text-foreground-2, p-M…)", "Thêm token, utility, brand, gradient"],
            ["Đổi giá trị mặc định làm thay đổi hành vi (vd. modal mặc định)", "Tinh chỉnh màu / bóng nhỏ trong ngưỡng tương phản đã cam kết"],
            ["Đổi cấu trúc DOM mà người dùng nhắm tới qua slot / data-*", "Đổi DOM nội bộ không được ghi trong docs"],
            ["Nâng yêu cầu tối thiểu (React, Tailwind, trình duyệt)", "Hỗ trợ thêm phiên bản mới (React 19…)"],
          ]}
        />
      </DocSection>

      <DocSection id="deprecation" title="Quy trình deprecate" description="Không có API nào biến mất mà không báo trước ít nhất một bản minor.">
        <div className="flex flex-col gap-L">
          <ol className="flex max-w-3xl list-decimal flex-col gap-S ps-XL text-body2 text-foreground-2">
            <li>
              Bản minor thêm thay thế và đánh dấu API cũ bằng JSDoc <C>@deprecated</C> (gạch ngang trong editor) cùng cảnh báo{" "}
              <C>warnDeprecated()</C> — chỉ ở môi trường phát triển, mỗi API một lần, bị loại khỏi bản build production.
            </li>
            <li>CHANGELOG và trang Có gì mới ghi mục “Thay đổi lớn” với cách chuyển đổi cụ thể.</li>
            <li>API cũ vẫn chạy đúng cho tới bản major tiếp theo (tối thiểu một bản minor sau khi deprecate).</li>
            <li>Bản major xoá API và giữ hướng dẫn chuyển đổi trong docs.</li>
          </ol>
          <CodeBlock code={DEPRECATE} />
          <P>Cảnh báo trong console trông như sau:</P>
          <CodeBlock code={WARN} />
        </div>
      </DocSection>

      <DocSection id="support" title="Phạm vi hỗ trợ">
        <Table
          head={["Hạng mục", "Hỗ trợ", "Ghi chú"]}
          rows={[
            ["React", "18 và 19", "CI chạy typecheck, unit test và build trên cả hai"],
            ["Tailwind CSS", "v4", "Không cần Tailwind nếu dùng styles.css biên dịch sẵn"],
            ["TypeScript", "5.x, strict", "Kiểu được kiểm tra với @types/react 18 và 19"],
            ["Next.js", "App Router & Pages Router", "Mọi file component có \"use client\""],
            ["Trình duyệt", "Evergreen (Chrome, Edge, Firefox, Safari 2 bản gần nhất)", "Xem trang Trình duyệt & nền tảng"],
          ]}
        />
      </DocSection>

      <DocSection id="upgrade" title="Nâng cấp an toàn">
        <div className="flex flex-col gap-L">
          <ol className="flex max-w-3xl list-decimal flex-col gap-S ps-XL text-body2 text-foreground-2">
            <li>
              Đọc trang <a className="text-link underline hover:text-link-hover" href="#/news">Có gì mới</a> từ phiên bản hiện tại tới bản mới,
              chú ý mục “Thay đổi lớn”.
            </li>
            <li>Chạy ứng dụng ở chế độ phát triển và xử lý mọi cảnh báo <C>[yugen-ui]</C> trong console trước khi lên major.</li>
            <li>
              Chép mã bằng CLI yugen hoặc shadcn CLI? Commit trước, chạy lại <C>add --overwrite</C> rồi xem diff của git.{" "}
              <C>npx yugen doctor</C> báo bản <C>yugen-ui</C> đã cũ.
            </li>
          </ol>
          <CodeBlock code={PIN} />
        </div>
      </DocSection>
    </>
  );
}
