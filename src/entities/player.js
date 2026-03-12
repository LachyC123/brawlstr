import { Entity } from './entity.js';
import { norm, clamp } from '../utils.js';

export class Player extends Entity {
  constructor(hero, x, y, isHuman = false) {
    super(x, y, 20);
    this.hero = hero;
    this.isHuman = isHuman;
    this.maxHp = hero.hp; this.hp = hero.hp; this.speed = hero.speed;
    this.ammo = hero.ammoMax; this.ammoTimer = 0; this.attackCd = 0; this.gadgetCd = 0;
    this.superCharge = 0; this.superReady = false; this.score = 0; this.effects = [];
    this.name = hero.name;
  }
  update(dt) {
    super.update(dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.gadgetCd = Math.max(0, this.gadgetCd - dt);
    this.ammoTimer += dt;
    if (this.ammo < this.hero.ammoMax && this.ammoTimer >= this.hero.reload) {
      this.ammo += 1; this.ammoTimer = 0;
    }
    this.effects = this.effects.filter((e) => {
      e.t -= dt;
      if (e.type === 'dot' && e.tick <= 0) { this.hp -= e.power; e.tick = 0.5; } else e.tick -= dt;
      return e.t > 0;
    });
    this.speedMult = this.effects.some((e) => e.type === 'slow') ? 0.72 : 1;
    if (this.hp <= 0) this.dead = true;
  }
  move(dir, dt, world) {
    const n = norm(dir.x, dir.y);
    this.x = clamp(this.x + n.x * this.speed * this.speedMult * dt, 30, world.width - 30);
    this.y = clamp(this.y + n.y * this.speed * this.speedMult * dt, 30, world.height - 30);
  }
}
