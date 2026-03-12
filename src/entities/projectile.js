export class Projectile {
  constructor() { this.active = false; }
  spawn(data) { Object.assign(this, data, { active: true, age: 0 }); }
  update(dt) {
    if (!this.active) return;
    this.age += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.age > this.life) this.active = false;
  }
}
