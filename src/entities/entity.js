export class Entity {
  constructor(x, y, radius = 18) {
    this.x = x; this.y = y; this.radius = radius;
    this.vx = 0; this.vy = 0; this.hp = 100; this.maxHp = 100;
    this.team = 0; this.dead = false; this.invuln = 0;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.invuln = Math.max(0, this.invuln - dt);
  }
}
