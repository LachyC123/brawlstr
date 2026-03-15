export class Net {
  constructor(x, floorY) {
    this.x = x;
    this.floorY = floorY;
    this.width = 16;
    this.height = 190;
  }

  draw(ctx) {
    ctx.fillStyle = '#a6d0ff';
    ctx.fillRect(this.x - this.width / 2, this.floorY - this.height, this.width, this.height);
    ctx.fillStyle = '#d9ecff';
    for (let y = this.floorY - this.height + 10; y < this.floorY; y += 14) {
      ctx.fillRect(this.x - 22, y, 44, 3);
    }
  }
}
