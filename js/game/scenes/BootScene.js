export class BootScene {
  constructor(game) {
    this.game = game;
    this.elapsed = 0;
  }

  enter() {
    this.game.ui.clear();
    this.elapsed = 0;
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed > 0.7) this.game.changeScene('menu');
  }

  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.18);
    const pulse = Math.sin(performance.now() * 0.006) * 0.5 + 0.5;
    ctx.fillStyle = 'rgba(6,12,29,0.5)';
    ctx.fillRect(120, 520, 480, 230);

    ctx.fillStyle = '#fff0b8';
    ctx.font = '32px "Press Start 2P"';
    ctx.fillText('SKYSPIKE', 132, 605);
    ctx.fillStyle = '#8ec3ff';
    ctx.fillText('LEGENDS', 182, 676);

    ctx.fillStyle = `rgba(255,224,140,${0.35 + pulse * 0.3})`;
    ctx.fillRect(150, 708, 420, 6);
  }
}
