import * as React from "react";
import { Button, Field, InputOTP, Link as TextLink, MessageBar, toast } from "yugen-ui";
import { DEMO_ACCOUNT } from "../api";
import { useAuth } from "../auth";
import { useAdmin } from "../context";
import { Link, parseLocation, useRouter } from "../router";
import { AuthCard } from "../ui";

const LENGTH = DEMO_ACCOUNT.code.length;

/** Step 2 of signing in: the one-time code. Success opens `next`, or the customers. */
export default function VerifyPage({ next }: { next?: string }) {
  const { t } = useAdmin();
  const { pendingEmail, verify } = useAuth();
  const { navigate } = useRouter();
  const v = t.verify;
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (value = code) => {
    if (busy) return;
    if (value.length < LENGTH) {
      setError(v.incomplete(LENGTH));
      return;
    }
    if (!pendingEmail) {
      setError(v.expired);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verify(value);
      navigate(next ? parseLocation(next) : { name: "customers" }, { replace: true });
    } catch {
      setBusy(false);
      setCode("");
      setError(v.wrong);
    }
  };

  // The mock code never changes; with a real back end, ask it for a new code here.
  const resend = () => toast({ intent: "success", title: v.resent });

  return (
    <AuthCard title={v.title} lead={pendingEmail ? v.lead(pendingEmail) : v.leadNoEmail}>
      <MessageBar title={v.demoTitle}>
        <strong className="font-mono font-semibold tracking-widest">{DEMO_ACCOUNT.code}</strong>
      </MessageBar>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field label={v.code} validationState={error ? "error" : "none"} validationMessage={error ?? undefined}>
          <InputOTP length={LENGTH} value={code} onValueChange={setCode} onComplete={(value) => void submit(value)} disabled={busy} />
        </Field>
        {error === v.expired && (
          <TextLink asChild className="self-start text-body1">
            <Link to={{ name: "signIn", next }}>{v.signInAgain}</Link>
          </TextLink>
        )}
        <Button type="submit" appearance="primary" loading={busy}>
          {v.submit}
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button appearance="subtle" onClick={resend} disabled={!pendingEmail}>
            {v.resend}
          </Button>
          <TextLink asChild className="text-body1">
            <Link to={{ name: "signIn", next }}>{v.otherAccount}</Link>
          </TextLink>
        </div>
      </form>
    </AuthCard>
  );
}
