import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/phase3-forms.tsx.
export const en: Record<string, ComponentDocEn> = {
  fileupload: {
    description:
      'Uses a real <input type="file"> (visually hidden), so it is reachable with Tab, Enter / Space opens the file dialog, and the Field label points to the right control. accept / maxSize / maxFiles / validate also check dropped files; rejected files get a message (in Vietnamese) right below the drop zone (role="alert"). Each file is a FileUploadItem: a type icon or a thumbnail (URL.createObjectURL, revoked on removal), the name truncated with a title, the size, a ProgressBar while uploading, and Retry / Remove buttons. Added and removed files are announced through a polite live region (useAnnounce). FileUpload doesn\'t send files itself: upload them in onFilesChange and update status / progress (controlled mode).',
    examples: [
      {
        title: "Upload with progress, errors and Retry",
        description:
          "Controlled mode: files + onFilesChange. Each new file is uploaded right away, updating progress (0 → 1) and status. Turn on “Giả lập lỗi mạng” (simulate a network error) to see the Retry button.",
      },
      {
        title: "Single image with thumbnail and clipboard paste",
        description:
          "multiple defaults to false: picking a new image replaces the old one. allowPaste accepts images pasted with Ctrl + V while the drop zone has focus.",
      },
      {
        title: "Required inside a Field",
        description:
          "Field provides the label, hint and validationMessage; aria-invalid switches the drop zone border to the error color. Click “Gửi hồ sơ” (submit) without picking a file.",
      },
    ],
    dos: [
      "State the allowed formats and size before people pick files (generated from accept / maxSize, or set through description).",
      "Show progress for large files and always offer Retry when an upload fails, so people don't have to start over.",
      "Wrap it in a Field so the label, hint and error message are linked to the control.",
    ],
    donts: [
      "Don't rely on accept on the client alone. The server still has to check file type and size.",
      "Don't use FileUpload for a small “Attach” button in a message composer. Use PromptInput, or a Button with a hidden input.",
      "Don't submit the form as soon as files are picked; let people review the list first.",
    ],
    props: {
      accept:
        'Same as the native input: ".pdf,image/*". Also applies to dropped and pasted files.',
      multiple:
        "Allows several files. When off, a new file replaces the old one.",
      maxFiles:
        "Maximum total number of files (with multiple). Extra files are rejected with the too-many-files reason.",
      maxSize: "Maximum size per file (bytes).",
      validate: "Custom check; return an error string to reject the file.",
      "files / defaultFiles":
        "File list (controlled / initial). Entry: { id, name, size, type?, file?, previewUrl?, status?, progress?, error? }.",
      onFilesChange: "Called when files are added or removed.",
      onReject:
        "Rejected files: { file, code: file-invalid-type | file-too-large | too-many-files | custom, message }.",
      onRetry: 'When set, files with status="error" show a Retry button.',
      allowPaste:
        "Accepts files pasted with Ctrl + V while the drop zone has focus.",
      showThumbnails:
        "Thumbnails for image files (created in an effect, revoked on removal or unmount).",
      "label / description": "Main line / secondary line in the drop zone.",
      "disabled / required":
        "Passed by Field. required sets aria-required (the native required isn't used because the input value is cleared after each pick).",
      ref: 'Points to the <input type="file">: ref.current.click() opens the dialog, and focus() works with react-hook-form.',
      FileUploadItem:
        "File row you can use on its own: name, size, type, file, previewUrl, status, progress, error, onRemove, onRetry.",
      "createFileEntry / isFileAccepted":
        "Helpers to create an entry and to check accept. Sizes are formatted with formatFileSize (shared with PromptInput).",
    },
  },

  stepper: {
    description:
      'Stepper is an ordered list (horizontal or vertical). The current step has aria-current="step", and the number / check mark / exclamation mark indicator always comes with hidden text (“đã hoàn thành” for completed, “có lỗi” for an error…), so the state doesn\'t rely on color. States are derived from activeStep or set explicitly with status. With onStepChange the steps become buttons with a single tab stop, arrow keys (reversed in RTL) and Home / End; linear blocks jumping to steps not yet reached. The connector is a flex element, so it reverses in RTL. The horizontal version collapses to “Bước 2/4 · Tên bước” (Step 2/4 · step title) plus a ProgressBar when its container is narrower than 32rem (container query). Wizard runs validate (sync or a Promise) before moving to the next step. If that takes longer than 300ms the button shows a Spinner (Button loading); errors show with role="alert" and the step switches to the error state.',
    examples: [
      {
        title: "Horizontal, controlled, non-linear",
        description:
          "activeStep + onStepChange: click any step, or use the arrow keys and then Enter. Narrow the window to see the collapsed version.",
      },
      {
        title: "Vertical, error state, content inside a step",
        description:
          "No onStepChange, so it is display only. In the vertical version, a Step's children appear in line with its text.",
      },
      {
        title: "Collapsed in a narrow container",
        description:
          "The 288px container is narrower than 32rem, so it shows “Bước 2/4 · Thu nhập” (Step 2/4 · Income) plus a ProgressBar. Turn this off with responsive={false}.",
      },
    ],
    dos: [
      "Keep to 3–6 steps with short titles (nouns); merge steps if the process is longer.",
      "Check each step with validate and explain errors in text. Wizard shows the message and marks the step as failed.",
      "Use linear when each step depends on the previous one (checkout, opening an account).",
    ],
    donts: [
      "Don't use Stepper in place of Tabs for independent sections with no order.",
      'Don\'t signal errors with color alone. Use status="error", which adds an exclamation mark and the hidden text “có lỗi” (has an error).',
      "Don't clear entered data when people go back.",
    ],
    props: {
      activeStep: "Stepper: index of the current step (from 0).",
      onStepChange:
        "When set, the steps are buttons (roving focus, arrow keys / Home / End).",
      orientation: "Display direction.",
      linear:
        "Only allows going back or to completed steps; other steps get aria-disabled.",
      responsive:
        "Horizontal + container < 32rem → “Bước n/N · Tên” (Step n/N · title) plus a ProgressBar.",
      "Step.title / description": "Step title and short description.",
      "Step.status": "Overrides the state derived from the step's position.",
      "Step.optional / disabled":
        "Shows “Tuỳ chọn” (Optional) / prevents moving to the step.",
      "Wizard.steps":
        "{ id?, title, description?, optional?, content, validate? }.",
      "WizardStep.validate":
        "false or a string blocks the step and shows an error; a Promise puts the Next button in loading (after 300ms).",
      "Wizard.activeStep / defaultActiveStep / onStepChange":
        "Current step, controlled or uncontrolled.",
      "Wizard.onFinish":
        "Called when the last step passes validate; a Promise puts the Finish button in loading.",
      "Wizard.backLabel / nextLabel / finishLabel": "Wizard button labels.",
    },
    defaults: {
      "Wizard.backLabel / nextLabel / finishLabel":
        "“Quay lại” / “Tiếp tục” / “Hoàn tất” (Back / Next / Finish)",
    },
  },

  formvalidation: {
    description:
      "react-hook-form, zod and @hookform/resolvers are optional peers. Yugen doesn't depend on them; install them yourself with npm i react-hook-form zod @hookform/resolvers. Input / Select take register(name) directly (the ref points to the native element). Controls that aren't native form elements (DatePicker, Checkbox) use Controller. Map errors to Field with validationState=\"error\" + validationMessage, and Field sets aria-invalid, aria-describedby and role=\"alert\". Put noValidate on the <form> so the browser's own error bubbles don't get in the way; the submit button uses loading={isSubmitting}.",
    examples: [
      {
        title: "Server errors with setError",
        description:
          "Errors the client can't predict (the email already exists) are set with setError(..., { shouldFocus: true }) and show up in the Field right away.",
      },
      {
        title: "Step-by-step validation with Wizard",
        description:
          "Each step's validate calls trigger([...the step's fields]), which returns Promise<boolean>. On false, Wizard blocks the step and shows the error.",
      },
    ],
    dos: [
      "Write the error messages in the zod schema in your users' language and say how to fix the problem (“Password must be at least 8 characters.”).",
      "Use Controller for DatePicker, Checkbox, Combobox… and pass field.ref so the invalid field can receive focus.",
      "Validate again on the server, and show server errors with setError on the right field.",
    ],
    donts: [
      "Don't import react-hook-form / zod into library components. They are a choice made at the app level.",
      'Don\'t show errors before people leave a field for the first time (mode "onChange" from the start is annoying).',
      "Don't disable the submit button while the form is invalid. Let people click it and see the specific errors.",
    ],
    props: {
      "register(name)":
        'Spread onto Yugen\'s Input / Select / Textarea: {...register("email")}.',
      Controller:
        "For DatePicker (value + onSelectDate), Checkbox / Switch (checked + onCheckedChange), Combobox…",
      "Field.validationState":
        '"error" when errors.<name> is set, which puts aria-invalid on the control.',
      "Field.validationMessage":
        'errors.<name>?.message, shown with role="alert" and linked through aria-describedby.',
      "zodResolver(schema)":
        "Uses the zod schema for validation; z.infer<typeof schema> gives the form value type.",
      "trigger(names, { shouldFocus })":
        "Validates part of the form. Use it as WizardStep.validate.",
      "Button.loading":
        "loading={isSubmitting}: a Spinner replaces the icon, the width stays the same, and aria-busy is set.",
    },
  },
};
