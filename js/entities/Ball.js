export class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 14;
    this.lastTouch = 'player';
    this.trail = [];
    this.ignite = 0;
  }

  serve(toRight = true) {
    this.vx = toRight ? 320 : -320;
    this.vy = -720;
  }

  update(dt, gravity) {
    this.vy += gravity * dt * 0.92;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.ignite > 0) {
      this.ignite -= dt;
      this.vy += 280 * dt;
    }
    this.trail.push({ x: this.x, y: this.y, a: 1 });
    if (this.trail.length > 10) this.trail.shift();
    this.trail.forEach((t) => { t.a *= 0.85; });
  }

  draw(ctx) {
    this.trail.forEach((t) => {
      ctx.fillStyle = `rgba(255, 245, 190, ${t.a * 0.45})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = this.ignite > 0 ? '#ff9168' : '#fff5cb';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b16f35';
    ctx.stroke();
  }
}
