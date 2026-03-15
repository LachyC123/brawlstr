export class RewardsScene {
  constructor(game) { this.game = game; }
  enter() {
    this.game.ui.renderRewards(this.game.save.lastReward, this.game.save.currencies.packs);
  }
  update() {}
  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.12);
  }
}
