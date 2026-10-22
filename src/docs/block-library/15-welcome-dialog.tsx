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

export const meta = { title: "Hộp thoại chào mừng", description: "Dialog giữ focus bên trong, đóng bằng Esc và trả focus về nút mở", order: 15 };

export default function WelcomeDialogBlock() {
  return (
    <Card className="max-w-md items-start gap-3 rounded-xlarge p-5">
      <p className="text-subtitle2 font-semibold text-foreground-1">Lần đầu đăng nhập</p>
      <p className="text-body1 text-foreground-2">Giới thiệu ngắn trước khi người dùng bắt đầu, có thể để sau.</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button icon={<Sparkle20Regular />}>Xem giới thiệu</Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogTitle>Chào mừng bạn!</DialogTitle>
          <DialogDescription>
            Không gian làm việc đã sẵn sàng. Mời đồng đội, tạo dự án đầu tiên hoặc xem hướng dẫn trong mục Trợ giúp.
          </DialogDescription>
          <DialogActions>
            <DialogClose asChild>
              <Button appearance="secondary">Để sau</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button appearance="primary" onClick={() => toast({ intent: "success", title: "Bắt đầu thôi!" })}>
                Bắt đầu
              </Button>
            </DialogClose>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </Card>
  );
}
