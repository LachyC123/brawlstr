import { clamp, lerp } from '../utils.js';

export class Camera {
  constructor(w, h) { this.x = 0; this.y = 0; this.w = w; this.h = h; this.shake = 0; }
  update(target, dt, world, settings) {
    this.x = lerp(this.x, clamp(target.x - this.w / 2, 0, world.width - this.w), 0.14);
    this.y = lerp(this.y, clamp(target.y - this.h / 2, 0, world.height - this.h), 0.14);
    this.shake = Math.max(0, this.shake - dt * 4);
    if (!settings.screenShake) this.shake = 0;
  }
  begin(ctx) {
    const sx = (Math.random() - 0.5) * this.shake * 8;
    const sy = (Math.random() - 0.5) * this.shake * 8;
    ctx.save();
    ctx.translate(-this.x + sx, -this.y + sy);
  }
  end(ctx) { ctx.restore(); }
}
