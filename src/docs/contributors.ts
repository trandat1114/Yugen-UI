/**
 * Người đóng góp (#248): src/docs/contributors.json do scripts/contributors.mjs sinh từ GitHub API (pages.yml làm mới mỗi
 * lần deploy docs), cộng phần ghi tay trong contributors.extra.json.
 */
import data from "./contributors.json";

export type ContributionType = "code" | "templates" | "docs" | "translation" | "design" | "review" | "bug" | "a11y" | "idea";

/** Thứ tự hiển thị, giống TYPES trong scripts/contributors.mjs. */
export const CONTRIBUTION_TYPES: ContributionType[] = ["code", "templates", "docs", "translation", "design", "review", "bug", "a11y", "idea"];

export interface Contribution {
  types: ContributionType[];
  /** Số PR / issue; không có với đóng góp ghi tay. */
  number?: number;
  title: string;
  /** YYYY-MM-DD: ngày merge (PR, review) hoặc ngày mở (issue). */
  date: string;
  url?: string;
}

export interface Contributor {
  login: string;
  /** Tên công khai trên GitHub, không có thì là login. */
  name: string;
  avatar: string;
  maintainer?: boolean;
  /** Ngày đóng góp đầu tiên (YYYY-MM-DD). */
  first: string;
  counts: Partial<Record<ContributionType, number>>;
  /** Đóng góp mới nhất trước; chỉ có với người không phải maintainer. */
  items?: Contribution[];
}

export const CONTRIBUTORS = data.people as Contributor[];
/** Ngày danh sách được làm mới lần cuối. */
export const CONTRIBUTORS_UPDATED: string = data.updated;

export const profileUrl = (login: string) => `https://github.com/${login}`;

/** Ảnh đại diện cỡ `size` px (GitHub trả ảnh vuông đúng cỡ, nên đặt gấp đôi cỡ hiển thị cho màn hình mật độ cao). */
export function avatarOf(person: Pick<Contributor, "avatar">, size: number) {
  const url = new URL(person.avatar);
  url.searchParams.set("s", String(size));
  return url.href;
}

/**
 * Người đóng góp (trừ maintainer) có đóng góp trong khoảng (`after`, `until`], ngày dạng YYYY-MM-DD; `after` bỏ trống là
 * từ đầu. Dùng để ghi công theo bản phát hành ở trang Có gì mới.
 */
export function creditsBetween(after: string | undefined, until: string, people: Contributor[] = CONTRIBUTORS) {
  return people.flatMap((person) => {
    const items = (person.items ?? []).filter((item) => (!after || item.date > after) && item.date <= until);
    return items.length ? [{ person, items }] : [];
  });
}
