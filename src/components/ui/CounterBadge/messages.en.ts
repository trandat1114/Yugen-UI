import type { CounterBadgeMessages } from "./messages";

export const counterBadgeMessagesEn: CounterBadgeMessages = {
  dot: "New notifications",
  count: (count) => (count === 1 ? "1 notification" : `${count} notifications`),
  overflow: (overflowCount) => `More than ${overflowCount} notifications`,
};
