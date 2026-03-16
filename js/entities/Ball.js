export class Ball {
  constructor(x, y, skin = null) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 14;
    this.lastTouch = 'player';
    this.trail = [];
    this.ignite = 0;
    this.spin = 0;
    this.squash = 0;
    this.flash = 0;
    this.speedLines = 0;
    this.skin = skin || { shell: ['#ffffff', '#fff5cb', '#e6c37b'], seam: '#9e6133', trail: '#a8e4ff', igniteTrail: '#ff9960' };
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

    this.squash = Math.max(0, this.squash - dt * 9);
    this.flash = Math.max(0, this.flash - dt * 8);
    this.speedLines = Math.max(0, this.speedLines - dt * 3.8);

    const speed = Math.hypot(this.vx, this.vy);
    this.trail.push({
      x: this.x - this.vx * dt * 0.26,
      y: this.y - this.vy * dt * 0.26,
      a: 1,
      r: this.radius * (0.35 + Math.random() * 0.28),
      speed,
      elongation: Math.min(18, speed * 0.007),
    });
    if (this.trail.length > 20) this.trail.shift();
    this.trail.forEach((t) => {
      t.a *= 0.84;
    });
  }

  registerImpact(power = 0.5) {
    const p = Math.max(0, Math.min(1.8, power));
    this.squash = Math.max(this.squash, 0.12 + p * 0.28);
    this.flash = Math.max(this.flash, 0.1 + p * 0.42);
    this.speedLines = Math.max(this.speedLines, p * 1.15);
  }

  draw(ctx) {
    this.trail.forEach((t) => {
      const intense = Math.min(1, t.speed / 1100);
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(Math.atan2(this.vy, this.vx));
      ctx.fillStyle = this.ignite > 0
        ? `rgba(${this.hexToRgb(this.skin.igniteTrail)}, ${t.a * (0.28 + intense * 0.36)})`
        : `rgba(${this.hexToRgb(this.skin.trail)}, ${t.a * (0.24 + intense * 0.32)})`;
      ctx.fillRect(-t.r - t.elongation, -t.r * 0.7, t.r * 2 + t.elongation * 1.5, t.r * 1.4);
      ctx.fillStyle = this.ignite > 0
        ? `rgba(255, 229, 173, ${t.a * 0.25})`
        : `rgba(255, 255, 255, ${t.a * 0.2})`;
      ctx.fillRect(-t.r * 0.4, -t.r * 0.28, t.r * 0.9, t.r * 0.55);
      ctx.restore();
    });

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin);
    const motionAmp = Math.min(1, Math.hypot(this.vx, this.vy) / 1200) + this.speedLines * 0.22;
    ctx.scale(1 + this.squash * 0.45 + motionAmp * 0.2, 1 - this.squash * 0.35);

    if (this.speedLines > 0.15 || Math.abs(this.vx) > 760 || this.ignite > 0) {
      const lineCount = 2 + Math.floor(this.speedLines * 4);
      const lineAlpha = Math.min(0.45, 0.16 + this.speedLines * 0.2 + motionAmp * 0.18);
      for (let i = 0; i < lineCount; i += 1) {
        const offset = (i - lineCount * 0.5) * 4;
        ctx.strokeStyle = this.ignite > 0
          ? `rgba(${this.hexToRgb(this.skin.igniteTrail)},${lineAlpha})`
          : `rgba(${this.hexToRgb(this.skin.trail)},${lineAlpha})`;
        ctx.lineWidth = 2 + i * 0.4;
        ctx.beginPath();
        ctx.moveTo(-this.vx * 0.01, -this.vy * 0.01 + offset);
        ctx.lineTo(-this.vx * (0.022 + i * 0.004), -this.vy * (0.022 + i * 0.004) + offset * 0.8);
        ctx.stroke();
      }
    }

    const shell = ctx.createRadialGradient(-4, -6, 2, 0, 0, this.radius + 2);
    shell.addColorStop(0, this.ignite > 0 ? '#ffe6bd' : this.skin.shell[0]);
    shell.addColorStop(0.45, this.ignite > 0 ? '#ffb06f' : this.skin.shell[1]);
    shell.addColorStop(1, this.ignite > 0 ? '#da6f3f' : this.skin.shell[2]);
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.skin.seam;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = this.skin.seam;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius - 4, -0.85, 0.95);
    ctx.moveTo(-this.radius + 5, -2);
    ctx.quadraticCurveTo(0, -7, this.radius - 5, -1);
    ctx.moveTo(-this.radius + 4, 5);
    ctx.quadraticCurveTo(-1, 9, this.radius - 6, 4);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.fillRect(-8, -8, 12, 3);
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.fillRect(-9, 5, 14, 3);

    if (this.flash > 0.02) {
      ctx.globalAlpha = Math.min(0.75, this.flash);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  hexToRgb(hex) {
    const value = String(hex || '#ffffff').replace('#', '');
    const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
    const n = parseInt(full, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
}
