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

export const skeletonMessages: SkeletonMessages = { label: "Đang tải nội dung" };

export const skeletonMessagesEn: SkeletonMessages = { label: "Loading content" };

/** Bản tiếng Việt, tên có hậu tố ngôn ngữ như `skeletonMessagesEn` (mặc định). `skeletonMessages` giữ cho code cũ. */
export const skeletonMessagesVi = skeletonMessages;
