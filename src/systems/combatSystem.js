import { norm, rand } from '../utils.js';

export function fireAttack(actor, target, projectilePool, effects) {
  if (actor.attackCd > 0 || actor.ammo <= 0 || actor.dead) return false;
  actor.attackCd = actor.hero.attack.cooldown;
  actor.ammo -= 1;
  const base = Math.atan2(target.y - actor.y, target.x - actor.x);
  const atk = actor.hero.attack;
  for (let i = 0; i < atk.bullets; i++) {
    const t = atk.bullets === 1 ? 0 : i / (atk.bullets - 1) - 0.5;
    const ang = base + t * atk.spread + rand(-0.01, 0.01);
    const d = norm(Math.cos(ang), Math.sin(ang));
    const proj = projectilePool.find((p) => !p.active);
    if (!proj) continue;
    proj.spawn({ x: actor.x + d.x * 26, y: actor.y + d.y * 26, vx: d.x * atk.speed, vy: d.y * atk.speed, radius: atk.radius, life: atk.range / atk.speed, damage: atk.damage, team: actor.team, owner: actor, splash: atk.splash || 0, dot: atk.dot || 0, slow: atk.slow || 0, color: actor.hero.color });
  }
  effects.push({ type: 'muzzle', x: actor.x, y: actor.y, t: 0.12, color: actor.hero.color });
  return true;
}

export function applyGadget(actor, state) {
  if (actor.gadgetCd > 0 || actor.dead) return;
  const g = actor.hero.gadget;
  actor.gadgetCd = g.cooldown;
  if (g.type === 'speed') actor.effects.push({ type: 'speed', t: g.duration, tick: 0, power: 0 });
  if (g.type === 'shield') actor.effects.push({ type: 'shield', t: g.duration, tick: 0, power: 0.45 });
  if (g.type === 'dash') { actor.x += state.aimDir.x * g.distance; actor.y += state.aimDir.y * g.distance; }
  if (g.type === 'pool') state.zones.push({ x: actor.x, y: actor.y, radius: 110, t: g.duration, team: actor.team, damage: 55, slow: 0 });
}

export function applySuper(actor, target, state) {
  if (!actor.superReady || actor.dead) return;
  actor.superReady = false; actor.superCharge = 0;
  const s = actor.hero.super;
  if (s.type === 'aoe' || s.type === 'slam' || s.type === 'stomp') {
    state.zones.push({ x: target.x, y: target.y, radius: s.radius, t: 0.55, team: actor.team, burst: s.damage, slow: s.slow || 0 });
  } else if (s.type === 'zone' || s.type === 'zoneSlow') {
    state.zones.push({ x: target.x, y: target.y, radius: s.radius, t: s.duration, team: actor.team, damage: s.damage, slow: s.type === 'zoneSlow' ? 1.2 : 0 });
  } else if (s.type === 'line') {
    state.beams.push({ x1: actor.x, y1: actor.y, x2: target.x, y2: target.y, t: 0.22, team: actor.team, damage: s.damage });
  }
  state.effects.push({ type: 'super', x: actor.x, y: actor.y, t: 0.5, color: actor.hero.color });
}
