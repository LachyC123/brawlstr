export class Player {
  constructor(x, groundY, character, isAI = false) {
    this.x = x;
    this.y = groundY;
    this.vx = 0;
    this.vy = 0;
    this.groundY = groundY;
    this.width = 52;
    this.height = 70;
    this.isGrounded = true;
    this.character = character;
    this.isAI = isAI;
    this.energy = 0;
    this.specialReady = false;
    this.specialTimer = 0;
    this.touches = 0;
    this.jumpCount = 0;
  }

  reset(x) {
    this.x = x; this.y = this.groundY; this.vx = 0; this.vy = 0; this.isGrounded = true;
    this.specialTimer = 0; this.touches = 0;
  }

  update(dt, dir, jump, special, gravity) {
    const stats = this.character.stats;
    const speed = 330 * stats.speed;
    this.vx = dir * speed;
    this.x += this.vx * dt;

    if (jump && this.isGrounded) {
      this.vy = -850 * stats.jump;
      this.isGrounded = false;
      this.jumpCount++;
      if (this.character.id === 'volt' && this.jumpCount % 3 === 0) {
        this.vy *= 1.18;
        this.energy = Math.min(100, this.energy + 12);
      }
    }

    if (special && this.specialReady) {
      this.specialReady = false;
      this.specialTimer = 0.55;
      this.energy = 0;
    }

    this.vy += gravity * dt;
    this.y += this.vy * dt;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.isGrounded = true;
    }

    if (this.specialTimer > 0) this.specialTimer -= dt;
  }

  gainEnergy(v) {
    this.energy = Math.min(100, this.energy + v);
    this.specialReady = this.energy >= 100;
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = this.character.color;
    const bounce = this.isGrounded ? 1 + Math.min(0.07, Math.abs(this.vx) / 800) : 1;
    ctx.scale(1 / bounce, bounce);
    ctx.fillRect(-23, -68, 46, 54);
    ctx.fillStyle = '#ffefcf';
    ctx.fillRect(-16, -82, 32, 18);
    ctx.fillStyle = '#1b1f44';
    ctx.fillRect(-11, -76, 5, 4);
    ctx.fillRect(7, -76, 5, 4);
    if (this.specialTimer > 0) {
      ctx.strokeStyle = '#fff3a6';
      ctx.lineWidth = 4;
      ctx.strokeRect(-30, -88, 60, 80);
    }
    ctx.restore();
  }
}
