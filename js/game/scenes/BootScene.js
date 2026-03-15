export class BootScene {
  constructor(game) { this.game = game; this.elapsed = 0; }
  enter() { this.game.ui.clear(); }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed > 0.45) this.game.changeScene('menu');
  }
  render(ctx) {
    ctx.fillStyle = '#182c59';
    ctx.fillRect(0, 0, this.game.width, this.game.height);
    ctx.fillStyle = '#fff0b8';
    ctx.font = '32px "Press Start 2P"';
    ctx.fillText('SKYSPIKE', 120, 600);
    ctx.fillStyle = '#9ec4ff';
    ctx.fillText('LEGENDS', 170, 670);
  }
}
