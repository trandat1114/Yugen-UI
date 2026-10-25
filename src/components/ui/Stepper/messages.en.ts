import type { StepperMessages, WizardMessages } from "./messages";

export const stepperMessagesEn: StepperMessages = {
  label: "Steps",
  step: (index) => `Step ${index}`,
  complete: "completed",
  current: "current step",
  upcoming: "not started",
  error: "error",
  optional: "Optional",
  progress: (current, total) => `Step ${current} of ${total}`,
  progressLabel: (current, total) => `Step ${current} of ${total}`,
};

export const wizardMessagesEn: WizardMessages = {
  back: "Back",
  next: "Next",
  finish: "Finish",
  invalid: "Check the information in this step.",
  validateFailed: "Couldn't validate this step. Try again.",
  panel: (current, total) => `Step ${current} of ${total}`,
};
