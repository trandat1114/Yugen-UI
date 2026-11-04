import { useState } from "react";
import { ArrowClockwise16Regular } from "@fluentui/react-icons";
// #region rhf-imports
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// #endregion
// #region rhf-controller
import { Controller } from "react-hook-form";
// #endregion
import {
  Button,
  Checkbox,
  DatePicker,
  Field,
  FileUpload,
  Input,
  Select,
  Step,
  Stepper,
  Wizard,
  type FileUploadEntry,
  type WizardStep,
} from "@/components/ui";
import type { ComponentDoc } from "../types";
import RAW from "./phase3-forms.tsx?raw";

/*
 * `code` của mỗi ví dụ được cắt từ chính file này (giữa `// #region <tên>` và `// #endregion`), nên luôn trùng
 * từng ký tự với component mà `render` hiển thị. react-hook-form / zod chỉ dùng ở trang docs — không bao giờ import
 * từ component thư viện.
 */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");

function source(...names: string[]) {
  return names
    .map((name) => {
      const start = LINES.findIndex((line) => line.trim() === `// #region ${name}`);
      const end = LINES.findIndex((line, i) => i > start && line.trim() === "// #endregion");
      if (start < 0 || end < 0) return `// Không tìm thấy mã nguồn "${name}"`;
      return LINES.slice(start + 1, end).join("\n").trim();
    })
    .join("\n\n");
}

// #region wait
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
// #endregion

/* ============================================================== FileUpload */

// #region FileUploadHero
function FileUploadHero() {
  return (
    <Field label="Attachments" hint="You can pick several files at once." className="w-full max-w-120">
      <FileUpload multiple accept=".pdf,.docx,image/*" maxSize={5 * 1024 * 1024} maxFiles={5} />
    </Field>
  );
}
// #endregion

// #region fakeUpload
/** Fake upload: +10% every 200ms; `fail` drops the connection at 60%. */
function fakeUpload(onProgress: (progress: number) => void, fail: boolean) {
  return new Promise<void>((resolve, reject) => {
    let progress = 0;
    const timer = window.setInterval(() => {
      progress = Math.min(progress + 0.1, 1);
      if (fail && progress >= 0.6) {
        window.clearInterval(timer);
        reject(new Error("Connection lost. The upload was interrupted."));
        return;
      }
      onProgress(progress);
      if (progress >= 1) {
        window.clearInterval(timer);
        resolve();
      }
    }, 200);
  });
}
// #endregion

// #region UploadProgressDemo
function UploadProgressDemo() {
  const [files, setFiles] = useState<FileUploadEntry[]>([]);
  const [failNetwork, setFailNetwork] = useState(false);

  const patch = (id: string, changes: Partial<FileUploadEntry>) =>
    setFiles((list) => list.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const start = (entry: FileUploadEntry) => {
    patch(entry.id, { status: "uploading", progress: 0, error: undefined });
    fakeUpload((progress) => patch(entry.id, { progress }), failNetwork)
      .then(() => patch(entry.id, { status: "done" }))
      .catch((error: Error) => patch(entry.id, { status: "error", error: error.message }));
  };

  return (
    <div className="flex w-full max-w-120 flex-col gap-3">
      <Checkbox label="Simulate a network error" checked={failNetwork} onCheckedChange={(checked) => setFailNetwork(checked === true)} />
      <Field label="Quarterly report" hint="Files start uploading as soon as you pick them.">
        <FileUpload
          multiple
          maxFiles={4}
          maxSize={10 * 1024 * 1024}
          files={files}
          onFilesChange={(next, { added }) => {
            setFiles(next);
            added.forEach(start);
          }}
          onRetry={start}
        />
      </Field>
    </div>
  );
}
// #endregion

// #region AvatarUploadDemo
function AvatarUploadDemo() {
  return (
    <Field label="Profile photo" className="w-full max-w-100">
      <FileUpload
        accept="image/png,image/jpeg,image/webp"
        maxSize={2 * 1024 * 1024}
        allowPaste
        label="Drag a photo here or click to browse"
        description="PNG, JPG, WEBP · up to 2 MB · paste with Ctrl + V"
      />
    </Field>
  );
}
// #endregion

// #region RequiredFileDemo
function RequiredFileDemo() {
  const [files, setFiles] = useState<FileUploadEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const missing = submitted && files.length === 0;

  return (
    <form
      noValidate
      className="flex w-full max-w-120 flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Field
        label="ID card scan"
        required
        hint="Front and back, as a PDF or images."
        validationState={missing ? "error" : "none"}
        validationMessage={missing ? "Upload at least one file." : undefined}
      >
        <FileUpload multiple maxFiles={2} accept=".pdf,image/*" files={files} onFilesChange={setFiles} />
      </Field>
      <Button type="submit" appearance="primary" className="self-start">
        Submit
      </Button>
    </form>
  );
}
// #endregion

/* ============================================================== Stepper */

// #region WizardDemo
const EMAIL = /^\S+@\S+\.\S+$/;

/** Fake API that checks whether the email is taken (1.2 seconds). */
async function checkEmail(email: string) {
  await wait(1200);
  return email === "taken@example.com" ? "This email is already registered." : true;
}

function WizardDemo() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [done, setDone] = useState(false);

  const steps: WizardStep[] = [
    {
      title: "Account",
      description: "Sign-in email",
      content: (
        <Field label="Email" required hint='Try "taken@example.com" to see a server error.'>
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
      ),
      validate: () => (EMAIL.test(email) ? checkEmail(email) : "Enter a valid email address."),
    },
    {
      title: "Profile",
      description: "Display name",
      content: (
        <Field label="Full name" required>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
      ),
      validate: () => name.trim().length >= 2 || "Enter your name (at least 2 characters).",
    },
    {
      title: "Notifications",
      optional: true,
      content: <Checkbox label="Get the monthly newsletter" checked={newsletter} onCheckedChange={(checked) => setNewsletter(checked === true)} />,
    },
    {
      title: "Confirm",
      content: (
        <p className="text-body1 text-foreground-2">
          Create the account <span className="font-semibold text-foreground-1">{email}</span> for {name}
          {newsletter ? ", with the newsletter." : ", without the newsletter."}
        </p>
      ),
    },
  ];

  if (done) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-body1 text-foreground-1">Account created for {name}.</p>
        <Button onClick={() => setDone(false)}>Start over</Button>
      </div>
    );
  }

  return <Wizard steps={steps} onFinish={() => wait(1000).then(() => setDone(true))} className="w-full max-w-160" />;
}
// #endregion

// #region HorizontalDemo
function HorizontalDemo() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex w-full flex-col gap-4">
      <Stepper activeStep={step} onStepChange={setStep} aria-label="Checkout">
        <Step title="Cart" />
        <Step title="Shipping" description="Address and time" />
        <Step title="Payment" />
        <Step title="Done" />
      </Stepper>
      <div className="flex gap-2">
        <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button appearance="primary" disabled={step === 3} onClick={() => setStep(step + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
// #endregion

// #region VerticalDemo
function VerticalDemo() {
  return (
    <Stepper orientation="vertical" activeStep={2} aria-label="Order progress" className="w-full max-w-100">
      <Step title="Order placed" description="8:12 AM · Oct 21" />
      <Step title="Payment" description="Bank transfer confirmed" />
      <Step title="Packing" status="error" description="Out of stock at the main warehouse">
        <Button size="small" icon={<ArrowClockwise16Regular />}>
          Ship from another warehouse
        </Button>
      </Step>
      <Step title="Delivery" />
    </Stepper>
  );
}
// #endregion

// #region CompactDemo
function CompactDemo() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="w-72 rounded-xlarge border border-stroke-2 p-3">
        <Stepper activeStep={step} aria-label="Loan application">
          <Step title="Personal details" />
          <Step title="Income" />
          <Step title="Collateral" />
          <Step title="Contract" />
        </Stepper>
      </div>
      <Button size="small" onClick={() => setStep((current) => (current + 1) % 4)}>
        Next step
      </Button>
    </div>
  );
}
// #endregion

/* ============================================================== react-hook-form + zod */

// #region signupSchema
const PLANS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro · $99/month" },
  { value: "team", label: "Team · $249/month" },
];

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().min(1, "Enter your email.").pipe(z.email("Enter a valid email address.")),
  password: z.string().min(8, "Password must be at least 8 characters.").regex(/\d/, "Password must include a number."),
  plan: z.string().min(1, "Choose a plan."),
  birthDate: z.date({ error: "Pick your date of birth." }),
  terms: z.boolean().refine((accepted) => accepted, "Accept the terms to continue."),
});

type SignUpValues = z.infer<typeof signUpSchema>;
// #endregion

// #region SignUpForm
function SignUpForm() {
  const [created, setCreated] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", password: "", plan: "", terms: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setCreated(null);
    await wait(1200);
    setCreated(values.email);
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex w-full max-w-120 flex-col gap-3">
      <Field label="Full name" required validationState={errors.fullName ? "error" : "none"} validationMessage={errors.fullName?.message}>
        <Input autoComplete="name" {...register("fullName")} />
      </Field>
      <Field label="Email" required validationState={errors.email ? "error" : "none"} validationMessage={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Field
        label="Password"
        required
        hint="At least 8 characters, including a number."
        validationState={errors.password ? "error" : "none"}
        validationMessage={errors.password?.message}
      >
        <Input type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Field label="Plan" required validationState={errors.plan ? "error" : "none"} validationMessage={errors.plan?.message}>
        <Select {...register("plan")}>
          <option value="">Choose a plan…</option>
          {PLANS.map((plan) => (
            <option key={plan.value} value={plan.value}>
              {plan.label}
            </option>
          ))}
        </Select>
      </Field>
      <Controller
        control={control}
        name="birthDate"
        render={({ field, fieldState }) => (
          <Field label="Date of birth" required validationState={fieldState.error ? "error" : "none"} validationMessage={fieldState.error?.message}>
            <DatePicker value={field.value ?? null} onValueChange={field.onChange} placeholder="Pick a date" />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="terms"
        render={({ field, fieldState }) => (
          <Field validationState={fieldState.error ? "error" : "none"} validationMessage={fieldState.error?.message}>
            <Checkbox
              ref={field.ref}
              label="I agree to the terms of use"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
            />
          </Field>
        )}
      />
      <Button type="submit" appearance="primary" loading={isSubmitting} className="self-start">
        Create account
      </Button>
      {created && (
        <p role="status" className="text-body1 text-success-foreground-1">
          Account created for {created}.
        </p>
      )}
    </form>
  );
}
// #endregion

// #region ServerErrorDemo
const inviteSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").pipe(z.email("Enter a valid email address.")),
});

function ServerErrorDemo() {
  const [sent, setSent] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "taken@example.com" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setSent(null);
    await wait(1200);
    if (email === "taken@example.com") {
      setError("email", { message: "This email is already a member. Use a different one." }, { shouldFocus: true });
      return;
    }
    setSent(email);
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex w-full max-w-120 flex-col gap-3">
      <Field
        label="Invitee email"
        required
        validationState={errors.email ? "error" : sent ? "success" : "none"}
        validationMessage={errors.email?.message ?? (sent ? `Invitation sent to ${sent}.` : undefined)}
      >
        <Input type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Button type="submit" appearance="primary" loading={isSubmitting} className="self-start">
        Send invitation
      </Button>
    </form>
  );
}
// #endregion

// #region WizardFormDemo
function WizardFormDemo() {
  const [finished, setFinished] = useState(false);
  const {
    register,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", password: "", plan: "", terms: false },
  });
  const [email, fullName, plan] = watch(["email", "fullName", "plan"]);

  const steps: WizardStep[] = [
    {
      title: "Sign in",
      description: "Email and password",
      // trigger() checks only this step's fields and focuses the first invalid one.
      validate: () => trigger(["email", "password"], { shouldFocus: true }),
      content: (
        <div className="flex flex-col gap-3">
          <Field label="Email" required validationState={errors.email ? "error" : "none"} validationMessage={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Password" required validationState={errors.password ? "error" : "none"} validationMessage={errors.password?.message}>
            <Input type="password" {...register("password")} />
          </Field>
        </div>
      ),
    },
    {
      title: "Profile",
      description: "Name and plan",
      validate: () => trigger(["fullName", "plan"], { shouldFocus: true }),
      content: (
        <div className="flex flex-col gap-3">
          <Field label="Full name" required validationState={errors.fullName ? "error" : "none"} validationMessage={errors.fullName?.message}>
            <Input {...register("fullName")} />
          </Field>
          <Field label="Plan" required validationState={errors.plan ? "error" : "none"} validationMessage={errors.plan?.message}>
            <Select {...register("plan")}>
              <option value="">Choose a plan…</option>
              {PLANS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ),
    },
    {
      title: "Confirm",
      content: (
        <p className="text-body1 text-foreground-2">
          {fullName} · {email} · Plan: {PLANS.find((item) => item.value === plan)?.label}
        </p>
      ),
    },
  ];

  if (finished) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-body1 text-foreground-1">Signed up as {fullName}.</p>
        <Button onClick={() => setFinished(false)}>Review</Button>
      </div>
    );
  }

  return <Wizard steps={steps} onFinish={() => setFinished(true)} className="w-full max-w-160" />;
}
// #endregion

export const docs: ComponentDoc[] = [
  {
    slug: "fileupload",
    name: "FileUpload",
    category: "Nhập liệu",
    lead: "FileUpload là vùng kéo thả kèm danh sách tệp: chọn bằng chuột, bàn phím, kéo thả hoặc dán; tự kiểm tra định dạng, dung lượng, số lượng.",
    description:
      "Dùng <input type=\"file\"> thật (ẩn trực quan) nên Tab tới được, Enter / Space mở hộp thoại chọn tệp và nhãn của Field trỏ đúng control. accept / maxSize / maxFiles / validate kiểm tra cả tệp kéo thả; tệp bị từ chối hiện thông báo tiếng Việt ngay dưới vùng thả (role=\"alert\"). Mỗi tệp là một FileUploadItem: icon theo loại hoặc ảnh thu nhỏ (URL.createObjectURL, tự thu hồi khi gỡ), tên cắt bớt kèm title, dung lượng, ProgressBar khi đang tải và nút Thử lại / Xoá. Thêm / xoá tệp được đọc qua live region polite (useAnnounce). FileUpload không tự gửi tệp — bạn tải lên trong onFilesChange và cập nhật status / progress (chế độ điều khiển).",
    importCode: `import { FileUpload, FileUploadItem, createFileEntry, isFileAccepted, type FileUploadEntry } from "@/components/ui";`,
    hero: {
      title: "Tài liệu đính kèm",
      description: "Kéo tệp vào khung, bấm để chọn hoặc Tab tới rồi nhấn Enter. Thử thả một tệp .zip hay tệp lớn hơn 5 MB.",
      code: source("FileUploadHero"),
      render: () => <FileUploadHero />,
    },
    examples: [
      {
        title: "Tải lên có tiến trình, lỗi và Thử lại",
        description: "Chế độ điều khiển: files + onFilesChange; mỗi tệp mới được tải lên ngay, cập nhật progress (0 → 1) và status. Bật “Giả lập lỗi mạng” để thấy nút Thử lại.",
        code: source("fakeUpload", "UploadProgressDemo"),
        render: () => <UploadProgressDemo />,
      },
      {
        title: "Một ảnh, có thumbnail và dán từ clipboard",
        description: "multiple mặc định false: chọn ảnh mới sẽ thay ảnh cũ. allowPaste nhận ảnh dán bằng Ctrl + V khi vùng thả đang focus.",
        code: source("AvatarUploadDemo"),
        render: () => <AvatarUploadDemo />,
      },
      {
        title: "Bắt buộc trong Field",
        description: "Field gắn nhãn, hint và validationMessage; aria-invalid làm viền vùng thả chuyển sang màu lỗi. Bấm Gửi hồ sơ khi chưa chọn tệp.",
        code: source("RequiredFileDemo"),
        render: () => <RequiredFileDemo />,
      },
    ],
    dos: [
      "Ghi rõ định dạng và dung lượng cho phép (tự sinh từ accept / maxSize hoặc qua description) trước khi người dùng chọn tệp.",
      "Hiện tiến trình cho tệp lớn và luôn có Thử lại khi tải lỗi — đừng bắt chọn lại từ đầu.",
      "Bọc trong Field để có nhãn, hint và thông báo lỗi liên kết đúng với control.",
    ],
    donts: [
      "Không chỉ dựa vào accept phía client — server vẫn phải kiểm tra loại và dung lượng tệp.",
      "Không dùng FileUpload cho một nút “Đính kèm” nhỏ trong thanh soạn tin — dùng PromptInput / Button + input ẩn.",
      "Không tự động gửi form khi vừa chọn tệp; để người dùng xem lại danh sách trước.",
    ],
    props: [
      { name: "accept", type: "string", description: "Như input gốc: \".pdf,image/*\". Áp dụng cả với tệp kéo thả / dán." },
      { name: "multiple", type: "boolean", defaultValue: "false", description: "Chọn nhiều tệp. Tắt → tệp mới thay tệp cũ." },
      { name: "maxFiles", type: "number", description: "Tổng số tệp tối đa (khi multiple). Tệp vượt bị từ chối với lý do too-many-files." },
      { name: "maxSize", type: "number", description: "Dung lượng tối đa mỗi tệp (byte)." },
      { name: "validate", type: "(file: File) => string | null | undefined", description: "Kiểm tra riêng; trả về chuỗi lỗi để từ chối." },
      { name: "files / defaultFiles", type: "FileUploadEntry[]", description: "Danh sách tệp (điều khiển / ban đầu). Entry: { id, name, size, type?, file?, previewUrl?, status?, progress?, error? }." },
      { name: "onFilesChange", type: "(files, { added, removed }) => void", description: "Gọi khi thêm / xoá tệp." },
      { name: "onReject", type: "(rejections: FileUploadRejection[]) => void", description: "Tệp bị từ chối: { file, code: file-invalid-type | file-too-large | too-many-files | custom, message }." },
      { name: "onRetry", type: "(entry: FileUploadEntry) => void", description: "Có → tệp status=\"error\" hiện nút Thử lại." },
      { name: "allowPaste", type: "boolean", defaultValue: "false", description: "Nhận tệp dán bằng Ctrl + V khi vùng thả đang focus." },
      { name: "showThumbnails", type: "boolean", defaultValue: "true", description: "Ảnh thu nhỏ cho tệp ảnh (tạo trong effect, thu hồi khi gỡ / unmount)." },
      { name: "label / description", type: "ReactNode", description: "Dòng chính / dòng phụ trong vùng thả." },
      { name: "disabled / required", type: "boolean", description: "Field tự truyền. required → aria-required (không dùng required gốc vì input được xoá giá trị sau mỗi lần chọn)." },
      { name: "ref", type: "Ref<HTMLInputElement>", description: "Trỏ tới <input type=\"file\"> — ref.current.click() mở hộp thoại, focus() cho react-hook-form." },
      { name: "FileUploadItem", type: "component (<li>)", description: "Dòng tệp dùng riêng được: name, size, type, file, previewUrl, status, progress, error, onRemove, onRetry." },
      { name: "createFileEntry / isFileAccepted", type: "(file, init?) => FileUploadEntry / (file, accept?) => boolean", description: "Tiện ích tạo entry và kiểm tra accept. Định dạng dung lượng dùng formatFileSize (dùng chung với PromptInput)." },
    ],
  },
  {
    slug: "stepper",
    name: "Stepper",
    category: "Điều hướng",
    lead: "Stepper cho biết người dùng đang ở bước nào trong một quy trình nhiều bước; Wizard ghép Stepper với nội dung từng bước và nút Quay lại / Tiếp tục.",
    description:
      "Stepper là danh sách có thứ tự (ngang hoặc dọc); bước hiện tại có aria-current=\"step\", chỉ báo số / dấu tích / dấu chấm than luôn kèm chữ ẩn (\"đã hoàn thành\", \"có lỗi\"…) nên không chỉ dựa vào màu. Trạng thái tự suy từ activeStep hoặc đặt tường minh bằng status. Có onStepChange thì các bước thành nút: một tab stop, mũi tên (đảo trong RTL) / Home / End; linear chặn nhảy tới bước chưa qua. Đường nối là phần tử flex nên tự đảo chiều trong RTL. Bản ngang thu gọn thành \"Bước 2/4 · Tên bước\" + ProgressBar khi khung chứa hẹp hơn 32rem (container query). Wizard chạy validate (đồng bộ hoặc Promise) trước khi sang bước sau; chờ quá 300ms thì nút hiện Spinner (Button loading), lỗi hiện role=\"alert\" và bước chuyển trạng thái error.",
    importCode: `import { Stepper, Step, Wizard, type WizardStep, type StepStatus } from "@/components/ui";`,
    hero: {
      title: "Wizard mở tài khoản",
      description: "Bước 1 kiểm tra định dạng ngay (đồng bộ) rồi gọi API giả lập 1,2 giây (bất đồng bộ). Thử bấm bước 4 trên Stepper — bị chặn vì linear.",
      code: source("wait", "WizardDemo"),
      render: () => <WizardDemo />,
    },
    examples: [
      {
        title: "Ngang, điều khiển, không linear",
        description: "activeStep + onStepChange: bấm bước bất kỳ hoặc dùng mũi tên rồi Enter. Thu hẹp cửa sổ để thấy bản thu gọn.",
        code: source("HorizontalDemo"),
        render: () => <HorizontalDemo />,
      },
      {
        title: "Dọc, trạng thái lỗi, nội dung trong bước",
        description: "Không có onStepChange → chỉ hiển thị. children của Step hiện thẳng cột chữ ở bản dọc.",
        code: source("VerticalDemo"),
        render: () => <VerticalDemo />,
      },
      {
        title: "Thu gọn trong khung hẹp",
        description: "Khung 288px < 32rem → \"Bước 2/4 · Thu nhập\" + ProgressBar. Tắt bằng responsive={false}.",
        code: source("CompactDemo"),
        render: () => <CompactDemo />,
      },
    ],
    dos: [
      "Giữ 3–6 bước với tiêu đề ngắn (danh từ); gộp bước nếu quy trình dài hơn.",
      "Kiểm tra từng bước bằng validate và giải thích lỗi bằng chữ — Wizard tự hiện thông báo và đánh dấu bước lỗi.",
      "Dùng linear cho quy trình mà bước sau phụ thuộc bước trước (thanh toán, mở tài khoản).",
    ],
    donts: [
      "Không dùng Stepper thay Tabs cho các phần độc lập, không có thứ tự.",
      "Không chỉ đổi màu để báo lỗi — dùng status=\"error\" (có dấu chấm than và chữ ẩn \"có lỗi\").",
      "Không xoá dữ liệu đã nhập khi người dùng Quay lại.",
    ],
    props: [
      { name: "activeStep / defaultActiveStep", type: "number / number", defaultValue: "— / 0", description: "Stepper: chỉ số bước hiện tại, từ 0 (controlled / uncontrolled)." },
      { name: "onStepChange", type: "(index: number) => void", description: "Có → các bước là nút bấm (roving focus, mũi tên / Home / End)." },
      { name: "orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "Hướng hiển thị." },
      { name: "linear", type: "boolean", defaultValue: "false (Wizard: true)", description: "Chỉ cho quay lại hoặc tới bước đã complete; bước khác có aria-disabled." },
      { name: "responsive", type: "boolean", defaultValue: "true", description: "Ngang + khung < 32rem → \"Bước n/N · Tên\" + ProgressBar." },
      { name: "Step.title / description", type: "ReactNode", description: "Tiêu đề và mô tả ngắn của bước." },
      { name: "Step.status", type: `"complete" | "current" | "upcoming" | "error"`, description: "Ghi đè trạng thái tự suy từ vị trí." },
      { name: "Step.optional / disabled", type: "boolean", description: "Hiện \"Tuỳ chọn\" / không cho chuyển tới." },
      { name: "Wizard.steps", type: "WizardStep[]", description: "{ id?, title, description?, optional?, content, validate? }." },
      { name: "WizardStep.validate", type: "() => boolean | string | void | Promise<…>", description: "false / chuỗi → chặn và báo lỗi; Promise → nút Tiếp tục loading (sau 300ms)." },
      { name: "Wizard.activeStep / defaultActiveStep / onStepChange", type: "number / number / (index) => void", description: "Điều khiển hoặc không điều khiển bước hiện tại." },
      { name: "Wizard.onFinish", type: "() => void | Promise<void>", description: "Gọi khi bước cuối qua validate; Promise → nút Hoàn tất loading." },
      { name: "Wizard.backLabel / nextLabel / finishLabel", type: "ReactNode", defaultValue: `"Back" / "Next" / "Finish"`, description: "Nhãn nút của Wizard." },
    ],
  },
  {
    slug: "formvalidation",
    name: "Form với react-hook-form + zod",
    category: "Nhập liệu",
    lead: "Ghép Field, Input, Select, Checkbox, DatePicker và Button của Yugen với react-hook-form + zod để có form kiểm tra dữ liệu đầy đủ, tiếng Việt, truy cập được.",
    description:
      "react-hook-form, zod và @hookform/resolvers là peer tuỳ chọn — Yugen không phụ thuộc vào chúng; bạn tự cài: npm i react-hook-form zod @hookform/resolvers. Input / Select nhận thẳng register(name) (ref trỏ tới phần tử gốc). Control không phải phần tử form gốc (DatePicker, Checkbox) dùng Controller. Map lỗi vào Field bằng validationState=\"error\" + validationMessage: Field tự gắn aria-invalid, aria-describedby và role=\"alert\". Đặt noValidate trên <form> để bong bóng lỗi của trình duyệt không chen vào; nút gửi dùng loading={isSubmitting}.",
    importCode: `// Tuỳ chọn — tự cài: npm i react-hook-form zod @hookform/resolvers
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Checkbox, DatePicker, Field, Input, Select } from "@/components/ui";`,
    hero: {
      title: "Form đăng ký",
      description: "Kiểm tra khi rời ô (mode \"onTouched\"), sau đó kiểm tra lại mỗi lần gõ. Bấm Tạo tài khoản khi còn trống để thấy focus nhảy tới ô lỗi đầu tiên.",
      code: source("rhf-imports", "rhf-controller", "wait", "signupSchema", "SignUpForm"),
      render: () => <SignUpForm />,
    },
    examples: [
      {
        title: "Lỗi từ server với setError",
        description: "Lỗi không đoán trước được ở client (email đã tồn tại) đặt bằng setError(..., { shouldFocus: true }) và hiện ngay trong Field.",
        code: source("rhf-imports", "wait", "ServerErrorDemo"),
        render: () => <ServerErrorDemo />,
      },
      {
        title: "Kiểm tra theo bước với Wizard",
        description: "validate của mỗi bước gọi trigger([...các trường của bước]) — trả Promise<boolean>, false thì Wizard chặn và báo lỗi.",
        code: source("rhf-imports", "signupSchema", "WizardFormDemo"),
        render: () => <WizardFormDemo />,
      },
    ],
    dos: [
      "Viết thông báo lỗi trong schema zod bằng tiếng Việt, nói rõ cách sửa (\"Mật khẩu cần ít nhất 8 ký tự.\").",
      "Dùng Controller cho DatePicker, Checkbox, Combobox… và truyền field.ref để focus được ô lỗi.",
      "Kiểm tra lại ở server; hiển thị lỗi server bằng setError trên đúng trường.",
    ],
    donts: [
      "Không import react-hook-form / zod vào component thư viện — chúng chỉ là lựa chọn ở tầng ứng dụng.",
      "Không báo lỗi khi người dùng chưa rời ô lần đầu (mode \"onChange\" từ đầu gây khó chịu).",
      "Không vô hiệu hoá nút gửi khi form chưa hợp lệ — để người dùng bấm và thấy lỗi cụ thể.",
    ],
    props: [
      { name: "register(name)", type: "react-hook-form", description: "Trải vào Input / Select / Textarea của Yugen: {...register(\"email\")}." },
      { name: "Controller", type: "react-hook-form", description: "Cho DatePicker (value + onValueChange), Checkbox / Switch (checked + onCheckedChange), Combobox…" },
      { name: "Field.validationState", type: `"none" | "error" | "warning" | "success"`, description: "\"error\" khi errors.<tên> có giá trị → aria-invalid trên control." },
      { name: "Field.validationMessage", type: "ReactNode", description: "errors.<tên>?.message — hiện với role=\"alert\" và được liên kết qua aria-describedby." },
      { name: "zodResolver(schema)", type: "@hookform/resolvers/zod", description: "Dùng schema zod làm nguồn kiểm tra; z.infer<typeof schema> cho kiểu giá trị form." },
      { name: "trigger(names, { shouldFocus })", type: "(names) => Promise<boolean>", description: "Kiểm tra một phần form — dùng làm WizardStep.validate." },
      { name: "Button.loading", type: "boolean", description: "loading={isSubmitting}: Spinner thay icon, giữ nguyên độ rộng, aria-busy." },
    ],
  },
];
