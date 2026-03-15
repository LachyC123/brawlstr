export class VersusScene {
  constructor(game) {
    this.game = game;
    this.context = null;
    this.elapsed = 0;
  }

  enter(context) {
    this.context = context;
    this.elapsed = 0;
    this.game.audio.play('serve');
    this.game.ui.renderVersusScreen(context);
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed > 1.7) this.game.launchMatchFromFlow(this.context);
  }

  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.7);
  }
}
