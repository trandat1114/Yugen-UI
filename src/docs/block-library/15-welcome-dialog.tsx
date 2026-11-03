import { Sparkle20Regular } from "@fluentui/react-icons";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  toast,
} from "@/components/ui";

export const meta = { title: "Welcome dialog", description: "Dialog that keeps focus inside, closes with Esc and returns focus to its trigger", order: 15 };

export default function WelcomeDialogBlock() {
  return (
    <Card className="max-w-md items-start gap-3 rounded-xlarge p-5">
      <p className="text-subtitle2 font-semibold text-foreground-1">First sign-in</p>
      <p className="text-body1 text-foreground-2">A short intro before people get started. They can skip it for now.</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button icon={<Sparkle20Regular />}>Show intro</Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogTitle>Welcome!</DialogTitle>
          <DialogDescription>
            Your workspace is ready. Invite teammates, create your first project or read the guides under Help.
          </DialogDescription>
          <DialogActions>
            <DialogClose asChild>
              <Button appearance="secondary">Not now</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button appearance="primary" onClick={() => toast({ intent: "success", title: "Let's go!" })}>
                Get started
              </Button>
            </DialogClose>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </Card>
  );
}
