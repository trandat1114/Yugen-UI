import type { ReactNode } from "react";
import { Badge, MessageBar } from "@/components/ui";
import { DocSection } from "../blocks";

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: bảng rộng cuộn ngang được bằng bàn phím (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
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
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold text-foreground-1" : "px-4 py-3 text-foreground-2"}>
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

const Supported = () => (
  <Badge appearance="tint" color="success">
    Hỗ trợ
  </Badge>
);
const NotSupported = () => (
  <Badge appearance="tint" color="danger">
    Không hỗ trợ
  </Badge>
);

export default function Page() {
  return (
    <>
      <DocSection
        id="browsers"
        title="Trình duyệt"
        description="Hai phiên bản mới nhất của mỗi trình duyệt evergreen. Mốc tối thiểu thực tế là mốc của Tailwind CSS v4."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Trình duyệt", "Phiên bản", "Trạng thái"]}
            rows={[
              ["Chrome, Edge (Chromium)", "2 bản mới nhất · tối thiểu 111", <Supported key="s" />],
              ["Firefox", "2 bản mới nhất · tối thiểu 128", <Supported key="s" />],
              ["Safari macOS & iOS / iPadOS", "2 bản mới nhất · tối thiểu 16.4", <Supported key="s" />],
              ["Chrome Android, Samsung Internet", "Bản mới nhất", <Supported key="s" />],
              ["Internet Explorer, Edge Legacy (EdgeHTML)", "—", <NotSupported key="n" />],
            ]}
          />
          <MessageBar intent="info" title="Cần hỗ trợ trình duyệt cũ hơn?" className="max-w-3xl">
            Tailwind CSS v4 không có chế độ tương thích ngược; khi đó hãy cân nhắc Tailwind 3 và tự chuyển cấu hình token sang{" "}
            <C>tailwind.config.js</C> — ngoài phạm vi hỗ trợ của Yugen UI.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="css"
        title="Tính năng CSS được dùng"
        description="Tất cả đều có trong mọi trình duyệt ở bảng trên — không cần polyfill hay PostCSS bổ sung."
      >
        <SimpleTable
          head={["Tính năng", "Dùng ở đâu"]}
          rows={[
            ["CSS custom properties", <>Toàn bộ token: <C>--colorNeutralForeground1</C>, <C>--spacingM</C>, <C>--brand-80</C>…</>],
            [<C key="a">@layer</C>, "Tailwind v4 xuất CSS theo cascade layer (theme, base, components, utilities) — utility luôn thắng base."],
            [<C key="a">@property</C>, "Tailwind v4 đăng ký biến cho transform, shadow, gradient để animate mượt."],
            [<C key="a">color-mix()</C>, <>Modifier độ mờ trên màu token: <C>bg-shell/85</C> (thanh trên cùng), <C>border-brand-stroke/30</C> (Badge tint).</>],
            [<C key="a">:has()</C>, <>Input tắt (<C>has-[input:disabled]</C>), vòng focus Radio (<C>has-[button:focus-visible]</C>), Switch tắt.</>],
            ["Logical properties", <><C>ms-*</C>, <C>ps-*</C>, <C>start-*</C>, <C>border-s</C>, <C>rounded-s-*</C>, <C>text-start</C> — nền tảng của RTL.</>],
            [<C key="a">:focus-visible</C>, "Vòng focus 2px chỉ hiện khi dùng bàn phím."],
            [<C key="a">:dir() / [dir]</C>, <>Biến thể <C>rtl:</C> để lật icon và transform.</>],
            ["Đơn vị dvh", <>Chiều cao Dialog / Drawer / Toast trên mobile (<C>max-h-dvh</C>).</>],
            [<C key="a">clip-path: inset()</C>, "Thanh brand 2px ở đáy ô nhập."],
            [<C key="a">aspect-ratio</C>, "AspectRatio, Image."],
            [<C key="a">translate / scale / rotate</C>, "Thuộc tính transform riêng lẻ mà Tailwind v4 sinh ra."],
            ["prefers-reduced-motion, prefers-color-scheme", <>Tắt animation lặp (<C>motion-reduce:animate-none</C>), chọn theme ban đầu.</>],
            [<C key="a">oklch()</C>, "Không bắt buộc: token dùng mã HEX, palette mặc định (oklch) của Tailwind đã bị tắt."],
          ]}
        />
      </DocSection>

      <DocSection id="stack" title="React, TypeScript, Tailwind">
        <SimpleTable
          head={["Thành phần", "Phiên bản", "Ghi chú"]}
          rows={[
            ["React / React DOM", "19 (mặc định) · 18.3 (vẫn hỗ trợ, CI kiểm thử)", "Dùng forwardRef, useId, useSyncExternalStore; Radix, cmdk, react-day-picker đều hỗ trợ React 19."],
            ["TypeScript", "5.x", "Mã nguồn viết ở chế độ strict; mọi kiểu prop export cùng component (ButtonProps, FieldProps…)."],
            ["Tailwind CSS", "4.x", <>Bắt buộc v4: cấu hình CSS-first (<C>@theme</C>, <C>@utility</C>), cú pháp <C>size-4!</C>, <C>max-h-(--var)</C>.</>],
            ["Bundler", "Vite 6 · Next.js 14 / 15 · bất kỳ bundler hỗ trợ PostCSS", <>Component không dùng API riêng của bundler; chỉ cần alias <C>@/</C>.</>],
            ["Radix UI", "Theo package.json", "Mỗi primitive là một package riêng — chỉ cài cái bạn dùng."],
            ["Icon", "@fluentui/react-icons 2.x", "Tree-shake theo từng icon; không cần font icon."],
          ]}
        />
      </DocSection>

      <DocSection
        id="input"
        title="Chuột, cảm ứng, bàn phím"
        description="Mọi component dùng được bằng cả ba phương thức nhập, và với công nghệ hỗ trợ."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Phương thức", "Hành vi"]}
            rows={[
              ["Chuột / bút", <>Đủ trạng thái hover → pressed. Ở Tailwind v4, <C>hover:</C> chỉ áp dụng trên thiết bị có hover thật nên không “dính” hover trên màn hình cảm ứng.</>],
              ["Cảm ứng", <>Slider đặt <C>touch-none</C> để kéo không cuộn trang; Toast vuốt để đóng; Drawer, Carousel dùng được bằng tay. Control medium cao 32px (≥ 24px theo WCAG 2.5.8) — giao diện ưu tiên cảm ứng nên dùng <C>size=&quot;large&quot;</C> (40px).</>],
              ["Bàn phím", "Tab / Shift+Tab giữa các control, phím mũi tên trong nhóm (Tabs, Menu, RadioGroup, Toolbar, Tree, List…), Esc đóng overlay. Xem bảng đầy đủ ở trang Tổng quan khả năng tiếp cận."],
              ["Trình đọc màn hình", "Nên kiểm thử với NVDA + Firefox / Chrome, JAWS + Chrome, VoiceOver + Safari (macOS, iOS), TalkBack + Chrome (Android), Narrator + Edge."],
              ["Chế độ tương phản (forced-colors)", <>Bề mặt nổi và nút giữ <C>border-transparent</C> thay vì bỏ viền, nên Windows High Contrast vẫn vẽ đường viền; focus dùng <C>outline</C> nên luôn hiện.</>],
              ["Thu phóng", "Bố cục dùng flex / grid và chiều rộng tối đa theo khung nhìn (calc(100vw - …)) để reflow khi phóng to."],
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
