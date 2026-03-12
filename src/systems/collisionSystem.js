import { circleHit } from '../utils.js';

export function resolveMapCollision(actor, map) {
  for (const w of map.walls) {
    const nx = Math.max(w.x, Math.min(actor.x, w.x + w.w));
    const ny = Math.max(w.y, Math.min(actor.y, w.y + w.h));
    const dx = actor.x - nx; const dy = actor.y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 < actor.radius * actor.radius) {
      const d = Math.sqrt(d2) || 1;
      actor.x += (dx / d) * (actor.radius - d);
      actor.y += (dy / d) * (actor.radius - d);
    }
  }
}

export function projectileHits(projectile, actors) {
  for (const a of actors) {
    if (!a.dead && a.team !== projectile.team && circleHit(projectile, a)) return a;
  }
  return null;
}
