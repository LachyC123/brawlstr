export class Net {
  constructor(x, floorY) {
    this.x = x;
    this.floorY = floorY;
    this.width = 16;
    this.height = 190;
  }

  draw(ctx) {
    ctx.fillStyle = '#91bfff';
    ctx.fillRect(this.x - this.width / 2, this.floorY - this.height, this.width, this.height);
    ctx.fillStyle = '#d8ecff';
    for (let y = this.floorY - this.height + 10; y < this.floorY; y += 14) {
      ctx.fillRect(this.x - 22, y, 44, 3);
    }
    ctx.fillStyle = '#6ea0e0';
    for (let x = -22; x <= 18; x += 10) {
      ctx.fillRect(this.x + x, this.floorY - this.height + 8, 3, this.height - 10);
    }
  }
}
