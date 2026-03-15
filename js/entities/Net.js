export class Net {
  constructor(x, floorY) {
    this.x = x;
    this.floorY = floorY;
    this.width = 16;
    this.height = 190;
  }

  draw(ctx) {
    ctx.fillStyle = '#4f74ad';
    ctx.fillRect(this.x - this.width / 2 - 3, this.floorY - this.height, this.width + 6, this.height + 10);

    const poleGrad = ctx.createLinearGradient(this.x - this.width / 2, this.floorY - this.height, this.x + this.width / 2, this.floorY);
    poleGrad.addColorStop(0, '#d9eeff');
    poleGrad.addColorStop(1, '#8bb6e4');
    ctx.fillStyle = poleGrad;
    ctx.fillRect(this.x - this.width / 2, this.floorY - this.height, this.width, this.height);

    ctx.fillStyle = '#f8fdff';
    ctx.fillRect(this.x - 34, this.floorY - this.height - 8, 68, 8);

    ctx.fillStyle = '#d8ecff';
    for (let y = this.floorY - this.height + 10; y < this.floorY; y += 12) ctx.fillRect(this.x - 30, y, 60, 2);

    ctx.fillStyle = '#79abeb';
    for (let x = -30; x <= 28; x += 8) ctx.fillRect(this.x + x, this.floorY - this.height + 8, 2, this.height - 8);

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(this.x - 28, this.floorY - this.height + 12, 16, this.height - 24);
    ctx.fillRect(this.x + 12, this.floorY - this.height + 20, 10, this.height - 40);
  }
}
