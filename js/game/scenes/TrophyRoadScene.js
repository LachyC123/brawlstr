export class TrophyRoadScene {
  constructor(game) { this.game = game; }
  enter() {
    this.game.ui.renderRoad(this.game.progression.roadState(), this.game.save.profile.trophies);
  }
  update() {}
  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.14);
  }
}
