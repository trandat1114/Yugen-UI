import type { LoadingOverlayMessages, PageProgressMessages, ErrorStateMessages, AsyncContentMessages, OptimisticListMessages } from "./messages";

export const loadingOverlayMessagesEn: LoadingOverlayMessages = { label: "Loading…", announcement: "Loading" };

export const pageProgressMessagesEn: PageProgressMessages = { label: "Loading page" };

export const errorStateMessagesEn: ErrorStateMessages = {
  title: "Couldn't load content",
  description: "Something went wrong while connecting to the server. Check your connection and try again.",
  retry: "Retry",
};

export const asyncContentMessagesEn: AsyncContentMessages = {
  loading: "Loading…",
  emptyTitle: "No data yet",
  emptyDescription: "New content will appear here.",
};

export const optimisticListMessagesEn: OptimisticListMessages = {
  errorTitle: "Couldn't save changes",
  errorBody: "Your changes were undone.",
  retry: "Retry",
  retryAltText: "Retry the last action",
};
