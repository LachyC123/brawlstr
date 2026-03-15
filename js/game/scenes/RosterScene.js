export class RosterScene {
  constructor(game) { this.game = game; }
  enter() {
    this.game.ui.renderRoster(this.game.characterSystem.list(), this.game.save.profile.selectedCharacter);
  }
  update() {}
  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.08);
  }
}
