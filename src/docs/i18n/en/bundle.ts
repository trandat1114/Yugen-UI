import { en } from "../en";
import { COMPONENTS_EN } from "./components";
import { CATEGORIES_EN, CONCEPT_GROUPS_EN, CONCEPTS_EN, FOUNDATIONS_EN } from "./concepts";

/** Everything the English locale needs — one lazy chunk, loaded only when the locale is "en". */
export const bundle = {
  messages: en,
  components: COMPONENTS_EN,
  concepts: CONCEPTS_EN,
  categories: CATEGORIES_EN,
  groups: CONCEPT_GROUPS_EN,
  foundations: FOUNDATIONS_EN,
};

export type EnBundle = typeof bundle;
