/** Chuỗi giao diện có sẵn của Carousel. Đổi qua `messages.carousel` của YugenProvider. */
export interface CarouselMessages {
  /** Tên từng slide / chấm / thumbnail và thông báo slide hiện tại; `index` đếm từ 1. */
  slide: (index: number, count: number) => string;
  /** aria-roledescription của vùng carousel. */
  roleDescription: string;
  /** aria-roledescription của từng slide. */
  slideRoleDescription: string;
  /** aria-label nút slide trước. */
  previous: string;
  /** aria-label nút slide sau. */
  next: string;
  /** aria-label nút bật / tắt tự chạy. */
  autoplay: string;
  /** aria-label dãy chấm / thumbnail (tablist). */
  chooseSlide: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    carousel: CarouselMessages;
  }
}

export const carouselMessages: CarouselMessages = {
  slide: (index, count) => `Slide ${index} / ${count}`,
  roleDescription: "carousel",
  slideRoleDescription: "slide",
  previous: "Slide trước",
  next: "Slide tiếp theo",
  autoplay: "Tự động chạy",
  chooseSlide: "Chọn slide",
};
