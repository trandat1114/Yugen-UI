export interface RadarPoint {
  x: number;
  y: number;
}

export function radarPoint(
  index: number,
  count: number,
  radius: number,
  cx: number,
  cy: number,
) {
  const angle = -Math.PI / 2 + (index / Math.max(1, count)) * Math.PI * 2;
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

export function radarPath(
  points: readonly (RadarPoint | null)[],
  close = true,
) {
  let path = "";
  let open = false;
  points.forEach((point) => {
    if (!point) {
      open = false;
      return;
    }
    path += `${open ? "L" : "M"}${point.x},${point.y}`;
    open = true;
  });
  return close && path && points.every(Boolean) ? `${path}Z` : path;
}

export function radarValue(
  value: number | null | undefined,
  min: number,
  max: number,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (max <= min) return 1;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}
