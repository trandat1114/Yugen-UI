import { useState } from "react";
import { Button, Card, Field, Radio, RadioGroup, Textarea, toast } from "@/components/ui";

export const meta = { title: "Gửi phản hồi", description: "Form với RadioGroup, Textarea và validation", order: 9 };

export default function FeedbackBlock() {
  const [topic, setTopic] = useState("feature");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const tooShort = message.trim().length < 10;

  return (
    <Card size="large" className="gap-L rounded-xlarge p-XL">
      <div>
        <h3 className="text-subtitle1 font-semibold">Gửi phản hồi</h3>
        <p className="mt-XXS text-body1 text-foreground-3">Góp ý của bạn giúp Yugen UI tốt hơn mỗi ngày.</p>
      </div>

      <form
        className="flex flex-col gap-L"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (tooShort) return;
          toast({ intent: "success", title: "Cảm ơn bạn!", body: "Phản hồi đã được gửi tới nhóm phát triển." });
          setMessage("");
          setSubmitted(false);
        }}
      >
        <Field label="Chủ đề">
          {(props) => (
            <RadioGroup {...props} value={topic} onValueChange={setTopic} layout="horizontal">
              <Radio value="feature" label="Đề xuất" />
              <Radio value="bug" label="Báo lỗi" />
              <Radio value="other" label="Khác" />
            </RadioGroup>
          )}
        </Field>

        <Field
          label="Nội dung"
          required
          validationState={submitted && tooShort ? "error" : "none"}
          validationMessage={submitted && tooShort ? "Vui lòng viết ít nhất 10 ký tự." : undefined}
          hint={`${message.length}/500`}
        >
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            placeholder="Mô tả chi tiết điều bạn muốn chia sẻ…"
            rows={4}
          />
        </Field>

        <div className="flex justify-end gap-S">
          <Button type="button" onClick={() => setMessage("")}>
            Xoá
          </Button>
          <Button type="submit" appearance="primary">
            Gửi phản hồi
          </Button>
        </div>
      </form>
    </Card>
  );
}
