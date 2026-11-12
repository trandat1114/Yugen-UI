/**
 * Ảnh mẫu cho ví dụ docs — SVG data URI sinh tại chỗ (không phụ thuộc mạng). Đây là nội dung ảnh, không phải màu UI.
 * File này được chép nguyên văn vào dự án "Mở trong StackBlitz" khi ví dụ dùng tới các tên bên dưới.
 */

/** Ảnh phong cảnh minh hoạ. */
export function photo(sky: string, glow: string, sun: string, far: string, near: string, width = 640, height = 400) {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "' viewBox='0 0 640 400' preserveAspectRatio='xMidYMid slice'>" +
    "<defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + sky + "'/><stop offset='1' stop-color='" + glow + "'/></linearGradient></defs>" +
    "<rect width='640' height='400' fill='url(#s)'/>" +
    "<circle cx='468' cy='130' r='52' fill='" + sun + "'/>" +
    "<path d='M0 292 L118 182 L226 262 L344 148 L498 288 L640 206 V400 H0Z' fill='" + far + "'/>" +
    "<path d='M0 338 Q170 272 330 330 T640 318 V400 H0Z' fill='" + near + "'/>" +
    "</svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

/** Hoạ tiết chất liệu. */
export function texture(base: string, line: string, angle: number) {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>" +
    "<rect width='32' height='32' fill='" + base + "'/>" +
    "<g transform='rotate(" + angle + " 16 16)' stroke='" + line + "' stroke-width='3'>" +
    "<line x1='-16' y1='4' x2='48' y2='4'/><line x1='-16' y1='12' x2='48' y2='12'/>" +
    "<line x1='-16' y1='20' x2='48' y2='20'/><line x1='-16' y1='28' x2='48' y2='28'/></g></svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

export const mountain = photo("#8fbff0", "#e6f1fc", "#fff6dc", "#4a78a8", "#1d4a70");
export const sunset = photo("#f2a68c", "#fde3cf", "#fff0c2", "#9a527a", "#552a50");
export const landscape = photo("#8fbff0", "#e6f1fc", "#fff6dc", "#4a78a8", "#1d4a70", 200, 125);
export const scenery = [
  { title: "Mountains at dawn", src: mountain },
  { title: "Hills at sunset", src: sunset },
  { title: "Pine forest", src: photo("#a8d8c0", "#eef8f1", "#fffbe6", "#3f7a5a", "#1f4a35") },
  { title: "Lake at night", src: photo("#2b3a67", "#6b7fb8", "#f4f1d0", "#1e2a4d", "#0f1730") },
  { title: "Desert", src: photo("#f5c98a", "#fdf0d8", "#fff8e1", "#c27c43", "#8a4b22") },
];

export const wood = texture("#B9875A", "#9A6A40", 12);
export const marble = texture("#ECEAE6", "#C9C4BC", -35);
export const fabric = texture("#5B6FA8", "#7488C2", 45);

/** Minh hoạ hoa anh đào cho TeachingPopover. */
export const illustration =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='140' viewBox='0 0 320 140'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#FDEDF3'/><stop offset='1' stop-color='#E9DDF7'/></linearGradient></defs>" +
      "<rect width='320' height='140' fill='url(#g)'/>" +
      "<g fill='#FA65A8'><circle cx='160' cy='46' r='18'/><circle cx='183' cy='63' r='18'/><circle cx='174' cy='90' r='18'/>" +
      "<circle cx='146' cy='90' r='18'/><circle cx='137' cy='63' r='18'/></g><circle cx='160' cy='70' r='9' fill='#FFF6DC'/></svg>",
  );

/** Portrait (head and shoulders) for Avatar / Persona examples. */
export function portrait(bg: string, skin: string, hair: string, shirt: string) {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>" +
    "<rect width='96' height='96' fill='" + bg + "'/>" +
    "<path d='M12 96 Q14 66 48 64 Q82 66 84 96Z' fill='" + shirt + "'/>" +
    "<circle cx='48' cy='42' r='18' fill='" + skin + "'/>" +
    "<path d='M29 42 Q27 20 48 19 Q69 20 67 42 Q63 30 48 30 Q34 30 29 42Z' fill='" + hair + "'/>" +
    "</svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

export const portraits = [
  portrait("#CFE4FA", "#F1C7A5", "#2B2118", "#2F5D8A"),
  portrait("#FBE3D6", "#D9A27E", "#5A3420", "#B04A5A"),
  portrait("#DDF1E4", "#8D5A3B", "#1C1410", "#2F7D5B"),
  portrait("#EDE3F8", "#E8B48F", "#7A4A24", "#5B4A9A"),
  portrait("#FFF1CC", "#C68863", "#3B2A20", "#8A6A1F"),
];

/** Square app logo (team, app, bot). */
export const logo =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>" +
      "<rect width='96' height='96' fill='#0F6CBD'/><path d='M24 66 L48 26 L72 66Z' fill='#FFFFFF'/>" +
      "<circle cx='48' cy='56' r='8' fill='#0F6CBD'/></svg>",
  );

/** An image that cannot be decoded: shows the initials fallback without a network request. */
export const brokenPhoto = "data:image/png;base64,AAAA";

/** Tên người mẫu cho Avatar / AvatarGroup / Persona. */
export const people = ["Alex Chen", "Maria Garcia", "Sam Lee", "Priya Patel", "Jordan Kim", "Taylor Nguyen", "Chris Novak", "Hana Sato"];

/** Tên có thể dùng trong `code` của ví dụ — converter StackBlitz tự thêm import từ "./sample-assets". */
export const SAMPLE_ASSET_NAMES = ["photo", "texture", "mountain", "sunset", "landscape", "scenery", "wood", "marble", "fabric", "illustration", "people", "portrait", "portraits", "logo", "brokenPhoto"];
