export class ResultsScene {
  constructor(game) {
    this.game = game;
  }

  enter(payload) {
    this.payload = payload;
    this.game.ui.renderResultsScreen(payload);
  }

  update() {}

  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.35);
  }
}
