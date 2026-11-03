import type { ReactNode } from "react";
import { DocSection } from "../blocks";
import { docsPath } from "../router";

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function List({ children }: { children: ReactNode }) {
  return <ul className="flex max-w-3xl list-disc flex-col gap-2 ps-5 text-body2 text-foreground-2">{children}</ul>;
}

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className="text-link underline hover:text-link-hover" href={href}>
    {children}
  </a>
);

export default function Page() {
  return (
    <>
      <DocSection id="handled" title="Yugen UI xử lý gì" description="Đã rà soát bảo mật trước 1.0 (#165).">
        <List>
          <li>
            <A href={docsPath("/components/markdown")}>Markdown</A> và <A href={docsPath("/components/streamingmarkdown")}>StreamingMarkdown</A>{" "}
            phân tích thành React element, không có HTML và không dùng <C>dangerouslySetInnerHTML</C>. Thẻ HTML hiện như chữ.
          </li>
          <li>
            Link chỉ giữ <C>http:</C>, <C>https:</C>, <C>mailto:</C>, và link tương đối (<C>/path</C>, <C>#id</C>) trong Markdown; StreamingMarkdown chỉ giữ link tương đối khi bật <C>relativeLinks</C>.{" "}
            <C>javascript:</C>, <C>data:</C>, <C>vbscript:</C> và URL bắt đầu bằng <C>//</C> hiện như chữ, kể cả khi viết hoa lẫn
            lộn hay chèn ký tự điều khiển. Citation dùng cùng cách kiểm tra. Ảnh (<C>![alt](src)</C>) hiện thành link, nên một tin
            nhắn không tải được ảnh từ máy chủ khác.
          </li>
          <li>
            Nội dung rất dài hay lồng rất sâu không làm treo trang: độ sâu có giới hạn (khối 32, inline 16), ngoặc và dấu chưa đóng
            được quét có giới hạn, và CI cho bộ phân tích chạy với input độc hại và ngẫu nhiên trong ngân sách thời gian.
          </li>
          <li>
            <A href={docsPath("/components/codeblock")}>CodeBlock</A> hiển thị token như chữ, và bộ tô màu vẫn tuyến tính trên
            dòng rất dài.
          </li>
          <li>
            Ảnh xem trước của FileUpload và PromptInput dùng object URL và thu hồi khi gỡ tệp hoặc component unmount. Tệp SVG hiện
            trong <C>&lt;img&gt;</C>, nơi script không chạy.
          </li>
          <li>
            React 19 chặn URL <C>javascript:</C> mà bạn tự truyền vào <C>href</C> (Link, Button <C>asChild</C>…).
          </li>
        </List>
      </DocSection>

      <DocSection id="app" title="App phải tự làm gì">
        <List>
          <li>
            <A href={docsPath("/components/prose")}>Prose</A> định dạng mọi HTML bạn đặt vào và không làm sạch nó. HTML từ người dùng
            hay CMS phải được sanitize trước (ví dụ bằng DOMPurify), hoặc dùng component Markdown thay vì HTML.
          </li>
          <li>
            Kiểm tra URL từ người dùng trước khi đưa vào <C>href</C> hay <C>src</C>: cho phép <C>https:</C> (và các scheme bạn cần),
            không cho <C>data:</C> ở link.
          </li>
          <li>Giới hạn dung lượng nội dung từ người dùng và mô hình ở server; giới hạn phía client chỉ giữ trang không bị treo.</li>
          <li>Kiểm tra tệp tải lên ở server; <C>accept</C> và giới hạn dung lượng của FileUpload là để giúp người dùng, không phải để bảo mật.</li>
        </List>
      </DocSection>

      <DocSection id="report" title="Báo lỗ hổng">
        <p className="max-w-3xl text-body2 text-foreground-2">
          Hãy báo riêng theo hướng dẫn trong{" "}
          <A href="https://github.com/trandat1114/Yugen-UI/blob/main/SECURITY.md">SECURITY.md</A>, không mở issue công khai.
        </p>
      </DocSection>
    </>
  );
}
