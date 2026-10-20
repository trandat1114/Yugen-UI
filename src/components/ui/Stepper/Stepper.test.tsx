import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Step, Stepper, Wizard, type WizardStep } from "./Stepper";

function Basic(props: { activeStep?: number; linear?: boolean; onStepChange?: (i: number) => void; responsive?: boolean }) {
  return (
    <Stepper activeStep={1} responsive={false} {...props}>
      <Step title="Tài khoản" />
      <Step title="Hồ sơ" description="Tên, ngày sinh" />
      <Step title="Thanh toán" optional />
      <Step title="Xác nhận" />
    </Stepper>
  );
}

describe("Stepper", () => {
  it("danh sách có thứ tự, aria-current=step và chữ thay cho chỉ báo", () => {
    render(<Basic />);
    expect(screen.getByRole("list", { name: "Các bước" })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.dataset.status)).toEqual(["complete", "current", "upcoming", "upcoming"]);
    expect(items[0]).toHaveTextContent("Bước 1: Tài khoản, đã hoàn thành");
    expect(items[1]).toHaveTextContent("Bước 2: Hồ sơ, bước hiện tại");
    expect(items[2]).toHaveTextContent("Tuỳ chọn");
    expect(items[1].querySelector('[aria-current="step"]')).not.toBeNull();
  });

  it("status tường minh error ghi đè trạng thái tự động", () => {
    render(
      <Stepper activeStep={0} responsive={false}>
        <Step title="A" status="error" />
        <Step title="B" />
      </Stepper>,
    );
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Bước 1: A, có lỗi");
  });

  it("linear: chặn nhảy tới bước sau, vẫn cho quay lại", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(<Basic linear onStepChange={onStepChange} />);
    const upcoming = screen.getByRole("button", { name: /Bước 4: Xác nhận/ });
    expect(upcoming).toHaveAttribute("aria-disabled", "true");
    await user.click(upcoming);
    expect(onStepChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Bước 1: Tài khoản/ }));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it("không linear: bấm bước bất kỳ", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(<Basic onStepChange={onStepChange} />);
    await user.click(screen.getByRole("button", { name: /Bước 4/ }));
    expect(onStepChange).toHaveBeenCalledWith(3);
  });

  it("bàn phím: một tab stop, mũi tên / Home / End di chuyển focus", async () => {
    const user = userEvent.setup();
    render(<Basic onStepChange={() => {}} />);
    await user.tab();
    expect(screen.getByRole("button", { name: /Bước 2/ })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /Bước 3/ })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: /Bước 4/ })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: /Bước 1/ })).toHaveFocus();
  });

  it("RTL: ArrowLeft đi tới bước sau", async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider dir="rtl">
        <Basic onStepChange={() => {}} />
      </DirectionProvider>,
    );
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: /Bước 3/ })).toHaveFocus();
  });

  it("ngang + responsive: có bản thu gọn 'Bước 2/4 · Hồ sơ' kèm ProgressBar", () => {
    render(<Basic responsive />);
    expect(screen.getByText("Bước 2/4").parentElement).toHaveTextContent("Bước 2/4 · Hồ sơ");
    expect(screen.getByRole("progressbar", { name: "Bước 2 trên 4" })).toHaveAttribute("aria-valuenow", "2");
  });
});

describe("Wizard", () => {
  const make = (overrides: Partial<WizardStep>[] = []): WizardStep[] =>
    ["Tài khoản", "Hồ sơ", "Xác nhận"].map((title, i) => ({ title, content: <p>Nội dung {title}</p>, ...overrides[i] }));

  it("validate đồng bộ trả chuỗi → chặn, báo lỗi role=alert, bước chuyển error", async () => {
    const user = userEvent.setup();
    render(<Wizard steps={make([{ validate: () => "Email không hợp lệ" }])} />);
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Email không hợp lệ");
    expect(screen.getByText("Nội dung Tài khoản")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("data-status", "error");
  });

  it("validate bất đồng bộ → sau 300ms nút Tiếp tục loading (aria-busy), xong thì sang bước sau và focus vùng nội dung", async () => {
    const user = userEvent.setup();
    let resolve!: (v: boolean) => void;
    const validate = vi.fn(() => new Promise<boolean>((r) => (resolve = r)));
    render(<Wizard steps={make([{ validate }])} />);
    const next = screen.getByRole("button", { name: "Tiếp tục" });
    await user.click(next);
    await waitFor(() => expect(next).toHaveAttribute("aria-busy", "true"));
    expect(screen.getByRole("button", { name: "Quay lại" })).toBeDisabled();
    await user.click(next);
    expect(validate).toHaveBeenCalledTimes(1);
    resolve(true);
    expect(await screen.findByText("Nội dung Hồ sơ")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Bước 2/3: Hồ sơ" })).toHaveFocus();
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("data-status", "complete");
  });

  it("linear: không bấm nhảy tới bước chưa qua; Quay lại không cần validate; Hoàn tất gọi onFinish", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Wizard steps={make()} onFinish={onFinish} />);
    await user.click(screen.getByRole("button", { name: /Bước 3: Xác nhận/ }));
    expect(screen.getByText("Nội dung Tài khoản")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await user.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(screen.getByText("Nội dung Tài khoản")).toBeInTheDocument();
    // Bước 1 đã hoàn thành → bấm được trên Stepper; bước 2 chưa qua validate nên vẫn bị chặn.
    expect(screen.getByRole("button", { name: /Bước 2: Hồ sơ/ })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await user.click(screen.getByRole("button", { name: /Bước 1: Tài khoản, đã hoàn thành/ }));
    expect(screen.getByText("Nội dung Tài khoản")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await user.click(screen.getByRole("button", { name: "Hoàn tất" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
