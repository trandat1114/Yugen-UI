import type { TeachingPopoverMessages } from "./messages";

export const teachingPopoverMessagesEn: TeachingPopoverMessages = {
  close: "Close",
  next: "Next",
  previous: "Back",
  finish: "Finish",
  later: "Not now",
  stepRoleDescription: "step",
  step: (current, count) => `Step ${current} of ${count}`,
  goToStep: (index) => `Go to step ${index}`,
};
