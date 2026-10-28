/*
 * Bản đồ khúc xạ cho mép glass (Yugen Labs). Mỗi bề mặt là một tấm kính phẳng có vành lồi: tia sáng đi thẳng xuống qua
 * vành bị bẻ cong theo định luật Snell, nên ở mép ta thấy phần nền nằm sâu hơn vào trong, như nhìn qua vành ly.
 *
 * Bản đồ là ảnh RGBA cùng kích thước bề mặt cho <feDisplacementMap>: R = dịch theo x, G = dịch theo y, 128 = đứng yên.
 * Véc-tơ luôn hướng vào trong, nên bộ lọc chỉ lấy mẫu nền nằm trong bề mặt, không lộ mép trong suốt.
 */

/** Mặt cắt vành kính lồi (cung tròn): độ cao theo khoảng cách tới mép, 0 ở mép, 1 ở hết vành. */
export const surface = (x: number) => Math.sqrt(1 - (1 - x) ** 2);

/**
 * Độ lệch của tia sáng thẳng đứng đi qua vành tại khoảng cách x (0…1 tính từ mép), chuẩn hoá để giá trị lớn nhất là 1.
 * Snell với chiết suất `n`: góc tới θ1 = atan(độ dốc), góc khúc xạ θ2 = asin(sin θ1 / n), độ lệch = tan(θ1 − θ2)
 * nhân bề dày kính tại điểm đó (vành + đế).
 */
export function refractionProfile(samples = 64, n = 1.5): Float32Array {
  const out = new Float32Array(samples);
  const h = 1e-3;
  let max = 0;
  for (let i = 0; i < samples; i++) {
    const x = (i + 0.5) / samples;
    const a = Math.max(0, x - h);
    const b = Math.min(1, x + h);
    const slope = (surface(b) - surface(a)) / (b - a);
    const theta1 = Math.atan(slope);
    const theta2 = Math.asin(Math.sin(theta1) / n);
    const value = Math.tan(theta1 - theta2) * (0.5 + 0.5 * surface(x));
    out[i] = value;
    max = Math.max(max, value);
  }
  if (max > 0) for (let i = 0; i < samples; i++) out[i] /= max;
  return out;
}

export interface LensGeometry {
  /** Kích thước bề mặt (px). */
  width: number;
  height: number;
  /** Bán kính bo góc (px), đã giới hạn ở nửa cạnh ngắn. */
  radius: number;
}

/** Độ rộng vành (px): lớn dần theo cạnh ngắn, không quá bán kính bo góc khi góc lớn, trong khoảng 6–24px. */
export function bezelWidth({ width, height, radius }: LensGeometry) {
  const short = Math.min(width, height);
  return Math.round(Math.min(24, Math.max(6, Math.min(short * 0.3, Math.max(radius, short * 0.2)))));
}

/** Dịch tối đa ở mép (px) = `scale` / 2 của <feDisplacementMap>; nhỏ hơn vành nên mẫu luôn nằm trong bề mặt. */
export const maxShift = (bezel: number) => bezel * 0.5;

/**
 * Ảnh RGBA (width × height × 4) của bản đồ khúc xạ cho một hình chữ nhật bo góc. Mỗi điểm trong vành dịch vào trong
 * theo pháp tuyến của mép gần nhất; giữa bề mặt và phần ngoài góc bo đứng yên (128, 128).
 */
export function lensMap(geometry: LensGeometry, profile = refractionProfile()): Uint8ClampedArray {
  const { width, height } = geometry;
  const radius = Math.min(geometry.radius, width / 2, height / 2);
  const bezel = bezelWidth(geometry);
  const data = new Uint8ClampedArray(width * height * 4);
  const hx = width / 2 - radius;
  const hy = height / 2 - radius;
  const last = profile.length - 1;

  for (let y = 0; y < height; y++) {
    const py = y + 0.5 - height / 2;
    const qy = Math.abs(py) - hy;
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - width / 2;
      const qx = Math.abs(px) - hx;
      // Khoảng cách có dấu tới mép hình chữ nhật bo góc (âm ở trong) và pháp tuyến hướng ra ngoài.
      let distance: number;
      let nx = 0;
      let ny = 0;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy);
        distance = len - radius;
        nx = (qx / len) * Math.sign(px);
        ny = (qy / len) * Math.sign(py);
      } else if (qx > qy) {
        distance = qx - radius;
        nx = Math.sign(px);
      } else {
        distance = qy - radius;
        ny = Math.sign(py);
      }
      const i = (y * width + x) * 4;
      let r = 128;
      let g = 128;
      const inset = -distance;
      if (inset >= 0 && inset < bezel) {
        const m = profile[Math.min(last, Math.floor((inset / bezel) * profile.length))];
        r = 128 - nx * m * 127;
        g = 128 - ny * m * 127;
      }
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  return data;
}
