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
    this.spin = 0;
  }

  serve(toRight = true) {
    this.vx = toRight ? 320 : -320;
    this.vy = -700;
    this.spin = toRight ? 7 : -7;
  }

  update(dt, gravity) {
    this.vy += gravity * dt * 0.93;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.spin += this.vx * dt * 0.002;

    if (this.ignite > 0) {
      this.ignite -= dt;
      this.vy += 290 * dt;
    }

    this.trail.push({ x: this.x, y: this.y, a: 1, r: this.radius * (0.5 + Math.random() * 0.5) });
    if (this.trail.length > 12) this.trail.shift();
    this.trail.forEach((t) => {
      t.a *= 0.84;
    });
  }

  draw(ctx) {
    this.trail.forEach((t) => {
      ctx.fillStyle = this.ignite > 0
        ? `rgba(255, 172, 120, ${t.a * 0.42})`
        : `rgba(243, 249, 255, ${t.a * 0.36})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin);
    ctx.fillStyle = this.ignite > 0 ? '#ff9f6a' : '#fff5cb';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#b16f35';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.32)';
    ctx.fillRect(-6, -8, 10, 3);
    ctx.restore();
  }
}
