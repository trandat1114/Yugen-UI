/**
 * Người đóng góp (#248): src/docs/contributors.json do scripts/contributors.mjs sinh từ GitHub API (pages.yml làm mới mỗi
 * lần deploy docs), cộng phần ghi tay trong contributors.extra.json. Trang /contributors tải thêm bản mới hơn từ nhánh
 * contributors-data (#272), do contributors.yml cập nhật vài phút sau mỗi issue, bình luận hay PR được merge.
 */
import * as React from "react";
import data from "./contributors.json";
import { SITE } from "./site";

export type ContributionType = "code" | "templates" | "docs" | "translation" | "design" | "review" | "discussion" | "bug" | "a11y" | "idea";

/** Thứ tự hiển thị, giống TYPES trong scripts/contributors.mjs. */
export const CONTRIBUTION_TYPES: ContributionType[] = ["code", "templates", "docs", "translation", "design", "review", "discussion", "bug", "a11y", "idea"];

export interface Contribution {
  types: ContributionType[];
  /** Số PR / issue; không có với đóng góp ghi tay. */
  number?: number;
  title: string;
  /** YYYY-MM-DD: ngày merge (PR, review), ngày mở (issue) hoặc ngày bình luận (góp ý). */
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

/**
 * Hai mục của trang Người đóng góp: những gì vào repo qua PR (code, template, tài liệu, bản dịch), và ý tưởng, thiết kế,
 * báo lỗi, review, góp ý trong thảo luận issue.
 */
export const CONTRIBUTION_GROUPS = {
  code: ["code", "templates", "docs", "translation"],
  ideas: ["design", "review", "discussion", "bug", "a11y", "idea"],
} satisfies Record<string, ContributionType[]>;
export type ContributionGroup = keyof typeof CONTRIBUTION_GROUPS;

/**
 * Phần đóng góp của một người thuộc một mục: số đếm và từng đóng góp chỉ còn các loại của mục đó. Không có đóng góp nào
 * trong mục thì trả về undefined.
 */
export function contributionsIn(person: Contributor, group: ContributionGroup): Contributor | undefined {
  const types: ContributionType[] = CONTRIBUTION_GROUPS[group];
  const counts = Object.fromEntries(types.filter((type) => person.counts[type]).map((type) => [type, person.counts[type]]));
  if (!Object.keys(counts).length) return undefined;
  const items = person.items
    ?.map((item) => ({ ...item, types: item.types.filter((type) => types.includes(type)) }))
    .filter((item) => item.types.length);
  return { ...person, counts, ...(items && { items }) };
}

export interface ContributorsData {
  /** YYYY-MM-DD. */
  updated: string;
  people: Contributor[];
}

/** contributors.json trên nhánh contributors-data (raw.githubusercontent.com cho phép CORS, CDN cache khoảng 5 phút). */
export const CONTRIBUTORS_LIVE_URL = `${SITE.links.repository.replace("https://github.com/", "https://raw.githubusercontent.com/")}/contributors-data/contributors.json`;

const isString = (value: unknown): value is string => typeof value === "string";

/** Kiểm dạng dữ liệu tải về; sai dạng thì undefined để trang giữ snapshot. */
export function parseContributors(value: unknown): ContributorsData | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { updated, people } = value as Partial<ContributorsData>;
  if (!isString(updated) || !/^\d{4}-\d{2}-\d{2}$/.test(updated) || !Array.isArray(people) || people.length === 0) return undefined;
  const valid = people.every(
    (p) =>
      p && isString(p.login) && isString(p.name) && isString(p.avatar) && isString(p.first) &&
      !!p.counts && typeof p.counts === "object" && (p.items === undefined || Array.isArray(p.items)),
  );
  return valid ? { updated, people } : undefined;
}

/**
 * Danh sách cho trang /contributors: render bằng snapshot lúc build (khớp HTML prerender), sau đó tải bản trên nhánh
 * contributors-data. Bản tải về cũ hơn snapshot, sai dạng hoặc lỗi mạng thì giữ snapshot.
 */
export function useLiveContributors(): ContributorsData {
  const [live, setLive] = React.useState<ContributorsData>({ updated: CONTRIBUTORS_UPDATED, people: CONTRIBUTORS });
  React.useEffect(() => {
    const controller = new AbortController();
    fetch(CONTRIBUTORS_LIVE_URL, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : undefined))
      .then((value: unknown) => {
        const next = parseContributors(value);
        if (next && next.updated >= CONTRIBUTORS_UPDATED) setLive(next);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return live;
}

export const profileUrl = (login: string) => `https://github.com/${login}`;

/**
 * Ngôn ngữ của chữ gốc trên GitHub (tiêu đề issue / PR, giữ nguyên không dịch): có dấu tiếng Việt thì "vi", còn lại "en",
 * để trình đọc màn hình đọc đúng giọng.
 */
export const sourceLang = (text: string): "vi" | "en" =>
  /[ăâđêôơưàáạảãầấậẩẫằắặẳẵèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i.test(text) ? "vi" : "en";

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
