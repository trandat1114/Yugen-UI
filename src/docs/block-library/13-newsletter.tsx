import { useState } from "react";
import { Mail20Regular } from "@fluentui/react-icons";
import { Button, Card, CardHeader, Field, Input, Switch, toast } from "@/components/ui";

export const meta = { title: "Newsletter sign-up", description: "Labeled email Field with a hint, a Switch and a confirmation toast", order: 13 };

export default function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [monthly, setMonthly] = useState(true);

  return (
    <Card className="max-w-md gap-4 rounded-xlarge p-5">
      <CardHeader
        image={<Mail20Regular className="text-brand-foreground-1" />}
        header="Yugen newsletter"
        description="One email a month: new components and tips."
      />
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          toast({ intent: "success", title: "You're subscribed", body: monthly ? `We'll send the newsletter to ${email}.` : "You'll only get important updates." });
        }}
      >
        <Field label="Email" hint="We never share your email." required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Switch checked={monthly} onCheckedChange={setMonthly} label="Get the monthly newsletter" />
        <Button appearance="primary" type="submit" className="self-start">
          Subscribe
        </Button>
      </form>
    </Card>
  );
}
