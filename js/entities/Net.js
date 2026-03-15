export class Net {
  constructor(x, floorY) {
    this.x = x;
    this.floorY = floorY;
    this.width = 16;
    this.height = 190;
  }

  draw(ctx) {
    ctx.fillStyle = '#678fc8';
    ctx.fillRect(this.x - this.width / 2 - 2, this.floorY - this.height, this.width + 4, this.height + 8);

    ctx.fillStyle = '#b9ddff';
    ctx.fillRect(this.x - this.width / 2, this.floorY - this.height, this.width, this.height);

    ctx.fillStyle = '#f4fbff';
    ctx.fillRect(this.x - 30, this.floorY - this.height - 6, 60, 6);

    ctx.fillStyle = '#d8ecff';
    for (let y = this.floorY - this.height + 10; y < this.floorY; y += 13) ctx.fillRect(this.x - 26, y, 52, 2);

    ctx.fillStyle = '#79abeb';
    for (let x = -26; x <= 22; x += 8) ctx.fillRect(this.x + x, this.floorY - this.height + 8, 2, this.height - 8);

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(this.x - 24, this.floorY - this.height + 14, 12, this.height - 26);
  }
}
