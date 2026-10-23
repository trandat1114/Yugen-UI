import type { ReactNode } from "react";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { docsPath } from "../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link underline hover:text-link-hover" href={href}>
      {children}
    </a>
  );
}

const ENGLISH_CODE = `import { YugenProvider, messagesEn } from "yugen-ui";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <YugenProvider applyToDocument withToaster messages={messagesEn} locale="en-US">
      {children}
    </YugenProvider>
  );
}`;

const OVERRIDE_CODE = `// Chỉ đổi chuỗi cần đổi, phần còn lại giữ mặc định
<YugenProvider messages={{ dialog: { close: "Đóng hộp thoại" } }}>…</YugenProvider>

// Provider lồng kế thừa messages và locale của provider ngoài, rồi ghi đè tiếp
<YugenProvider messages={messagesEn} locale="en-US">
  <YugenProvider messages={{ toast: { dismiss: "Hide" } }}>…</YugenProvider>
</YugenProvider>

// Prop nhãn riêng của component vẫn thắng messages
<SearchBox dismissLabel="Xoá từ khoá" />`;

const OTHER_CODE = `import { messagesEn, type YugenMessages } from "yugen-ui";

// Kiểu YugenMessages đầy đủ: thiếu namespace nào là typecheck báo lỗi
export const messagesJa: YugenMessages = {
  ...messagesEn,
  dialog: { close: "閉じる" },
  toast: { region: "通知", regionHotkey: "通知 ({hotkey})", dismiss: "通知を閉じる" },
  // …
};

<YugenProvider messages={messagesJa} locale="ja-JP">…</YugenProvider>`;

const SOURCE_CODE = `// Source copy bằng CLI / shadcn: mỗi component có messages.ts riêng
import { dialogMessagesEn } from "@/components/ui/Dialog/Dialog";
import { toastMessagesEn } from "@/components/ui/Toast/Toast";

const messages = { dialog: dialogMessagesEn, toast: toastMessagesEn };

<YugenProvider messages={messages} locale="en-US">…</YugenProvider>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="english"
        title="Chuyển sang tiếng Anh"
        description="messagesEn chứa bản tiếng Anh của mọi chuỗi có sẵn; locale đổi định dạng ngày, giờ và số."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={ENGLISH_CODE} />
          <P>
            Chuỗi có sẵn là chữ component tự hiển thị hoặc đọc cho trình đọc màn hình mà bạn không truyền vào: nhãn nút X, “Đang tải…”,
            “Không tìm thấy kết quả”, mô tả biểu đồ, thông báo aria-live. Nội dung bạn truyền vào (tiêu đề, children, label của Field)
            không bị đổi.
          </P>
          <P>
            <C>messagesEn</C> là một object thường; bundler chỉ đưa nó vào bản build khi bạn import, ứng dụng chỉ dùng tiếng Việt
            không tốn thêm byte nào.
          </P>
        </div>
      </DocSection>

      <DocSection id="override" title="Đổi vài chuỗi" description="messages nhận một phần: theo namespace của component, chỉ những chuỗi cần đổi.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={OVERRIDE_CODE} />
          <P>
            Thứ tự ưu tiên: prop nhãn của chính component (vd. <C>dismissLabel</C> của SearchBox), rồi <C>messages</C> của provider gần
            nhất, rồi provider ngoài, cuối cùng là mặc định tiếng Việt. Tên namespace và từng khoá có gợi ý kiểu trong editor.
          </P>
        </div>
      </DocSection>

      <DocSection id="locale" title="Ngày, giờ và số" description="locale của YugenProvider là locale Intl mặc định cho component.">
        <div className="flex flex-col gap-4">
          <P>
            Biểu đồ, DatePicker, TimePicker, NotificationCenter và Rating định dạng số và ngày giờ theo <C>locale</C> của provider (mặc
            định <C>"vi-VN"</C>). Prop <C>locale</C> của từng component vẫn ưu tiên hơn. Calendar dùng locale của react-day-picker, nằm
            trong <C>messages.calendar.locale</C>; <C>messagesEn</C> đã đặt sẵn tiếng Anh.
          </P>
          <P>
            Hướng chữ là việc riêng của prop <C>dir</C>, xem <A href={docsPath("/concepts/rtl")}>Hướng chữ RTL</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="other" title="Ngôn ngữ khác" description="Viết một object YugenMessages đầy đủ, thường bắt đầu từ messagesEn.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={OTHER_CODE} />
          <P>
            Chuỗi có giá trị thay đổi (số bước, số thông báo, tên tệp) là hàm, nên tự xử lý được số nhiều và thứ tự từ của từng ngôn
            ngữ. Khi nâng cấp mà component có chuỗi mới, typecheck chỉ ra chỗ còn thiếu.
          </P>
        </div>
      </DocSection>

      <DocSection id="source" title="Khi copy source" description="Mỗi component có file messages.ts cạnh file component.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={SOURCE_CODE} />
          <P>
            <C>messagesEn</C> chỉ có trong gói npm. Với source copy bằng <A href={docsPath("/concepts/cli")}>@yugen-ui/cli</A> hoặc shadcn,
            ghép các <C>…MessagesEn</C> của những component bạn có; kiểu <C>YugenMessages</C> cũng chỉ gồm các component đó. Muốn đổi hẳn
            mặc định thì sửa trực tiếp <C>messages.ts</C>.
          </P>
          <DoDont
            dos={[
              "Đặt messages và locale một lần ở YugenProvider gốc.",
              "Dùng prop nhãn của component khi một chỗ cần chữ khác phần còn lại của ứng dụng.",
            ]}
            donts={[
              "Tạo object messages mới trong mỗi lần render: khai báo ngoài component hoặc dùng useMemo.",
              "Dịch nội dung của bạn bằng messages; nó chỉ dành cho chữ có sẵn của component.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
