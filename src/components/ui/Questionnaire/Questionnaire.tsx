/** Yugen Labs · Questionnaire — khảo sát / form nhiều bước kiểu Typeform, sinh từ cấu hình `questions`. */
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  Checkmark12Filled,
  CheckmarkCircle48Regular,
  Edit16Regular,
  ErrorCircle12Filled,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Button } from "../Button/Button";
import { Field, type FieldControlProps } from "../Field/Field";
import { Input } from "../Input/Input";
import { Kbd } from "../Kbd/Kbd";
import { Slide } from "../Motion/Motion";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { Rating } from "../Rating/Rating";
import { Spinner } from "../Spinner/Spinner";
import { Textarea } from "../Textarea/Textarea";
import { useYugenMessages } from "../YugenProvider/context";
import { questionnaireMessages, type QuestionnaireMessages } from "./messages";

export { questionnaireMessages, questionnaireMessagesEn, type QuestionnaireMessages } from "./messages";

/* ================================================================ Kiểu cấu hình */

export type QuestionType = "single" | "multiple" | "rating" | "scale" | "text" | "longText" | "yesNo";
export type AnswerValue = string | string[] | number | boolean;
export type QuestionnaireAnswers = Record<string, AnswerValue | undefined>;

export interface QuestionOption {
  value: string;
  label: string;
  description?: React.ReactNode;
}

interface QuestionBase<V> {
  id: string;
  /** Câu hỏi (chuỗi — dùng cho trang xem lại và trình đọc màn hình). */
  title: string;
  description?: React.ReactNode;
  required?: boolean;
  /** Kiểm tra tuỳ chỉnh: trả về thông báo lỗi, hoặc null/undefined khi hợp lệ. Chỉ chạy khi đã có câu trả lời. */
  validate?: (value: V, answers: QuestionnaireAnswers) => string | null | undefined;
}

export interface SingleQuestion extends QuestionBase<string> {
  type: "single";
  options: QuestionOption[];
}
export interface MultipleQuestion extends QuestionBase<string[]> {
  type: "multiple";
  options: QuestionOption[];
  min?: number;
  max?: number;
}
export interface RatingQuestion extends QuestionBase<number> {
  type: "rating";
  /** Số sao, mặc định 5. */
  max?: number;
}
export interface ScaleQuestion extends QuestionBase<number> {
  type: "scale";
  /** Mặc định 0–10 (NPS). */
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}
export interface TextQuestion extends QuestionBase<string> {
  type: "text";
  placeholder?: string;
  inputType?: "text" | "email" | "url" | "tel";
  maxLength?: number;
}
export interface LongTextQuestion extends QuestionBase<string> {
  type: "longText";
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}
export interface YesNoQuestion extends QuestionBase<boolean> {
  type: "yesNo";
  yesLabel?: string;
  noLabel?: string;
}

export type Question =
  | SingleQuestion
  | MultipleQuestion
  | RatingQuestion
  | ScaleQuestion
  | TextQuestion
  | LongTextQuestion
  | YesNoQuestion;

/* ================================================================ Tiện ích */

function isEmpty(value: AnswerValue | undefined) {
  return (
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Kiểm tra một câu hỏi; trả về thông báo lỗi (theo `messages`, mặc định tiếng Việt) hoặc undefined. */
export function validateQuestion(
  question: Question,
  answers: QuestionnaireAnswers,
  messages: QuestionnaireMessages = questionnaireMessages,
): string | undefined {
  const value = answers[question.id];
  if (isEmpty(value)) {
    if (!question.required) return undefined;
    if (question.type === "text" || question.type === "longText") return messages.requiredText;
    if (question.type === "rating" || question.type === "scale") return messages.requiredScore;
    return messages.requiredChoice;
  }
  if (question.type === "multiple" && Array.isArray(value)) {
    if (question.min !== undefined && value.length < question.min) return messages.minSelected(question.min);
    if (question.max !== undefined && value.length > question.max) return messages.maxSelected(question.max);
  }
  const validate = question.validate as ((v: AnswerValue, a: QuestionnaireAnswers) => string | null | undefined) | undefined;
  return validate?.(value as AnswerValue, answers) ?? undefined;
}

/** Chuỗi hiển thị cho câu trả lời (trang xem lại); chữ có sẵn theo `messages`, mặc định tiếng Việt. */
export function formatQuestionAnswer(
  question: Question,
  value: AnswerValue | undefined,
  messages: QuestionnaireMessages = questionnaireMessages,
): string {
  if (isEmpty(value)) return messages.unanswered;
  switch (question.type) {
    case "single":
      return question.options.find((o) => o.value === value)?.label ?? String(value);
    case "multiple":
      return (value as string[]).map((v) => question.options.find((o) => o.value === v)?.label ?? v).join(", ");
    case "rating":
      return messages.ratingAnswer(value as number, question.max ?? 5);
    case "scale":
      return `${value}/${question.max ?? 10}`;
    case "yesNo":
      return value ? (question.yesLabel ?? messages.yes) : (question.noLabel ?? messages.no);
    default:
      return String(value);
  }
}

/* ================================================================ Control cho từng loại câu hỏi */

const choiceCardClass = cn(
  "group/choice flex w-full cursor-pointer items-center gap-3 rounded-large border border-stroke-1 bg-background-1 px-3 py-2 text-start text-foreground-1",
  "transition-colors duration-faster ease-easy-ease",
  "hover:border-stroke-1-hover hover:bg-background-1-hover active:bg-background-1-pressed",
  "data-[state=checked]:border-brand-stroke data-[state=checked]:bg-brand-background-2 data-[state=checked]:hover:bg-brand-background-2-hover",
  "disabled:cursor-not-allowed disabled:border-stroke-disabled disabled:bg-background-disabled disabled:text-foreground-disabled",
);

function KeyHint({ children, show }: { children: React.ReactNode; show: boolean }) {
  if (!show) return null;
  return (
    <Kbd
      size="small"
      aria-hidden
      className="group-data-[state=checked]/choice:border-brand-stroke group-data-[state=checked]/choice:text-brand-foreground-1"
    >
      {children}
    </Kbd>
  );
}

function OptionText({ option }: { option: QuestionOption }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-body1">{option.label}</span>
      {option.description && <span className="block text-caption1 text-foreground-3">{option.description}</span>}
    </span>
  );
}

function RadioDot() {
  return (
    <span
      aria-hidden
      className="flex size-4 shrink-0 items-center justify-center rounded-circular border border-stroke-accessible group-data-[state=checked]/choice:border-brand-stroke"
    >
      <span className="size-2.5 scale-0 rounded-circular bg-brand-stroke transition-transform duration-faster ease-easy-ease group-data-[state=checked]/choice:scale-100 motion-reduce:transition-none" />
    </span>
  );
}

function CheckBox() {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-small border border-stroke-accessible text-foreground-on-brand",
        "group-data-[state=checked]/choice:border-brand-background group-data-[state=checked]/choice:bg-brand-background",
      )}
    >
      <Checkmark12Filled className="hidden size-3 group-data-[state=checked]/choice:block" />
    </span>
  );
}

interface QuestionControlProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue | undefined) => void;
  controlProps: FieldControlProps;
  /** Hiện gợi ý phím số (chế độ stepper). */
  showKeys: boolean;
}

function QuestionControl({ question: q, value, onChange, controlProps, showKeys }: QuestionControlProps) {
  const msg = useYugenMessages("questionnaire", questionnaireMessages);
  const invalid = controlProps["aria-invalid"] === true;
  const aria = {
    id: controlProps.id,
    "aria-labelledby": controlProps["aria-labelledby"],
    "aria-describedby": controlProps["aria-describedby"],
    "aria-invalid": invalid || undefined,
    "aria-required": q.required || undefined,
  };

  switch (q.type) {
    case "single":
      return (
        <RadioGroup {...aria} value={typeof value === "string" ? value : ""} onValueChange={onChange} className="w-full items-stretch gap-2">
          {q.options.map((option, i) => (
            <RadioGroupPrimitive.Item
              key={option.value}
              value={option.value}
              aria-keyshortcuts={showKeys && i < 9 ? String(i + 1) : undefined}
              className={choiceCardClass}
            >
              <KeyHint show={showKeys && i < 9}>{i + 1}</KeyHint>
              <OptionText option={option} />
              <RadioDot />
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroup>
      );

    case "multiple": {
      const selected = Array.isArray(value) ? value : [];
      const atMax = q.max !== undefined && selected.length >= q.max;
      return (
        <div role="group" {...aria} className="flex w-full flex-col gap-2">
          {q.options.map((option, i) => {
            const checked = selected.includes(option.value);
            return (
              <CheckboxPrimitive.Root
                key={option.value}
                checked={checked}
                disabled={atMax && !checked}
                aria-keyshortcuts={showKeys && i < 9 ? String(i + 1) : undefined}
                onCheckedChange={(next) =>
                  onChange(
                    next === true
                      ? [...selected, option.value]
                      : selected.filter((v) => v !== option.value),
                  )
                }
                className={choiceCardClass}
              >
                <KeyHint show={showKeys && i < 9}>{i + 1}</KeyHint>
                <OptionText option={option} />
                <CheckBox />
              </CheckboxPrimitive.Root>
            );
          })}
          {q.max !== undefined && (
            <span className="text-caption1 text-foreground-3">
              {msg.selectedCount(selected.length, q.max)}
            </span>
          )}
        </div>
      );
    }

    case "rating":
      return (
        <Rating
          {...aria}
          value={typeof value === "number" ? value : 0}
          onValueChange={onChange}
          max={q.max ?? 5}
          color="marigold"
          size="extra-large"
        />
      );

    case "scale": {
      const min = q.min ?? 0;
      const max = q.max ?? 10;
      const range = Array.from({ length: max - min + 1 }, (_, k) => min + k);
      return (
        <div className="flex w-full flex-col gap-1">
          <RadioGroup
            {...aria}
            layout="horizontal"
            value={typeof value === "number" ? String(value) : ""}
            onValueChange={(v) => onChange(Number(v))}
            className="w-full flex-nowrap gap-0.5"
          >
            {range.map((n) => (
              <RadioGroupPrimitive.Item
                key={n}
                value={String(n)}
                aria-label={n === min && q.minLabel ? `${n}, ${q.minLabel}` : n === max && q.maxLabel ? `${n}, ${q.maxLabel}` : String(n)}
                className={cn(
                  "flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-medium border border-stroke-1 bg-background-1",
                  "text-body1 font-semibold text-foreground-1 tabular-nums transition-colors duration-faster ease-easy-ease",
                  "hover:border-stroke-1-hover hover:bg-background-1-hover active:bg-background-1-pressed",
                  "data-[state=checked]:border-brand-background data-[state=checked]:bg-brand-background data-[state=checked]:text-foreground-on-brand",
                )}
              >
                {n}
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroup>
          {(q.minLabel || q.maxLabel) && (
            <div aria-hidden className="flex justify-between gap-3 text-caption1 text-foreground-3">
              <span>{q.minLabel}</span>
              <span className="text-end">{q.maxLabel}</span>
            </div>
          )}
        </div>
      );
    }

    case "text":
      return (
        <Input
          {...aria}
          type={q.inputType ?? "text"}
          size="large"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder}
          maxLength={q.maxLength}
          validationState={invalid ? "error" : "none"}
        />
      );

    case "longText": {
      const text = typeof value === "string" ? value : "";
      return (
        <div className="flex w-full flex-col gap-0.5">
          <Textarea
            {...aria}
            className="w-full"
            value={text}
            rows={q.rows ?? 4}
            maxLength={q.maxLength}
            placeholder={q.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          {q.maxLength !== undefined && (
            <span className="self-end text-caption1 text-foreground-3 tabular-nums">
              {text.length}/{q.maxLength}
            </span>
          )}
        </div>
      );
    }

    case "yesNo": {
      const options = [
        { value: "yes", label: q.yesLabel ?? msg.yes, key: "Y" },
        { value: "no", label: q.noLabel ?? msg.no, key: "N" },
      ];
      return (
        <RadioGroup
          {...aria}
          layout="horizontal"
          value={value === true ? "yes" : value === false ? "no" : ""}
          onValueChange={(v) => onChange(v === "yes")}
          className="grid w-full grid-cols-2 gap-2"
        >
          {options.map((option) => (
            <RadioGroupPrimitive.Item
              key={option.value}
              value={option.value}
              aria-keyshortcuts={showKeys ? option.key : undefined}
              className={choiceCardClass}
            >
              <KeyHint show={showKeys}>{option.key}</KeyHint>
              <span className="min-w-0 flex-1 text-body1">{option.label}</span>
              <RadioDot />
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroup>
      );
    }
  }
}

/* ================================================================ Questionnaire */

/** Thứ tự ưu tiên khi đưa focus vào một câu hỏi (bỏ qua input ẩn của Radix trong form). */
const FOCUS_ORDER = [
  "[role=radio][data-state=checked]",
  "input[type=radio]:checked:not([aria-hidden])",
  "input:not([type=hidden]):not([aria-hidden])",
  "textarea",
  "[role=radio]",
  "[role=checkbox]:not(:disabled)",
];

export interface QuestionnaireProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onSubmit" | "defaultValue" | "title"> {
  questions: Question[];
  /** stepper: mỗi màn một câu (mặc định) · list: tất cả trên một trang. */
  mode?: "stepper" | "list";
  value?: QuestionnaireAnswers;
  defaultValue?: QuestionnaireAnswers;
  onChange?: (answers: QuestionnaireAnswers, questionId: string) => void;
  /** Gọi khi mọi câu hợp lệ; trả về Promise để nút Gửi hiện trạng thái đang gửi. */
  onSubmit?: (answers: QuestionnaireAnswers) => void | Promise<void>;
  /** Thêm bước xem lại trước khi gửi. Mặc định true. */
  review?: boolean;
  /** Màn hình hoàn tất (thay mặc định). */
  completion?: React.ReactNode | ((answers: QuestionnaireAnswers, restart: () => void) => React.ReactNode);
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Mặc định lấy từ `messages.questionnaire.submit`. */
  submitLabel?: string;
  /** outline: khung viền (mặc định) · subtle: không khung. */
  appearance?: "outline" | "subtle";
}

type Phase = "form" | "review" | "done";

export const Questionnaire = React.forwardRef<HTMLDivElement, QuestionnaireProps>(
  (
    {
      questions,
      mode = "stepper",
      value,
      defaultValue,
      onChange,
      onSubmit,
      review = true,
      completion,
      title,
      description,
      submitLabel: submitLabelProp,
      appearance = "outline",
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("questionnaire", questionnaireMessages);
    const submitLabel = submitLabelProp ?? msg.submit;
    const uid = React.useId();
    const [inner, setInner] = React.useState<QuestionnaireAnswers>(defaultValue ?? {});
    const answers = value ?? inner;
    const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});
    const [phase, setPhase] = React.useState<Phase>("form");
    const [index, setIndex] = React.useState(0);
    const [direction, setDirection] = React.useState<"forward" | "back">("forward");
    const [submitting, setSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    /** Sau khi đổi màn do người dùng: đưa focus vào câu hỏi mới (id câu hoặc "review" / "done"). */
    const pendingFocus = React.useRef<string | null>(null);
    const [focusTick, setFocusTick] = React.useState(0);
    const requestFocus = (target: string | null) => {
      pendingFocus.current = target;
      setFocusTick((t) => t + 1);
    };

    const stepper = mode === "stepper";
    const total = questions.length;
    const current = questions[Math.min(index, total - 1)];

    const setAnswer = (id: string, next: AnswerValue | undefined) => {
      const updated = { ...answers, [id]: next };
      if (value === undefined) setInner(updated);
      onChange?.(updated, id);
      // Đã báo lỗi thì kiểm tra lại ngay khi người dùng sửa.
      if (errors[id]) {
        const q = questions.find((x) => x.id === id);
        if (q) setErrors((prev) => ({ ...prev, [id]: validateQuestion(q, updated, msg) }));
      }
    };

    /** Focus control của một câu hỏi (ưu tiên đáp án đang chọn). */
    const focusQuestion = React.useCallback(
      (id: string) => {
        const root = contentRef.current;
        if (!root) return;
        const scope = root.querySelector<HTMLElement>(`[data-question-id="${id}"]`) ?? root;
        for (const selector of FOCUS_ORDER) {
          const el = scope.querySelector<HTMLElement>(selector);
          if (el) {
            el.focus({ preventScroll: stepper });
            break;
          }
        }
        if (!stepper) scope.scrollIntoView({ behavior: "smooth", block: "center" });
      },
      [stepper],
    );

    React.useEffect(() => {
      const target = pendingFocus.current;
      if (!target) return;
      pendingFocus.current = null;
      if (target === "review" || target === "done") {
        contentRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: !stepper });
        return;
      }
      focusQuestion(target);
    }, [focusTick, stepper, focusQuestion]);

    const go = (nextIndex: number, dir: "forward" | "back") => {
      setDirection(dir);
      setIndex(nextIndex);
      setPhase("form");
      requestFocus(questions[nextIndex]?.id ?? null);
    };

    const validateAll = () => {
      const all: Record<string, string | undefined> = {};
      questions.forEach((q) => (all[q.id] = validateQuestion(q, answers, msg)));
      setErrors(all);
      return questions.findIndex((q) => all[q.id]);
    };

    const submit = async () => {
      if (submitting) return;
      const firstInvalid = validateAll();
      if (firstInvalid !== -1) {
        go(firstInvalid, "back");
        return;
      }
      setSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmit?.(answers);
        setPhase("done");
        requestFocus("done");
      } catch {
        setSubmitError(msg.submitError);
      } finally {
        setSubmitting(false);
      }
    };

    const toReview = () => {
      const firstInvalid = validateAll();
      if (firstInvalid !== -1) {
        go(firstInvalid, "back");
        return;
      }
      setDirection("forward");
      setPhase("review");
      requestFocus("review");
    };

    const next = () => {
      if (!current) return;
      const error = validateQuestion(current, answers, msg);
      setErrors((prev) => ({ ...prev, [current.id]: error }));
      if (error) {
        focusQuestion(current.id);
        return;
      }
      if (index < total - 1) go(index + 1, "forward");
      else if (review) toReview();
      else void submit();
    };

    const back = () => {
      if (phase === "review") go(stepper ? total - 1 : 0, "back");
      else if (index > 0) go(index - 1, "back");
    };

    const restart = () => {
      if (value === undefined) setInner(defaultValue ?? {});
      setErrors({});
      setSubmitError(null);
      go(0, "back");
    };

    /* ---------- Bàn phím (stepper): Enter tiếp tục, phím số chọn đáp án ---------- */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (!stepper || phase !== "form" || !current || e.altKey || e.nativeEvent.isComposing) return;
      const t = e.target as HTMLElement;
      const isTextEntry =
        t.tagName === "TEXTAREA" ||
        t.isContentEditable ||
        (t.tagName === "INPUT" && !["radio", "checkbox"].includes((t as HTMLInputElement).type));

      if (e.key === "Enter" && !e.shiftKey) {
        if (t.tagName === "TEXTAREA" && !(e.ctrlKey || e.metaKey)) return;
        if ((t.tagName === "BUTTON" && !t.getAttribute("role")) || t.tagName === "A") return;
        e.preventDefault();
        next();
        return;
      }
      if (isTextEntry || e.ctrlKey || e.metaKey) return;

      const key = e.key.toLowerCase();
      const digit = /^[0-9]$/.test(key) ? Number(key) : null;
      let handled = false;
      if ((current.type === "single" || current.type === "multiple") && digit !== null && digit >= 1) {
        const option = current.options[digit - 1];
        if (option) {
          handled = true;
          if (current.type === "single") setAnswer(current.id, option.value);
          else {
            const selected = Array.isArray(answers[current.id]) ? (answers[current.id] as string[]) : [];
            const has = selected.includes(option.value);
            if (has) setAnswer(current.id, selected.filter((v) => v !== option.value));
            else if (current.max === undefined || selected.length < current.max) setAnswer(current.id, [...selected, option.value]);
          }
        }
      } else if (current.type === "yesNo") {
        // Y / C (Có) / 1 → có · N / K (Không) / 2 → không.
        const yes = key === "y" || key === "c" || digit === 1;
        const no = key === "n" || key === "k" || digit === 2;
        if (yes || no) {
          handled = true;
          setAnswer(current.id, yes);
        }
      } else if (current.type === "rating" && digit !== null && digit >= 1 && digit <= (current.max ?? 5)) {
        handled = true;
        setAnswer(current.id, digit);
      } else if (current.type === "scale" && digit !== null && digit >= (current.min ?? 0) && digit <= (current.max ?? 10)) {
        handled = true;
        setAnswer(current.id, digit);
      }
      if (handled) e.preventDefault();
    };

    /* ---------- Các phần hiển thị ---------- */

    const header = (title || description) && (
      <div>
        {title && <h2 className="font-display text-subtitle1 font-semibold text-foreground-1">{title}</h2>}
        {description && <p className="mt-0.5 text-body1 text-foreground-2">{description}</p>}
      </div>
    );

    const renderStepperQuestion = (q: Question, i: number) => {
      const labelId = `${uid}-${q.id}-label`;
      const descId = `${uid}-${q.id}-desc`;
      const errId = `${uid}-${q.id}-error`;
      const error = errors[q.id];
      const keyHint =
        q.type === "single" || q.type === "multiple"
          ? msg.keyHintChoice(Math.min(q.options.length, 9))
          : q.type === "yesNo"
            ? msg.keyHintYesNo
            : q.type === "rating"
              ? msg.keyHintRating(q.max ?? 5)
              : q.type === "scale"
                ? msg.keyHintScale
                : null;
      return (
        <div data-question-id={q.id} className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <span aria-hidden className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 text-body1 font-semibold text-brand-foreground-1 tabular-nums">
              {i + 1}
              <ArrowRight20Regular className="size-4 rtl:-scale-x-100" />
            </span>
            <h3 id={labelId} className="font-display text-subtitle1 font-semibold text-foreground-1">
              {q.title}
              {q.required && (
                <span aria-hidden className="ps-1 text-danger-foreground-1">
                  *
                </span>
              )}
              {q.required && <span className="sr-only"> {msg.required}</span>}
            </h3>
          </div>
          {q.description && (
            <p id={descId} className="-mt-2 text-body1 text-foreground-2">
              {q.description}
            </p>
          )}
          <QuestionControl
            question={q}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
            showKeys
            controlProps={{
              id: `${uid}-${q.id}`,
              "aria-labelledby": labelId,
              "aria-describedby": cn(error && errId, q.description && descId) || undefined,
              "aria-invalid": error ? true : undefined,
            }}
          />
          {error && (
            <p id={errId} role="alert" className="flex items-center gap-1 text-caption1 text-danger-foreground-1">
              <ErrorCircle12Filled className="shrink-0" />
              {error}
            </p>
          )}
          {keyHint && <p className="hidden text-caption1 text-foreground-3 sm:block">{keyHint}</p>}
        </div>
      );
    };

    const reviewView = (
      <div className="flex flex-col gap-3">
        <div>
          <h3 data-autofocus tabIndex={-1} className="font-display text-subtitle1 font-semibold text-foreground-1">
            {msg.reviewTitle}
          </h3>
          <p className="mt-0.5 text-body1 text-foreground-2">{msg.reviewDescription}</p>
        </div>
        <dl className="flex flex-col divide-y divide-stroke-2 rounded-large border border-stroke-2">
          {questions.map((q, i) => (
            <div key={q.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-2">
              <dt className="min-w-0 flex-1 basis-60 text-body1 text-foreground-2">
                {i + 1}. {q.title}
              </dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className={cn("text-body1 font-semibold wrap-break-word", isEmpty(answers[q.id]) ? "text-foreground-3" : "text-foreground-1")}>
                  {formatQuestionAnswer(q, answers[q.id], msg)}
                </span>
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<Edit16Regular />}
                  aria-label={msg.editQuestion(i + 1, q.title)}
                  onClick={() => go(i, "back")}
                />
              </dd>
            </div>
          ))}
        </dl>
        {submitError && (
          <p role="alert" className="flex items-center gap-1 text-caption1 text-danger-foreground-1">
            <ErrorCircle12Filled className="shrink-0" />
            {submitError}
          </p>
        )}
      </div>
    );

    const doneView =
      typeof completion === "function" ? (
        <div data-autofocus tabIndex={-1}>
          {completion(answers, restart)}
        </div>
      ) : completion !== undefined ? (
        <div data-autofocus tabIndex={-1}>
          {completion}
        </div>
      ) : (
        <div data-autofocus tabIndex={-1} className="flex flex-col items-center gap-2 py-5 text-center">
          <CheckmarkCircle48Regular aria-hidden className="text-success-foreground-1" />
          <h3 className="font-display text-title3 font-semibold text-foreground-1">{msg.doneTitle}</h3>
          <p className="max-w-sm text-body1 text-foreground-2">{msg.doneDescription}</p>
          <Button className="mt-2" onClick={restart}>
            {msg.restart}
          </Button>
        </div>
      );

    const submitButton = (
      <Button appearance="primary" onClick={() => void submit()} disabled={submitting} aria-busy={submitting || undefined}>
        {submitting && <Spinner size="extra-tiny" appearance="inverted" aria-hidden />}
        {submitting ? msg.submitting : submitLabel}
      </Button>
    );

    const rootClass = cn(
      "flex w-full min-w-0 flex-col gap-4 text-foreground-1",
      appearance === "outline" && "rounded-xlarge border border-stroke-2 bg-background-1 p-5 shadow-2",
      className,
    );

    /* ---------- Chế độ list ---------- */
    if (!stepper) {
      return (
        <div ref={ref} className={rootClass} onKeyDown={onKeyDown} {...props}>
          {header}
          <div ref={contentRef}>
            {phase === "form" && (
              <form
                noValidate
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (review) toReview();
                  else void submit();
                }}
              >
                {questions.map((q, i) => (
                  <div key={q.id} data-question-id={q.id}>
                    <Field
                      size="large"
                      label={`${i + 1}. ${q.title}`}
                      required={q.required}
                      hint={q.description}
                      validationState={errors[q.id] ? "error" : "none"}
                      validationMessage={errors[q.id]}
                    >
                      {(fieldProps) => (
                        <QuestionControl
                          question={q}
                          value={answers[q.id]}
                          onChange={(v) => setAnswer(q.id, v)}
                          controlProps={fieldProps}
                          showKeys={false}
                        />
                      )}
                    </Field>
                  </div>
                ))}
                {submitError && (
                  <p role="alert" className="flex items-center gap-1 text-caption1 text-danger-foreground-1">
                    <ErrorCircle12Filled className="shrink-0" />
                    {submitError}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="submit" appearance="primary" disabled={submitting}>
                    {submitting && <Spinner size="extra-tiny" appearance="inverted" aria-hidden />}
                    {review ? msg.review : submitting ? msg.submitting : submitLabel}
                  </Button>
                </div>
              </form>
            )}
            {phase === "review" && (
              <div className="flex flex-col gap-4">
                {reviewView}
                <div className="flex justify-between gap-2">
                  <Button appearance="subtle" icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />} onClick={() => go(0, "back")}>
                    {msg.backToEdit}
                  </Button>
                  {submitButton}
                </div>
              </div>
            )}
            {phase === "done" && doneView}
          </div>
        </div>
      );
    }

    /* ---------- Chế độ stepper ---------- */
    const progress = phase === "form" ? (index + 1) / Math.max(total, 1) : 1;
    const isLast = index === total - 1;

    return (
      <div ref={ref} className={rootClass} onKeyDown={handleKeyDown} {...props}>
        {header}

        {phase !== "done" && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-caption1 text-foreground-3 tabular-nums">
              <span>{phase === "review" ? msg.review : msg.questionOf(index + 1, total)}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <ProgressBar
              value={progress}
              thickness="large"
              aria-label={msg.progressLabel}
              aria-valuetext={phase === "review" ? msg.review : msg.progressValue(index + 1, total)}
            />
          </div>
        )}

        {/* Cắt phần trượt ngang; px-1 chừa chỗ cho viền focus. */}
        <div ref={contentRef} className="-mx-1 min-h-48 overflow-x-clip px-1">
          {phase === "form" && current && (
            <Slide key={`q-${index}`} visible appear from={direction === "forward" ? "end" : "start"} duration="gentle">
              {renderStepperQuestion(current, index)}
            </Slide>
          )}
          {phase === "review" && (
            <Slide key="review" visible appear from="end" duration="gentle">
              {reviewView}
            </Slide>
          )}
          {phase === "done" && (
            <Slide key="done" visible appear from="bottom" duration="gentle">
              {doneView}
            </Slide>
          )}
        </div>

        {phase !== "done" && (
          <div className="flex items-center justify-between gap-2">
            <Button
              appearance="subtle"
              icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />}
              onClick={back}
              disabled={phase === "form" && index === 0}
            >
              {msg.back}
            </Button>
            {phase === "form" ? (
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1 text-caption1 text-foreground-3 sm:inline-flex">
                  {msg.orPress} <Kbd size="small">Enter ↵</Kbd>
                </span>
                <Button
                  appearance="primary"
                  icon={<ArrowRight20Regular className="rtl:-scale-x-100" />}
                  iconPosition="after"
                  onClick={next}
                  disabled={submitting}
                >
                  {isLast ? (review ? msg.review : submitLabel) : msg.next}
                </Button>
              </div>
            ) : (
              submitButton
            )}
          </div>
        )}
      </div>
    );
  },
);
Questionnaire.displayName = "Questionnaire";
