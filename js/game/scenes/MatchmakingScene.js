export class MatchmakingScene {
  constructor(game) {
    this.game = game;
    this.elapsed = 0;
    this.stage = 0;
    this.context = null;
  }

  enter(context) {
    this.context = context;
    this.elapsed = 0;
    this.stage = 0;
    this.game.ui.renderMatchmaking({ modeLabel: context.modeLabel, arenaLabel: context.arenaLabel, status: 'Searching for opponent' });
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed > 0.9 && this.stage === 0) {
      this.stage = 1;
      this.game.audio.play('menuConfirm');
      this.game.ui.renderMatchmaking({ modeLabel: this.context.modeLabel, arenaLabel: this.context.arenaLabel, status: `Opponent Found: ${this.context.opponent.name}` });
    }
    if (this.elapsed > 1.8) this.game.changeScene('versus', this.context);
  }

  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.45);
  }
}
