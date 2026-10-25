import type { RatingMessages } from "./messages";

export const ratingMessagesEn: RatingMessages = {
  item: (value, valueText) => (value === 1 ? `${valueText} star` : `${valueText} stars`),
  summary: (valueText, max) => `Rated ${valueText} out of ${max} stars`,
  count: (count, countText) => (count === 1 ? `${countText} rating` : `${countText} ratings`),
};
