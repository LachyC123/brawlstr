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

    const speed = Math.hypot(this.vx, this.vy);
    this.trail.push({ x: this.x, y: this.y, a: 1, r: this.radius * (0.5 + Math.random() * 0.5), speed });
    if (this.trail.length > 16) this.trail.shift();
    this.trail.forEach((t) => {
      t.a *= 0.84;
    });
  }

  draw(ctx) {
    this.trail.forEach((t) => {
      const intense = Math.min(1, t.speed / 1100);
      ctx.fillStyle = this.ignite > 0
        ? `rgba(255, 162, 98, ${t.a * (0.32 + intense * 0.4)})`
        : `rgba(243, 249, 255, ${t.a * (0.26 + intense * 0.35)})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r + intense * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin);
    if (Math.abs(this.vx) > 760 || this.ignite > 0) {
      ctx.strokeStyle = this.ignite > 0 ? 'rgba(255,154,100,.5)' : 'rgba(210,235,255,.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-this.vx * 0.012, -this.vy * 0.012);
      ctx.lineTo(-this.vx * 0.028, -this.vy * 0.028);
      ctx.stroke();
    }

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
