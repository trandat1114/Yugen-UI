/** Chuỗi giao diện có sẵn của Skeleton. Đổi qua `messages.skeleton` của YugenProvider. */
export interface SkeletonMessages {
  /** aria-label của vùng đang tải (role="progressbar"). */
  label: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    skeleton: SkeletonMessages;
  }
}

export const skeletonMessagesVi: SkeletonMessages = { label: "Đang tải nội dung" };

export const skeletonMessagesEn: SkeletonMessages = { label: "Loading content" };

/** @deprecated Use `skeletonMessagesVi` (Vietnamese) or `skeletonMessagesEn`. Will be removed in v1.0.0. */
export const skeletonMessages = skeletonMessagesVi;
