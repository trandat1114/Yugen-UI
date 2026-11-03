import { useState } from "react";
import { Button, Card, Field, Radio, RadioGroup, Textarea, toast } from "@/components/ui";

export const meta = { title: "Send feedback", description: "Form with RadioGroup, Textarea and validation", order: 9 };

export default function FeedbackBlock() {
  const [topic, setTopic] = useState("feature");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const tooShort = message.trim().length < 10;

  return (
    <Card size="large" className="gap-4 rounded-xlarge p-5">
      <div>
        <h3 className="text-subtitle1 font-semibold">Send feedback</h3>
        <p className="mt-0.5 text-body1 text-foreground-3">Your ideas help make Yugen UI better every day.</p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (tooShort) return;
          toast({ intent: "success", title: "Thank you!", body: "Your feedback has been sent to the team." });
          setMessage("");
          setSubmitted(false);
        }}
      >
        <Field label="Topic">
          {(props) => (
            <RadioGroup {...props} value={topic} onValueChange={setTopic} layout="horizontal">
              <Radio value="feature" label="Idea" />
              <Radio value="bug" label="Bug" />
              <Radio value="other" label="Other" />
            </RadioGroup>
          )}
        </Field>

        <Field
          label="Message"
          required
          validationState={submitted && tooShort ? "error" : "none"}
          validationMessage={submitted && tooShort ? "Please write at least 10 characters." : undefined}
          hint={`${message.length}/500`}
        >
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            placeholder="Tell us what you'd like to share…"
            rows={4}
          />
        </Field>

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => setMessage("")}>
            Clear
          </Button>
          <Button type="submit" appearance="primary">
            Send feedback
          </Button>
        </div>
      </form>
    </Card>
  );
}
