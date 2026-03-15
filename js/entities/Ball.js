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
    this.trail.push({ x: this.x, y: this.y, a: 1, r: this.radius * (0.48 + Math.random() * 0.42), speed });
    if (this.trail.length > 20) this.trail.shift();
    this.trail.forEach((t) => {
      t.a *= 0.84;
    });
  }

  draw(ctx) {
    this.trail.forEach((t) => {
      const intense = Math.min(1, t.speed / 1100);
      ctx.fillStyle = this.ignite > 0
        ? `rgba(255, 153, 96, ${t.a * (0.28 + intense * 0.36)})`
        : `rgba(168, 228, 255, ${t.a * (0.24 + intense * 0.32)})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r + intense * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = this.ignite > 0
        ? `rgba(255, 229, 173, ${t.a * 0.25})`
        : `rgba(255, 255, 255, ${t.a * 0.2})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * 0.58, 0, Math.PI * 2);
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

    const shell = ctx.createRadialGradient(-3, -5, 2, 0, 0, this.radius + 2);
    shell.addColorStop(0, this.ignite > 0 ? '#ffe6bd' : '#ffffff');
    shell.addColorStop(0.45, this.ignite > 0 ? '#ffb06f' : '#fff5cb');
    shell.addColorStop(1, this.ignite > 0 ? '#da6f3f' : '#e6c37b');
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8a5528';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius - 3, -0.7, 0.8);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.fillRect(-6, -8, 10, 3);
    ctx.restore();
  }
}
