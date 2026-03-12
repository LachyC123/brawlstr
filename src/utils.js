export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (min, max) => Math.random() * (max - min) + min;
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const norm = (x, y) => {
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
};
export const circleHit = (a, b) => dist(a, b) < a.radius + b.radius;
export const aabbContains = (r, p) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
export const uid = () => Math.random().toString(36).slice(2, 11);
