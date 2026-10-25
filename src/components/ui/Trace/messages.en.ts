import type { TraceMessages } from "./messages";

export const traceMessagesEn: TraceMessages = {
  pending: "Pending",
  running: "Running",
  success: "Completed",
  error: "Failed",
  skipped: "Skipped",
  cancelled: "Canceled",
  label: "Progress",
  steps: (done, total) => `${done}/${total} ${total === 1 ? "step" : "steps"}`,
  summary: "Summary by status",
  duration: "Duration:",
  collapseAll: "Collapse all",
  expandAll: "Expand all",
};
