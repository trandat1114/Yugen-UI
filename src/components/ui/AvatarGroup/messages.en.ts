import type { AvatarGroupMessages } from "./messages";

export const avatarGroupMessagesEn: AvatarGroupMessages = {
  list: "Members",
  viewAll: (count) => (count === 1 ? "View 1 member" : `View ${count} members`),
  viewMore: (count) => (count === 1 ? "View 1 more member" : `View ${count} more members`),
};
